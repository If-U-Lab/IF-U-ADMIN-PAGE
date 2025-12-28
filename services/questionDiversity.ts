/**
 * 질문 다양성 및 창의성 관리 시스템
 * Mock 데이터 기반 - 실제 DB 연동 전 사용
 */

import { GoogleGenAI, Type } from "@google/genai";
import type {
  QuestionDNA,
  AIGeneratedQuestion,
  DiversityCheckResult,
  EngagementPattern
} from "../types";

// ============================================
// Mock 데이터 - 실제 DB 연동 전 사용
// ============================================

/**
 * 최근 생성된 질문들의 DNA (Mock)
 * 실제 운영 시 DB에서 가져옴
 */
let recentQuestionDNAs: QuestionDNA[] = [];

/**
 * Mock 참여도 패턴
 * 실제 운영 시 BigQuery에서 분석
 */
const MOCK_ENGAGEMENT_PATTERN: EngagementPattern = {
  high_performing_features: [
    "제목 길이 15-18자",
    "투표 분포 48:52 ~ 52:48 (극도로 균형)",
    "주제 조합: money + time 효과적",
    "구조: sacrifice_dilemma가 참여도 높음",
    "감정: anxiety, envy 효과적",
    "'당신이라면?' 프레이밍 사용",
    "구체적 숫자 포함 (예: '10년', '1억원')"
  ],
  low_performing_features: [
    "제목이 너무 추상적 (예: '선택의 기로')",
    "투표 분포 70:30 이상 편중",
    "설명이 100자 미만으로 너무 짧음",
    "subject가 'society'인 경우 참여도 낮음",
    "선택지가 명확하지 않음"
  ],
  optimal_ranges: {
    title_length: { min: 12, max: 20 },
    description_length: { min: 80, max: 180 },
    vote_distribution: { ideal_gap: 8 }
  },
  recommendations: [
    "극단적 시나리오 활용",
    "개인적 경험과 연결",
    "손실 회피 프레임 사용",
    "사회적 비교 자극"
  ]
};

// ============================================
// DNA 추출 및 시그니처 생성
// ============================================

/**
 * 질문에서 DNA 추출 (Gemini 활용)
 */
export async function extractQuestionDNA(question: AIGeneratedQuestion): Promise<QuestionDNA> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error('API Key is missing');
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
다음 질문을 분석하여 DNA를 추출하세요:

질문: ${question.title}
설명: ${question.description}
선택지 A: ${question.optionA}
선택지 B: ${question.optionB}

[분석 기준]
1. primary_theme: 주요 주제 (money, time, relationship, career, health, freedom 등)
2. secondary_theme: 부차적 주제 (있다면)
3. structure_type: 구조 (sacrifice_dilemma, extreme_choice, time_frame, hidden_cost 등)
4. emotion_trigger: 감정 트리거 (anxiety, envy, pride, guilt, hope 등)
5. framing: 프레임 (individual_vs_social, present_vs_future, material_vs_spiritual 등)
6. difficulty: 선택의 어려움 (easy, medium, hard)
7. subject: 주체 (self, family, friend, society)

[출력 예시]
{
  "primary_theme": "money",
  "secondary_theme": "time",
  "structure_type": "sacrifice_dilemma",
  "emotion_trigger": "anxiety",
  "framing": "present_vs_future",
  "difficulty": "hard",
  "subject": "self"
}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primary_theme: { type: Type.STRING },
            secondary_theme: { type: Type.STRING },
            structure_type: { type: Type.STRING },
            emotion_trigger: { type: Type.STRING },
            framing: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            subject: { type: Type.STRING }
          },
          required: ["primary_theme", "structure_type", "emotion_trigger", "framing", "difficulty", "subject"]
        }
      }
    });

    const dna = JSON.parse(response.text);
    dna.signature = generateDNASignature(dna);
    return dna;
  } catch (error) {
    console.error('[DNA Extraction Error]', error);
    throw error;
  }
}

/**
 * DNA 시그니처 생성 (간단한 해시)
 * 브라우저 호환성을 위해 Web Crypto API 대신 간단한 해시 사용
 */
function generateDNASignature(dna: Partial<QuestionDNA>): string {
  const key = `${dna.primary_theme}_${dna.structure_type}_${dna.emotion_trigger}_${dna.framing}`;

  // 간단한 문자열 해시 함수
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

// ============================================
// 다양성 검증
// ============================================

/**
 * DNA 거리 계산 (0~5)
 */
function calculateDNADistance(dna1: QuestionDNA, dna2: QuestionDNA): number {
  let distance = 0;
  if (dna1.primary_theme !== dna2.primary_theme) distance++;
  if (dna1.secondary_theme !== dna2.secondary_theme) distance++;
  if (dna1.structure_type !== dna2.structure_type) distance++;
  if (dna1.emotion_trigger !== dna2.emotion_trigger) distance++;
  if (dna1.framing !== dna2.framing) distance++;
  return distance;
}

/**
 * 다양성 검증
 */
export async function checkDiversity(
  newQuestion: AIGeneratedQuestion,
  constraints = {
    min_signature_distance: 3,
    structure_cooldown_count: 5,
    emotion_rotation_size: 7
  }
): Promise<DiversityCheckResult> {

  // DNA가 없으면 먼저 추출
  if (!newQuestion.dna) {
    newQuestion.dna = await extractQuestionDNA(newQuestion);
  }

  const newDNA = newQuestion.dna;

  // 1. 시그니처 중복 체크
  const identicalSignature = recentQuestionDNAs.find(
    dna => dna.signature === newDNA.signature
  );
  if (identicalSignature) {
    return {
      passed: false,
      reason: '완전히 동일한 패턴의 질문이 최근에 있습니다',
      similarity_score: 1.0
    };
  }

  // 2. 구조 패턴 로테이션 체크
  const last5Structures = recentQuestionDNAs
    .slice(0, constraints.structure_cooldown_count)
    .map(dna => dna.structure_type);

  if (last5Structures.includes(newDNA.structure_type)) {
    return {
      passed: false,
      reason: `구조 "${newDNA.structure_type}"가 최근 ${constraints.structure_cooldown_count}개 질문 내 재사용`,
      similarity_score: 0.8
    };
  }

  // 3. 감정 다양성 체크
  const last7Emotions = recentQuestionDNAs
    .slice(0, constraints.emotion_rotation_size)
    .map(dna => dna.emotion_trigger);

  const emotionCount = last7Emotions.filter(e => e === newDNA.emotion_trigger).length;
  if (emotionCount >= 2) {
    return {
      passed: false,
      reason: `감정 "${newDNA.emotion_trigger}"가 최근 7개 중 ${emotionCount}번 사용`,
      similarity_score: 0.7
    };
  }

  // 4. 종합 거리 계산
  const distances = recentQuestionDNAs
    .slice(0, 10)
    .map(dna => calculateDNADistance(newDNA, dna));

  const minDistance = distances.length > 0 ? Math.min(...distances) : 5;

  if (minDistance < constraints.min_signature_distance) {
    return {
      passed: false,
      reason: `최근 질문과의 유사도가 너무 높습니다 (거리: ${minDistance})`,
      distance: minDistance,
      similarity_score: 1 - (minDistance / 5)
    };
  }

  return {
    passed: true,
    distance: minDistance,
    similarity_score: 1 - (minDistance / 5)
  };
}

// ============================================
// DNA 히스토리 관리
// ============================================

/**
 * 새 질문 DNA를 히스토리에 추가
 */
export function addToQuestionHistory(dna: QuestionDNA) {
  recentQuestionDNAs.unshift(dna);

  // 최대 30개만 유지
  if (recentQuestionDNAs.length > 30) {
    recentQuestionDNAs = recentQuestionDNAs.slice(0, 30);
  }

  console.log(`[DNA History] 현재 ${recentQuestionDNAs.length}개 질문 DNA 저장됨`);
}

/**
 * DNA 히스토리 조회
 */
export function getQuestionDNAHistory(): QuestionDNA[] {
  return recentQuestionDNAs;
}

/**
 * DNA 히스토리 초기화 (테스트용)
 */
export function clearQuestionDNAHistory() {
  recentQuestionDNAs = [];
  console.log('[DNA History] 히스토리 초기화됨');
}

// ============================================
// 패턴 분석 (Mock)
// ============================================

/**
 * 참여도 패턴 조회
 * 실제 운영 시 BigQuery 분석 결과 반환
 */
export function getEngagementPattern(): EngagementPattern {
  return MOCK_ENGAGEMENT_PATTERN;
}

/**
 * 통계 분석 (사용 빈도)
 */
export function analyzeDNAFrequency(field: keyof QuestionDNA): Record<string, number> {
  const stats: Record<string, number> = {};

  recentQuestionDNAs.forEach(dna => {
    const value = dna[field] as string;
    if (value) {
      stats[value] = (stats[value] || 0) + 1;
    }
  });

  return stats;
}

/**
 * 가장 적게 사용된 요소 추출
 */
export function getUnderusedElements() {
  const themeStats = analyzeDNAFrequency('primary_theme');
  const structureStats = analyzeDNAFrequency('structure_type');
  const emotionStats = analyzeDNAFrequency('emotion_trigger');

  const sortByFrequency = (stats: Record<string, number>) =>
    Object.entries(stats)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 3)
      .map(([key]) => key);

  return {
    themes: sortByFrequency(themeStats),
    structures: sortByFrequency(structureStats),
    emotions: sortByFrequency(emotionStats)
  };
}

// ============================================
// 금지 조합 생성
// ============================================

/**
 * 최근 사용된 조합을 금지 리스트로 생성
 */
export function getForbiddenCombinations(): Array<{
  theme: string;
  structure: string;
  emotion: string;
}> {
  return recentQuestionDNAs.slice(0, 15).map(dna => ({
    theme: `${dna.primary_theme}${dna.secondary_theme ? ' + ' + dna.secondary_theme : ''}`,
    structure: dna.structure_type,
    emotion: dna.emotion_trigger
  }));
}

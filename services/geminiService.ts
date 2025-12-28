
import { GoogleGenAI, Type } from "@google/genai";
import { AIGeneratedQuestion } from "../types";
import {
  extractQuestionDNA,
  checkDiversity,
  addToQuestionHistory,
  getForbiddenCombinations,
  getUnderusedElements,
  getEngagementPattern
} from "./questionDiversity";

export const generateDopamineQuestion = async (keyword: string): Promise<AIGeneratedQuestion | null> => {
  const apiKey = process.env.API_KEY;
  console.log('[DEBUG] API Key exists:', !!apiKey);
  console.log('[DEBUG] API Key length:', apiKey?.length);

  if (!apiKey) {
    console.error('[ERROR] API Key is missing! Check .env.local file and restart dev server.');
    alert('API 키가 설정되지 않았습니다. .env.local 파일을 확인하고 개발 서버를 재시작하세요.');
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    console.log('[DEBUG] Generating question for keyword:', keyword);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: `입력된 [키워드]를 바탕으로 한국 유저들이 열광할만한 논쟁적인 투표 질문을 1개 생성하라.
모든 텍스트는 한국어로 작성하라.
키워드: ${keyword}`,
      config: {
        systemInstruction: "당신은 논쟁적인 커뮤니티 투표 플랫폼의 전문 에디터입니다. 유저들이 치열하게 토론할 수 있는(도파민이 높은) 양자택일형 질문을 만듭니다. 결과는 반드시 JSON 형식으로만 출력하세요.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: '질문 제목 (한국어)' },
            description: { type: Type.STRING, description: '상황 설명 (한국어)' },
            optionA: { type: Type.STRING, description: '선택지 A (한국어)' },
            optionB: { type: Type.STRING, description: '선택지 B (한국어)' },
            category: { type: Type.STRING, description: '사회/연애/기술/가치관 중 하나' },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            dopaminePreview: { type: Type.STRING, description: '바이럴 포인트 설명 (한국어)' }
          },
          required: ["title", "description", "optionA", "optionB", "category", "tags", "dopaminePreview"]
        }
      },
    });

    const jsonStr = response.text?.trim();
    console.log('[DEBUG] Response received:', !!jsonStr);
    return jsonStr ? JSON.parse(jsonStr) : null;
  } catch (error) {
    console.error("[ERROR] AI Generation Failed:", error);
    if (error instanceof Error) {
      alert(`질문 생성 실패: ${error.message}`);
    }
    return null;
  }
};

/**
 * 고도화된 질문 생성 함수 (다양성 검증 포함)
 * @param keyword 키워드 (선택)
 * @param maxRetries 재생성 최대 횟수
 */
export const generateDiverseQuestion = async (
  keyword?: string,
  maxRetries = 3
): Promise<AIGeneratedQuestion | null> => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    console.log(`[Attempt ${attempt + 1}/${maxRetries}] 질문 생성 중...`);

    // 1. 참여도 패턴 및 금지 조합 가져오기
    const patterns = getEngagementPattern();
    const forbiddenCombos = getForbiddenCombinations();
    const underused = getUnderusedElements();

    // 2. 창의성 강제 프롬프트
    const creativityPrompt = `
당신은 극도로 창의적인 질문 생성 전문가입니다.

[엄격한 제약사항 - 절대 사용 금지]
최근 사용된 조합들 (중복 절대 불가):
${forbiddenCombos.map((combo, i) => `
${i + 1}. 주제: ${combo.theme}, 구조: ${combo.structure}, 감정: ${combo.emotion}
`).join('')}

[적극 권장 요소 - 최근 적게 사용됨]
- 주제: ${underused.themes.join(', ')}
- 구조: ${underused.structures.join(', ')}
- 감정: ${underused.emotions.join(', ')}

[데이터 기반 최적화 가이드]
✅ 높은 참여도 특징:
${patterns.high_performing_features.map(f => `- ${f}`).join('\n')}

❌ 피해야 할 특징:
${patterns.low_performing_features.map(f => `- ${f}`).join('\n')}

📊 최적 범위:
- 제목: ${patterns.optimal_ranges.title_length.min}-${patterns.optimal_ranges.title_length.max}자
- 설명: ${patterns.optimal_ranges.description_length.min}-${patterns.optimal_ranges.description_length.max}자
- 투표 분포 격차: ${patterns.optimal_ranges.vote_distribution.ideal_gap}% 이내

💡 추천사항:
${patterns.recommendations.map(r => `- ${r}`).join('\n')}

[창의성 가이드라인]
1. **예상 밖 조합** - 평소 함께 다루지 않는 주제 엮기
2. **역발상** - 일반적 통념 뒤집기
3. **구체적 시나리오** - 생생한 상황 제시
4. **3단 논리** - A 선택 → B 잃음 → C 생김
5. **문화적 뉘앙스** - 한국인 특유의 맥락

${keyword ? `[키워드 활용]: "${keyword}"를 자연스럽게 녹여내되, 뻔하지 않게` : ''}

[필수] 도파민 트리거 점수도 함께 반환하세요.
`;

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error('[ERROR] API Key is missing!');
      return null;
    }

    const ai = new GoogleGenAI({ apiKey });

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: creativityPrompt,
        config: {
          systemInstruction: "당신은 데이터 기반으로 최적화된 논쟁적 질문 전문가입니다. JSON 형식으로만 출력하세요.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: '질문 제목 (한국어, 12-20자)' },
              description: { type: Type.STRING, description: '상황 설명 (80-180자)' },
              optionA: { type: Type.STRING },
              optionB: { type: Type.STRING },
              category: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              dopaminePreview: { type: Type.STRING },
              triggers: {
                type: Type.OBJECT,
                properties: {
                  controversy: { type: Type.NUMBER },
                  relatability: { type: Type.NUMBER },
                  surprise: { type: Type.NUMBER },
                  personal_stake: { type: Type.NUMBER },
                  social_comparison: { type: Type.NUMBER },
                  moral_dilemma: { type: Type.NUMBER },
                  timeliness: { type: Type.NUMBER }
                }
              }
            },
            required: ["title", "description", "optionA", "optionB", "category", "tags", "dopaminePreview"]
          }
        }
      });

      const question: AIGeneratedQuestion = JSON.parse(response.text);

      // 3. DNA 추출
      console.log('[DNA] 질문 DNA 추출 중...');
      question.dna = await extractQuestionDNA(question);

      // 4. 다양성 검증
      console.log('[Diversity] 다양성 검증 중...');
      const diversityCheck = await checkDiversity(question);

      if (!diversityCheck.passed) {
        console.log(`[재생성 필요] ${diversityCheck.reason}`);
        continue;  // 재시도
      }

      // 5. 성공 - DNA 히스토리에 추가
      addToQuestionHistory(question.dna);
      console.log('[SUCCESS] 다양성 검증 통과!');

      return question;

    } catch (error) {
      console.error(`[ERROR] Attempt ${attempt + 1} failed:`, error);
    }
  }

  console.error('[FAILED] 최대 재시도 횟수 초과');
  return null;
};

/**
 * Automates trend research using Google Search grounding and generates 7 questions for a week in Korean.
 */
export const researchAndBatchGenerate = async (): Promise<AIGeneratedQuestion[]> => {
  const apiKey = process.env.API_KEY;
  console.log('[DEBUG] Batch - API Key exists:', !!apiKey);

  if (!apiKey) {
    console.error('[ERROR] API Key is missing! Check .env.local file and restart dev server.');
    alert('API 키가 설정되지 않았습니다. .env.local 파일을 확인하고 개발 서버를 재시작하세요.');
    return [];
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    console.log('[DEBUG] Starting batch research and generation (7 questions)...');

    const prompt = `당신은 한국 온라인 커뮤니티(디시인사이드, 에펨코리아, 더쿠, 네이트판, 인스타그램, 유튜브 등)의 최신 트렌드와 논쟁거리를 잘 알고 있습니다.

다음 주제를 중심으로 한국 유저들이 열광할만한 극도로 논쟁적인 양자택일 질문 7개를 생성하세요:
- 최근 사회 이슈 (정치, 경제, 세대 갈등)
- 인간관계(친구, 지인)
- 가족관계
- 연애
- 직장
- 학교(대학교 이상)
- 가치관(도덕, 워라밸)
- 시사/사회(환경, 패션, 기타 트렌드)
- 돈(경제, 주식, 소비)
- 여가(취미, 게임, 여행)
- 기술

각 질문은 유저들이 댓글에서 치열하게 논쟁할 수 있는 주제여야 하며, 반드시 7개의 질문을 생성해야 합니다.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
      config: {
        systemInstruction: "당신은 한국 온라인 커뮤니티 문화에 능통한 콘텐츠 전략가입니다. 7개의 질문 객체가 담긴 JSON 배열만 반환하세요. 다른 텍스트는 절대 포함하지 마세요.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              optionA: { type: Type.STRING },
              optionB: { type: Type.STRING },
              category: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              dopaminePreview: { type: Type.STRING }
            },
            required: ["title", "description", "optionA", "optionB", "category", "tags", "dopaminePreview"]
          }
        }
      },
    });

    const jsonStr = response.text?.trim();
    console.log('[DEBUG] Batch response received:', !!jsonStr);
    if (!jsonStr) return [];

    const results = JSON.parse(jsonStr);
    console.log('[DEBUG] Parsed results count:', Array.isArray(results) ? results.length : 1);
    return Array.isArray(results) ? results : [results];
  } catch (error) {
    console.error("[ERROR] Batch Research Failed:", error);
    if (error instanceof Error) {
      alert(`배치 생성 실패: ${error.message}`);
    }
    return [];
  }
};

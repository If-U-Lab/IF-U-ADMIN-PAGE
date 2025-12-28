# 데이터 분석 환경 설정 가이드

## Phase 2: 실제 데이터 파이프라인 구축

> **현재 상태**: Phase 1 완료 (Mock 데이터 기반 질문 생성 고도화)
> **다음 단계**: 실제 운영을 위한 데이터 수집 및 분석 인프라 구축

---

## 📋 전체 아키텍처

```
[사용자] → [프론트엔드] → [GA4/GTM] → [BigQuery]
                ↓
           [백엔드 API]
                ↓
          [PostgreSQL]
                ↓
          [BigQuery] (ETL)
                ↓
        [Gemini 분석] + [Looker Studio]
```

---

## 🎯 1단계: Google Analytics 4 (GA4) 설정

### 1.1 GA4 속성 생성 (10분)

1. **Google Analytics 접속**
   - https://analytics.google.com
   - 계정 만들기 → 속성 만들기

2. **속성 설정**
   ```
   속성 이름: IF-U Admin Dashboard
   보고 시간대: (GMT+09:00) Seoul
   통화: KRW - 대한민국 원
   ```

3. **데이터 스트림 생성**
   - 플랫폼: 웹
   - 웹사이트 URL: 실제 배포 URL
   - 스트림 이름: IF-U Web

4. **측정 ID 복사**
   ```
   G-XXXXXXXXXX
   ```

### 1.2 gtag.js 설치 (5분)

**index.html에 추가:**

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### 1.3 BigQuery 연동 활성화 (5분)

1. GA4 관리 → BigQuery 연결
2. 프로젝트 선택: GCP 프로젝트
3. 데이터 위치: asia-northeast3 (서울)
4. 빈도: 일일 (Daily)
5. **중요**: 스트리밍도 활성화 (실시간 분석용)

---

## 🏷️ 2단계: Google Tag Manager (GTM) 설정

### 2.1 GTM 컨테이너 생성 (10분)

1. **GTM 접속**: https://tagmanager.google.com
2. 계정 만들기 → 컨테이너 만들기
   ```
   컨테이너 이름: IF-U Admin
   대상 플랫폼: 웹
   ```

3. **GTM 코드 설치**
   - Head 태그 바로 아래에 추가
   - Body 태그 바로 아래에 추가

### 2.2 커스텀 이벤트 태그 설정

**태그 1: 투표 이벤트**
```
태그 유형: Google 애널리틱스: GA4 이벤트
측정 ID: G-XXXXXXXXXX
이벤트 이름: vote

이벤트 매개변수:
- question_id: {{DLV - questionId}}
- option: {{DLV - option}}
- time_to_vote_sec: {{DLV - timeToVote}}
- question_category: {{DLV - category}}
- dna_theme: {{DLV - dnaTheme}}

트리거: 커스텀 이벤트 - vote_event
```

**태그 2: 댓글 이벤트**
```
이벤트 이름: comment
매개변수:
- question_id
- comment_length
- is_reply
```

**태그 3: 결과 확인 이벤트**
```
이벤트 이름: result_view
매개변수:
- question_id
- has_voted
```

### 2.3 데이터 레이어 변수 생성

```javascript
// utils/analytics.ts 업데이트
export const trackVote = (questionId: number, option: 'A' | 'B', timeToVote: number, questionData: Question) => {
  // GTM 데이터 레이어에 푸시
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'vote_event',
    questionId: questionId,
    option: option,
    timeToVote: timeToVote,
    category: questionData.category,
    dnaTheme: questionData.dna?.primary_theme,
    dnaStructure: questionData.dna?.structure_type,
    dnaEmotion: questionData.dna?.emotion_trigger
  });
};
```

---

## 📊 3단계: BigQuery 설정

### 3.1 GCP 프로젝트 생성 (10분)

1. **Google Cloud Console**: https://console.cloud.google.com
2. 새 프로젝트 만들기
   ```
   프로젝트 이름: ifu-analytics
   프로젝트 ID: ifu-analytics-XXXXX
   ```

3. **BigQuery API 활성화**
   - API 및 서비스 → 라이브러리
   - "BigQuery API" 검색 → 사용 설정

### 3.2 서비스 계정 생성 (5분)

1. IAM 및 관리자 → 서비스 계정
2. 서비스 계정 만들기
   ```
   이름: ifu-bigquery-service
   역할: BigQuery 관리자, BigQuery 데이터 편집자
   ```

3. **키 생성**
   - JSON 형식으로 다운로드
   - `service-account-key.json`으로 저장
   - ⚠️ `.gitignore`에 추가!

### 3.3 데이터세트 생성 (5분)

```sql
-- BigQuery 콘솔에서 실행
CREATE SCHEMA `ifu-analytics-XXXXX.ifu_admin`
OPTIONS(
  location="asia-northeast3",
  description="IF-U 관리자 대시보드 데이터"
);
```

### 3.4 테이블 생성

```sql
-- 1. 질문 메타데이터
CREATE TABLE `ifu-analytics-XXXXX.ifu_admin.question_metadata` (
  question_id INT64,
  title STRING,
  description STRING,
  choice_1 STRING,
  choice_2 STRING,
  category STRING,

  -- DNA 정보
  dna_primary_theme STRING,
  dna_secondary_theme STRING,
  dna_structure_type STRING,
  dna_emotion_trigger STRING,
  dna_framing STRING,
  dna_signature STRING,

  -- 시간 정보
  created_at TIMESTAMP,
  publish_at TIMESTAMP,
  close_at TIMESTAMP,

  status STRING,
  is_deleted BOOL
);

-- 2. 일별 참여도 메트릭
CREATE TABLE `ifu-analytics-XXXXX.ifu_admin.question_daily_metrics` (
  question_id INT64,
  date DATE,

  vote_count INT64,
  comment_count INT64,
  share_count INT64,
  unique_voters INT64,
  unique_commenters INT64,

  avg_time_to_vote_sec FLOAT64,
  vote_distribution_a_percent FLOAT64,
  vote_distribution_b_percent FLOAT64,
  comment_length_avg FLOAT64,

  return_rate FLOAT64,
  discussion_rate FLOAT64
);

-- 3. 고성과 질문 뷰
CREATE VIEW `ifu-analytics-XXXXX.ifu_admin.question_performance_view` AS
SELECT
  m.question_id,
  m.title,
  m.dna_primary_theme,
  m.dna_structure_type,
  m.dna_emotion_trigger,
  SUM(d.vote_count) as total_votes,
  SUM(d.comment_count) as total_comments,
  AVG(d.avg_time_to_vote_sec) as avg_vote_time,
  AVG(d.vote_distribution_a_percent) as avg_distribution_a,
  SUM(d.vote_count + d.comment_count * 3) as engagement_score
FROM `ifu-analytics-XXXXX.ifu_admin.question_metadata` m
LEFT JOIN `ifu-analytics-XXXXX.ifu_admin.question_daily_metrics` d
  ON m.question_id = d.question_id
WHERE m.is_deleted = FALSE
GROUP BY 1, 2, 3, 4, 5;
```

---

## 🔄 4단계: ETL 파이프라인 구축

### 4.1 패키지 설치

```bash
npm install @google-cloud/bigquery
```

### 4.2 ETL 서비스 구현

**services/bigqueryETL.ts 생성:**

```typescript
import { BigQuery } from '@google-cloud/bigquery';

const bq = new BigQuery({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: './service-account-key.json'
});

const dataset = bq.dataset('ifu_admin');

export async function syncQuestionMetadata(questionIds?: number[]) {
  // 구현 내용은 이전 대화 참조
}

export async function syncDailyMetrics(date: string) {
  // 구현 내용은 이전 대화 참조
}
```

### 4.3 Cron 스케줄 설정

**Vercel Cron (배포 시)**
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/daily-sync",
      "schedule": "0 1 * * *"
    }
  ]
}
```

**Local Development**
```typescript
import cron from 'node-cron';

cron.schedule('0 1 * * *', async () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  await syncDailyMetrics(yesterday.toISOString().split('T')[0]);
});
```

---

## 🤖 5단계: Gemini + BigQuery 통합

### 5.1 분석 함수 구현

**services/geminiAnalytics.ts 생성:**

```typescript
import { BigQuery } from '@google-cloud/bigquery';
import { GoogleGenAI } from "@google/genai";

export async function analyzeEngagementPatterns() {
  const bq = new BigQuery();

  // BigQuery에서 데이터 추출
  const [topPerformers] = await bq.query(`
    SELECT *
    FROM \`ifu-analytics-XXXXX.ifu_admin.question_performance_view\`
    ORDER BY engagement_score DESC
    LIMIT 20
  `);

  const [lowPerformers] = await bq.query(`
    SELECT *
    FROM \`ifu-analytics-XXXXX.ifu_admin.question_performance_view\`
    ORDER BY engagement_score ASC
    LIMIT 20
  `);

  // Gemini에 분석 요청
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
[데이터 분석 요청]
다음 실제 성과 데이터를 분석하여 패턴을 찾아주세요:

[높은 참여도 질문]
${topPerformers.map(q => `- ${q.title} (투표: ${q.total_votes}, 댓글: ${q.total_comments})`).join('\n')}

[낮은 참여도 질문]
${lowPerformers.map(q => `- ${q.title} (투표: ${q.total_votes}, 댓글: ${q.total_comments})`).join('\n')}

공통 패턴과 차이점을 JSON 형식으로 반환하세요.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite',
    contents: prompt,
    config: { responseMimeType: 'application/json' }
  });

  return JSON.parse(response.text);
}
```

### 5.2 질문 생성 시 실시간 활용

**services/geminiService.ts 수정:**

```typescript
import { analyzeEngagementPatterns } from './geminiAnalytics';

// Mock 패턴을 실제 분석으로 교체
export const generateDiverseQuestion = async (keyword?: string) => {
  // Mock 대신 실제 BigQuery 분석 사용
  const patterns = await analyzeEngagementPatterns();

  // 나머지 로직 동일...
};
```

---

## 📈 6단계: Looker Studio 대시보드

### 6.1 Looker Studio 접속

1. https://lookerstudio.google.com
2. 만들기 → 보고서

### 6.2 데이터 소스 연결

1. BigQuery 선택
2. 프로젝트: `ifu-analytics-XXXXX`
3. 데이터세트: `ifu_admin`
4. 테이블: `question_performance_view`

### 6.3 차트 구성

**대시보드 구성 예시:**

1. **스코어카드** (상단)
   - 총 질문 수
   - 평균 engagement_score
   - 평균 투표율
   - 평균 댓글 수

2. **시계열 차트** (중앙)
   - X축: 날짜
   - Y축: 일일 투표 수, 댓글 수

3. **테이블** (하단)
   - 고성과 질문 TOP 10
   - 컬럼: 제목, DNA, 투표, 댓글, 참여도

4. **원형 차트** (우측)
   - 카테고리별 분포
   - DNA 주제별 분포

---

## ✅ 체크리스트

### Phase 2 완료 조건

- [ ] GA4 속성 생성 및 gtag.js 설치
- [ ] GTM 컨테이너 생성 및 이벤트 태그 설정
- [ ] BigQuery 프로젝트 및 데이터세트 생성
- [ ] 서비스 계정 키 발급 및 환경 변수 설정
- [ ] 테이블 및 뷰 생성
- [ ] ETL 파이프라인 구현 및 테스트
- [ ] Gemini + BigQuery 통합 함수 구현
- [ ] Looker Studio 대시보드 구성
- [ ] 2주간 데이터 수집 완료
- [ ] Mock 패턴을 실제 분석으로 교체

---

## 🚀 다음 단계

1. **2주간 데이터 수집**
   - GA4 이벤트 발생 확인
   - BigQuery에 데이터 적재 확인

2. **분석 결과 검증**
   - Mock 패턴 vs 실제 패턴 비교
   - 예측 정확도 측정

3. **지속적 개선**
   - 주간 패턴 업데이트
   - A/B 테스팅 도입
   - BigQuery ML 모델 학습

---

## 📞 문의 및 트러블슈팅

### 자주 발생하는 문제

1. **GA4 이벤트가 BigQuery에 안 들어와요**
   - 해결: 연동 후 24시간 대기 필요

2. **서비스 계정 권한 오류**
   - 해결: IAM에서 "BigQuery 관리자" 역할 추가

3. **Gemini 분석 비용이 너무 높아요**
   - 해결: 패턴 분석을 주 1회로 제한, 캐싱 활용

---

## 📚 참고 자료

- [GA4 공식 문서](https://support.google.com/analytics/answer/9304153)
- [BigQuery 가이드](https://cloud.google.com/bigquery/docs)
- [Gemini API 문서](https://ai.google.dev/docs)
- [Looker Studio 튜토리얼](https://support.google.com/looker-studio)

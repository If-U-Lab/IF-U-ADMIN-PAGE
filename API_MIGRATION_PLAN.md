# API 연동 마이그레이션 상세 분석 보고서

> **작성일**: 2025-12-27
> **목적**: 더미 데이터 기반 어드민 대시보드를 실제 백엔드 API와 연동하기 위한 상세 계획

---

## 목차
1. [현재 프로젝트 구조 분석](#1-현재-프로젝트-구조-분석)
2. [API 명세서 분석](#2-api-명세서-분석)
3. [필요한 작업 항목](#3-필요한-작업-항목-상세)
4. [새로운 서비스 레이어 구조](#4-새로운-서비스-레이어-구조)
5. [정의되지 않은 기능 처리 방안](#5-정의되지-않은-기능-처리-방안)
6. [구현 순서](#6-구현-순서-우선순위)
7. [환경 설정](#7-환경-설정-파일)
8. [타입 변환 유틸리티](#8-타입-변환-유틸리티-필요)
9. [예상 이슈 및 해결책](#9-예상-이슈-및-해결책)
10. [최종 체크리스트](#10-최종-체크리스트)

---

## 1. 현재 프로젝트 구조 분석

### 프로젝트 구성
- **프레임워크**: React 19 + TypeScript + Vite
- **상태 관리**: useState (로컬 상태만 사용)
- **차트**: Recharts
- **AI 통합**: Google Gemini API (이미 연동됨)

### 주요 컴포넌트
1. `QuestionManager.tsx` - 질문 관리 (더미 데이터)
2. `CommentManager.tsx` - 댓글 관리 (더미 데이터)
3. `UserManager.tsx` - 사용자 관리 (더미 데이터)
4. `Dashboard.tsx` - 대시보드/통계 (더미 데이터)
5. `LogManager.tsx` - 운영 로그 (더미 데이터)
6. `AIGenerator.tsx` - AI 질문 생성 (실제 Gemini API 사용 중)

---

## 2. API 명세서 분석

### API 엔드포인트 목록 (api_guide.md 기반)

| 기능 | HTTP 메서드 | 엔드포인트 추정 | 관련 컴포넌트 |
|------|------------|----------------|--------------|
| 생성된 질문 저장 | POST | `/api/questions` | QuestionManager |
| Draft 질문 수정 | PUT/PATCH | `/api/questions/{id}` | QuestionManager |
| 질문 공개 알림 스케줄 | POST | `/api/questions/{id}/publish` | QuestionManager |
| 질문 종료 | POST | `/api/questions/{id}/close` | QuestionManager |
| 댓글 강제 삭제 | DELETE | `/api/comments/{id}` | CommentManager |
| 댓글 전체 목록 조회 | GET | `/api/comments?page=1&size=10` | CommentManager |
| 신고된 댓글 목록 조회 | GET | `/api/comments/reported?page=1&size=10` | CommentManager |
| 푸시 발송 결과 조회 | GET | `/api/questions/{id}/notifications` | LogManager |
| 투표/댓글 통계 조회 | GET | `/api/statistics/daily?date=YYYY-MM-DD` | Dashboard |
| 사용자별 통계 조회 | GET | `/api/users/engagement?page=1&size=20` | UserManager |

### API 응답 구조 패턴
```typescript
// 표준 응답 래퍼 (실제 응답 예시 기반)
{
  "timestamp": "2025-11-30T01:12:16.757742",
  "status": 200,
  "code": "SUCCESS",
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": { /* 실제 데이터 */ }
}
```

### 주요 필드명 규칙
- **API 응답**: camelCase (`commentId`, `userNickname`, `isDeleted`)
- **현재 코드**: snake_case (`comment_id`, `username`, `is_deleted`)
- **필요 작업**: API 기준으로 통일 필요

---

## 3. 필요한 작업 항목 (상세)

### 3.1 인프라 구축

#### A. API 클라이언트 서비스 생성
**파일**: `services/apiClient.ts` (신규 생성)

**구현 내용**:
```typescript
// 기본 HTTP 클라이언트 설정
- Base URL 환경변수 설정 (.env.local)
- Axios 또는 Fetch 기반 래퍼
- 인터셉터: 요청/응답 로깅, 에러 핸들링
- 토큰 관리 (인증이 필요한 경우)
- 표준 응답 래퍼 처리
```

**이유**: 모든 API 호출을 중앙에서 관리하고 일관된 에러 핸들링 필요

#### B. 타입 정의 업데이트
**파일**: `types.ts` (수정)

**추가할 타입**:
```typescript
// API 응답 타입
interface ApiResponse<T> {
  timestamp: string;
  status: number;
  code: string;
  message: string;
  data: T;
}

// 페이지네이션 응답
interface PaginatedResponse<T> {
  page: number;
  size: number;
  hasNext: boolean;
  items: T[];
}

// 질문 상태 Enum (API와 일치하도록 수정)
enum QuestionStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED'
}

// 댓글 응답 타입 (실제 API 응답 기준)
interface CommentResponse {
  commentId: number;
  questionId: number;
  parentId: number | null;
  userId: number;
  userNickname: string;
  userEmail: string;
  content: string;
  isDeleted: boolean;
  reportCount?: number;  // 신고된 댓글에만
  createdAt: string;
  replies: CommentReplyResponse[];
}
```

**이유**: API 응답 구조와 현재 타입이 불일치 (camelCase vs snake_case, 필드명 차이)

---

### 3.2 컴포넌트별 마이그레이션 계획

#### **QuestionManager.tsx**

**현재 상태**:
- `INITIAL_MOCK_QUESTIONS` 배열 사용
- 로컬 state로만 CRUD 동작
- 날짜 기반 캘린더 뷰 구현

**변경 작업**:
1. **질문 생성 API 연동**
   - `handleSaveQuestion` 함수 수정
   - POST `/api/questions` 호출
   - 요청 body: `{ date, content, choice_1, choice_2, publish_at, close_at }`
   - 성공 시 201 Created, 질문 ID 받아서 로컬 state 업데이트

2. **질문 수정 API 연동**
   - Draft 상태일 때만 수정 가능
   - PUT `/api/questions/{id}` 호출
   - 응답: `AdminQuestionDetailResponse`

3. **질문 공개/종료 API 연동**
   - 상태 변경 버튼 추가
   - PUBLISH: POST `/api/questions/{id}/publish`
   - CLOSE: POST `/api/questions/{id}/close`

4. **질문 목록 조회**
   - 컴포넌트 마운트 시 GET 호출
   - 필터링/정렬을 서버 사이드로 이동 (쿼리 파라미터)

**주의사항**:
- API 응답의 날짜 형식은 ISO 8601 (`2025-10-13T09:00:00+09:00`)
- 현재 코드는 `YYYY-MM-DD` 형식 사용 → 변환 필요
- Status enum 값이 한글(예정중, 공개중) → 영문(DRAFT, PUBLISHED)로 변경 필요

---

#### **CommentManager.tsx**

**현재 상태**:
- `INITIAL_MOCK_COMMENTS` 배열
- `toggleSoftDelete`로 삭제 처리
- 스레드(대댓글) 구조 지원

**변경 작업**:
1. **댓글 목록 조회 API 연동**
   - GET `/api/comments?page=1&size=10`
   - 무한 스크롤 또는 페이지네이션 구현
   - 응답: `{ page, size, hasNext, items: CommentResponse[] }`

2. **신고된 댓글 필터 API 연동**
   - filter='reported' 선택 시
   - GET `/api/comments/reported?page=1&size=10`
   - 신고 횟수 3회 이상 자동 필터링됨

3. **댓글 삭제 API 연동**
   - `toggleSoftDelete` → DELETE `/api/comments/{commentId}`
   - 요청 body: `{ reason: "욕설/비방" }`
   - 응답: `{ commentId, isSoftDeleted, deletedAt }`
   - 삭제 사유 입력 모달 추가 필요

4. **실시간 데이터 갱신**
   - 삭제 후 목록 재조회 또는 optimistic update

**주의사항**:
- API 응답의 필드명이 camelCase (`commentId`, `userNickname` 등)
- 현재 타입은 snake_case (`comment_id`, `username`) → 변환 필요
- `reportCount`는 신고된 댓글 API에만 포함됨

---

#### **Dashboard.tsx**

**현재 상태**:
- `chartDataSets` 하드코딩된 차트 데이터
- KPI 카드 고정 값
- 기간 선택 (1일/7일/30일)

**변경 작업**:
1. **투표/댓글 통계 API 연동**
   - GET `/api/statistics/daily?date=2025-10-10`
   - 응답 데이터 구조:
     ```json
     {
       "date": "2025-10-10",
       "dau": 734,
       "vote_count": 1450,
       "comment_count": 380,
       "participation_rate": 197.6,
       "by_topic": [...],
       "access_by_hour": [23, 41, 52, ...]
     }
     ```
   - `access_by_hour`를 차트 데이터로 변환

2. **기간별 데이터 집계**
   - 1일/7일/30일 선택 시 해당 기간 데이터 요청
   - 날짜 범위 쿼리 파라미터 필요 (문서에는 명시 안됨 → 확인 필요)

3. **KPI 카드 데이터 바인딩**
   - DAU, 투표 수, 댓글 수 실시간 데이터 표시
   - 전주 대비 증감률 계산

**정의되지 않은 기능**:
- ❌ 신규 가입 사용자 통계 API 없음
- ❌ 일간 활성 사용자 API 없음
- **대안**: 서버 개발팀에 추가 API 요청 또는 기존 API에서 계산

---

#### **UserManager.tsx**

**현재 상태**:
- `INITIAL_MOCK_USERS` 배열
- 정지/해제 토글 기능
- 필터링 (전체/신고누적/정지상태)

**변경 작업**:
1. **사용자 통계 조회 API 연동**
   - GET `/api/users/engagement?page=1&size=20`
   - 응답 구조:
     ```json
     {
       "items": [{
         "user_id": 42,
         "nickname": "왕문어",
         "votes": 87,
         "comments": 23,
         "last_active_at": "2025-10-10T15:02:00Z"
       }],
       "page": 1,
       "size": 20,
       "total": 312
     }
     ```

2. **사용자 정지 기능**
   - API 명세에 정지 API 없음
   - **대안 1**: 서버팀에 `POST /api/users/{id}/suspend` API 요청
   - **대안 2**: 정지 기능 비활성화 (읽기 전용)

**정의되지 않은 기능**:
- ❌ 사용자 정지/해제 API
- ❌ 사용자 검색 API
- ❌ 가입일, 신고 횟수 정보
- **대안**: 현재는 조회 전용으로 구현, 추후 API 추가 시 업데이트

---

#### **LogManager.tsx**

**현재 상태**:
- `MOCK_LOGS` 하드코딩
- 관리자 작업 로그 표시

**변경 작업**:
1. **푸시 발송 로그 API 연동**
   - GET `/api/questions/{questionId}/notifications`
   - 응답:
     ```json
     {
       "items": [{
         "log_id": 9876,
         "question_id": 123,
         "scheduled_at": "...",
         "sent_at": "...",
         "target_count": 1500,
         "success_count": 1420,
         "fail_count": 80
       }],
       "page": 1,
       "size": 20,
       "total": 8
     }
     ```

2. **전체 운영 로그 표시**
   - 질문 생성/수정/삭제
   - 댓글 삭제
   - 사용자 정지
   - **문제**: 통합 로그 API가 명세에 없음
   - **대안**: 프론트엔드에서 각 액션 후 로컬 로그 추가 또는 서버 API 요청

**정의되지 않은 기능**:
- ❌ 통합 관리자 액션 로그 API
- **대안**: 푸시 로그만 표시 + 로컬 액션 로그 병합

---

#### **AIGenerator.tsx**

**현재 상태**:
- ✅ 이미 실제 Gemini API 사용 중
- 생성된 질문을 로컬 state에만 저장

**변경 작업**:
1. **질문 적재 버튼 연동**
   - "적재 승인" 버튼 클릭 시
   - POST `/api/questions` 호출
   - AI 생성 질문을 DB에 저장
   - 성공 시 QuestionManager에 반영

2. **생성 결과 검증**
   - 중복 질문 체크
   - 부적절한 내용 필터링 (선택사항)

---

## 4. 새로운 서비스 레이어 구조

### 파일 생성 계획

```
services/
├── apiClient.ts          (신규) - HTTP 클라이언트 기본 설정
├── questionService.ts    (신규) - 질문 관련 API 호출
├── commentService.ts     (신규) - 댓글 관련 API 호출
├── userService.ts        (신규) - 사용자 관련 API 호출
├── statisticsService.ts  (신규) - 통계 관련 API 호출
└── geminiService.ts      (기존) - AI 생성 (이미 구현됨)
```

### 예시: questionService.ts
```typescript
import { apiClient } from './apiClient';
import { Question, QuestionStatus } from '../types';

export const questionService = {
  // 질문 생성
  createQuestion: async (data: CreateQuestionRequest) => {
    return apiClient.post<{ id: number; status: string }>('/questions', data);
  },

  // 질문 수정
  updateQuestion: async (id: number, data: UpdateQuestionRequest) => {
    return apiClient.put<QuestionDetailResponse>(`/questions/${id}`, data);
  },

  // 질문 공개
  publishQuestion: async (id: number) => {
    return apiClient.post(`/questions/${id}/publish`);
  },

  // 질문 종료
  closeQuestion: async (id: number) => {
    return apiClient.post(`/questions/${id}/close`);
  }
};
```

### 예시: apiClient.ts
```typescript
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config) => {
    // 토큰 추가 (필요시)
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => {
    // 표준 응답 래퍼 처리
    if (response.data.status === 200) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    // 에러 핸들링
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const apiClient = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    axiosInstance.get<T>(url, config),
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    axiosInstance.post<T>(url, data, config),
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    axiosInstance.put<T>(url, data, config),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    axiosInstance.delete<T>(url, config),
};
```

---

## 5. 정의되지 않은 기능 처리 방안

### ❌ API 명세에 없는 기능들

| 기능 | 현재 구현 여부 | 해결 방법 |
|------|--------------|----------|
| 질문 전체 목록 조회 | ❌ | **서버팀 요청**: `GET /api/questions?status=ACTIVE&page=1&size=20` |
| 사용자 정지/해제 | ❌ | **서버팀 요청**: `POST /api/users/{id}/suspend` |
| 통합 관리자 로그 | ❌ | **프론트 자체 구현** 또는 서버 API 추가 |
| 신규 가입자 통계 | ❌ | **서버팀 요청**: 통계 API에 필드 추가 |
| 사용자 검색 | ❌ | **서버팀 요청**: 검색 쿼리 파라미터 추가 |

### 🔧 임시 대안

1. **질문 목록 조회**:
   - 현재는 더미 데이터 유지
   - 서버 API 추가 후 마이그레이션

2. **사용자 정지 기능**:
   - UI는 유지하되 실제 동작 비활성화
   - 또는 로컬 state만 변경 (읽기 전용 모드)

3. **관리자 로그**:
   - localStorage에 액션 로그 저장
   - 푸시 로그 API와 병합하여 표시

---

## 6. 구현 순서 (우선순위)

### Phase 1: 기반 작업 (1-2일)
1. ✅ API 클라이언트 설정 (`apiClient.ts`)
2. ✅ 환경변수 설정 (`.env.local`에 API_BASE_URL 추가)
3. ✅ 타입 정의 업데이트 (`types.ts`)
4. ✅ 에러 핸들링 유틸리티

### Phase 2: 댓글 관리 (가장 명세가 명확함)
1. ✅ `commentService.ts` 생성
2. ✅ CommentManager 목록 조회 연동
3. ✅ 신고된 댓글 필터 연동
4. ✅ 댓글 삭제 연동

### Phase 3: 질문 관리 (AI 생성 연계)
1. ✅ `questionService.ts` 생성
2. ✅ AI 생성 질문 DB 저장 연동
3. ✅ 질문 수정/공개/종료 연동
4. ⚠️ 질문 목록 조회 (API 요청 필요)

### Phase 4: 통계 및 사용자
1. ✅ `statisticsService.ts` - 투표/댓글 통계
2. ✅ Dashboard 차트 데이터 바인딩
3. ✅ `userService.ts` - 사용자 통계 조회
4. ⚠️ 사용자 정지 기능 (API 요청 필요)

### Phase 5: 로그 및 알림
1. ✅ 푸시 발송 로그 조회
2. ⚠️ 통합 로그 (대안 구현)

---

## 7. 환경 설정 파일

### `.env.local` 추가 필요
```bash
# 기존
API_KEY=your_gemini_api_key

# 추가
VITE_API_BASE_URL=https://api.yourbackend.com
VITE_API_TIMEOUT=10000
```

**주의**: Vite에서는 `VITE_` 접두사 필요

---

## 8. 타입 변환 유틸리티 필요

API 응답(camelCase) ↔ 현재 타입(snake_case) 변환 함수

```typescript
// utils/typeConverter.ts
export const toCamelCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(v => toCamelCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
      result[camelKey] = toCamelCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
};

export const toSnakeCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(v => toSnakeCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      result[snakeKey] = toSnakeCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
};
```

---

## 9. 예상 이슈 및 해결책

| 이슈 | 원인 | 해결 방법 |
|------|------|----------|
| CORS 에러 | 로컬 개발 환경 | Vite proxy 설정 또는 서버 CORS 허용 |
| 날짜 형식 불일치 | ISO 8601 vs YYYY-MM-DD | date-fns 또는 dayjs 라이브러리 사용 |
| 타입 불일치 | camelCase vs snake_case | 변환 유틸리티 적용 |
| 인증 필요 시 | 토큰 관리 | apiClient에 인터셉터 추가 |
| API 응답 지연 | 네트워크 | 로딩 스피너 + Skeleton UI |

### CORS 해결 (Vite Proxy)
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});
```

---

## 10. 최종 체크리스트

### 서버팀 확인 필요 사항
- [ ] 질문 전체 목록 조회 API 존재 여부
- [ ] 사용자 정지/해제 API 존재 여부
- [ ] 통계 API의 기간 범위 쿼리 지원 여부
- [ ] 관리자 인증 방식 (JWT? Session?)
- [ ] Base URL 및 API 버전
- [ ] API 엔드포인트 전체 목록 문서

### 프론트엔드 작업
- [ ] API 클라이언트 설정
- [ ] 타입 정의 업데이트 (API 응답 기준)
- [ ] 서비스 레이어 구현
- [ ] 각 컴포넌트 API 연동
- [ ] 에러 핸들링 및 사용자 피드백
- [ ] 로딩 상태 UI
- [ ] 성능 최적화 (캐싱, 디바운싱)
- [ ] 환경변수 설정

### 테스트 항목
- [ ] 질문 생성/수정/삭제 테스트
- [ ] 댓글 조회/삭제 테스트
- [ ] 통계 데이터 로딩 테스트
- [ ] 에러 케이스 핸들링 테스트
- [ ] 로딩 상태 표시 테스트

---

## 부록: API 명세 vs 현재 타입 비교표

### 질문 관련

| API 응답 필드 | 현재 타입 필드 | 타입 | 비고 |
|--------------|---------------|------|------|
| id | id | number | 일치 |
| status | status | enum | DRAFT/PUBLISHED vs 예정중/공개중 |
| content | title + description | string | 구조 차이 |
| choice_1 | option_a | string | 필드명 차이 |
| choice_2 | option_b | string | 필드명 차이 |
| opens_at | - | string | 누락 |
| closes_at | - | string | 누락 |

### 댓글 관련

| API 응답 필드 | 현재 타입 필드 | 타입 | 비고 |
|--------------|---------------|------|------|
| commentId | id | number | 필드명 차이 |
| questionId | question_id | number | case 차이 |
| userNickname | username | string | 필드명 차이 |
| userEmail | - | string | 누락 |
| isDeleted | is_deleted | boolean | case 차이 |
| reportCount | report_count | number | case 차이 |
| createdAt | created_at | string | case 차이 |

---

## 작업 완료 후 예상 결과

1. ✅ 모든 데이터가 실시간으로 백엔드에서 조회됨
2. ✅ CRUD 작업이 실제 DB에 반영됨
3. ✅ 통계 데이터가 실시간으로 업데이트됨
4. ✅ 여러 관리자가 동시에 작업 가능
5. ✅ 에러 핸들링 및 사용자 피드백 개선
6. ⚠️ 일부 기능은 서버 API 추가 필요

---

**문서 업데이트 이력**:
- 2025-12-27: 초기 작성

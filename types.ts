// ============================================
// API 응답 공통 타입
// ============================================

/**
 * 표준 API 응답 래퍼
 * 모든 API 응답은 이 구조를 따릅니다
 */
export interface ApiResponse<T> {
  timestamp: string;
  status: number;
  code: string;
  message: string;
  data: T;
}

/**
 * 페이지네이션 응답 타입
 */
export interface PaginatedResponse<T> {
  page: number;
  size: number;
  hasNext: boolean;
  items: T[];
  total?: number;
}

// ============================================
// 질문 관련 타입 (API 가이드 기준)
// ============================================

/**
 * 질문 상태 Enum
 * API 명세와 일치: DRAFT, PUBLISHED, CLOSED
 */
export enum QuestionStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED'
}

/**
 * 질문 카테고리 Enum
 * ERD 명세 기준: 10개 카테고리
 */
export enum QuestionCategory {
  RELATIONSHIP = 'RELATIONSHIP',
  FAMILY = 'FAMILY',
  ROMANCE = 'ROMANCE',
  WORKPLACE = 'WORKPLACE',
  SCHOOL = 'SCHOOL',
  VALUES = 'VALUES',
  SOCIAL = 'SOCIAL',
  MONEY = 'MONEY',
  LEISURE = 'LEISURE',
  TECHNOLOGY = 'TECHNOLOGY'
}

/**
 * 질문 선택지 Enum
 */
export enum QuestionOption {
  AGREE = 'AGREE',
  DISAGREE = 'DISAGREE'
}

/**
 * 질문 생성 요청 DTO
 * POST /api/questions
 * API 명세 기준: snake_case 사용
 */
export interface CreateQuestionRequest {
  date: string;
  content: string;
  choice_1: string;       // API 명세 그대로
  choice_2: string;       // API 명세 그대로
  publish_at: string;     // API 명세 그대로 - ISO 8601 format
  close_at: string;       // API 명세 그대로 - ISO 8601 format
}

/**
 * 질문 생성 응답 DTO
 * API 명세 기준: snake_case 사용
 */
export interface CreateQuestionResponse {
  id: number;
  status: QuestionStatus;
  opens_at: string;       // API 명세 그대로
  closes_at: string;      // API 명세 그대로
}

/**
 * 질문 수정 요청 DTO
 * PUT /api/questions/{id}
 * API 명세 기준: snake_case 사용
 */
export interface UpdateQuestionRequest {
  date?: string;
  content?: string;
  choice_1?: string;      // API 명세 그대로
  choice_2?: string;      // API 명세 그대로
  publish_at?: string;    // API 명세 그대로
  close_at?: string;      // API 명세 그대로
}

/**
 * 질문 상세 응답 DTO
 * API 명세 기준: snake_case 사용
 */
export interface QuestionDetailResponse {
  id: number;
  status: QuestionStatus;
  content: string;
  options: QuestionOption[];
  planned_publish_at: string;  // API 명세 그대로
  created_at: string;          // API 명세 그대로
}

/**
 * 질문 공개 응답 DTO
 * API 명세 기준: snake_case 사용
 */
export interface PublishQuestionResponse {
  id: number;
  status: QuestionStatus;
  published_at: string;           // API 명세 그대로
  notification_scheduled: boolean; // API 명세 그대로
}

/**
 * 질문 종료 응답 DTO
 * API 명세 기준: snake_case 사용
 */
export interface CloseQuestionResponse {
  id: number;
  status: QuestionStatus;
  closed_at: string;      // API 명세 그대로
}

/**
 * 프론트엔드 전용 질문 타입 (UI 표시용)
 * ERD 스키마 기준으로 업데이트
 */
export interface Question {
  id: number;
  title: string;                    // VARCHAR(20)
  description: string;
  choice_1: string;
  choice_2: string;
  category: QuestionCategory;
  status: QuestionStatus;
  publish_at: string | null;        // 공개 예정 일시 (null = 미예정)
  close_at: string | null;          // 종료 예정 일시
  notification_sent_at: string | null;  // 알림 발송 일시
  isDeleted: boolean;
  createdAt: string;
  // UI 전용 필드
  tags?: string[];
  views?: number;
  dopamine_score?: number;
}

// ============================================
// 댓글 관련 타입 (API 가이드 기준)
// ============================================

/**
 * 댓글 삭제 요청 DTO
 * DELETE /api/comments/{commentId}
 */
export interface DeleteCommentRequest {
  reason: string;
}

/**
 * 댓글 삭제 응답 DTO
 */
export interface DeleteCommentResponse {
  commentId: number;
  isSoftDeleted: boolean;
  deletedAt: string;
}

/**
 * 대댓글 응답 DTO
 */
export interface CommentReplyResponse {
  commentId: number;
  userId: number;
  userNickname: string;
  content: string;
  isDeleted: boolean;
  createdAt: string;
}

/**
 * 댓글 응답 DTO
 * GET /api/comments
 */
export interface CommentResponse {
  commentId: number;
  questionId: number;
  parentId: number | null;
  userId: number;
  userNickname: string;
  userEmail: string;
  content: string;
  isDeleted: boolean;
  reportCount?: number;  // 신고된 댓글 API에만 포함
  createdAt: string;
  replies: CommentReplyResponse[];
}

/**
 * 댓글 목록 응답 타입
 */
export type CommentListResponse = PaginatedResponse<CommentResponse>;

/**
 * 프론트엔드 전용 댓글 타입 (UI 표시용)
 * 기존 코드와의 호환성을 위해 유지
 */
export interface Comment {
  id: number;
  questionId: number;
  username: string;
  content: string;
  reportCount: number;
  isDeleted: boolean;
  createdAt: string;
  parentId?: number;
}

// ============================================
// 사용자 관련 타입 (API 가이드 기준)
// ============================================

/**
 * 사용자 참여도 통계 응답 DTO
 * GET /api/users/engagement
 */
export interface UserEngagementResponse {
  user_id: number;
  nickname: string;
  votes: number;
  comments: number;
  last_active_at: string;
}

/**
 * 사용자 참여도 목록 응답 타입
 */
export type UserEngagementListResponse = PaginatedResponse<UserEngagementResponse>;

/**
 * 프론트엔드 전용 사용자 타입 (UI 표시용)
 */
export interface User {
  id: number;
  username: string;
  status: 'normal' | 'suspended';
  suspendedUntil: string | null;
  reportTotal: number;
  joinedAt: string;
  votes: number;
  comments: number;
}

// ============================================
// 통계 관련 타입 (API 가이드 기준)
// ============================================

/**
 * 주제별 통계
 */
export interface TopicStatistics {
  topic_id: number;
  votes: number;
  comments: number;
  agree: number;
  disagree: number;
}

/**
 * 일별 통계 응답 DTO
 * GET /api/statistics/daily
 */
export interface DailyStatisticsResponse {
  date: string;
  dau: number;
  vote_count: number;
  comment_count: number;
  participation_rate: number;
  by_topic: TopicStatistics[];
  access_by_hour: number[];
}

// ============================================
// 푸시 알림 로그 관련 타입 (API 가이드 기준)
// ============================================

/**
 * 푸시 알림 로그 응답 DTO
 */
export interface NotificationLogResponse {
  log_id: number;
  question_id: number;
  scheduled_at: string;
  sent_at: string;
  target_count: number;
  success_count: number;
  fail_count: number;
}

/**
 * 푸시 알림 로그 목록 응답 타입
 */
export interface NotificationLogListResponse {
  items: NotificationLogResponse[];
  page: number;
  size: number;
  total: number;
}

// ============================================
// 관리자 로그 타입 (프론트엔드 전용)
// ============================================

/**
 * 관리자 액션 로그 (로컬 관리용)
 */
export interface AdminLog {
  id: string;
  adminId: string;
  actionType: string;
  targetId: string;
  description: string;
  createdAt: string;
}

// ============================================
// AI 생성 질문 타입
// ============================================

/**
 * 질문 DNA - 질문의 유전자 정보
 * 다양성 및 중복 검증에 사용
 */
export interface QuestionDNA {
  // 1차원: 주제
  primary_theme: string;     // 예: "money", "relationship", "career"
  secondary_theme?: string;  // 예: "health", "freedom"

  // 2차원: 구조 패턴
  structure_type: string;    // 예: "sacrifice", "extreme_choice", "time_frame"

  // 3차원: 감정 트리거
  emotion_trigger: string;   // 예: "anxiety", "envy", "pride"

  // 4차원: 프레임
  framing: string;          // 예: "individual_vs_social", "present_vs_future"

  // 5차원: 난이도
  difficulty: 'easy' | 'medium' | 'hard';  // 선택의 어려움 정도

  // 6차원: 대상/주체
  subject: string;          // 예: "self", "family", "friend", "society"

  // 시그니처 해시 (조합)
  signature: string;  // MD5 hash of key dimensions
}

/**
 * 도파민 트리거 점수
 * 심리학적 참여 유도 요소
 */
export interface DopamineTriggers {
  controversy: number;      // 논쟁성 (0-100)
  relatability: number;     // 공감성
  surprise: number;         // 놀라움
  personal_stake: number;   // 개인적 이해관계
  social_comparison: number; // 사회적 비교 욕구
  moral_dilemma: number;    // 도덕적 갈등 강도
  timeliness: number;       // 시의성/트렌드 반영
}

/**
 * 참여도 메트릭 (실제 데이터 수집 후 사용)
 */
export interface EngagementMetrics {
  vote_count: number;
  comment_count: number;
  share_count: number;
  avg_time_to_vote_sec: number;
  vote_distribution_a_percent: number;
  vote_distribution_b_percent: number;
  return_rate: number;
  engagement_score: number;  // 종합 점수
}

/**
 * AI 생성 질문 타입 (Gemini API 응답)
 * camelCase로 통일 + DNA 정보 포함
 */
export interface AIGeneratedQuestion {
  title: string;
  description: string;
  optionA: string;
  optionB: string;
  category: string;
  tags: string[];
  dopaminePreview: string;

  // 고도화 정보
  dna?: QuestionDNA;
  triggers?: DopamineTriggers;
  predicted_engagement?: number;  // 예상 참여도
}

/**
 * 다양성 검증 결과
 */
export interface DiversityCheckResult {
  passed: boolean;
  reason?: string;
  similarity_score?: number;
  distance?: number;
}

/**
 * 참여도 패턴 분석 결과
 */
export interface EngagementPattern {
  high_performing_features: string[];
  low_performing_features: string[];
  optimal_ranges: {
    title_length: { min: number; max: number };
    description_length: { min: number; max: number };
    vote_distribution: { ideal_gap: number };
  };
  recommendations: string[];
}

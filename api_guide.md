# 생성된 질문 저장
[Request Parameters](https://www.notion.so/28911c0ac54d81e08b7ad8bcc937b20c?pvs=21)

## Request Body

[DTO 이름](https://www.notion.so/28911c0ac54d81f3b180d9769c097c7a?pvs=21)

### Enum 이름 (없으면 삭제)

```java
DRAFT,
PUBLISHED,
CLOSED
```

### Example

![image.png](/Users/jeongjungyeong/BOAZ/ifu-admin/api_guide_image/question01.png)

```json
{
  "date": "2025-10-13",
  "content": "환승연애 출연 이해 가능?",
  "choice_1": "가능!!! 끝난 사이에 뭐 어때",
  "choice_2": "불가능.. 꼴도보기 싫지않나",
  "publish_at": "2025-10-13T09:00:00+09:00",
  "close_at": "2025-10-13T23:59:59+09:00"
}
```

## Response Body

[DTO 이름 ](https://www.notion.so/28911c0ac54d810e9951e809188933bf?pvs=21)

### Example

`201 Created`

```json
{
  "id": 101,
  "status": "DRAFT",
  "opens_at": "2025-10-13T09:00:00+09:00",
  "closes_at": "2025-10-13T23:59:59+09:00"
}

```

# Draft 상태 질문 수정
[Request Parameters](https://www.notion.so/28911c0ac54d81c8b602f5a15e295c85?pvs=21)

## Request Body

- status 필드만 빼고 보내주세요
    
    ![image.png](/Users/jeongjungyeong/BOAZ/ifu-admin/api_guide_image/question02.png)
    

[AdminQuestionUpdateRequest](https://www.notion.so/28911c0ac54d816a9f0dd81e21399220?pvs=21)

### OPTION

```java
AGREE,
DISAGREE
```

### STATUS

```json
DRAFT, 
PUBLISHED, 
CLOSED
```

## Response Body

[AdminQuestionDetailResponse](https://www.notion.so/28911c0ac54d81ddbb0defc2395e2e17?pvs=21)

### Example

`200 OK`

```json
{
  "id": 123,
  "status": "DRAFT",
  "content": "수정된 질문 본문",
  "options": ["AGREE", "DISAGREE"],
  "planned_publish_at": "2025-10-13T23:00:00Z",
  "created_at": "2025-10-10T00:00:00Z"
}
```

# 질문 공개 알림 발송 스케줄
[Request Parameters](https://www.notion.so/28911c0ac54d81ffb176df6acf839417?pvs=21)

## Request Body

[DTO 이름](https://www.notion.so/28911c0ac54d816d9b11d836c9cebc78?pvs=21)

## Response Body

[DTO 이름 ](https://www.notion.so/28911c0ac54d8169a55ec93eed46102f?pvs=21)

### Example

`200 OK`

```json
{
  "id": 101,
  "status": "PUBLISHED",
  "published_at": "2025-10-13T09:00:00+09:00",
  "notification_scheduled": false
}
```

# 질문 종료
[Request Parameters](https://www.notion.so/28911c0ac54d8193b068c0757dee77fe?pvs=21)

## Request Body

[DTO 이름](https://www.notion.so/28911c0ac54d81369d87fb34588de140?pvs=21)

## Response Body

[DTO 이름 ](https://www.notion.so/28911c0ac54d812b9ed3d15cc054f440?pvs=21)

### Example

`200 OK`

```json
{
  "id": 101,
  "status": "CLOSED",
  "closed_at": "2025-10-13T23:59:59+09:00"
}
```

# 댓글 강제 삭제
[Request Parameters](https://www.notion.so/28911c0ac54d8110b1fef53932648041?pvs=21)

## Request Body

[제목 없음](https://www.notion.so/28911c0ac54d8119a2d4cba3e8403776?pvs=21)

### Example

```json
{ "reason": "욕설/비방" }
```

## Response Body

[제목 없음](https://www.notion.so/28911c0ac54d817d9ff8f52de9f3e39b?pvs=21)

### Example

`200 OK`

```json
{
  "timestamp": "2025-11-30T01:13:17.105925",
  "status": 200,
  "code": "SUCCESS",
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": {
    "commentId": 10,
    "isSoftDeleted": true,
    "deletedAt": "2025-11-30T01:13:17.097226"
  }
}
```

# 댓글 전체 목록 조회
[Request Parameters](https://www.notion.so/2b811c0ac54d819c94ded33428412298?pvs=21)

## Request Body

[DTO 이름](https://www.notion.so/2b811c0ac54d8104831cccf188de3324?pvs=21)

## Response Body

[CommentListResponse](https://www.notion.so/2b811c0ac54d817baa78c6e8676ac7f3?pvs=21)

[CommentResponse](https://www.notion.so/2b811c0ac54d812c8d93df586964e78a?pvs=21)

[CommentReplyResponse](https://www.notion.so/2b811c0ac54d8101a2c7db0177aad7de?pvs=21)

### Example

`200 OK`

```json
{
  "page": 1,
  "size": 10,
  "has_next": true,
  "items": [
    {
      "comment_id": 501,
      "question_id": 101,
      "user_id": 12,
      "nickname": "꼼꼼한 왜문어",
      "content": "이건 무조건 가능 출연료가 얼만데 ㅋㅋㅋ",
      "is_deleted": false,
      "created_at": "2025-10-16T12:30:12+09:00",
      "updated_at": "2025-10-16T12:30:12+09:00",
      "replies": [
        {
          "comment_id": 502,
          "user_id": 34,
          "nickname": "순박한 퀴노아",
          "content": "맞긴해...",
          "is_deleted": false,
          "created_at": "2025-10-16T12:32:05+09:00"
        }
      ]
    }
  ]
}

// 실제 응답
{
  "timestamp": "2025-11-30T01:12:16.757742",
  "status": 200,
  "code": "SUCCESS",
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": {
    "page": 1,
    "size": 10,
    "hasNext": true,
    "items": [
      {
        "commentId": 62,
        "questionId": 1,
        "parentId": null,
        "userId": 2,
        "userNickname": "나태한 아보카도",
        "userEmail": "iwbm312@gmail.com",
        "content": "string",
        "isDeleted": false,
        "createdAt": "2025-11-30T00:12:24.666798",
        "replies": []
      },
      {
        "commentId": 61,
        "questionId": 1,
        "parentId": null,
        "userId": 2,
        "userNickname": "나태한 아보카도",
        "userEmail": "iwbm312@gmail.com",
        "content": "string",
        "isDeleted": false,
        "createdAt": "2025-11-29T13:45:14.795709",
        "replies": []
      },
      {
        "commentId": 60,
        "questionId": 1,
        "parentId": null,
        "userId": 1,
        "userNickname": "냉혹한 솔개",
        "userEmail": "jinyshin.dev@gmail.com",
        "content": "테스트 대댓글",
        "isDeleted": false,
        "createdAt": "2025-11-29T13:23:19.565518",
        "replies": []
      },
      {
        "commentId": 59,
        "questionId": 1,
        "parentId": null,
        "userId": 1,
        "userNickname": "냉혹한 솔개",
        "userEmail": "jinyshin.dev@gmail.com",
        "content": "테스트 대댓글",
        "isDeleted": false,
        "createdAt": "2025-11-29T13:23:19.256531",
        "replies": []
      },
      {
        "commentId": 58,
        "questionId": 1,
        "parentId": null,
        "userId": 1,
        "userNickname": "냉혹한 솔개",
        "userEmail": "jinyshin.dev@gmail.com",
        "content": "테스트 대댓글",
        "isDeleted": false,
        "createdAt": "2025-11-29T13:23:19.087784",
        "replies": []
      },
      {
        "commentId": 57,
        "questionId": 1,
        "parentId": null,
        "userId": 1,
        "userNickname": "냉혹한 솔개",
        "userEmail": "jinyshin.dev@gmail.com",
        "content": "테스트 대댓글",
        "isDeleted": false,
        "createdAt": "2025-11-29T13:23:18.938703",
        "replies": []
      },
      {
        "commentId": 56,
        "questionId": 1,
        "parentId": null,
        "userId": 1,
        "userNickname": "냉혹한 솔개",
        "userEmail": "jinyshin.dev@gmail.com",
        "content": "테스트 대댓글",
        "isDeleted": false,
        "createdAt": "2025-11-29T13:23:18.653893",
        "replies": []
      },
      {
        "commentId": 55,
        "questionId": 1,
        "parentId": null,
        "userId": 1,
        "userNickname": "냉혹한 솔개",
        "userEmail": "jinyshin.dev@gmail.com",
        "content": "테스트 대댓글",
        "isDeleted": false,
        "createdAt": "2025-11-29T13:23:18.413717",
        "replies": []
      },
      {
        "commentId": 54,
        "questionId": 1,
        "parentId": null,
        "userId": 1,
        "userNickname": "냉혹한 솔개",
        "userEmail": "jinyshin.dev@gmail.com",
        "content": "테스트 대댓글",
        "isDeleted": false,
        "createdAt": "2025-11-29T13:23:18.203446",
        "replies": []
      },
      {
        "commentId": 53,
        "questionId": 1,
        "parentId": null,
        "userId": 1,
        "userNickname": "냉혹한 솔개",
        "userEmail": "jinyshin.dev@gmail.com",
        "content": "테스트 대댓글",
        "isDeleted": false,
        "createdAt": "2025-11-29T13:23:18.039692",
        "replies": []
      }
    ]
  }
}
```

# 신고된 댓글 목록 조회
> 처음에는 루트 댓글을 불러올 때 각 댓글의 대댓글까지 함께 내려주는 방식으로 개발하고,
추후 성능 문제 발생 시 변경 예정
> 

[Request Parameters](https://www.notion.so/2b811c0ac54d8144a6c0e28a762a5971?pvs=21)

## Request Body

[DTO 이름](https://www.notion.so/2b811c0ac54d8153838cd19fe4386fdb?pvs=21)

## Response Body

[CommentListResponse](https://www.notion.so/2b811c0ac54d81b092abf5e08667814a?pvs=21)

[CommentResponse](https://www.notion.so/2b811c0ac54d81d09994dda8efd2a783?pvs=21)

[CommentReplyResponse](https://www.notion.so/2b811c0ac54d816db44dc91f3cddd8f5?pvs=21)

### Example

`200 OK`

```json
{
  "page": 1,
  "size": 10,
  "has_next": true,
  "items": [
    {
      "comment_id": 501,
      "question_id": 101,
      "user_id": 12,
      "nickname": "꼼꼼한 왜문어",
      "content": "이건 무조건 가능 출연료가 얼만데 ㅋㅋㅋ",
      "is_deleted": false,
      "created_at": "2025-10-16T12:30:12+09:00",
      "updated_at": "2025-10-16T12:30:12+09:00",
      "replies": [
        {
          "comment_id": 502,
          "user_id": 34,
          "nickname": "순박한 퀴노아",
          "content": "맞긴해...",
          "is_deleted": false,
          "created_at": "2025-10-16T12:32:05+09:00"
        }
      ]
    }
  ]
}

// 실제 응답
{
  "timestamp": "2025-11-30T01:14:35.838511",
  "status": 200,
  "code": "SUCCESS",
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": {
    "page": 1,
    "size": 10,
    "hasNext": false,
    "items": [
      {
        "commentId": 5,
        "questionId": 1,
        "parentId": null,
        "userId": 1,
        "userNickname": "냉혹한 솔개",
        "userEmail": "jinyshin.dev@gmail.com",
        "content": "테스트 대댓글",
        "isDeleted": true,
        "reportCount": 2,
        "createdAt": "2025-11-29T13:23:04.707444",
        "replies": []
      },
      {
        "commentId": 4,
        "questionId": 1,
        "parentId": null,
        "userId": 1,
        "userNickname": "냉혹한 솔개",
        "userEmail": "jinyshin.dev@gmail.com",
        "content": "테스트 대댓글",
        "isDeleted": false,
        "reportCount": 1,
        "createdAt": "2025-11-29T13:23:04.251709",
        "replies": []
      },
      {
        "commentId": 6,
        "questionId": 1,
        "parentId": null,
        "userId": 1,
        "userNickname": "냉혹한 솔개",
        "userEmail": "jinyshin.dev@gmail.com",
        "content": "테스트 대댓글",
        "isDeleted": false,
        "reportCount": 1,
        "createdAt": "2025-11-29T13:23:05.323896",
        "replies": []
      }
    ]
  }
}
```

# 질문별 푸시 발송 결과 조회
[Request Parameters](https://www.notion.so/28911c0ac54d81439ef0c4f0da38f8f5?pvs=21)

## Request Body

[DTO 이름](https://www.notion.so/28911c0ac54d814c8f6ce9dd670cab15?pvs=21)

### Enum 이름 (없으면 삭제)

```java

```

### Example

```json

```

## Response Body

[NotificationLogListResponse](https://www.notion.so/28911c0ac54d8135a232c005e74230e4?pvs=21)

### Example

`200 OK`

```json
{
  "items": [
    {
      "log_id": 9876,
      "question_id": 123,
      "scheduled_at": "2025-10-13T23:00:00Z",
      "sent_at": "2025-10-13T23:00:02Z",
      "target_count": 1500,
      "success_count": 1420,
      "fail_count": 80
    }
  ],
  "page": 1,
  "size": 20,
  "total": 8
}
```

# 투표/댓글 통계 조회
![스크린샷 2025-12-21 오후 12.36.52.png](attachment:2db60e6a-96ea-4e42-9dc4-fccc03a2c1c9:스크린샷_2025-12-21_오후_12.36.52.png)

[Request Parameters](https://www.notion.so/28911c0ac54d81b79bdbc094700b1302?pvs=21)

## Request Body

[DTO 이름](https://www.notion.so/28911c0ac54d812c9d0cc691f2963f7d?pvs=21)

### Enum 이름 (없으면 삭제)

```java

```

### Example

```json

```

## Response Body

[DTO 이름](https://www.notion.so/28911c0ac54d8163a396f338db06e245?pvs=21)

### Example

`200 OK`

```json
{
  "date": "2025-10-10",
  "dau": 734,
  "vote_count": 1450,
  "comment_count": 380,
  "participation_rate": 197.6,
  "by_topic": [
    { "topic_id": 123, "votes": 200, "comments": 56, "agree": 120, "disagree": 80 }
  ],
  "access_by_hour": [23, 41, 52, 38, ...]
}
```

# 사용자별 누적 투표/댓글 횟수 조회
![스크린샷 2025-12-21 오후 12.34.05.png](attachment:af402141-7575-4030-bdad-29faa57ef9fc:스크린샷_2025-12-21_오후_12.34.05.png)

[Request Parameters](https://www.notion.so/28911c0ac54d81399c8efb75daa2cf62?pvs=21)

## Request Body

[DTO 이름](https://www.notion.so/28911c0ac54d81299087e02a25ae577f?pvs=21)

### Enum 이름 (없으면 삭제)

```java

```

### Example

```json

```

## Response Body

[UserEngagementListResponse{
"items": [
{
"user_id": 42,
"nickname": "푸른참새",
"votes": 87,
"comments": 23,
"last_active_at": "2025-10-10T15:02:00Z"
}
],
"page": 1,
"size": 20,
"total": 312
}](https://www.notion.so/28911c0ac54d817282d4e3c28a920135?pvs=21)

### Example

`200 OK`

```json
{
  "items": [
    {
      "user_id": 42,
      "nickname": "왕문어",
      "votes": 87,
      "comments": 23,
      "last_active_at": "2025-10-10T15:02:00Z"
    }
  ],
  "page": 1,
  "size": 20,
  "total": 312
}
```
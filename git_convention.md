# Commit

- {태그}: {제목} 형식으로 작성하며 제목은 최대 50글자 정도로만 입력
- 제목 끝에 마침표 금지, 무엇을 했는지 명확하게 작성

| 태그 | 설명 |
| --- | --- |
| feat | 새로운 기능을 추가한 경우 |
| fix | 오류를 해결한 경우 |
| refactor | 코드를 리팩토링한 경우 |
| docs | 문서를 수정한 경우 |
| test | 테스트 코드를 추가하거나 수정한 경우 |
| design | CSS 등 UI 디자인을 변경한 경우 |
| comment | 주석을 추가하거나 변경한 경우 |
| style | 코드 의미에 영향을 주지 않는 변경사항 |
| chore | 기타 변경사항 (빌드 스크립트 수정, 패키지 매니징 설정 등) |

# Workflow

기본적으로 Git flow 전략을 사용한다.

## Branch

- **main**: 배포 가능한 안정적인 코드가 유지되는 브랜치
- **dev**: 기본 브랜치로, 기능을 개발하는 브랜치
- **feature**/{epic-ticket}-{feature-name}: 기능 개발용 브랜치
- **fix**/~~ : 수정용 브랜치
- **hotfix**/{epic-ticket}-{hotfix-name}: 긴급 수정용 브랜치
    - hotfix 브랜치는 prod 브랜치에서 분기한다.
    - hotfix 브랜치는 prod와 dev 브랜치로 PR후 머지한다.
- **실제 flow 예시**
    
    ```mermaid
    gitGraph
       commit
       commit
       branch dev
       commit
       branch feature
       commit
       commit
       checkout dev
       merge feature
       checkout main
       merge dev
       commit tag:"v1.0"  %% 배포 태그
       
       %% 긴급 버그 발생!
       branch hotfix
       commit
       commit
       checkout main
       merge hotfix
       commit tag:"v1.0.1" %% 긴급 배포
       
       checkout dev
       merge hotfix  %% dev에도 반영
    
    ```
## 실행

프로젝트를 실행하기 위한 단계별 명령어입니다:

1. 의존성 패키지 설치:

```bash
npm install
```

2. 환경변수 설정:

.env.example 참고하여 .env 파일 생성

3. Prisma 설정:

```bash
npx prisma generate  # Prisma 클라이언트 생성
```

4. 실행:

```bash
# 개발 모드
npm run dev

# 또는 프로덕션 모드
npm run build
npm start
```

## 데이터베이스 마이그레이션 방법:

1. `schema.prisma` 파일 수정

2. 로컬 환경에서 마이그레이션을 생성하고 적용

```bash
npx prisma migrate dev
```

- 이 명령은 새로운 마이그레이션 파일을 생성하고, 로컬 데이터베이스를 최신 상태로 동기화

3. 마이그레이션 상태 확인

```bash
npx prisma migrate status
```

- 이 명령은 현재 마이그레이션 상태를 확인하고, 데이터베이스와 마이그레이션 파일이 일치하는지 확인

4. 생성된 마이그레이션 파일 커밋 및 푸시

5. 다른 팀원들은 수정된 `schema.prisma`와 마이그레이션 파일을 merge한 뒤 마이그레이션 적용

```bash
npx prisma generate  # Prisma 클라이언트 타입 생성
```

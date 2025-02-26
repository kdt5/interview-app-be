## 실행

프로젝트를 실행하기 위한 단계별 명령어입니다:

1. 의존성 패키지 설치:

```bash
npm install
```

2. 환경변수 설정:

```bash
# .env 파일 생성 후 다음 내용 추가
DATABASE_URL="mysql://username:password@localhost:3306/database_name"
SHADOW_DATABASE_URL="mysql://username:password@localhost:3306/shadow_database_name"
PORT=3000
JWT_SECRET="your-secret-key"
```

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

## 데이터베이스 마이그레이션:

```bash
npx prisma migrate dev
```

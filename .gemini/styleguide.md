# Interview app Guide

## 소개

타입스크립트를 사용한 인터뷰 앱 백엔드 프로젝트를 위한 스타일 가이드입니다.

### 의사소통

- 이 프로젝트에서는 코드 리뷰 및 요약 등 의사소통에 기본으로 한국어를 사용합니다.
- 용어와 같이 영어를 사용하여 대상, 의도를 더 명확히 전달하는데 도움이 된다면 영어를 사용합니다.

### 참고

아래 자료를 참고하고 팀원과 코딩 스타일 선호를 협의를 통해 작성했습니다.

- [Gemini Code Assist styleguide](https://developers.google.com/gemini-code-assist/docs/customize-gemini-behavior-github)
- [Google tsguide](https://google.github.io/styleguide/tsguide.html)

## 기본 원칙

- **가독성:** 코드는 다른 사람이 이해하기 쉽게 작성해야 합니다.
- **유지보수:** 코드는 수정하고 확장에 용이하도록 작성해야 합니다.
- **일관성:** 코드는 다른 코드와 가능한 일관된 스타일로 작성합니다.
- **성능:** 코드는 가독성이 유지되는 선에서 최대한 효율적으로 작성합니다.
- **타입:** TypeScript의 타입 시스템을 최대한 활용합니다.
- **보안:** 코드는 보안을 고려하여 작성해야 합니다. 입력 데이터의 유효성을 확인하고, 비밀번호와 같은 민감한 정보는 적절하게 암호화하여 처리합니다.

## 파일 구조

- 파일명은 camelCase를 사용합니다.

아래와 같은 디렉토리 구조로 개발합니다.

```PlainText
root/
├── src/
│   ├── constants/      # 상수
│   │   └── errors/     # 에러 관련
│   ├── controllers/    # 라우트 핸들러
│   ├── lib/            # 라이브러리 설정 파일
│   ├── middlewares/    # 미들웨어
│   │   └── validators/ # 검증 관련 유틸리티
│   ├── services/       # 비즈니스 로직
│   ├── models/         # 데이터 모델
│   ├── routes/         # 라우트 정의
│   ├── utils/          # 유틸리티 함수
│   └── config/         # 설정 파일
├── tests/              # 테스트 파일
├── app.ts              # Express 앱 설정
├── .env                # 환경 변수
├── package.json
└── README.md
```

## 들여쓰기

들여쓰기는 2개의 Space를 사용합니다.
2칸의 여백을 사용해도 코드의 들여쓰기를 구분하는데 문제가 없고 코드의 좌, 우 이동을 줄여 가독성을 향상시킬 수 있습니다.

## 문자열 리터럴

문자열 리터럴을 작성할 때 큰 따옴표(`"`)를 사용합니다.
이는 웹 개발 관습인 작은 따옴표(`'`)를 사용하는것과 차이가 있지만 C계열 언어에서 문자열을 큰 따옴표로, 문자를 작은 따옴표로 구분하는 관습을 따랐습니다.

## 작명 규칙

### 작명 스타일

TypeScript는 타입에 대한 정보를 제공하므로 이름에 타입 정보를 사용하지 않습니다.

### 명확한 식별자

프로젝트를 모르는 사람의 기준에서 모호하거나 익숙하지 않은 축약어나 임의의 축약어를 사용하지 않습니다.

### 식별자 타입별 규칙

| Style         | Category                                 |
| ------------- | ---------------------------------------- |
| PascalCase    | class / type / interface / enum          |
| camelCase     | variable / function / method / parameter |
| CONSTANT_CASE | global constant values / enum values     |

## 주석

- **명확하고 간결하게:** "무엇을" 하는지보다 "왜" 이 코드를 작성했는지 의도를 작성합니다.
- **주석 최소화:** 잘 작성한 코드는 자체로 문서화가 되어야 합니다.

## 에러 처리

- **유연한 예외 처리:** 유용한 에러 메시지를 제공하고 예외로 인해 프로그램이 종료되지 않게 합니다.
- **`try...catch` 사용:** 예외가 발생할 수 있는 코드를 분리합니다.

## 함수

### 용어

여러 함수가 있으며 함수와 관련해 이 가이드에서는 아래와 같이 용어를 사용합니다.

- **함수 선언:** `function foo() { ... }`
- **함수 표현식:** `function() { ... }`
- **화살표 함수:** `() => { ... }`
- **블록 본문:** `() => { return 1; }` 화살표 함수에서 중괄호를 사용한 본문
- **간결한 본문:** `() => 1` 화살표 함수에서 중괄호를 생략한 본문

### 이름 있는 함수에는 함수 선언을 사용

이름 있는 함수는 함수 표현식, 화살표 함수보다 함수 선언을 사용합니다.

```TypeScript
  // Good
  function foo() {
    return 42;
  }
```

```TypeScript
  // Bad
  const foo = () => 42;
```

### 익명 함수는 화살표 함수만 사용

익명 함수로 함수 표현식 대신 화살표 함수만 사용합니다.
익명 함수의 방식을 통일시킴으로써 코드의 일관성을 유지할 수 있습니다.
화살표 함수를 사용하면 더 간결하고 익명 함수와 함수 선언을 구분하기 더 쉽습니다.

## 타입 시스템

### 타입 명시

추론이 어려운 표현식에는 타입을 명시합니다.
추론이 가능한 타입(string, number, boolean, ...)에는 타입을 생략합니다.

```TypeScript
  // 생략 가능
  const x = 15;
  const y = "abc";
```

```TypeScript
  // 타입 명시로 코드 가독성을 향상시킬 수 있는 코드
  const value: string[] = await rpc.getSomeValue().transform();
```

### 반환 타입

이름 있는 함수의 반환 타입을 항상 정의합니다.
코드 가독성을 높일 뿐 아니라 코드 작성시 올바른 타입을 반환하도록 도움을 줍니다.

```TypeScript
  function buildName(firstName: string, lastName: string): string { ... }
```

### 타입 선언 Nullable/undefined

타입을 선언할 때 `|null`이나 `|undefined`를 유니온 타입에 포함해서는 안됩니다.
타입이 nullable, undefined 가능해지면 null, undefined 값의 출처를 추적하기 힘들 수 있습니다.

```TypeScript
  // Bad
  type CoffeeResponse = Latte | Americano | undefined;

  class CoffeeService {
    get Latte(): CoffeeResponse { ... };
  }
```

```TypeScript
  // Good
  type CoffeeResponse = Latte | Americano;

  class CoffeeService {
    get Latte(): CoffeeResponse | undefined { ... };
  }
```

### 객체 타입에는 인터페이스 사용

객체 형태를 정의할 때는 인터페이스를 사용합니다. `type`과 용도를 구분할 수 있을 뿐 아니라 [성능적인 부분](https://ncjamieson.com/prefer-interfaces/)에서도 도움이 될 수 있습니다.

```TypeScript
  // Good
  interface User {
    firstName: string;
    lastName: string;
  }
```

```TypeScript
  // Bad
  class User {
    readonly firstName: string;
    readonly lastName: string;
  }

  type User {
    firstName: string,
    lastName: string,
  }
```

### 객체 사용시 타입 명시

객체를 변수로 사용할 때 타입을 명시합니다.
타입을 명시하면 올바르게 객체를 정의하지 않은 경우 컴파일 에러를 발생시켜 문제를 찾는데 도움이 됩니다.

```TypeScript
  interface Animal {
    sound: string;
    name: string;
  }

  // name이 정의되지 않아도 오류를 발생시키지 않습니다.
  const dog = {
    sound: "bark"
  }

  // 모든 필드가 정의되지 않으면 컴파일 오류를 발생시킵니다.
  const cat: Animal = {
    sound: "meow",
    name: "kat"
  }

  // 함수에 전달되었을 때 컴파일 오류가 발생하나 dog 값을 찾아야 합니다.
  makeSound(dog);
  makeSound(cat);

  // 아래와 같이 사용하는 경우 타입 추론이 가능하므로 필드가 없을 때 컴파일 오류를 확인할 수 있습니다.
  makeSound({
    sound: "Moo",
    name: "cow"
  })
```

## 보안

- **환경 변수**: 민감한 정보는 환경 변수로 관리합니다.
- **입력 검증**: 모든 사용자 입력은 검증합니다.
- **에러 메시지**: 프로덕션 환경에서는 상세한 에러 메시지를 노출하지 않습니다.
- **CORS**: 적절한 CORS 설정을 사용합니다.

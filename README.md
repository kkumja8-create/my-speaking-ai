# Speaking AI

목소리를 녹음하고 상태를 확인하는 Speaking AI 웹 앱입니다.

## 개발

```sh
npm install
npm run dev
```

## 빌드

```sh
npm run build
npm run preview
```

정적 파일은 `build/`에 생성됩니다.

## 배포 (Vercel)

1. [Vercel](https://vercel.com)에 로그인합니다.
2. 이 저장소를 import하거나 CLI로 배포합니다.

```sh
npx vercel login
npx vercel --prod
```

`vercel.json`에 빌드 설정이 포함되어 있습니다. HTTPS에서만 마이크 권한이 동작합니다.

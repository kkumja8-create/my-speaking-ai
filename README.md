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

## 배포

### GitHub Pages (자동)

`main` 브랜치에 푸시하면 GitHub Actions가 자동으로 배포합니다.

- 사이트: https://kkumja8-create.github.io/my-speaking-ai/

### Vercel

```sh
npx vercel login
npx vercel --prod
```

`vercel.json`에 빌드 설정이 포함되어 있습니다. 마이크는 HTTPS(또는 localhost)에서만 동작합니다.

# 📊 Behavior Tracking SDK

> 웹사이트 방문자의 행동을 감지하고 자동화 마케팅 트리거를 작동시키는 JavaScript SDK입니다.

이 SDK는 [VisiLog](https://github.com/SungHuii/sdk-behavior-trigger-mvp) 백엔드와 함께 사용되며,  
페이지 방문, 클릭, 스크롤, 체류 시간 등의 행동을 자동으로 수집하고 조건을 만족하면 이벤트를 전송합니다.

---

## 🚀 설치 및 사용법

```html
<script 
  src="https://behavior-tracking-sdk.vercel.app/sdk.js" 
  data-key="YOUR_PROJECT_KEY" 
  data-api="https://your-api-server.com">
</script>
```

또는 JavaScript에서 직접 초기화:

```js
BehaviorSDK.init({
  projectKey: "YOUR_PROJECT_KEY",
  apiUrl: "https://your-api-server.com",
  scrollThreshold: 0.3,
  collectEmail: true,
  emailKey: "__USER_EMAIL__"
});
```

---

## 🧠 작동 방식

- 방문자 식별 (visitorId 발급 및 저장)
- 조건 목록 조회 (`/api/conditions/{projectKey}`)
- 행동 이벤트 감지 및 전송 (page_view, stay_time, scroll_depth, click)
- 로그인 이메일 자동 수집 (선택적)

---

## 📦 주요 기능 정리

| 기능            | 설명 |
|------------------|------|
| 방문자 자동 식별 | visitorId 자동 발급 및 쿠키/로컬스토리지 저장 |
| 조건 자동 매칭   | 등록된 조건과 현재 이벤트 비교 후 필터링 |
| 이벤트 자동 전송 | 로그 기록 자동 수행 (`/api/logs`) |
| 이메일 수집      | 로그인 사용자 이메일 1회 수집 (`/api/visitors/{id}/email`) |

---

## ✉️ 이메일 수집 가이드 (Project Owner용)

> SDK를 사용하는 웹사이트에서 사용자 이메일을 수집하려면 다음 중 하나를 설정하세요.

### 📌 전역 변수 방식 (기본)

```html
<script>
  window.__USER_EMAIL__ = 'user@example.com';
</script>
```

### 📌 커스텀 전역 변수 사용

```js
BehaviorSDK.init({
  projectKey: 'PROJECT_KEY',
  emailKey: 'MY_EMAIL_KEY'  // 전역 변수 이름
});

// window.MY_EMAIL_KEY = 'user@example.com';
```

### 📌 이메일 수집 비활성화

```js
BehaviorSDK.init({
  projectKey: 'PROJECT_KEY',
  collectEmail: false
});
```

---

## 🔐 개인정보 고지 예시

> 본 사이트는 행동 기반 자동 메시지 발송을 위해 VisiLog SDK를 사용하며,  
> 로그인된 이메일 정보를 수집할 수 있습니다.  
> 수집된 정보는 외부에 공유되지 않으며, 서비스 제공 목적 외에는 사용되지 않습니다.

---

## ✅ 체크리스트

| 항목 | 체크 |
| --- | --- |
| [ ] `window.__USER_EMAIL__` 또는 커스텀 변수 설정 |
| [ ] SDK 코드보다 먼저 이메일 변수 삽입 |
| [ ] 이메일 수집 비활성화 시 `collectEmail: false` 적용 |
| [ ] 개인정보 고지 포함 |
| [ ] 이메일 수집 여부 확인: `localStorage.getItem('emailSynced') === "1"` |

---

## 🙋‍♂️ 만든 사람

- GitHub: [@SungHuii](https://github.com/SungHuii)
- 이메일: gkemg2017@gmail.com
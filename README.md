# 🍚 점심 메뉴 고르기 (카훗 스타일)

같이 밥 먹는 친구들이 **실시간으로 투표**해서 메뉴를 정하고,  
**내 위치 기준**으로 그 메뉴를 파는 음식점 3~5곳을 추천받는 서비스예요.

---

## 📌 서비스 흐름 (쉽게 이해하기)

1. **방 만들기** – 한 명이 "방"을 만들면 고유 링크가 생겨요.
2. **친구들 입장** – 링크를 공유하면 카훗처럼 누구나 들어올 수 있어요.
3. **메뉴 후보 정하기** – 방장이 후보 메뉴를 넣거나, 참가자들이 추가해요.
4. **투표** – 모두가 마음에 드는 메뉴에 투표해요. (실시간 반영)
5. **결과** – 가장 많이 선택된 메뉴가 최종 선정돼요.
6. **음식점 추천** – 선정된 메뉴로, **내 위치** 기준 3~5곳 음식점을 볼 수 있어요.  
   (가격, 리뷰 점수, 위치 표시)

---

## 🛠 사용 기술 (고등학생도 따라 할 수 있게)

| 구분 | 기술 | 설명 |
|------|------|------|
| **백엔드** | Node.js + Express | 서버 로직 (방, 투표 처리) |
| **실시간** | Socket.io | 카훗처럼 여러 명이 동시에 투표할 때 사용 |
| **프론트** | React (Vite) | 화면 구성 (방 만들기, 투표, 결과, 음식점 목록) |
| **음식점 검색** | 카카오 로컬 API | 위치 기반 음식점 검색 (이름, 주소, 거리, 카카오맵 링크 제공. 가격·리뷰는 별도 API로 확장 가능) |

- 처음에는 **10~20명** 사용을 가정했고, 나중에 사용자가 늘어나도 구조를 키우기 쉽게 만들었어요.

---

## 🚀 실행 방법

### ⭐ 한 번에 실행하기 (권장) — "서버에 연결할 수 없어요" 해결

**프로젝트 루트**에서 터미널을 연 뒤, **아래 한 줄만** 입력하세요:

```bash
npm start
```

- **서버(3001)** 를 먼저 켠 다음, 준비되면 **화면(5173)** 이 자동으로 실행돼요.
- 터미널에 `서버가 http://localhost:3001 에서 준비됐어요` 가 보이면, 브라우저에서 **http://localhost:5173** 로 접속하세요.
- 이렇게 하면 "서버에 연결할 수 없어요" 메시지 없이 방 만들기가 동작해요.

**반응이 없을 때**
1. 터미널에서 **프로젝트 폴더**로 이동했는지 확인하세요. (`cd` 로 `260216_2_test` 폴더로 이동)
2. 루트에서 `npm install` 한 번 실행한 뒤 다시 `npm start` 를 입력해 보세요.

### 1) 사전 준비

- **Node.js**가 설치되어 있어야 해요. (설치: https://nodejs.org)
- 터미널에서 아래 명령으로 확인할 수 있어요.  
  `node -v`  
  `npm -v`

### 2) 패키지 설치

```bash
# 루트 폴더에서
npm install

# 서버용 패키지
cd server && npm install && cd ..

# 클라이언트(화면)용 패키지
cd client && npm install && cd ..
```

### 3) 서버 실행

```bash
cd server
npm start
```

- 서버는 **http://localhost:3001** 에서 돌아가요.

### 4) 클라이언트(화면) 실행

**새 터미널**을 열고 (프로젝트 **루트** 또는 **client** 폴더에서):

```bash
# 루트에서 (권장)
npm run dev

# 또는 client 폴더에서
cd client
npm run dev
```

- 터미널에 나온 주소로 접속해요. 보통 **http://localhost:5173** 이에요.
- 포트가 이미 쓰이면 **5174** 등 다른 번호로 나올 수 있어요. 그때는 터미널에 찍힌 주소로 접속하면 돼요.

### 5) 음식점 추천을 쓰려면 (선택)

- [카카오 개발자 사이트](https://developers.kakao.com)에서 앱을 만들고 **REST API 키**를 발급받아요.
- `server` 폴더에 `.env` 파일을 만들고 아래처럼 넣어요.  
  `KAKAO_REST_API_KEY=여기에_발급받은_키`
- 키가 없어도 **투표·결과**까지는 동작하고, 음식점 추천만 “API 키 필요” 메시지로 대체돼요.

---

## 🌐 배포 (다른 사용자 접속)

---

### 📖 처음 배포하시는 분을 위한 상세 가이드

**배포**란, “지금 내 컴퓨터에서만 보이던 서비스를 **인터넷에 올려서** 누구나 링크만 있으면 들어올 수 있게 하는 것”이에요.  
아래는 기획자·비개발자도 따라 할 수 있도록 단계별로 풀어 쓴 설명이에요.

---

#### 배포가 끝나면 어떻게 되나요?

- 친구·동료에게 **URL 하나**(예: `https://menupicker.onrender.com`)만 보내면,
- **다른 Wi‑Fi, 다른 지역**에서도 그 링크를 열어 **방 만들기·입장·투표**를 할 수 있어요.
- 우리가 쓰는 서비스는 **Render**라는 곳에서 “우리 코드를 받아서 24시간 돌려 주는 서버”를 빌려 쓰는 방식이에요. (무료 플랜으로 시작 가능)

---

#### 1단계: GitHub에 코드 올리기 (푸시)

**GitHub**는 “코드 저장소”라고 생각하면 돼요.  
우리 프로젝트를 GitHub에 올려 두어야, Render가 그 코드를 가져가서 서버에서 실행할 수 있어요.

**이 프로젝트의 저장소 주소:** https://github.com/soommm/menupicker

**할 일:**

1. **터미널**을 엽니다.
   - Mac: Spotlight(⌘ + 스페이스)에 “터미널” 또는 “Terminal” 검색 후 실행.
   - Windows: “명령 프롬프트” 또는 “PowerShell” 실행.
2. **프로젝트 폴더로 이동**합니다. (아래 경로는 본인 PC에 맞게 수정)
   ```bash
   cd /Users/soominpark/Desktop/260216_2_test
   ```
3. **한 줄 입력** 후 Enter:
   ```bash
   git push -u origin main
   ```
4. **“Authentication failed” 가 나오면** → 아래 **“🔑 GitHub 푸시 인증 (Authentication failed 해결)”** 섹션을 보고 **토큰**을 만들어 사용하세요. (GitHub는 예전처럼 비밀번호로 푸시할 수 없고, **토큰**만 허용해요.)
5. `main` 브랜치가 성공적으로 푸시되었다는 메시지가 나오면 1단계 끝이에요.  
   브라우저에서 https://github.com/soommm/menupicker 에 들어가 보면 방금 올린 코드가 보여요.

---

#### 2단계: Render 가입 및 서비스 만들기

**Render**는 “코드를 받아서 웹 서비스로 24시간 돌려 주는 곳”이에요.  
GitHub에 올린 코드를 Render가 가져가서, 누구나 접속할 수 있는 주소를 만들어 줍니다.

**할 일:**

1. **Render 사이트 접속**  
   - https://dashboard.render.com 로 들어갑니다.
2. **가입/로그인**  
   - **Sign up** 또는 **Log in** 후, **“Sign in with GitHub”** 를 선택하는 것을 권장해요.  
   - GitHub 계정으로 로그인하면, 나중에 “어느 GitHub 저장소를 배포할지” 고를 때 편해요.
3. **새 서비스 만들기**  
   - 로그인 후 화면에서 **“New +”** 버튼을 누릅니다.  
   - 목록에서 **“Blueprint”** 를 선택합니다.  
     (Blueprint = “이 프로젝트에 들어 있는 설정 파일을 읽어서 서비스를 자동으로 만들어 주는 방식”이에요.)
4. **GitHub 저장소 연결**  
   - **“Connect a repository”** 또는 **“Connect account”** 같은 버튼이 보이면, **GitHub**를 선택합니다.  
   - GitHub 권한 요청이 나오면 **Authorize** 등으로 허용해 줍니다.  
   - 연결된 계정의 저장소 목록에서 **“soommm/menupicker”** (또는 menupicker) 를 고릅니다.  
   - **“Connect”** 또는 **“Use this repository”** 를 누릅니다.
5. **설정 확인**  
   - Render가 저장소 안의 **`render.yaml`** 파일을 읽어서,  
     “어떤 명령으로 빌드하고, 어떤 명령으로 서버를 켤지”를 자동으로 채워 줍니다.  
   - 별도로 수정하지 않아도 이 프로젝트는 그대로 사용 가능해요.
6. **배포 시작**  
   - **“Apply”** 또는 **“Create”** 를 누르면 배포가 시작됩니다.  
   - 화면에 **“Building…”**, **“Deploying…”** 같은 진행 상태가 보여요.  
   - **2~5분 정도** 기다리면 **“Live”** 또는 **“Your service is live”** 로 바뀝니다.
7. **접속 주소 확인**  
   - 상단이나 서비스 상세 화면에 **URL**이 보여요.  
   - 예: `https://menupicker.onrender.com` 또는 `https://menupicker-xxxx.onrender.com`  
   - 이 주소를 복사해 두세요.

---

#### 3단계: 접속 주소 공유하기

- 배포가 **Live**가 되었다면, 복사한 **URL**을 친구·동료에게 보내기만 하면 됩니다.
- 그 링크를 열면 **점심 메뉴 고르기** 화면이 나오고, 방 만들기·방 코드로 입장·투표가 모두 가능해요.
- **다른 네트워크**(다른 Wi‑Fi, 다른 지역)에 있어도 같은 링크로 접속할 수 있어요.

---

#### 4단계: 알아두면 좋은 것들

- **무료 플랜 (Free)**  
  - Render 무료 플랜은 “한동안 접속이 없으면 서비스를 잠깐 멈춘다(절전)”는 특징이 있어요.  
  - 그래서 **오래 만에 처음 링크를 열면** “깨우는” 동안 **30초~1분** 정도 걸릴 수 있어요.  
  - 그 다음부터는 보통 빠르게 열려요.
- **HTTPS**  
  - Render가 만들어 주는 주소는 모두 **https://** 로 시작해요.  
  - 주소 그대로 공유하면 되고, 따로 설정할 것은 없어요.
- **음식점 추천(카카오 API)**  
  - 음식점 추천까지 쓰고 싶다면, Render 대시보드에서 이 서비스 선택 → **Environment** 탭 → **Add Environment Variable** 에서  
    키: `KAKAO_REST_API_KEY`, 값: (카카오 개발자 콘솔에서 발급한 REST API 키) 를 넣으면 됩니다.  
  - 넣지 않아도 **방 만들기·투표·결과**까지는 그대로 동작하고, 음식점 추천만 “API 키 필요” 메시지로 나와요.

---

#### 🔑 GitHub 푸시 인증 (Authentication failed 해결)

`fatal: Authentication failed for 'https://github.com/soommm/menupicker.git/'` 가 나오면 **Personal Access Token(토큰)**으로 인증해야 해요. (GitHub 로그인 비밀번호는 git 푸시에 쓰이지 않아요.)

**1) 토큰 만들기**

1. 브라우저에서 **https://github.com/settings/tokens** 로 들어가요.
2. **Log in to GitHub** 이 나오면 soommm 계정으로 로그인해요.
3. **“Generate new token”** → **“Generate new token (classic)”** 을 눌러요.
4. **Note** 에는 아무 이름이나 넣어요. (예: `menupicker 푸시`)
5. **Expiration** 은 **90 days** 또는 **No expiration** 중 하나를 골라요.
6. **Select scopes** 에서 **repo** 에만 체크해요. (전체 repo 권한)
7. 맨 아래 **“Generate token”** 을 누르면 **한 번만** 긴 문자열이 나와요. (예: `ghp_xxxxxxxxxxxx`)  
   → **이걸 복사**해 두세요. 나중에 다시 볼 수 없어요.

**2) 푸시할 때 토큰 쓰기**

터미널에서 다시:

```bash
cd /Users/soominpark/Desktop/260216_2_test
git push -u origin main
```

- **Username** 이 나오면: **soommm** (본인 GitHub 아이디) 입력 후 Enter.
- **Password** 가 나오면: **방금 복사한 토큰**을 **그 자리에서** 붙여 넣어요 (Cmd+V).  
  - ⚠️ 비밀번호처럼 **아무 글자도 안 보이는 게 정상**이에요. 그대로 Enter만 누르면 돼요.  
  - ❌ **새 줄에 토큰을 입력하면 안 돼요.** 터미널이 그걸 명령어로 인식해서 `command not found` 에러가 나요. 반드시 "Password:" 나온 **그 입력 칸에** 붙여 넣기.

**한 번에 주소에 넣고 싶다면** (매번 물어보지 않게):

```bash
git remote set-url origin https://soommm@github.com/soommm/menupicker.git
git push -u origin main
```

- `Password for 'https://soommm@github.com':` 가 나오면 **토큰**을 붙여 넣어요.

**⚠️ 토큰이 채팅·메시지에 노출됐다면**  
GitHub → [Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens) 에서 해당 토큰을 **Delete/Revoke** 하고, 새 토큰을 만들어서 사용하세요.

---

**🔄 또 실패할 때 (Password 입력해도 Invalid / Authentication failed)**

Mac이 **예전에 잘못 입력한 비밀번호**를 기억하고 있을 수 있어요. 아래 순서대로 해 보세요.

**방법 A) 캐시 지우고, 토큰을 URL에 넣어서 한 번만 푸시**

1. **저장된 GitHub 비밀번호 지우기** (터미널에 그대로 복사해서 한 줄씩 실행)
   ```bash
   git credential-osxkeychain erase
   ```
   그 다음 **아래 3줄을 한꺼번에** 입력하고 Enter를 **두 번** 누르세요.
   ```
   host=github.com
   protocol=https
   ```
   (두 번째 Enter 후 아무것도 안 나오면 정상이에요.)

2. **새 토큰**을 GitHub에서 하나 만드세요.  
   https://github.com/settings/tokens → Generate new token (classic) → **repo** 체크 → Generate token → **토큰 복사**.

3. **아래 한 줄**을 터미널에 넣되, **`여기에새토큰붙여넣기`** 자리에 방금 복사한 토큰을 붙여 넣은 뒤 실행해요.
   ```bash
   git remote set-url origin https://soommm:여기에새토큰붙여넣기@github.com/soommm/menupicker.git
   ```
   예: 토큰이 `ghp_abc123` 이라면  
   `git remote set-url origin https://soommm:ghp_abc123@github.com/soommm/menupicker.git`

4. **푸시**
   ```bash
   cd /Users/soominpark/Desktop/260216_2_test
   git push -u origin main
   ```
   이번에는 비밀번호를 묻지 않고 푸시될 거예요.

5. **보안을 위해** 푸시가 끝나면 주소에서 토큰을 다시 빼 두세요. (다음 푸시 때 다시 묻거나, 아래 방법 B 사용)
   ```bash
   git remote set-url origin https://github.com/soommm/menupicker.git
   ```

**방법 B) GitHub CLI로 로그인 (가장 수월할 수 있음)**

1. **GitHub CLI 설치**  
   - https://cli.github.com/ 에서 Mac용 설치 파일 받아서 설치하거나,  
   - 터미널에서: `brew install gh` (Homebrew가 있을 때)

2. **로그인**
   ```bash
   gh auth login
   ```
   - GitHub.com 선택 → HTTPS 선택 → Login with a web browser 선택  
   - 나오는 **코드**를 복사하고, 브라우저에서 열리는 페이지에 **코드 입력** → Authorize

3. **그 다음 푸시**
   ```bash
   cd /Users/soominpark/Desktop/260216_2_test
   git push -u origin main
   ```
   이제 인증 없이 푸시될 수 있어요.

이렇게 하면 Authentication failed 없이 푸시될 거예요.

---

#### 5단계: 문제가 생겼을 때

| 상황 | 확인할 것 |
|------|------------|
| `Authentication failed` / `git push` 로그인 실패 | 위 **🔑 GitHub 푸시 인증** 대로 **Personal Access Token** 만들고, Password 자리에 **토큰** 입력. |
| `git push` 할 때 “권한 없음” | GitHub 계정이 이 저장소(soommm/menupicker) 소유자인지, 토큰에 **repo** 권한이 있는지 확인. |
| Render에서 저장소가 안 보여요 | “Sign in with GitHub”로 로그인했는지, GitHub 권한 허용을 했는지 확인. |
| 배포가 실패해요 (Failed) | Render 대시보드의 **Logs** 탭에서 빨간색 에러 메시지를 확인. 대부분 “빌드/시작 명령” 문제이면 `render.yaml` 설정을 함께 보면 됩니다. |
| 링크를 열었는데 한참 동안 하얀 화면 / 로딩만 돼요 | 무료 플랜 절전일 수 있어요. 30초~1분 기다려 보세요. |

---

### A) 정식 배포 요약 (이미 익숙한 분용)

**Render.com**에 올리면 전 세계 어디서나 링크 하나로 접속 가능. (무료 플랜 가능)

1. **GitHub 푸시**  
   - 저장소: https://github.com/soommm/menupicker  
   - `git push -u origin main` (한 번만 실행).
2. **Render**  
   - [dashboard.render.com](https://dashboard.render.com) → New + → Blueprint → 저장소 **soommm/menupicker** 연결 → Apply.
3. **접속 주소**  
   - Live 되면 나오는 URL(예: `https://menupicker.onrender.com`)을 공유.
4. **(선택)** 카카오 API: 서비스 → Environment → `KAKAO_REST_API_KEY` 추가.

#### Railway로 배포하고 싶을 때

- [Railway](https://railway.app) 가입 후 **New Project** → **Deploy from GitHub repo** → 이 저장소 연결.
- **Build Command**: `npm run install:all && npm run build`
- **Start Command**: `npm run start:prod`
- **Root Directory**: 저장소 루트 그대로.

---

### B) 같은 Wi‑Fi만 접속 (로컬/사무실)

같은 Wi‑Fi를 쓰는 친구·동료만 **내 PC에서 돌리는 앱**에 접속하려면:

**프로젝트 루트**에서:

```bash
npm run deploy
```

- **내 PC**: 브라우저에서 **http://localhost:3001** 로 접속.
- **다른 사람**: 같은 Wi‑Fi에서 **http://(이 PC의 IP):3001** 로 접속 (예: `http://192.168.0.10:3001`).
- Mac에서 IP 확인: 터미널에서 `ipconfig getifaddr en0`

---

## 📁 폴더 구조 (어디에 뭐가 있는지)

```
260216_2_test/
├── README.md          ← 지금 읽고 있는 설명서
├── server/            ← 백엔드 (방, 투표, 음식점 API 연동)
│   ├── index.js       ← 서버 진입점 + Socket.io
│   └── package.json
└── client/            ← 프론트엔드 (화면)
    ├── index.html
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── ... (화면 컴포넌트들)
    └── package.json
```

---

## ✅ 체크리스트 (내가 원하는 기능이 맞는지)

- [x] 카훗처럼 **여러 사람이 참여**하는 게임 형태
- [x] 같이 식사하는 사람들이 **간편하게 메뉴를 골라서** 결정
- [x] **선정된 메뉴** 기준으로
- [x] **내 위치**를 토대로 **3~5곳** 음식점 추천
- [x] 해당 메뉴의 **가격, 리뷰 점수, 위치** 제공 (API 제공 범위 내)
- [x] 초기 **10~20명** 사용 가정, 사용량 증가 시 확장 가능한 구조

---

## ❓ 실행이 안 될 때

| 증상 | 확인할 것 |
|------|------------|
| **"서버에 연결할 수 없어요"** 얼럿 | 서버(3001)가 꺼져 있어요. **반드시** 터미널에서 루트로 이동한 뒤 `npm run dev:all` 을 실행하세요. (서버만 켜려면 `npm run server`, 그 다음 **다른 터미널**에서 `npm run dev`) |
| `npm run dev` 입력 시 **"Missing script: dev"** | 프로젝트 **루트 폴더**(`260216_2_test`)에서 실행했는지 확인. 루트에서는 `npm run dev` 또는 `npm run client` 사용. |
| 브라우저에서 **localhost:5173** 접속 안 됨 | 터미널에서 **먼저** `npm run dev` 또는 `npm run dev:all`를 실행했는지 확인. 실행 후 터미널에 나온 주소(예: 5173 또는 5174)로 접속. |
| **빈 화면**만 보임 | 백엔드도 켜져 있어야 해요. `npm run dev:all` 사용하거나, 터미널 2개로 `cd server` 후 `npm start` + `npm run dev` 각각 실행. |

---

궁금한 점이나 수정하고 싶은 부분이 있으면 편하게 말해줘!

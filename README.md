# 📋 스펙 복사기 (Spec Clipboard)

취업 준비 중 채용 사이트에 스펙을 반복 입력하는 번거로움을 해결하기 위해 만든 **데스크탑 클립보드 앱**입니다.  
자격증, 학력, 경력, 프로젝트, 교육사항 등 자기소개서 작성에 필요한 정보를 한 곳에 모아두고, 버튼 하나로 복사할 수 있습니다.

<br>

## ✨ 주요 기능

- **항목별 복사** — 자격증 번호, 취득일, 발급기관 등 각 필드를 개별 복사
- **전체 복사** — 프로젝트·경력 등 긴 내용을 한 번에 복사
- **항상 위 고정** — 채용 사이트와 나란히 띄워두고 사용 (📌 ON/OFF 토글)
- **탭 구성** — 자격증 / 기본정보 / 학력 / 경력·봉사 / 프로젝트 / 교육사항
- **추가·수정·삭제** — 앱 내에서 직접 데이터 관리 가능
- **Google 로그인** — 구글 계정으로 간편 로그인
- **클라우드 동기화** — Firebase 기반으로 어느 PC에서든 같은 데이터 접근 가능
- **개인 데이터 보호** — 본인 계정으로 로그인한 데이터만 접근 가능

<br>

## 🚀 설치 및 실행

### 일반 사용자 (설치 파일)

1. [Releases](https://github.com/jihun0423/spec_clipboard_exe/releases) 페이지에서 `Setup.x.x.x.exe` 다운로드
2. 설치 파일 실행 후 설치
3. 앱 실행 → Google 계정으로 로그인
4. 스펙 입력 후 사용

> 💡 **빠른 다운로드**: 브라우저 주소창에 `bit.ly/specclip` 입력하면 바로 다운로드돼요!

### 개발자 (소스 코드)

```bash
git clone https://github.com/jihun0423/spec_clipboard_exe.git
cd spec_clipboard_exe
npm install
npm run start
```

<br>

## 📥 데이터 한 번에 입력하기 (AI 활용)

앱에서 직접 하나씩 입력하는 것도 가능하지만, 스펙이 많다면 **AI를 활용해서 한 번에 입력**하는 게 훨씬 빨라요.

### 1단계: Firebase UID 확인

앱 실행 후 로그인한 상태에서 **Ctrl+Shift+I** → Console 탭에서:
```
UID: 여기에표시됨
```

### 2단계: AI에게 아래 프롬프트 전달

Claude, ChatGPT 등 AI에게 아래 프롬프트를 복사해서 본인 정보와 함께 전달하세요.

```
아래 내 스펙 정보를 보고 seed.js 파일을 작성해줘.

[Firebase 설정]
projectId: (본인 Firebase 프로젝트 ID)
UID: (위에서 확인한 본인 UID)

[자격증]
(자격증명 / 취득일 / 자격번호 / 발급기관 형식으로 입력)

[기본정보]
(이름 한글/영어/한자 등)

[학력]
(학교명 / 재학기간 / 학점 / 장학금 등)

[경력/봉사]
(기관명 / 구분(인턴/봉사) / 기간 / 업무내용)

[프로젝트]
(프로젝트명 / 기간 / 기술스택 / 역할 / 목표 / 성과 / 진행내용 / URL)

[교육사항]
(과목명 / 수강기간 / 성적 / 평점 / 학점 / 과목설명)

위 정보를 아래 seed.js 형식에 맞게 작성해줘.
Firebase에 데이터를 넣는 스크립트야.
작성 후 "node seed.js" 명령어로 실행하면 돼.
```

### 3단계: seed.js 실행

AI가 생성한 `seed.js` 파일을 프로젝트 루트에 저장하고:

```bash
node seed.js
```

실행하면 모든 데이터가 Firebase에 한 번에 입력돼요!

> ⚠️ **주의**: `seed.js`에는 본인의 개인정보와 Firebase UID가 포함되므로 깃허브에 올리지 마세요. `.gitignore`에 `seed.js`가 등록되어 있는지 확인하세요.

<br>

## 📁 파일 구조

```
📦 spec_clipboard_exe
 ┣ 📂 src
 ┃ ┣ 📂 components       # 탭별 컴포넌트
 ┃ ┣ 📂 hooks            # Firebase 커스텀 훅
 ┃ ┣ 📂 pages            # 로그인 페이지
 ┃ ┣ 📄 App.jsx          # 메인 앱
 ┃ ┗ 📄 firebase.js      # Firebase 설정
 ┣ 📄 electron.js        # Electron 메인 프로세스
 ┣ 📄 preload.js         # Electron preload 스크립트
 ┣ 📄 package.json
 └ 📄 README.md
```

<br>

## 📌 사용 방법

1. 앱 실행 후 Google 계정으로 로그인
2. 상단 탭에서 원하는 카테고리 선택
3. **+ 추가** 버튼으로 본인의 스펙 입력 (또는 위의 AI 활용 방법으로 한 번에 입력)
4. 카드를 클릭하면 세부 항목이 펼쳐짐
5. 각 항목 옆 **복사** 버튼 클릭 → `Ctrl+V`로 붙여넣기
6. 📌 버튼으로 항상 위 고정 ON/OFF 가능

<br>

## 🛠️ 기술 스택

| 항목 | 내용 |
|------|------|
| Frontend | React 19, Vite |
| Desktop | Electron |
| Backend | Firebase Firestore |
| Auth | Firebase Authentication (Google) |
| Build | electron-builder |
| OS | Windows |

<br>

## ☁️ 데이터 동기화

Firebase Firestore를 사용하여 데이터를 클라우드에 저장합니다.  
Google 계정으로 로그인하면 어느 PC에서든 동일한 데이터에 접근할 수 있습니다.  
각 사용자의 데이터는 완전히 분리되어 본인만 접근 가능합니다.

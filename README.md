## Campus App (React Native + Firebase)

This repo contains:
- A **React Native (Expo) app** (students/teachers/librarian)
- A **one-time user import script** for Firebase (CSV → Auth + Firestore)

### Prerequisites
- **Node.js 20.19.4 or newer** (Expo SDK 54 / React Native 0.81 require it; older Node may show warnings or fail Metro)
- **npm** (comes with Node)

### 1) App setup
```bash
npm install --legacy-peer-deps
npm run start
```

This project targets **Expo SDK 54** (matches current **Expo Go** from the store). App shell code lives under `src/bootstrap/` (not `src/app/`) so Expo does not treat it as an Expo Router app directory.

### 2) Firebase setup (required)
1. Create a Firebase project
2. Enable **Authentication → Email/Password**
3. Create **Firestore** and **Storage**
4. Copy your Firebase web config into `src/services/firebase/client.ts`

### 3) Import users (Option C)
The import script lives in `tools/import-users`.

1. Create a Firebase service account key JSON.
2. Prepare your CSV with columns:
   `rollNumber,realName,role,classId,tempPassword`

Run:
```bash
cd tools/import-users
npm install
set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\serviceAccount.json
node index.mjs ..\..\data\users.csv
```

### Notes
- Login uses **Roll Number + Password** in the UI, but internally maps to an email: `ROLLNUMBER@campus.local`.
- Public identity uses **Campus Alias** by default.


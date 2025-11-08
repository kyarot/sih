# SIH — Healthcare App (Expo + Express)

A cross-platform healthcare application built with Expo (React Native / Expo Router) as the frontend and Node.js + Express as the backend. This repo contains a mobile/web-capable Expo app and an Express API server used for authentication, appointments, prescriptions, pharmacy inventory, and AI-powered features (speech, embeddings, Pinecone, MistralAI integrations).

## Key features

- Multi-role app: Doctor, Patient, Pharmacy (separate screens and flows)
- Appointments: book, view, and manage appointments
- Video calls and speech features (server controllers for video and speech)
- Pharmacy module: inventory, orders, notifications
- Prescription generation (PDFs) and uploads (Cloudinary integration present)
- AI/embeddings: Pinecone + MistralAI integrations (server scripts for embedding and indexing)
- Firebase authentication and Firestore / Realtime DB usage (see `firebase/` and `server/config/firebase.js`)

## Repo layout (important files/folders)

- `app/` — Expo Router app source: screens, tabs, doctor/patient/pharmacy subfolders
- `server/` — Express backend: controllers, models, routes, config
- `assets/` — fonts & images used by the app
- `scripts/` — developer helper scripts (e.g., `reset-project.js`)
- `locales/` — localization files (en, hi, pa)
- `package.json` — root (frontend) scripts & dependencies
- `server/package.json` — backend scripts & dependencies

## Prerequisites

- Node.js (recommended 18.x or 20.x) and npm
- Git
- PowerShell (Windows) or bash/zsh (macOS/Linux)
- Expo CLI (optional global): npm i -g expo-cli (you can also use `npx expo`)
- For mobile testing: Expo Go app (iOS / Android) or an emulator
- A MongoDB connection string (MongoDB Atlas or self-hosted)
- Firebase service account and project config (if using Firebase features)
- Optional third-party keys: Cloudinary, Pinecone API key, MistralAI/Mistral credentials, Google Cloud Speech key

## Environment variables (recommended)

Create a `.env` file in `server/` (and any other places your setup expects) with keys similar to:

- `PORT` — port for the backend (default 3000)
- `MONGODB_URI` — MongoDB connection string
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` — or the `serviceAccountKey.json` file path used by Firebase Admin
- `CLOUDINARY_URL` or `CLOUDINARY_CLOUD_NAME`/`CLOUDINARY_API_KEY`/`CLOUDINARY_API_SECRET`
- `PINECONE_API_KEY` and `PINECONE_ENVIRONMENT` (if using Pinecone)
- `MISTRALAI_API_KEY` (if using MistralAI)
- Any other provider credentials referenced in `server/config/` or `firebase/`

Note: Do not commit secrets. Keep `serviceAccountKey.json` and `.env` out of version control.

## Quick start — Backend (Express)

Open a terminal (Windows PowerShell example) and run:

```powershell
cd c:\Users\HP\OneDrive\Desktop\code\sih\server
npm install
# Development (auto-restart on changes)
npm run dev

# Or start normally:
npm start
```

The server `package.json` exposes:

- `npm run dev` — nodemon (development)
- `npm start` — node index.js (production)

By default the server uses `index.js` in `server/` as its entry point. If you need to change ports or DB URIs, use environment variables described above.

## Quick start — Frontend (Expo app)

From the project root (where the root `package.json` lives):

```powershell
cd c:\Users\HP\OneDrive\Desktop\code\sih
npm install

# Start Expo dev server (Metro + Expo Router)
npm start

# Or run on a device/emulator directly
npm run android
npm run ios
npm run web
```

Root `package.json` scripts include:
- `start` — `expo start` (launch Metro / Expo dev server)
- `android`, `ios`, `web` — launch for platform
- `reset-project` — helper script located at `scripts/reset-project.js`

Open the Expo devtools in the browser and scan the QR code with Expo Go for quick mobile testing.

## Common development workflow

1. Start backend server: `cd server && npm run dev`
2. Start frontend: from root `npm start`
3. Use devtools/Expo Go to test flows: sign in as doctor/patient/pharmacy and exercise features.

## Environment-specific notes

- Firebase: server expects credentials in `server/config/firebase.js` or a `serviceAccountKey.json`. If you use the JSON key file, add its path to the server `.env` or keep it in `server/` and protect it with gitignore.
- Cloudinary uploads: check `server/config/cloudinaryConfig.js` for expected env keys.
- Pinecone & embeddings: `server/embedding.js` and `server/pineconeClient.js` are present; provide API keys and initialize index before running embedding tasks.

## Troubleshooting

- If Expo fails to start: ensure you installed `node` and `npm` and that the `expo` package version is compatible. Try `npx expo doctor`.
- If backend fails connecting to MongoDB: verify `MONGODB_URI` and network (IP whitelist for Atlas).
- Missing env var errors: check `.env` and `server/config/*` files.
- CORS or networking issues when testing mobile on device: ensure your machine IP is reachable by the device; use `expo start --tunnel` or `--lan` as needed.

## Testing

There are no formal test runners included in the repo by default. For manual testing:

- Backend: hit API routes under `server/routes/` with Postman or curl
- Frontend: use Expo and exercise key flows (auth, appointments, pharmacy orders)

## Contribution

Contributions are welcome. Suggested workflow:

1. Fork / create a new branch
2. Implement small, focused changes and include tests where applicable
3. Open a Pull Request with a clear description of the change

Please follow the existing code style and patterns used in the `app/` and `server/` folders.

## Notes & Security

- This project integrates with several external services — keep credentials private and use environment variables.
- Revisit dependency versions periodically and run security scans for known CVEs.

## Contact

If you need help running the project, include logs and the commands you ran. Happy to help refine this README with more project-specific details (example env files, sample .env, or start scripts).

---
*Generated: brief README created by project assistant — customize further with specific env examples and contributor/license details.*
# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

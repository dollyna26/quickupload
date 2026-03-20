# ⚡ QUICKUPLOAD

A fast, beautiful, and responsive file upload system built with React + Node.js + Multer.

🔗 **Live Demo:** [https://quickupload-orcin.vercel.app/](https://quickupload-orcin.vercel.app/)

---

## ✨ Features

- 📁 Drag & Drop file upload
- 👁 Preview files before uploading (images, video, audio, docs)
- ⚡ Per-file Upload button
- 📊 Real-time upload progress bar
- 🗂 View all saved files from server
- 🗑 Remove individual files
- ✅ Success banner on completion
- 📱 Fully responsive design
- 🎨 Light mode with orangish + off-white theme

---

## 🗂 Supported File Types

| Type | Formats |
|------|---------|
| Images | JPG, PNG, GIF |
| Documents | PDF, DOCX |
| Video | MP4, WEBM |
| Audio | MP3, WAV |

---

## 🛠 Tech Stack

### Frontend
- React (Vite)
- Plain CSS-in-JS (no external UI library)
- Plus Jakarta Sans + Syne fonts

### Backend
- Node.js
- Express.js
- Multer (file handling)
- CORS

---

## 📁 Project Structure

```
quickapp/
├── vite-project/          # React Frontend
│   ├── src/
│   │   ├── App.jsx        # Main component
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── server/                # Node.js Backend
    ├── uploads/           # Uploaded files saved here
    ├── server.js
    └── package.json
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/dollyna26/quickupload.git
cd quickupload
```

### 2. Start Backend

```bash
cd server
npm install
node server.js
```

Server runs at: `http://localhost:5000`

### 3. Start Frontend

```bash
cd vite-project
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload a single file |
| `GET` | `/api/files` | Get all uploaded files |
| `DELETE` | `/api/files/:filename` | Delete a file |

---

## 📸 Preview

> Drop files → Preview → Upload → Saved to server ✅

---

## 👩‍💻 Author

Made with ❤️ and ⚡ speed in mind.

---

## 📄 License

MIT License — free to use and modify.
## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

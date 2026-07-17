# 🏛️ JusticeAI - Legal Advisory Platform

> **AI-Powered Legal Assistance for Everyone**

JusticeAI is an intelligent legal advisory platform that leverages Google's Gemini AI to provide accessible legal guidance, explain rights, recommend authorities, and generate legal documents. Designed to democratize legal knowledge and empower individuals with expert legal insights.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-justiceaii.netlify.app-success?style=for-the-badge)](https://justiceaii.netlify.app/)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Samyak013%2FJusticeAI-blue?logo=github)](https://github.com/Samyak013/JusticeAI)
[![React](https://img.shields.io/badge/React-19.0.1-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.14-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Express.js](https://img.shields.io/badge/Express-4.21.2-000000?logo=express)](https://expressjs.com)

---

## ✨ Features

### 🎯 Core Functionality
- **Case Intake Form** - Submit legal issues with details (description, location, category, language)
- **Advisory Board** - AI-powered legal analysis with 4 specialized agents:
  - 🔍 **Legal Research Agent** - In-depth case analysis and legal precedents
  - ⚖️ **Rights Explainer Agent** - Clear explanation of your legal rights
  - 👨‍⚖️ **Authority Recommendation Agent** - Guidance on which legal authorities to approach
  - 📄 **Document Generator Agent** - Generate templates for legal documents

### 🌍 Multi-Language Support
- English, Marathi, Hindi, Spanish, French, German
- Language-specific voice dictation
- UI translations for better accessibility

### 🎤 Accessibility Features
- **Voice Dictation** - Web Speech API integration for hands-free input
- **Text-to-Speech** - Listen to legal advice (TTS endpoint)
- **Full Responsiveness** - Works seamlessly on desktop, tablet, and mobile

### 💾 Case Management
- **Auto-Save** - Local storage for all case submissions
- **Saved Case Portfolio** - View and revisit previous cases
- **Download Brief** - Export full legal analysis as text file

### 🤖 AI Intelligence
- **Google Gemini Integration** - State-of-the-art AI legal analysis
- **Retry Logic** - Exponential backoff for API rate limiting
- **Fallback System** - Comprehensive legal analysis templates for 60+ issue types
- **Multi-Language Processing** - AI responses in user's preferred language

---

## 🛠️ Technology Stack

### Frontend
- **React 19.0.1** - Modern UI library
- **TypeScript 5.8.2** - Type-safe development
- **Vite 6.2.3** - Lightning-fast dev server & build tool
- **Tailwind CSS 4.1.14** - Utility-first styling
- **Lucide React** - Beautiful icon components
- **Motion 12.23.24** - Smooth animations

### Backend
- **Express.js 4.21.2** - RESTful API server
- **Node.js** - JavaScript runtime
- **Google Gemini AI** - AI legal analysis

### APIs & Services
- **Google Gemini API** (@google/genai 2.4.0) - AI model
- **Web Speech API** - Voice dictation
- **Text-to-Speech API** - Audio output

---

## 📋 Prerequisites

- **Node.js 18+** (Download from [nodejs.org](https://nodejs.org))
- **npm 9+** (comes with Node.js)
- **Google Gemini API Key** (Get free at [Google AI Studio](https://aistudio.google.com/app/apikey))

---

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Samyak013/JusticeAI.git
cd JusticeAI
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**How to get your API Key:**
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key and paste it in the `.env` file

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at **https://justiceaii.netlify.app/**

---

## 📦 Available Scripts

```bash
# Development server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run lint

# Clean build artifacts
npm run clean
```

---

## 💡 Usage Guide

### Submitting a Legal Case
1. Navigate to **Case Intake Form** tab
2. Fill in your legal issue details:
   - Description of your case
   - Location (state/country)
   - Legal category (Consumer, Labor, Property, Housing, etc.)
   - Preferred language
3. Click **Submit Case**
4. View AI analysis from 4 different legal agents

### Voice Dictation
- Click the **microphone icon** next to any text field
- Speak your legal issue (system will auto-detect language if enabled)
- Click stop when finished

### Downloading Your Analysis
- After AI analysis, click **Download Full Brief**
- Saves complete legal analysis as a text file
- Includes insights from all 4 AI agents

### Saving Cases
- All submitted cases auto-save to browser's local storage
- Access saved cases in **Advisory Board** tab
- Delete cases individually or clear all

---

## 🌐 Demo & Deployment

### 🚀 Live Demo
**[🎉 Try JusticeAI Now!](https://justiceaii.netlify.app/)**

Visit the live deployment to explore all features without setup.

### Deployment Options

#### **Option 1: Netlify (Current Deployment)**
✅ Already deployed at: https://justiceaii.netlify.app/
1. Connect GitHub repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`

#### **Option 2: Vercel**
- ✅ Full Node.js support for Express backend
- 1-click deployment with GitHub integration
- [Deploy to Vercel](https://vercel.com/import/project?repo=https://github.com/Samyak013/JusticeAI)

#### **Option 3: Railway or Render**
- ✅ Full-stack Node.js + React hosting
- Environment variable management built-in

#### **Option 4: Docker (Any Cloud)**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📁 Project Structure

```
JusticeAI/
├── src/
│   ├── App.tsx              # Main React component
│   ├── main.tsx             # React entry point
│   ├── index.css            # Global styles
│   ├── types.ts             # TypeScript interfaces
│   ├── data.ts              # Mock data & constants
│   └── components/          # Reusable React components
├── server.ts                # Express backend
├── index.html               # HTML entry point
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.ts       # Tailwind CSS config
├── package.json             # Dependencies & scripts
├── .env                     # Environment variables
└── README.md                # This file
```

---

## 🔧 API Endpoints

### Legal Analysis
```
POST /api/chat
Content-Type: application/json

{
  "agent": "legal-research" | "explain-rights" | "get-authority" | "generate-document",
  "caseDescription": "Your legal issue...",
  "location": "State/Country",
  "category": "Consumer|Labor|Property|Housing|etc",
  "language": "en|hi|mr|es|fr|de"
}
```

### Text-to-Speech
```
POST /api/tts
Content-Type: application/json

{
  "text": "Text to convert to speech",
  "language": "en" | "hi" | "mr"
}
```

---

## 🐛 Troubleshooting

### Issue: "API Key is invalid"
- ✅ Verify your Gemini API key in `.env`
- ✅ Check key hasn't been revoked in Google AI Studio
- ✅ Ensure no extra spaces or quotes around the key

### Issue: "Port 3000 already in use"
```bash
# Kill process on port 3000
npx kill-port 3000
# Then restart
npm run dev
```

### Issue: "Voice dictation not working"
- ✅ Ensure browser supports Web Speech API (Chrome, Edge, Safari)
- ✅ Check microphone permissions
- ✅ Verify speaker volume

### Issue: "AI responses seem generic"
- ✅ API quota might be exhausted
- ✅ Fallback system activates with template responses
- ✅ Restart dev server and try again

---

## 📊 Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Recommended, voice input supported |
| Edge | ✅ Full | Voice input supported |
| Safari | ✅ Full | Limited voice input |
| Firefox | ⚠️ Partial | Voice input not available |

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Use TypeScript for type safety
- Follow existing code style
- Write meaningful commit messages
- Test features before submitting PR

---

## 📄 License

This project is open source and available under the **MIT License**. See [LICENSE](LICENSE) file for details.

---

## 👨‍💼 About the Creator

**Samyak013** - Building AI solutions for legal accessibility

[![GitHub](https://img.shields.io/badge/GitHub-Samyak013-black?logo=github)](https://github.com/Samyak013)
[![Project](https://img.shields.io/badge/Project-JusticeAI-blue)](https://github.com/Samyak013/JusticeAI)

---

## 🙋 Support & Feedback

Have questions or suggestions? 
- 🐛 Open an [Issue](https://github.com/Samyak013/JusticeAI/issues)
- 💬 Start a [Discussion](https://github.com/Samyak013/JusticeAI/discussions)
- 📧 Contact via GitHub

---

## 🎯 Roadmap

- [ ] Multi-language AI model support
- [ ] Case history analytics
- [ ] Lawyer network integration
- [ ] Document signing integration
- [ ] Mobile app (React Native)
- [ ] Advanced case search
- [ ] Client-lawyer chat system

---

## ⚖️ Legal Disclaimer

JusticeAI provides general legal information and guidance. It is not a substitute for professional legal advice. Always consult with a qualified attorney for specific legal matters. The creators are not responsible for any consequences of information provided by this platform.

---

**Made with ❤️ for accessible legal knowledge | © 2024 JusticeAI**

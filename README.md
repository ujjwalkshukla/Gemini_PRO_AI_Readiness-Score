# AI Readiness Score Tool

App Here: [View App](https://ujjwalkshukla.github.io/Gemini_PRO_AI_Readiness-Score/)

A professional, domain-adaptive tool that evaluates your resume against the requirements of the AI-driven workforce. Grounded entirely in your resume evidence, it uses **Gemini 3 Pro** to perform a strict audit of your skills.

## 🚀 Features

- **Domain Detection**: Automatically identifies your professional field (e.g., Data Science, Marketing, Software Engineering).
- **Strict Gap Analysis**: Uses a two-phase prompting strategy to define objective industry standards before evaluating your resume.
- **Evidence-Based Scoring**: Scores are directly linked to quotes and evidence found in your uploaded resume.
- **Custom Criterion Evaluation**: Ask specific questions (e.g., "Am I ready for a Lead AI Architect role?") for deeper analysis.
- **Persistence**: Uses **Dexie.js** for client-side storage, allowing you to re-examine results without re-uploading.
- **Privacy First**: All processing happens in memory or local storage.

## 🛠️ Tech Stack

- **Frontend**: React (ESM via esm.sh)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI Engine**: Google Gemini API (Gemini 3 Pro & Gemini 3 Flash)
- **Database**: Dexie.js (IndexedDB wrapper)
- **PDF Extraction**: PDF.js
- **Vibe Coding Tool**:Google AI Studio

## 🚦 Getting Started

### 1. Configure the API Key
Ensure you have a valid Google Gemini API Key. The application expects this to be available via `process.env.API_KEY`.

### 2. GitHub Sync
To push this project to GitHub:

```bash
# Initialize git
git init

# Add remote (create a repo on GitHub first)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Stage and commit
git add .
git commit -m "Initial commit: AI Readiness Tool"

# Push
git branch -M main
git push -u origin main
```

## 📄 License
MIT

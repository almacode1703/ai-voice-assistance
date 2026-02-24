# 🎙️ AI Voice Assistant

A smart AI-powered voice assistant application with chat, voice calling, and intelligent feedback analysis features.

> **Created by Barath & Rayhan** - School Project 2026

---

## 📚 Table of Contents

- [What Does This App Do?](#what-does-this-app-do)
- [Before You Start](#before-you-start)
- [Step 1: Download the Project](#step-1-download-the-project)
- [Step 2: Install Required Software](#step-2-install-required-software)
- [Step 3: Set Up the Backend](#step-3-set-up-the-backend)
- [Step 4: Set Up the Frontend](#step-4-set-up-the-frontend)
- [Step 5: Run the Application](#step-5-run-the-application)
- [Step 6: Open in Your Browser](#step-6-open-in-your-browser)
- [Troubleshooting](#troubleshooting)
- [Project Structure](#project-structure)
- [Features](#features)
- [Technologies Used](#technologies-used)

---

## 🤔 What Does This App Do?

This AI Voice Assistant can:

- 💬 **Chat with AI** - Have text conversations with an intelligent AI assistant
- 📞 **Voice Calling** - Talk to the AI using your voice (speech-to-text and text-to-speech)
- 📝 **Feedback Collection** - Collect customer feedback from users
- 🧠 **AI Analysis** - Analyze feedback sentiment and improve text quality
- 📊 **Generate Reports** - Create beautiful PDF invoices and reports

---

## 🎯 Before You Start

Make sure you have:

- ✅ A computer with Windows, Mac, or Linux
- ✅ Internet connection
- ✅ At least 2GB of free disk space
- ✅ Basic knowledge of opening folders and files

---

## 📥 Step 1: Download the Project

### Method A: Using Git (Recommended)

1. **Open Command Prompt (Windows) or Terminal (Mac/Linux)**
   - Windows: Press `Win + R`, type `cmd`, press Enter
   - Mac: Press `Cmd + Space`, type `terminal`, press Enter

2. **Navigate to where you want to save the project**
   ```bash
   cd Desktop
   ```

3. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/voice_assistance_ai.git
   ```

4. **Go into the project folder**
   ```bash
   cd voice_assistance_ai
   ```

### Method B: Download ZIP

1. Go to your GitHub repository in a web browser
2. Click the green **"Code"** button
3. Click **"Download ZIP"**
4. Extract the ZIP file to your Desktop
5. Rename the folder to `voice_assistance_ai`

---

## 🛠️ Step 2: Install Required Software

You need to install 3 main things:

### 2.1 Install Python (for Backend)

1. **Download Python**
   - Go to: https://www.python.org/downloads/
   - Download Python 3.10 or newer

2. **Install Python**
   - ⚠️ **IMPORTANT**: Check the box that says **"Add Python to PATH"**
   - Click "Install Now"
   - Wait for installation to complete

3. **Verify Installation**
   ```bash
   python --version
   ```
   - You should see something like: `Python 3.10.0` or higher

### 2.2 Install Node.js (for Frontend)

1. **Download Node.js**
   - Go to: https://nodejs.org/
   - Download the **LTS (Long Term Support)** version

2. **Install Node.js**
   - Run the installer
   - Click "Next" through all the steps
   - Wait for installation to complete

3. **Verify Installation**
   ```bash
   node --version
   npm --version
   ```
   - You should see version numbers for both

### 2.3 Install VS Code (Code Editor)

1. **Download VS Code**
   - Go to: https://code.visualstudio.com/
   - Click "Download for [Your OS]"

2. **Install VS Code**
   - Run the installer
   - ✅ Check "Add to PATH"
   - Complete the installation

3. **Open VS Code**
   - Launch VS Code
   - Go to File → Open Folder
   - Select the `voice_assistance_ai` folder you downloaded

---

## 🐍 Step 3: Set Up the Backend

The backend is the "brain" of the application written in Python.

### 3.1 Open Terminal in VS Code

1. In VS Code, click **Terminal** → **New Terminal**
2. A terminal window will open at the bottom

### 3.2 Navigate to Backend Folder

```bash
cd backend
```

### 3.3 Create a Virtual Environment (Optional but Recommended)

This keeps your project dependencies separate from other Python projects.

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**On Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

You should see `(venv)` appear in your terminal.

### 3.4 Install Python Dependencies

```bash
pip install -r requirements.txt
```

This will install all the required Python packages. It might take 2-3 minutes.

### 3.5 Set Up Environment Variables

You need an OpenAI API key to make the AI work.

1. **Get Your OpenAI API Key**
   - Go to: https://platform.openai.com/api-keys
   - Sign up or log in
   - Click "Create new secret key"
   - Copy the key (it looks like: `sk-proj-...`)
   - ⚠️ **Save it somewhere safe! You can't see it again!**

2. **Create a `.env` file**
   - In the `backend` folder, you'll see a file named `.env`
   - Open it in VS Code
   - It should look like this:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

3. **Add Your API Key**
   - Replace `your_api_key_here` with your actual OpenAI API key
   - Save the file (Ctrl+S or Cmd+S)

**Example:**
```
OPENAI_API_KEY=sk-proj-ABC123XYZ456...
```

---

## ⚛️ Step 4: Set Up the Frontend

The frontend is the "face" of the application (what you see in the browser).

### 4.1 Open a New Terminal

1. In VS Code, click the **+** icon in the terminal to open a new terminal
2. Or go to Terminal → New Terminal

### 4.2 Navigate to Frontend Folder

```bash
cd frontend
```

### 4.3 Install Node.js Dependencies

```bash
npm install
```

This will install all the required JavaScript packages. It might take 3-5 minutes.

⏳ **Be patient!** This step downloads a lot of files.

---

## 🚀 Step 5: Run the Application

You need to run BOTH the backend and frontend at the same time!

### 5.1 Start the Backend Server

1. **Open Terminal 1** (or create a new one)
2. Navigate to backend:
   ```bash
   cd backend
   ```
3. Activate virtual environment if you created one:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`
4. Start the backend:
   ```bash
   uvicorn main:app --reload
   ```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

✅ **Success!** Your backend is running on **http://localhost:8000**

⚠️ **Keep this terminal open!** Don't close it.

### 5.2 Start the Frontend Server

1. **Open Terminal 2** (click the + icon to create another terminal)
2. Navigate to frontend:
   ```bash
   cd frontend
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```

You should see:
```
  ▲ Next.js 16.1.6
  - Local:        http://localhost:3000
```

✅ **Success!** Your frontend is running on **http://localhost:3000**

⚠️ **Keep this terminal open too!** Don't close it.

---

## 🌐 Step 6: Open in Your Browser

1. **Open your web browser** (Chrome, Firefox, Edge, Safari)
2. **Go to:** http://localhost:3000
3. **You should see the homepage!** 🎉

---

## 🎨 Using the Application

### Home Page
- Enter a store name, product, and details
- Click "Start Enquiry" to begin

### Mode Selection
- Choose **"Continue as Chat"** for text-based conversation
- Choose **"Start Voice Call"** for voice conversation

### Chat Mode
- Type your messages in the chat box
- The AI will respond to your questions

### Voice Mode
- Click the microphone button to start talking
- The AI will listen, understand, and respond with voice
- Click the hang-up button to end the call

### Feedback Page
- Users can submit feedback
- AI analyzes the sentiment (positive/neutral/negative)
- AI improves the text quality
- Generate PDF reports

---

## 🐛 Troubleshooting

### Problem: "Python is not recognized"

**Solution:**
- Reinstall Python and make sure to check **"Add Python to PATH"**
- Or manually add Python to your PATH environment variable

### Problem: "npm is not recognized"

**Solution:**
- Reinstall Node.js
- Restart your terminal/VS Code after installation

### Problem: "Module not found" errors

**Backend Solution:**
```bash
cd backend
pip install -r requirements.txt
```

**Frontend Solution:**
```bash
cd frontend
npm install
```

### Problem: Backend won't start (Port 8000 already in use)

**Solution:**
- Another program is using port 8000
- Find and close that program, or use a different port:
```bash
uvicorn main:app --reload --port 8001
```

### Problem: Frontend won't start (Port 3000 already in use)

**Solution:**
- Another program is using port 3000
- Kill the process or use a different port:
```bash
npm run dev -- --port 3001
```

### Problem: "OpenAI API key is invalid"

**Solution:**
- Check your `.env` file in the backend folder
- Make sure your API key is correct
- Make sure there are no extra spaces
- Get a new API key from OpenAI if needed

### Problem: Voice features don't work

**Solution:**
- Voice features only work in **Google Chrome** or **Microsoft Edge**
- Make sure your microphone is connected and allowed
- Check browser permissions for microphone access

---

## 📁 Project Structure

```
voice_assistance_ai/
│
├── backend/                    # Python backend (FastAPI)
│   ├── main.py                # Main backend file
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Environment variables (API keys)
│   └── invoices/              # Generated PDF invoices
│
├── frontend/                   # Next.js frontend (React)
│   ├── app/                   # Application pages
│   │   ├── page.tsx           # Home page
│   │   ├── mode/              # Mode selection page
│   │   ├── chat/              # Chat interface
│   │   ├── voice/             # Voice call interface
│   │   ├── call/              # Voice call page
│   │   ├── feedback/          # Feedback collection
│   │   └── enquiry/           # Enquiry form
│   ├── package.json           # Node.js dependencies
│   └── public/                # Static files (images, etc.)
│
├── presentations/              # Presentation guides
│   ├── BARATH_PRESENTATION.md # Barath's presentation guide
│   └── RAYHAN_PRESENTATION.md # Rayhan's presentation guide
│
└── README.md                  # This file!
```

---

## ✨ Features

### 🎯 Core Features
- **Real-time Chat** - Instant messaging with AI assistant
- **Voice Recognition** - Speech-to-text conversion
- **Voice Synthesis** - Text-to-speech responses
- **Sentiment Analysis** - Detect positive/neutral/negative feedback
- **Text Improvement** - AI-powered grammar and professionalization
- **PDF Generation** - Create beautiful invoices and reports

### 🎨 UI/UX Features
- **Responsive Design** - Works on all screen sizes
- **Smooth Animations** - Framer Motion animations
- **Modern Interface** - Glassmorphism design
- **Dark Theme** - Easy on the eyes
- **Loading States** - User-friendly loading indicators
- **Error Handling** - Graceful error messages

---

## 🔧 Technologies Used

### Backend
- **Python 3.10+** - Programming language
- **FastAPI** - Modern web framework
- **OpenAI GPT-4** - AI language model
- **ReportLab** - PDF generation
- **Uvicorn** - ASGI server

### Frontend
- **Next.js 16** - React framework
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Animation library
- **Heroicons** - Icon library
- **Web Speech API** - Voice recognition & synthesis

### APIs & Services
- **OpenAI API** - GPT-4 for chat and GPT-4o-mini for feedback analysis
- **Web Speech API** - Browser-based voice features

---

## 📞 Need Help?

### For Teachers/Mentors
If you're helping Barath and Rayhan with this project:
1. Make sure both backend and frontend are running
2. Check that API keys are properly configured
3. Verify internet connection is stable
4. Test voice features in Chrome or Edge

### For Students
If something isn't working:
1. Read the error message carefully
2. Check the troubleshooting section above
3. Make sure both terminals are still running
4. Try restarting both servers
5. Ask your teacher or mentor for help

---

## 🎓 Learning Resources

Want to learn more about the technologies used?

- **Python**: https://www.python.org/about/gettingstarted/
- **FastAPI**: https://fastapi.tiangolo.com/tutorial/
- **React**: https://react.dev/learn
- **Next.js**: https://nextjs.org/learn
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## 📜 License

This is a school project created for educational purposes.

---

## 🙏 Acknowledgments

- **OpenAI** - For providing the GPT API
- **Next.js Team** - For the amazing React framework
- **FastAPI Team** - For the modern Python web framework
- **Our Teachers** - For guiding us through this project

---

## 🎉 Congratulations!

If you've made it this far, you should have a working AI Voice Assistant!

Have fun exploring the features and showing it to your classmates!

**Made with ❤️ by Barath & Rayhan**

---

## 📝 Quick Reference Commands

### Backend Commands
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Commands
```bash
cd frontend
npm install
npm run dev
```

### Stop the Servers
- Press `Ctrl + C` in each terminal window
- This will stop both the backend and frontend

---

**Happy Coding! 🚀**

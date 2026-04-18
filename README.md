# 🏏 IPL Fan Zone — Real-Time Engagement Platform

A production-grade, real-time IPL fan engagement platform featuring live match tracking, interactive community chat, and AI-driven commentary.

![IPL Fan Zone Preview](https://via.placeholder.com/800x450/080c14/6366f1?text=IPL+Fan+Zone+Live+2026)

## 🚀 Features

### 📺 Live Match Experience
- **Real-Time Scores**: Strictly live data scraped from Cricbuzz, providing the most accurate source of truth for match status, scores, and schedules.
- **Interactive Ticker**: A smooth, marquee-style ticker for live updates. Hover over the ticker to pause and read specific match details.
- **Dynamic Double-Headers**: Automatic support for single and double-header match days, merging live data with priority-based status detection (LIVE > COMPLETED > UPCOMING).

### 🤖 AI-Driven Insights
- **Gemini AI Commentator**: Integrated AI that analyzes live match events (Sixes, Wickets, Milestones) and provides witty, real-time commentary for fans.
- **Match Summaries**: Automated event analysis to keep the community engaged.

### 👥 Community & Engagement
- **Fan Chat Rooms**: Join dedicated rooms for every live match to chat with other fans.
- **Live Reactions**: Burst reactions (Six!, Wicket!, Shocked!) that sync across all connected clients via WebSockets.
- **Team Personalization**: Onboarding flow where fans choose their favorite team, influencing the UI theme and badges.

### 🎨 Modern UI/UX
- **Themed Experience**: Support for both **Dark** and **Light** modes with smooth transitions.
- **Glassmorphism Design**: A premium, state-of-the-art interface with vibrant colors and fluid animations.
- **Mobile Responsive**: Fully optimized for fans watching on the go.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), CSS3 (Vanilla + Glassmorphism), Lucide Icons.
- **Backend**: Node.js, Express.
- **Real-Time**: Socket.io (WebSockets).
- **AI**: Google Gemini API.
- **Data Source**: Custom scraper (Axios/HTTPS + Regex parsing) for Cricbuzz live feeds.

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- Gemini API Key (for AI features)

### 1. Clone & Install
```bash
git clone https://github.com/your-username/ipl-fan-zone.git
cd ipl-fan-zone
npm run install:all
```

### 2. Environment Configuration
Create a `.env` file in the `server` directory:
```env
PORT=3001
GEMINI_API_KEY=your_api_key_here
```

### 3. Start Development Servers
Run both frontend and backend concurrently:
```bash
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

---

## ☁️ Deployment

### GitHub Actions
The project is structure-ready for GitHub Actions. Ensure you add `GEMINI_API_KEY` to your repository secrets.

### Google Cloud Run
To deploy to Cloud Run:
1. Build the Docker image.
2. Push to Google Container Registry.
3. Deploy with environment variables for the API key.

---

## 📝 Design Decisions
- **Data Integrity**: Chose a "Real-World First" architecture. All match data is scraped live, eliminating mock data discrepancies.
- **Performance**: Used high-performance CSS animations for the ticker and optimized socket events to handle high-frequency reactions.
- **Accessibility**: Implemented a "Pause on Hover" feature for the marquee to improve readability for all users.

---

## 🤝 Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements.

## 📄 License
This project is licensed under the MIT License.

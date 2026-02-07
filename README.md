# 🎓 MentraAI - Your Personal AI Learning Mentor

An intelligent AI-powered learning platform designed specifically for Indian students. MentraAI provides personalized exam preparation, career guidance, and study assistance - all explained simply in **Hinglish**.

![Next.js](https://img.shields.io/badge/Next.js-14.0-black?logo=next.js)
![React](https://img.shields.io/badge/React-18.2-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)

---

## ✨ Features

### 🤖 AI Chat Mentor
- **Smart Conversations**: Natural language chat with context awareness
- **Multilingual Support**: English, Hinglish, and Gujarati
- **Streaming Responses**: Real-time AI responses with typing indicators
- **Voice Input**: Speak your questions naturally
- **Image Analysis**: Upload images for AI-powered explanations

### � Study Tools

#### 💡 Confusion → Clarity
- Transform complex topics into simple explanations
- Visual diagrams and flowcharts
- Step-by-step breakdowns
- Real-world examples

#### ⏱️ 2-Minute Concepts
- Quick concept explanations
- Core ideas, examples, and takeaways
- Perfect for last-minute revision

#### � Deep Dive Mode
- Comprehensive topic exploration
- Why it matters
- Common mistakes
- Memory tricks

#### 📝 Smart Notes
- AI-enhanced note-taking
- Automatic summarization
- Concept extraction
- Organized by topics

### 🎯 Exam Preparation

#### 📅 AI Exam Planner
- Personalized study schedules
- Subject-wise time allocation
- Daily study hour optimization
- Countdown to exam date

#### 🎮 Quiz Battle Arena
- AI-generated quizzes on any topic
- Multiple difficulty levels (Easy, Medium, Hard)
- Customizable question count (5, 10, 15, 20)
- Timer options (30s, 1m, 1.5m, 2m, or no timer)
- Real-time leaderboard with XP system
- Subject-wise performance tracking
- Instant feedback with explanations

### 🚀 Career Guidance
- Personalized career roadmaps
- Skill gap analysis
- Industry insights
- Step-by-step action plans

### 📊 Gamification
- **XP System**: Earn points for learning activities
- **Leaderboard**: Compete with other students
- **Achievements**: Unlock badges and milestones
- **Streak Tracking**: Daily engagement rewards
- **Level Progression**: Visual progress indicators

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts

### Backend
- **API**: Next.js API Routes (Serverless)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime subscriptions

### AI Integration
- **Google Gemini**: Primary AI provider
- **OpenAI**: GPT models for specialized tasks
- **Azure OpenAI**: Enterprise-grade AI services
- **GROQ**: High-speed inference

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **Supabase** account (free tier)
- **AI API Keys** (Gemini/OpenAI/GROQ)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/mentraai.git
cd mentraai
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Providers (at least one required)
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
GROQ_API_KEY=your_groq_api_key
AZURE_OPENAI_API_KEY=your_azure_openai_key

# Azure OpenAI (if using)
AZURE_OPENAI_ENDPOINT=your_azure_endpoint
AZURE_OPENAI_DEPLOYMENT_NAME=your_deployment_name
```

4. **Set up Supabase Database**

Run the SQL migrations in your Supabase project:
- Navigate to SQL Editor in Supabase Dashboard
- Execute the migration files from `supabase/migrations/`

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```
mentraai/
├── app/                        # Next.js App Router
│   ├── api/                   # API endpoints
│   │   ├── chat/             # Chat endpoints (normal, 2min, deep-dive, weakness)
│   │   ├── quiz/             # Quiz generation
│   │   ├── career/           # Career planning
│   │   ├── exam-planner/     # Study schedule generation
│   │   └── history/          # Chat history management
│   ├── auth/                 # Authentication pages
│   │   ├── login/
│   │   ├── signup/
│   │   └── callback/         # Auth callback handler
│   ├── dashboard/            # Protected dashboard routes
│   │   ├── page.tsx          # Main chat interface
│   │   ├── quiz/             # Quiz module
│   │   ├── career/           # Career planning
│   │   ├── exam-planner/     # Exam preparation
│   │   ├── notes/            # Note-taking
│   │   ├── analytics/        # Learning analytics
│   │   └── profile/          # User profile & settings
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing page
├── components/               # Reusable UI components
│   ├── ui/                   # Base UI components
│   ├── quiz/                 # Quiz-specific components
│   ├── dashboard/            # Dashboard components
│   └── profile/              # Profile components
├── contexts/                 # React Context providers
│   └── UserContext.tsx       # User state management
├── hooks/                    # Custom React hooks
│   ├── useAutoSave.ts        # Auto-save functionality
│   └── useResetWithUndo.ts   # Undo/redo logic
├── lib/                      # Utility functions
│   ├── supabase/             # Supabase client & server
│   ├── utils/                # Helper functions
│   │   ├── history.ts        # Chat history utilities
│   │   └── leaderboard.ts    # Leaderboard logic
│   ├── language.ts           # Multilingual support
│   └── azure/                # Azure OpenAI integration
├── styles/                   # Global styles
│   └── globals.css           # Tailwind + custom CSS
└── supabase/                 # Database
    ├── migrations/           # SQL migrations
    └── README.md             # Database setup guide
```

---

## 🎨 Design Philosophy

MentraAI is designed to be **addictive** and **premium**, focusing on student engagement through:

- **Dark Mode Centric**: Aurora gradients and glassmorphism effects
- **Smooth Animations**: Framer Motion for micro-interactions
- **Gamification**: XP, levels, achievements, and leaderboards
- **Hinglish First**: Natural language mixing for Indian students
- **Mobile-First**: Responsive design for all devices

---

## 🔐 Authentication & Security

- **Supabase Auth**: Secure email/password authentication
- **Row Level Security (RLS)**: Database-level access control
- **JWT Tokens**: Secure session management
- **Environment Variables**: Sensitive data protection
- **Input Validation**: Prevents injection attacks

---

## 📊 Database Schema

### Core Tables

- **users**: User profiles (linked to Supabase Auth)
- **history**: Chat history and session data
- **user_progress**: XP, levels, achievements
- **leaderboard**: Real-time quiz rankings
- **notes**: User-created study notes
- **career_plans**: Generated career roadmaps
- **exam_plans**: Personalized study schedules

See [design.md](./design.md) for complete schema documentation.

---

## 🧪 Testing

### Build Test
```bash
npm run build
```

### Development Server
```bash
npm run dev
```

### Linting
```bash
npm run lint
```

---

## � Deployment

### Vercel (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connect to Vercel**
- Import your GitHub repository
- Vercel auto-detects Next.js
- Add environment variables in Vercel dashboard

3. **Environment Variables**
Add all variables from `.env.local` to Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `OPENAI_API_KEY`
- `GROQ_API_KEY`
- etc.

4. **Deploy**
Vercel will automatically build and deploy your app.

---

## 🌐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ Yes |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google Gemini API key | ⚠️ One AI provider required |
| `OPENAI_API_KEY` | OpenAI API key | ⚠️ One AI provider required |
| `GROQ_API_KEY` | GROQ API key | ⚠️ One AI provider required |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI key | ❌ Optional |
| `AZURE_OPENAI_ENDPOINT` | Azure endpoint | ❌ Optional |
| `AZURE_OPENAI_DEPLOYMENT_NAME` | Azure deployment | ❌ Optional |

---

## 📖 Documentation

- **[Design Document](./design.md)**: System architecture and design decisions
- **[Requirements Document](./requirements.md)**: Functional and technical requirements
- **[Supabase Setup](./supabase/README.md)**: Database configuration guide

---

## 🎯 Key Features Explained

### Chat Interface
The main dashboard (`/dashboard`) provides an intelligent chat interface with:
- **Empty State Cards**: Quick-start suggestions for common tasks
- **Message History**: Persistent chat sessions
- **Smart Suggestions**: Context-aware follow-up questions
- **Source Tracking**: Know if responses are from database or AI

### Quiz System
Advanced quiz generation with:
- **Topic-Based**: Generate quizzes on any subject
- **Exam-Based**: Multi-subject exam preparation
- **Adaptive Difficulty**: Easy, Medium, Hard levels
- **Timed Challenges**: Configurable timers per question
- **Performance Analytics**: Subject-wise scoring

### Gamification Engine
Engagement mechanics include:
- **XP Calculation**: Points for correct answers and streaks
- **Real-time Leaderboard**: Live updates via Supabase Realtime
- **Achievement System**: Unlock badges for milestones
- **Progress Visualization**: Charts and graphs

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards
- Follow TypeScript best practices
- Use ESLint configuration
- Write meaningful commit messages
- Update documentation for new features

---

## 🐛 Troubleshooting

### Build Errors

**Error**: `useSearchParams() should be wrapped in a suspense boundary`
- **Solution**: Already fixed! Quiz page uses proper Suspense boundaries.

**Error**: `Supabase client not available`
- **Solution**: Check `.env.local` has correct Supabase credentials.

**Error**: `AI API key missing`
- **Solution**: Add at least one AI provider API key to `.env.local`.

### Development Issues

**Port 3000 already in use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
npm run dev
```

**Database connection failed**
- Verify Supabase URL and key
- Check Supabase project is active
- Ensure RLS policies are configured

---

## 👥 Team

- **Developer**: Tanis Bedia
- **Designer**: Jay Kalathiya

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a service
- [Google Gemini](https://ai.google.dev/) - AI model
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Vercel](https://vercel.com/) - Deployment platform

---

## 📞 Support

For questions or issues:
- 📧 Email: mentraai012@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/Tanish01234/Mentra-AI)

---

**Built with ❤️ for Indian students**

*Empowering the next generation of learners through AI*

---

## 🎓 For Students

MentraAI is **free to use** for students. We believe education should be accessible to everyone.

### How to Get Started
1. Sign up at [https://mentra-ai-plum.vercel.app](https://mentra-ai-plum.vercel.app/)
2. Complete your profile
3. Start chatting with your AI mentor
4. Explore quizzes, career planning, and study tools

### Tips for Best Results
- Be specific with your questions
- Use voice input for natural conversations
- Try different difficulty levels in quizzes
- Check the leaderboard for motivation
- Review your analytics regularly

---

*Last updated: February 7, 2026*

# MentraAI – Requirements Document

## 1. Project Overview

MentraAI is an AI-powered academic mentor designed for Indian students.  
It combines emotional intelligence, stress analytics, adaptive learning, and multilingual support to provide personalized academic guidance.

The system tracks student mood, stress levels, study patterns, and quiz performance to generate intelligent insights and recommendations.

---

## 2. Problem Statement

Students in India face:

- High academic pressure
- Career confusion after 10th/12th
- Exam stress and anxiety
- Language barriers (English-only tools)
- Lack of personalized mentorship

Existing tools are either:
- Static learning platforms
- Generic AI chatbots
- Non-emotion-aware systems

There is no integrated AI mentor that:
- Understands student mood
- Tracks stress trends
- Adapts responses dynamically
- Generates learning analytics automatically

---

## 3. Proposed Solution

MentraAI provides:

- AI Mentor Chat (Gemini + GROQ fallback)
- Mood-aware responses
- Stress index tracking
- Quiz engine with mastery tracking
- Weak area detection
- Study analytics dashboard
- Personalized AI insights
- Multilingual support (English, Hinglish, Gujarati)

---

## 4. Core Features

### 4.1 AI Chat Mentor
- Real-time AI conversation
- Emotional tone adaptation
- Topic detection
- Career & exam guidance

### 4.2 Stress & Mood Tracking
- Stress score (0–100)
- Mood trend (7-day graph)
- Focus score
- Daily engagement tracking

### 4.3 Quiz Engine
- Topic-based quiz generation
- Auto scoring
- Mastery percentage calculation
- Weak topic identification

### 4.4 Learning Analytics
- Total study time
- Concepts mastered
- Current streak
- Exam readiness %
- Weak areas breakdown

### 4.5 AI Insights Engine
- Personalized recommendations
- Motivational feedback
- Targeted improvement suggestions

---

## 5. Functional Requirements

### Authentication
- Supabase authentication
- Google OAuth
- User-based isolated data

### Chat System
- Store chat history
- Detect mood & topics
- Stream AI response
- Gemini primary, GROQ fallback

### Analytics
- Auto-update after chat
- Auto-update after quiz
- Daily stats logging
- Topic mastery calculation

### Dashboard
- Real-time stats display
- Mood graph
- Weak areas cards
- Mini performance stats

---

## 6. Non-Functional Requirements

- Scalable architecture
- Secure authentication
- Modular backend design
- Real-time responsiveness
- Clean SaaS UI (dark-first glass design)
- Production-ready API structure

---

## 7. Target Users

- Students (9th–12th)
- Competitive exam aspirants
- College students
- Career decision stage learners

---

## 8. Technology Stack

Frontend:
- Next.js
- Tailwind CSS
- Glass UI system

Backend:
- Node.js (Express)
- Supabase (Postgres + Auth)
- Gemini API
- GROQ API

---

## 9. Future Scope

- Badge & achievement system
- AI career roadmap generator
- Study planner auto scheduling
- Voice input
- PDF analytics export
- Mobile app

---

## 10. Expected Outcome

MentraAI aims to become:

“India’s AI Mentor with Emotional Intelligence”

An adaptive, data-driven, emotion-aware learning OS for students.

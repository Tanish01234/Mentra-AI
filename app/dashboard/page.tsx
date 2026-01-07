'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import ConceptCard from '@/components/ConceptCard'
import WeaknessSummaryCard from '@/components/WeaknessSummaryCard'
import UndoToast from '@/components/UndoToast'
import VoiceButton from '@/components/VoiceButton'
import VoiceInput from '@/components/VoiceInput'
import DeepDiveCard from '@/components/DeepDiveCard'
import { useAutoSave, restoreDraft } from '@/hooks/useAutoSave'
import { useResetWithUndo } from '@/hooks/useResetWithUndo'
import { useUser } from '@/contexts/UserContext'
import { useLanguage } from '@/lib/language'
import {
  saveHistory,
  getOrCreateHistorySessionId,
  clearHistorySessionId,
  getHistoryBySession,
  generateTitle
} from '@/lib/utils/history'
import { parseAIResponse } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  confidence?: 'high' | 'medium' | 'low'
  askBackQuestion?: string
  suggestedActions?: string[]
  type?: 'normal' | 'concept' | 'weakness' | 'deep-dive'
  conceptData?: {
    concept: string
    example: string
    takeaway: string
    topic?: string
  }
  weaknessData?: {
    weakAreas: string[]
    whyWeak: string
    nextActions: string[]
    confidence: 'high' | 'medium' | 'low'
  }
  deepDiveData?: {
    overview: string
    whyItMatters: string
    stepByStep: string[]
    example: string
    commonMistakes: string[]
    memoryTrick: string
    takeaway: string
  }
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isDeepDiveMode, setIsDeepDiveMode] = useState(false)

  const { user, firstName } = useUser()
  const { selectedLanguage, setLanguage, handleVoiceInput: processVoice } = useLanguage()

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Use history session ID
  const sessionIdRef = useRef<string>('')

  // Initialize session ID
  useEffect(() => {
    sessionIdRef.current = getOrCreateHistorySessionId()
  }, [])

  // Auto-save input draft
  const [clearDraft] = useAutoSave({
    key: 'chat-input-draft',
    value: input,
    debounceMs: 2500,
    enabled: !!input.trim()
  })

  // Reset with undo
  const {
    state: resetState,
    setState: setResetState,
    reset: resetChat,
    undo: undoReset,
    showUndo,
    dismissUndo
  } = useResetWithUndo<{ input: string; messages: Message[] }>({
    initialState: { input: '', messages: [] },
    onReset: (state) => {
      setInput(state.input)
      setMessages(state.messages)
    }
  })

  // Load existing history on session init
  useEffect(() => {
    const initSession = async () => {
      if (user && sessionIdRef.current) {
        // Try to load existing history for this session
        const history = await getHistoryBySession(supabase, user.id, sessionIdRef.current)
        if (history && history.content && Array.isArray(history.content.messages)) {
          // Convert string timestamps back to Date objects if needed
          const loadedMessages = history.content.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
          setMessages(loadedMessages)
        }
      }
    }
    initSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Restore draft on mount
  useEffect(() => {
    const saved = restoreDraft<string>('chat-input-draft')
    if (saved && !input) {
      setInput(saved)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const analyzeIntent = async (text: string): Promise<'greeting' | 'study' | 'stress' | 'command'> => {
    const lowerText = text.toLowerCase()
    const greetingPatterns = ['hi', 'hello', 'hey', 'namaste', 'kaise ho', 'kya haal', 'sup', 'yo']
    if (greetingPatterns.some(pattern => lowerText.includes(pattern))) return 'greeting'

    const commandPatterns = ['explain in 2 minutes', 'analyze', 'bana de', 'fix kar', 'short me']
    if (commandPatterns.some(pattern => lowerText.includes(pattern))) return 'command'

    const stressPatterns = ['samajh nahi', 'confused', 'darr', 'tension', 'yaad nahi', 'marks kam']
    if (stressPatterns.some(pattern => lowerText.includes(pattern))) return 'stress'

    return 'study'
  }

  const handleVoiceTranscript = async (text: string) => {
    if (!text.trim()) return
    const voiceResult = processVoice(text)
    setInput(voiceResult.text)
    const intent = await analyzeIntent(text)
    if (intent === 'greeting' || intent === 'command') {
      setTimeout(() => {
        handleSend()
      }, 500)
    }
  }

  const executeDeepDive = async (currentMessages: Message[]) => {
    try {
      const response = await fetch('/api/chat/deep-dive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: currentMessages.map(m => ({
            role: m.role,
            content: m.content
          })),
          language: selectedLanguage
        })
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      const deepDiveMessage: Message = {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        type: 'deep-dive',
        deepDiveData: {
          overview: data.overview,
          whyItMatters: data.whyItMatters,
          stepByStep: data.stepByStep,
          example: data.example,
          commonMistakes: data.commonMistakes,
          memoryTrick: data.memoryTrick,
          takeaway: data.takeaway
        }
      }

      const updatedMessages = [...currentMessages, deepDiveMessage]
      setMessages(updatedMessages)

      // Save Deep Dive History
      if (user?.id) {
        let title = undefined
        // If this is the start of a session, clear title to let it auto-gen, or set a specific one
        if (currentMessages.length <= 2) {
          title = `Deep Dive: ${data.overview.substring(0, 30)}...`
        }

        await saveHistory(
          supabase,
          user.id,
          sessionIdRef.current,
          'chat',
          { messages: updatedMessages },
          title,
          { mode: 'deep-dive', language: selectedLanguage }
        )
      }

    } catch (error: any) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        timestamp: new Date(),
        type: 'normal'
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const handleDeepDive = async () => {
    if (loading || messages.length === 0) return
    setLoading(true)
    setIsDeepDiveMode(true)
    await executeDeepDive(messages)
    setLoading(false)
  }

  const handleSend = async (e?: React.FormEvent, overrideInput?: string) => {
    if (e) e.preventDefault()
    const textToSend = overrideInput || input
    if (!textToSend.trim() || loading) return

    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    }

    const currentMessages = [...messages, userMessage]
    setMessages(currentMessages)

    // Optimistically save user message (optional, but good for safety)
    // We'll trust the final save after AI response for the complete picture to avoid too many writes

    const userInput = textToSend
    setInput('')
    setLoading(true)

    // If in Deep Dive mode, use the specialized handler
    if (isDeepDiveMode) {
      await executeDeepDive(currentMessages)
      setLoading(false)
      clearDraft()
      return
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: currentMessages.map(m => ({
            role: m.role,
            content: m.content
          })),
          language: selectedLanguage,
          firstName
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to get response')
      }
      if (!response.body) throw new Error('No response body')

      // Initialize assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        type: 'normal'
      }
      setMessages(prev => [...prev, assistantMessage])

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let done = false
      let accumulatedContent = ''

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        const chunkValue = decoder.decode(value, { stream: true })
        accumulatedContent += chunkValue

        // Update the last message with new content
        setMessages(prev => {
          const newMessages = [...prev]
          const lastMsg = newMessages[newMessages.length - 1]
          if (lastMsg.role === 'assistant' && lastMsg.type === 'normal') {
            lastMsg.content = accumulatedContent
          }
          return newMessages
        })
      }

      // Final parsing
      const parsed = parseAIResponse(accumulatedContent)

      const finalAssistantMessage: Message = {
        ...assistantMessage,
        content: parsed.content,
        confidence: parsed.confidence,
        askBackQuestion: parsed.askBackQuestion,
        suggestedActions: parsed.suggestedActions
      }

      setMessages(prev => {
        const newMessages = [...prev]
        // Replace the streaming message with the final parsed one
        newMessages[newMessages.length - 1] = finalAssistantMessage
        return newMessages
      })

      // Save History (Unified)
      const updatedMessages = [...currentMessages, finalAssistantMessage]
      if (user?.id) {
        let title = undefined
        // Only try to generate title if specific condition met or let undefined for backend/next logic
        // For now, if it's the very first exchange (2 messages), we generate a title
        if (updatedMessages.length <= 2) {
          title = await generateTitle(userInput)
        }

        await saveHistory(
          supabase,
          user.id,
          sessionIdRef.current,
          'chat',
          { messages: updatedMessages },
          title,
          { mode: 'normal', language: selectedLanguage }
        )
      }

      clearDraft()
    } catch (error: any) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        timestamp: new Date(),
        type: 'normal'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handle2MinConcept = async () => {
    let topic = input.trim()
    if (!topic && messages.length > 0) {
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
      topic = lastUserMessage?.content || 'current topic'
    }
    if (!topic) {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Please type a topic or question first, then click "Explain in 2 Minutes"',
        timestamp: new Date(),
        type: 'normal'
      }
      setMessages(prev => [...prev, errorMessage])
      return
    }
    if (loading) return

    setLoading(true)
    try {
      const response = await fetch('/api/chat/2min-concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          language: selectedLanguage,
          firstName
        })
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      const conceptMessage: Message = {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        type: 'concept',
        conceptData: {
          concept: data.concept,
          example: data.example,
          takeaway: data.takeaway,
          topic: topic
        }
      }

      // If user typed something to trigger this, use it. If button click on empty input but used context, maybe create a user message? 
      // Current usage implies user might have typed then clicked button.
      let currentMessages = [...messages]
      if (input.trim()) {
        const userMessage: Message = { role: 'user', content: input, timestamp: new Date() }
        currentMessages.push(userMessage)
        setInput('') // Clear input if used
      }

      const updatedMessages = [...currentMessages, conceptMessage]
      setMessages(updatedMessages)

      if (user?.id) {
        let title = undefined
        if (updatedMessages.length <= 2) {
          title = `Concept: ${topic}`
        }
        await saveHistory(
          supabase,
          user.id,
          sessionIdRef.current,
          'chat',
          { messages: updatedMessages },
          title,
          { mode: '2min-concept', topic }
        )
      }

    } catch (error: any) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        timestamp: new Date(),
        type: 'normal'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleWeaknessAnalysis = async () => {
    if (loading || messages.length === 0) return
    setLoading(true)
    try {
      const response = await fetch('/api/chat/weakness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          language: selectedLanguage
        })
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      const weaknessMessage: Message = {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        type: 'weakness',
        weaknessData: {
          weakAreas: data.weakAreas,
          whyWeak: data.whyWeak,
          nextActions: data.nextActions,
          confidence: data.confidence
        }
      }

      const updatedMessages = [...messages, weaknessMessage]
      setMessages(updatedMessages)

      if (user?.id) {
        await saveHistory(
          supabase,
          user.id,
          sessionIdRef.current,
          'chat',
          { messages: updatedMessages },
          undefined, // Keep existing title
          { mode: 'weakness' }
        )
      }

    } catch (error: any) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        timestamp: new Date(),
        type: 'normal'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleNewChat = () => {
    setMessages([])
    setInput('')
    clearDraft()
    clearHistorySessionId()
    sessionIdRef.current = getOrCreateHistorySessionId()
    setIsDeepDiveMode(false)
  }

  const handleResetChat = () => {
    resetChat({ input: '', messages: [] })
    clearDraft()
    clearHistorySessionId()
    sessionIdRef.current = getOrCreateHistorySessionId()
    setIsDeepDiveMode(false)
  }

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col pt-28 pb-4 px-4">
      {/* Main Chat Card */}
      <div className="flex-1 flex flex-col overflow-hidden glass-card rounded-3xl relative border-t border-white/10 shadow-2xl">

        {/* Header */}
        <div className="border-b border-[var(--border-subtle)] p-4 bg-white/5 backdrop-blur-md z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <span className="text-3xl">🤖</span> AI Chat Mentor
              </h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Ask me anything about your studies or career!</p>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              <button
                onClick={() => setLanguage('English')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${selectedLanguage === 'English'
                  ? 'bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white shadow-md'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('Hinglish')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${selectedLanguage === 'Hinglish'
                  ? 'bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white shadow-md'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
              >
                Hinglish
              </button>
              <button
                onClick={() => setLanguage('Gujarati')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${selectedLanguage === 'Gujarati'
                  ? 'bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white shadow-md'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
              >
                Gujarati
              </button>

              <div className="h-6 w-px bg-[var(--border-subtle)] mx-1"></div>

              <div className="relative">
                <button
                  onClick={handleNewChat}
                  className="p-2 rounded-full hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors"
                  title="New Chat"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>

              <div className="relative">
                <button
                  onClick={handleResetChat}
                  className="p-2 rounded-full hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-red-500 transition-colors"
                  title="Delete Chat"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>


            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scroll-smooth">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in pt-24 pb-12">
              <div className="text-6xl mb-6 animate-float">👋</div>
              <h2 className="text-3xl font-bold mb-3 text-gradient-mantra">Hello! I'm your AI Mentor</h2>
              <p className="text-[var(--text-secondary)] mb-8 max-w-md">
                I can help you understand complex topics, prepare for exams, or guide your career path.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                <button
                  onClick={() => setInput("Explain photosynthesis simply")}
                  className="p-4 rounded-xl glass-panel hover:bg-[var(--bg-elevated)] transition-all duration-300 text-left group border border-transparent hover:border-[var(--accent-primary)]"
                >
                  <span className="text-xl mb-2 block">🌿</span>
                  <span className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-primary)]">Explain photosynthesis simply</span>
                </button>
                <button
                  onClick={() => setInput("Help me prepare for my math exam")}
                  className="p-4 rounded-xl glass-panel hover:bg-[var(--bg-elevated)] transition-all duration-300 text-left group border border-transparent hover:border-[var(--accent-secondary)]"
                >
                  <span className="text-xl mb-2 block">📐</span>
                  <span className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-secondary)]">Help me prepare for my exam</span>
                </button>
                <button
                  onClick={() => setInput("What career options after 12th?")}
                  className="p-4 rounded-xl glass-panel hover:bg-[var(--bg-elevated)] transition-all duration-300 text-left group border border-transparent hover:border-[var(--accent-tertiary)]"
                >
                  <span className="text-xl mb-2 block">🚀</span>
                  <span className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-tertiary)]">What career options after 12th?</span>
                </button>
                <button
                  onClick={() => setInput("How to manage exam stress?")}
                  className="p-4 rounded-xl glass-panel hover:bg-[var(--bg-elevated)] transition-all duration-300 text-left group border border-transparent hover:border-[var(--accent-primary)]"
                >
                  <span className="text-xl mb-2 block">🧘</span>
                  <span className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-primary)]">How to manage exam stress?</span>
                </button>
              </div>
            </div>
          )}

          {messages.map((message, idx) => (
            <div key={idx} className="animate-slide-up">
              {message.type === 'concept' && message.conceptData ? (
                <ConceptCard
                  concept={message.conceptData.concept}
                  example={message.conceptData.example}
                  takeaway={message.conceptData.takeaway}
                  topic={message.conceptData.topic}
                />
              ) : message.type === 'weakness' && message.weaknessData ? (
                <WeaknessSummaryCard
                  weakAreas={message.weaknessData.weakAreas}
                  whyWeak={message.weaknessData.whyWeak}
                  nextActions={message.weaknessData.nextActions}
                  confidence={message.weaknessData.confidence}
                />
              ) : message.type === 'deep-dive' && message.deepDiveData ? (
                <DeepDiveCard data={message.deepDiveData} />
              ) : (
                <div
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[75%] ${message.role === 'user'
                      ? 'chat-bubble-user'
                      : 'chat-bubble-ai'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      {message.role === 'assistant' && (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex-shrink-0 flex items-center justify-center text-[10px] text-white font-bold mt-1">
                          AI
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        {message.role === 'assistant' && message.confidence && (
                          <div className="mt-3 text-xs flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${message.confidence === 'high'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : message.confidence === 'medium'
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                              }`}>
                              {message.confidence === 'high' ? '✅ High Confidence' : message.confidence === 'medium' ? '⚠️ Medium Confidence' : '❗ Low Confidence'}
                            </span>
                          </div>
                        )}
                        {message.role === 'assistant' && message.askBackQuestion && (
                          <div className="mt-3 p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                            <div className="text-xs font-semibold text-[var(--accent-primary)] mb-1 flex items-center gap-1">
                              <span>🤔</span> Your Turn
                            </div>
                            <p className="text-sm text-[var(--text-primary)]">{message.askBackQuestion}</p>
                          </div>
                        )}
                        {message.role === 'assistant' && (
                          <div className="mt-2">
                            <VoiceButton text={message.content} />
                          </div>
                        )}

                        {/* Suggested Actions */}
                        {message.role === 'assistant' && message.suggestedActions && message.suggestedActions.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2 animate-fade-in">
                            {message.suggestedActions.map((action, actionIdx) => (
                              <button
                                key={actionIdx}
                                onClick={() => handleSend(undefined, action)}
                                className="px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-primary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-all duration-200 shadow-sm flex items-center gap-1.5"
                              >
                                {action}
                              </button>
                            ))}
                          </div>
                        )}
                        <p className={`text-[10px] mt-1 text-right opacity-60`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start animate-slide-up">
              <div className="chat-bubble-ai">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex-shrink-0 flex items-center justify-center text-[10px] text-white font-bold">
                    AI
                  </div>
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 bg-[var(--accent-primary)] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[var(--accent-secondary)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-[var(--accent-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white/5 backdrop-blur-md border-t border-[var(--border-subtle)]">
          <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={handle2MinConcept}
              disabled={loading}
              className="flex-shrink-0 px-3 py-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-xs font-semibold text-[var(--text-primary)] transition-all duration-200 hover:border-[var(--accent-primary)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm"
            >
              <span>⚡</span> Explain in 2 Min
            </button>
            <button
              type="button"
              onClick={handleWeaknessAnalysis}
              disabled={loading || messages.length === 0}
              className="flex-shrink-0 px-3 py-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-xs font-semibold text-[var(--text-primary)] transition-all duration-200 hover:border-[var(--accent-secondary)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm"
            >
              <span>🧠</span> Analyze Weakness
            </button>
            <button
              type="button"
              onClick={handleDeepDive}
              disabled={loading || messages.length === 0}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-200 flex items-center gap-1 shadow-sm ${isDeepDiveMode
                ? 'bg-gradient-to-r from-[var(--accent-primary)] to-purple-600 text-white border-transparent shadow-[0_0_15px_rgba(var(--accent-primary-rgb),0.5)]'
                : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:border-[var(--accent-tertiary)]'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span>{isDeepDiveMode ? '⛏️' : '💎'}</span> Deep Dive
            </button>
          </div>

          <form onSubmit={handleSend} className="relative">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Type here... or just speak 🎤"
                className="w-full pl-4 pr-24 py-3.5 genz-input shadow-inner"
                disabled={loading}
              />
              <div className="absolute right-2 flex items-center gap-1">
                <VoiceInput
                  onTranscript={handleVoiceTranscript}
                  disabled={loading}
                />
                <button
                  type="submit"
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim()}
                  className="p-2 rounded-lg bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      {showUndo && (
        <UndoToast
          message="Chat reset. Undo?"
          onUndo={undoReset}
          onDismiss={dismissUndo}
          timeout={10000}
        />
      )}
    </div>
  )
}

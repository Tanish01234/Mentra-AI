'use client'

import ReactMarkdown from 'react-markdown'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import UndoToast from '@/components/UndoToast'
import { useAutoSave, restoreDraft } from '@/hooks/useAutoSave'
import { useResetWithUndo } from '@/hooks/useResetWithUndo'
import { saveHistory } from '@/lib/utils/history'

export default function CareerPage() {
  const [formData, setFormData] = useState({
    currentEducation: '',
    interests: '',
    strengths: '',
    goals: ''
  })
  const [loading, setLoading] = useState(false)
  const [roadmap, setRoadmap] = useState('')
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const [showResetMenu, setShowResetMenu] = useState(false)

  const roadmapRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to roadmap when generated
  useEffect(() => {
    if (roadmap && roadmapRef.current) {
      setTimeout(() => {
        roadmapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [roadmap])

  // ... (rest of the state/hooks remain same, just update the imports and initial component part)

  // Auto-save form data
  const [clearFormDraft] = useAutoSave({
    key: 'career-form-draft',
    value: formData,
    debounceMs: 2500,
    enabled: Object.values(formData).some(v => v.trim())
  })

  // ... (keeping reset logic same)
  const {
    reset: resetCareer,
    undo: undoReset,
    showUndo,
    dismissUndo
  } = useResetWithUndo({
    initialState: {
      currentEducation: '',
      interests: '',
      strengths: '',
      goals: ''
    },
    onReset: (state) => {
      setFormData(state)
    }
  })

  useEffect(() => {
    if (supabase) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user)
        if (user) {
          loadUserGoal(user)
        }
      })
    }
    // Restore draft on mount (only if no user goal loaded)
    const saved = restoreDraft<typeof formData>('career-form-draft')
    if (saved && !formData.currentEducation && !formData.interests) {
      setFormData(saved)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Close reset menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showResetMenu && !(event.target as Element).closest('.relative')) {
        setShowResetMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showResetMenu])

  const loadUserGoal = async (currentUser: any) => {
    if (!currentUser || !supabase) return
    try {
      const { data } = await supabase
        .from('user_memory')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('interaction_type', 'career_goal')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data) {
        try {
          const parsed = JSON.parse(data.content)
          setFormData(prev => ({
            ...prev,
            ...parsed,
            goals: parsed.goals || ''
          }))
        } catch {
          setFormData(prev => ({
            ...prev,
            goals: data.content || ''
          }))
        }
      }
    } catch (error) {
      console.error('Error loading goal:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setRoadmap('')

    try {
      const response = await fetch('/api/career', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setRoadmap(data.roadmap)

      // Clear draft after successful submit
      clearFormDraft()

      // Save to History (Centralized)
      if (user && supabase) {
        const title = `Career Roadmap for ${formData.currentEducation} Student`
        const careerSessionId = crypto.randomUUID()

        await saveHistory(
          supabase,
          user.id,
          careerSessionId,
          'career',
          {
            input: formData,
            roadmap: data.roadmap,
            timestamp: new Date().toISOString()
          },
          title,
          { mode: 'roadmap' }
        )
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate roadmap')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 pt-24 pb-12">
        <div className="p-6 mb-6 animate-fade-in rounded-3xl shadow-2xl border border-[var(--border-subtle)] bg-black/70 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Career Guidance</h1>
            <div className="relative">
              <button
                onClick={() => setShowResetMenu(!showResetMenu)}
                className="px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] genz-card rounded-xl transition-all duration-200"
              >
                Reset ▼
              </button>
              {showResetMenu && (
                <div className="absolute right-0 mt-2 w-48 genz-card py-1 z-10 animate-scale-in">
                  <button
                    onClick={() => {
                      resetCareer({ ...formData, currentEducation: '' })
                      setShowResetMenu(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[rgba(255,107,157,0.1)] rounded-lg transition-colors"
                  >
                    Reset Education
                  </button>
                  <button
                    onClick={() => {
                      resetCareer({ ...formData, interests: '' })
                      setShowResetMenu(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[rgba(255,107,157,0.1)] rounded-lg transition-colors"
                  >
                    Reset Interests
                  </button>
                  <button
                    onClick={() => {
                      resetCareer({
                        currentEducation: '',
                        interests: '',
                        strengths: '',
                        goals: ''
                      })
                      clearFormDraft()
                      setShowResetMenu(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[rgba(255,107,157,0.1)] rounded-lg transition-colors"
                  >
                    Reset All
                  </button>
                </div>
              )}
            </div>
          </div>
          <p className="text-[var(--text-secondary)]">
            Tell me about yourself, and I'll create a personalized career roadmap for you!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 animate-slide-up rounded-3xl shadow-2xl border border-[var(--border-subtle)] bg-black/70 backdrop-blur-xl">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Current Education Level
            </label>
            <select
              value={formData.currentEducation}
              onChange={(e) => setFormData({ ...formData, currentEducation: e.target.value })}
              required
              className="w-full px-4 py-3 genz-input"
            >
              <option value="">Select your education level</option>
              <option value="10th">10th Standard</option>
              <option value="12th">12th Standard</option>
              <option value="bachelor">Bachelor's Degree</option>
              <option value="master">Master's Degree</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Your Interests
            </label>
            <textarea
              value={formData.interests}
              onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
              required
              rows={3}
              className="w-full px-4 py-3 genz-input"
              placeholder="e.g., I love coding, mathematics, problem-solving..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Your Strengths
            </label>
            <textarea
              value={formData.strengths}
              onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
              required
              rows={3}
              className="w-full px-4 py-3 genz-input"
              placeholder="e.g., Good at logical thinking, creative writing, leadership..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Career Goals (Optional)
            </label>
            <textarea
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 genz-input"
              placeholder="e.g., I want to become a software engineer, work in AI..."
            />
          </div>

          {error && (
            <div className="genz-card border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 btn-aurora text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Roadmap...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2 group-hover:gap-3 transition-all">
                🎯 Get My Career Roadmap
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            )}
          </button>
        </form>

        {roadmap && (
          <div ref={roadmapRef} className="mt-8 animate-slide-up">
            <div className="rounded-3xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-[var(--border-subtle)] p-1 overflow-hidden shadow-2xl">
              <div className="bg-black/40 backdrop-blur-xl p-6 md:p-8 rounded-[22px]">
                <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                  <span className="text-3xl">🚀</span>
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]">
                    Your Personalized Roadmap
                  </h2>
                </div>

                <div className="prose prose-invert max-w-none text-[var(--text-secondary)]">
                  <ReactMarkdown
                    components={{
                      h1: ({ node, ...props }) => <h3 className="text-xl font-bold text-white mt-6 mb-3 flex items-center gap-2" {...props} />,
                      h2: ({ node, ...props }) => <h4 className="text-lg font-semibold text-[var(--accent-primary)] mt-5 mb-2" {...props} />,
                      p: ({ node, ...props }) => <p className="leading-relaxed mb-4 text-[15px]" {...props} />,
                      ul: ({ node, ...props }) => <ul className="space-y-2 mb-4" {...props} />,
                      li: ({ node, ...props }) => (
                        <li className="flex items-start gap-2 text-sm text-gray-300">
                          <span className="text-[var(--accent-secondary)] mt-1">•</span>
                          <span>{props.children}</span>
                        </li>
                      ),
                      strong: ({ node, ...props }) => <span className="font-bold text-white" {...props} />
                    }}
                  >
                    {roadmap}
                  </ReactMarkdown>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center text-xs text-[var(--text-muted)]">
                  <span>Generated by MentraAI v3.0</span>
                  <button onClick={() => window.print()} className="hover:text-white transition-colors flex items-center gap-1">
                    🖨️ Save as PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {showUndo && (
          <UndoToast
            message="Form reset. Undo?"
            onUndo={undoReset}
            onDismiss={dismissUndo}
            timeout={10000}
          />
        )}
      </div>
    </div>
  )
}

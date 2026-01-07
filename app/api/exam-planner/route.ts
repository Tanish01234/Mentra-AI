import { NextRequest, NextResponse } from 'next/server'
import { getLongFormResponse } from '@/lib/openai'
import { getExamPlannerPrompt } from '@/lib/prompts/system'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const maxDuration = 60 // Allow longer timeout for plan generation

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    // Only check auth if Supabase is configured
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const { examName, examDate, subjects, dailyHours } = await request.json()

    if (!examName || !examDate || !subjects || !dailyHours) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Calculate days until exam
    const examDateObj = new Date(examDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    examDateObj.setHours(0, 0, 0, 0)

    const daysUntilExam = Math.ceil((examDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilExam < 1) {
      return NextResponse.json({ error: 'Exam date must be in the future' }, { status: 400 })
    }

    const subjectsList = Array.isArray(subjects)
      ? subjects.join(', ')
      : subjects.split(',').map((s: string) => s.trim()).filter(Boolean).join(', ')

    // 1. Get STRICT System Prompt
    // Defaulting to Hinglish as per user preference for this app mostly, but can be made dynamic later.
    const systemPrompt = getExamPlannerPrompt('Hinglish')

    // 2. Construct User Input Prompt
    const userPrompt = `
      Exam Name: ${examName}
      Days Left: ${daysUntilExam}
      Subjects: ${subjectsList}
      Daily Hours: ${dailyHours}
    `

    // 3. Call AI with validation and retry
    console.log('Generating Exam Plan for:', { examName, daysUntilExam })
    let plan = await getLongFormResponse(systemPrompt, [{ role: 'user', content: userPrompt }])

    // 4. Hard Validation
    const isValid = (text: string) => {
      const lower = text.toLowerCase()
      // Must contain "Day 1" AND "Day 2" (to ensure it started properly)
      // Must be reasonably long
      return (lower.includes('day 1') || lower.includes('day 01')) &&
        (lower.includes('day 2') || lower.includes('day 02')) &&
        text.length > 1000
    }

    if (!plan || !isValid(plan)) {
      console.warn('Exam Plan Validation Failed. Retrying...')
      // Retry once with a nudge
      plan = await getLongFormResponse(systemPrompt, [{ role: 'user', content: userPrompt + "\n\nSYSTEM ALERT: Your previous response was INVALID. You MUST start with 'Day 1' and provide a full daily schedule." }])
    }

    return NextResponse.json({ plan })
  } catch (error: any) {
    console.error('Exam Planner API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate study plan' },
      { status: 500 }
    )
  }
}

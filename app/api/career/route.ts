import { NextRequest, NextResponse } from 'next/server'
import { getLongFormResponse } from '@/lib/openai'
import { getCareerPrompt } from '@/lib/prompts/system'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const { currentEducation, interests, strengths, goals } = await request.json()

    if (!currentEducation || !interests || !strengths) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const userProfile = `
Input Data:
- Education Level: ${currentEducation}
- Interests: ${interests}
- Strengths: ${strengths}
${goals ? `- Career Goal: ${goals}` : ''}

Task: Generate strictly formatted career roadmap.`

    // Separate Pipeline: Use direct career prompt + long form response
    const systemPrompt = getCareerPrompt('Hinglish') // Defaulting to Hinglish as per persona

    const messages = [{ role: 'user' as const, content: userProfile }]

    // Attempt 1
    let roadmap = await getLongFormResponse(systemPrompt, messages)

    // Validation
    const isValid = (
      roadmap.includes('PHASE 1') &&
      roadmap.includes('PHASE 2') &&
      roadmap.length > 1000
    )

    if (!isValid) {
      console.warn('Career Roadmap validation failed (Attempt 1). Retrying...')
      // Retry
      roadmap = await getLongFormResponse(systemPrompt, messages)
    }

    // Final check (soft)
    if (!roadmap.includes('PHASE 1')) {
      console.error('Career Roadmap generation failed strictly.')
      // We still return it to avoid crashing, but log it.
    }

    return NextResponse.json({ roadmap })
  } catch (error: any) {
    console.error('Career API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate roadmap' },
      { status: 500 }
    )
  }
}

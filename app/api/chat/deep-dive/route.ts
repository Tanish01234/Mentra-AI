import { NextRequest, NextResponse } from 'next/server'
import { getCustomChatCompletion } from '@/lib/openai'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getDeepDivePrompt, type Language } from '@/lib/prompts/system'

export async function POST(request: NextRequest) {
    try {
        const supabase = createServerSupabaseClient()
        if (supabase) {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            }
        }

        const { messages, language } = await request.json()

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ error: 'Messages are required' }, { status: 400 })
        }

        // Map language to Language type
        const languageMap: { [key: string]: Language } = {
            'English': 'English',
            'Hinglish': 'Hinglish',
            'Gujarati': 'Gujarati'
        }
        const selectedLanguage: Language = languageMap[language] || 'Hinglish'

        // Get the specialized prompt
        const systemPrompt = getDeepDivePrompt(selectedLanguage)

        // Get input (last user message)
        // We pass the conversation context but emphasize the last request needs deep dive
        const conversation = messages.map((m: any) => ({
            role: m.role,
            content: m.content
        }))

        // Get AI response with JSON enforcement
        // We append a reminder to force JSON
        const responseText = await getCustomChatCompletion(
            systemPrompt,
            conversation,
            selectedLanguage.toLowerCase() as 'english' | 'hinglish' | 'gujarati'
        )

        // Parse JSON response
        let parsedResponse
        try {
            // Clean potential markdown code blocks
            const cleaned = responseText.replace(/```json\n?|\n?```/g, '').trim()
            parsedResponse = JSON.parse(cleaned)
        } catch (e) {
            console.error('Failed to parse Deep Dive JSON:', e)
            console.log('Raw response:', responseText)
            // Fallback
            return NextResponse.json({
                error: 'AI response was not in correct format. Please try again.',
                raw: responseText
            }, { status: 500 })
        }

        return NextResponse.json(parsedResponse)
    } catch (error: any) {
        console.error('Deep Dive API Error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to generate deep dive analysis' },
            { status: 500 }
        )
    }
}

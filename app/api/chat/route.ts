import { NextRequest, NextResponse } from 'next/server'
import { getChatStream } from '@/lib/openai'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { GoogleGenerativeAIStream, StreamingTextResponse } from 'ai'

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

    const { messages, language, firstName } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 })
    }

    // Get the stream from Gemini
    const chatResult = await getChatStream(messages, 'study', language || 'hinglish', firstName)

    // Create a raw text stream (Bypass Vercel AI SDK Protocol to avoid 0:"..." artifacts)
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        try {
          for await (const chunk of chatResult.stream) {
            const text = chunk.text()
            if (text) {
              controller.enqueue(encoder.encode(text))
            }
          }
        } catch (error) {
          console.error('Stream Error:', error)
          controller.error(error)
        } finally {
          controller.close()
        }
      }
    })

    // Return raw text stream
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error: any) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get AI response' },
      { status: 500 }
    )
  }
}

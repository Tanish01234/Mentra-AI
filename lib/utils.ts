import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function parseAIResponse(content: string): {
    content: string;
    confidence?: 'high' | 'medium' | 'low';
    askBackQuestion?: string;
    suggestedActions?: string[];
} {
    let cleanContent = content
    let confidence: 'high' | 'medium' | 'low' | undefined
    let askBackQuestion: string | undefined
    let suggestedActions: string[] | undefined

    // Extract Confidence
    const confidenceMatch = content.match(/Confidence:\s*(High|Medium|Low)/i)
    if (confidenceMatch) {
        confidence = confidenceMatch[1].toLowerCase() as 'high' | 'medium' | 'low'
        cleanContent = cleanContent.replace(/Confidence:\s*(High|Medium|Low)/i, '').trim()
    }

    // Extract Ask Back Question
    const askBackMatch = content.match(/AskBack:\s*(.*)/i)
    if (askBackMatch) {
        askBackQuestion = askBackMatch[1].trim()
        cleanContent = cleanContent.replace(/AskBack:\s*(.*)/i, '').trim()
    }

    // Extract Suggested Actions
    // Looking for "Suggested Actions:" followed by bulleted list
    const actionsMatch = content.match(/Suggested Actions:\s*([\s\S]*?)(?=$|\n\n)/i)
    if (actionsMatch) {
        const rawActions = actionsMatch[1].trim()
        suggestedActions = rawActions
            .split('\n')
            .map(line => line.replace(/^[-*•]\s*/, '').trim()) // remove bullets
            .filter(line => line.length > 0)

        // Remove the whole block from content
        cleanContent = cleanContent.replace(/Suggested Actions:\s*([\s\S]*?)(?=$|\n\n)/i, '').trim()
    }

    return {
        content: cleanContent,
        confidence,
        askBackQuestion,
        suggestedActions
    }
}

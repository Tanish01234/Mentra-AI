'use client'

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Dashboard Error:', error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Something went wrong!</h2>
            <div className="p-4 bg-gray-900 rounded-lg border border-red-500/20 mb-6 text-left max-w-lg w-full overflow-auto">
                <p className="text-red-400 font-mono text-sm break-words">{error.message}</p>
                {error.stack && (
                    <pre className="mt-2 text-xs text-gray-500 whitespace-pre-wrap">{error.stack}</pre>
                )}
            </div>
            <button
                onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                }
                className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
                Try again
            </button>
        </div>
    )
}

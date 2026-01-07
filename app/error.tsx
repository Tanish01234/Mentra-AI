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
    console.error('App-level Error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-[#0B0F19] text-white">
      <h2 className="text-2xl font-bold text-red-500 mb-4">Application Error</h2>
      <p className="text-gray-400 mb-4">A critical error occurred.</p>
      <div className="p-4 bg-gray-900 rounded-lg border border-red-500/20 mb-6 text-left max-w-lg w-full overflow-auto">
        <p className="text-red-400 font-mono text-sm break-words">{error.message}</p>
      </div>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Reload Application
      </button>
    </div>
  )
}

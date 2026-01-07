interface DeepDiveCardProps {
    data: {
        overview: string
        whyItMatters: string
        stepByStep: string[]
        example: string
        commonMistakes: string[]
        memoryTrick: string
        takeaway: string
    }
}

export default function DeepDiveCard({ data }: DeepDiveCardProps) {
    const { overview, whyItMatters, stepByStep, example, commonMistakes, memoryTrick, takeaway } = data

    return (
        <div className="genz-card w-full max-w-3xl mx-auto overflow-hidden animate-scale-in border border-[var(--accent-primary)]/40 shadow-2xl bg-[#0a0a0a]/95 backdrop-blur-xl my-6">
            {/* Header with Deep Dive Branding */}
            <div className="px-6 py-4 border-b border-[var(--border-subtle)] bg-gradient-to-r from-[var(--accent-primary)]/20 via-purple-900/20 to-transparent flex items-center gap-3">
                <div className="p-2 bg-[var(--accent-primary)]/20 rounded-lg">
                    <span className="text-xl">⛏️</span>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Deep Dive Mode</h3>
                    <p className="text-[10px] text-[var(--accent-primary)] uppercase tracking-widest font-semibold">MentraAI Mastery Module</p>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* 1. Concept Overview */}
                <div>
                    <h4 className="text-sm font-bold text-[var(--accent-secondary)] uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span>📖</span> Concept Overview
                    </h4>
                    <p className="text-[var(--text-primary)] leading-relaxed text-base font-medium">
                        {overview}
                    </p>
                </div>

                {/* 2. Why This Exists */}
                <div className="pl-4 border-l-2 border-[var(--accent-tertiary)] bg-[var(--bg-elevated)]/30 rounded-r-xl p-4">
                    <h4 className="text-sm font-bold text-[var(--accent-tertiary)] uppercase tracking-wider mb-2 flex items-center gap-2">
                        <span>💡</span> Why This Exists
                    </h4>
                    <p className="text-[var(--text-secondary)] italic text-sm leading-relaxed">
                        {whyItMatters}
                    </p>
                </div>

                {/* 3. Step-by-Step Breakdown */}
                <div>
                    <h4 className="text-sm font-bold text-[var(--accent-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span>🪜</span> Step-by-Step Breakdown
                    </h4>
                    <div className="space-y-4">
                        {stepByStep.map((step, idx) => (
                            <div key={idx} className="flex gap-4 p-3 rounded-xl hover:bg-[var(--bg-elevated)] transition-colors border border-transparent hover:border-[var(--border-subtle)]">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--bg-surface)] border border-[var(--accent-primary)]/30 text-[var(--accent-primary)] font-bold flex items-center justify-center mt-0.5 shadow-sm">
                                    {idx + 1}
                                </span>
                                <span className="text-[var(--text-primary)] leading-relaxed">{step}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. Real Example */}
                <div className="bg-gradient-to-br from-blue-900/10 to-indigo-900/10 rounded-2xl p-6 border border-blue-500/20">
                    <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span>🧩</span> Real Example
                    </h4>
                    <p className="text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">
                        {example}
                    </p>
                </div>

                {/* 5. Common Mistakes */}
                <div>
                    <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span>🚫</span> Common Mistakes
                    </h4>
                    <ul className="grid gap-3">
                        {commonMistakes.map((mistake, idx) => (
                            <li key={idx} className="flex items-start gap-3 bg-red-500/5 p-3 rounded-lg border border-red-500/10">
                                <span className="text-red-400 mt-1">⚠️</span>
                                <span className="text-[var(--text-muted)] text-sm">{mistake}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 6. Quick Mental Hook */}
                <div className="flex items-start gap-4 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                    <span className="text-2xl mt-1">🧠</span>
                    <div>
                        <h4 className="text-xs font-bold text-yellow-500 uppercase tracking-wider mb-1">Memory Trick</h4>
                        <p className="text-[var(--text-primary)] font-medium">
                            {memoryTrick}
                        </p>
                    </div>
                </div>

                {/* 7. Takeaway */}
                <div className="pt-6 border-t border-[var(--border-subtle)] text-center">
                    <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">Final Takeaway</h4>
                    <p className="text-lg md:text-xl font-bold bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent italic">
                        "{takeaway}"
                    </p>
                </div>
            </div>
        </div>
    )
}

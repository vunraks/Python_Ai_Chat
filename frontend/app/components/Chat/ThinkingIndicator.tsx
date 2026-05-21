"use client";

export default function ThinkingIndicator() {
  return (
    <div className="flex items-start gap-3 mb-3">
      <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center text-xs font-bold text-white thinking-orb">
        AI
      </div>
      <div className="max-w-[75%] rounded-2xl rounded-tl-md px-4 py-3 thinking-shimmer border border-violet-500/20">
        <p className="text-xs text-violet-300/80 mb-2 font-medium">
          Думаю над ответом...
        </p>
        <div className="flex items-center gap-1.5 h-4">
          <span className="thinking-dot" />
          <span className="thinking-dot" />
          <span className="thinking-dot" />
        </div>
      </div>
    </div>
  );
}

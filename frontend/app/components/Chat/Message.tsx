"use client";

import TypewriterText from "./TypewriterText";

type Props = {
  role: string;
  content: string;
  animate?: boolean;
  onTypingComplete?: () => void;
};

export default function Message({
  role,
  content,
  animate = false,
  onTypingComplete,
}: Props) {
  const isUser = role === "user";

  return (
    <div
      className={`flex items-end gap-2 mb-4 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-violet-500/80 to-cyan-500/80 flex items-center justify-center text-[10px] font-bold text-white mb-1">
          AI
        </div>
      )}

      <div
        className={`
          max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
          ${
            isUser
              ? "rounded-br-md bg-gradient-to-br from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-900/30"
              : "rounded-bl-md bg-zinc-800/90 text-zinc-100 border border-zinc-700/50"
          }
        `}
      >
        {isUser ? (
          <span className="whitespace-pre-wrap break-words">{content}</span>
        ) : animate ? (
          <TypewriterText
            text={content}
            onComplete={onTypingComplete}
          />
        ) : (
          <span className="whitespace-pre-wrap break-words">{content}</span>
        )}
      </div>
    </div>
  );
}

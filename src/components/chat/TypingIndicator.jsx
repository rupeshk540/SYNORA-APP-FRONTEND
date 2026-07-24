const TypingIndicator = ({ typingUsers }) => {
    const names = Object.keys(typingUsers);
    if (names.length === 0) return null;

    const text = names.length === 1
        ? `${names[0]} is typing...`
        : names.length === 2
        ? `${names[0]} and ${names[1]} are typing...`
        : `${names.length} people are typing...`;

    return (
        <div className="flex items-center gap-2 px-6 py-1 text-xs text-slate-400">
            <span className="flex gap-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" />
            </span>
            {text}
        </div>
    );
};

export default TypingIndicator;
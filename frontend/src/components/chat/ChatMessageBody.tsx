export function ChatMessageBody({ text, isUser }: { text: string; isUser: boolean }) {
  if (isUser) {
    return <p className="m-0 whitespace-pre-wrap">{text}</p>;
  }
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <p className="m-0 whitespace-pre-wrap leading-relaxed">
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-gray-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}

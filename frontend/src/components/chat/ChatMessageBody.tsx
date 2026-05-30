export function ChatMessageBody({ text, isUser }: { text: string; isUser: boolean }) {
  return (
    <p className={`m-0 whitespace-pre-wrap ${isUser ? "" : "leading-relaxed"}`}>{text}</p>
  );
}

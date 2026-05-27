import { Link } from "react-router-dom";
import { ChatWidget } from "./ChatWidget";

type ChatEmbedShellProps = {
  variant?: "compact" | "full";
  showFooter?: boolean;
  title?: string;
  subtitle?: string;
};

export function ChatEmbedShell({
  variant = "compact",
  showFooter = true,
  title = "TrackAid Assistant",
  subtitle = "En línea · Demo interactiva",
}: ChatEmbedShellProps) {
  const shellClass =
    variant === "full" ? "chat-embed-shell chat-embed-shell--full" : "chat-embed-shell chat-embed-shell--compact";

  return (
    <div className={shellClass}>
      <header className="chat-embed-header">
        <div className="chat-embed-avatar" aria-hidden>
          TA
        </div>
        <div className="chat-embed-header-text">
          <h2 className="chat-embed-title">{title}</h2>
          <p className="chat-embed-status m-0">
            <span className="chat-embed-status-dot" />
            {subtitle}
          </p>
        </div>
        <span className="chat-embed-badge">IA demo</span>
      </header>
      <ChatWidget bare />
      {showFooter && (
        <p className="chat-embed-footer m-0">
          ¿Quieres pantalla completa?{" "}
          <Link to="/demo">Abrir demo del asistente</Link>
        </p>
      )}
    </div>
  );
}

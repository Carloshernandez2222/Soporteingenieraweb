import { ChatEmbedShell } from "@/components/chat";
import { IconSearch } from "@/components/Icons";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function AsistentePanel() {
  useDocumentTitle("Asistente");
  const { user } = useAuth();
  const storageKey = user ? `trackaid_panel_chat_${user.id}` : undefined;

  return (
    <>
      <PageHeader
        icon={<IconSearch size={26} />}
        title="Asistente de soporte"
        subtitle="Tu conversación se conserva mientras uses tu cuenta en el panel."
      />
      <div className="card animate-in">
        <ChatEmbedShell
          variant="full"
          showFooter={false}
          title="Asistente TrackAid"
          subtitle="Sesión activa"
          storageKey={storageKey}
        />
      </div>
    </>
  );
}

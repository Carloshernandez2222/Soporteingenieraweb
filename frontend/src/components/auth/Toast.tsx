
type ToastProps = {
  variant: "error" | "success";
  message: string;
  onClose?: () => void;
};

export function Toast({ variant, message, onClose }: ToastProps) {
  const isError = variant === "error";
  return (
    <div
      role="alert"
      className={`
        fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
        ${isError ? "bg-red-500 text-white" : "bg-emerald-500 text-white"}
      `}
    >
      {isError ? (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
          <span className="text-lg font-bold">!</span>
        </span>
      ) : (
        <svg className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      <span className="font-medium">{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-2 p-1 rounded hover:bg-white/20 transition-colors"
          aria-label="Cerrar"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
}

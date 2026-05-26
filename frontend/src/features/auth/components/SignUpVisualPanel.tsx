import { publicAsset } from "@/lib/assets";

export function SignUpVisualPanel() {
  return (
    <div className="relative h-full min-h-[60vh] lg:min-h-screen w-full overflow-hidden bg-slate-900">
      <img
        src={publicAsset("images/auth-panel.png")}
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-slate-900/40" />
    </div>
  );
}

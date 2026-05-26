import { Link } from "react-router-dom";
import { publicAsset } from "@/lib/assets";

export function AuthLogo() {
  return (
    <Link
      to="/"
      className="inline-flex items-center text-gray-850 no-underline"
      aria-label="TrackAid - Ir al inicio"
    >
      <img
        src={publicAsset("images/logo.png")}
        alt="TrackAid"
        width={160}
        height={48}
        className="h-10 w-auto object-contain"
      />
    </Link>
  );
}

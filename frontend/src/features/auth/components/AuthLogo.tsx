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
        width={210}
        height={62}
        className="h-12 w-auto object-contain"
      />
    </Link>
  );
}

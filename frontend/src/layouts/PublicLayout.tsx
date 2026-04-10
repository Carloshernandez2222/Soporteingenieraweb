import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="trackaid-public min-h-screen antialiased bg-white text-gray-850">
      <Outlet />
    </div>
  );
}

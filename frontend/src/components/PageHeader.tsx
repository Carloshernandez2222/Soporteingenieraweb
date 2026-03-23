import { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  meta?: ReactNode;
};

export default function PageHeader({ title, subtitle, icon, meta }: Props) {
  return (
    <header className="page-header animate-in">
      {icon && <div className="page-header-icon">{icon}</div>}
      <div className="page-header-text">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {meta && <div className="page-header-meta">{meta}</div>}
    </header>
  );
}

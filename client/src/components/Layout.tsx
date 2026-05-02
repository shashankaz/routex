import type { ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./Button";

interface TopbarProps {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
}

function Topbar({ title, subtitle, right }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-stone-100">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏠</span>
          <div>
            <p className="font-bold text-stone-800 leading-none text-sm">
              {title ?? "Society HomeChef"}
            </p>
            {subtitle && (
              <p className="text-xs text-stone-400 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {right}
      </div>
    </header>
  );
}

interface LayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  topbarRight?: ReactNode;
}

export function Layout({
  children,
  title,
  subtitle,
  topbarRight,
}: LayoutProps) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <Topbar
        title={title}
        subtitle={subtitle}
        right={
          topbarRight ?? (
            <div className="flex items-center gap-3">
              {user && (
                <span className="text-xs text-stone-500 hidden sm:block">
                  {user.name} ·{" "}
                  <span className="capitalize">{user.role.toLowerCase()}</span>
                </span>
              )}
              <Button variant="ghost" size="sm" onClick={() => void logout()}>
                Sign out
              </Button>
            </div>
          )
        }
      />
      <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

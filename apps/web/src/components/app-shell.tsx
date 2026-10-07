"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { LanguageSwitch } from "@/components/language-switch";

const navItems = [
  { href: "/", key: "home" as const },
  { href: "/recents", key: "recents" as const },
  { href: "/playlists", key: "playlists" as const },
  { href: "/charts", key: "charts" as const },
  { href: "/friends", key: "friends" as const },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <div className="flex min-h-full bg-background text-foreground">
      <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-surface px-4 py-6">
        <div className="mb-8 px-2">
          <p className="text-xl font-semibold tracking-tight text-accent">{t("app.name")}</p>
          <p className="mt-1 text-sm text-muted">{t("app.tagline")}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-surface-elevated text-foreground"
                    : "text-muted hover:bg-surface-elevated hover:text-foreground",
                )}
              >
                {t(`nav.${item.key}`)}
              </Link>
            );
          })}
        </nav>
        <div className="mt-6 border-t border-border pt-4">
          <LanguageSwitch />
        </div>
      </aside>
      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}

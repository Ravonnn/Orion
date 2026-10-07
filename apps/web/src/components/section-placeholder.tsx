"use client";

import { useTranslation } from "react-i18next";

type SectionKey = "home" | "recents" | "playlists" | "charts" | "friends";

export function SectionPlaceholder({ section }: { section: SectionKey }) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        {t(`${section}.title`)}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted">{t(`${section}.placeholder`)}</p>
    </div>
  );
}

/** Strapi stores file size in kilobytes. */
export function formatFileSize(sizeKb: number | null | undefined): string | null {
  if (sizeKb == null) return null;
  if (sizeKb < 1024) return `${Math.max(1, Math.round(sizeKb))} KB`;
  return `${(sizeKb / 1024).toFixed(1)} MB`;
}

export function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat("ar-LY", { year: "numeric", month: "long", day: "numeric" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export const LANGUAGE_LABEL: Record<string, string> = {
  ar:   "العربية",
  en:   "English",
  both: "ثنائي اللغة",
};

export function fileExtBadge(ext: string | null | undefined): string {
  return (ext ?? "").replace(/^\./, "").toUpperCase() || "FILE";
}

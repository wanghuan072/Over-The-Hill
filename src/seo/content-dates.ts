import dates from "./page-dates.json";
export function pageUpdatedAt(path: string): string {
  const entry = dates[path as keyof typeof dates];
  if (!entry)
    throw new Error(
      `Missing content date for ${path}. Run npm run content:dates.`,
    );
  return entry.updatedAt;
}

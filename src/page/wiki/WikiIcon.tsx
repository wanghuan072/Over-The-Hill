export default function WikiIcon({ category }: { category: string }) {
  const paths: Record<string, string> = {
    equipment:
      "M15 4a7 7 0 0 0-8 9L2 18a3 3 0 0 0 4 4l5-5a7 7 0 0 0 9-8l-5 5-5-5 5-5Z",
    collectibles: "m3 8 5-5h8l5 5-9 14L3 8Zm0 0h18M8 3l4 19 4-19",
    upgrades: "M5 20V4m7 16V4m7 16V4M2 8h6m1 8h6m1-8h6",
    wildlife: "M3 17c5 0 6-7 10-7l-2-4 5 2 4-1-1 4 3 3-6 1-4 5H5m3-3-5-6 8 3",
    achievements:
      "M7 3h10v6a5 5 0 0 1-10 0V3Zm0 2H3v3a4 4 0 0 0 5 4m9-7h4v3a4 4 0 0 1-5 4m-4 2v7m-5 0h10",
  };
  return (
    <svg
      viewBox="0 0 24 26"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[category]} />
    </svg>
  );
}

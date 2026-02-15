interface StarRatingProps {
  level: 1 | 2 | 3;
}

export function StarRating({ level }: StarRatingProps) {
  const filled = Math.min(3, Math.floor(level));
  const empty = 3 - filled;
  
  return (
    <span className="text-yellow-500 tracking-wider">
      {"★".repeat(filled)}
      <span className="opacity-40">{"☆".repeat(empty)}</span>
    </span>
  );
}

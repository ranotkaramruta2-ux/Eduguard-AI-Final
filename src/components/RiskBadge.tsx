interface Props {
  level: 'low' | 'medium' | 'high';
  showScore?: boolean;
  score?: number;
}

export default function RiskBadge({ level, showScore, score }: Props) {
  return (
    <span className={`risk-badge-${level}`}>
      <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
        level === 'low' ? 'bg-risk-low' : level === 'medium' ? 'bg-risk-medium' : 'bg-risk-high'
      }`} />
      {level.charAt(0).toUpperCase() + level.slice(1)} Risk
      {showScore && score !== undefined && ` (${score}%)`}
    </span>
  );
}

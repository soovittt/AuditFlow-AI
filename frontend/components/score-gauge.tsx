"use client"

interface ScoreGaugeProps {
  score: number
  size?: number
}

export function ScoreGauge({ score, size = 120 }: ScoreGaugeProps) {
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (score / 100) * circumference

  const getScoreConfig = (score: number) => {
    if (score >= 80)
      return {
        color: "#10b981",
        bgColor: "#10b981/20",
        textColor: "text-emerald-400",
      }
    if (score >= 60)
      return {
        color: "#f59e0b",
        bgColor: "#f59e0b/20",
        textColor: "text-amber-400",
      }
    return {
      color: "#ef4444",
      bgColor: "#ef4444/20",
      textColor: "text-red-400",
    }
  }

  const config = getScoreConfig(score)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="6"
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={config.color}
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 8px ${config.color}40)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className={`text-2xl font-bold ${config.textColor}`}>{score}%</div>
          <div className="text-xs text-gray-500">Score</div>
        </div>
      </div>
    </div>
  )
}

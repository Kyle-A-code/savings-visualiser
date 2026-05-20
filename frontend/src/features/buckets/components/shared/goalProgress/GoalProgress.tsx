import * as Progress from "@radix-ui/react-progress";
import "./goalProgress.css";
import type { Goal } from "../../../types";

interface GoalProgressProps {
  goal: Goal;
  currentAmount: number;
}

const GoalProgress = ({
  goal,
  currentAmount,
}: GoalProgressProps) => {
  const { title, amount } = goal;
  const progressValue = Math.min((currentAmount / amount) * 100, 100);
  const roundedPercent = Math.round(progressValue);

  return (
    <section className="goal-progress" aria-label={`Progress toward ${title} goal`}>
      <div className="goal-progress-header">
        <p className="goal-progress-title">{title}</p>
        <p className="goal-progress-percent">{roundedPercent}%</p>
      </div>
      <Progress.Root
        className="goal-progress-track"
        value={progressValue}
        max={100}
        aria-label={`${title} progress`}
      >
        <Progress.Indicator
          className="goal-progress-indicator"
          style={{ transform: `translateX(-${100 - progressValue}%)` }}
        />
      </Progress.Root>
      <p className="goal-progress-amounts">
        ${currentAmount.toFixed(2)} of ${amount.toFixed(2)}
      </p>
    </section>
  );
};

export default GoalProgress;

import * as Progress from "@radix-ui/react-progress";
import "./goalProgress.css";
import type { Goal } from "../../../types";
import DeleteGoalDialog from "../../detail/deleteGoalDialog/DeleteGoalDialog";
import UpdateGoalDialog from "../../detail/updateGoalDialog/UpdateGoalDialog";

interface GoalProgressProps {
  goal: Goal;
  currentAmount: number;
  showActions?: boolean;
}

const GoalProgress = ({
  goal,
  currentAmount,
  showActions = false,
}: GoalProgressProps) => {
  const { bucketId, title, amount } = goal;
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
      <div className="goal-progress-footer">
        <p className="goal-progress-amounts">
          ${currentAmount.toFixed(2)} of ${amount.toFixed(2)}
        </p>
        {showActions && (
          <div className="goal-progress-actions">
            <UpdateGoalDialog
              bucketId={bucketId}
              currentTitle={title}
              currentAmount={amount}
            />
            <DeleteGoalDialog bucketId={bucketId} goalTitle={title} />
          </div>
        )}
      </div>
    </section>
  );
};

export default GoalProgress;

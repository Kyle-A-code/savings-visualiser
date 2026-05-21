import { useState } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import * as Tooltip from "@radix-ui/react-tooltip";
import "./deleteGoalDialog.css";
import "../../../../../components/dialog/dialog.css";
import { RubbishIcon } from "../../../../../components/icons";
import { useDeleteBucketGoal } from "../../../api/deleteBucketGoal";

interface DeleteGoalDialogProps {
  bucketId: number;
  goalTitle: string;
}

const DeleteGoalDialog = ({ bucketId, goalTitle }: DeleteGoalDialogProps) => {
  const [open, setOpen] = useState(false);
  const { deleteBucketGoal, isPending, isError } = useDeleteBucketGoal();

  const handleDelete = () => {
    deleteBucketGoal(bucketId, {
      onSuccess: () => {
        setOpen(false);
      },
    });
  };

  return (
    <>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            className="ui-btn ui-btn-icon ui-focus-ring goal-delete-trigger"
            aria-label="Delete goal"
            onClick={() => setOpen(true)}
          >
            <RubbishIcon width={16} height={16} />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="ui-tooltip" sideOffset={6}>
            Delete goal
            <Tooltip.Arrow className="ui-tooltip-arrow" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
      <AlertDialog.Root open={open} onOpenChange={setOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="dialog-overlay" />
          <AlertDialog.Content className="dialog-content ui-panel goal-delete-dialog-content">
            <div className="goal-delete-dialog-body">
              <AlertDialog.Title className="goal-delete-dialog-title">
                Delete Goal?
              </AlertDialog.Title>
              <AlertDialog.Description className="goal-delete-dialog-description">
                Are you sure you want to delete this goal? This action is
                permanent and progress for{" "}
                <span className="goal-delete-dialog-emphasis">{goalTitle}</span>{" "}
                will be removed.
              </AlertDialog.Description>
              {isError && (
                <p className="goal-delete-dialog-error" role="alert">
                  Error deleting goal, please try again.
                </p>
              )}
            </div>
            <div className="goal-delete-dialog-actions">
              <AlertDialog.Action asChild>
                <button
                  type="button"
                  className="ui-btn ui-btn-primary ui-focus-ring dialog-btn-primary dialog-btn-danger goal-delete-dialog-confirm"
                  onClick={handleDelete}
                  disabled={isPending}
                >
                  {isPending ? "Deleting…" : "Delete goal"}
                </button>
              </AlertDialog.Action>
              <AlertDialog.Cancel asChild>
                <button
                  type="button"
                  className="ui-btn ui-btn-surface ui-focus-ring goal-delete-dialog-cancel"
                >
                  Cancel
                </button>
              </AlertDialog.Cancel>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  );
};

export default DeleteGoalDialog;

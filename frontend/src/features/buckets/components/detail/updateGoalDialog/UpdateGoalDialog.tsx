import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tooltip from "@radix-ui/react-tooltip";
import { DialogPrimitive } from "../../../../../components/dialog";
import { PencilIcon } from "../../../../../components/icons";
import { usePatchBucketGoal } from "../../../api/patchBucketGoal";

interface UpdateGoalDialogProps {
  bucketId: number;
  currentTitle: string;
  currentAmount: number;
}

const UpdateGoalDialog = ({
  bucketId,
  currentTitle,
  currentAmount,
}: UpdateGoalDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(currentTitle);
  const [amount, setAmount] = useState(currentAmount.toFixed(2));
  const { patchBucketGoal, isPending, isError } = usePatchBucketGoal();

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      return;
    }

    setTitle(currentTitle);
    setAmount(currentAmount.toFixed(2));
  };

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextTitle = title.trim();
    const parsedAmount = Number.parseFloat(amount);

    if (!nextTitle || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    patchBucketGoal(
      { bucketId, title: nextTitle, amount: parsedAmount },
      {
        onSuccess: () => {
          setOpen(false);
        },
      },
    );
  };

  return (
    <>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            className="ui-btn ui-btn-icon ui-btn-ghost ui-focus-ring dialog-trigger"
            aria-label="Edit goal"
            onClick={() => handleOpenChange(true)}
          >
            <PencilIcon width={14} height={14} />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="ui-tooltip" sideOffset={6}>
            Edit goal
            <Tooltip.Arrow className="ui-tooltip-arrow" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
      <DialogPrimitive
        open={open}
        onOpenChange={handleOpenChange}
        trigger={null}
      >
        <header className="dialog-header">
          <div className="dialog-header-text">
            <Dialog.Title className="dialog-title">Edit Goal</Dialog.Title>
            <Dialog.Description className="dialog-lede">
              Update the goal title and target amount for this bucket.
            </Dialog.Description>
          </div>
          <Dialog.Close asChild>
            <button
              type="button"
              className="ui-btn ui-btn-icon ui-btn-ghost ui-focus-ring dialog-close-icon"
              aria-label="Close"
            >
              <span aria-hidden>×</span>
            </button>
          </Dialog.Close>
        </header>
        <form className="dialog-form" onSubmit={handleSubmit}>
          <div className="dialog-field">
            <label
              htmlFor="update-goal-title"
              className="dialog-label ui-eyebrow"
            >
              Goal title
            </label>
            <div className="dialog-input-group">
              <input
                id="update-goal-title"
                name="title"
                className="dialog-input"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. New laptop"
                required
                autoComplete="off"
              />
            </div>
          </div>
          <div className="dialog-field">
            <label
              htmlFor="update-goal-amount"
              className="dialog-label ui-eyebrow"
            >
              Target amount
            </label>
            <div className="dialog-input-group dialog-amount-input-wrapper">
              <span className="dialog-amount-prefix" aria-hidden>
                $
              </span>
              <input
                id="update-goal-amount"
                name="amount"
                className="dialog-input"
                data-variant="amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>
          {isError && (
            <p className="dialog-error" role="alert">
              Error updating goal, please try again.
            </p>
          )}
          <div className="dialog-footer-actions">
            <Dialog.Close asChild>
              <button
                type="button"
                className="ui-btn ui-btn-ghost ui-focus-ring dialog-btn-ghost"
              >
                Cancel
              </button>
            </Dialog.Close>
            <button
              type="submit"
              className="ui-btn ui-btn-primary ui-focus-ring dialog-btn-primary"
              disabled={
                isPending || title.trim() === "" || amount.trim() === ""
              }
            >
              {isPending ? "Saving…" : "Save goal"}
            </button>
          </div>
        </form>
      </DialogPrimitive>
    </>
  );
};

export default UpdateGoalDialog;

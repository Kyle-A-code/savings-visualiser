import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { DialogPrimitive } from "../../../../../components/dialog";
import { useCreateBucketGoal } from "../../../api/createBucketGoal";

interface CreateGoalDialogProps {
  bucketId: string;
  trigger: ReactNode;
}

const CreateGoalDialog = ({ bucketId, trigger }: CreateGoalDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const { createBucketGoal, isPending, isError } = useCreateBucketGoal();

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextTitle = title.trim();
    const parsedAmount = Number.parseFloat(amount);

    if (!nextTitle || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    createBucketGoal(
      { bucketId, title: nextTitle, amount: parsedAmount },
      {
        onSuccess: () => {
          setOpen(false);
          setTitle("");
          setAmount("");
        },
      },
    );
  };

  return (
    <DialogPrimitive open={open} onOpenChange={setOpen} trigger={trigger}>
      <header className="dialog-header">
        <div className="dialog-header-text">
          <Dialog.Title className="dialog-title">Create Goal</Dialog.Title>
          <Dialog.Description className="dialog-lede">
            Set a target for this bucket and track progress as you save.
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
          <label htmlFor={`goal-title-${bucketId}`} className="dialog-label ui-eyebrow">
            Goal title
          </label>
          <div className="dialog-input-group">
            <input
              id={`goal-title-${bucketId}`}
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
          <label htmlFor={`goal-amount-${bucketId}`} className="dialog-label ui-eyebrow">
            Target amount
          </label>
          <div className="dialog-input-group dialog-amount-input-wrapper">
            <span className="dialog-amount-prefix" aria-hidden>
              $
            </span>
            <input
              id={`goal-amount-${bucketId}`}
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
            Error creating goal, please try again.
          </p>
        )}
        <div className="dialog-footer-actions">
          <Dialog.Close asChild>
            <button type="button" className="ui-btn ui-btn-ghost ui-focus-ring dialog-btn-ghost">
              Cancel
            </button>
          </Dialog.Close>
          <button
            type="submit"
            className="ui-btn ui-btn-primary ui-focus-ring dialog-btn-primary"
            disabled={isPending || title.trim() === "" || amount.trim() === ""}
          >
            {isPending ? "Creating…" : "Create goal"}
          </button>
        </div>
      </form>
    </DialogPrimitive>
  );
};

export default CreateGoalDialog;

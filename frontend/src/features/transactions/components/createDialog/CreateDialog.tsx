import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useCreateTransaction } from "../../api/createTransaction";
import { DialogPrimitive } from "../../../../components/dialog";
import { MinusIcon, PlusIcon } from "../../../../components/icons";
import type { ReactNode } from "react";
import "./createDialog.css";

interface CreateDialogProps {
  bucketId: number;
  trigger?: ReactNode | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const CreateDialog = ({
  bucketId,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: CreateDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled =
    controlledOpen !== undefined && controlledOnOpenChange !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen;
  const [isCredit, setIsCredit] = useState(true);
  const { createTransaction, isPending, isError } = useCreateTransaction();

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const title = formData.get("title") as string;
    const amount = formData.get("amount") as string;
    const parsedAmount = parseFloat(amount);
    // TODO: would be nice to render the error message in the form
    const isInvalidAmount = Number.isNaN(parsedAmount) || parsedAmount <= 0;

    const signedAmount = isCredit ? parsedAmount : -parsedAmount;

    if (isInvalidAmount) {
      return;
    }

    createTransaction(
      {
        title,
        amount: signedAmount,
        bucketId,
      },
      {
        onSuccess: () => {
          setOpen(false);
        },
      },
    );
  };

  return (
    <DialogPrimitive
      open={open}
      onOpenChange={setOpen}
      trigger={
        trigger === null
          ? null
          : (trigger ?? (
              <button
                className="dialog-trigger dialog-trigger-success"
                type="button"
              >
                {isCredit ? "Credit" : "Debit"}
              </button>
            ))
      }
    >
      <header className="dialog-header">
        <div className="dialog-header-text">
          <Dialog.Title className="dialog-title">Add Transaction</Dialog.Title>
          <Dialog.Description className="dialog-lede">
            Record a credit or debit for this bucket.
          </Dialog.Description>
        </div>
        <Dialog.Close asChild>
          <button
            type="button"
            className="dialog-close-icon"
            aria-label="Close"
          >
            <span aria-hidden>×</span>
          </button>
        </Dialog.Close>
      </header>
      <form className="dialog-form" onSubmit={handleSubmit}>
        <div className="dialog-field">
          <label htmlFor="transaction-title" className="dialog-label">
            Transaction title
          </label>
          <div className="dialog-input-group">
            <input
              id="transaction-title"
              name="title"
              className="dialog-input"
              type="text"
              placeholder="e.g. Monthly rent"
              required
              autoComplete="off"
            />
          </div>
        </div>
        <div className="dialog-field">
          <label htmlFor="transaction-amount" className="dialog-label">
            Amount
          </label>
          <div className="dialog-input-group dialog-amount-input-wrapper">
            <span className="dialog-amount-prefix" aria-hidden>
              $
            </span>
            <input
              id="transaction-amount"
              name="amount"
              className="dialog-input dialog-input--amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              required
              aria-label="Amount"
            />
          </div>
        </div>
        {isError && (
          <p className="dialog-error" role="alert">
            Error creating transaction, please try again.
          </p>
        )}
        <div className="dialog-field">
          <p className="dialog-label" id="transaction-type-label">
            Transaction type
          </p>
          <div
            className="tx-type-row"
            role="group"
            aria-labelledby="transaction-type-label"
          >
            <div className="tx-type-option">
              <button
                type="button"
                className="tx-type-btn tx-type-btn--debit"
                data-state={!isCredit ? "active" : undefined}
                aria-pressed={!isCredit}
                onClick={() => setIsCredit(false)}
              >
                <MinusIcon width={20} height={20} aria-hidden />
                Debit
              </button>
            </div>
            <div className="tx-type-option">
              <button
                type="button"
                className="tx-type-btn tx-type-btn--credit"
                data-state={isCredit ? "active" : undefined}
                aria-pressed={isCredit}
                onClick={() => setIsCredit(true)}
              >
                <PlusIcon width={20} height={20} aria-hidden />
                Credit
              </button>
            </div>
          </div>
        </div>
        <div className="dialog-footer-actions">
          <Dialog.Close asChild>
            <button type="button" className="dialog-btn-ghost">
              Cancel
            </button>
          </Dialog.Close>
          <button
            type="submit"
            className="dialog-btn-primary"
            disabled={isPending}
          >
            {isPending ? "Adding…" : "Add transaction"}
          </button>
        </div>
      </form>
    </DialogPrimitive>
  );
};

export default CreateDialog;

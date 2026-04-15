import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useCreateTransaction } from "../../api/createTransaction";
import { DialogPrimitive } from "../../../../components/dialog";
import { MinusIcon, PlusIcon } from "../../../../components/icons";
import type { ReactNode } from "react";
import "./createDialog.css";

interface CreateDialogProps {
  bucketId: number;
  trigger?: ReactNode;
}

const CreateDialog = ({ bucketId, trigger }: CreateDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isCredit, setIsCredit] = useState(true);
  const { createTransaction, isPending, isError } = useCreateTransaction();

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const title = formData.get("title") as string;
    const amount = formData.get("amount") as string;
    const parsedAmount = parseFloat(amount);
    // would be nice to render the error message in the form
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
        trigger ?? (
          <button className="dialog-trigger dialog-trigger-success">
            {isCredit ? "Credit" : "Debit"}
          </button>
        )
      }
    >
      <Dialog.Title className="dialog-title">
        {isCredit ? "Credit" : "Debit"}
      </Dialog.Title>
      <Dialog.Description className="dialog-description">
        {isCredit ? "Credit the bucket." : "Debit the bucket."}
      </Dialog.Description>
      <form className="dialog-form" onSubmit={handleSubmit}>
        <fieldset>
          <label htmlFor="transaction-title">TRANSACTION TITLE</label>
          <input
            type="text"
            id="transaction-title"
            name="title"
            placeholder="e.g: Rent"
            required
          />
        </fieldset>
        <fieldset>
          <label htmlFor="transaction-amount">AMOUNT</label>
          <div className="dialog-amount-input-wrapper">
            <span aria-hidden className="dialog-amount-prefix">
              $
            </span>
            <input
              type="number"
              aria-label="Credit amount"
              id="transaction-amount"
              min="0.01"
              step="0.01"
              name="amount"
              placeholder="0.00"
              required
            />
          </div>
        </fieldset>
        {isError && (
          <p className="dialog-error">
            Error creating transaction, please try again.
          </p>
        )}
        <div>
          <label>TRANSACTION TYPE</label>
          <div className="transaction-type-container">
            <button data-state={isCredit ? "" : "active"} type="button" onClick={() => setIsCredit(false)}>
              <MinusIcon width={18} height={18} />
              Debit
            </button>
            <button data-state={isCredit ? "active" : ""} type="button" onClick={() => setIsCredit(true)}>
              <PlusIcon width={18} height={18} />
              Credit
            </button>
          </div>
        </div>
        <div className="dialog-actions">
          <Dialog.Close asChild>
            <button className="dialog-close-button">Cancel</button>
          </Dialog.Close>
          <button
            type="submit"
            disabled={isPending}
            className="dialog-submit-success"
          >
            {isPending ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </DialogPrimitive>
  );
};

export default CreateDialog;

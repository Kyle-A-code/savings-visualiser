import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useCreateTransaction } from "../../api/createTransaction";
import { DialogPrimitive } from "../../../../components/dialog";
import type { ReactNode } from "react";

interface CreateDialogProps {
  bucketId: number;
  isCredit: boolean;
  trigger?: ReactNode;
}

const creditInput = ({ id }: { id: string }) => {
  return (
    <div className="dialog-amount-input-wrapper">
      <span aria-hidden className="dialog-amount-prefix">
        $
      </span>
      <input
        type="number"
        aria-label="Credit amount"
        id={id}
        min="0.01"
        step="0.01"
        name="amount"
        required
      />
    </div>
  );
};

const debitInput = ({ id }: { id: string }) => {
  return (
    <div className="dialog-amount-input-wrapper">
      <span aria-hidden className="dialog-amount-prefix">
        $
      </span>
      <input
        aria-label="Debit amount"
        type="number"
        id={id}
        max="-0.01"
        step="0.01"
        name="amount"
        required
      />
    </div>
  );
};

const CreateDialog = ({ bucketId, isCredit, trigger }: CreateDialogProps) => {
  const [open, setOpen] = useState(false);
  const { createTransaction, isPending, isError } = useCreateTransaction();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const title = formData.get("title") as string;
    const amount = formData.get("amount") as string;
    const parsedAmount = parseFloat(amount);
    const isInvalidAmount =
      Number.isNaN(parsedAmount) ||
      (isCredit && parsedAmount <= 0) ||
      (!isCredit && parsedAmount >= 0);

    if (isInvalidAmount) {
      return;
    }

    createTransaction(
      {
        title,
        amount: parsedAmount,
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
          <label htmlFor="transaction-title">Title</label>
          <input type="text" id="transaction-title" name="title" required />
        </fieldset>
        <fieldset>
          <label htmlFor="transaction-amount">Amount</label>
          {isCredit
            ? creditInput({ id: "transaction-amount" })
            : debitInput({ id: "transaction-amount" })}
        </fieldset>
        {isError && (
          <p className="dialog-error">
            Error creating transaction, please try again.
          </p>
        )}
        <div className="dialog-actions">
          <Dialog.Close asChild>
            <button type="button" className="dialog-close-button">Cancel</button>
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

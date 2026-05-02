import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useCreateBucket } from "../../../api/createBucket";
import { DialogPrimitive } from "../../../../../components/dialog";
import { CirclePlusIcon } from "../../../../../components/icons";

const CreateDialog = () => {
  const [open, setOpen] = useState(false);
  const { createBucket, isPending, isError } = useCreateBucket();

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const title = formData.get("title") as string;
    const amount = formData.get("amount") as string;
    createBucket(
      { title, amount: parseFloat(amount) },
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
        <button className="ui-btn ui-btn-gradient ui-focus-ring dialog-trigger" type="button">
          <CirclePlusIcon width={18} height={18} />
          Create New Bucket
        </button>
      }
    >
      <header className="dialog-header">
        <div className="dialog-header-text">
          <Dialog.Title className="dialog-title">Create Bucket</Dialog.Title>
          <Dialog.Description className="dialog-lede">
            Create a new bucket to track your savings.
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
          <label htmlFor="bucket-title" className="dialog-label ui-eyebrow">
            Bucket title
          </label>
          <div className="dialog-input-group">
            <input
              id="bucket-title"
              name="title"
              className="dialog-input"
              type="text"
              placeholder="e.g. Emergency fund"
              required
              autoComplete="off"
            />
          </div>
        </div>
        <div className="dialog-field">
          <label htmlFor="bucket-amount" className="dialog-label ui-eyebrow">
            Starting amount
          </label>
          <div className="dialog-input-group dialog-amount-input-wrapper">
            <span className="dialog-amount-prefix" aria-hidden>
              $
            </span>
            <input
              id="bucket-amount"
              name="amount"
              className="dialog-input"
              data-variant="amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>
        </div>
        {isError && (
          <p className="dialog-error" role="alert">
            Error creating bucket, please try again.
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
            disabled={isPending}
          >
            {isPending ? "Creating…" : "Create bucket"}
          </button>
        </div>
      </form>
    </DialogPrimitive>
  );
};

export default CreateDialog;

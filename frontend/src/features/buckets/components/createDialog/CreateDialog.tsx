import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useCreateBucket } from "../../api/createBucket";
import { DialogPrimitive } from "../../../../components/dialog";
import { CirclePlusIcon } from "../../../../components/icons";

const CreateDialog = () => {
  const [open, setOpen] = useState(false);
  const { createBucket, isPending, isError } = useCreateBucket();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
        <button className="dialog-trigger dialog-trigger-primary" type="button">
          <CirclePlusIcon width={18} height={18} />
          Create New Bucket
        </button>
      }
    >
      <Dialog.Title className="dialog-title">Create Bucket</Dialog.Title>
      <Dialog.Description className="dialog-description">
        Create a new bucket to track your savings.
      </Dialog.Description>
      <form className="dialog-form" onSubmit={handleSubmit}>
        <fieldset>
          <label htmlFor="title">Title</label>
          <input type="text" id="title" name="title" required />
        </fieldset>
        <fieldset>
          <label htmlFor="amount">Amount</label>
          <input type="number" id="amount" name="amount" min="0" step="0.01" required />
        </fieldset>
        {isError && (
          <p className="dialog-error">
            Error creating bucket, please try again.
          </p>
        )}
        <div className="dialog-actions">
          <Dialog.Close asChild>
            <button type="button" className="dialog-close-button">Cancel</button>
          </Dialog.Close>
          <button
            type="submit"
            disabled={isPending}
            className="dialog-submit-primary"
          >
            {isPending ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </DialogPrimitive>
  );
};

export default CreateDialog;

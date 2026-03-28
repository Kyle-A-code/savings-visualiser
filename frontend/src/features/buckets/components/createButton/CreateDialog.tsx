
import { useState } from "react";
import { useCreateBucket } from "../../api/createBucket";
import * as Dialog from "@radix-ui/react-dialog";
import "./createDialog.css";

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
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="create-bucket-trigger">Create Bucket</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="create-dialog-overlay" />
        <Dialog.Content className="create-dialog-content">
          <Dialog.Title className="create-dialog-title">Create Bucket</Dialog.Title>
          <Dialog.Description className="create-dialog-description">
            Create a new bucket to track your savings.
          </Dialog.Description>
          <form className="create-dialog-form" onSubmit={handleSubmit}>
            <fieldset>
              <label htmlFor="title">Title</label>
              <input type="text" id="title" name="title" required />
            </fieldset>
            <fieldset>
              <label htmlFor="amount">Amount</label>
              <input type="number" id="amount" name="amount" min="0" step="0.01" required />
            </fieldset>
            {isError && <p className="create-dialog-error">Error creating bucket, please try again.</p>}
            <div className="create-dialog-actions">
              <Dialog.Close asChild>
                <button type="button">Cancel</button>
              </Dialog.Close>
              <button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CreateDialog;

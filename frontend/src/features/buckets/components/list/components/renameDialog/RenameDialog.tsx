import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { DialogPrimitive } from "../../../../../../components/dialog";
import { usePatchBucket } from "../../../../api/patchBucket";

interface RenameDialogProps {
  id: number;
  currentTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RenameDialog = ({ id, currentTitle, open, onOpenChange }: RenameDialogProps) => {
  const [title, setTitle] = useState('');
  const { patchBucket, isPending, isError } = usePatchBucket();

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle) {
      return;
    }

    patchBucket(
      { id, title: nextTitle },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <DialogPrimitive open={open} onOpenChange={onOpenChange} trigger={null}>
      <header className="dialog-header">
        <div className="dialog-header-text">
          <Dialog.Title className="dialog-title">Rename Bucket</Dialog.Title>
          <Dialog.Description className="dialog-lede">
            Update your bucket title to keep your savings goals organized.
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
          <label htmlFor={`rename-bucket-title-${id}`} className="dialog-label ui-eyebrow">
            Bucket title
          </label>
          <div className="dialog-input-group">
            <input
              id={`rename-bucket-title-${id}`}
              name="title"
              className="dialog-input"
              type="text"
              value={title}
              placeholder={currentTitle}
              onChange={(event) => setTitle(event.target.value)}
              required
              autoComplete="off"
            />
          </div>
        </div>
        {isError && (
          <p className="dialog-error" role="alert">
            Error renaming bucket, please try again.
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
            disabled={isPending || title.trim() === ""}
          >
            {isPending ? "Saving…" : "Save title"}
          </button>
        </div>
      </form>
    </DialogPrimitive>
  );
};

export default RenameDialog;

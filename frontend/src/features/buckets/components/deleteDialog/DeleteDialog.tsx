import { useState } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import type { ReactNode } from "react";
import "../../../../components/dialog/dialog.css";
import "./deleteDialog.css";
import { useDeleteBucket } from "../../api/deleteBucket";
import { RubbishIcon } from "../../../../components/icons";

interface DeleteDialogProps {
  id: string;
  bucketTitle: string;
  trigger?: ReactNode | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const DeleteDialog = ({
  id,
  bucketTitle,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: DeleteDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled =
    controlledOpen !== undefined && controlledOnOpenChange !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen;
  const { deleteBucket, isPending, isError } = useDeleteBucket();

  const handleDelete = () => {
    deleteBucket(id, {
      onSuccess: () => {
        setOpen(false);
      },
    });
  };

  const defaultTrigger = (
    <button type="button" className="delete-button" aria-label="Delete bucket">
      <RubbishIcon width={24} height={24} />
    </button>
  );

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      {trigger === null ? null : (
        <AlertDialog.Trigger asChild>
          {trigger === undefined ? defaultTrigger : trigger}
        </AlertDialog.Trigger>
      )}
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="dialog-overlay" />
        <AlertDialog.Content className="delete-dialog-content">
          <div className="delete-dialog-body">
            <AlertDialog.Title className="delete-dialog-title">
              Delete Bucket?
            </AlertDialog.Title>
            <AlertDialog.Description className="delete-dialog-description">
              Are you sure you want to delete this bucket? This action is permanent and all progress
              for <span className="delete-dialog-emphasis">{bucketTitle}</span> will be archived.
            </AlertDialog.Description>
            {isError && (
              <p className="delete-dialog-error" role="alert">
                Error deleting bucket, please try again.
              </p>
            )}
          </div>
          <div className="delete-dialog-actions">
            <AlertDialog.Action asChild>
              <button
                type="button"
                className="delete-dialog-confirm"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? "Deleting…" : "Delete Bucket"}
              </button>
            </AlertDialog.Action>
            <AlertDialog.Cancel asChild>
              <button type="button" className="delete-dialog-cancel">
                Cancel
              </button>
            </AlertDialog.Cancel>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

export default DeleteDialog;

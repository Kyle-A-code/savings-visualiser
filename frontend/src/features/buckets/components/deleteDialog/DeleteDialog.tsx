import { useState } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import "./deleteDialog.css";
import { useDeleteBucket } from "../../api/deleteBucket";
import { RubbishIcon } from "../../../../components/icons";

interface DeleteDialogProps {
  id: string;
}

const DeleteDialog = ({ id }: DeleteDialogProps) => {
  const [open, setOpen] = useState(false);
  const { deleteBucket, isPending, isError } = useDeleteBucket();

  const handleDelete = () => {
    deleteBucket(id, {
      onSuccess: () => {
        setOpen(false);
      },
    });
  };

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>
        <button className="delete-button" aria-label="Delete bucket">
          <RubbishIcon width={24} height={24} />
        </button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="delete-dialog-overlay" />
        <AlertDialog.Content className="delete-dialog-content">
          <AlertDialog.Title className="delete-dialog-title">Delete Bucket</AlertDialog.Title>
          <AlertDialog.Description className="delete-dialog-description">
            Are you sure you want to delete this bucket?
          </AlertDialog.Description>
          {isError && <p className="delete-dialog-error">Error deleting bucket, please try again.</p>}
          <div className="delete-dialog-actions">
            <AlertDialog.Cancel asChild>
              <button type="button">Cancel</button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                type="button"
                className="delete-dialog-confirm"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? "Deleting..." : "Delete"}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

export default DeleteDialog;

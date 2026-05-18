import { useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { DialogPrimitive } from "../../../../components/dialog";
import { useTransfer } from "../../api/transfer";

interface TransferTarget {
  id: string;
  title: string;
}

interface TransferDialogProps {
  fromBucketId: number;
  fromBucketTitle: string;
  fromBucketBalance: number;
  targets: TransferTarget[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const TransferDialog = ({
  fromBucketId,
  fromBucketTitle,
  fromBucketBalance,
  targets,
  open = false,
  onOpenChange,
}: TransferDialogProps) => {
  const { transfer, isPending, isError } = useTransfer();

  const hasTargets = targets.length > 0;
  const firstTargetId = useMemo(() => targets[0]?.id ?? "", [targets]);
  const maxAmount = useMemo(
    () => Math.max(0, Number(fromBucketBalance.toFixed(2))),
    [fromBucketBalance],
  );
  const canSubmit = hasTargets && maxAmount > 0;

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const toBucketId = Number(formData.get("toBucketId"));
    const amount = Number(formData.get("amount"));
    const amountInvalid =
      Number.isNaN(amount) || amount <= 0 || amount > maxAmount;

    if (Number.isNaN(toBucketId) || amountInvalid) {
      return;
    }

    transfer(
      {
        fromBucketId,
        toBucketId,
        amount,
      },
      {
        onSuccess: () => {
          onOpenChange?.(false);
        },
      },
    );
  };

  return (
    <DialogPrimitive open={open} onOpenChange={onOpenChange ?? (() => {})} trigger={null}>
      <header className="dialog-header">
        <div className="dialog-header-text">
          <Dialog.Title className="dialog-title">Transfer funds</Dialog.Title>
          <Dialog.Description className="dialog-lede">
            Move money from <strong>{fromBucketTitle}</strong> to another bucket.
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
          <label htmlFor={`transfer-target-${fromBucketId}`} className="dialog-label ui-eyebrow">
            To bucket
          </label>
          <div className="dialog-input-group">
            <select
              id={`transfer-target-${fromBucketId}`}
              name="toBucketId"
              className="dialog-input"
              defaultValue={firstTargetId}
              required
              disabled={!hasTargets}
            >
              {targets.map((bucket) => (
                <option key={bucket.id} value={bucket.id}>
                  {bucket.title} (#{bucket.id})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="dialog-field">
          <label htmlFor={`transfer-amount-${fromBucketId}`} className="dialog-label ui-eyebrow">
            Amount
          </label>
          <div className="dialog-input-group">
            <input
              id={`transfer-amount-${fromBucketId}`}
              name="amount"
              className="dialog-input"
              type="number"
              min="0"
              max={maxAmount.toString()}
              step="0.01"
              placeholder="0.00"
              required
              disabled={!canSubmit}
            />
          </div>
        </div>
        {!hasTargets && (
          <p className="dialog-error" role="alert">
            No other buckets available to transfer into.
          </p>
        )}
        {hasTargets && maxAmount <= 0 && (
          <p className="dialog-error" role="alert">
            This bucket has no available balance to transfer.
          </p>
        )}
        {isError && (
          <p className="dialog-error" role="alert">
            Error completing transfer, please try again.
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
            disabled={!canSubmit || isPending}
          >
            {isPending ? "Transferring…" : "Transfer"}
          </button>
        </div>
      </form>
    </DialogPrimitive>
  );
};

export default TransferDialog;

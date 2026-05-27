import { useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { DialogPrimitive } from "../../../../components/dialog";
import { useTransfer } from "../../api/transfer";
import "./transferDialog.css";

interface TransferTarget {
  id: number;
  title: string;
  balance: number;
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
  const [amount, setAmount] = useState(0);

  const firstTargetId = useMemo(() => targets[0]?.id, [targets]);
  const [toBucketId, setToBucketId] = useState(firstTargetId);
  const { transfer, isPending, isError, error } = useTransfer();

  const hasTargets = targets.length > 0;
  const maxAmount = useMemo(
    () => Math.max(0, Number(fromBucketBalance.toFixed(2))),
    [fromBucketBalance],
  );
  const canSubmit = useMemo(
    () => toBucketId != null && amount > 0 && amount <= maxAmount,
    [toBucketId, amount, maxAmount],
  );
  const toBucket = useMemo(
    () => targets.find((target) => target.id === toBucketId),
    [targets, toBucketId],
  );

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

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
          setToBucketId(firstTargetId);
          setAmount(0);
        },
      },
    );
  };

  return (
    <DialogPrimitive
      open={open}
      onOpenChange={onOpenChange ?? (() => {})}
      trigger={null}
    >
      <header className="dialog-header">
        <div className="dialog-header-text">
          <Dialog.Title className="dialog-title">Transfer funds</Dialog.Title>
          <Dialog.Description className="dialog-lede">
            Move money from <strong>{fromBucketTitle}</strong> to another
            bucket.
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
          <label
            htmlFor={`transfer-target-${fromBucketId}`}
            className="dialog-label ui-eyebrow"
          >
            To bucket
          </label>
          <div className="dialog-input-group">
            <select
              id={`transfer-target-${fromBucketId}`}
              name="toBucketId"
              data-variant="select"
              className="dialog-input"
              defaultValue={firstTargetId}
              onChange={(event) => setToBucketId(Number(event.target.value))}
              required
              disabled={!hasTargets}
            >
              {targets.map((bucket) => (
                <option key={bucket.id} value={bucket.id}>
                  {bucket.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="dialog-field">
          <label
            htmlFor={`transfer-amount-${fromBucketId}`}
            className="dialog-label ui-eyebrow"
          >
            Amount
          </label>
          <div className="dialog-input-group">
            <span className="dialog-amount-prefix" aria-hidden>
              $
            </span>
            <input
              id={`transfer-amount-${fromBucketId}`}
              name="amount"
              className="dialog-input"
              data-variant="amount"
              type="number"
              min="0.00"
              step="0.01"
              max={maxAmount.toFixed(2)}
              value={amount.toFixed(2)}
              onChange={(event) => setAmount(Number(event.target.value))}
              required
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
            {error?.message ?? "Error completing transfer, please try again."}
          </p>
        )}
        {toBucket != null && (
          <section
            className="transfer-preview"
            aria-label="Balance preview after transfer"
          >
            <p className="transfer-preview-label ui-eyebrow">After transfer</p>
            <div className="transfer-preview-balances">
              <div className="transfer-preview-balance-item">
                <p className="transfer-preview-caption">
                  <span className="transfer-preview-role">From</span>
                  <span className="transfer-preview-bucket">
                    {fromBucketTitle}
                  </span>
                </p>
                <p className="transfer-preview-balance transfer-preview-balance--from">
                  ${(fromBucketBalance - amount).toFixed(2)}
                </p>
              </div>
              <div className="transfer-preview-balance-item">
                <p className="transfer-preview-caption">
                  <span className="transfer-preview-role">To</span>
                  <span className="transfer-preview-bucket">
                    {toBucket.title}
                  </span>
                </p>
                <p className="transfer-preview-balance transfer-preview-balance--to">
                  ${(toBucket.balance + amount).toFixed(2)}
                </p>
              </div>
            </div>
          </section>
        )}
        <div className="dialog-footer-actions">
          <Dialog.Close asChild>
            <button
              type="button"
              className="ui-btn ui-btn-ghost ui-focus-ring dialog-btn-ghost"
            >
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

import { useState } from "react";
import type { Bucket } from "../../../../types";
import {
  BUCKET_TRANSACTIONS_DEFAULT_LIMIT,
  BUCKET_TRANSACTIONS_DEFAULT_OFFSET,
} from "../../../../constants";
import "./bucketCard.css";
import { Link } from "@tanstack/react-router";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import CreateTransactionDialog from "../../../../../transactions/components/createDialog/CreateDialog";
import TransferDialog from "../../../../../transactions/components/transferDialog/TransferDialog";
import DeleteDialog from "../deleteDialog/DeleteDialog";
import RenameDialog from "../renameDialog/RenameDialog";
import GoalProgress from "../../../shared/goalProgress/GoalProgress";

interface BucketCardProps {
  bucket: Bucket;
  allBuckets: Bucket[];
}

const BucketCard = ({ bucket, allBuckets }: BucketCardProps) => {
  const { id, title, balance, goal } = bucket;
  const [menuOpen, setMenuOpen] = useState(false);
  const [createTransactionOpen, setCreateTransactionOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const transferTargets = allBuckets
    .filter((candidate) => candidate.id !== id)
    .map((candidate) => ({
      id: candidate.id,
      title: candidate.title,
    }));

  const formattedBalance = balance.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <article className="bucket-card ui-panel">
      <div className="bucket-card-bar">
        <h3 className="bucket-card-name">{title}</h3>
        <DropdownMenu.Root open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="ui-btn ui-btn-icon ui-btn-ghost ui-focus-ring bucket-menu"
              aria-label="Bucket actions"
            >
              ⋯
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="bucket-menu-content ui-glass"
              sideOffset={8}
              align="end"
              collisionPadding={16}
            >
              <DropdownMenu.Label className="bucket-menu-label ui-eyebrow">
                Actions
              </DropdownMenu.Label>
              <DropdownMenu.Item
                className="bucket-menu-item"
                onSelect={(e) => {
                  e.preventDefault();
                  setCreateTransactionOpen(true);
                  setMenuOpen(false);
                }}
              >
                <span className="bucket-menu-row">Create transaction</span>
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="bucket-menu-separator" />
              <DropdownMenu.Item
                className="bucket-menu-item"
                onSelect={(e) => {
                  e.preventDefault();
                  setTransferOpen(true);
                  setMenuOpen(false);
                }}
                disabled={transferTargets.length === 0}
              >
                <span className="bucket-menu-row">
                  Transfer to another bucket
                </span>
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="bucket-menu-separator" />
              <DropdownMenu.Item
                className="bucket-menu-item"
                onSelect={(e) => {
                  e.preventDefault();
                  setRenameOpen(true);
                  setMenuOpen(false);
                }}
              >
                <span className="bucket-menu-row" aria-label="Rename bucket">
                  Rename bucket
                </span>
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="bucket-menu-separator" />
              <DropdownMenu.Item
                className="bucket-menu-item bucket-menu-item-danger"
                onSelect={(e) => {
                  e.preventDefault();
                  setDeleteOpen(true);
                  setMenuOpen(false);
                }}
              >
                <span className="bucket-menu-row">Delete bucket</span>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
        <CreateTransactionDialog
          bucketId={Number(id)}
          open={createTransactionOpen}
          onOpenChange={setCreateTransactionOpen}
          trigger={null}
        />
        <TransferDialog
          fromBucketId={Number(id)}
          fromBucketTitle={title}
          fromBucketBalance={balance}
          targets={transferTargets}
          open={transferOpen}
          onOpenChange={setTransferOpen}
        />
        <DeleteDialog
          id={id}
          bucketTitle={title}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          trigger={null}
        />
        <RenameDialog
          id={id}
          currentTitle={title}
          open={renameOpen}
          onOpenChange={setRenameOpen}
        />
      </div>
      <div>
        <span className="bucket-balance-label ui-eyebrow">Current Balance</span>
        <p className="bucket-balance-value">{formattedBalance}</p>
        {goal && (
          <GoalProgress
            goal={goal}
            currentAmount={balance}
          />
        )}
      </div>
      <Link
        to="/buckets/$bucketId"
        params={{ bucketId: id }}
        search={{
          limit: BUCKET_TRANSACTIONS_DEFAULT_LIMIT,
          offset: BUCKET_TRANSACTIONS_DEFAULT_OFFSET,
        }}
        className="ui-btn ui-btn-surface ui-focus-ring bucket-view"
      >
        View Details
      </Link>
    </article>
  );
};

export default BucketCard;

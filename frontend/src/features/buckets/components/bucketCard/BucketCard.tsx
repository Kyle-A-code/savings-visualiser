import { useState } from "react";
import type { Bucket } from "../../types";
import "./bucketCard.css";
import { Link } from "@tanstack/react-router";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import CreateTransactionDialog from "../../../transactions/components/createDialog/CreateDialog";
import DeleteDialog from "../deleteDialog/DeleteDialog";

interface BucketCardProps {
  bucket: Bucket;
}

const BucketCard = ({ bucket }: BucketCardProps) => {
  const { id, title, balance } = bucket;
  const [menuOpen, setMenuOpen] = useState(false);
  const [createTransactionOpen, setCreateTransactionOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const formattedBalance = balance.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <article className="bucket-card">
      <div className="bucket-card-bar">
        <h3 className="bucket-card-name">{title}</h3>
        <DropdownMenu.Root open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenu.Trigger asChild>
            <button type="button" className="bucket-menu" aria-label="Bucket actions">
              ⋯
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="bucket-menu-content"
              sideOffset={8}
              align="end"
              collisionPadding={16}
            >
              <DropdownMenu.Label className="bucket-menu-label">Actions</DropdownMenu.Label>
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
              <DropdownMenu.Item className="bucket-menu-item">
                <button
                  type="button"
                  className="bucket-menu-row bucket-menu-row-icon"
                  aria-label="Transfer to another bucket"
                >
                  Transfer to another bucket
                </button>
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
        <DeleteDialog
          id={id}
          bucketTitle={title}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          trigger={null}
        />
      </div>
      <div className="bucket-card-body">
        <span className="bucket-balance-label">Current Balance</span>
        <p className="bucket-balance-value">{formattedBalance}</p>
      </div>
      <Link
        to="/buckets/$bucketId"
        params={{ bucketId: id }}
        className="bucket-view"
      >
        View Details
      </Link>
    </article>
  );
};

export default BucketCard;

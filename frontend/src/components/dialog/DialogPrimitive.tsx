import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import "./dialog.css";

interface DialogPrimitiveProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: ReactNode | null;
  children: ReactNode;
}

const DialogPrimitive = ({
  open,
  onOpenChange,
  trigger,
  children,
}: DialogPrimitiveProps) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger != null ? (
        <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      ) : null}
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content ui-panel">{children}</Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default DialogPrimitive;

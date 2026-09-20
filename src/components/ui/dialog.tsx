import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogPortal = DialogPrimitive.Portal;

export function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-background/70",
        className,
      )}
      {...props}
    />
  );
}

export function DialogContent({
  className,
  overlayClassName,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  overlayClassName?: string;
}) {
  return (
    <DialogPortal>
      <DialogOverlay className={overlayClassName} />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 border border-border bg-popover text-popover-foreground shadow-[var(--shadow-border)]",
          "focus:outline-none",
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("font-serif text-lg font-medium", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export function DialogCloseButton({ className }: { className?: string }) {
  return (
    <DialogPrimitive.Close
      className={cn(
        "absolute top-3 right-3 rounded-sm p-2 text-muted-foreground hover:text-foreground",
        className,
      )}
      aria-label="닫기"
    >
      <X className="size-4" />
    </DialogPrimitive.Close>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import type { ActionResponse } from "@/lib/constants";

interface CrudDialogProps {
  title: string;
  triggerLabel?: string;
  submitLabel?: string;
  children: React.ReactNode | ((props: { onSuccess: () => void; loading: boolean }) => React.ReactNode);
  onSubmit: (formData: FormData) => Promise<ActionResponse>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

export function CrudDialog({
  title,
  triggerLabel = "Add New",
  submitLabel = "Save",
  children,
  onSubmit,
  open: controlledOpen,
  onOpenChange,
  hideTrigger,
}: CrudDialogProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  function handleSuccess() {
    setOpen(false);
    router.refresh();
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await onSubmit(formData);
      if (result.statusCode === 200) {
        toast.success(result.statusMessage);
        if (result.redirectUrl) {
          router.push(result.redirectUrl);
        } else if (result.refreshPage) {
          handleSuccess();
        } else {
          handleSuccess();
        }
      } else {
        toast.error(result.statusMessage);
      }
    });
  }

  const formChildren =
    typeof children === "function"
      ? children({ onSuccess: handleSuccess, loading: isPending })
      : children;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4" />
            {triggerLabel}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formChildren}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

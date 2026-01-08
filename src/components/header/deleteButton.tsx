import { Button } from "@/components/ui/button"
import { Trash2Icon } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import * as React from "react"

type Props = {
  onDelete?: () => void | Promise<void>
  confirmMessage?: string
  selectedCount?: number
  disabled?: boolean
  loading?: boolean
}

export default function DeleteButton({
  onDelete,
  confirmMessage = "Are you sure you want to delete the selected items?",
  selectedCount,
  disabled,
  loading,
}: Props) {
  const [open, setOpen] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)

  const msg =
    selectedCount && selectedCount > 0
      ? `${confirmMessage} (${selectedCount} selected)`
      : confirmMessage

  const handleConfirm = async () => {
    if (!onDelete) return
    try {
      setSubmitting(true)
      const maybePromise = onDelete()
      if (maybePromise && typeof (maybePromise as Promise<void>).then === "function") {
        await maybePromise
      }
      toast.success("Deleted successfully. Entries moved to Redacted.")
      setOpen(false)
    } catch (err) {
      console.error("Delete action failed:", err)
      toast.error("Delete failed. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        aria-label={"Delete selected"}
        title={selectedCount && selectedCount > 0 ? `Delete ${selectedCount} selected` : "Delete"}
        className="
          rounded-md
          h-9
          border border-gray-300
          bg-white
          p-2.5
          text-gray-500
          hover:bg-gray-100
          disabled:opacity-60
          disabled:cursor-not-allowed
        "
      >
        <Trash2Icon className="h-5 w-5" strokeWidth={2} />
        {loading ? (
          <span className="ml-2 text-xs">Deleting…</span>
        ) : selectedCount && selectedCount > 0 ? (
          <span className="ml-2 text-xs">{selectedCount}</span>
        ) : null}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm delete</DialogTitle>
            <DialogDescription>{msg}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleConfirm}
              disabled={submitting}
            >
              {submitting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Trash2 } from 'lucide-react'

interface ClearConfirmDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  itemCount: number
  onConfirm: () => void
}

export function ConfirmClearDialog({
  open,
  onOpenChange,
  itemCount,
  onConfirm,
}: ClearConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm gap-0 p-0">
        <DialogHeader className="p-5 pb-0">
          <DialogTitle className="text-base">Clear Cart?</DialogTitle>
        </DialogHeader>
        <div className="p-5 space-y-4">
          <p className="text-sm text-muted-foreground">
            Remove all {itemCount} item{itemCount > 1 ? 's' : ''}? This cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 h-10" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="destructive" className="flex-1 h-10 gap-1.5" onClick={onConfirm}>
              <Trash2 className="size-4" /> Clear All
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

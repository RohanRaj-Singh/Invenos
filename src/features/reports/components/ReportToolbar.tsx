import { Printer, FileText, FileSpreadsheet, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface ReportToolbarProps {
  onPrint?: () => void
  onExportPdf?: () => void
  onExportExcel?: () => void
  onRefresh?: () => void
}

export function ReportToolbar({ onPrint, onExportPdf, onExportExcel, onRefresh }: ReportToolbarProps) {
  const handleExportPdf = onExportPdf || (() => toast.info('PDF export will be available after backend integration'))
  const handleExportExcel = onExportExcel || (() => toast.info('Excel export will be available after backend integration'))
  const handleRefresh = onRefresh || (() => window.location.reload())

  return (
    <div className="flex items-center gap-1">
      {[
        { label: 'Print', icon: Printer, onClick: onPrint },
        { label: 'PDF', icon: FileText, onClick: handleExportPdf },
        { label: 'Excel', icon: FileSpreadsheet, onClick: handleExportExcel },
        { label: 'Refresh', icon: RefreshCw, onClick: handleRefresh },
      ].map((a) => (
        <button
          key={a.label}
          onClick={a.onClick}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors cursor-pointer"
          title={a.label === 'PDF' || a.label === 'Excel' ? 'Available after backend integration' : undefined}
        >
          <a.icon className="size-3.5" />
          <span className="hidden sm:inline">{a.label}</span>
        </button>
      ))}
    </div>
  )
}

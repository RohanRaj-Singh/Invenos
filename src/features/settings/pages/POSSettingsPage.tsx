import { useState, useEffect } from 'react'
import { ShoppingCart } from 'lucide-react'
import { SettingsLayout, SettingsSection, SettingsCard, SettingsRow, SettingsInput, SettingsToggle, SettingsSaveBar } from '../components/SettingsComponents'
import { getPOSSettings, updateSettings } from '@/data/settings'
import { toast } from 'sonner'

export default function POSSettingsPage() {
  const [orig, setOrig] = useState(() => getPOSSettings())
  const [draft, setDraft] = useState({ ...orig })

  useEffect(() => {
    const s = getPOSSettings()
    setOrig(s)
    setDraft({ ...s })
  }, [])

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(orig)

  const save = () => {
    updateSettings({ pos: draft })
    setOrig({ ...draft })
    toast.success('POS settings saved')
  }

  return (
    <SettingsLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-emerald-600/20 to-emerald-600/5 flex items-center justify-center shrink-0">
            <ShoppingCart className="size-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">POS Settings</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Configure point-of-sale behaviour and defaults.</p>
          </div>
        </div>

        <SettingsSection title="Defaults">
          <SettingsCard>
            <SettingsRow label="Default Customer" description="Customer selected by default for new sales">
              <SettingsInput value={draft.defaultCustomer} onChange={(v) => setDraft({ ...draft, defaultCustomer: v })} />
            </SettingsRow>
            <SettingsRow label="Default Payment Method">
              <select value={draft.defaultPaymentMethod} onChange={(e) => setDraft({ ...draft, defaultPaymentMethod: e.target.value as any })}
                className="w-48 h-9 px-3 rounded-lg border border-input bg-background text-xs outline-none focus:border-ring">
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="transfer">Bank Transfer</option>
                <option value="easypaisa">Easypaisa</option>
                <option value="jazzcash">JazzCash</option>
              </select>
            </SettingsRow>
            <SettingsRow label="Receipt Size">
              <select value={draft.receiptSize} onChange={(e) => setDraft({ ...draft, receiptSize: e.target.value as any })}
                className="w-48 h-9 px-3 rounded-lg border border-input bg-background text-xs outline-none focus:border-ring">
                <option value="58mm">58mm (Thermal)</option>
                <option value="80mm">80mm (Thermal)</option>
                <option value="a4">A4</option>
              </select>
            </SettingsRow>
          </SettingsCard>
        </SettingsSection>

        <SettingsSection title="Behaviour">
          <SettingsCard>
            <SettingsRow label="Auto Print Receipt" description="Automatically print receipt after each sale">
              <SettingsToggle enabled={draft.autoPrintReceipt} onChange={(v) => setDraft({ ...draft, autoPrintReceipt: v })} />
            </SettingsRow>
            <SettingsRow label="Show Product Images" description="Display product images in POS grid">
              <SettingsToggle enabled={draft.showProductImages} onChange={(v) => setDraft({ ...draft, showProductImages: v })} />
            </SettingsRow>
            <SettingsRow label="Enable Hold Sales" description="Allow pausing and resuming sales">
              <SettingsToggle enabled={draft.enableHoldSales} onChange={(v) => setDraft({ ...draft, enableHoldSales: v })} />
            </SettingsRow>
            <SettingsRow label="Barcode Scanner Enabled" description="Allow barcode input for product lookup">
              <SettingsToggle enabled={draft.barcodeScannerEnabled} onChange={(v) => setDraft({ ...draft, barcodeScannerEnabled: v })} />
            </SettingsRow>
            <SettingsRow label="Keyboard Shortcuts" description="Enable POS keyboard shortcuts">
              <SettingsToggle enabled={draft.keyboardShortcutsEnabled} onChange={(v) => setDraft({ ...draft, keyboardShortcutsEnabled: v })} />
            </SettingsRow>
            <SettingsRow label="Auto-Focus Barcode Field" description="Automatically focus barcode input on new sale">
              <SettingsToggle enabled={draft.autoFocusBarcode} onChange={(v) => setDraft({ ...draft, autoFocusBarcode: v })} />
            </SettingsRow>
            <SettingsRow label="Confirm Before Deleting" description="Show confirmation dialog before deleting items">
              <SettingsToggle enabled={draft.confirmBeforeDeleting} onChange={(v) => setDraft({ ...draft, confirmBeforeDeleting: v })} />
            </SettingsRow>
          </SettingsCard>
        </SettingsSection>

        <SettingsSaveBar onSave={save} hasChanges={hasChanges} />
      </div>
    </SettingsLayout>
  )
}

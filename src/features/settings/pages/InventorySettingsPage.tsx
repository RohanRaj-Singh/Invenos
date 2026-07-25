import { useState, useEffect } from 'react'
import { Package } from 'lucide-react'
import { SettingsLayout, SettingsSection, SettingsCard, SettingsRow, SettingsInput, SettingsToggle, SettingsSaveBar } from '../components/SettingsComponents'
import { getInventorySettings, updateSettings } from '@/data/settings'
import { toast } from 'sonner'

export default function InventorySettingsPage() {
  const [orig, setOrig] = useState(() => getInventorySettings())
  const [draft, setDraft] = useState({ ...orig })

  useEffect(() => {
    const s = getInventorySettings()
    setOrig(s)
    setDraft({ ...s })
  }, [])

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(orig)

  const save = () => {
    updateSettings({ inventory: draft })
    setOrig({ ...draft })
    toast.success('Inventory settings saved')
  }

  return (
    <SettingsLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-purple-600/20 to-purple-600/5 flex items-center justify-center shrink-0">
            <Package className="size-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Inventory Settings</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Stock management preferences and defaults.</p>
          </div>
        </div>

        <SettingsSection title="Stock Configuration">
          <SettingsCard>
            <SettingsRow label="Allow Negative Stock" description="Allow stock to go below zero">
              <SettingsToggle enabled={draft.allowNegativeStock} onChange={(v) => setDraft({ ...draft, allowNegativeStock: v })} />
            </SettingsRow>
            <SettingsRow label="Low Stock Threshold" description="Default threshold for low-stock warnings">
              <SettingsInput value={String(draft.lowStockThreshold)} onChange={(v) => setDraft({ ...draft, lowStockThreshold: parseInt(v) || 0 })} type="number" />
            </SettingsRow>
            <SettingsRow label="Default Stock Unit" description="Primary unit for inventory tracking">
              <select value={draft.defaultStockUnit} onChange={(e) => setDraft({ ...draft, defaultStockUnit: e.target.value })}
                className="w-48 h-9 px-3 rounded-lg border border-input bg-background text-xs outline-none focus:border-ring">
                <option value="piece">Piece</option>
                <option value="kg">Kilogram</option>
                <option value="g">Gram</option>
                <option value="liter">Liter</option>
                <option value="ml">Milliliter</option>
                <option value="meter">Meter</option>
                <option value="tablet">Tablet</option>
                <option value="capsule">Capsule</option>
                <option value="bottle">Bottle</option>
                <option value="packet">Packet</option>
              </select>
            </SettingsRow>
          </SettingsCard>
        </SettingsSection>

        <SettingsSection title="Product Configuration">
          <SettingsCard>
            <SettingsRow label="Auto Generate SKU" description="Automatically generate SKU for new products">
              <SettingsToggle enabled={draft.autoGenerateSKU} onChange={(v) => setDraft({ ...draft, autoGenerateSKU: v })} />
            </SettingsRow>
            <SettingsRow label="Barcode Format" description="Default barcode symbology">
              <select value={draft.barcodeFormat} onChange={(e) => setDraft({ ...draft, barcodeFormat: e.target.value })}
                className="w-48 h-9 px-3 rounded-lg border border-input bg-background text-xs outline-none focus:border-ring">
                <option value="CODE128">CODE128</option>
                <option value="EAN13">EAN-13</option>
                <option value="UPC">UPC</option>
                <option value="QR">QR Code</option>
              </select>
            </SettingsRow>
            <SettingsRow label="Stock Valuation Method" description="Method used to calculate inventory value (placeholder)">
              <SettingsInput value={draft.stockValuationMethod} onChange={(v) => setDraft({ ...draft, stockValuationMethod: v })} />
            </SettingsRow>
          </SettingsCard>
        </SettingsSection>

        <SettingsSaveBar onSave={save} hasChanges={hasChanges} />
      </div>
    </SettingsLayout>
  )
}

import { useState, useEffect } from 'react'
import { ArrowDownLeft } from 'lucide-react'
import { SettingsLayout, SettingsSection, SettingsCard, SettingsRow, SettingsInput, SettingsToggle, SettingsSaveBar } from '../components/SettingsComponents'
import { getPurchaseSettings, updateSettings } from '@/data/settings'
import { toast } from 'sonner'

export default function PurchaseSettingsPage() {
  const [orig, setOrig] = useState(() => getPurchaseSettings())
  const [draft, setDraft] = useState({ ...orig })

  useEffect(() => {
    const s = getPurchaseSettings()
    setOrig(s)
    setDraft({ ...s })
  }, [])

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(orig)

  const save = () => {
    updateSettings({ purchases: draft })
    setOrig({ ...draft })
    toast.success('Purchase settings saved')
  }

  return (
    <SettingsLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-orange-600/20 to-orange-600/5 flex items-center justify-center shrink-0">
            <ArrowDownLeft className="size-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Purchase Settings</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Purchase order numbering, cost update and supplier preferences.</p>
          </div>
        </div>

        <SettingsSection title="Purchase Numbering">
          <SettingsCard>
            <SettingsRow label="Purchase Prefix" description="Prefix used before purchase numbers (e.g. PUR-)">
              <SettingsInput value={draft.purchasePrefix} onChange={(v) => setDraft({ ...draft, purchasePrefix: v })} />
            </SettingsRow>
            <SettingsRow label="Purchase Number Format" description="Format pattern for purchase references">
              <select value={draft.purchaseNumberFormat} onChange={(e) => setDraft({ ...draft, purchaseNumberFormat: e.target.value })}
                className="w-48 h-9 px-3 rounded-lg border border-input bg-background text-xs outline-none focus:border-ring">
                <option value="{PREFIX}{NUMBER}">PUR-00001</option>
                <option value="{PREFIX}{DATE}-{NUMBER}">PUR-20260723-001</option>
              </select>
            </SettingsRow>
          </SettingsCard>
        </SettingsSection>

        <SettingsSection title="Behaviour">
          <SettingsCard>
            <SettingsRow label="Auto Update Cost Price" description="Update product cost price when receiving purchase">
              <SettingsToggle enabled={draft.autoUpdateCostPrice} onChange={(v) => setDraft({ ...draft, autoUpdateCostPrice: v })} />
            </SettingsRow>
            <SettingsRow label="Require Supplier" description="Force selecting a supplier for purchases">
              <SettingsToggle enabled={draft.requireSupplier} onChange={(v) => setDraft({ ...draft, requireSupplier: v })} />
            </SettingsRow>
            <SettingsRow label="Allow Backdated Purchases" description="Allow creating purchases with past dates">
              <SettingsToggle enabled={draft.allowBackdatedPurchases} onChange={(v) => setDraft({ ...draft, allowBackdatedPurchases: v })} />
            </SettingsRow>
          </SettingsCard>
        </SettingsSection>

        <SettingsSaveBar onSave={save} hasChanges={hasChanges} />
      </div>
    </SettingsLayout>
  )
}

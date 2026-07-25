import { useState, useEffect } from 'react'
import { ShoppingBag } from 'lucide-react'
import { SettingsLayout, SettingsSection, SettingsCard, SettingsRow, SettingsInput, SettingsToggle, SettingsSaveBar } from '../components/SettingsComponents'
import { getSalesSettings, updateSettings } from '@/data/settings'
import { toast } from 'sonner'

export default function SalesSettingsPage() {
  const [orig, setOrig] = useState(() => getSalesSettings())
  const [draft, setDraft] = useState({ ...orig })

  useEffect(() => {
    const s = getSalesSettings()
    setOrig(s)
    setDraft({ ...s })
  }, [])

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(orig)

  const save = () => {
    updateSettings({ sales: draft })
    setOrig({ ...draft })
    toast.success('Sales settings saved')
  }

  return (
    <SettingsLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-amber-600/20 to-amber-600/5 flex items-center justify-center shrink-0">
            <ShoppingBag className="size-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Sales Settings</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Invoice numbering, tax, discount and sale preferences.</p>
          </div>
        </div>

        <SettingsSection title="Invoice Configuration">
          <SettingsCard>
            <SettingsRow label="Invoice Prefix" description="Prefix used before invoice numbers (e.g. INV-)">
              <SettingsInput value={draft.invoicePrefix} onChange={(v) => setDraft({ ...draft, invoicePrefix: v })} />
            </SettingsRow>
            <SettingsRow label="Invoice Number Format" description="Format pattern for invoice numbers">
              <select value={draft.invoiceNumberFormat} onChange={(e) => setDraft({ ...draft, invoiceNumberFormat: e.target.value })}
                className="w-48 h-9 px-3 rounded-lg border border-input bg-background text-xs outline-none focus:border-ring">
                <option value="{PREFIX}{NUMBER}">INV-00001</option>
                <option value="{PREFIX}{DATE}-{NUMBER}">INV-20260723-001</option>
                <option value="{YEAR}{NUMBER}">202600001</option>
              </select>
            </SettingsRow>
          </SettingsCard>
        </SettingsSection>

        <SettingsSection title="Defaults">
          <SettingsCard>
            <SettingsRow label="Default Tax (%)" description="Default tax rate applied to new sales">
              <SettingsInput value={String(draft.defaultTax)} onChange={(v) => setDraft({ ...draft, defaultTax: parseFloat(v) || 0 })} type="number" />
            </SettingsRow>
            <SettingsRow label="Default Discount (%)" description="Default discount applied to new sales">
              <SettingsInput value={String(draft.defaultDiscount)} onChange={(v) => setDraft({ ...draft, defaultDiscount: parseFloat(v) || 0 })} type="number" />
            </SettingsRow>
          </SettingsCard>
        </SettingsSection>

        <SettingsSection title="Behaviour">
          <SettingsCard>
            <SettingsRow label="Allow Price Override" description="Allow changing prices at the point of sale">
              <SettingsToggle enabled={draft.allowPriceOverride} onChange={(v) => setDraft({ ...draft, allowPriceOverride: v })} />
            </SettingsRow>
            <SettingsRow label="Allow Backdated Sales" description="Allow creating sales with past dates">
              <SettingsToggle enabled={draft.allowBackdatedSales} onChange={(v) => setDraft({ ...draft, allowBackdatedSales: v })} />
            </SettingsRow>
            <SettingsRow label="Round Totals" description="Round invoice totals to nearest whole number">
              <SettingsToggle enabled={draft.roundTotals} onChange={(v) => setDraft({ ...draft, roundTotals: v })} />
            </SettingsRow>
            <SettingsRow label="Enable Draft Sales" description="Allow saving sales as drafts (placeholder)">
              <SettingsToggle enabled={draft.enableDraftSales} onChange={(v) => setDraft({ ...draft, enableDraftSales: v })} />
            </SettingsRow>
          </SettingsCard>
        </SettingsSection>

        <SettingsSaveBar onSave={save} hasChanges={hasChanges} />
      </div>
    </SettingsLayout>
  )
}

import { useState, useEffect } from 'react'
import { Building2 } from 'lucide-react'
import { SettingsLayout, SettingsSection, SettingsCard, SettingsRow, SettingsInput, SettingsSaveBar } from '../components/SettingsComponents'
import { getBusinessSettings, updateSettings } from '@/data/settings'
import { toast } from 'sonner'

export default function BusinessSettingsPage() {
  const [orig, setOrig] = useState(() => getBusinessSettings())
  const [draft, setDraft] = useState({ ...orig })

  useEffect(() => {
    const s = getBusinessSettings()
    setOrig(s)
    setDraft({ ...s })
  }, [])

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(orig)

  const save = () => {
    updateSettings({ business: draft })
    setOrig({ ...draft })
    toast.success('Business settings saved')
  }

  return (
    <SettingsLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-blue-600/20 to-blue-600/5 flex items-center justify-center shrink-0">
            <Building2 className="size-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Business Settings</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Your business information appears on receipts, reports, and invoices.</p>
          </div>
        </div>

        <SettingsSection title="Business Information">
          <SettingsCard>
            <SettingsRow label="Business Name" description="Displayed on receipts and reports">
              <SettingsInput value={draft.businessName} onChange={(v) => setDraft({ ...draft, businessName: v })} />
            </SettingsRow>
            <SettingsRow label="Business Address">
              <input value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                className="w-64 h-9 px-3 rounded-lg border border-input bg-background text-xs outline-none focus:border-ring" />
            </SettingsRow>
            <SettingsRow label="Phone Number">
              <SettingsInput value={draft.phone} onChange={(v) => setDraft({ ...draft, phone: v })} />
            </SettingsRow>
            <SettingsRow label="Email Address">
              <SettingsInput value={draft.email} onChange={(v) => setDraft({ ...draft, email: v })} />
            </SettingsRow>
            <SettingsRow label="Website">
              <SettingsInput value={draft.website} onChange={(v) => setDraft({ ...draft, website: v })} />
            </SettingsRow>
          </SettingsCard>
        </SettingsSection>

        <SettingsSection title="Localization">
          <SettingsCard>
            <SettingsRow label="Currency" description="Default currency for all transactions">
              <select value={draft.currency} onChange={(e) => setDraft({ ...draft, currency: e.target.value })}
                className="w-48 h-9 px-3 rounded-lg border border-input bg-background text-xs outline-none focus:border-ring">
                <option value="PKR">PKR - Pakistani Rupee</option>
                <option value="USD">USD - US Dollar</option>
                <option value="INR">INR - Indian Rupee</option>
                <option value="AED">AED - UAE Dirham</option>
                <option value="SAR">SAR - Saudi Riyal</option>
              </select>
            </SettingsRow>
            <SettingsRow label="Currency Symbol">
              <SettingsInput value={draft.currencySymbol} onChange={(v) => setDraft({ ...draft, currencySymbol: v })} />
            </SettingsRow>
            <SettingsRow label="Timezone">
              <select value={draft.timezone} onChange={(e) => setDraft({ ...draft, timezone: e.target.value })}
                className="w-48 h-9 px-3 rounded-lg border border-input bg-background text-xs outline-none focus:border-ring">
                <option value="Asia/Karachi">Asia/Karachi (PKT)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              </select>
            </SettingsRow>
            <SettingsRow label="Date Format">
              <select value={draft.dateFormat} onChange={(e) => setDraft({ ...draft, dateFormat: e.target.value })}
                className="w-48 h-9 px-3 rounded-lg border border-input bg-background text-xs outline-none focus:border-ring">
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              </select>
            </SettingsRow>
            <SettingsRow label="Time Format">
              <select value={draft.timeFormat} onChange={(e) => setDraft({ ...draft, timeFormat: e.target.value })}
                className="w-48 h-9 px-3 rounded-lg border border-input bg-background text-xs outline-none focus:border-ring">
                <option value="12h">12-hour (AM/PM)</option>
                <option value="24h">24-hour</option>
              </select>
            </SettingsRow>
          </SettingsCard>
        </SettingsSection>

        <SettingsSection title="Description">
          <SettingsCard>
            <SettingsRow label="Business Description" description="Short description for internal use">
              <input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                className="w-64 h-9 px-3 rounded-lg border border-input bg-background text-xs outline-none focus:border-ring" />
            </SettingsRow>
          </SettingsCard>
        </SettingsSection>

        <SettingsSaveBar onSave={save} hasChanges={hasChanges} />
      </div>
    </SettingsLayout>
  )
}

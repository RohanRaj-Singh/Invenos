import { useState, useEffect } from 'react'
import { Receipt } from 'lucide-react'
import { SettingsLayout, SettingsSection, SettingsCard, SettingsRow, SettingsInput, SettingsToggle, SettingsSaveBar } from '../components/SettingsComponents'
import { getReceiptSettings, getBusinessSettings, updateSettings } from '@/data/settings'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function ReceiptSettingsPage() {
  const [orig, setOrig] = useState(() => getReceiptSettings())
  const [draft, setDraft] = useState({ ...orig })
  const business = getBusinessSettings()

  useEffect(() => {
    const s = getReceiptSettings()
    setOrig(s)
    setDraft({ ...s })
  }, [])

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(orig)

  const save = () => {
    updateSettings({ receipt: draft })
    setOrig({ ...draft })
    toast.success('Receipt settings saved')
  }

  return (
    <SettingsLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-rose-600/20 to-rose-600/5 flex items-center justify-center shrink-0">
            <Receipt className="size-5 text-rose-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Receipt Settings</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Customize receipt appearance and content.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <SettingsSection title="Content">
              <SettingsCard>
                <SettingsRow label="Header Text" description="Printed at the top of each receipt">
                  <input value={draft.headerText} onChange={(e) => setDraft({ ...draft, headerText: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs outline-none focus:border-ring" />
                </SettingsRow>
                <SettingsRow label="Footer Text" description="Printed at the bottom of each receipt">
                  <input value={draft.footerText} onChange={(e) => setDraft({ ...draft, footerText: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs outline-none focus:border-ring" />
                </SettingsRow>
              </SettingsCard>
            </SettingsSection>

            <SettingsSection title="Visibility">
              <SettingsCard>
                <SettingsRow label="Show Business Logo">
                  <SettingsToggle enabled={draft.showBusinessLogo} onChange={(v) => setDraft({ ...draft, showBusinessLogo: v })} />
                </SettingsRow>
                <SettingsRow label="Print Address">
                  <SettingsToggle enabled={draft.printAddress} onChange={(v) => setDraft({ ...draft, printAddress: v })} />
                </SettingsRow>
                <SettingsRow label="Print Phone">
                  <SettingsToggle enabled={draft.printPhone} onChange={(v) => setDraft({ ...draft, printPhone: v })} />
                </SettingsRow>
                <SettingsRow label="Print Barcode">
                  <SettingsToggle enabled={draft.printBarcode} onChange={(v) => setDraft({ ...draft, printBarcode: v })} />
                </SettingsRow>
              </SettingsCard>
            </SettingsSection>

            <SettingsSection title="Paper">
              <SettingsCard>
                <SettingsRow label="Paper Width (mm)">
                  <SettingsInput value={String(draft.paperWidth)} onChange={(v) => setDraft({ ...draft, paperWidth: parseInt(v) || 80 })} type="number" />
                </SettingsRow>
              </SettingsCard>
            </SettingsSection>
          </div>

          {/* Receipt Preview */}
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Preview</div>
            <div className={cn(
              'bg-white text-black mx-auto rounded-lg shadow-sm border border-gray-200 p-3 font-mono text-[9px] leading-tight',
              draft.paperWidth <= 58 ? 'max-w-[180px]' : 'max-w-[240px]',
            )}>
              {draft.showBusinessLogo && <div className="w-6 h-6 bg-gray-300 rounded mx-auto mb-1" />}
              <div className="text-center font-bold text-[11px] mb-1">{business.businessName}</div>
              {draft.printAddress && <div className="text-center text-gray-600">{business.address}</div>}
              {draft.printPhone && <div className="text-center text-gray-600">{business.phone}</div>}
              <div className="border-t border-dashed border-gray-300 my-1.5" />
              <div className="text-center font-bold">{draft.headerText}</div>
              <div className="border-t border-dashed border-gray-300 my-1.5" />
              <div className="flex justify-between"><span>Item</span><span>Rs.</span></div>
              <div className="flex justify-between"><span>Product 1</span><span>150</span></div>
              <div className="flex justify-between"><span>Product 2</span><span>250</span></div>
              <div className="border-t border-dashed border-gray-300 my-1.5" />
              <div className="flex justify-between font-bold"><span>Total</span><span>400</span></div>
              <div className="border-t border-dashed border-gray-300 my-1.5" />
              <div className="text-center text-gray-600">{draft.footerText}</div>
            </div>
          </div>
        </div>

        <SettingsSaveBar onSave={save} hasChanges={hasChanges} />
      </div>
    </SettingsLayout>
  )
}

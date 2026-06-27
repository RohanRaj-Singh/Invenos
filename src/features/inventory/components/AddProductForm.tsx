import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, X, Package, DollarSign, Settings2, Eye, Scale } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CostPreview from './CostPreview'
import PackagingConfigurator from './PackagingConfigurator'
import { BASE_UNITS } from '@/lib/inventory'
import { categories } from '@/data/inventory'
import type { PackagingConfig } from '@/types'

interface ProductFormData {
  name: string
  sku: string
  barcode: string
  category: string
  description: string
  baseUnit: string
  packaging: PackagingConfig[]
  purchaseCost: string
  salePrice: string
  trackInventory: boolean
  lowStockThreshold: string
  supplier: string
  location: string
}

const initialForm: ProductFormData = {
  name: '', sku: '', barcode: '', category: '', description: '',
  baseUnit: '', packaging: [],
  purchaseCost: '', salePrice: '',
  trackInventory: true, lowStockThreshold: '10',
  supplier: '', location: '',
}

export default function AddProductForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState<ProductFormData>(initialForm)

  const updateField = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const purchaseCost = parseFloat(form.purchaseCost) || 0
  const salePrice = parseFloat(form.salePrice) || 0

  const handleSave = () => {
    console.log('Saving product:', form)
    navigate('/inventory')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Add Product</h1>
          <p className="text-sm text-muted-foreground mt-1">Add a new product to your inventory catalog.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/inventory')} className="gap-1.5">
            <X className="size-3.5" /> Cancel
          </Button>
          <Button size="sm" onClick={handleSave} className="gap-1.5 shadow-sm">
            <Save className="size-3.5" /> Save Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-5">
          {/* Basic Information */}
          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <Package className="size-4 text-primary" />
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Product Name" required>
                  <input type="text" placeholder="e.g. Amoxil 500mg Capsules" value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30" />
                </FormField>
                <FormField label="SKU" required>
                  <input type="text" placeholder="e.g. AMX-500-001" value={form.sku}
                    onChange={(e) => updateField('sku', e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 font-mono" />
                </FormField>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Barcode">
                  <input type="text" placeholder="e.g. 8901234560011" value={form.barcode}
                    onChange={(e) => updateField('barcode', e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 font-mono" />
                </FormField>
                <FormField label="Category" required>
                  <select value={form.category} onChange={(e) => updateField('category', e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 appearance-none">
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name} ({cat.industry})</option>
                    ))}
                  </select>
                </FormField>
              </div>
              <FormField label="Description">
                <textarea placeholder="Product description..." value={form.description}
                  onChange={(e) => updateField('description', e.target.value)} rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 resize-none" />
              </FormField>
            </CardContent>
          </Card>

          {/* Base Unit */}
          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <Scale className="size-4 text-primary" />
              <CardTitle>Base Unit</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                The smallest unit of this product that you track. All stock is stored in this unit.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {BASE_UNITS.map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => updateField('baseUnit', unit)}
                    className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      form.baseUnit === unit
                        ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary/30'
                        : 'border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                    }`}
                  >
                    {unit}
                  </button>
                ))}
                <input
                  type="text"
                  placeholder="Custom..."
                  value={!BASE_UNITS.includes(form.baseUnit as any) ? form.baseUnit : ''}
                  onChange={(e) => updateField('baseUnit', e.target.value)}
                  className="px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30"
                />
              </div>
            </CardContent>
          </Card>

          {/* Packaging */}
          <PackagingConfigurator
            packaging={form.packaging}
            onChange={(pkg) => updateField('packaging', pkg)}
            baseUnit={form.baseUnit}
          />

          {/* Pricing */}
          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <DollarSign className="size-4 text-primary" />
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label={form.packaging.length > 0 ? `Cost per ${form.packaging[form.packaging.length - 1].name}` : 'Purchase Cost'} required>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rs.</span>
                    <input type="number" placeholder="0" value={form.purchaseCost}
                      onChange={(e) => updateField('purchaseCost', e.target.value)}
                      className="w-full h-10 pl-10 pr-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30" min="0" />
                  </div>
                </FormField>
                <FormField label={`Sale Price per ${form.baseUnit || 'base unit'}`}>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rs.</span>
                    <input type="number" placeholder="0" value={form.salePrice}
                      onChange={(e) => updateField('salePrice', e.target.value)}
                      className="w-full h-10 pl-10 pr-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30" min="0" />
                  </div>
                </FormField>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <Settings2 className="size-4 text-primary" />
              <CardTitle>Inventory Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-foreground">Track Inventory</span>
                  <p className="text-xs text-muted-foreground mt-0.5">Automatically track stock levels for this product</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={form.trackInventory}
                    onChange={(e) => updateField('trackInventory', e.target.checked)} className="sr-only peer" />
                  <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                </label>
              </div>
              {form.trackInventory && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
                  <FormField label={`Low Stock Threshold (in ${form.baseUnit || 'units'})`}>
                    <input type="number" placeholder="10" value={form.lowStockThreshold}
                      onChange={(e) => updateField('lowStockThreshold', e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30" min="0" />
                  </FormField>
                  <FormField label="Supplier">
                    <input type="text" placeholder="Supplier name" value={form.supplier}
                      onChange={(e) => updateField('supplier', e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30" />
                  </FormField>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-2">
          <div className="sticky top-20 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="size-4 text-primary" />
              <span className="text-sm font-semibold">Live Preview</span>
            </div>

            <CostPreview
              purchaseCost={purchaseCost}
              packaging={form.packaging}
              baseUnit={form.baseUnit}
              salePrice={salePrice}
            />

            <Card size="sm">
              <CardHeader>
                <CardTitle>Product Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <SummaryRow label="Name" value={form.name || '—'} />
                <SummaryRow label="SKU" value={form.sku || '—'} />
                <SummaryRow label="Category" value={form.category || '—'} />
                <SummaryRow label="Base Unit" value={form.baseUnit || '—'} />
                {form.packaging.length > 0 && (
                  <SummaryRow label="Packaging" value={form.packaging.map(p => `${p.name} (${p.quantity})`).join(', ')} />
                )}
                {purchaseCost > 0 && form.packaging.length > 0 && (
                  <SummaryRow label="Cost / base unit" value={`Rs. ${(purchaseCost / (form.packaging.reduce((max, p) => p.quantity > max.quantity ? p : max, form.packaging[0]).quantity)).toFixed(2)}`} />
                )}
                {salePrice > 0 && (
                  <SummaryRow label="Sale Price" value={`Rs. ${form.salePrice} / ${form.baseUnit || 'unit'}`} />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-foreground">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium text-foreground text-right max-w-[65%] truncate">{value}</span>
    </div>
  )
}

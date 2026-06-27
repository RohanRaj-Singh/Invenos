import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import AppLayout from '@/components/layout/AppLayout'
import DashboardPage from '@/features/dashboard/DashboardPage'
import ProductListPage from '@/features/inventory/ProductListPage'
import AddProductPage from '@/features/inventory/AddProductPage'
import ProductDetailsPage from '@/features/inventory/ProductDetailsPage'
import SalesListPage from '@/features/sales/SalesListPage'
import POSPage from '@/features/pos/POSPage'
import SaleDetailPage from '@/features/sales/SaleDetailPage'
import ContactsListPage from '@/features/contacts/ContactsListPage'
import ContactDetailPage from '@/features/contacts/ContactDetailPage'
import AddContactPage from '@/features/contacts/AddContactPage'
import ClinicPage from '@/features/clinic/ClinicPage'
import PatientProfilePage from '@/features/clinic/PatientProfilePage'
import NewVisitPage from '@/features/clinic/pages/NewVisitPage'
import PlaceholderPage from '@/pages/PlaceholderPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/inventory" element={<ProductListPage />} />
          <Route path="/inventory/add" element={<AddProductPage />} />
          <Route path="/inventory/product/:id" element={<ProductDetailsPage />} />
          <Route path="/sales" element={<SalesListPage />} />
          <Route path="/sales/pos" element={<POSPage />} />
          <Route path="/sales/:id" element={<SaleDetailPage />} />
          <Route path="/contacts" element={<ContactsListPage />} />
          <Route path="/contacts/add" element={<AddContactPage />} />
          <Route path="/contacts/:id" element={<ContactDetailPage />} />
          <Route path="/payments" element={<PlaceholderPage />} />
          <Route path="/reports" element={<PlaceholderPage />} />
          <Route path="/clinic" element={<ClinicPage />} />
          <Route path="/clinic/patient/:id" element={<PatientProfilePage />} />
          <Route path="/clinic/patient/:id/visit" element={<NewVisitPage />} />
        </Route>
      </Routes>
      <Toaster richColors position="top-right" />
    </BrowserRouter>
  )
}

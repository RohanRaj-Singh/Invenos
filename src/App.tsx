import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { TransactionProvider } from '@/features/transactions/TransactionContext'
import { AuthProvider } from '@/features/auth/AuthContext'
import AppLayout from '@/components/layout/AppLayout'
import DashboardPage from '@/features/dashboard/DashboardPage'
import ProductListPage from '@/features/inventory/ProductListPage'
import ProductFormPage from '@/features/inventory/ProductFormPage'
import ProductDetailsPage from '@/features/inventory/ProductDetailsPage'
import SalesListPage from '@/features/sales/SalesListPage'
import SaleBillPage from '@/features/pos/salebill/SaleBillPage'
import SaleDetailPage from '@/features/sales/SaleDetailPage'
import PaymentsListPage from '@/features/payments/PaymentsListPage'
import ContactsListPage from '@/features/contacts/ContactsListPage'
import ContactDetailPage from '@/features/contacts/ContactDetailPage'
import AddContactPage from '@/features/contacts/AddContactPage'
import ClinicPage from '@/features/clinic/ClinicPage'
import PatientProfilePage from '@/features/clinic/PatientProfilePage'
import NewVisitPage from '@/features/clinic/pages/NewVisitPage'
import PurchaseBillPage from '@/features/purchases/PurchaseBillPage'
import PurchasesListPage from '@/features/purchases/PurchasesListPage'
import PurchaseDetailPage from '@/features/purchases/PurchaseDetailPage'
import ReturnPage from '@/features/returns/ReturnPage'
import ReturnListPage from '@/features/returns/ReturnListPage'
import SaleReturnDetailPage from '@/features/returns/SaleReturnDetailPage'
import PurchaseReturnDetailPage from '@/features/returns/PurchaseReturnDetailPage'
import ExpenseListPage from '@/features/expenses/ExpenseListPage'
import ExpenseFormPage from '@/features/expenses/ExpenseFormPage'
import ExpenseDetailPage from '@/features/expenses/ExpenseDetailPage'
import ExpenseCategoriesPage from '@/features/expenses/ExpenseCategoriesPage'
import ReportsLanding from '@/features/reports/ReportsLanding'
import SettingsDashboardPage from '@/features/settings/pages/SettingsDashboardPage'
import BusinessSettingsPage from '@/features/settings/pages/BusinessSettingsPage'
import POSSettingsPage from '@/features/settings/pages/POSSettingsPage'
import InventorySettingsPage from '@/features/settings/pages/InventorySettingsPage'
import SalesSettingsPage from '@/features/settings/pages/SalesSettingsPage'
import PurchaseSettingsPage from '@/features/settings/pages/PurchaseSettingsPage'
import ReceiptSettingsPage from '@/features/settings/pages/ReceiptSettingsPage'
import BackupRestorePage from '@/features/settings/pages/BackupRestorePage'
import AboutSystemPage from '@/features/settings/pages/AboutSystemPage'
import DayBookReport from '@/features/reports/DayBookReport'
import CashFlowReport from '@/features/reports/CashFlowReport'
import PnLReport from '@/features/reports/PnLReport'
import BalanceSheetReport from '@/features/reports/BalanceSheetReport'
import SalesReport from '@/features/reports/SalesReport'
import PurchaseReport from '@/features/reports/PurchaseReport'
import StockReport from '@/features/reports/StockReport'
import PartyReport from '@/features/reports/PartyReport'
import { saleReturnStrategy } from '@/domain/transactions/strategies/sale-return'
import { purchaseReturnStrategy } from '@/domain/transactions/strategies/purchase-return'
import AccessDenied from '@/features/auth/AccessDenied'
import LoginPage from '@/features/auth/LoginPage'
import { PermissionGuard } from '@/features/auth/PermissionGuard'
import UsersListPage from '@/features/settings/pages/UsersListPage'
import UserFormPage from '@/features/settings/pages/UserFormPage'
import PermissionsPage from '@/features/settings/pages/PermissionsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <TransactionProvider>
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/inventory" element={<PermissionGuard module="inventory"><ProductListPage /></PermissionGuard>} />
              <Route path="/inventory/add" element={<PermissionGuard module="inventory" action="create"><ProductFormPage /></PermissionGuard>} />
              <Route path="/inventory/product/:id" element={<ProductDetailsPage />} />
              <Route path="/sales" element={<PermissionGuard module="sales"><SalesListPage /></PermissionGuard>} />
              <Route path="/sales/pos" element={<PermissionGuard module="sales" action="create"><SaleBillPage /></PermissionGuard>} />
              <Route path="/sales/create" element={<PermissionGuard module="sales" action="create"><SaleBillPage /></PermissionGuard>} />
              <Route path="/sales/:id" element={<SaleDetailPage />} />
              <Route path="/contacts" element={<ContactsListPage />} />
              <Route path="/contacts/add" element={<AddContactPage />} />
              <Route path="/contacts/:id" element={<ContactDetailPage />} />
              <Route path="/payments" element={<PaymentsListPage />} />
              <Route path="/reports" element={<PermissionGuard module="reports"><ReportsLanding /></PermissionGuard>} />
              <Route path="/reports/day-book" element={<PermissionGuard module="reports"><DayBookReport /></PermissionGuard>} />
              <Route path="/reports/cash-flow" element={<PermissionGuard module="reports"><CashFlowReport /></PermissionGuard>} />
              <Route path="/reports/pnl" element={<PermissionGuard module="reports"><PnLReport /></PermissionGuard>} />
              <Route path="/reports/balance-sheet" element={<PermissionGuard module="reports"><BalanceSheetReport /></PermissionGuard>} />
              <Route path="/reports/sales" element={<PermissionGuard module="reports"><SalesReport /></PermissionGuard>} />
              <Route path="/reports/purchases" element={<PermissionGuard module="reports"><PurchaseReport /></PermissionGuard>} />
              <Route path="/reports/stock" element={<PermissionGuard module="reports"><StockReport /></PermissionGuard>} />
              <Route path="/reports/party" element={<PermissionGuard module="reports"><PartyReport /></PermissionGuard>} />
              <Route path="/settings" element={<PermissionGuard module="settings"><SettingsDashboardPage /></PermissionGuard>} />
              <Route path="/settings/business" element={<PermissionGuard module="settings"><BusinessSettingsPage /></PermissionGuard>} />
              <Route path="/settings/pos" element={<PermissionGuard module="settings"><POSSettingsPage /></PermissionGuard>} />
              <Route path="/settings/inventory" element={<PermissionGuard module="settings"><InventorySettingsPage /></PermissionGuard>} />
              <Route path="/settings/sales" element={<PermissionGuard module="settings"><SalesSettingsPage /></PermissionGuard>} />
              <Route path="/settings/purchases" element={<PermissionGuard module="settings"><PurchaseSettingsPage /></PermissionGuard>} />
              <Route path="/settings/receipt" element={<PermissionGuard module="settings"><ReceiptSettingsPage /></PermissionGuard>} />
              <Route path="/settings/backup" element={<PermissionGuard module="settings"><BackupRestorePage /></PermissionGuard>} />
              <Route path="/settings/about" element={<PermissionGuard module="settings"><AboutSystemPage /></PermissionGuard>} />
              <Route path="/settings/users" element={<PermissionGuard module="settings"><UsersListPage /></PermissionGuard>} />
              <Route path="/settings/users/new" element={<PermissionGuard module="settings"><UserFormPage /></PermissionGuard>} />
              <Route path="/settings/users/:id" element={<UserFormPage />} />
              <Route path="/settings/users/:id/edit" element={<UserFormPage />} />
              <Route path="/settings/users/:id/permissions" element={<PermissionGuard module="settings"><PermissionsPage /></PermissionGuard>} />
              <Route path="/access-denied" element={<AccessDenied />} />
              <Route path="/clinic" element={<ClinicPage />} />
              <Route path="/clinic/patient/:id" element={<PatientProfilePage />} />
              <Route path="/clinic/patient/:id/visit" element={<NewVisitPage />} />
              <Route path="/purchases" element={<PermissionGuard module="purchases"><PurchasesListPage /></PermissionGuard>} />
              <Route path="/purchases/new" element={<PermissionGuard module="purchases" action="create"><PurchaseBillPage /></PermissionGuard>} />
              <Route path="/purchases/:id" element={<PurchaseDetailPage />} />
              <Route path="/returns/sale" element={<PermissionGuard module="sales" action="processReturn"><ReturnPage strategy={saleReturnStrategy} backPath="/sales" title="Sale Return" isPurchase={false} /></PermissionGuard>} />
              <Route path="/returns/purchase" element={<PermissionGuard module="purchases"><ReturnPage strategy={purchaseReturnStrategy} backPath="/purchases" title="Purchase Return" isPurchase={true} /></PermissionGuard>} />
              <Route path="/sales/returns" element={<PermissionGuard module="sales"><ReturnListPage source="sale" title="Sale Returns" emptyMessage="No sale returns recorded yet." /></PermissionGuard>} />
              <Route path="/purchases/returns" element={<PermissionGuard module="purchases"><ReturnListPage source="purchase" title="Purchase Returns" emptyMessage="No purchase returns recorded yet." /></PermissionGuard>} />
              <Route path="/sales/returns/:id" element={<SaleReturnDetailPage />} />
              <Route path="/purchases/returns/:id" element={<PurchaseReturnDetailPage />} />
              <Route path="/expenses" element={<PermissionGuard module="expenses"><ExpenseListPage /></PermissionGuard>} />
              <Route path="/expenses/new" element={<PermissionGuard module="expenses" action="create"><ExpenseFormPage /></PermissionGuard>} />
              <Route path="/expenses/:id" element={<ExpenseDetailPage />} />
              <Route path="/expenses/:id/edit" element={<PermissionGuard module="expenses" action="edit"><ExpenseFormPage /></PermissionGuard>} />
              <Route path="/expenses/categories" element={<PermissionGuard module="expenses"><ExpenseCategoriesPage /></PermissionGuard>} />
          </Route>
        </Routes>
        <Toaster richColors position="top-right" />
      </TransactionProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

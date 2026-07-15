import type { Contact, ContactTransaction, ContactPayment } from '@/types'

export const mockContacts: Contact[] = [
  { id:'ct-001', type:'person', roles:['patient','customer'], name:'Muhammad Ali', phone:'0300-1234567', email:'m.ali@gmail.com', cnic:'35201-1234567-1', address:'House 12, Street 5, Gulberg, Lahore', openingBalance:4500, balanceType:'receivable', currentBalance:0, createdAt:'2025-06-15', updatedAt:'2026-06-20', lastActivity:'2026-06-22' },
  { id:'ct-002', type:'person', roles:['patient','customer'], name:'Fatima Noor', phone:'0334-7654321', email:'fatima.noor@yahoo.com', cnic:'35201-2345678-2', address:'Flat 3B, Al-Falah Apartments, Johar Town, Lahore', openingBalance:0, balanceType:'receivable', currentBalance:0, createdAt:'2025-08-20', updatedAt:'2026-06-19', lastActivity:'2026-06-21' },
  { id:'ct-003', type:'person', roles:['patient'], name:'Ahmed Raza', phone:'0345-9876543', email:'ahmed.raza@hotmail.com', cnic:'35201-3456789-3', address:'House 8, Block B, DHA Phase 4, Lahore', openingBalance:2200, balanceType:'receivable', currentBalance:0, createdAt:'2025-11-10', updatedAt:'2026-06-18', lastActivity:'2026-06-20' },
  { id:'ct-004', type:'person', roles:['patient','customer'], name:'Saima Akhtar', phone:'0311-4567890', email:'saima.akhtar@gmail.com', address:'House 45, Street 12, Model Town, Lahore', openingBalance:0, balanceType:'receivable', currentBalance:0, createdAt:'2026-01-05', updatedAt:'2026-06-17', lastActivity:'2026-06-19' },
  { id:'ct-005', type:'person', roles:['customer'], name:'Hassan Shah', phone:'0301-1122334', email:'hassan.shah@gmail.com', address:'Shop 3, Main Market, Iqbal Town, Lahore', openingBalance:8500, balanceType:'receivable', currentBalance:0, createdAt:'2025-03-01', updatedAt:'2026-06-16', lastActivity:'2026-06-18' },
  { id:'ct-006', type:'person', roles:['patient'], name:'Bilal Ahmed', phone:'0333-5566778', email:'bilal.ahmed@gmail.com', address:'House 20, Street 8, Garden Town, Lahore', openingBalance:0, balanceType:'receivable', currentBalance:0, createdAt:'2026-02-14', updatedAt:'2026-06-15', lastActivity:'2026-06-17' },
  { id:'ct-007', type:'person', roles:['patient','customer'], name:'Khalida Parveen', phone:'0346-7788990', email:'khalida.p@yahoo.com', address:'House 3, Block C, Samnabad, Faisalabad', openingBalance:1200, balanceType:'receivable', currentBalance:0, createdAt:'2025-09-22', updatedAt:'2026-06-14', lastActivity:'2026-06-16' },
  { id:'ct-008', type:'person', roles:['customer'], name:'Tariq Mehmood', phone:'0300-9988776', email:'tariq.mehmood@gmail.com', address:'Office 5, Trade Centre, Main Boulevard, Lahore', openingBalance:15000, balanceType:'receivable', currentBalance:0, createdAt:'2025-04-10', updatedAt:'2026-06-13', lastActivity:'2026-06-15' },
  { id:'ct-009', type:'person', roles:['patient'], name:'Zainab Ali', phone:'0311-2233445', email:'zainab.ali@gmail.com', address:'House 15, Street 3, Faisal Town, Lahore', openingBalance:0, balanceType:'receivable', currentBalance:0, createdAt:'2026-03-20', updatedAt:'2026-06-12', lastActivity:'2026-06-14' },
  { id:'ct-010', type:'person', roles:['customer','patient'], name:'Nadia Hussain', phone:'0334-1122334', email:'nadia.h@hotmail.com', address:'Flat 7, Al-Noor Heights, Gulshan-e-Ravi, Lahore', openingBalance:3200, balanceType:'receivable', currentBalance:0, createdAt:'2025-12-01', updatedAt:'2026-06-11', lastActivity:'2026-06-13' },
  { id:'ct-011', type:'person', roles:['patient'], name:'Muhammad Usman', phone:'0345-5566778', email:'usman.m@yahoo.com', address:'House 2, Street 10, Phase 5, DHA, Lahore', openingBalance:0, balanceType:'receivable', currentBalance:0, createdAt:'2025-07-15', updatedAt:'2026-06-10', lastActivity:'2026-06-12' },
  { id:'ct-012', type:'person', roles:['customer','patient'], name:'Farhan Ali', phone:'0301-4455667', email:'farhan.ali@gmail.com', address:'Shop 12, Saddar Bazaar, Rawalpindi', openingBalance:5600, balanceType:'receivable', currentBalance:0, createdAt:'2025-05-20', updatedAt:'2026-06-09', lastActivity:'2026-06-11' },
  { id:'ct-013', type:'person', roles:['patient'], name:'Nasreen Akhtar', phone:'0333-7788990', email:'nasreen.akhtar@gmail.com', address:'House 30, Street 7, Satellite Town, Rawalpindi', openingBalance:0, balanceType:'receivable', currentBalance:0, createdAt:'2026-04-01', updatedAt:'2026-06-08', lastActivity:'2026-06-10' },
  { id:'ct-014', type:'person', roles:['customer'], name:'Imran Khan', phone:'0300-3344556', email:'imran.khan@gmail.com', address:'Office 10, Plaza 66, The Mall, Lahore', openingBalance:22000, balanceType:'receivable', currentBalance:0, createdAt:'2025-01-20', updatedAt:'2026-06-07', lastActivity:'2026-06-09' },
  { id:'ct-015', type:'person', roles:['patient','customer'], name:'Ayesha Khan', phone:'0346-9988776', email:'ayesha.khan@gmail.com', address:'House 5, Block A, Gulshan-e-Maymar, Karachi', openingBalance:1800, balanceType:'receivable', currentBalance:0, createdAt:'2025-10-10', updatedAt:'2026-06-06', lastActivity:'2026-06-08' },
  { id:'ct-016', type:'person', roles:['patient'], name:'Shabnam Shah', phone:'0311-6677889', email:'shabnam.shah@gmail.com', address:'House 22, Street 4, Clifton, Karachi', openingBalance:0, balanceType:'receivable', currentBalance:0, createdAt:'2026-05-15', updatedAt:'2026-06-05', lastActivity:'2026-06-07' },
  { id:'ct-017', type:'organization', roles:['supplier'], name:'ABC Pharma', contactPerson:'Mr. Khalid Mehmood', phone:'042-35761234', email:'info@abcpharma.pk', address:'13-Km, Multan Road, Lahore', openingBalance:45000, balanceType:'payable', currentBalance:0, createdAt:'2025-01-05', updatedAt:'2026-06-20', lastActivity:'2026-06-22' },
  { id:'ct-018', type:'organization', roles:['supplier'], name:'Al-Noor Medical Store', contactPerson:'Mr. Rashid Ahmad', phone:'042-36889001', email:'alnoor@medical.com', address:'Shop 4, Doctors Plaza, Gulberg, Lahore', openingBalance:12000, balanceType:'payable', currentBalance:0, createdAt:'2025-02-10', updatedAt:'2026-06-19', lastActivity:'2026-06-21' },
  { id:'ct-019', type:'organization', roles:['supplier'], name:'City Distributors', contactPerson:'Mr. Naveed Iqbal', phone:'0300-8245567', email:'info@citydist.com', address:'18-Km, Ferozepur Road, Lahore', openingBalance:28000, balanceType:'payable', currentBalance:0, createdAt:'2025-03-15', updatedAt:'2026-06-18', lastActivity:'2026-06-20' },
  { id:'ct-020', type:'organization', roles:['customer'], name:'Beauty World Cosmetics', contactPerson:'Mrs. Sana Ullah', phone:'0311-4567890', email:'info@beautyworld.pk', address:'Shop 12, Liberty Market, Gulberg, Lahore', openingBalance:6400, balanceType:'receivable', currentBalance:0, createdAt:'2025-04-20', updatedAt:'2026-06-17', lastActivity:'2026-06-19' },
  { id:'ct-021', type:'organization', roles:['customer','supplier'], name:'Mobile Hub Lahore', contactPerson:'Mr. Adnan Malik', phone:'0301-7890123', email:'adnan@mobilehub.pk', address:'Shop 5, Hafeez Center, The Mall, Lahore', openingBalance:9500, balanceType:'receivable', currentBalance:0, createdAt:'2025-05-25', updatedAt:'2026-06-16', lastActivity:'2026-06-18' },
  { id:'ct-022', type:'organization', roles:['supplier'], name:'Surgical Mart Lahore', contactPerson:'Mr. Omar Farooq', phone:'042-37894561', email:'info@surgicalmart.pk', address:'3-Km, Raiwind Road, Lahore', openingBalance:32000, balanceType:'payable', currentBalance:0, createdAt:'2025-06-01', updatedAt:'2026-06-15', lastActivity:'2026-06-17' },
  { id:'ct-023', type:'organization', roles:['supplier'], name:'National Foods Distribution', contactPerson:'Mr. Faisal Javed', phone:'042-35778899', email:'faisal@nfoods.pk', address:'42-Km, Sheikhupura Road, Lahore', openingBalance:15000, balanceType:'payable', currentBalance:0, createdAt:'2025-07-10', updatedAt:'2026-06-14', lastActivity:'2026-06-16' },
  { id:'ct-024', type:'organization', roles:['customer'], name:'Al-Shifa Pharmacy', contactPerson:'Mr. Zain Abbas', phone:'042-35761234', email:'info@alshifa.pk', address:'Shop 8, Main Market, Johar Town, Lahore', openingBalance:3800, balanceType:'receivable', currentBalance:0, createdAt:'2025-08-05', updatedAt:'2026-06-13', lastActivity:'2026-06-15' },
  { id:'ct-025', type:'organization', roles:['supplier'], name:'Getz Pharma Pakistan', contactPerson:'Mr. Hussain Ahmad', phone:'021-34567890', email:'info@getz.pk', address:'32-Km, National Highway, Karachi', openingBalance:56000, balanceType:'payable', currentBalance:0, createdAt:'2025-09-01', updatedAt:'2026-06-12', lastActivity:'2026-06-14' },
  { id:'ct-026', type:'organization', roles:['supplier','customer'], name:'Khan & Sons Distributors', contactPerson:'Mr. Sohail Ahmed', phone:'0300-4466889', email:'sohail@khansons.pk', address:'12-Km, G.T. Road, Gujranwala', openingBalance:18500, balanceType:'payable', currentBalance:0, createdAt:'2025-10-15', updatedAt:'2026-06-11', lastActivity:'2026-06-13' },
  { id:'ct-027', type:'organization', roles:['customer'], name:'Green Pharmacy', contactPerson:'Mr. Junaid Iqbal', phone:'0311-2233445', email:'info@greenpharma.pk', address:'Shop 15, Allama Iqbal Town, Lahore', openingBalance:1200, balanceType:'receivable', currentBalance:0, createdAt:'2025-11-20', updatedAt:'2026-06-10', lastActivity:'2026-06-12' },
  { id:'ct-028', type:'organization', roles:['supplier'], name:'Unilever Pakistan', contactPerson:'Mr. Waqar Younis', phone:'021-35678901', email:'waqar@unilever.pk', address:'Avari Plaza, Fatima Jinnah Road, Karachi', openingBalance:78000, balanceType:'payable', currentBalance:0, createdAt:'2026-01-05', updatedAt:'2026-06-09', lastActivity:'2026-06-11' },
  { id:'ct-029', type:'organization', roles:['customer'], name:'Bismillah Grocers', contactPerson:'Mr. Rizwan Ahmed', phone:'0334-7788990', email:'rizwan@bismillah.com', address:'Shop 2, Main Bazaar, Sialkot', openingBalance:0, balanceType:'receivable', currentBalance:0, createdAt:'2026-02-10', updatedAt:'2026-06-08', lastActivity:'2026-06-10' },
  { id:'ct-030', type:'organization', roles:['supplier'], name:'Abbott Laboratories Pakistan', contactPerson:'Mr. Kamran Aslam', phone:'021-34561234', email:'kamran@abbott.pk', address:'Plot 25, Sector 15, Korangi Industrial Area, Karachi', openingBalance:92000, balanceType:'payable', currentBalance:0, createdAt:'2025-04-01', updatedAt:'2026-06-07', lastActivity:'2026-06-09' },
]

export const mockContactTransactions: ContactTransaction[] = [
  { id:'ctx-001', contactId:'ct-001', type:'sale', date:'2026-06-22', amount:4500, reference:'SALE-101', description:'Retail purchase — medicines & supplements' },
  { id:'ctx-002', contactId:'ct-005', type:'sale', date:'2026-06-21', amount:8500, reference:'SALE-098', description:'Wholesale order — cosmetics & skincare' },
  { id:'ctx-003', contactId:'ct-017', type:'purchase', date:'2026-06-20', amount:35000, reference:'PUR-201', description:'Medicine stock — antibiotics & analgesics' },
  { id:'ctx-004', contactId:'ct-020', type:'sale', date:'2026-06-19', amount:6400, reference:'SALE-096', description:'Beauty products bulk order' },
  { id:'ctx-005', contactId:'ct-018', type:'purchase', date:'2026-06-18', amount:12000, reference:'PUR-203', description:'Clinic supplies — syringes, gloves' },
  { id:'ctx-006', contactId:'ct-021', type:'sale', date:'2026-06-17', amount:9500, reference:'SALE-095', description:'Mobile accessories — cables, chargers' },
  { id:'ctx-007', contactId:'ct-001', type:'sale', date:'2026-06-16', amount:2200, reference:'SALE-094', description:'Clinic visit — consultation + medicine' },
  { id:'ctx-008', contactId:'ct-002', type:'sale', date:'2026-06-15', amount:1800, reference:'SALE-093', description:'General checkup & prescription' },
  { id:'ctx-009', contactId:'ct-022', type:'purchase', date:'2026-06-14', amount:28000, reference:'PUR-205', description:'Surgical supplies — gloves, masks' },
  { id:'ctx-010', contactId:'ct-014', type:'sale', date:'2026-06-13', amount:15000, reference:'SALE-092', description:'Bulk stationary order' },
  { id:'ctx-011', contactId:'ct-025', type:'purchase', date:'2026-06-12', amount:45000, reference:'PUR-207', description:'Pharmaceuticals — cardiac meds' },
  { id:'ctx-012', contactId:'ct-010', type:'sale', date:'2026-06-11', amount:3200, reference:'SALE-091', description:'Follow-up visit + lab tests' },
  { id:'ctx-013', contactId:'ct-019', type:'purchase', date:'2026-06-10', amount:22000, reference:'PUR-209', description:'General merchandise restock' },
  { id:'ctx-014', contactId:'ct-005', type:'payment_in', date:'2026-06-09', amount:3000, reference:'PMT-501', description:'Partial payment on account' },
  { id:'ctx-015', contactId:'ct-017', type:'payment_out', date:'2026-06-08', amount:35000, reference:'PMT-502', description:'Payment against PUR-201' },
]

export const mockContactPayments: ContactPayment[] = [
  { id:'cp-001', contactId:'ct-001', direction:'in', date:'2026-06-22', amount:2000, method:'cash', reference:'PMT-101' },
  { id:'cp-002', contactId:'ct-005', direction:'in', date:'2026-06-21', amount:3000, method:'transfer', reference:'PMT-102' },
  { id:'cp-003', contactId:'ct-014', direction:'in', date:'2026-06-20', amount:5000, method:'cash', reference:'PMT-103' },
  { id:'cp-004', contactId:'ct-017', direction:'out', date:'2026-06-19', amount:35000, method:'transfer', reference:'PMT-104' },
  { id:'cp-005', contactId:'ct-020', direction:'in', date:'2026-06-18', amount:2000, method:'cash', reference:'PMT-105' },
  { id:'cp-006', contactId:'ct-018', direction:'out', date:'2026-06-17', amount:12000, method:'transfer', reference:'PMT-106' },
  { id:'cp-007', contactId:'ct-021', direction:'in', date:'2026-06-16', amount:4000, method:'cash', reference:'PMT-107' },
  { id:'cp-008', contactId:'ct-022', direction:'out', date:'2026-06-15', amount:28000, method:'transfer', reference:'PMT-108' },
  { id:'cp-009', contactId:'ct-025', direction:'out', date:'2026-06-14', amount:45000, method:'transfer', reference:'PMT-109' },
  { id:'cp-010', contactId:'ct-002', direction:'in', date:'2026-06-13', amount:1800, method:'cash', reference:'PMT-110' },
]

export function getContactById(id: string): Contact | undefined {
  return mockContacts.find((c) => c.id === id)
}

export function getContactTransactions(contactId: string): ContactTransaction[] {
  return mockContactTransactions.filter((t) => t.contactId === contactId)
}

export function getContactPayments(contactId: string): ContactPayment[] {
  return mockContactPayments.filter((p) => p.contactId === contactId)
}

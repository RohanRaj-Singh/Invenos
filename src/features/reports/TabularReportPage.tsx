import { useMemo } from 'react'
import { ReportLayout } from './components/ReportLayout'
import { ReportToolbar } from './components/ReportToolbar'
import { ReportFilterBar, useReportFilters } from './components/ReportFilters'
import { SummaryCards, type SummaryCardDef } from './components/SummaryCards'
import { ReportTable, type ColumnDef } from './components/ReportTable'
import type { DateRange } from './components/ReportFilters'

export interface TabularReportConfig<T> {
  title: string
  subtitle: string
  icon: React.ReactNode
  getData: (range: DateRange) => T[]
  columns: ColumnDef<T>[]
  keyExtractor: (row: T) => string
  summaryCards: (data: T[], range: DateRange) => SummaryCardDef[]
  emptyMessage: string
  searchable?: boolean
  searchPlaceholder?: string
  onSearch?: (data: T[], query: string) => T[]
  showPaymentMethod?: boolean
}

export function createTabularReport<T>(config: TabularReportConfig<T>) {
  return function ReportPage() {
    const { filters, setFilters, setPreset, dateRange } = useReportFilters()

    const data = useMemo(() => config.getData(dateRange), [dateRange])
    const cards = useMemo(() => config.summaryCards(data, dateRange), [data, dateRange])

    return (
      <ReportLayout
        title={config.title}
        subtitle={config.subtitle}
        icon={config.icon}
        toolbar={<ReportToolbar onPrint={() => window.print()} />}
      >
        <ReportFilterBar
          filters={filters}
          setFilters={setFilters}
          setPreset={setPreset}
          showPaymentMethod={config.showPaymentMethod}
        />
        <SummaryCards cards={cards} />
        <ReportTable
          columns={config.columns}
          data={data}
          keyExtractor={config.keyExtractor}
          pageSize={25}
          searchable={config.searchable}
          searchPlaceholder={config.searchPlaceholder}
          onSearch={config.onSearch}
          emptyMessage={config.emptyMessage}
        />
      </ReportLayout>
    )
  }
}

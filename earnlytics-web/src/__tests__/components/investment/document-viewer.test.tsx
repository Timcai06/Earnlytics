import { render, screen } from '@testing-library/react'
import { DocumentViewer } from '@/components/investment/DocumentViewer'

const baseProps = {
  documentId: '123',
  symbol: 'AAPL',
  filingType: 'FY2025 Q1',
  filingDate: '2026-01-31',
  externalUrl: 'https://www.sec.gov/example',
  aiSummary: {
    highlights: ['营收增长稳健', '毛利率提升'],
    keyMetrics: [
      { label: '目标价下限', value: '$180.00' },
      { label: '目标价上限', value: '$220.00' },
    ],
    sentiment: 'positive' as const,
  },
}

describe('DocumentViewer', () => {
  it('renders filing metadata', () => {
    render(<DocumentViewer {...baseProps} />)

    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('FY2025 Q1')).toBeInTheDocument()
    expect(screen.getByText('2026-01-31')).toBeInTheDocument()
  })

  it('renders AI highlights and key metrics', () => {
    render(<DocumentViewer {...baseProps} />)

    expect(screen.getByText('核心要点')).toBeInTheDocument()
    expect(screen.getByText('营收增长稳健')).toBeInTheDocument()
    expect(screen.getByText('关键指标')).toBeInTheDocument()
    expect(screen.getByText('目标价下限')).toBeInTheDocument()
  })

  it('shows external source link', () => {
    render(<DocumentViewer {...baseProps} />)

    const link = screen.getByText('查看源文档')
    expect(link).toHaveAttribute('href', baseProps.externalUrl)
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('supports loading state', () => {
    render(<DocumentViewer {...baseProps} isLoading />)

    expect(screen.getByText('加载中...')).toBeInTheDocument()
  })

  it('renders without AI summary', () => {
    render(<DocumentViewer {...baseProps} aiSummary={undefined} />)

    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.queryByText('核心要点')).not.toBeInTheDocument()
  })
})

import { act, render, screen } from '@testing-library/react'
import DashboardPage from '@/app/dashboard/page'
import DashboardClient from '@/app/dashboard/DashboardClient'
import { getDashboardCompanies, getInvestmentRecommendations } from '@/app/dashboard/dashboard-data'

jest.mock('@/app/dashboard/dashboard-data', () => ({
  getDashboardCompanies: jest.fn(),
  getInvestmentRecommendations: jest.fn(),
}))

const mockedGetDashboardCompanies = getDashboardCompanies as jest.MockedFunction<typeof getDashboardCompanies>
const mockedGetInvestmentRecommendations = getInvestmentRecommendations as jest.MockedFunction<typeof getInvestmentRecommendations>

const mockRecommendations = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    rating: 'buy',
    confidence: 'high',
    targetPriceLow: 180,
    targetPriceHigh: 220,
    currentPrice: 175.5,
    keyPoints: ['服务业务增长稳定', '现金流强劲'],
    updatedAt: '2026-03-01T00:00:00.000Z',
  },
]

const mockCompanies = [
  {
    id: 1,
    symbol: 'AAPL',
    name: 'Apple Inc.',
    sector: '消费电子',
    logo_url: null,
    created_at: '2026-01-01T00:00:00.000Z',
  },
]

describe('Dashboard integration', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    mockedGetDashboardCompanies.mockResolvedValue(mockCompanies)
    mockedGetInvestmentRecommendations.mockResolvedValue(mockRecommendations)
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it('renders dashboard page with recommendations from server data', async () => {
    const page = await DashboardPage()
    render(page)
    act(() => {
      jest.advanceTimersByTime(700)
    })

    expect(screen.getByText('投资仪表盘')).toBeInTheDocument()
    expect(screen.getByText('最新投资建议')).toBeInTheDocument()
    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('买入')).toBeInTheDocument()
  })

  it('renders analysis and earnings links for recommendation card', () => {
    render(
      <DashboardClient
        initialRecommendations={mockRecommendations}
        companies={mockCompanies}
      />
    )
    act(() => {
      jest.advanceTimersByTime(700)
    })

    const analysisLink = screen.getByRole('link', { name: '深度分析' })
    const earningsLink = screen.getByRole('link', { name: '财报' })

    expect(analysisLink).toHaveAttribute('href', '/analysis/aapl')
    expect(earningsLink).toHaveAttribute('href', '/earnings/aapl')
  })

  it('renders dashboard tab controls', () => {
    render(
      <DashboardClient
        initialRecommendations={mockRecommendations}
        companies={mockCompanies}
      />
    )

    expect(screen.getByRole('tab', { name: /概览/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /公司/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /日历/ })).toBeInTheDocument()
  })
})

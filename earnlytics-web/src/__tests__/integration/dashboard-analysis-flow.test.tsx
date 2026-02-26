import { render, screen, fireEvent, waitFor } from '@testing-library/react'
/* eslint-disable @typescript-eslint/no-require-imports */
import { useRouter } from 'next/navigation'
import DashboardPage from '@/app/dashboard/page'
import AnalysisPage from '@/app/analysis/[symbol]/page'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}))

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
}

const mockFetch = jest.fn()
global.fetch = mockFetch

describe('Dashboard to Analysis Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    mockFetch.mockClear()
  })

  describe('Dashboard Page', () => {
    it('renders market overview section', () => {
      render(<DashboardPage />)
      
      expect(screen.getByText('投资仪表盘')).toBeInTheDocument()
      expect(screen.getByText('市场概览')).toBeInTheDocument()
    })

    it('displays AI recommendations section', () => {
      render(<DashboardPage />)
      
      expect(screen.getByText('AI 投资建议')).toBeInTheDocument()
    })

    it('navigates to analysis page when company card clicked', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          symbol: 'AAPL',
          investmentRating: 'buy',
          confidence: 'high',
          targetPrice: { low: 180, high: 220 },
          currentPrice: 175.5,
        }),
      })

      render(<DashboardPage />)
      
      const companyCard = await screen.findByText('AAPL')
      fireEvent.click(companyCard)
      
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/analysis/AAPL')
      })
    })
  })

  describe('Analysis Page', () => {
    const mockParams = { symbol: 'AAPL' }

    beforeEach(() => {
      ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
      jest.spyOn(require('next/navigation'), 'useParams').mockReturnValue(mockParams)
    })

    it('fetches and displays company analysis data', async () => {
      mockFetch
        .mockResolvedValueOnce({
          json: async () => ({
            symbol: 'AAPL',
            investmentRating: 'buy',
            confidence: 'high',
            targetPrice: { low: 180, high: 220 },
            currentPrice: 175.5,
            financialQuality: { score: 85 },
            growth: { stage: 'maturity', revenueCAGR3Y: 8.5 },
            moat: { strength: 'wide', porterScore: 85 },
            valuation: { assessment: 'fair', pePercentile: 52 },
            keyPoints: ['Leading market position'],
            risks: ['Regulatory pressure'],
            catalysts: ['AI features'],
          }),
        })
        .mockResolvedValueOnce({
          json: async () => ({
            symbol: 'AAPL',
            pe_ratio: 28.5,
            historical_percentile: 52,
          }),
        })

      render(<AnalysisPage />)
      
      await waitFor(() => {
        expect(screen.getByText('AAPL')).toBeInTheDocument()
        expect(screen.getByText('买入')).toBeInTheDocument()
      })
    })

    it('switches between analysis tabs', async () => {
      mockFetch.mockResolvedValue({
        json: async () => ({
          symbol: 'AAPL',
          investmentRating: 'buy',
          financialQuality: { score: 85 },
          growth: { stage: 'maturity', revenueCAGR3Y: 8.5 },
          moat: { strength: 'wide' },
          valuation: { assessment: 'fair' },
        }),
      })

      render(<AnalysisPage />)
      
      await waitFor(() => {
        expect(screen.getByText('五维分析')).toBeInTheDocument()
      })

      const growthTab = screen.getByText('成长性')
      fireEvent.click(growthTab)
      
      expect(screen.getByText('增长阶段')).toBeInTheDocument()
    })

    it('displays error state when API fails', async () => {
      mockFetch.mockRejectedValue(new Error('API Error'))

      render(<AnalysisPage />)
      
      await waitFor(() => {
        expect(screen.getByText('加载失败，请重试')).toBeInTheDocument()
      })
    })

    it('renders document viewer section', async () => {
      mockFetch
        .mockResolvedValueOnce({
          json: async () => ({
            symbol: 'AAPL',
            investmentRating: 'buy',
          }),
        })
        .mockResolvedValueOnce({
          json: async () => ({
            pe_ratio: 28.5,
          }),
        })

      render(<AnalysisPage />)
      
      await waitFor(() => {
        expect(screen.getByText('财报原文')).toBeInTheDocument()
      })
    })
  })

  describe('Data Flow Integration', () => {
    it('fetches valuation data when symbol changes', async () => {
      mockFetch.mockResolvedValue({
        json: async () => ({
          symbol: 'MSFT',
          pe_ratio: 32.1,
          historical_percentile: 65,
        }),
      })

      jest.spyOn(require('next/navigation'), 'useParams').mockReturnValue({ symbol: 'MSFT' })
      
      render(<AnalysisPage />)
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/valuation/MSFT')
        )
      })
    })

    it('caches analysis data to prevent duplicate requests', async () => {
      const mockData = {
        symbol: 'AAPL',
        investmentRating: 'buy',
      }

      mockFetch.mockResolvedValue({
        json: async () => mockData,
      })

      const { rerender } = render(<AnalysisPage />)
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2)
      })

      rerender(<AnalysisPage />)
      
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })
})

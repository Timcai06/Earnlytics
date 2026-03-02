import { render, screen } from '@testing-library/react'
import { InvestmentRatingCard } from '@/components/investment/InvestmentRatingCard'

const baseProps = {
  symbol: 'AAPL',
  name: 'Apple Inc.',
  rating: 'buy' as const,
  confidence: 'high' as const,
  targetPrice: { low: 180, high: 220 },
  currentPrice: 175.5,
  previousClose: 170,
  keyPoints: ['服务业务保持增长', '毛利率改善', '现金流稳健'],
  dataSource: 'live',
}

describe('InvestmentRatingCard', () => {
  it('renders rating and confidence', () => {
    render(<InvestmentRatingCard {...baseProps} />)

    expect(screen.getByText('买入')).toBeInTheDocument()
    expect(screen.getByText('高置信度')).toBeInTheDocument()
  })

  it('renders target price range and current price', () => {
    render(<InvestmentRatingCard {...baseProps} />)

    expect(screen.getByText('$180.00 - $220.00')).toBeInTheDocument()
    expect(screen.getByText('$175.50')).toBeInTheDocument()
  })

  it('renders key points', () => {
    render(<InvestmentRatingCard {...baseProps} />)

    baseProps.keyPoints.forEach((point) => {
      expect(screen.getByText(point)).toBeInTheDocument()
    })
  })

  it('handles missing target price gracefully', () => {
    render(
      <InvestmentRatingCard
        {...baseProps}
        targetPrice={{ low: 0, high: 0 }}
      />
    )

    expect(screen.getByText('目标价数据暂不可用')).toBeInTheDocument()
  })

  it('supports other rating variants', () => {
    const { rerender } = render(<InvestmentRatingCard {...baseProps} rating="strong_buy" />)
    expect(screen.getByText('强烈买入')).toBeInTheDocument()

    rerender(<InvestmentRatingCard {...baseProps} rating="hold" />)
    expect(screen.getByText('持有')).toBeInTheDocument()

    rerender(<InvestmentRatingCard {...baseProps} rating="strong_sell" />)
    expect(screen.getByText('强烈卖出')).toBeInTheDocument()
  })
})

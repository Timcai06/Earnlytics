import { render, screen } from '@testing-library/react'
import { InvestmentRatingCard } from '@/components/investment/InvestmentRatingCard'
import { 
  mockInvestmentRating, 
  createMockInvestmentRating 
} from '@/__tests__/test-utils'

describe('InvestmentRatingCard', () => {
  it('renders buy rating correctly', () => {
    render(<InvestmentRatingCard data={mockInvestmentRating} />)
    
    expect(screen.getByText('买入')).toBeInTheDocument()
    expect(screen.getByText('高信心度')).toBeInTheDocument()
    expect(screen.getByText('$175.50')).toBeInTheDocument()
  })

  it('renders strong buy rating with correct styling', () => {
    const strongBuyData = createMockInvestmentRating({ 
      rating: 'strong_buy',
      confidence: 'high'
    })
    render(<InvestmentRatingCard data={strongBuyData} />)
    
    expect(screen.getByText('强烈买入')).toBeInTheDocument()
  })

  it('renders hold rating', () => {
    const holdData = createMockInvestmentRating({ rating: 'hold' })
    render(<InvestmentRatingCard data={holdData} />)
    
    expect(screen.getByText('持有')).toBeInTheDocument()
  })

  it('renders sell rating', () => {
    const sellData = createMockInvestmentRating({ rating: 'sell' })
    render(<InvestmentRatingCard data={sellData} />)
    
    expect(screen.getByText('卖出')).toBeInTheDocument()
  })

  it('renders strong sell rating', () => {
    const strongSellData = createMockInvestmentRating({ rating: 'strong_sell' })
    render(<InvestmentRatingCard data={strongSellData} />)
    
    expect(screen.getByText('强烈卖出')).toBeInTheDocument()
  })

  it('displays target price range', () => {
    render(<InvestmentRatingCard data={mockInvestmentRating} />)
    
    expect(screen.getByText('$180 - $220')).toBeInTheDocument()
  })

  it('displays investment thesis points', () => {
    render(<InvestmentRatingCard data={mockInvestmentRating} />)
    
    mockInvestmentRating.investmentThesis.forEach(point => {
      expect(screen.getByText(point)).toBeInTheDocument()
    })
  })

  it('displays key risks', () => {
    render(<InvestmentRatingCard data={mockInvestmentRating} />)
    
    mockInvestmentRating.keyRisks.forEach(risk => {
      expect(screen.getByText(risk)).toBeInTheDocument()
    })
  })

  it('displays catalysts', () => {
    render(<InvestmentRatingCard data={mockInvestmentRating} />)
    
    mockInvestmentRating.catalysts.forEach(catalyst => {
      expect(screen.getByText(catalyst)).toBeInTheDocument()
    })
  })

  it('handles medium confidence level', () => {
    const mediumConfidenceData = createMockInvestmentRating({ 
      confidence: 'medium' 
    })
    render(<InvestmentRatingCard data={mediumConfidenceData} />)
    
    expect(screen.getByText('中等信心度')).toBeInTheDocument()
  })

  it('handles low confidence level', () => {
    const lowConfidenceData = createMockInvestmentRating({ 
      confidence: 'low' 
    })
    render(<InvestmentRatingCard data={lowConfidenceData} />)
    
    expect(screen.getByText('低信心度')).toBeInTheDocument()
  })

  it('formats current price with two decimal places', () => {
    const dataWithPrice = createMockInvestmentRating({ 
      currentPrice: 123.456 
    })
    render(<InvestmentRatingCard data={dataWithPrice} />)
    
    expect(screen.getByText('$123.46')).toBeInTheDocument()
  })

  it('renders card with proper structure', () => {
    const { container } = render(<InvestmentRatingCard data={mockInvestmentRating} />)
    
    expect(container.querySelector('[class*="rounded"]')).toBeInTheDocument()
  })
})

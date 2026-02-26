import { render, screen, fireEvent } from '@testing-library/react'
import { DocumentViewer } from '@/components/investment/DocumentViewer'
import { mockSECDocument, mockAISummary } from '@/__tests__/test-utils'

describe('DocumentViewer', () => {
  const defaultProps = {
    document: mockSECDocument,
    aiSummary: mockAISummary,
    symbol: 'AAPL',
  }

  it('renders with AI view by default', () => {
    render(<DocumentViewer {...defaultProps} />)
    
    expect(screen.getByText('AI 智能摘要')).toBeInTheDocument()
    expect(screen.getByText('Strong performance with record Services revenue and improved margins across all product categories.')).toBeInTheDocument()
  })

  it('switches to original document view when tab clicked', () => {
    render(<DocumentViewer {...defaultProps} />)
    
    const originalTab = screen.getByText('原文')
    fireEvent.click(originalTab)
    
    expect(screen.getByText('SEC EDGAR 原文')).toBeInTheDocument()
    expect(screen.getByText(/Apple Inc./)).toBeInTheDocument()
  })

  it('switches to split view when tab clicked', () => {
    render(<DocumentViewer {...defaultProps} />)
    
    const splitTab = screen.getByText('对照')
    fireEvent.click(splitTab)
    
    expect(screen.getByText('AI 智能摘要')).toBeInTheDocument()
    expect(screen.getByText('SEC EDGAR 原文')).toBeInTheDocument()
  })

  it('displays document metadata', () => {
    render(<DocumentViewer {...defaultProps} />)
    
    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('10-K')).toBeInTheDocument()
    expect(screen.getByText('FY2024')).toBeInTheDocument()
  })

  it('displays filing date', () => {
    render(<DocumentViewer {...defaultProps} />)
    
    expect(screen.getByText(/2024-10-30/)).toBeInTheDocument()
  })

  it('displays AI summary key highlights', () => {
    render(<DocumentViewer {...defaultProps} />)
    
    mockAISummary.summary.keyHighlights.forEach(highlight => {
      expect(screen.getByText(highlight)).toBeInTheDocument()
    })
  })

  it('shows external link to SEC filing', () => {
    render(<DocumentViewer {...defaultProps} />)
    
    const link = screen.getByText('查看 SEC 原文')
    expect(link).toHaveAttribute('href', mockSECDocument.documentUrl)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('handles missing AI summary gracefully', () => {
    render(<DocumentViewer {...defaultProps} aiSummary={null} />)
    
    expect(screen.getByText('暂无 AI 分析')).toBeInTheDocument()
  })

  it('displays document size in readable format', () => {
    render(<DocumentViewer {...defaultProps} />)
    
    expect(screen.getByText(/14.7 MB/)).toBeInTheDocument()
  })

  it('displays page count', () => {
    render(<DocumentViewer {...defaultProps} />)
    
    expect(screen.getByText(/95 页/)).toBeInTheDocument()
  })

  it('preserves view state when switching between tabs', () => {
    render(<DocumentViewer {...defaultProps} />)
    
    const originalTab = screen.getByText('原文')
    fireEvent.click(originalTab)
    
    const aiTab = screen.getByText('AI摘要')
    fireEvent.click(aiTab)
    
    expect(screen.getByText('AI 智能摘要')).toBeInTheDocument()
  })

  it('renders with proper container structure', () => {
    const { container } = render(<DocumentViewer {...defaultProps} />)
    
    expect(container.querySelector('[class*="border"]')).toBeInTheDocument()
  })
})

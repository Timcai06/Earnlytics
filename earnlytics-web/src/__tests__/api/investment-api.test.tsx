import { NextRequest } from 'next/server'
import { GET } from '@/app/api/valuation/[symbol]/route'
import { GET as getPeers } from '@/app/api/peers/[symbol]/route'
import { GET as getSectors } from '@/app/api/sectors/route'

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          order: jest.fn(() => ({
            limit: jest.fn(),
          })),
        })),
        order: jest.fn(() => ({
          limit: jest.fn(),
        })),
      })),
    })),
  },
}))

describe('Valuation API', () => {
  const mockValuationData = {
    symbol: 'AAPL',
    market_cap: 2800000000000,
    pe_ratio: 28.5,
    pb_ratio: 8.2,
    ps_ratio: 7.1,
    roe: 25.5,
    roa: 12.3,
    debt_to_equity: 0.4,
    current_ratio: 1.8,
    updated_at: '2024-11-01T00:00:00Z',
  }

  it('returns valuation data for valid symbol', async () => {
    const { supabase } = require('@/lib/supabase')
    supabase.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: mockValuationData,
            error: null,
          }),
        })),
      })),
    })

    const request = new NextRequest('http://localhost/api/valuation/AAPL')
    const response = await GET(request, { params: { symbol: 'AAPL' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.symbol).toBe('AAPL')
    expect(data.pe_ratio).toBe(28.5)
    expect(data.roe).toBe(25.5)
  })

  it('returns 404 for non-existent symbol', async () => {
    const { supabase } = require('@/lib/supabase')
    supabase.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Not found' },
          }),
        })),
      })),
    })

    const request = new NextRequest('http://localhost/api/valuation/INVALID')
    const response = await GET(request, { params: { symbol: 'INVALID' } })

    expect(response.status).toBe(404)
  })

  it('returns historical PE percentiles', async () => {
    const { supabase } = require('@/lib/supabase')
    supabase.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn().mockResolvedValue({
              data: [{ pe_ratio: 25.0 }, { pe_ratio: 30.0 }],
              error: null,
            }),
          })),
        })),
      })),
    })

    const request = new NextRequest('http://localhost/api/valuation/AAPL')
    const response = await GET(request, { params: { symbol: 'AAPL' } })
    const data = await response.json()

    expect(data.historical_percentile).toBeDefined()
  })
})

describe('Peers API', () => {
  const mockPeerData = [
    { symbol: 'AAPL', company_name: 'Apple Inc.', pe_ratio: 28.5, roe: 25.5 },
    { symbol: 'MSFT', company_name: 'Microsoft', pe_ratio: 32.1, roe: 22.8 },
  ]

  it('returns peer comparison data', async () => {
    const { supabase } = require('@/lib/supabase')
    supabase.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn().mockResolvedValue({
              data: mockPeerData,
              error: null,
            }),
          })),
        })),
      })),
    })

    const request = new NextRequest('http://localhost/api/peers/AAPL')
    const response = await getPeers(request, { params: { symbol: 'AAPL' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.peers).toHaveLength(2)
    expect(data.peers[0].symbol).toBe('AAPL')
  })

  it('includes percentile rankings', async () => {
    const { supabase } = require('@/lib/supabase')
    supabase.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn().mockResolvedValue({
              data: mockPeerData,
              error: null,
            }),
          })),
        })),
      })),
    })

    const request = new NextRequest('http://localhost/api/peers/AAPL')
    const response = await getPeers(request, { params: { symbol: 'AAPL' } })
    const data = await response.json()

    expect(data.percentiles).toBeDefined()
    expect(data.percentiles.pe).toBeGreaterThanOrEqual(0)
    expect(data.percentiles.pe).toBeLessThanOrEqual(100)
  })
})

describe('Sectors API', () => {
  const mockSectorData = [
    { 
      sector: 'Technology', 
      industry: 'Consumer Electronics',
      avg_pe: 29.2,
      median_pe: 27.5,
      avg_roe: 18.5,
      company_count: 15,
    },
  ]

  it('returns all industry benchmarks', async () => {
    const { supabase } = require('@/lib/supabase')
    supabase.from.mockReturnValue({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          limit: jest.fn().mockResolvedValue({
            data: mockSectorData,
            error: null,
          }),
        })),
      })),
    })

    const request = new NextRequest('http://localhost/api/sectors')
    const response = await getSectors(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.sectors).toHaveLength(1)
    expect(data.sectors[0].sector).toBe('Technology')
  })

  it('filters by sector when query param provided', async () => {
    const { supabase } = require('@/lib/supabase')
    supabase.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: mockSectorData[0],
            error: null,
          }),
        })),
      })),
    })

    const request = new NextRequest('http://localhost/api/sectors?sector=Technology')
    const response = await getSectors(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.sector).toBe('Technology')
  })
})

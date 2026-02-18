import { NextRequest } from 'next/server'

// Mock Supabase before importing routes
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

// Import routes after mocking
import { GET as getValuation } from '@/app/api/valuation/[symbol]/route'
import { GET as getPeers } from '@/app/api/peers/[symbol]/route'
import { GET as getSectors } from '@/app/api/sectors/route'

describe('Investment APIs', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Valuation API', () => {
    it('should return 404 for non-existent symbol', async () => {
      const { supabase } = require('@/lib/supabase')
      
      supabase.from.mockImplementation((table: string) => {
        if (table === 'company_valuation') {
          return {
            select: jest.fn(() => ({
              ilike: jest.fn(() => ({
                order: jest.fn(() => ({
                  limit: jest.fn(() => ({
                    single: jest.fn().mockResolvedValue({
                      data: null,
                      error: { code: 'PGRST116', message: 'Not found' },
                    }),
                  })),
                })),
              })),
            })),
          }
        }
        return { select: jest.fn() }
      })

      const request = new NextRequest('http://localhost/api/valuation/INVALID')
      const response = await getValuation(request, { params: Promise.resolve({ symbol: 'INVALID' }) })

      expect(response.status).toBe(404)
    })

    it('should handle database errors gracefully', async () => {
      const { supabase } = require('@/lib/supabase')
      
      supabase.from.mockImplementation(() => {
        return {
          select: jest.fn(() => {
            throw new Error('Database connection failed')
          }),
        }
      })

      const request = new NextRequest('http://localhost/api/valuation/AAPL')
      const response = await getValuation(request, { params: Promise.resolve({ symbol: 'AAPL' }) })

      expect(response.status).toBe(500)
    })
  })

  describe('Peers API', () => {
    it('should return 404 when company not found', async () => {
      const { supabase } = require('@/lib/supabase')
      
      supabase.from.mockImplementation((table: string) => {
        if (table === 'companies') {
          return {
            select: jest.fn(() => ({
              ilike: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Not found' },
                }),
              })),
            })),
          }
        }
        return { select: jest.fn() }
      })

      const request = new NextRequest('http://localhost/api/peers/INVALID')
      const response = await getPeers(request, { params: Promise.resolve({ symbol: 'INVALID' }) })

      expect(response.status).toBe(404)
    })

    it('should handle database errors gracefully', async () => {
      const { supabase } = require('@/lib/supabase')
      
      supabase.from.mockImplementation(() => {
        return {
          select: jest.fn(() => {
            throw new Error('Database connection failed')
          }),
        }
      })

      const request = new NextRequest('http://localhost/api/peers/AAPL')
      const response = await getPeers(request, { params: Promise.resolve({ symbol: 'AAPL' }) })

      expect(response.status).toBe(500)
    })
  })

  describe('Sectors API', () => {
    it('should return sectors data successfully', async () => {
      const { supabase } = require('@/lib/supabase')
      
      const mockBenchmarks = [
        {
          sector: 'Technology',
          industry: 'Software',
          date: '2024-01-01',
          pe_ratio_median: 25.5,
          pb_ratio_median: 5.2,
          ps_ratio_median: 8.1,
          roe_median: 15.2,
          roa_median: 8.5,
          ev_ebitda_median: 18.2,
          company_count: 50,
        },
        {
          sector: 'Technology',
          industry: 'Hardware',
          date: '2024-01-01',
          pe_ratio_median: 20.1,
          pb_ratio_median: 4.1,
          ps_ratio_median: 2.5,
          roe_median: 12.1,
          roa_median: 6.8,
          ev_ebitda_median: 12.5,
          company_count: 30,
        },
      ]

      supabase.from.mockImplementation((table: string) => {
        if (table === 'industry_benchmarks') {
          return {
            select: jest.fn(() => ({
              order: jest.fn().mockResolvedValue({
                data: mockBenchmarks,
                error: null,
              }),
            })),
          }
        }
        return { select: jest.fn() }
      })

      const request = new NextRequest('http://localhost/api/sectors')
      const response = await getSectors(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.sectors).toBeDefined()
      expect(data.totalSectors).toBeGreaterThan(0)
    })

    it('should return 404 for non-existent sector', async () => {
      const { supabase } = require('@/lib/supabase')
      
      supabase.from.mockImplementation((table: string) => {
        if (table === 'industry_benchmarks') {
          return {
            select: jest.fn(() => ({
              order: jest.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            })),
          }
        }
        return { select: jest.fn() }
      })

      const request = new NextRequest('http://localhost/api/sectors?sector=NonExistent')
      const response = await getSectors(request)

      expect(response.status).toBe(404)
    })

    it('should handle database errors gracefully', async () => {
      const { supabase } = require('@/lib/supabase')
      
      supabase.from.mockImplementation(() => {
        return {
          select: jest.fn(() => {
            throw new Error('Database connection failed')
          }),
        }
      })

      const request = new NextRequest('http://localhost/api/sectors')
      const response = await getSectors(request)

      expect(response.status).toBe(500)
    })
  })
})

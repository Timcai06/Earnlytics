import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  try {
    const { id } = await params;
    const earningsId = parseInt(id);

    if (isNaN(earningsId)) {
      return NextResponse.json(
        { error: 'Invalid earnings ID' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    const accessType = searchParams.get('accessType') || 'view';

    const { data: earnings, error: earningsError } = await supabase
      .from('earnings')
      .select('id, symbol, fiscal_year, fiscal_quarter, report_date')
      .eq('id', earningsId)
      .single();

    if (earningsError || !earnings) {
      return NextResponse.json(
        { error: 'Earnings record not found' },
        { status: 404 }
      );
    }

    const { data: document, error: documentError } = await supabase
      .from('earnings_documents')
      .select(`
        *,
        ai_analyses (
          id,
          summary,
          highlights,
          concerns,
          sentiment
        )
      `)
      .eq('earnings_id', earningsId)
      .single();

    if (documentError && documentError.code !== 'PGRST116') {
      throw documentError;
    }

    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    await supabase.from('document_access_logs').insert({
      document_id: document?.id || earningsId,
      document_type: 'earnings',
      ip_address: clientIP,
      access_type: accessType,
    });

    if (!document) {
      return NextResponse.json({
        earnings,
        document: null,
        message: 'Original document not yet available. Showing AI summary only.',
        aiSummary: null,
      });
    }

    if (format === 'raw') {
      return NextResponse.json({
        earnings,
        document: {
          id: document.id,
          source: document.source,
          documentType: document.document_type,
          filingDate: document.filing_date,
          sourceUrl: document.source_url,
          rawHtmlUrl: document.raw_html_url,
          rawPdfUrl: document.raw_pdf_url,
          pageCount: document.page_count,
          wordCount: document.word_count,
        },
        content: document.content,
      });
    }

    return NextResponse.json({
      earnings,
      document: {
        id: document.id,
        source: document.source,
        documentType: document.document_type,
        filingDate: document.filing_date,
        sourceUrl: document.source_url,
        rawHtmlUrl: document.raw_html_url,
        rawPdfUrl: document.raw_pdf_url,
        pageCount: document.page_count,
        wordCount: document.word_count,
        language: document.language,
      },
      content: document.content,
      aiSummary: document.ai_analyses ? {
        highlights: document.ai_analyses.highlights || [],
        concerns: document.ai_analyses.concerns || [],
        summary: document.ai_analyses.summary || '',
        sentiment: document.ai_analyses.sentiment || 'neutral',
      } : null,
      hasOriginal: !!document.content || !!document.raw_html_url,
      externalLinks: {
        secEdgar: document.source === 'sec_edgar' ? document.source_url : null,
        companyIR: document.source === 'company_ir' ? document.source_url : null,
        pdf: document.raw_pdf_url,
      },
    });
  } catch (error) {
    console.error('Error fetching earnings document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

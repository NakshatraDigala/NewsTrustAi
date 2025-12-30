import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    
    if (!FIRECRAWL_API_KEY) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Scraping URL:', formattedUrl);

    // Use Firecrawl to scrape the specific URL
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['markdown'],
        onlyMainContent: true,
      }),
    });

    if (!scrapeResponse.ok) {
      const errorText = await scrapeResponse.text();
      console.error('Firecrawl scrape error:', scrapeResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to scrape URL: ${scrapeResponse.status}` 
        }),
        { status: scrapeResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const scrapeData = await scrapeResponse.json();
    console.log('Scrape result keys:', Object.keys(scrapeData));

    // Extract content from response
    const markdown = scrapeData.data?.markdown || scrapeData.markdown || '';
    const metadata = scrapeData.data?.metadata || scrapeData.metadata || {};
    
    const title = metadata.title || extractTitleFromMarkdown(markdown) || 'Untitled Article';
    const excerpt = extractExcerpt(markdown);
    const source = extractDomain(formattedUrl);

    const article = {
      id: `article-${Date.now()}`,
      headline: title,
      excerpt: excerpt,
      fullContent: markdown.slice(0, 5000), // Limit for analysis
      source: source,
      url: formattedUrl,
      timestamp: new Date().toISOString(),
      status: 'pending' as const,
    };

    console.log(`Successfully scraped: "${title.slice(0, 50)}..."`);

    return new Response(
      JSON.stringify({ success: true, article }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error scraping URL:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to scrape URL' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function extractTitleFromMarkdown(markdown: string): string {
  // Try to find first heading
  const h1Match = markdown.match(/^#\s+(.+)$/m);
  if (h1Match) return h1Match[1].trim();
  
  // Try first line if no heading
  const firstLine = markdown.split('\n').find(line => line.trim().length > 0);
  if (firstLine) return firstLine.slice(0, 100).trim();
  
  return '';
}

function extractExcerpt(markdown: string): string {
  // Remove markdown formatting and get first meaningful paragraph
  const cleaned = markdown
    .replace(/#{1,6}\s/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '') // Remove images
    .replace(/[*_`]/g, '')
    .replace(/\n+/g, ' ')
    .trim();
  
  // Get first 300 characters
  if (cleaned.length > 300) {
    return cleaned.slice(0, 300).trim() + '...';
  }
  return cleaned || 'No content extracted.';
}

function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return 'Unknown Source';
  }
}

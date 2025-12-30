import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  headline: string;
  excerpt: string;
  fullContent?: string;
  source: string;
}

interface AnalysisResult {
  trustLevel: 'true' | 'suspicious' | 'false';
  confidence: number;
  reasoning: string;
  details?: {
    languageTone: string;
    sourceCredibility: string;
    factualIndicators: string;
    redFlags: string[];
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { headline, excerpt, fullContent, source }: AnalysisRequest = await req.json();

    if (!headline && !excerpt && !fullContent) {
      return new Response(
        JSON.stringify({ success: false, error: 'Content is required for analysis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      // Fallback to rule-based analysis
      const result = analyzeWithRules(headline, excerpt || fullContent || '', source);
      return new Response(
        JSON.stringify({ success: true, ...result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use the full content if available for more thorough analysis
    const contentToAnalyze = fullContent || excerpt || '';
    console.log(`Analyzing content: "${headline?.slice(0, 50)}..." (${contentToAnalyze.length} chars)`);

    const systemPrompt = `You are an expert misinformation and credibility analyst. Your job is to carefully analyze news articles, blog posts, and web content for credibility signals.

Analyze the provided content thoroughly and classify it into one of three categories:
- "true": The content appears credible. It uses factual language, presents verifiable claims, cites sources, and comes from or references reputable outlets.
- "suspicious": The content shows warning signs like emotional language, vague claims, missing context, unverified statistics, or one-sided perspectives. Needs verification.
- "false": The content shows strong signs of misinformation like extreme/unsubstantiated claims, conspiracy language, obvious fabrication, or contradicts established facts.

Analyze these factors:
1. Language Tone: Is it neutral and factual or sensational and emotional?
2. Source Credibility: Is this from a known reputable outlet or unknown source?
3. Claim Specificity: Are claims specific and verifiable or vague and unsubstantiated?
4. Evidence: Does it cite sources, data, or expert opinions?
5. Bias Indicators: Does it present multiple perspectives or push a single narrative?
6. Red Flags: Clickbait headlines, conspiracy language, emotional manipulation, unverified quotes

IMPORTANT: Respond ONLY with a valid JSON object in this exact format:
{
  "trustLevel": "true|suspicious|false",
  "confidence": 0.0-1.0,
  "reasoning": "2-3 sentence explanation of the classification",
  "details": {
    "languageTone": "Brief assessment",
    "sourceCredibility": "Brief assessment",
    "factualIndicators": "Brief assessment",
    "redFlags": ["flag1", "flag2"] or []
  }
}`;

    const userMessage = `Analyze this web content for credibility:

TITLE/HEADLINE: ${headline || 'No title'}

SOURCE: ${source}

CONTENT:
${contentToAnalyze.slice(0, 4000)}

Provide your credibility analysis as JSON.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Fallback to rule-based analysis
      const result = analyzeWithRules(headline, contentToAnalyze, source);
      return new Response(
        JSON.stringify({ success: true, ...result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    console.log('AI response:', content.slice(0, 500));

    // Parse the AI response
    let result: AnalysisResult;
    try {
      // Clean up the response - remove markdown code blocks if present
      let cleanedContent = content.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.slice(7);
      }
      if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.slice(3);
      }
      if (cleanedContent.endsWith('```')) {
        cleanedContent = cleanedContent.slice(0, -3);
      }
      cleanedContent = cleanedContent.trim();

      const parsed = JSON.parse(cleanedContent);
      result = {
        trustLevel: parsed.trustLevel || 'suspicious',
        confidence: Math.min(1, Math.max(0, parsed.confidence || 0.5)),
        reasoning: parsed.reasoning || 'Analysis complete.',
        details: parsed.details || undefined,
      };
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      result = analyzeWithRules(headline, contentToAnalyze, source);
    }

    console.log(`Analysis result: ${result.trustLevel} (confidence: ${result.confidence})`);

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error analyzing content:', error);
    return new Response(
      JSON.stringify({ 
        success: true, 
        trustLevel: 'suspicious',
        confidence: 0.5,
        reasoning: 'Unable to fully analyze. Exercise caution.',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function analyzeWithRules(headline: string, content: string, source: string): AnalysisResult {
  const text = `${headline} ${content}`.toLowerCase();
  
  // Credibility indicators
  const credibleSources = ['reuters', 'bbc', 'apnews', 'npr', 'wsj', 'nytimes', 'bloomberg', 'nature', 'science', 'nasa', 'gov', 'edu', 'theguardian', 'economist', 'ft.com'];
  const sensationalWords = ['shocking', 'unbelievable', 'you won\'t believe', 'exclusive', 'urgent', 'alert', 'exposed', 'bombshell', 'horrifying', 'insane'];
  const conspiracyWords = ['cover-up', 'they don\'t want you to know', 'secret', 'conspiracy', 'hoax', 'fake news', 'wake up', 'sheeple', 'globalist', 'deep state'];
  const uncertainWords = ['reportedly', 'allegedly', 'sources say', 'rumored', 'unconfirmed'];
  const credibilityWords = ['according to', 'study shows', 'research indicates', 'data suggests', 'experts say', 'peer-reviewed'];
  
  let score = 0.5; // Start neutral
  let reasons: string[] = [];
  let redFlags: string[] = [];

  // Check source credibility
  const sourceLower = source.toLowerCase();
  if (credibleSources.some(s => sourceLower.includes(s))) {
    score += 0.2;
    reasons.push('Established news source');
  }

  // Check for credibility indicators
  const credibilityCount = credibilityWords.filter(w => text.includes(w)).length;
  if (credibilityCount >= 2) {
    score += 0.1;
    reasons.push('Contains citations and references');
  }

  // Check for sensationalism
  const sensationalCount = sensationalWords.filter(w => text.includes(w)).length;
  if (sensationalCount > 0) {
    score -= 0.1 * sensationalCount;
    redFlags.push('Sensational language detected');
  }

  // Check for conspiracy language
  const conspiracyCount = conspiracyWords.filter(w => text.includes(w)).length;
  if (conspiracyCount > 0) {
    score -= 0.2 * conspiracyCount;
    redFlags.push('Conspiracy-related language found');
  }

  // Check for excessive uncertainty
  const uncertainCount = uncertainWords.filter(w => text.includes(w)).length;
  if (uncertainCount > 3) {
    score -= 0.1;
    redFlags.push('Many unverified claims');
  }

  // Check for ALL CAPS (common in misinformation)
  const capsRatio = (text.match(/[A-Z]{3,}/g) || []).length / (text.split(' ').length || 1);
  if (capsRatio > 0.1) {
    score -= 0.1;
    redFlags.push('Excessive capitalization');
  }

  // Normalize score
  score = Math.max(0, Math.min(1, score));

  // Determine trust level
  let trustLevel: 'true' | 'suspicious' | 'false';
  if (score >= 0.65) {
    trustLevel = 'true';
  } else if (score >= 0.35) {
    trustLevel = 'suspicious';
  } else {
    trustLevel = 'false';
  }

  const reasoning = reasons.length > 0 
    ? reasons.join('. ') + (redFlags.length > 0 ? '. However: ' + redFlags.join(', ') : '')
    : redFlags.length > 0 
      ? redFlags.join('. ') 
      : 'Standard credibility assessment based on content analysis.';

  return {
    trustLevel,
    confidence: Math.abs(score - 0.5) * 2,
    reasoning,
    details: {
      languageTone: sensationalCount > 0 ? 'Sensational' : 'Neutral',
      sourceCredibility: credibleSources.some(s => sourceLower.includes(s)) ? 'Established' : 'Unknown',
      factualIndicators: credibilityCount > 0 ? 'Some citations present' : 'Limited citations',
      redFlags,
    },
  };
}

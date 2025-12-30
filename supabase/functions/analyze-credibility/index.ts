import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  headline: string;
  excerpt: string;
  source: string;
}

interface AnalysisResult {
  trustLevel: 'true' | 'suspicious' | 'false';
  confidence: number;
  reasoning: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { headline, excerpt, source }: AnalysisRequest = await req.json();

    if (!headline) {
      return new Response(
        JSON.stringify({ success: false, error: 'Headline is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      // Fallback to rule-based analysis
      const result = analyzeWithRules(headline, excerpt, source);
      return new Response(
        JSON.stringify({ success: true, ...result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing article: "${headline.slice(0, 50)}..."`);

    const systemPrompt = `You are a misinformation detection AI. Analyze news headlines and excerpts for credibility signals.

IMPORTANT: You must respond with a valid JSON object and nothing else. Do not include any explanation outside the JSON.

Classify articles into one of three categories:
- "true": The article appears credible, uses factual language, cites sources, and avoids sensationalism
- "suspicious": The article shows some warning signs like emotional language, vague claims, or missing context
- "false": The article shows strong signs of misinformation like extreme claims, conspiracy language, or obvious fabrication

Consider these factors:
1. Language tone (neutral vs sensational)
2. Claim specificity (verifiable details vs vague statements)
3. Source reputation (established outlets vs unknown sources)
4. Logical consistency
5. Use of emotional triggers or fear-mongering

Respond ONLY with this exact JSON format:
{"trustLevel": "true|suspicious|false", "confidence": 0.0-1.0, "reasoning": "brief explanation"}`;

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
          { 
            role: 'user', 
            content: `Analyze this news article:\n\nHeadline: ${headline}\n\nExcerpt: ${excerpt}\n\nSource: ${source}\n\nRespond with JSON only.`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      // Fallback to rule-based analysis
      const result = analyzeWithRules(headline, excerpt, source);
      return new Response(
        JSON.stringify({ success: true, ...result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    console.log('AI response:', content);

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
      };
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      result = analyzeWithRules(headline, excerpt, source);
    }

    console.log(`Analysis result: ${result.trustLevel} (${result.confidence})`);

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error analyzing article:', error);
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

function analyzeWithRules(headline: string, excerpt: string, source: string): AnalysisResult {
  const text = `${headline} ${excerpt}`.toLowerCase();
  
  // Credibility indicators
  const credibleSources = ['reuters', 'bbc', 'apnews', 'npr', 'wsj', 'nytimes', 'bloomberg', 'nature', 'science', 'nasa'];
  const sensationalWords = ['shocking', 'unbelievable', 'you won\'t believe', 'breaking', 'exclusive', 'urgent', 'alert'];
  const conspiracyWords = ['cover-up', 'they don\'t want you to know', 'secret', 'conspiracy', 'hoax', 'fake'];
  const uncertainWords = ['reportedly', 'allegedly', 'sources say', 'may', 'might', 'could'];
  
  let score = 0.5; // Start neutral
  let reasons: string[] = [];

  // Check source credibility
  const sourceLower = source.toLowerCase();
  if (credibleSources.some(s => sourceLower.includes(s))) {
    score += 0.2;
    reasons.push('Credible source');
  }

  // Check for sensationalism
  const sensationalCount = sensationalWords.filter(w => text.includes(w)).length;
  if (sensationalCount > 0) {
    score -= 0.1 * sensationalCount;
    reasons.push('Sensational language detected');
  }

  // Check for conspiracy language
  const conspiracyCount = conspiracyWords.filter(w => text.includes(w)).length;
  if (conspiracyCount > 0) {
    score -= 0.2 * conspiracyCount;
    reasons.push('Conspiracy indicators found');
  }

  // Check for hedging language (moderate concern)
  const uncertainCount = uncertainWords.filter(w => text.includes(w)).length;
  if (uncertainCount > 2) {
    score -= 0.05;
    reasons.push('Multiple unverified claims');
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

  return {
    trustLevel,
    confidence: Math.abs(score - 0.5) * 2, // Convert to confidence measure
    reasoning: reasons.length > 0 ? reasons.join('. ') : 'Standard credibility assessment.',
  };
}

// ─────────────────────────────────────────────────────────────────
// Gemini API Utility — Social Media Sentiment Analysis
// Supports: Amharic, Tigrinya, Oromo, Somali, English, code-switched
// ─────────────────────────────────────────────────────────────────

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL = 'gemini-1.5-flash';

// ── Cultural context prompts per language ──────────────────────────
const LANGUAGE_PROMPTS = {
  am: `You are an expert sentiment analyst for Ethiopian Amharic social media content.
Cultural intelligence:
- "ደስ ይላል" / "ደስ አለኝ" / "ያስደስታል" = strong positive satisfaction
- "ምን ይሁን" / "ምን አድርጌ" = resignation / mild frustration (treat as NEGATIVE, NOT neutral)  
- "ቀጥታ" / "አይሆንም" = direct criticism (NEGATIVE)
- "እንዴ!" = surprise (analyze context to determine sentiment)
- "አዎ አዎ" (yes yes) can be sarcastic — read full context
- "ጥሩ" = good (positive), "መጥፎ" = bad (negative)
- "ናፍቆት" = longing (can be positive or bittersweet)
- Code-switching mid-sentence is very common — analyze meaning holistically across both languages
- Formal written Amharic differs from casual social media Amharic; emoji and punctuation carry strong meaning`,

  ti: `You are an expert sentiment analyst for Ethiopian Tigrinya social media content.
Cultural intelligence:
- "ሰናይ" / "ጽቡቅ" = good/positive
- "ዘይሰናይ" / "ሕማቕ" = bad/negative
- Code-switching with Amharic and English is common
- Tigrinya speakers on social media often use indirect expressions — read between the lines
- Religious expressions like "ብስም ኣብ" are neutral greetings, not sentiment indicators`,

  om: `You are an expert sentiment analyst for Ethiopian Oromo (Afaan Oromoo) social media content.
Cultural intelligence:
- "Gaarii" = good (positive), "Hamaa" = bad (negative)
- "Baayyee galatoomaa" = thank you very much (positive)
- Oromo uses Latin script on social media; emoji heavily used to reinforce meaning
- Code-switching with Amharic and English is common
- Political and cultural references may carry strong embedded sentiment`,

  so: `You are an expert sentiment analyst for Somali social media content.
Cultural intelligence:
- "Fiican" = good (positive), "Xun" = bad (negative)  
- "Mahadsanid" = thank you (positive signal)
- Religious phrases like "Alhamdulillah" indicate acceptance/contentment (positive or neutral)
- "Naag xun" / insulting terms = strong negative
- Emoji and Latin script Somali common on social media`,

  en: `You are an expert sentiment analyst for English social media content.
Be aware of: sarcasm, irony, slang, internet abbreviations (lol, tbh, imo, smh, ngl),
and multi-word expressions. Context and emoji are important sentiment signals.`,

  mixed: `You are an expert multilingual sentiment analyst for Ethiopian social media.
This comment is code-switched across multiple languages (likely Amharic, English, Tigrinya, or Oromo).
Apply cultural intelligence for all detected languages simultaneously.
Analyze the holistic meaning, not word-by-word. Emoji and punctuation carry strong sentiment signals in code-switched Ethiopian content.`,
};

// ── Language detection ─────────────────────────────────────────────
const LOW_RESOURCE_LANGS = ['aa', 'sid', 'wal', 'har', 'gez', 'other'];

const DETECTION_PROMPT = `Detect the primary language of the following social media comment.
Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "language": "<ISO code: am|ti|om|so|en|mixed|other>",
  "languageName": "<full name in English>",
  "script": "<Ethiopic|Latin|Mixed|Unknown>",
  "confidence": <0.0-1.0>,
  "needsHumanReview": <true if rare/low-resource language>
}

Language codes:
- am = Amharic
- ti = Tigrinya  
- om = Oromo (Afaan Oromoo)
- so = Somali
- en = English
- mixed = Code-switched (multiple languages)
- other = Unknown or low-resource (Afar, Sidama, Wolaita, Ge'ez, etc.)

Comment:`;

// ── Core Gemini fetch ──────────────────────────────────────────────
async function callGemini(apiKey, prompt, systemInstruction = null) {
  const url = `${GEMINI_API_BASE}/${MODEL}:generateContent?key=${apiKey}`;

  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2048,
    },
  };

  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ── Parse JSON safely from Gemini response ─────────────────────────
function parseJSON(text) {
  try {
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

// ── 1. Detect language of a single comment ─────────────────────────
export async function detectLanguage(apiKey, comment) {
  const text = await callGemini(apiKey, `${DETECTION_PROMPT}\n"${comment}"`);
  const result = parseJSON(text);
  if (!result) {
    return { language: 'other', languageName: 'Unknown', script: 'Unknown', confidence: 0, needsHumanReview: true };
  }
  result.needsHumanReview = LOW_RESOURCE_LANGS.includes(result.language) || result.confidence < 0.6;
  return result;
}

// ── 2. Analyze sentiment of a single comment ───────────────────────
export async function analyzeCommentSentiment(apiKey, comment, langCode = 'en') {
  const systemPrompt = LANGUAGE_PROMPTS[langCode] || LANGUAGE_PROMPTS.en;

  const userPrompt = `Analyze the sentiment of this social media comment.
Return ONLY valid JSON (no markdown):
{
  "sentiment": "positive" | "negative" | "neutral",
  "confidence": <0.0-1.0>,
  "emotions": ["<dominant emotions: joy|anger|sadness|fear|surprise|disgust>"],
  "reason": "<1 sentence explanation in English>"
}

Comment: "${comment}"`;

  const text = await callGemini(apiKey, userPrompt, systemPrompt);
  return parseJSON(text) || { sentiment: 'neutral', confidence: 0.5, emotions: [], reason: 'Could not analyze.' };
}

// ── 3. Batch analyze many comments (efficient) ─────────────────────
export async function analyzeBatch(apiKey, comments) {
  if (!comments || comments.length === 0) return [];

  const systemPrompt = `You are a multilingual sentiment analyst specializing in Ethiopian social media (Amharic, Tigrinya, Oromo, Somali, English, and code-switched content). Apply cultural intelligence for all languages.`;

  const numbered = comments.map((c, i) => `${i + 1}. "${c.text}" [lang: ${c.language || 'unknown'}]`).join('\n');

  const userPrompt = `Analyze the sentiment of each of the following social media comments.
Return ONLY a valid JSON array (no markdown, no explanation) with one object per comment in the same order:
[
  {
    "sentiment": "positive" | "negative" | "neutral",
    "confidence": <0.0-1.0>,
    "emotions": ["<emotion>"],
    "reason": "<brief reason in English>"
  }
]

Comments:
${numbered}`;

  const text = await callGemini(apiKey, userPrompt, systemPrompt);
  const results = parseJSON(text);
  if (!Array.isArray(results) || results.length !== comments.length) {
    // Fallback: return neutral for all
    return comments.map(() => ({ sentiment: 'neutral', confidence: 0.5, emotions: [], reason: 'Batch parse error.' }));
  }
  return results;
}

// ── 4. Translate a comment to English ─────────────────────────────
export async function translateToEnglish(apiKey, comment, sourceLang = 'auto') {
  const prompt = `Translate the following social media comment to natural English.
If it's already in English, return it unchanged.
Return ONLY the translated text, nothing else.

Comment: "${comment}"`;

  const text = await callGemini(apiKey, prompt);
  return text.trim().replace(/^["']|["']$/g, '');
}

// ── 5. Generate overall sentiment summary ──────────────────────────
export async function generateSummary(apiKey, stats, platform, postUrl) {
  const prompt = `Write a concise 2-3 sentence executive summary of social media sentiment analysis results for an organization.

Platform: ${platform}
Post/Video: ${postUrl}
Results:
- Total comments analyzed: ${stats.total}
- Positive: ${stats.positive} (${stats.positivePercent}%)
- Negative: ${stats.negative} (${stats.negativePercent}%)
- Neutral: ${stats.neutral} (${stats.neutralPercent}%)
- Top languages: ${stats.topLanguages?.join(', ') || 'English'}
- Comments flagged for human review: ${stats.flagged}

Write the summary in English. Be professional, factual, and actionable.
Return only the summary text, no labels or formatting.`;

  return await callGemini(apiKey, prompt);
}

// ── 6. Analyze a YouTube video URL via Gemini ──────────────────────
export async function analyzeVideoContent(apiKey, videoUrl) {
  // Gemini can analyze YouTube video content from URL
  const url = `${GEMINI_API_BASE}/gemini-1.5-pro:generateContent?key=${apiKey}`;

  const body = {
    contents: [{
      role: 'user',
      parts: [
        {
          fileData: {
            mimeType: 'video/*',
            fileUri: videoUrl,
          },
        },
        {
          text: `Analyze the overall sentiment and tone of this video.
Return ONLY valid JSON (no markdown):
{
  "overallSentiment": "positive" | "negative" | "neutral" | "mixed",
  "confidence": <0.0-1.0>,
  "keyTopics": ["<topic1>", "<topic2>"],
  "transcriptExcerpts": [
    { "text": "<quote>", "sentiment": "positive"|"negative"|"neutral", "timestamp": "<approx>" }
  ],
  "summary": "<2-3 sentence summary of video content and tone>"
}`,
        },
      ],
    }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`Video analysis API error: ${response.status}`);
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return parseJSON(text) || { overallSentiment: 'neutral', confidence: 0, keyTopics: [], transcriptExcerpts: [], summary: 'Video analysis unavailable.' };
  } catch (err) {
    console.warn('Video analysis failed (requires YouTube URL with public access):', err.message);
    return { overallSentiment: 'neutral', confidence: 0, keyTopics: [], transcriptExcerpts: [], summary: 'Video analysis requires a publicly accessible YouTube URL.' };
  }
}

// ── 7. Full pipeline: analyze a list of raw comments ──────────────
export async function analyzeComments(apiKey, rawComments, onProgress = null) {
  const results = [];
  const BATCH_SIZE = 10;

  // Step 1: Detect languages in parallel (batched)
  const withLanguages = await Promise.all(
    rawComments.map(async (comment) => {
      try {
        const lang = await detectLanguage(apiKey, comment.text);
        return { ...comment, ...lang };
      } catch {
        return { ...comment, language: 'en', languageName: 'English', confidence: 0.5, needsHumanReview: false };
      }
    })
  );

  if (onProgress) onProgress(30);

  // Step 2: Separate into tiers
  const tier1 = withLanguages.filter(c => !c.needsHumanReview);
  const tier2 = withLanguages.filter(c => c.needsHumanReview);

  // Step 3: Analyze tier 1 in batches
  for (let i = 0; i < tier1.length; i += BATCH_SIZE) {
    const batch = tier1.slice(i, i + BATCH_SIZE);
    const sentiments = await analyzeBatch(apiKey, batch);
    batch.forEach((comment, idx) => {
      results.push({ ...comment, ...sentiments[idx] });
    });
    if (onProgress) onProgress(30 + Math.round(((i + BATCH_SIZE) / tier1.length) * 60));
  }

  // Step 4: Add tier 2 with human review flag
  tier2.forEach(comment => {
    results.push({
      ...comment,
      sentiment: 'unreviewed',
      confidence: 0,
      emotions: [],
      reason: 'Low-resource language — requires human review.',
      needsHumanReview: true,
    });
  });

  if (onProgress) onProgress(100);

  return results;
}

// ─────────────────────────────────────────────────────────────────
// Mock Social Media Data
// Includes realistic Ethiopian language comments (Amharic, Tigrinya, Oromo, English)
// Used for platforms without free API access (Instagram, Facebook, TikTok, Twitter/X)
// ─────────────────────────────────────────────────────────────────

export const MOCK_PLATFORMS = ['YouTube', 'Facebook', 'Instagram', 'Twitter/X', 'TikTok', 'Telegram'];

export const MOCK_COMMENTS = [
  // ── Amharic comments ──────────────────────────────────────────
  { id: 'c1',  text: 'ደስ ይላል! ይህ ምርት በጣም ጥሩ ነው። እቀጥላለሁ ✨', platform: 'Facebook', likes: 45, author: 'Alem T.' },
  { id: 'c2',  text: 'ምን ይሁን... ዋጋው ከፍ ብሏል ግን ጥቅሙ አይታይም 😔', platform: 'Facebook', likes: 12, author: 'Biruk M.' },
  { id: 'c3',  text: 'አስቸጋሪ ሆኗል። ለምን ቀደም ሲል ጥሩ ነበር አሁን ደግሞ?', platform: 'Instagram', likes: 8, author: 'Tigist H.' },
  { id: 'c4',  text: 'በጣም አስደናቂ ነው! ቤተሰቤን ደስ አሰኘ 🎉', platform: 'TikTok', likes: 120, author: 'Dawit K.' },
  { id: 'c5',  text: 'አዎ አዎ... ከዚህ "ምርት" ሌላ ምን ሲሆን... 🙄', platform: 'Twitter/X', likes: 3, author: 'Sara A.' },
  { id: 'c6',  text: 'ናፍቆቴን ቀሰቀሰ 😢 ዋው በጣም ውብ', platform: 'Instagram', likes: 67, author: 'Hana W.' },
  { id: 'c7',  text: 'ቀጥታ ለመናገር ያህል — ይህ ለካ አሳፋሪ ነው', platform: 'Facebook', likes: 4, author: 'Yonas B.' },

  // ── Code-switched (Amharic + English) ─────────────────────────
  { id: 'c8',  text: 'This is really ጥሩ ነው but the delivery was way too slow 😤', platform: 'Instagram', likes: 23, author: 'Liya F.' },
  { id: 'c9',  text: 'ደስ ብሎኛል honestly, best product I have seen ✅ will recommend!', platform: 'Facebook', likes: 89, author: 'Mikias G.' },
  { id: 'c10', text: 'Why is the price so ከፍ ያለ? Can\'t afford it anymore smh 💀', platform: 'Twitter/X', likes: 15, author: 'Ruth T.' },

  // ── Tigrinya comments ─────────────────────────────────────────
  { id: 'c11', text: 'ጽቡቅ ዕዮ! ካብ ኩሉ ዝበለጸ ምርት ኢዩ 🔥', platform: 'Telegram', likes: 34, author: 'Tesfay A.' },
  { id: 'c12', text: 'ዘይሰናይ ኢዩ። ዋጋ ዝኸፈልናዮ ዋጋ ኣይበጽሖን', platform: 'Facebook', likes: 6, author: 'Miriam G.' },
  { id: 'c13', text: 'ሰናይ ኣለካ! ኣዝዩ ዝርዝር ስርሓት ኢዩ', platform: 'Telegram', likes: 19, author: 'Ghirmay T.' },

  // ── Oromo (Afaan Oromoo) comments ─────────────────────────────
  { id: 'c14', text: 'Baayee galatoomaa! Kun harka keenya keessaa gadi bu\'e 🙏', platform: 'Facebook', likes: 56, author: 'Chaltu L.' },
  { id: 'c15', text: 'Kun hamaa dha. Beenyaa keenya gara garagalchaa', platform: 'Twitter/X', likes: 2, author: 'Abebe N.' },
  { id: 'c16', text: 'Gaarii miti. Filannoo biroo barbaachisa.', platform: 'Instagram', likes: 7, author: 'Kadir M.' },

  // ── English comments ──────────────────────────────────────────
  { id: 'c17', text: 'Absolutely love this! Best thing I\'ve seen all week 🌟', platform: 'YouTube', likes: 203, author: 'John D.' },
  { id: 'c18', text: 'Complete waste of money. Very disappointed with quality.', platform: 'YouTube', likes: 45, author: 'Emma K.' },
  { id: 'c19', text: 'Not bad, not great. Could be improved honestly.', platform: 'Instagram', likes: 11, author: 'Alex M.' },
  { id: 'c20', text: 'This changed my life lol 😂 just kidding but it\'s actually solid ngl', platform: 'TikTok', likes: 87, author: 'Nati P.' },
  { id: 'c21', text: 'smh why is nobody talking about how overpriced this is 😭', platform: 'Twitter/X', likes: 33, author: 'Fifi L.' },
  { id: 'c22', text: 'Genuinely impressed. Premium quality for the price 👌', platform: 'YouTube', likes: 156, author: 'Solomon B.' },

  // ── Mixed / unclear ───────────────────────────────────────────
  { id: 'c23', text: 'Fiican! Mahadsanid walaalayaal 🙏', platform: 'Telegram', likes: 14, author: 'Faadumo A.' },
  { id: 'c24', text: 'لا يمكنني الشراء الآن لكنه جيد', platform: 'Facebook', likes: 5, author: 'Ahmed K.' },
];

// ── Mock video data ────────────────────────────────────────────────
export const MOCK_VIDEO_DATA = {
  title: 'Product Launch — Ethiopia 2026',
  duration: '4:32',
  views: '128,400',
  transcriptExcerpts: [
    { text: 'ይህ ምርት ለኢትዮጵያ ገበያ በልዩ ሁኔታ የተዘጋጀ ነው።', sentiment: 'positive', timestamp: '0:12', language: 'am' },
    { text: 'We are proud to announce our lowest price ever for Ethiopian customers.', sentiment: 'positive', timestamp: '1:05', language: 'en' },
    { text: 'ዋጋው ግን አሁንም ለብዙዎቹ ዜጎች ተደራሽ አይደለም ብለን እናምናለን።', sentiment: 'negative', timestamp: '2:40', language: 'am' },
    { text: 'Galatoomaa Ethiopia! Biyya keenya jaallanna.', sentiment: 'positive', timestamp: '3:55', language: 'om' },
  ],
  overallSentiment: 'positive',
  confidence: 0.78,
  summary: 'The video has an overall positive and enthusiastic tone, focusing on market expansion and community benefit. Some sections acknowledge affordability concerns for lower-income segments.',
};

// ── Generate mock analysis results ────────────────────────────────
export function generateMockAnalysis(comments = MOCK_COMMENTS) {
  const sentimentMap = {
    'c1': 'positive', 'c2': 'negative', 'c3': 'negative', 'c4': 'positive',
    'c5': 'negative', 'c6': 'positive', 'c7': 'negative', 'c8': 'negative',
    'c9': 'positive', 'c10': 'negative', 'c11': 'positive', 'c12': 'negative',
    'c13': 'positive', 'c14': 'positive', 'c15': 'negative', 'c16': 'negative',
    'c17': 'positive', 'c18': 'negative', 'c19': 'neutral', 'c20': 'positive',
    'c21': 'negative', 'c22': 'positive', 'c23': 'positive', 'c24': 'neutral',
  };

  const langMap = {
    'c1': 'am', 'c2': 'am', 'c3': 'am', 'c4': 'am', 'c5': 'am', 'c6': 'am', 'c7': 'am',
    'c8': 'mixed', 'c9': 'mixed', 'c10': 'mixed',
    'c11': 'ti', 'c12': 'ti', 'c13': 'ti',
    'c14': 'om', 'c15': 'om', 'c16': 'om',
    'c17': 'en', 'c18': 'en', 'c19': 'en', 'c20': 'en', 'c21': 'en', 'c22': 'en',
    'c23': 'so', 'c24': 'other',
  };

  const langNames = { am: 'Amharic', ti: 'Tigrinya', om: 'Oromo', so: 'Somali', en: 'English', mixed: 'Mixed', other: 'Other' };

  return comments.map(c => ({
    ...c,
    sentiment: sentimentMap[c.id] || 'neutral',
    language: langMap[c.id] || 'en',
    languageName: langNames[langMap[c.id]] || 'English',
    confidence: 0.75 + Math.random() * 0.2,
    needsHumanReview: c.id === 'c24',
    reason: sentimentMap[c.id] === 'positive' ? 'Expresses satisfaction or approval.' :
             sentimentMap[c.id] === 'negative' ? 'Expresses dissatisfaction or criticism.' :
             'Neutral or ambiguous tone.',
    emotions: sentimentMap[c.id] === 'positive' ? ['joy'] :
              sentimentMap[c.id] === 'negative' ? ['anger', 'sadness'] : [],
  }));
}

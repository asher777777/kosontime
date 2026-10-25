import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// High body limit for base64 audio data
app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API endpoint for AI Task Decomposition
app.post('/api/decompose', async (req, res) => {
  const { taskTitle, context } = req.body;
  if (!taskTitle || typeof taskTitle !== 'string') {
    return res.status(400).json({ error: 'Task title is required' });
  }

  try {
    const prompt = `אתה מומחה לפרודוקטיביות וניהול משימות בשיטת "The Rule of 3" (חוק ה-3).
המשימה שלפניך היא משימה גדולה או רעיון גולמי: "${taskTitle}".
${context ? `הקשר נוסף: "${context}"` : ''}

פרק משימה זו בדיוק ל-3 עד 4 מיקרו-משימות מעשיות, קונקרטיות וברורות, שכל אחת מהן ניתנת לביצוע בתוך 15-30 דקות.
הנחיות:
1. השתמש בפועל פעולה ממוקד בכל שלב (למשל: "לנסח...", "לאסוף...", "לשלוח...", "לבחור...", "לסכם...").
2. שמור על עברית טבעית, תמציתית ונעימה.
3. ציין הערכת זמן בדקות (15, 20, 25, 30) לכל שלב.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'אתה עוזר ארגון ופרודוקטיביות ממוקד. החזר רשימת צעדים מעשיים קצרים בפורמט JSON בלבד.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subtasks: {
              type: Type.ARRAY,
              description: 'רשימת 3-4 מיקרו-משימות מעשיות',
              items: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: 'כותרת קונקרטית של המיקרו-משימה',
                  },
                  estimatedMinutes: {
                    type: Type.INTEGER,
                    description: 'הערכת זמן בדקות (15-30)',
                  },
                },
                required: ['title', 'estimatedMinutes'],
              },
            },
          },
          required: ['subtasks'],
        },
      },
    });

    const jsonText = response.text?.trim() || '{}';
    const parsed = JSON.parse(jsonText);
    return res.json({ subtasks: parsed.subtasks || [] });
  } catch (err: any) {
    console.error('Error in /api/decompose:', err);
    const fallbackSubtasks = [
      { title: `איסוף חומרים, הגדרת יעד ובדיקת רקע עבור "${taskTitle.slice(0, 30)}"`, estimatedMinutes: 15 },
      { title: `ביצוע הפעימה המרכזית וכתיבת טיוטה ראשונה`, estimatedMinutes: 30 },
      { title: `בדיקה סופית, ליטוש ומענה/שליחה ליעד`, estimatedMinutes: 20 },
    ];
    return res.json({ subtasks: fallbackSubtasks, isFallback: true });
  }
});

// API endpoint for Audio Transcription
app.post('/api/transcribe', async (req, res) => {
  const { audioBase64, mimeType } = req.body;
  if (!audioBase64) {
    return res.status(400).json({ error: 'Audio data is required' });
  }

  try {
    const audioPart = {
      inlineData: {
        mimeType: mimeType || 'audio/webm',
        data: audioBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          {
            text: 'תמלל את תוכן ההקלטה במדויק. השפה המרכזית היא עברית. תמלל בצורה רציפה, נקייה, בלי לצרף הערות פתיחה או סיום.',
          },
        ],
      },
    });

    const transcribedText = response.text?.trim() || '';
    return res.json({ transcription: transcribedText });
  } catch (err: any) {
    console.error('Error in /api/transcribe:', err);
    return res.status(500).json({
      error: 'Failed to transcribe audio',
      message: err?.message || String(err),
    });
  }
});

// API endpoint for AI Brainstorming & Thought Partner Chat
app.post('/api/brainstorm/chat', async (req, res) => {
  const { messages, currentContext } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  try {
    const systemPrompt = `אתה שותף סיעור מוחות ויועץ מיקוד אישי בשיטת "The Big 3" (חוק ה-3).
עקרונות המנחים שלך:
1. עזור למשתמש לנקות את הראש ממחשבות עמוסות, לחדד רעיונות גולמיים ולהפוך מטרות גדולות לפעולות פשוטות.
2. אכיפת עקרון המיקוד: המוח יכול להתמקד ב-3 משימות מפתח ביום בלבד (חוק ה-3). שאל שאלות מחדדות שיעזרו לו לנפות מה *לא* לעשות.
3. דבר בעברית קולחת, חמה, אינטליגנטית ותמציתית (בלי קלישאות ומלל מיותר).
4. אם עולות משימות קונקרטיות וברורות מתוך השיחה, בסוף התשובה ציין אותן תחת כותרת נפרדת:
"משימות מומלצות לפעולה:"
בפורמט:
- [משימה] שם המשימה המדויק
כך שהמשתמש יוכל להוסיף אותן בלחיצה אחת לתיבת הקליטה או להיום שלו!

${currentContext ? `הקשר נוכחי של המשתמש: ${currentContext}` : ''}`;

    // Transform messages format for Google GenAI SDK
    const formattedContents = messages.map((m: any) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: typeof m.content === 'string' ? m.content : m.parts?.[0]?.text || '' }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    const reply = response.text?.trim() || 'אני מקשיב, ספר לי עוד על הרעיון שלך.';
    return res.json({ reply });
  } catch (err: any) {
    console.error('Error in /api/brainstorm/chat:', err);
    return res.status(500).json({
      error: 'Brainstorm chat error',
      message: err?.message || String(err),
    });
  }
});

// Brand DNA: AI Summary Paragraph Generation
app.post('/api/brand/summary', async (req, res) => {
  const { brand } = req.body;
  if (!brand) return res.status(400).json({ error: 'Brand data is required' });

  try {
    const prompt = `כתוב פסקת תמצית מותג מרוכזת, עוצמתית, חדה ומשכנעת של כ-200 מילים ("מועט המחזיק את המרובה") עבור המותג הבא:
שם המותג: ${brand.identity?.companyName || 'KOSUN'}
סלוגן: ${brand.identity?.slogan || ''}
ייעוד וחזון: ${brand.identity?.organizationPurpose || ''} - ${brand.identity?.companyVision || ''}
הצעת ערך ייחודית (UVP): ${brand.audience?.mainUvp || ''}
קהלי יעד: ${(brand.audience?.targetAudiences || []).join(', ')}
מילות כוח: ${(brand.voice?.powerWords || []).join(', ')}
טון דיבור: חמימות ${brand.voice?.personality?.warmth || 4}/5, יוקרה ${brand.voice?.personality?.luxury || 4}/5, אנרגיה ${brand.voice?.personality?.energy || 4}/5

הנחיות:
- כתוב בעברית עשירה, מודרנית ומדויקת.
- התמקד בפתרון הכאב, הפיכת אינטראקציות לנכסים, אפס עומס ומיקוד עילאי.
- החזר פסקה אחת מגובשת וחלקה ללא כותרות וללא נקודות תבליט.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'אתה אסטרטג מיתוג בכיר וקופירייטר על. החזר פסקת תמצית מותג יוקרתית וסוחפת.',
      },
    });

    const paragraph = response.text?.trim() || '';
    return res.json({ paragraph });
  } catch (err: any) {
    console.error('Error in /api/brand/summary:', err);
    return res.status(500).json({ error: 'Failed to generate summary', message: err?.message });
  }
});

// Brand DNA: Rephrase with Brand Voice
app.post('/api/brand/rephrase', async (req, res) => {
  const { text, brand, instructions } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });

  try {
    const prompt = `שכתב את הטקסט הבא כך שישקף במדויק את שפת המותג וקול המותג (Brand Voice):
טקסט מקורי: "${text}"
שם המותג: ${brand?.identity?.companyName || 'KOSUN'}
סלוגן: ${brand?.identity?.slogan || 'INTERACTIONS INTO ASSETS'}
מילות כוח לשימוש: ${(brand?.voice?.powerWords || []).join(', ')}
מילים אסורות להימנע מהן: ${(brand?.voice?.forbiddenWords || []).join(', ')}
${instructions ? `הנחיות מיוחדות: ${instructions}` : ''}

החזר רק את הטקסט המשוכתב, מלוטש וממוקד.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'אתה מומחה שפת מותג. החזר טקסט משוכתב בלבד בעברית טבעית ועוצמתית.',
      },
    });

    return res.json({ text: response.text?.trim() || text });
  } catch (err: any) {
    console.error('Error in /api/brand/rephrase:', err);
    return res.status(500).json({ error: 'Rephrase failed', message: err?.message });
  }
});

// Brand DNA: Discovery from interview / notes
app.post('/api/brand/discovery', async (req, res) => {
  const { notes } = req.body;
  if (!notes) return res.status(400).json({ error: 'Notes or brief is required' });

  try {
    const prompt = `נתח את תיאור העסק והרעיונות הבאים וחלץ מהם מבנה Brand DNA מלא:
"${notes}"

החזר JSON במבנה הבא בלבד:
{
  "companyName": "שם העסק",
  "slogan": "סלוגן קצר ומנצח",
  "organizationPurpose": "ייעוד העסק במשפט אחד",
  "companyVision": "חזון העסק",
  "mainUvp": "הצעת הערך הייחודית (UVP)",
  "targetAudiences": ["קהל 1", "קהל 2"],
  "powerWords": ["מילה 1", "מילה 2", "מילה 3"],
  "services": ["שירות 1", "שירות 2", "שירות 3"],
  "personas": [
    { "name": "שם פרסונה", "roleOrProfile": "תפקיד/פרופיל", "mainPain": "כאב מרכזי", "dreamOutcome": "תוצאת חלום" }
  ],
  "commonObjections": [
    { "objection": "התנגדות נפוצה", "rebuttal": "תשובה מנצחת" }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'אתה מנהל מיתוג ראשי. החזר JSON תקני בלבד התואם את המבנה המבוקש.',
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json({ discovered: parsed });
  } catch (err: any) {
    console.error('Error in /api/brand/discovery:', err);
    return res.status(500).json({ error: 'Discovery failed', message: err?.message });
  }
});

// Brand DNA: Content Strategy Generation
app.post('/api/brand/content-strategy', async (req, res) => {
  const { brand, strategyType } = req.body;

  try {
    const prompt = `צור אסטרטגיית תוכן ממירה עבור המותג ${brand?.identity?.companyName || 'KOSUN'} (סלוגן: ${brand?.identity?.slogan || ''}, UVP: ${brand?.audience?.mainUvp || ''}).
סוג האסטרטגיה המבוקש: ${strategyType || 'service_page'}

החזר JSON במבנה:
{
  "title": "כותרת האסטרטגיה",
  "targetAudience": "קהל יעד ממוקד",
  "heroHeadline": "כותרת הירו תופסת",
  "heroSubheadline": "תת-כותרת מעמיקה",
  "coreValuePoints": ["תועלת 1", "תועלת 2", "תועלת 3"],
  "callToAction": "קריאה לפעולה (CTA)",
  "pricingHook": "הצעה מפתה או עוגן מחיר",
  "objectionKiller": "מענה להתנגדות המובילה"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'אתה אסטרטג תוכן שיווקי בכיר. החזר JSON בלבד.',
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json({ strategy: parsed });
  } catch (err: any) {
    console.error('Error in /api/brand/content-strategy:', err);
    return res.status(500).json({ error: 'Strategy generation failed', message: err?.message });
  }
});

// Brand DNA: Market Research Agent
app.post('/api/brand/market-research', async (req, res) => {
  const { brand } = req.body;

  try {
    const prompt = `בצע מחקר שוק, מתחרים ובידול עבור המותג הבא:
שם: ${brand?.identity?.companyName || 'KOSUN'}
ייעוד: ${brand?.identity?.organizationPurpose || ''}
הצעת ערך: ${brand?.audience?.mainUvp || ''}
קהל יעד: ${(brand?.audience?.targetAudiences || []).join(', ')}

החזר JSON:
{
  "competitors": [
    { "name": "סוג מתחרה או שירות חלופי", "pros": "יתרון שלהם", "cons": "החיסרון שלהם שבו אנחנו מנצחים" }
  ],
  "marketGaps": ["פער בשוק 1 שאינו מקבל מענה", "פער בשוק 2"],
  "differentiationAngle": "זווית הבידול הבלתי מנוצחת של המותג",
  "actionableNextSteps": ["צעד אסטרטגי 1", "צעד אסטרטגי 2", "צעד אסטרטגי 3"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'אתה יועץ אסטרטגיה עסקית ומחקר שווקים. החזר JSON בלבד.',
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json({ research: parsed });
  } catch (err: any) {
    console.error('Error in /api/brand/market-research:', err);
    return res.status(500).json({ error: 'Market research failed', message: err?.message });
  }
});

// Brand DNA: Dedicated Agent Chat with 3 Dynamic Recommendations
app.post('/api/brand/agent/chat', async (req, res) => {
  const { messages, brand, agentType } = req.body;

  try {
    const brandName = brand?.identity?.companyName || 'KOSUN';
    const slogan = brand?.identity?.slogan || '';
    const uvp = brand?.audience?.mainUvp || '';
    const purpose = brand?.identity?.organizationPurpose || '';
    const powerWords = (brand?.voice?.powerWords || []).join(', ');

    const systemPrompt = `אתה סוכן AI בכיר לאסטרטגיית מותג, מחקר שווקים וקופירייטינג יישומי במערכת KOSUN.
סוג הסוכן הפעיל כרגע: ${agentType || 'general'}
הקשר המותג הנוכחי:
- שם המותג: ${brandName}
- סלוגן: ${slogan}
- ייעוד: ${purpose}
- הצעת ערך ייחודית (UVP): ${uvp}
- מילות כוח: ${powerWords}

עקרונות לתשובה:
1. ענה בעברית מקצועית, חדה, ממוקדת ואלגנטית (מתאים למקצוענים בני 30+, ללא קלישאות ומלל עודף).
2. בכל תשובה ספק תובנה מעשית, כותרת, ניסוח או ניתוח שניתן ליישם מיידית.
3. צרף תמיד בדיוק 3 המלצות המשך דינמיות וקצרות (עד 8 מילים כל אחת) שהמשתמש יכול ללחוץ עליהן כצעד הבא!

החזר JSON במבנה:
{
  "reply": "טקסט התשובה של הסוכן בעברית",
  "recommendations": [
    "המלצה דינמית 1",
    "המלצה דינמית 2",
    "המלצה דינמית 3"
  ]
}`;

    const formattedContents = (messages || []).map((m: any) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: typeof m.content === 'string' ? m.content : m.parts?.[0]?.text || '' }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json({
      reply: parsed.reply || 'אני לרשותך. כיצד תרצה שנקדם את המותג עכשיו?',
      recommendations:
        Array.isArray(parsed.recommendations) && parsed.recommendations.length === 3
          ? parsed.recommendations
          : [
              'חדד את הצעת הערך הייחודית (UVP)',
              'נתח 3 פערי שוק מול המתחרים',
              'חולל כותרת גיבור ממירה לעמוד הבית',
            ],
    });
  } catch (err: any) {
    console.error('Error in /api/brand/agent/chat:', err);
    return res.json({
      reply: 'ניתחתי את נתוני ה-DNA של המותג שלך. כיצד נרצה להעמיק בבידול ובאסטרטגיה?',
      recommendations: [
        'נתח את 3 היתרונות הבולטים שלי',
        'הצע ניסוח חד ל-UVP המרכזי',
        'חולל אסטרטגיית תוכן לעמוד שירות',
      ],
    });
  }
});

// Knowledge base of system actions & destinations for vector/semantic matching
const SYSTEM_KNOWLEDGE_BASE = [
  {
    id: 'NAVIGATE_TODAY',
    targetScreen: 'today',
    title: 'ניהול נכסי זמן ומיקוד יומי (חוק ה-3)',
    description: 'מעבר ל-3 משימות המפתח להיום, הפעלת טיימר מיקוד ומעקב התקדמות',
    keywords: ['זמן', 'משימה', 'היום', 'חוק ה-3', 'מיקוד', 'פרודוקטיביות', 'טיימר', 'לבצע', 'לוז', 'שעון'],
    icon: 'Clock',
  },
  {
    id: 'NAVIGATE_BRANDING',
    targetScreen: 'branding',
    title: 'מרחב המיתוג וה-DNA של KOSUN',
    description: 'סוכן גילוי מותג, סקראפר רשת, קול ואישיות, סליידרים ומילות כוח',
    keywords: ['מיתוג', 'DNA', 'מותג', 'סוכן', 'סקראפר', 'עיצוב', 'לוגו', 'קהל יעד', 'בידול', 'סלוגן', 'קול'],
    icon: 'Fingerprint',
  },
  {
    id: 'QUICK_CAPTURE',
    targetAction: 'quick_capture',
    title: 'קליטה מהירה של קושאן / רעיון',
    description: 'הקלטה קולית או כתיבה מהירה תוך 3 שניות לשמירת נכס מיידי ללא הסחות דעת',
    keywords: ['קליטה', 'הקלטה', 'קול', 'רעיון', 'מהיר', 'אינבוקס', 'לרשום', 'לשמור', 'מיקרופון'],
    icon: 'Mic',
  },
  {
    id: 'NAVIGATE_INBOX',
    targetScreen: 'inbox',
    title: 'צפייה בתיק הנכסים (אינבוקס)',
    description: 'עיון בכל הקושאנים, המשימות והרעיונות שנקלטו לצורך סידור ופירוק',
    keywords: ['נכסים', 'אינבוקס', 'רשימה', 'צפייה', 'קושאנים', 'תיק', 'הצגה'],
    icon: 'FolderOpen',
  },
  {
    id: 'EVENING_RITUAL',
    targetAction: 'evening_ritual',
    title: 'טקס תכנון ערב (Evening Ritual)',
    description: 'סגירת משימות היום, נעילת 3 משימות מפתח למחר לקראת שינה שלווה',
    keywords: ['ערב', 'טקס', 'לילה', 'שינה', 'סגירת יום', 'מחר', 'רוגע', 'תכנון'],
    icon: 'Moon',
  },
  {
    id: 'NAVIGATE_DECOMPOSE',
    targetScreen: 'decompose',
    title: 'מעבדת פירוק משימות (AI Decompose)',
    description: 'פירוק משימה גדולה ל-3 עד 4 מיקרו-משימות מעשיות של 15-30 דקות',
    keywords: ['פירוק', 'מעבדה', 'מיקרו', 'קשה', 'גדול', 'מורכב', 'צעדים', 'חלקים'],
    icon: 'Layers',
  },
  {
    id: 'NAVIGATE_HOME',
    targetScreen: 'home',
    title: 'מסך הכניסה הראשי של KOSUN',
    description: '3 מסלולי הפעולה: לימוד והעשרה, צפייה בקושאנים, ויצירה ועריכה',
    keywords: ['בית', 'ראשי', 'מסך כניסה', 'חזרה', 'סליידר', 'שער'],
    icon: 'Home',
  },
];

// Universal Vector / Semantic AI Assistant Endpoint
app.post('/api/ai/vector-assistant', async (req, res) => {
  const { query, currentScreen, userTasks, brandDna, inboxCount } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    // 1. Vector / Keyword Semantic matching score computation
    const normalizedQuery = query.toLowerCase().trim();
    const scoredActions = SYSTEM_KNOWLEDGE_BASE.map((item) => {
      let score = 0;
      for (const kw of item.keywords) {
        if (normalizedQuery.includes(kw.toLowerCase())) {
          score += 2;
        }
      }
      if (item.title.toLowerCase().includes(normalizedQuery)) score += 3;
      if (item.description.toLowerCase().includes(normalizedQuery)) score += 1;
      return { ...item, score };
    })
      .sort((a, b) => b.score - a.score);

    // 2. Prepare Context for Gemini 3.8 Flash
    const activeTasksSummary = Array.isArray(userTasks)
      ? userTasks.map((t: any) => `• ${t.title} (${t.completed ? 'הושלמה' : 'פעילה'}, ${t.estimatedMinutes || 25} דק')`).join('\n')
      : 'אין משימות פעילות כרגע';

    const brandSummary = brandDna?.identity?.companyName
      ? `שם: ${brandDna.identity.companyName}, סלוגן: ${brandDna.identity.slogan || 'ללא'}, UVP: ${brandDna.audience?.mainUvp || 'טרם הוגדר'}`
      : 'מותג KOSUN ברירת מחדל';

    const systemPrompt = `אתה העוזר החכם של מערכת KOSUN הפועל על פי המתודה: "הצג מידע וקיום פעולות באופן של מיעוט הסחות דעת וכיוון למטרה" (Zero Distraction & Goal-Oriented Action).
תפקידך לשרת מקצוענים עסקיים (בני 30+) בצורה ממוקדת, אלגנטית ומיידית.

ההקשר הנוכחי במערכת:
- מסך נוכחי: ${currentScreen || 'home'}
- משימות היום:
${activeTasksSummary}
- פריטי אינבוקס: ${inboxCount || 0}
- נתוני מותג KOSUN: ${brandSummary}

הנחיות קריטיות:
1. "הסבר ממוקד": ספק תשובה ישירה, קצרה וחדה בעברית (2-3 משפטים בלבד, ללא גינונים ומלל עודף).
2. "קישורי פעולה וניווט": צרף 1 עד 3 כפתורי פעולה/ניווט ישירים למסך הרלוונטי או לביצוע המשימה. השתמש ב-targetScreen ('today', 'inbox', 'branding', 'decompose', 'home') או targetAction ('quick_capture', 'evening_ritual').
3. "4 המלצות דינמיות": חובה להחזיר בדיוק 4 המלצות קצרות (עד 7 מילים) עבור כפתורי המלצה דינמיים במרכז החלון שהמשתמש יוכל ללחוץ עליהם מיידית.

החזר JSON בלבד במבנה הבא:
{
  "reply": "הסבר ממוקד ותמציתי בעברית לפי המתודה",
  "actionLinks": [
    {
      "id": "NAVIGATE_TODAY",
      "label": "מעבר לניהול 3 משימות היום",
      "description": "הפעלת שעון מיקוד וביצוע המשימות",
      "targetScreen": "today",
      "icon": "Clock"
    }
  ],
  "recommendations": [
    "המלצה דינמית 1",
    "המלצה דינמית 2",
    "המלצה דינמית 3",
    "המלצה דינמית 4"
  ],
  "matchedDataSummary": "סיכום תמציתי של נתון שנמצא (אופציונלי)"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `שאילתת המשתמש:\n"${query}"\n\nפעולות שהכי התאימו בחיפוש וקטורי ראשוני: ${scoredActions.slice(0, 3).map((a) => a.title).join(', ')}`,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.6,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');

    // Ensure recommendations always has exactly 4 items
    const recs: string[] = Array.isArray(parsed.recommendations) && parsed.recommendations.length >= 4
      ? parsed.recommendations.slice(0, 4)
      : [
          '🎯 פתח את משימות היום שלי',
          '🎨 עדכן את הצעת הערך במיתוג',
          '⚡ קלוט קושאן חדש בקול',
          '🌙 בדוק תכנון לטקס הערב',
        ];

    // Ensure actionLinks fallback if empty
    const actionLinks = Array.isArray(parsed.actionLinks) && parsed.actionLinks.length > 0
      ? parsed.actionLinks
      : scoredActions.slice(0, 2).map((a) => ({
          id: a.id,
          label: a.title,
          description: a.description,
          targetScreen: a.targetScreen,
          targetAction: a.targetAction,
          icon: a.icon,
        }));

    return res.json({
      reply: parsed.reply || 'המידע הוצג. תוכל לנווט ישירות לביצוע הפעולה או לבחור באחת ההמלצות:',
      actionLinks,
      recommendations: recs,
      matchedDataSummary: parsed.matchedDataSummary || null,
    });
  } catch (err: any) {
    console.error('Error in /api/ai/vector-assistant:', err);

    // Fallback: rule-based semantic response with 4 recommendations and direct action links
    const normalizedQuery = query.toLowerCase().trim();
    let bestAction = SYSTEM_KNOWLEDGE_BASE[0];
    if (normalizedQuery.includes('מותג') || normalizedQuery.includes('מיתוג') || normalizedQuery.includes('קול')) {
      bestAction = SYSTEM_KNOWLEDGE_BASE[1];
    } else if (normalizedQuery.includes('קליטה') || normalizedQuery.includes('רעיון') || normalizedQuery.includes('קול')) {
      bestAction = SYSTEM_KNOWLEDGE_BASE[2];
    } else if (normalizedQuery.includes('ערב') || normalizedQuery.includes('לילה')) {
      bestAction = SYSTEM_KNOWLEDGE_BASE[4];
    }

    return res.json({
      reply: `על פי מתודת KOSUN, הצגנו עבורך את המידע והאפשרות לביצוע מיידי ללא הסחות דעת עבור: "${query.slice(0, 40)}"`,
      actionLinks: [
        {
          id: bestAction.id,
          label: bestAction.title,
          description: bestAction.description,
          targetScreen: bestAction.targetScreen,
          targetAction: bestAction.targetAction,
          icon: bestAction.icon,
        },
      ],
      recommendations: [
        '🎯 מעבר ל-3 משימות המיקוד',
        '🎨 גילוי DNA המותג KOSUN',
        '⚡ קליטה מהירה של קושאן',
        '🌙 התחלת טקס סגירת יום',
      ],
      matchedDataSummary: 'סונכרן מקומית',
    });
  }
});


// Direct APK download route for mobile devices
app.get('/download/thebig3.apk', (_req, res) => {
  const apkPath = path.resolve(process.cwd(), 'public', 'download', 'thebig3.apk');
  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.setHeader('Content-Disposition', 'attachment; filename="TheBig3.apk"');
  res.sendFile(apkPath);
});

// Serve public directory
app.use(express.static(path.resolve(process.cwd(), 'public')));

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`The Big 3 server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();

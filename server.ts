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

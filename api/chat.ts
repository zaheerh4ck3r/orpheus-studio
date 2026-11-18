import { GoogleGenAI, ThinkingLevel } from '@google/genai';

/**
 * Vercel Serverless Function for Orpheus Studios Gemini Concierge.
 * Configure GEMINI_API_KEY in Vercel Environment Variables or AI Studio Secrets.
 */

interface RequestLike {
  method?: string;
  body?: unknown;
}

interface ResponseLike {
  status: (code: number) => ResponseLike;
  json: (data: unknown) => void;
}

const ALLOWED_MODELS = ['gemini-4-hydrogen', 'gemini-3.1-flash-lite'] as const;
type AllowedModel = (typeof ALLOWED_MODELS)[number];

const SYSTEM_INSTRUCTION = [
  'You are the Studio Concierge & Creative Strategy Advisor for Orpheus Studios ("MAKE THINGS THAT MOVE PEOPLE.").',
  'Identity & Location: Orpheus Studios is an independent creative studio based at NSTP, NUST, Islamabad, Pakistan, working internationally. Contact email: orpheusstidos@gmail.com. Instagram: @orpheusstudioss.',
  'Core Disciplines (5):',
  '01 Brand Strategy — audience & cultural research, positioning, brand narrative, naming & verbal tone, campaign strategy.',
  '02 Creative Direction — campaign concepts, film & photography art direction, editorial direction, on-set & post supervision.',
  '03 Film & Production — treatments & scripts, director-led production, brand documentaries & commercials, editing, colour & sound design.',
  '04 Brand Identity & Design — logotypes, marks & monograms, typography & colour systems, print/packaging/editorial grids, brand guidelines.',
  '05 Digital Experiences — digital architecture & UX, editorial web design, custom frontend engineering, restrained motion & interaction.',
  'Four-Stage Approach: I Understand, II Imagine, III Create (all craft under one roof with zero handoffs), IV Connect.',
  'Style & Guidance: Calm editorial clarity. Keep responses crisp (2-4 short paragraphs or structured bullets). Recommend disciplines, clarify project scopes, or invite them to /contact to send a brief or /studio to explore the 3D resonance monument. Never fabricate past clients, awards, or team names.',
].join('\n');

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return res.status(503).json({
      code: 'GEMINI_UNCONFIGURED',
      error:
        'Studio Concierge is offline because GEMINI_API_KEY is missing on the server. Add GEMINI_API_KEY in Settings > Secrets or Vercel Environment Variables.',
    });
  }

  let body: Record<string, unknown> = {};
  if (typeof req.body === 'string') {
    try {
      body = JSON.parse(req.body) as Record<string, unknown>;
    } catch {
      return res.status(400).json({ code: 'INVALID_JSON', error: 'Invalid JSON payload.' });
    }
  } else if (req.body && typeof req.body === 'object') {
    body = req.body as Record<string, unknown>;
  }

  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message) {
    return res.status(400).json({ code: 'EMPTY_MESSAGE', error: 'Please enter a message.' });
  }
  if (message.length > 4000) {
    return res
      .status(400)
      .json({ code: 'MESSAGE_TOO_LONG', error: 'Please keep your message under 4,000 characters.' });
  }

  const requestedModel = typeof body.model === 'string' ? body.model : '';
  const model: AllowedModel = (ALLOWED_MODELS as readonly string[]).includes(requestedModel)
    ? (requestedModel as AllowedModel)
    : 'gemini-4-hydrogen';

  const history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
  if (Array.isArray(body.history)) {
    for (const item of body.history.slice(-20)) {
      if (!item || typeof item !== 'object') continue;
      const entry = item as Record<string, unknown>;
      const role = entry.role === 'user' || entry.role === 'model' ? entry.role : null;
      const text = typeof entry.text === 'string' ? entry.text.trim().slice(0, 4000) : '';
      if (role && text) {
        history.push({ role, parts: [{ text }] });
      }
    }
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const chat = ai.chats.create({
      model,
      history,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        ...(model === 'gemini-4-hydrogen'
          ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
          : {}),
      },
    });

    const response = await chat.sendMessage({ message });
    const reply = (response.text ?? '').trim();

    if (!reply) {
      return res.status(502).json({
        code: 'EMPTY_MODEL_RESPONSE',
        error: 'The studio concierge returned an empty reply.',
      });
    }

    return res.status(200).json({ ok: true, model, reply });
  } catch (err) {
    const rawMsg = err instanceof Error ? err.message : 'Unable to reach Gemini right now.';
    const upper = rawMsg.toUpperCase();
    if (upper.includes('RESOURCE_EXHAUSTED') || upper.includes('429')) {
      return res.status(429).json({
        code: 'GEMINI_QUOTA_EXCEEDED',
        error: 'Rate limit reached. Please wait a moment and try again.',
      });
    }
    if (upper.includes('PERMISSION_DENIED') || upper.includes('API_KEY_INVALID') || upper.includes('403')) {
      return res.status(403).json({
        code: 'GEMINI_AUTH_ERROR',
        error: 'Gemini API authentication failed. Please check GEMINI_API_KEY in Settings > Secrets.',
      });
    }
    return res.status(502).json({
      code: 'GEMINI_UPSTREAM_ERROR',
      error: rawMsg,
    });
  }
}

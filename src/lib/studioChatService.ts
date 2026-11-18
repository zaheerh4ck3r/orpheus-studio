import { GoogleGenAI, ThinkingLevel } from '@google/genai';

export const ALLOWED_CHAT_MODELS = [
  'gemini-4-hydrogen',
  'gemini-3.1-flash-lite',
] as const;

export type StudioChatModel = (typeof ALLOWED_CHAT_MODELS)[number];

export interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

export interface StudioChatRequestPayload {
  message?: unknown;
  history?: unknown;
  model?: unknown;
}

export interface StudioChatSuccess {
  ok: true;
  model: StudioChatModel;
  reply: string;
}

export interface StudioChatFailure {
  ok: false;
  status: number;
  code: string;
  error: string;
}

export type StudioChatResult = StudioChatSuccess | StudioChatFailure;

export const ORPHEUS_SYSTEM_INSTRUCTION = [
  'You are the Studio Concierge & Creative Strategy Advisor for Orpheus Studios ("MAKE THINGS THAT MOVE PEOPLE.").',
  'Identity & Location: Orpheus Studios is an independent creative studio based at NSTP, NUST, Islamabad, Pakistan, working internationally. Contact email: orpheusstidos@gmail.com. Instagram: @orpheusstudioss.',
  'Core Disciplines (5):',
  '01 Brand Strategy — audience & cultural research, positioning, brand narrative, naming & verbal tone, campaign strategy.',
  '02 Creative Direction — campaign concepts, film & photography art direction, editorial direction, on-set & post supervision.',
  '03 Film & Production — treatments & scripts, director-led production, brand documentaries & commercials, editing, colour & sound design.',
  '04 Brand Identity & Design — logotypes, marks & monograms, typography & colour systems, print/packaging/editorial grids, brand guidelines.',
  '05 Digital Experiences — digital architecture & UX, editorial web design, custom frontend engineering, restrained motion & interaction.',
  'Four-Stage Approach: I Understand (listening & focused working session), II Imagine (central idea, narrative angle & visual world), III Create (direction, film, identity & digital craft under one roof with zero handoffs), IV Connect (refining every cut and touchpoint for launch).',
  'Mythology: Named after Orpheus & the Lyre — guided by creating work with genuine emotional resonance rather than hollow spectacle.',
  'Style & Response Guidance: Speak with calm editorial authority, clarity, and warmth. Keep answers concise (typically 2–4 short paragraphs or crisp bulleted deliverables). Help prospective clients choose the right discipline(s), clarify project scope, outline deliverables or discovery questions, or point them to /contact to send a brief, /services for full discipline breakdowns, or /studio for the interactive 3D resonance sculpture.',
  'Honesty rule: Never invent fake client case studies, awards, or team member names not stated here. If asked for a quote/pricing, explain that fees depend on scope and deliverables across the listed budget tiers ($1,500–$5,000, $5,000–$15,000, $15,000–$35,000, $35,000+) and invite them to share their brief on /contact.',
].join('\n');

export function resolveChatModel(input: unknown): StudioChatModel {
  if (typeof input === 'string' && (ALLOWED_CHAT_MODELS as readonly string[]).includes(input)) {
    return input as StudioChatModel;
  }
  return 'gemini-4-hydrogen';
}

export function sanitizeChatHistory(raw: unknown): ChatTurn[] {
  if (!Array.isArray(raw)) return [];
  const clean: ChatTurn[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const record = item as Record<string, unknown>;
    const role = record.role === 'user' || record.role === 'model' ? record.role : null;
    const text = typeof record.text === 'string' ? record.text.trim() : '';
    if (!role || !text) continue;
    clean.push({ role, text: text.slice(0, 4000) });
  }
  return clean.slice(-20);
}

export interface SendConciergeOptions {
  apiKey?: string;
  sendChatMessageImpl?: (args: {
    model: StudioChatModel;
    history: ChatTurn[];
    message: string;
    systemInstruction: string;
  }) => Promise<string>;
}

function classifyGeminiError(err: unknown): { status: number; code: string; message: string } {
  const rawMsg =
    err instanceof Error ? err.message : typeof err === 'string' ? err : 'Unexpected Gemini API error.';
  const upper = rawMsg.toUpperCase();

  if (upper.includes('RESOURCE_EXHAUSTED') || upper.includes('429') || upper.includes('QUOTA')) {
    return {
      status: 429,
      code: 'GEMINI_QUOTA_EXCEEDED',
      message:
        'The Studio Concierge reached its current Gemini API rate limit. Please wait a moment or send your project brief via the Contact page.',
    };
  }

  if (upper.includes('PERMISSION_DENIED') || upper.includes('API_KEY_INVALID') || upper.includes('403')) {
    return {
      status: 403,
      code: 'GEMINI_AUTH_ERROR',
      message:
        'Gemini API authentication failed. Please verify GEMINI_API_KEY in Settings > Secrets.',
    };
  }

  if (upper.includes('NOT_FOUND') || upper.includes('404')) {
    return {
      status: 404,
      code: 'GEMINI_MODEL_NOT_FOUND',
      message: 'The requested Gemini model is unavailable right now.',
    };
  }

  return {
    status: 502,
    code: 'GEMINI_UPSTREAM_ERROR',
    message: rawMsg || 'Unable to reach Gemini right now. Please try again shortly.',
  };
}

export async function sendConciergeMessage(
  payload: unknown,
  options: SendConciergeOptions = {}
): Promise<StudioChatResult> {
  const apiKey = options.apiKey?.trim();
  if (!apiKey) {
    return {
      ok: false,
      status: 503,
      code: 'GEMINI_UNCONFIGURED',
      error:
        'Studio Concierge is offline because GEMINI_API_KEY is not configured on the server. Add GEMINI_API_KEY in Settings > Secrets or Vercel Environment Variables.',
    };
  }

  if (!payload || typeof payload !== 'object') {
    return {
      ok: false,
      status: 400,
      code: 'INVALID_REQUEST',
      error: 'Invalid JSON request payload.',
    };
  }

  const body = payload as StudioChatRequestPayload;
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!message) {
    return {
      ok: false,
      status: 400,
      code: 'EMPTY_MESSAGE',
      error: 'Please enter a message before sending.',
    };
  }

  if (message.length > 4000) {
    return {
      ok: false,
      status: 400,
      code: 'MESSAGE_TOO_LONG',
      error: 'Please keep your message under 4,000 characters.',
    };
  }

  const model = resolveChatModel(body.model);
  const history = sanitizeChatHistory(body.history);

  try {
    let reply = '';
    if (options.sendChatMessageImpl) {
      reply = await options.sendChatMessageImpl({
        model,
        history,
        message,
        systemInstruction: ORPHEUS_SYSTEM_INSTRUCTION,
      });
    } else {
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
        history: history.map((turn) => ({
          role: turn.role,
          parts: [{ text: turn.text }],
        })),
        config: {
          systemInstruction: ORPHEUS_SYSTEM_INSTRUCTION,
          ...(model === 'gemini-4-hydrogen'
            ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
            : {}),
        },
      });

      const response = await chat.sendMessage({ message });
      reply = (response.text ?? '').trim();
    }

    if (!reply) {
      return {
        ok: false,
        status: 502,
        code: 'EMPTY_MODEL_RESPONSE',
        error: 'The studio concierge returned an empty reply. Please try rephrasing your question.',
      };
    }

    return { ok: true, model, reply };
  } catch (err) {
    const classified = classifyGeminiError(err);
    return {
      ok: false,
      status: classified.status,
      code: classified.code,
      error: classified.message,
    };
  }
}

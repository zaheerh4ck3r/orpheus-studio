import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendInquiryViaResend } from './src/lib/resendMailer.ts';
import { sendConciergeMessage } from './src/lib/studioChatService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  app.use(express.json());

  app.post('/api/contact', async (req, res) => {
    const result = await sendInquiryViaResend(req.body, {
      apiKey: process.env.RESEND_API_KEY,
      recipientEmail: process.env.CONTACT_RECIPIENT_EMAIL || 'zaheerhasiphone@gmail.com',
      fromEmail: process.env.RESEND_FROM_EMAIL || 'Orpheus Studios <onboarding@resend.dev>',
    });

    if (result.ok) {
      res.status(200).json({ ok: true, id: result.id });
      return;
    }

    res.status(result.status).json({ code: result.code, error: result.error });
  });

  app.post('/api/chat', async (req, res) => {
    const result = await sendConciergeMessage(req.body, {
      apiKey: process.env.GEMINI_API_KEY,
    });

    if (result.ok) {
      res.status(200).json({ ok: true, model: result.model, reply: result.reply });
      return;
    }

    res.status(result.status).json({ code: result.code, error: result.error });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Orpheus Studios server listening on http://localhost:${port}`);
  });
}

startServer();

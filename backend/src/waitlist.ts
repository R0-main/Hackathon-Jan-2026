import { Router, Request, Response } from 'express';
import sql from './db';

const router = Router();

// POST /api/waitlist - Join waitlist
router.post('/', async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email || typeof email !== 'string') {
    res.status(400).json({ detail: 'Email is required' });
    return;
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ detail: 'Invalid email format' });
    return;
  }

  try {
    // Check if email already exists
    const existing = await sql`SELECT id FROM waitlist WHERE email = ${email}`;
    if (existing.length > 0) {
      res.status(400).json({ detail: 'Email already registered' });
      return;
    }

    // Insert new email and get the id
    const result = await sql`INSERT INTO waitlist (email) VALUES (${email}) RETURNING id`;
    const insertedId = result[0].id;

    // Get position (count of entries up to and including this one)
    const positionResult = await sql`SELECT COUNT(*) as count FROM waitlist WHERE id <= ${insertedId}`;
    const position = Number(positionResult[0].count);

    // Send to Discord Webhook
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (discordWebhookUrl) {
      try {
        await fetch(discordWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: `🚀 New waitlist signup: **${email}**`,
          }),
        });
      } catch (webhookError) {
        console.error('Failed to send Discord webhook:', webhookError);
        // Don't fail the request if webhook fails
      }
    }

    res.status(201).json({
      message: 'Successfully joined the waitlist!',
      position: position
    });
  } catch (error) {
    console.error('Waitlist error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// GET /api/waitlist/count - Get waitlist count
router.get('/count', async (req: Request, res: Response) => {
  try {
    const result = await sql`SELECT COUNT(*) as count FROM waitlist`;
    res.json({ count: Number(result[0].count) });
  } catch (error) {
    console.error('Waitlist count error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

export default router;

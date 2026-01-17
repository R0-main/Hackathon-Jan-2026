import { Router, Request, Response } from 'express';
import db from './db';

const router = Router();

// POST /api/waitlist - Join waitlist
router.post('/', (req: Request, res: Response) => {
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
    const existing = db.prepare('SELECT id FROM waitlist WHERE email = ?').get(email);
    if (existing) {
      res.status(400).json({ detail: 'Email already registered' });
      return;
    }

    // Insert new email
    const result = db.prepare('INSERT INTO waitlist (email) VALUES (?)').run(email);

    // Get position (count of entries up to and including this one)
    const position = db.prepare('SELECT COUNT(*) as count FROM waitlist WHERE id <= ?').get(result.lastInsertRowid) as { count: number };

    res.status(201).json({
      message: 'Successfully joined the waitlist!',
      position: position.count
    });
  } catch (error) {
    console.error('Waitlist error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// GET /api/waitlist/count - Get waitlist count
router.get('/count', (req: Request, res: Response) => {
  try {
    const result = db.prepare('SELECT COUNT(*) as count FROM waitlist').get() as { count: number };
    res.json({ count: result.count });
  } catch (error) {
    console.error('Waitlist count error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

export default router;

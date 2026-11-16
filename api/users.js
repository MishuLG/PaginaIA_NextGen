/**
 * Vercel Serverless Function: GET /api/users
 * Returns list of users from db.json for NextGen Authentication
 */
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    const dbPath = path.join(process.cwd(), 'db.json');
    if (fs.existsSync(dbPath)) {
      const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      return res.status(200).json(data.users || []);
    }
    return res.status(200).json([]);
  } catch (error) {
    console.error('[Vercel API] Error reading users:', error);
    return res.status(500).json({ error: 'Internal server error reading users' });
  }
}

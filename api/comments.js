/**
 * Vercel Serverless Function: /api/comments
 * Supports GET (list comments), POST (add comment), PATCH (likes update)
 */
import fs from 'fs';
import path from 'path';

// In-memory runtime cache for serverless instance lifetime
let inMemoryComments = null;

function loadComments() {
  if (inMemoryComments) return inMemoryComments;
  try {
    const dbPath = path.join(process.cwd(), 'db.json');
    if (fs.existsSync(dbPath)) {
      const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      inMemoryComments = data.comments || [];
      return inMemoryComments;
    }
  } catch (e) {
    console.error('[Vercel API] Error loading comments:', e);
  }
  inMemoryComments = [];
  return inMemoryComments;
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const comments = loadComments();

  // GET /api/comments
  if (req.method === 'GET') {
    return res.status(200).json(comments);
  }

  // POST /api/comments
  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const newComment = {
      id: body.id || `cmt_${Date.now()}`,
      author: body.author || 'Ingeniero Anónimo',
      authorEmail: body.authorEmail || 'guest@nextgen.local',
      role: body.role || 'Desarrollador de Sistemas',
      avatar: body.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=128&q=80',
      content: body.content || '',
      sectionTag: body.sectionTag || 'Tokenomics',
      likes: body.likes || 0,
      createdAt: body.createdAt || new Date().toISOString()
    };

    comments.unshift(newComment);
    return res.status(201).json(newComment);
  }

  // PATCH /api/comments
  if (req.method === 'PATCH') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const id = req.query?.id || body.id;
    const target = comments.find(c => c.id === id);

    if (target) {
      if (typeof body.likes === 'number') {
        target.likes = body.likes;
      }
      return res.status(200).json(target);
    }
    return res.status(404).json({ error: 'Comment not found' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

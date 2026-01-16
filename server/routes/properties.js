import express from 'express';
import rateLimit from 'express-rate-limit';
import { supabaseProxyFetch } from '../supabaseProxy.js';
import { validatePropertyCreate, checkValidation } from '../middleware/validation.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Rate limit for property creation (max 5 per 15 minutes)
const createPropertyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many properties created, please try again later.'
});

router.get('/', async (req, res) => {
  try {
    const q = req.originalUrl.split('?')[1] || 'select=*';
    const data = await supabaseProxyFetch(`properties`, 'GET', null, q);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST - Create property (only for owners, with validation)
router.post('/', 
  createPropertyLimiter,
  requireAuth,
  requireRole('owner', 'admin'),
  validatePropertyCreate, 
  checkValidation, 
  async (req, res) => {
    try {
      const body = {
        ...req.body,
        ownerId: req.userId, // Set from auth middleware
        status: 'active',
        rating: 0,
        waitingList: []
      };
      const data = await supabaseProxyFetch('properties', 'POST', body);
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
});

// GET by id
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = await supabaseProxyFetch('properties', 'GET', null, `id=eq.${id}&select=*`);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH (update) by id
router.patch('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;
    const data = await supabaseProxyFetch('properties', 'PATCH', body, `id=eq.${id}`);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE by id
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = await supabaseProxyFetch('properties', 'DELETE', null, `id=eq.${id}`);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;

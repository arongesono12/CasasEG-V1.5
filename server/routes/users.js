import express from 'express';
import { supabaseProxyFetch } from '../supabaseProxy.js';
import { validateUserUpdate, checkValidation } from '../middleware/validation.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const q = req.originalUrl.split('?')[1] || 'select=*';
    const data = await supabaseProxyFetch(`users`, 'GET', null, q);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const body = req.body;
    const data = await supabaseProxyFetch('users', 'POST', body);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET by id
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = await supabaseProxyFetch('users', 'GET', null, `id=eq.${id}&select=*`);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH (update) by id with validation
router.patch('/:id', validateUserUpdate, checkValidation, async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;
    const data = await supabaseProxyFetch('users', 'PATCH', body, `id=eq.${id}`);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE by id
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = await supabaseProxyFetch('users', 'DELETE', null, `id=eq.${id}`);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;

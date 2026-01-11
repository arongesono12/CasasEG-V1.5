import express from 'express';
import { supabaseProxyFetch } from '../supabaseProxy.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const q = req.originalUrl.split('?')[1] || 'select=*';
    const data = await supabaseProxyFetch(`messages`, 'GET', null, q);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const body = req.body;
    const data = await supabaseProxyFetch('messages', 'POST', body);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET by id
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = await supabaseProxyFetch('messages', 'GET', null, `id=eq.${id}&select=*`);
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
    const data = await supabaseProxyFetch('messages', 'PATCH', body, `id=eq.${id}`);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE by id
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = await supabaseProxyFetch('messages', 'DELETE', null, `id=eq.${id}`);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;

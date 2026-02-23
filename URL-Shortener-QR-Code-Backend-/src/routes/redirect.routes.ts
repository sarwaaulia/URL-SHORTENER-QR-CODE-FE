import express from 'express';
import path from 'path';
import fs from 'fs';
import { supabase } from '../config/supabase';

const router = express.Router();

router.get('/:code', async (req, res) => {
  const { code } = req.params;

  if (code === 'api') return;

  const { data: link } = await supabase
    .from('links')
    .select('*')
    .eq('short_code', code)
    .single();

  if (!link) {
    return res.status(404).send('Link not found');
  }

  // Track click
  await supabase.from('clicks').insert({
    link_id: link.id,
    ip_address: req.ip,
    user_agent: req.headers['user-agent'],
  });

  await supabase
    .from('links')
    .update({ click_count: link.click_count + 1 })
    .eq('id', link.id);

  // Load HTML template
  const filePath = path.join(__dirname, '../views/redirect.html');
  let html = fs.readFileSync(filePath, 'utf8');

  // Inject URL
  html = html.replace(/{{URL}}/g, link.original_url);

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

export default router;

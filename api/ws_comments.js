import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-passcode');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { theory_id } = req.query;
      if (!theory_id) return res.status(400).json({ error: 'Missing theory_id' });

      const { data, error } = await supabase
        .from('ws_comments')
        .select('*')
        .eq('theory_id', theory_id)
        .order('id', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { theory_id, author, content } = req.body;
      if (!theory_id || !author || !content) {
        return res.status(400).json({ error: 'Missing theory_id, author, or content' });
      }

      const { data, error } = await supabase
        .from('ws_comments')
        .insert({ theory_id, author, content })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'DELETE') {
      const passcode = req.headers['x-admin-passcode'];
      if (passcode !== 'wonder2025') {
        return res.status(401).json({ error: 'Unauthorized: Invalid passcode' });
      }

      const { id } = req.body;
      const { error } = await supabase
        .from('ws_comments')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}

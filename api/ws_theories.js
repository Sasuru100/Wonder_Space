import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-passcode');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('ws_theories')
        .select('*')
        .order('id', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { action, id, title, author, content, category } = req.body;

      if (action === 'upvote') {
        if (!id) return res.status(400).json({ error: 'Missing theory ID' });
        
        const { data: current, error: fetchErr } = await supabase
          .from('ws_theories')
          .select('upvotes')
          .eq('id', id)
          .single();
        if (fetchErr) throw fetchErr;

        const { data, error } = await supabase
          .from('ws_theories')
          .update({ upvotes: (current.upvotes || 0) + 1 })
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return res.status(200).json(data);
      }

      if (!title || !author || !content) {
        return res.status(400).json({ error: 'Missing title, author, or content' });
      }

      const { data, error } = await supabase
        .from('ws_theories')
        .insert({ title, author, content, category: category || 'General', upvotes: 0 })
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
        .from('ws_theories')
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

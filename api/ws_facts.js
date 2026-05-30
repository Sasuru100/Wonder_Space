import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-passcode');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('ws_facts')
        .select('*')
        .order('id', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { action, id, title, description, title_si, description_si, category, image_url } = req.body;

      if (action === 'upvote') {
        if (!id) return res.status(400).json({ error: 'Missing ID for upvote' });
        
        const { data: current, error: fetchErr } = await supabase
          .from('ws_facts')
          .select('upvotes')
          .eq('id', id)
          .single();
        if (fetchErr) throw fetchErr;

        const { data, error } = await supabase
          .from('ws_facts')
          .update({ upvotes: (current.upvotes || 0) + 1 })
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return res.status(200).json(data);
      }

      const passcode = req.headers['x-admin-passcode'];
      if (passcode !== 'wonder2025') {
        return res.status(401).json({ error: 'Unauthorized: Invalid passcode' });
      }

      if (!title || !description || !title_si || !description_si || !category) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const { data, error } = await supabase
        .from('ws_facts')
        .insert({ title, description, title_si, description_si, category, image_url: image_url || '', upvotes: 0 })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      const passcode = req.headers['x-admin-passcode'];
      if (passcode !== 'wonder2025') {
        return res.status(401).json({ error: 'Unauthorized: Invalid passcode' });
      }

      const { error } = await supabase
        .from('ws_facts')
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

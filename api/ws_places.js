import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-passcode');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('ws_places')
        .select('*')
        .order('id', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const passcode = req.headers['x-admin-passcode'];
      if (passcode !== 'wonder2025') {
        return res.status(401).json({ error: 'Unauthorized: Invalid passcode' });
      }

      const { name, name_si, description, description_si, location, coordinates, mystery_score, image_url } = req.body;
      if (!name || !description || !name_si || !description_si || !location || !coordinates) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const { data, error } = await supabase
        .from('ws_places')
        .insert({ name, name_si, description, description_si, location, coordinates, mystery_score: mystery_score || 5, image_url: image_url || '' })
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
        .from('ws_places')
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

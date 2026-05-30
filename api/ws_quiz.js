import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-passcode');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { type } = req.query;

  try {
    if (req.method === 'GET') {
      if (type === 'leaderboard') {
        const { data, error } = await supabase
          .from('ws_leaderboard')
          .select('*')
          .order('score', { ascending: false })
          .limit(20);
        if (error) throw error;
        return res.status(200).json(data);
      } else {
        const { data, error } = await supabase
          .from('ws_quiz_questions')
          .select('*')
          .order('id', { ascending: true });
        if (error) throw error;
        return res.status(200).json(data);
      }
    }

    if (req.method === 'POST') {
      if (type === 'submit_score') {
        const { username, score } = req.body;
        if (!username || score === undefined) {
          return res.status(400).json({ error: 'Missing username or score' });
        }
        const { data, error } = await supabase
          .from('ws_leaderboard')
          .insert({ username, score, played_at: new Date().toISOString() })
          .select()
          .single();
        if (error) throw error;
        return res.status(201).json(data);
      }

      const passcode = req.headers['x-admin-passcode'];
      if (passcode !== 'wonder2025') {
        return res.status(401).json({ error: 'Unauthorized: Invalid passcode' });
      }

      const { question, question_si, options, options_si, correct_option_index, explanation, explanation_si, points } = req.body;
      if (!question || !question_si || !options || !options_si || correct_option_index === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const { data, error } = await supabase
        .from('ws_quiz_questions')
        .insert({ question, question_si, options, options_si, correct_option_index, explanation, explanation_si, points: points || 10 })
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
        .from('ws_quiz_questions')
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

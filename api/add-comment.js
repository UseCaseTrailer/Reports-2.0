/**
 * POST /api/add-comment
 * Body: { taskGid: string, text: string }
 * Adds a comment to an Asana task. Requires ASANA_PAT environment variable.
 */
/* global process */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed — use POST' });
  }

  const { taskGid, text } = req.body || {};
  if (!taskGid || !text) {
    return res
      .status(400)
      .json({ error: 'Both taskGid and text are required in the request body' });
  }
  if (text.trim().length === 0) {
    return res.status(400).json({ error: 'Comment text cannot be empty' });
  }

  const pat = process.env.ASANA_PAT;
  if (!pat) {
    return res.status(503).json({
      error: 'Asana PAT not configured',
      hint: 'Add ASANA_PAT environment variable in Vercel project settings',
    });
  }

  try {
    const url = `https://app.asana.com/api/1.0/tasks/${taskGid}/stories`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pat}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        data: {
          text: text.trim(),
          type: 'comment',
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      return res.status(response.status).json({
        error: `Asana API error: ${response.status} ${response.statusText}`,
        detail: body.slice(0, 200),
      });
    }

    const data = await response.json();
    return res.status(201).json({ data: data.data, success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
}

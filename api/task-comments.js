/* global process */
/**
 * GET /api/task-comments?taskGid=XXX
 * Fetches stories (comments + activity) for an Asana task.
 * Requires ASANA_PAT environment variable on Vercel.
 */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { taskGid } = req.query;
  if (!taskGid) {
    return res.status(400).json({ error: 'taskGid query parameter is required' });
  }

  const pat = process.env.ASANA_PAT;
  if (!pat) {
    return res.status(503).json({
      error: 'Asana PAT not configured',
      hint: 'Add ASANA_PAT environment variable in Vercel project settings',
    });
  }

  try {
    const url = `https://app.asana.com/api/1.0/tasks/${taskGid}/stories?opt_fields=gid,type,text,created_at,created_by.name,created_by.gid,resource_type&limit=50`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const body = await response.text();
      return res.status(response.status).json({
        error: `Asana API error: ${response.status} ${response.statusText}`,
        detail: body.slice(0, 200),
      });
    }

    const data = await response.json();
    // Filter to only comments (not system activity stories)
    const comments = (data.data || []).filter((s) => s.type === 'comment');
    return res.status(200).json({ data: comments, total: comments.length });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
}

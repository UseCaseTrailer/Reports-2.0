/* global process */
/**
 * GET /api/portfolio-items?gid=<portfolioGid>
 * Returns items (projects/sub-portfolios) belonging to a specific Asana portfolio.
 */

const COLOR_MAP = {
  'dark-purple': '#6366f1',
  'light-purple': '#8b5cf6',
  'dark-pink': '#ec4899',
  'light-pink': '#f9a8d4',
  'light-blue': '#38bdf8',
  'light-green': '#4ade80',
  'dark-blue': '#1d4ed8',
  'dark-green': '#15803d',
  'dark-red': '#b91c1c',
  'light-red': '#fca5a5',
  'dark-orange': '#c2410c',
  'light-orange': '#fdba74',
  'dark-teal': '#0f766e',
  'light-teal': '#5eead4',
  'dark-brown': '#92400e',
  'light-brown': '#d97706',
  'dark-warm-gray': '#57534e',
  none: '#94a3b8',
  blue: '#3b82f6',
};

function getCustomField(customFields, fieldName) {
  if (!Array.isArray(customFields)) return null;
  const field = customFields.find((f) => f.name === fieldName);
  return field?.display_value || null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const pat = process.env.ASANA_PAT;
  if (!pat) {
    return res.status(503).json({
      error: 'Asana PAT not configured',
      hint: 'Add ASANA_PAT environment variable in Vercel project settings',
    });
  }

  const portfolioGid = req.query?.gid;
  if (!portfolioGid) {
    return res.status(400).json({ error: 'Missing required query parameter: gid' });
  }

  try {
    const fields = [
      'name',
      'resource_type',
      'color',
      'current_status_update.text',
      'current_status_update.color',
      'current_status_update.created_at',
      'current_status_update.title',
      'custom_fields.name',
      'custom_fields.display_value',
      'due_on',
      'start_on',
      'created_at',
      'modified_at',
    ].join(',');

    const url = `https://app.asana.com/api/1.0/portfolios/${portfolioGid}/items?opt_fields=${fields}&limit=100`;

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
        detail: body.slice(0, 300),
      });
    }

    const { data } = await response.json();

    const items = (data || []).map((item) => {
      const cfs = item.custom_fields || [];
      const statusText = item.current_status_update?.text || null;
      let statusExcerpt = null;
      if (statusText) {
        const cleaned = statusText
          .replace(/https?:\/\/[^\s]+/g, '')
          .replace(/---+/g, '')
          .trim();
        const firstLine = cleaned.split('\n').find((l) => l.trim().length > 20);
        statusExcerpt = firstLine ? firstLine.trim().slice(0, 200) : null;
      }

      return {
        gid: item.gid,
        name: item.name.trim(),
        type: item.resource_type,
        color: item.color || 'none',
        colorHex: COLOR_MAP[item.color] || '#94a3b8',
        industry: getCustomField(cfs, 'Industry'),
        health: getCustomField(cfs, 'Health'),
        healthReason: getCustomField(cfs, 'Health Reason'),
        projectStatus: getCustomField(cfs, 'Project Status'),
        useCase: getCustomField(cfs, 'Use Case'),
        client: getCustomField(cfs, 'Client'),
        consultant: getCustomField(cfs, 'Consultant name'),
        dueOn: item.due_on || null,
        startOn: item.start_on || null,
        createdAt: item.created_at || null,
        modifiedAt: item.modified_at || null,
        hasStatus: !!item.current_status_update,
        statusColor: item.current_status_update?.color || null,
        statusTitle: item.current_status_update?.title || null,
        statusExcerpt,
        statusUpdatedAt: item.current_status_update?.created_at || null,
        asanaUrl:
          item.resource_type === 'portfolio'
            ? `https://app.asana.com/0/portfolio/${item.gid}`
            : `https://app.asana.com/0/${item.gid}/list`,
      };
    });

    return res.status(200).json({
      portfolioGid,
      total: items.length,
      items,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
}

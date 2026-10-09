/* global process */
/**
 * GET /api/solutions
 * Fetches the Solutions Repository portfolio (GID 1212235898211267) from Asana
 * and returns items grouped by industry vertical.
 */

const PORTFOLIO_GID = '1212235898211267';

/** Map Asana color token → hex for the UI */
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

/**
 * Categorise a portfolio name into an industry vertical.
 * Returns one of the VERTICAL_KEYS.
 */
function categorise(name) {
  const n = name.toLowerCase().trim();

  // Healthcare & Life Sciences
  if (
    /health|medical|hospital|clinic|bio|pharma|life science|life sci|amneal|agarwal|tidal|bala|aster|workh|biocon|nh1/.test(
      n
    )
  )
    return 'Healthcare & Life Sciences';

  // Financial Services
  if (/financ|fisglobal|burkland|eckler|cfo centre|invest|86400|caphill|husky|motherson/.test(n))
    return 'Financial Services';

  // Technology & SaaS
  if (
    /tech|digital|software|saas|comviva|miovision|izmo|unicommerce|adlib|telus|wipro|vigourous|clic motion|zydex|insolution/.test(
      n
    )
  )
    return 'Technology & SaaS';

  // Manufacturing & Industrial
  if (
    /manufactur|drive medical|duroflex|honda|nilkamal|walkaroo|transvolt|cme|zetwerk|arai|glatt|peak energy|btg/.test(
      n
    )
  )
    return 'Manufacturing & Industrial';

  // Real Estate & Energy
  if (
    /real estate|realt|realt|nayara|energy retail|wybe|edison real|volt and real|realinifinity/.test(
      n
    )
  )
    return 'Real Estate & Energy';

  // Food, Hospitality & Retail
  if (/food|pastry|khaithan|swiggy|zomato|phoenix mall|ethos|chitale|sayaji|khait|kings/.test(n))
    return 'Food, Hospitality & Retail';

  // Professional Services & Operations
  return 'Professional Services & Operations';
}

const VERTICAL_ORDER = [
  'Healthcare & Life Sciences',
  'Technology & SaaS',
  'Manufacturing & Industrial',
  'Financial Services',
  'Real Estate & Energy',
  'Food, Hospitality & Retail',
  'Professional Services & Operations',
];

const VERTICAL_COLORS = {
  'Healthcare & Life Sciences': '#ec4899',
  'Technology & SaaS': '#6366f1',
  'Manufacturing & Industrial': '#f59e0b',
  'Financial Services': '#10b981',
  'Real Estate & Energy': '#06b6d4',
  'Food, Hospitality & Retail': '#f97316',
  'Professional Services & Operations': '#8b5cf6',
};

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

  try {
    const fields =
      'name,resource_type,color,current_status_update.text,current_status_update.color,current_status_update.created_at';
    const url = `https://app.asana.com/api/1.0/portfolios/${PORTFOLIO_GID}/items?opt_fields=${fields}&limit=100`;

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

    // Shape each item
    const items = (data || []).map((item) => {
      const statusText = item.current_status_update?.text || null;
      const statusColor = item.current_status_update?.color || null;
      const statusUpdatedAt = item.current_status_update?.created_at || null;

      // Extract first sentence of status for a short excerpt
      let statusExcerpt = null;
      if (statusText) {
        const cleaned = statusText
          .replace(/https?:\/\/[^\s]+/g, '')
          .replace(/---+/g, '')
          .trim();
        const firstLine = cleaned.split('\n').find((l) => l.trim().length > 20);
        statusExcerpt = firstLine ? firstLine.trim().slice(0, 160) : null;
      }

      return {
        gid: item.gid,
        name: item.name.trim(),
        type: item.resource_type, // 'portfolio' or 'project'
        color: item.color || 'none',
        colorHex: COLOR_MAP[item.color] || '#94a3b8',
        vertical: categorise(item.name),
        hasStatus: !!item.current_status_update,
        statusColor: statusColor,
        statusExcerpt,
        statusUpdatedAt,
        asanaUrl:
          item.resource_type === 'portfolio'
            ? `https://app.asana.com/0/portfolio/${item.gid}`
            : `https://app.asana.com/0/${item.gid}/list`,
      };
    });

    // Group by vertical
    const verticals = {};
    VERTICAL_ORDER.forEach((v) => {
      verticals[v] = {
        label: v,
        color: VERTICAL_COLORS[v],
        items: [],
      };
    });

    items.forEach((item) => {
      if (verticals[item.vertical]) {
        verticals[item.vertical].items.push(item);
      } else {
        verticals['Professional Services & Operations'].items.push(item);
      }
    });

    // Sort each vertical: items with status first, then alphabetically
    Object.values(verticals).forEach((v) => {
      v.items.sort((a, b) => {
        if (a.hasStatus !== b.hasStatus) return a.hasStatus ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    });

    return res.status(200).json({
      portfolioGid: PORTFOLIO_GID,
      total: items.length,
      verticals: VERTICAL_ORDER.map((k) => verticals[k]),
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
}

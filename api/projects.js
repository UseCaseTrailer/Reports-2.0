/* global process */
/**
 * GET /api/projects
 * Fetches all 87 Solutions Repository items with full custom-field data.
 * Returns a flat list of projects/portfolios with industry, health, status, etc.
 */

const PORTFOLIO_GID = '1212235898211267';

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

const VERTICAL_COLORS = {
  'Healthcare & Life Sciences': '#ec4899',
  'Technology & SaaS': '#6366f1',
  'Manufacturing & Industrial': '#f59e0b',
  'Financial Services': '#10b981',
  'Real Estate & Energy': '#06b6d4',
  'Food, Hospitality & Retail': '#f97316',
  'Professional Services & Operations': '#8b5cf6',
};

/** Map Asana Industry custom field value → vertical label */
function industryToVertical(industryValue) {
  if (!industryValue) return null;
  const n = industryValue.toLowerCase();
  if (/health|hospital|pharma|medical|bio|life sci|life sciences/.test(n))
    return 'Healthcare & Life Sciences';
  if (/software|saas|tech|it service|telecom|edtech|education|digital/.test(n))
    return 'Technology & SaaS';
  if (/manufactur|automotive|chemical|logistic|supply chain|transport|industrial/.test(n))
    return 'Manufacturing & Industrial';
  if (/financ|bank|insur|invest|capital|fund|asset/.test(n)) return 'Financial Services';
  if (/real estate|oil|gas|energy|util|mining|power/.test(n)) return 'Real Estate & Energy';
  if (/retail|food|beverage|hospitality|consumer|e-commerce|restaurant|hotel|fmcg/.test(n))
    return 'Food, Hospitality & Retail';
  return null;
}

/** Name-based fallback categorisation (mirrors solutions.js) */
function categoriseByName(name) {
  const n = name.toLowerCase().trim();
  if (
    /health|medical|hospital|clinic|bio|pharma|life science|life sci|amneal|agarwal|tidal|bala|aster|workh|biocon|nh1/.test(
      n
    )
  )
    return 'Healthcare & Life Sciences';
  if (/financ|fisglobal|burkland|eckler|cfo centre|invest|86400|caphill|husky|motherson/.test(n))
    return 'Financial Services';
  if (
    /tech|digital|software|saas|comviva|miovision|izmo|unicommerce|adlib|telus|wipro|vigourous|clic motion|zydex|insolution/.test(
      n
    )
  )
    return 'Technology & SaaS';
  if (
    /manufactur|drive medical|duroflex|honda|nilkamal|walkaroo|transvolt|cme|zetwerk|arai|glatt|peak energy|btg/.test(
      n
    )
  )
    return 'Manufacturing & Industrial';
  if (/real estate|realt|nayara|energy retail|wybe|edison real|volt and real|realinifinity/.test(n))
    return 'Real Estate & Energy';
  if (/food|pastry|khaithan|swiggy|zomato|phoenix mall|ethos|chitale|sayaji|khait|kings/.test(n))
    return 'Food, Hospitality & Retail';
  return 'Professional Services & Operations';
}

/** Pull a custom field display_value by name */
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
      'custom_fields.type',
      'due_on',
      'start_on',
      'created_at',
      'modified_at',
    ].join(',');

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

    const projects = (data || []).map((item) => {
      const cfs = item.custom_fields || [];
      const industryValue = getCustomField(cfs, 'Industry');
      const vertical = industryToVertical(industryValue) || categoriseByName(item.name);

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
        type: item.resource_type, // 'portfolio' or 'project'
        color: item.color || 'none',
        colorHex: COLOR_MAP[item.color] || '#94a3b8',
        vertical,
        verticalColor: VERTICAL_COLORS[vertical] || '#94a3b8',
        // Custom fields
        industry: industryValue,
        health: getCustomField(cfs, 'Health'),
        healthReason: getCustomField(cfs, 'Health Reason'),
        projectStatus: getCustomField(cfs, 'Project Status'),
        useCase: getCustomField(cfs, 'Use Case'),
        sector: getCustomField(cfs, 'Sector'),
        region: getCustomField(cfs, 'Region'),
        client: getCustomField(cfs, 'Client'),
        consultant: getCustomField(cfs, 'Consultant name'),
        description: getCustomField(cfs, 'Description'),
        // Dates
        dueOn: item.due_on || null,
        startOn: item.start_on || null,
        createdAt: item.created_at || null,
        modifiedAt: item.modified_at || null,
        // Status update
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
      portfolioGid: PORTFOLIO_GID,
      total: projects.length,
      projects,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
}

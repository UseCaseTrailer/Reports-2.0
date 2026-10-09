/* ---------------------------------------------------------------------------
 * Marketing Data — ported from altudo-pmo-dashboard.html
 * ------------------------------------------------------------------------- */

export const MKT_SECTIONS = [
  { key: 'brief', icon: '⚠', label: 'Monday Brief' },
  { key: 'pulse', icon: '◇', label: 'Portfolio Pulse' },
  { key: 'attribution', icon: '⇌', label: 'Attribution' },
  { key: 'matrix', icon: '⊠', label: 'Perf. Matrix' },
  { key: 'channel', icon: '≳', label: 'Channel Scorecard' },
  { key: 'events', icon: '◆', label: 'Event Intel' },
  { key: 'velocity', icon: '➡', label: 'Sales Velocity' },
  { key: 'funnel', icon: '▼', label: 'Revenue Funnel' },
  { key: 'lifecycle', icon: '✙', label: 'Customer Health' },
  { key: 'cadence', icon: '✎', label: 'Cadence' },
];

export const CAMPAIGNS = [
  {
    gid: '1214111250519308',
    name: 'Product Launch – AI Assistant Q2',
    type: 'Product Launch',
    quarter: 'Q2',
    status: 'In Review',
    budget: 50000,
    spent: 50000,
    pipeline: 322000,
    roi: 544,
    channel: 'Paid + Email',
    mqls: 87,
    sqlsGen: 34,
    winRate: 22,
    avgDeal: 9500,
  },
  {
    gid: '1214111648476566',
    name: 'Paid Media – Meta Ads Q3',
    type: 'Paid Media',
    quarter: 'Q3',
    status: 'Complete',
    budget: 65000,
    spent: 65000,
    pipeline: 316000,
    roi: 386,
    channel: 'Paid Social',
    mqls: 112,
    sqlsGen: 41,
    winRate: 19,
    avgDeal: 7700,
  },
  {
    gid: '1214111750001234',
    name: 'Webinar Series – Asana × AI Q3',
    type: 'Event',
    quarter: 'Q3',
    status: 'Active',
    budget: 28000,
    spent: 18400,
    pipeline: 198000,
    roi: 607,
    channel: 'Webinar',
    mqls: 63,
    sqlsGen: 28,
    winRate: 31,
    avgDeal: 7071,
  },
  {
    gid: '1214111850002345',
    name: 'SEO Content Push – Q3',
    type: 'Content',
    quarter: 'Q3',
    status: 'Active',
    budget: 18000,
    spent: 11200,
    pipeline: 145000,
    roi: 706,
    channel: 'Organic',
    mqls: 44,
    sqlsGen: 17,
    winRate: 29,
    avgDeal: 8529,
  },
  {
    gid: '1214111950003456',
    name: 'Email Nurture – Prospect Re-engagement',
    type: 'Email',
    quarter: 'Q3',
    status: 'Planned',
    budget: 8000,
    spent: 0,
    pipeline: 82000,
    roi: 925,
    channel: 'Email',
    mqls: 29,
    sqlsGen: 11,
    winRate: 27,
    avgDeal: 7455,
  },
  {
    gid: '1214112050004567',
    name: 'Partner Co-Marketing – Sonos Q4',
    type: 'Partnership',
    quarter: 'Q4',
    status: 'Planned',
    budget: 35000,
    spent: 0,
    pipeline: 275000,
    roi: 686,
    channel: 'Partner',
    mqls: 58,
    sqlsGen: 22,
    winRate: 24,
    avgDeal: 12500,
  },
];

/** Monthly trend data for charts */
export const CAMP_MONTHLY = {
  M: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    mql: [80, 110, 220, 185, 300, 660, 370, 440, 780, 160, 72, 70],
    pipeline: [
      210000, 280000, 380000, 310000, 480000, 850000, 550000, 720000, 2940000, 340000, 120000,
      60000,
    ],
    spend: [28000, 32000, 38000, 34000, 42000, 78000, 52000, 68000, 89000, 44000, 18000, 12000],
    target: [250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250],
  },
  Q: {
    labels: ['Q1 FY26', 'Q2 FY26', 'Q3 FY26', 'Q4 FY26 (fcst)'],
    mql: [415, 1145, 1590, 297],
    pipeline: [880000, 1620000, 4210000, 530000],
    spend: [98000, 154000, 209000, 30000],
    target: [750, 750, 750, 750],
  },
  H: {
    labels: ['H1 FY26', 'H2 FY26 (fcst)'],
    mql: [1555, 1892],
    pipeline: [3500000, 3740000],
    spend: [252000, 239000],
    target: [1500, 1500],
  },
};

/** Attribution model data */
export const ATTRIBUTION = [
  { channel: 'Paid Search', firstTouch: 28, lastTouch: 19, linear: 22, revenue: 156000 },
  { channel: 'Content / SEO', firstTouch: 22, lastTouch: 14, linear: 17, revenue: 119000 },
  { channel: 'Email', firstTouch: 11, lastTouch: 26, linear: 18, revenue: 126000 },
  { channel: 'Paid Social', firstTouch: 18, lastTouch: 21, linear: 20, revenue: 140000 },
  { channel: 'Events / Webinar', firstTouch: 14, lastTouch: 12, linear: 14, revenue: 98000 },
  { channel: 'Partner', firstTouch: 7, lastTouch: 8, linear: 9, revenue: 63000 },
];

/** Channel scorecard */
export const CHANNEL_SCORECARD = [
  { channel: 'Paid Search', cpl: 312, convRate: 4.2, cac: 7400, ltv: 38000, ltvCac: 5.1, trend: 8 },
  { channel: 'Email', cpl: 48, convRate: 6.1, cac: 3200, ltv: 38000, ltvCac: 11.9, trend: 3 },
  {
    channel: 'Paid Social',
    cpl: 197,
    convRate: 3.8,
    cac: 5200,
    ltv: 38000,
    ltvCac: 7.3,
    trend: -5,
  },
  {
    channel: 'Content / SEO',
    cpl: 87,
    convRate: 5.4,
    cac: 4100,
    ltv: 38000,
    ltvCac: 9.3,
    trend: 12,
  },
  {
    channel: 'Events / Webinar',
    cpl: 145,
    convRate: 7.9,
    cac: 3800,
    ltv: 38000,
    ltvCac: 10.0,
    trend: 18,
  },
  { channel: 'Partner', cpl: 210, convRate: 5.2, cac: 4800, ltv: 38000, ltvCac: 7.9, trend: 22 },
];

/** Revenue funnel */
export const FUNNEL_STAGES = [
  { stage: 'Visitors', value: 48200, prev: 41800 },
  { stage: 'Leads', value: 3140, prev: 2890 },
  { stage: 'MQLs', value: 394, prev: 352 },
  { stage: 'SQLs', value: 153, prev: 134 },
  { stage: 'Opportunities', value: 89, prev: 78 },
  { stage: 'Closed Won', value: 31, prev: 24 },
];

/** Portfolio Pulse KPI headline tiles */
export const PULSE_KPIS = [
  { label: 'Total Pipeline', value: '$7.24M', color: '#6366f1', sub: 'influenced' },
  { label: 'ROI', value: '2.35x', color: '#52c41a', sub: 'return on spend' },
  { label: 'Attainment', value: '81%', color: '#06b6d4', sub: 'vs annual target' },
  { label: 'Campaigns', value: '6 / 11', color: '#f59e0b', sub: 'active / total' },
  { label: 'vs Target', value: '63%', color: '#8b5cf6', sub: 'pipeline attainment' },
  { label: 'Revenue', value: '$5.64M', color: '#10b981', sub: 'generated FY26' },
];

/** Pipeline by region */
export const PIPELINE_BY_REGION = [
  { region: 'NAMER', pipeline: 2740000 },
  { region: 'NAMER + EMEA', pipeline: 2400000 },
  { region: 'EMEA', pipeline: 2100000 },
];

/** Pipeline by campaign type */
export const PIPELINE_BY_TYPE = [
  { type: 'Event', pipeline: 2990000, color: '#6366f1' },
  { type: 'ABM', pipeline: 2400000, color: '#8b5cf6' },
  { type: 'Webinar', pipeline: 718000, color: '#06b6d4' },
  { type: 'Omnichannel', pipeline: 322000, color: '#10b981' },
  { type: 'Paid Social', pipeline: 316000, color: '#f59e0b' },
  { type: 'Paid Search', pipeline: 278000, color: '#f97316' },
  { type: 'Email', pipeline: 210000, color: '#ef4444' },
];

/** Campaign status summary */
export const CAMPAIGN_STATUS = [
  { status: 'Complete', count: 9, color: '#52c41a' },
  { status: 'In Review', count: 1, color: '#faad14' },
  { status: 'Planning', count: 1, color: '#94a3b8' },
];

/** Budget allocation by category */
export const BUDGET_ALLOCATION = [
  { category: 'Events', budget: 218000, color: '#6366f1' },
  { category: 'Paid Media', budget: 140500, color: '#8b5cf6' },
  { category: 'Webinar', budget: 72000, color: '#06b6d4' },
  { category: 'Brand', budget: 23500, color: '#10b981' },
  { category: 'Email / Nurture', budget: 12000, color: '#f59e0b' },
  { category: 'Product', budget: 5000, color: '#f97316' },
];

/** Pipeline influenced by marketing category */
export const PIPELINE_BY_CATEGORY = [
  { category: 'Paid Media', pipeline: 2990000 },
  { category: 'Events', pipeline: 2940000 },
  { category: 'Webinar', pipeline: 1080000 },
  { category: 'Brand', pipeline: 420000 },
  { category: 'Email / Nurture', pipeline: 210000 },
  { category: 'Product', pipeline: 98000 },
];

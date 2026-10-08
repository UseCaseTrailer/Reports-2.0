/* ---------------------------------------------------------------------------
 * PMO Data — ported from altudo-pmo-dashboard.html
 * Asana Workspace GID: 1115662927527527
 * User: Damola Egbeyemi (GID: 1210342502034567)
 * ------------------------------------------------------------------------- */

export const TODAY = '2026-10-08';
export const ME = 'Damola Egbeyemi';
export const WORKSPACE_GID = '1115662927527527';

/**
 * Health score calculator — mirrors the sc() function in the original dashboard.
 * Returns { v, cp, done, ov, ua, N }
 */
export function scoreHealth(tasks) {
  const N = tasks.length || 1;
  const done = tasks.filter((t) => t.done).length;
  const ov = tasks.filter((t) => !t.done && t.due && t.due < TODAY).length;
  const ua = tasks.filter((t) => !t.who).length;
  const nd = tasks.filter((t) => !t.done && !t.due).length;
  const cp = Math.round((done / N) * 100);
  const op = Math.round((ov / N) * 100);
  const up = Math.round((ua / N) * 100);
  const np = Math.round((nd / N) * 100);
  return {
    v: Math.round(
      cp * 0.3 +
        Math.max(0, 100 - op * 3) * 0.35 +
        Math.max(0, 100 - up * 2) * 0.2 +
        Math.max(0, 100 - np * 1.5) * 0.15
    ),
    cp,
    done,
    ov,
    ua,
    N,
  };
}

/** Translate health score to label + color */
export function healthGrade(score) {
  if (score >= 80) return { label: 'On Track', color: '#52c41a', tag: 'success' };
  if (score >= 60) return { label: 'At Risk', color: '#faad14', tag: 'warning' };
  return { label: 'Off Track', color: '#ff4d4f', tag: 'error' };
}

/* ---------------------------------------------------------------------------
 * PORTFOLIOS — P[] from original dashboard
 * ------------------------------------------------------------------------- */
export const PORTFOLIOS = [
  {
    gid: '1213303616045074',
    name: "Damola's Portfolio",
    color: '#6366f1',
    projects: [
      {
        gid: '1214100169970896',
        name: 'Claude x Asana MCP — PM Demo',
        type: 'Technology',
        phase: 'Execution',
        start: '2026-04-01',
        end: '2026-05-02',
        tasks: [
          { gid: 't1', n: 'Define project scope and objectives', done: true, due: '2026-04-03', who: ME },
          { gid: 't2', n: 'Identify stakeholders and demo audience', done: true, due: '2026-04-04', who: ME },
          { gid: 't3', n: 'Set up Asana MCP integration', done: true, due: '2026-04-09', who: ME },
          { gid: 't4', n: 'Draft demo script and talking points', done: true, due: '2026-04-13', who: null },
          { gid: 't5', n: 'Build AI sprint planner artifact', done: true, due: '2026-04-08', who: ME },
          { gid: 't6', n: 'Build daily standup digest artifact', done: true, due: '2026-04-11', who: ME },
          { gid: 't7', n: 'Build project health dashboard artifact', done: true, due: '2026-04-15', who: null },
          { gid: 't8', n: 'End-to-end integration testing', done: true, due: '2026-04-18', who: null },
          { gid: 't9', n: 'Internal review of all three demos', done: true, due: '2026-04-19', who: ME },
          { gid: 't10', n: 'Fix bugs and polish UI', done: true, due: '2026-04-22', who: null },
          { gid: 't11', n: 'Prepare demo environment and test data', done: true, due: '2026-04-24', who: null },
          { gid: 't12', n: 'Final rehearsal', done: true, due: '2026-04-25', who: ME },
          { gid: 't13', n: 'Deliver demo to stakeholders', done: true, due: '2026-04-30', who: ME },
          { gid: 't14', n: 'Post-demo feedback collection', done: false, due: '2026-05-02', who: null },
        ],
      },
      {
        gid: '1214075684788258',
        name: 'Marketing Services Intake',
        type: 'Operations',
        phase: 'Planning',
        tasks: [
          { gid: 'ms1', n: 'Registration Setup - ASD March 2027', done: false, due: '2026-04-28', who: null },
          { gid: 'ms2', n: 'Social Media Campaign - ASD March 2027', done: false, due: '2026-04-30', who: null },
          { gid: 'ms3', n: 'Email Campaign - ASD March 2027', done: false, due: '2026-04-25', who: ME },
          { gid: 'ms4', n: 'HubSpot Form - ASD March 2027', done: false, due: '2026-04-22', who: null },
          { gid: 'ms5', n: 'Custom Fields Setup', done: true, due: null, who: ME },
          { gid: 'ms6', n: 'Sonos - Webinar - October', done: false, due: '2026-04-16', who: ME },
          { gid: 'ms7', n: 'CE Pro - Intake Follow-up Needed', done: false, due: '2026-04-16', who: ME },
          { gid: 'ms8', n: 'Sonos - Multi-Product Launch - November', done: false, due: '2026-04-17', who: ME },
          { gid: 'ms9', n: 'AmericasMart Winter 2027 - Registration', done: false, due: null, who: null },
        ],
      },
      {
        gid: '1214074473254187',
        name: 'Client Call Tracker',
        type: 'Operations',
        phase: 'Active',
        tasks: [
          { gid: 'cc1', n: 'Stanley|Apr 14-17|Workflow Implementation', done: true, due: '2026-04-17', who: null },
          { gid: 'cc2', n: 'Prosehair x Asana Working Session', done: true, due: '2026-04-17', who: ME },
          { gid: 'cc3', n: 'Stanley x Altudo Working Session', done: true, due: '2026-04-17', who: ME },
          { gid: 'cc4', n: 'MNHS x Asana Discovery', done: true, due: '2026-04-17', who: ME },
          { gid: 'cc5', n: 'Emeraldx x Asana Project Sync', done: true, due: '2026-04-15', who: ME },
          { gid: 'cc6', n: 'RF CUNY x Altudo | Training 1', done: true, due: '2026-04-15', who: ME },
          { gid: 'cc7', n: 'Stanley x Altudo Working Session (Apr15)', done: true, due: '2026-04-15', who: ME },
          { gid: 'cc8', n: 'Prosehair x Asana Working Session (Apr15)', done: true, due: '2026-04-15', who: ME },
          { gid: 'cc9', n: 'ISSBC x Altudo sync', done: true, due: '2026-04-13', who: ME },
          { gid: 'cc10', n: 'Prisma Health x Asana Working Session', done: true, due: '2026-04-08', who: ME },
        ],
      },
      {
        gid: '1211806622032433',
        name: 'Damola - Execution Control Center',
        type: 'Strategy',
        phase: 'Ongoing',
        tasks: [
          { gid: 'ec1', n: 'Document meeting-follow-up use case', done: false, due: null, who: ME },
          { gid: 'ec2', n: 'Document marketer campaign-launch use case', done: false, due: null, who: ME },
          { gid: 'ec3', n: 'Research Asana MCP use cases', done: false, due: null, who: ME },
          { gid: 'ec4', n: 'Email Kushagra & Pranay: Prisma docs', done: false, due: null, who: ME },
          { gid: 'ec5', n: 'Send handover email to Lynn (Prisma)', done: false, due: null, who: ME },
          { gid: 'ec6', n: 'Define portfolio custom fields w/ Monique', done: false, due: null, who: ME },
          { gid: 'ec7', n: 'Set up MWB4 structure in Asana', done: false, due: null, who: ME },
          { gid: 'ec8', n: 'Integrate DocuSign into Client Onboarding demo', done: false, due: null, who: ME },
          { gid: 'ec9', n: 'Email Subramanian 2 demo scripts', done: false, due: null, who: ME },
          { gid: 'ec10', n: 'Schedule sync w/ Raghav re: contracting', done: false, due: null, who: ME },
        ],
      },
    ],
  },
  {
    gid: '1218674833984515',
    name: '03.Active Projects',
    color: '#06b6d4',
    projects: [
      {
        gid: '1218674833984575',
        name: 'GRANT-2026-002 – Rural Healthcare Outcomes Study',
        type: 'Research',
        phase: 'Execution',
        start: '2026-09-16',
        end: '2026-11-30',
        tasks: [
          { gid: 'g002a', n: 'Literature review and baseline assessment', done: true, due: '2026-09-30', who: 'James Chen' },
          { gid: 'g002b', n: 'Field data collection – Phase 1', done: true, due: '2026-10-07', who: 'James Chen' },
          { gid: 'g002c', n: 'Stakeholder interviews', done: false, due: '2026-10-21', who: 'James Chen' },
          { gid: 'g002d', n: 'Interim findings report', done: false, due: '2026-11-04', who: 'James Chen' },
          { gid: 'g002e', n: 'Final analysis and write-up', done: false, due: '2026-11-25', who: null },
          { gid: 'g002f', n: 'Submit to grant committee', done: false, due: '2026-11-30', who: null },
        ],
      },
      {
        gid: '1218674833984633',
        name: 'GRANT-2026-003 – Digital Education Impact Research',
        type: 'Research',
        phase: 'Execution',
        start: '2026-09-15',
        end: '2026-12-03',
        tasks: [
          { gid: 'g003a', n: 'Survey instrument design', done: true, due: '2026-09-25', who: 'Diana Frenell' },
          { gid: 'g003b', n: 'IRB submission and approval', done: true, due: '2026-09-30', who: 'Diana Frenell' },
          { gid: 'g003c', n: 'Participant recruitment', done: false, due: '2026-10-10', who: 'Diana Frenell' },
          { gid: 'g003d', n: 'Data collection sprint', done: false, due: '2026-10-31', who: null },
          { gid: 'g003e', n: 'Data analysis', done: false, due: '2026-11-14', who: null },
          { gid: 'g003f', n: 'Draft report submission', done: false, due: '2026-11-28', who: null },
          { gid: 'g003g', n: 'Final deliverable', done: false, due: '2026-12-03', who: null },
        ],
      },
      {
        gid: '1218674833984691',
        name: 'GRANT-2026-004 – Maternal Health Improvement Study',
        type: 'Research',
        phase: 'Execution',
        start: '2026-09-16',
        end: '2026-11-18',
        tasks: [
          { gid: 'g004a', n: 'Protocol development', done: true, due: '2026-09-23', who: 'Jamie Staples' },
          { gid: 'g004b', n: 'Site activation – 3 clinics', done: true, due: '2026-10-01', who: 'Jamie Staples' },
          { gid: 'g004c', n: 'Data collection – Wave 1', done: true, due: '2026-10-08', who: 'Jamie Staples' },
          { gid: 'g004d', n: 'Mid-point quality review', done: false, due: '2026-10-22', who: 'Jamie Staples' },
          { gid: 'g004e', n: 'Data collection – Wave 2', done: false, due: '2026-11-05', who: null },
          { gid: 'g004f', n: 'Final report submission', done: false, due: '2026-11-18', who: null },
        ],
      },
      {
        gid: '1218674833984749',
        name: 'GRANT-2026-005 – Climate and Community Health Research',
        type: 'Research',
        phase: 'Execution',
        start: '2026-09-15',
        end: '2026-11-11',
        tasks: [
          { gid: 'g005a', n: 'Environmental data gathering', done: true, due: '2026-09-28', who: 'Pierre Dayon' },
          { gid: 'g005b', n: 'Community survey rollout', done: true, due: '2026-10-05', who: 'Pierre Dayon' },
          { gid: 'g005c', n: 'Cross-referencing datasets', done: false, due: '2026-10-15', who: null },
          { gid: 'g005d', n: 'Statistical modelling', done: false, due: '2026-10-28', who: null },
          { gid: 'g005e', n: 'Draft findings', done: false, due: '2026-11-07', who: null },
          { gid: 'g005f', n: 'Submit final report', done: false, due: '2026-11-11', who: null },
        ],
      },
      {
        gid: '1218674833984922',
        name: 'GRANT-2026-006 – Urban Health Systems Research',
        type: 'Research',
        phase: 'Execution',
        start: '2026-09-21',
        end: '2026-11-16',
        tasks: [
          { gid: 'g006a', n: 'Urban health mapping', done: true, due: '2026-10-01', who: 'Amy Love' },
          { gid: 'g006b', n: 'Systems analysis', done: false, due: '2026-10-14', who: 'Amy Love' },
          { gid: 'g006c', n: 'Intervention design workshop', done: false, due: '2026-10-24', who: null },
          { gid: 'g006d', n: 'Pilot programme launch', done: false, due: '2026-11-04', who: null },
          { gid: 'g006e', n: 'Evaluation and reporting', done: false, due: '2026-11-16', who: null },
        ],
      },
      {
        gid: '1218674833984864',
        name: 'GRANT-2026-007 – Child Nutrition Outcomes Study',
        type: 'Research',
        phase: 'Execution',
        start: '2026-09-21',
        end: '2026-11-19',
        tasks: [
          { gid: 'g007a', n: 'Baseline nutritional assessment', done: true, due: '2026-10-02', who: 'Michelle Weeks' },
          { gid: 'g007b', n: 'Dietary data collection', done: false, due: '2026-10-15', who: 'Michelle Weeks' },
          { gid: 'g007c', n: 'Community health education sessions', done: false, due: '2026-10-28', who: null },
          { gid: 'g007d', n: 'Midterm impact assessment', done: false, due: '2026-11-05', who: null },
          { gid: 'g007e', n: 'Final report and recommendations', done: false, due: '2026-11-19', who: null },
        ],
      },
    ],
  },
];

/* ---------------------------------------------------------------------------
 * DEPARTMENT PORTFOLIOS — DPORT from original dashboard
 * ------------------------------------------------------------------------- */
export const DEPT_PORTFOLIOS = {
  engineering: {
    gid: '1214598384580645',
    name: 'Engineering',
    color: '#4f46e5',
    totalBudget: 1150200,
    totalSpent: 803800,
    kpis: [
      { l: 'Total budget', v: '$1.15M', c: '#818cf8', s: '7 projects' },
      { l: 'Total spent', v: '$803.8K', c: '#fbbf24', s: '69.9% utilised' },
      { l: 'On track', v: '4', c: '#4ade80', s: 'of 7 projects' },
      { l: 'At risk', v: '2', c: '#fcd34d', s: 'need attention' },
      { l: 'Off track', v: '1', c: '#f87171', s: 'Customer Portal' },
      { l: 'Total savings', v: '$962K', c: '#34d399', s: 'confirmed / projected' },
    ],
    projects: [
      {
        gid: '1214598733907733',
        name: 'Production Incident Postmortem & Prevention Plan',
        status: 'green',
        cat: 'Reliability',
        priority: 'high',
        budget: 58200,
        spent: 34800,
        tasks: { total: 18, done: 11, overdue: 2 },
        roi: null,
        savings: null,
        note: 'On track. $34,800 spent (59.8%). Prevention workstreams on schedule through July 15.',
        metrics: [
          { l: 'Incident costs', v: '$17,800' },
          { l: 'Programme labour', v: '$20,250' },
          { l: 'Prevention labour', v: '$17,100' },
          { l: 'SLA credits issued', v: '$8,500' },
        ],
      },
      {
        gid: '1214598907485769',
        name: 'Data Pipeline Reliability Initiative – Q3',
        status: 'yellow',
        cat: 'Infrastructure',
        priority: 'high',
        budget: 196800,
        spent: 98400,
        tasks: { total: 32, done: 14, overdue: 4 },
        roi: null,
        savings: 140000,
        note: 'At risk — Redis delay in Sprint 2. $6K additional cost within contingency reserve.',
        metrics: [
          { l: 'Engineering labour', v: '$180,000' },
          { l: 'Monte Carlo', v: '$10,800' },
          { l: 'Contingency', v: '$9,796' },
          { l: 'Annual savings', v: '$140,000' },
        ],
      },
      {
        gid: '1214598781470780',
        name: 'Security Vulnerability Remediation – Q2/Q3',
        status: 'complete',
        cat: 'Security',
        priority: 'critical',
        budget: 218500,
        spent: 204200,
        tasks: { total: 41, done: 41, overdue: 0 },
        roi: null,
        savings: null,
        note: 'Complete — 6.5% under budget. SOC 2 Type II restored. All CVEs remediated.',
        metrics: [
          { l: 'Final cost', v: '$204,200' },
          { l: 'Under budget', v: '$14,300' },
          { l: 'Pen tests', v: '$30,000' },
          { l: 'ARR protected', v: '$2.4M' },
        ],
      },
      {
        gid: '1214598781682283',
        name: 'Infrastructure Cost Optimization – Q3',
        status: 'green',
        cat: 'FinOps',
        priority: 'medium',
        budget: 68400,
        spent: 48200,
        tasks: { total: 24, done: 17, overdue: 0 },
        roi: 1202,
        savings: 822000,
        note: 'Star performer — 1,202% ROI. $74,200/month savings delivered. 27.8-day payback.',
        metrics: [
          { l: 'Monthly savings', v: '$74,200/mo' },
          { l: 'Year 1 net', v: '$822,000' },
          { l: 'Payback', v: '27.8 days' },
          { l: 'ROI', v: '1,202%' },
        ],
      },
      {
        gid: '1214598835390274',
        name: 'Customer Portal Feature Release – Q3',
        status: 'red',
        cat: 'Product',
        priority: 'high',
        budget: 294000,
        spent: 198400,
        tasks: { total: 48, done: 28, overdue: 7 },
        roi: null,
        savings: 180000,
        note: 'Off track — Stripe complexity risk, 7 overdue tasks. Sprint 2 extension may add $8,100.',
        metrics: [
          { l: 'Engineering', v: '$234,000' },
          { l: 'Stripe+Okta', v: '$20,000' },
          { l: 'CS avoidance', v: '$180K/yr' },
          { l: 'Contingency', v: '$26,500' },
        ],
      },
      {
        gid: '1214598860265526',
        name: 'Mobile App Performance Optimization – Q2',
        status: 'green',
        cat: 'Product',
        priority: 'medium',
        budget: 128000,
        spent: 96200,
        tasks: { total: 29, done: 22, overdue: 1 },
        roi: null,
        savings: null,
        note: 'On track. +8% 30-day retention projected. No overrun risk identified.',
        metrics: [
          { l: 'iOS labour', v: '$63,000' },
          { l: 'Android labour', v: '$63,000' },
          { l: 'Testing', v: '$2,800' },
          { l: 'Retention', v: '+8%' },
        ],
      },
      {
        gid: '1214598860435416',
        name: 'Platform API Modernization – Q2',
        status: 'yellow',
        cat: 'Infrastructure',
        priority: 'high',
        budget: 186500,
        spent: 124300,
        tasks: { total: 36, done: 22, overdue: 3 },
        roi: 225,
        savings: null,
        note: 'At risk — pen test quote not finalised (±10%). 3 enterprise integrations unblocked.',
        metrics: [
          { l: 'Platform labour', v: '$174,000' },
          { l: 'API tooling', v: '$4,000' },
          { l: 'ARR unlocked', v: '$420,000' },
          { l: 'Proj. ROI', v: '225%' },
        ],
      },
    ],
  },
  sales: {
    gid: '1214598384580649',
    name: 'Sales',
    color: '#16a34a',
    totalBudget: 0,
    totalSpent: 0,
    kpis: [],
    projects: [],
  },
  finance: {
    gid: '1214598384580637',
    name: 'Finance',
    color: '#d97706',
    totalBudget: 0,
    totalSpent: 0,
    kpis: [],
    projects: [],
  },
  pm: {
    gid: '1214598384580641',
    name: 'Project Management',
    color: '#0891b2',
    totalBudget: 0,
    totalSpent: 0,
    kpis: [
      { l: 'Active projects', v: '1', c: '#fcd34d', s: 'Claude x MCP Demo' },
      { l: 'Tasks total', v: '14', c: '#818cf8', s: 'across 1 project' },
      { l: 'Completed', v: '3', c: '#4ade80', s: '21% done' },
      { l: 'Overdue', v: '5', c: '#f87171', s: 'action needed' },
      { l: 'Due date', v: 'May 2', c: '#fcd34d', s: 'upcoming deadline' },
      { l: 'Health score', v: '~58', c: '#f87171', s: 'off track — 58/100' },
    ],
    projects: [
      {
        gid: '1214100169970896',
        name: 'Claude x Asana MCP — PM Demo',
        status: 'yellow',
        cat: 'Technology',
        priority: 'high',
        budget: null,
        spent: null,
        tasks: { total: 14, done: 3, overdue: 5 },
        roi: null,
        savings: null,
        note: 'At risk — 5 overdue tasks, delivery May 2. End-to-end testing and final rehearsal pending.',
        metrics: [
          { l: 'Tasks done', v: '3/14' },
          { l: 'Overdue', v: '5 tasks' },
          { l: 'Owner', v: 'Damola E.' },
          { l: 'Deadline', v: 'May 2' },
        ],
      },
    ],
  },
};

/** Quick summary stats across all portfolios */
export function getPortfolioSummary() {
  const allProjects = PORTFOLIOS.flatMap((p) => p.projects);
  const activeGrants = PORTFOLIOS.find((p) => p.name === '03.Active Projects')?.projects || [];

  const grantHealths = activeGrants.map((proj) => {
    const hs = scoreHealth(proj.tasks);
    return hs.v;
  });

  const onTrack = grantHealths.filter((v) => v >= 80).length;
  const atRisk = grantHealths.filter((v) => v >= 60 && v < 80).length;
  const offTrack = grantHealths.filter((v) => v < 60).length;

  return {
    totalPortfolios: PORTFOLIOS.length,
    totalProjects: allProjects.length,
    activeGrants: activeGrants.length,
    onTrack,
    atRisk,
    offTrack,
    avgHealth: grantHealths.length
      ? Math.round(grantHealths.reduce((a, b) => a + b, 0) / grantHealths.length)
      : 0,
  };
}

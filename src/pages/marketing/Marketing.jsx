import { useState } from 'react';
import { Row, Col, Card, Tabs, Table, Tag, Space, Typography, Progress, Segmented } from 'antd';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import SectionLabel from '../../components/SectionLabel';
import {
  CAMPAIGNS,
  CAMP_MONTHLY,
  ATTRIBUTION,
  CHANNEL_SCORECARD,
  FUNNEL_STAGES,
  MKT_SECTIONS,
  PULSE_KPIS,
  PIPELINE_BY_REGION,
  PIPELINE_BY_TYPE,
  CAMPAIGN_STATUS,
  BUDGET_ALLOCATION,
  PIPELINE_BY_CATEGORY,
} from '../../data/marketingData';

const { Title, Text } = Typography;

const fmtK = (v) =>
  v >= 1000000
    ? `$${(v / 1000000).toFixed(2)}M`
    : v >= 1000
      ? `$${(v / 1000).toFixed(0)}K`
      : `$${v}`;
const fmtM = (v) => `$${(v / 1000000).toFixed(2)}M`;

/* ── Custom tooltips ── */
const MqlTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Card size="small" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)', minWidth: 140 }}>
      <Text strong style={{ fontSize: 12 }}>
        {label}
      </Text>
      {payload.map((p) => (
        <div key={p.dataKey}>
          <Text style={{ fontSize: 12, color: p.color }}>
            {p.name}: {p.value.toLocaleString()}
          </Text>
        </div>
      ))}
    </Card>
  );
};

const PipelineTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Card size="small" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)', minWidth: 160 }}>
      <Text strong style={{ fontSize: 12 }}>
        {label}
      </Text>
      {payload.map((p) => (
        <div key={p.dataKey}>
          <Text style={{ fontSize: 12, color: p.color }}>
            {p.name}: {fmtK(p.value)}
          </Text>
        </div>
      ))}
    </Card>
  );
};

/* ── Portfolio Pulse ── */
const PortfolioPulse = () => {
  const [period, setPeriod] = useState('M');
  const d = CAMP_MONTHLY[period];

  const mqlData = d.labels.map((label, i) => ({
    label,
    MQL: d.mql[i],
    Target: d.target[i],
  }));

  const pipelineData = d.labels.map((label, i) => ({
    label,
    Pipeline: d.pipeline[i],
  }));

  return (
    <div>
      {/* KPI Tiles */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {PULSE_KPIS.map((kpi) => (
          <Col xs={12} sm={8} lg={4} key={kpi.label}>
            <Card
              size="small"
              style={{
                borderTop: `3px solid ${kpi.color}`,
                textAlign: 'center',
                height: '100%',
              }}
              styles={{ body: { padding: '12px 8px' } }}
            >
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: kpi.color,
                  display: 'block',
                  lineHeight: 1.2,
                }}
              >
                {kpi.value}
              </Text>
              <Text strong style={{ fontSize: 11, display: 'block', marginTop: 2 }}>
                {kpi.label}
              </Text>
              <Text type="secondary" style={{ fontSize: 10 }}>
                {kpi.sub}
              </Text>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Period toggle */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
        <Text strong style={{ fontSize: 13 }}>
          Trend Analysis
        </Text>
        <Segmented
          size="small"
          options={[
            { label: 'Monthly', value: 'M' },
            { label: 'Quarterly', value: 'Q' },
            { label: 'H1 / H2', value: 'H' },
          ]}
          value={period}
          onChange={setPeriod}
        />
      </Row>

      {/* Trend Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {/* MQL Volume Chart */}
        <Col xs={24} lg={12}>
          <Card
            size="small"
            title={
              <Text strong style={{ fontSize: 13 }}>
                MQL Volume
              </Text>
            }
            extra={
              <Text type="secondary" style={{ fontSize: 11 }}>
                3,447 MQLs · 115% of target
              </Text>
            }
          >
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={mqlData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="mqlGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} width={36} />
                <Tooltip content={<MqlTooltip />} />
                <ReferenceLine
                  y={250}
                  stroke="#d1d5db"
                  strokeDasharray="4 4"
                  label={{ value: 'Target', position: 'right', fontSize: 10, fill: '#9ca3af' }}
                />
                <Area
                  type="monotone"
                  dataKey="MQL"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#mqlGrad)"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Pipeline Influenced Chart */}
        <Col xs={24} lg={12}>
          <Card
            size="small"
            title={
              <Text strong style={{ fontSize: 13 }}>
                Pipeline Influenced
              </Text>
            }
            extra={
              <Text type="secondary" style={{ fontSize: 11 }}>
                Sep peak — LinkedIn ABM spike
              </Text>
            }
          >
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={pipelineData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="pipeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis
                  tick={{ fontSize: 10 }}
                  width={52}
                  tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
                />
                <Tooltip content={<PipelineTooltip />} />
                <Area
                  type="monotone"
                  dataKey="Pipeline"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fill="url(#pipeGrad)"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Pipeline Breakdown Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {/* Pipeline by Region */}
        <Col xs={24} sm={12} lg={8}>
          <Card
            size="small"
            title={
              <Text strong style={{ fontSize: 13 }}>
                Pipeline by Region
              </Text>
            }
            style={{ height: '100%' }}
          >
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={PIPELINE_BY_REGION}
                layout="vertical"
                margin={{ top: 0, right: 12, bottom: 0, left: 0 }}
              >
                <XAxis
                  type="number"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
                />
                <YAxis dataKey="region" type="category" tick={{ fontSize: 11 }} width={90} />
                <Tooltip formatter={(v) => [fmtM(v), 'Pipeline']} />
                <Bar dataKey="pipeline" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Pipeline by Campaign Type */}
        <Col xs={24} sm={12} lg={10}>
          <Card
            size="small"
            title={
              <Text strong style={{ fontSize: 13 }}>
                Pipeline by Campaign Type
              </Text>
            }
            style={{ height: '100%' }}
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={PIPELINE_BY_TYPE}
                layout="vertical"
                margin={{ top: 0, right: 12, bottom: 0, left: 0 }}
              >
                <XAxis
                  type="number"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
                />
                <YAxis dataKey="type" type="category" tick={{ fontSize: 11 }} width={90} />
                <Tooltip formatter={(v) => [fmtM(v), 'Pipeline']} />
                <Bar dataKey="pipeline" radius={[0, 4, 4, 0]}>
                  {PIPELINE_BY_TYPE.map((entry) => (
                    <Cell key={entry.type} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Campaign Status */}
        <Col xs={24} sm={24} lg={6}>
          <Card
            size="small"
            title={
              <Text strong style={{ fontSize: 13 }}>
                Campaign Status
              </Text>
            }
            style={{ height: '100%' }}
          >
            <div style={{ padding: '16px 0' }}>
              {CAMPAIGN_STATUS.map((s) => (
                <div
                  key={s.status}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 8px',
                    marginBottom: 8,
                    borderRadius: 8,
                    background: `${s.color}12`,
                    border: `1px solid ${s.color}30`,
                  }}
                >
                  <Space size={8}>
                    <div
                      style={{ width: 10, height: 10, borderRadius: '50%', background: s.color }}
                    />
                    <Text style={{ fontSize: 13, fontWeight: 600 }}>{s.status}</Text>
                  </Space>
                  <Text
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: s.color,
                      lineHeight: 1,
                    }}
                  >
                    {s.count}
                  </Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Budget & Category Row */}
      <Row gutter={[16, 16]}>
        {/* Budget Allocation Pie */}
        <Col xs={24} sm={12}>
          <Card
            size="small"
            title={
              <Text strong style={{ fontSize: 13 }}>
                Budget Allocation
              </Text>
            }
            extra={
              <Text type="secondary" style={{ fontSize: 11 }}>
                Total $471K
              </Text>
            }
          >
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={BUDGET_ALLOCATION}
                  dataKey="budget"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  labelLine={true}
                >
                  {BUDGET_ALLOCATION.map((entry) => (
                    <Cell key={entry.category} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`$${(v / 1000).toFixed(0)}K`, 'Budget']} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Pipeline by Category Bar */}
        <Col xs={24} sm={12}>
          <Card
            size="small"
            title={
              <Text strong style={{ fontSize: 13 }}>
                Pipeline by Category
              </Text>
            }
            extra={
              <Text type="secondary" style={{ fontSize: 11 }}>
                $7.24M total
              </Text>
            }
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={PIPELINE_BY_CATEGORY}
                margin={{ top: 5, right: 10, bottom: 40, left: 0 }}
              >
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 9 }}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={52}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
                  width={48}
                />
                <Tooltip formatter={(v) => [fmtM(v), 'Pipeline']} />
                <Bar dataKey="pipeline" fill="#6366f1" radius={[4, 4, 0, 0]}>
                  {PIPELINE_BY_CATEGORY.map((_, i) => {
                    const colors = [
                      '#6366f1',
                      '#8b5cf6',
                      '#06b6d4',
                      '#10b981',
                      '#f59e0b',
                      '#f97316',
                    ];
                    return <Cell key={i} fill={colors[i % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

/* ── Attribution ── */
const Attribution = () => (
  <div>
    <SectionLabel>Multi-touch Attribution</SectionLabel>
    <Row gutter={[12, 12]}>
      {ATTRIBUTION.map((r) => (
        <Col xs={24} sm={12} lg={8} key={r.channel}>
          <Card size="small" styles={{ body: { padding: '10px 14px' } }}>
            <Typography.Text strong style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
              {r.channel}
            </Typography.Text>
            <Space direction="vertical" size={6} style={{ width: '100%' }}>
              <div>
                <Row justify="space-between">
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                    First Touch
                  </Typography.Text>
                  <Typography.Text style={{ fontSize: 11 }}>{r.firstTouch}%</Typography.Text>
                </Row>
                <Progress
                  percent={r.firstTouch}
                  showInfo={false}
                  strokeColor="#6366f1"
                  size="small"
                />
              </div>
              <div>
                <Row justify="space-between">
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                    Last Touch
                  </Typography.Text>
                  <Typography.Text style={{ fontSize: 11 }}>{r.lastTouch}%</Typography.Text>
                </Row>
                <Progress
                  percent={r.lastTouch}
                  showInfo={false}
                  strokeColor="#06b6d4"
                  size="small"
                />
              </div>
              <div>
                <Row justify="space-between">
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                    Linear
                  </Typography.Text>
                  <Typography.Text style={{ fontSize: 11 }}>{r.linear}%</Typography.Text>
                </Row>
                <Progress percent={r.linear} showInfo={false} strokeColor="#f59e0b" size="small" />
              </div>
            </Space>
          </Card>
        </Col>
      ))}
    </Row>
  </div>
);

/* ── Channel Scorecard ── */
const ChannelScorecard = () => {
  const cols = [
    { title: 'Channel', dataIndex: 'channel', key: 'channel' },
    { title: 'CPL', dataIndex: 'cpl', key: 'cpl', render: (v) => `$${v}`, responsive: ['md'] },
    {
      title: 'Conv %',
      dataIndex: 'convRate',
      key: 'convRate',
      render: (v) => `${v}%`,
      responsive: ['lg'],
    },
    {
      title: 'LTV:CAC',
      dataIndex: 'ltvCac',
      key: 'ltvCac',
      render: (v) => <Tag color={v >= 10 ? 'success' : v >= 7 ? 'warning' : 'error'}>{v}x</Tag>,
    },
    {
      title: 'Trend',
      dataIndex: 'trend',
      key: 'trend',
      render: (v) => (
        <Text type={v > 0 ? 'success' : 'danger'}>
          {v > 0 ? '+' : ''}
          {v}%
        </Text>
      ),
    },
  ];
  return (
    <Table
      columns={cols}
      dataSource={CHANNEL_SCORECARD.map((r, i) => ({ ...r, key: i }))}
      pagination={false}
      size="small"
    />
  );
};

/* ── Revenue Funnel ── */
const RevenueFunnel = () => (
  <div>
    {FUNNEL_STAGES.map((stage, i) => {
      const pct = Math.round((stage.value / FUNNEL_STAGES[0].value) * 100);
      const growth = Math.round(((stage.value - stage.prev) / stage.prev) * 100);
      return (
        <div key={stage.stage} style={{ marginBottom: 12 }}>
          <Row justify="space-between" style={{ marginBottom: 4 }}>
            <Col>
              <Text style={{ fontSize: 13, fontWeight: 600 }}>{stage.stage}</Text>
            </Col>
            <Col>
              <Space>
                <Text strong>{stage.value.toLocaleString()}</Text>
                <Tag color={growth > 0 ? 'success' : 'error'}>
                  {growth > 0 ? '+' : ''}
                  {growth}% vs prior
                </Tag>
              </Space>
            </Col>
          </Row>
          <Progress
            percent={pct}
            showInfo={false}
            strokeColor={i === 0 ? '#6366f1' : i < 3 ? '#06b6d4' : '#52c41a'}
            strokeWidth={14}
          />
        </div>
      );
    })}
  </div>
);

/* ── Campaign Table (Performance Matrix) ── */
const PerfMatrix = () => {
  const cols = [
    {
      title: 'Campaign',
      dataIndex: 'name',
      key: 'name',
      render: (t) => <Text style={{ fontSize: 12 }}>{t}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s) => {
        const map = {
          Active: 'processing',
          Complete: 'success',
          Planned: 'default',
          'In Review': 'warning',
        };
        return <Tag color={map[s] || 'default'}>{s}</Tag>;
      },
    },
    {
      title: 'Budget',
      dataIndex: 'budget',
      key: 'budget',
      responsive: ['md'],
      render: (v) => fmtK(v),
    },
    { title: 'Pipeline', dataIndex: 'pipeline', key: 'pipeline', render: (v) => fmtK(v) },
    { title: 'ROI', dataIndex: 'roi', key: 'roi', render: (v) => <Tag color="success">{v}%</Tag> },
    { title: 'MQLs', dataIndex: 'mqls', key: 'mqls', responsive: ['lg'] },
  ];
  return (
    <Table
      columns={cols}
      dataSource={CAMPAIGNS.map((c) => ({ ...c, key: c.gid }))}
      pagination={false}
      size="small"
      scroll={{ x: 600 }}
    />
  );
};

/* ── Monday Brief ── */
const MondayBrief = () => {
  const active = CAMPAIGNS.filter((c) => c.status === 'Active');
  const totalBudget = CAMPAIGNS.reduce((s, c) => s + c.budget, 0);
  const totalSpent = CAMPAIGNS.reduce((s, c) => s + c.spent, 0);
  const totalMQLs = CAMPAIGNS.reduce((s, c) => s + c.mqls, 0);
  const totalPipeline = CAMPAIGNS.reduce((s, c) => s + c.pipeline, 0);
  const pacing = Math.round((totalSpent / totalBudget) * 100);

  const kpis = [
    {
      label: 'Active Campaigns',
      value: active.length,
      color: '#6366f1',
      sub: `of ${CAMPAIGNS.length} total`,
    },
    {
      label: 'Budget Paced',
      value: `${pacing}%`,
      color: pacing > 90 ? '#f59e0b' : '#52c41a',
      sub: `${fmtK(totalSpent)} of ${fmtK(totalBudget)}`,
    },
    { label: 'Total MQLs', value: totalMQLs.toLocaleString(), color: '#06b6d4', sub: 'FY2026 YTD' },
    {
      label: 'Pipeline Influenced',
      value: fmtK(totalPipeline),
      color: '#8b5cf6',
      sub: 'across all campaigns',
    },
  ];

  const actions = [
    { icon: '🔴', text: 'Review Webinar Series Q3 renewal — monitor MQL conversion this week' },
    { icon: '🟡', text: 'Budget reallocation from Meta Ads to SEO Content (Q4 planning)' },
    { icon: '🟡', text: 'Partner Co-Marketing kickoff brief due this week' },
    { icon: '🟢', text: 'Email Nurture Re-engagement planned and approved for Q3 launch' },
    { icon: '🟢', text: 'SEO Content push on track — 706% ROI, best performing active campaign' },
  ];

  return (
    <div>
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {kpis.map((k) => (
          <Col xs={12} sm={6} key={k.label}>
            <Card
              size="small"
              style={{ borderTop: `3px solid ${k.color}`, textAlign: 'center' }}
              styles={{ body: { padding: '12px 8px' } }}
            >
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: k.color,
                  display: 'block',
                  lineHeight: 1.2,
                }}
              >
                {k.value}
              </Text>
              <Text strong style={{ fontSize: 11, display: 'block', marginTop: 2 }}>
                {k.label}
              </Text>
              <Text type="secondary" style={{ fontSize: 10 }}>
                {k.sub}
              </Text>
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            size="small"
            title={
              <Text strong style={{ fontSize: 13 }}>
                Campaign Spend Pacing
              </Text>
            }
          >
            <Space direction="vertical" size={10} style={{ width: '100%' }}>
              {CAMPAIGNS.filter((c) => c.status !== 'Planned').map((c) => {
                const pct = Math.round((c.spent / c.budget) * 100);
                return (
                  <div key={c.gid}>
                    <Row justify="space-between" style={{ marginBottom: 2 }}>
                      <Text style={{ fontSize: 11 }}>
                        {c.name.length > 35 ? c.name.slice(0, 35) + '…' : c.name}
                      </Text>
                      <Space size={6}>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {fmtK(c.spent)} / {fmtK(c.budget)}
                        </Text>
                        <Tag
                          style={{ fontSize: 9, lineHeight: '16px', padding: '0 4px' }}
                          color={pct >= 100 ? 'error' : pct >= 80 ? 'warning' : 'success'}
                        >
                          {pct}%
                        </Tag>
                      </Space>
                    </Row>
                    <Progress
                      percent={Math.min(pct, 100)}
                      showInfo={false}
                      strokeColor={pct >= 100 ? '#ff4d4f' : pct >= 80 ? '#faad14' : '#52c41a'}
                      size="small"
                    />
                  </div>
                );
              })}
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            size="small"
            title={
              <Text strong style={{ fontSize: 13 }}>
                Weekly Actions
              </Text>
            }
            style={{ height: '100%' }}
          >
            <Space direction="vertical" size={10} style={{ width: '100%' }}>
              {actions.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 13, flexShrink: 0 }}>{a.icon}</span>
                  <Text style={{ fontSize: 12, lineHeight: '1.5' }}>{a.text}</Text>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

/* ── Event Intel ── */
const EventIntel = () => {
  const eventCampaigns = CAMPAIGNS.filter((c) => c.type === 'Event' || c.channel === 'Webinar');
  const chartData =
    eventCampaigns.length > 0
      ? eventCampaigns.map((c) => ({
          name: c.name.split('–')[0].trim().slice(0, 22),
          mqls: c.mqls,
          roi: c.roi,
        }))
      : [
          { name: 'Webinar Series Q3', mqls: 63, roi: 607 },
          { name: 'Partner Summit', mqls: 28, roi: 312 },
        ];

  const upcoming = [
    {
      name: 'Partner Co-Marketing Launch Webinar',
      date: 'Oct 22',
      channel: 'Webinar',
      expectedMqls: 45,
      status: 'Planned',
    },
    {
      name: 'Asana User Conference 2026',
      date: 'Nov 5',
      channel: 'Sponsorship',
      expectedMqls: 60,
      status: 'Planned',
    },
    {
      name: 'Email Nurture Re-engagement Series',
      date: 'Oct 14',
      channel: 'Email',
      expectedMqls: 38,
      status: 'Planned',
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={14}>
          <Card
            size="small"
            title={
              <Text strong style={{ fontSize: 13 }}>
                Event & Webinar MQL Performance
              </Text>
            }
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 30, left: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={48}
                />
                <YAxis tick={{ fontSize: 10 }} width={32} />
                <Tooltip formatter={(v, n) => [v, n === 'mqls' ? 'MQLs' : n]} />
                <Bar dataKey="mqls" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            size="small"
            title={
              <Text strong style={{ fontSize: 13 }}>
                Event ROI Ranking
              </Text>
            }
            style={{ height: '100%' }}
          >
            <Space direction="vertical" size={12} style={{ width: '100%', paddingTop: 8 }}>
              {chartData.map((e, i) => (
                <div key={i}>
                  <Row justify="space-between" style={{ marginBottom: 2 }}>
                    <Text style={{ fontSize: 11 }}>{e.name}</Text>
                    <Text strong style={{ fontSize: 11, color: '#52c41a' }}>
                      {e.roi}% ROI
                    </Text>
                  </Row>
                  <Progress
                    percent={Math.min(Math.round(e.roi / 10), 100)}
                    showInfo={false}
                    strokeColor="#52c41a"
                    size="small"
                  />
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
      <Card
        size="small"
        title={
          <Text strong style={{ fontSize: 13 }}>
            Upcoming Events
          </Text>
        }
      >
        <Row gutter={[12, 12]}>
          {upcoming.map((ev, i) => (
            <Col xs={24} sm={8} key={i}>
              <div
                style={{
                  padding: '12px 14px',
                  background: '#f8faff',
                  borderRadius: 8,
                  border: '1px solid #e8eaf6',
                }}
              >
                <Tag
                  color={ev.status === 'Active' ? 'processing' : 'default'}
                  style={{ marginBottom: 6 }}
                >
                  {ev.status}
                </Tag>
                <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                  {ev.name}
                </Text>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  📅 {ev.date} · {ev.channel}
                </Text>
                <Text style={{ fontSize: 12, color: '#6366f1', display: 'block', marginTop: 4 }}>
                  ~{ev.expectedMqls} expected MQLs
                </Text>
              </div>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

/* ── Sales Velocity ── */
const SalesVelocity = () => {
  const totalSqls = CAMPAIGNS.reduce((s, c) => s + c.sqlsGen, 0);
  const totalMqls = CAMPAIGNS.reduce((s, c) => s + c.mqls, 0);
  const avgDeal = Math.round(CAMPAIGNS.reduce((s, c) => s + c.avgDeal * c.sqlsGen, 0) / totalSqls);
  const avgWinRate = Math.round(
    CAMPAIGNS.reduce((s, c) => s + c.winRate * c.sqlsGen, 0) / totalSqls
  );
  const wonDeals = Math.round(totalSqls * (avgWinRate / 100));
  const dailyVelocity = Math.round((totalSqls * (avgWinRate / 100) * avgDeal) / 274);

  const velKpis = [
    { label: 'Avg Deal Size', value: fmtK(avgDeal), color: '#6366f1', sub: 'weighted by SQLs' },
    { label: 'Total SQLs', value: totalSqls, color: '#06b6d4', sub: 'FY2026 YTD' },
    { label: 'Avg Win Rate', value: `${avgWinRate}%`, color: '#52c41a', sub: 'across campaigns' },
    { label: 'Daily Velocity', value: fmtK(dailyVelocity), color: '#f59e0b', sub: 'est. per day' },
  ];

  const funnelData = [
    { stage: 'MQLs Generated', value: totalMqls, color: '#6366f1' },
    { stage: 'SQLs Qualified', value: totalSqls, color: '#8b5cf6' },
    { stage: 'Deals Won (est.)', value: wonDeals, color: '#52c41a' },
  ];

  const typeData = Object.values(
    CAMPAIGNS.reduce((acc, c) => {
      if (!acc[c.type]) acc[c.type] = { type: c.type, pipeline: 0 };
      acc[c.type].pipeline += c.pipeline;
      return acc;
    }, {})
  );

  return (
    <div>
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {velKpis.map((k) => (
          <Col xs={12} sm={6} key={k.label}>
            <Card
              size="small"
              style={{ borderTop: `3px solid ${k.color}`, textAlign: 'center' }}
              styles={{ body: { padding: '12px 8px' } }}
            >
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: k.color,
                  display: 'block',
                  lineHeight: 1.2,
                }}
              >
                {k.value}
              </Text>
              <Text strong style={{ fontSize: 11, display: 'block', marginTop: 2 }}>
                {k.label}
              </Text>
              <Text type="secondary" style={{ fontSize: 10 }}>
                {k.sub}
              </Text>
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <Card
            size="small"
            title={
              <Text strong style={{ fontSize: 13 }}>
                Conversion Funnel
              </Text>
            }
          >
            <Space direction="vertical" size={14} style={{ width: '100%', paddingTop: 8 }}>
              {funnelData.map((f, i) => {
                const pct = Math.round((f.value / funnelData[0].value) * 100);
                return (
                  <div key={i}>
                    <Row justify="space-between" style={{ marginBottom: 4 }}>
                      <Text style={{ fontSize: 12, fontWeight: 600 }}>{f.stage}</Text>
                      <Text strong style={{ fontSize: 13, color: f.color }}>
                        {f.value.toLocaleString()}
                      </Text>
                    </Row>
                    <Progress
                      percent={pct}
                      showInfo={false}
                      strokeColor={f.color}
                      strokeWidth={12}
                    />
                  </div>
                );
              })}
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card
            size="small"
            title={
              <Text strong style={{ fontSize: 13 }}>
                Pipeline by Campaign Type
              </Text>
            }
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={typeData}
                layout="vertical"
                margin={{ top: 0, right: 12, bottom: 0, left: 8 }}
              >
                <XAxis
                  type="number"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
                />
                <YAxis dataKey="type" type="category" tick={{ fontSize: 11 }} width={90} />
                <Tooltip formatter={(v) => [fmtK(v), 'Pipeline']} />
                <Bar dataKey="pipeline" radius={[0, 4, 4, 0]}>
                  {typeData.map((_, i) => {
                    const cols = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f97316'];
                    return <Cell key={i} fill={cols[i % cols.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

/* ── Customer Health ── */
const CustomerHealth = () => {
  const healthData = [
    { name: 'Healthy', value: 63, color: '#52c41a' },
    { name: 'At Risk', value: 22, color: '#faad14' },
    { name: 'Churned', value: 15, color: '#ff4d4f' },
  ];

  const segments = [
    { name: 'Enterprise (>500 seats)', healthy: 71, atRisk: 18, churned: 11 },
    { name: 'Mid-Market (50–500)', healthy: 65, atRisk: 22, churned: 13 },
    { name: 'SMB (<50 seats)', healthy: 54, atRisk: 27, churned: 19 },
  ];

  const atRisk = [
    {
      account: 'Acme Corp',
      seats: 240,
      arr: '$72K',
      risk: 'Contract expiry 30d',
      color: '#ff4d4f',
    },
    {
      account: 'TechBridge Inc',
      seats: 88,
      arr: '$31K',
      risk: 'Low adoption (<40%)',
      color: '#faad14',
    },
    {
      account: 'Northfield Group',
      seats: 155,
      arr: '$48K',
      risk: 'Executive sponsor left',
      color: '#ff4d4f',
    },
    {
      account: 'Sunrise Media',
      seats: 52,
      arr: '$19K',
      risk: 'No QBR in 90 days',
      color: '#faad14',
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={10}>
          <Card
            size="small"
            title={
              <Text strong style={{ fontSize: 13 }}>
                Health Distribution
              </Text>
            }
          >
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={healthData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  label={({ name, value }) => `${name} ${value}%`}
                >
                  {healthData.map((e) => (
                    <Cell key={e.name} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`, 'Accounts']} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} sm={14}>
          <Card
            size="small"
            title={
              <Text strong style={{ fontSize: 13 }}>
                Health by Segment
              </Text>
            }
            style={{ height: '100%' }}
          >
            <Space direction="vertical" size={14} style={{ width: '100%', paddingTop: 8 }}>
              {segments.map((seg) => (
                <div key={seg.name}>
                  <Text
                    style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}
                  >
                    {seg.name}
                  </Text>
                  <div
                    style={{
                      display: 'flex',
                      height: 16,
                      borderRadius: 8,
                      overflow: 'hidden',
                      gap: 2,
                    }}
                  >
                    <div
                      style={{
                        width: `${seg.healthy}%`,
                        background: '#52c41a',
                        borderRadius: '8px 0 0 8px',
                      }}
                      title={`Healthy ${seg.healthy}%`}
                    />
                    <div
                      style={{ width: `${seg.atRisk}%`, background: '#faad14' }}
                      title={`At Risk ${seg.atRisk}%`}
                    />
                    <div
                      style={{
                        width: `${seg.churned}%`,
                        background: '#ff4d4f',
                        borderRadius: '0 8px 8px 0',
                      }}
                      title={`Churned ${seg.churned}%`}
                    />
                  </div>
                  <Text type="secondary" style={{ fontSize: 10, marginTop: 2, display: 'block' }}>
                    {seg.healthy}% healthy · {seg.atRisk}% at risk · {seg.churned}% churned
                  </Text>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
      <Card
        size="small"
        title={
          <Text strong style={{ fontSize: 13 }}>
            At-Risk Register
          </Text>
        }
      >
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          {atRisk.map((r, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 6,
                border: `1px solid ${r.color}30`,
                background: `${r.color}08`,
              }}
            >
              <Space size={12}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: r.color,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <Text strong style={{ fontSize: 12 }}>
                    {r.account}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                    {r.risk}
                  </Text>
                </div>
              </Space>
              <Space size={16}>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {r.seats} seats
                </Text>
                <Tag color={r.color === '#ff4d4f' ? 'error' : 'warning'} style={{ fontSize: 10 }}>
                  {r.arr} ARR
                </Tag>
              </Space>
            </div>
          ))}
        </Space>
      </Card>
    </div>
  );
};

/* ── Cadence Planner ── */
const CadencePlanner = () => {
  const d = CAMP_MONTHLY.M;
  const spendData = d.labels.map((label, i) => ({ label, spend: d.spend[i] }));
  const maxSpend = Math.max(...d.spend);

  const upcoming = CAMPAIGNS.filter((c) => c.status === 'Active' || c.status === 'Planned').map(
    (c) => ({
      ...c,
      period:
        c.quarter === 'Q4'
          ? 'Oct – Dec 2026'
          : c.quarter === 'Q3'
            ? 'Jul – Sep 2026'
            : 'Jan – Jun 2026',
    })
  );

  return (
    <div>
      <Card
        size="small"
        title={
          <Text strong style={{ fontSize: 13 }}>
            Monthly Campaign Spend
          </Text>
        }
        extra={
          <Text type="secondary" style={{ fontSize: 11 }}>
            FY2026 · Total {fmtK(d.spend.reduce((a, b) => a + b, 0))}
          </Text>
        }
        style={{ marginBottom: 16 }}
      >
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={spendData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
              width={44}
            />
            <Tooltip formatter={(v) => [fmtK(v), 'Spend']} />
            <Bar dataKey="spend" radius={[4, 4, 0, 0]}>
              {spendData.map((entry, i) => {
                const intensity = entry.spend / maxSpend;
                const alpha = Math.round(40 + intensity * 215)
                  .toString(16)
                  .padStart(2, '0');
                return <Cell key={i} fill={`#6366f1${alpha}`} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card
        size="small"
        title={
          <Text strong style={{ fontSize: 13 }}>
            Active & Planned Campaigns
          </Text>
        }
      >
        <Row gutter={[12, 12]}>
          {upcoming.map((c) => (
            <Col xs={24} sm={12} lg={8} key={c.gid}>
              <div
                style={{
                  padding: '12px 14px',
                  background: '#f8faff',
                  borderRadius: 8,
                  border: '1px solid #e8eaf6',
                }}
              >
                <Row justify="space-between" align="middle" style={{ marginBottom: 6 }}>
                  <Tag
                    color={c.status === 'Active' ? 'processing' : 'default'}
                    style={{ fontSize: 10 }}
                  >
                    {c.status}
                  </Tag>
                  <Text type="secondary" style={{ fontSize: 10 }}>
                    {c.quarter}
                  </Text>
                </Row>
                <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                  {c.name}
                </Text>
                <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
                  {c.channel} · {c.period}
                </Text>
                <Space size={12}>
                  <Text style={{ fontSize: 11 }}>
                    Budget: <b>{fmtK(c.budget)}</b>
                  </Text>
                  <Text style={{ fontSize: 11 }}>
                    MQLs: <b>{c.mqls}</b>
                  </Text>
                </Space>
              </div>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

/* ── Tabs map ── */
const SECTION_COMPONENTS = {
  brief: MondayBrief,
  pulse: PortfolioPulse,
  attribution: Attribution,
  matrix: PerfMatrix,
  channel: ChannelScorecard,
  events: EventIntel,
  velocity: SalesVelocity,
  funnel: RevenueFunnel,
  lifecycle: CustomerHealth,
  cadence: CadencePlanner,
};

const SectionRenderer = ({ sectionKey }) => {
  const Component = SECTION_COMPONENTS[sectionKey];
  if (!Component) return null;
  return <Component />;
};

const Marketing = () => {
  const [activeSection, setActiveSection] = useState('pulse');

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={4} style={{ marginBottom: 4 }}>
            Marketing Campaigns — FY2026
          </Title>
          <Text type="secondary">11 campaigns · $471K budget · $7.24M pipeline influenced</Text>
        </Col>
      </Row>

      <Tabs
        activeKey={activeSection}
        onChange={setActiveSection}
        items={MKT_SECTIONS.map((s) => ({
          key: s.key,
          label: (
            <Space size={4}>
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </Space>
          ),
        }))}
        tabBarStyle={{ marginBottom: 16 }}
      />

      <SectionRenderer sectionKey={activeSection} />
    </div>
  );
};

export default Marketing;

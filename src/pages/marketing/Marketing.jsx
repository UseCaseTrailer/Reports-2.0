import { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Tabs,
  Table,
  Tag,
  Statistic,
  Space,
  Typography,
  Progress,
  Segmented,
} from 'antd';
import { RocketOutlined, DollarOutlined } from '@ant-design/icons';
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
  Legend,
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
const Attribution = () => {
  const data = ATTRIBUTION.map((r) => ({ ...r }));
  return (
    <div>
      <SectionLabel>Multi-touch Attribution</SectionLabel>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical">
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis dataKey="channel" type="category" tick={{ fontSize: 11 }} width={120} />
          <Tooltip />
          <Legend />
          <Bar dataKey="firstTouch" name="First Touch %" fill="#6366f1" />
          <Bar dataKey="lastTouch" name="Last Touch %" fill="#06b6d4" />
          <Bar dataKey="linear" name="Linear %" fill="#f59e0b" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

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

/* ── Tabs map ── */
const SECTION_COMPONENTS = {
  brief: () => (
    <Card>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Statistic
            title="Week's Highlight"
            value="LinkedIn ABM"
            suffix="leads ↑34%"
            prefix={<RocketOutlined />}
            valueStyle={{ color: '#6366f1' }}
          />
        </Col>
        <Col xs={24} md={12}>
          <Statistic
            title="Budget Pacing"
            value="87%"
            suffix="of monthly"
            prefix={<DollarOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Col>
      </Row>
      <Text type="secondary" style={{ display: 'block', marginTop: 16 }}>
        This week: Sep campaign delivered 780 MQLs (115% of annual target). LinkedIn ABM drove the
        Sep pipeline spike to $2.94M. 9 of 11 campaigns complete. Review remaining budget allocation
        before Q4 planning.
      </Text>
    </Card>
  ),
  pulse: PortfolioPulse,
  attribution: Attribution,
  matrix: PerfMatrix,
  channel: ChannelScorecard,
  events: () => (
    <Card>
      <Text type="secondary">
        Event intelligence — upcoming webinars and sponsorships. Webinar Series Q3 generated 63 MQLs
        at 31% win rate — highest of any campaign type.
      </Text>
    </Card>
  ),
  velocity: () => (
    <Card>
      <Text type="secondary">
        Sales velocity metrics and pipeline acceleration data. Average deal size: $8,795. Pipeline
        coverage: 3.2x quota.
      </Text>
    </Card>
  ),
  funnel: RevenueFunnel,
  lifecycle: () => (
    <Card>
      <Text type="secondary">
        Customer health scores and churn risk indicators. 63% of accounts healthy, 22% at risk, 15%
        churned.
      </Text>
    </Card>
  ),
  cadence: () => (
    <Card>
      <Text type="secondary">
        Campaign cadence planner and publishing calendar. Next campaigns: Partner Co-Marketing (Q4),
        Email Nurture Re-engagement (Q3).
      </Text>
    </Card>
  ),
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

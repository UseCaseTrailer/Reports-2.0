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
import {
  RocketOutlined,
  RiseOutlined,
  DollarOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import SectionLabel from '../../components/SectionLabel';
import {
  CAMPAIGNS,
  CAMP_MONTHLY,
  ATTRIBUTION,
  CHANNEL_SCORECARD,
  FUNNEL_STAGES,
  MKT_SECTIONS,
} from '../../data/marketingData';

const { Title, Text } = Typography;

const fmtK = (v) => (v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`);

/* ── Portfolio Pulse ── */
const PortfolioPulse = () => {
  const [period, setPeriod] = useState('M');
  const d = CAMP_MONTHLY[period];
  const chartData = d.labels.map((label, i) => ({
    label,
    MQL: d.mql[i],
    Target: d.target[i],
    Pipeline: Math.round(d.pipeline[i] / 1000),
  }));

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Statistic title="FY26 Pipeline" value="$6.48M" prefix={<DollarOutlined />} valueStyle={{ color: '#6366f1' }} />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic title="Total MQLs" value={1188} prefix={<TeamOutlined />} />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic title="Avg ROI" value="651%" prefix={<RiseOutlined />} valueStyle={{ color: '#52c41a' }} />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic title="Active Campaigns" value={4} prefix={<RocketOutlined />} />
        </Col>
      </Row>
      <Segmented
        options={[
          { label: 'Monthly', value: 'M' },
          { label: 'Quarterly', value: 'Q' },
          { label: 'H1/H2', value: 'H' },
        ]}
        value={period}
        onChange={setPeriod}
        style={{ marginBottom: 16 }}
      />
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData}>
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="MQL" stroke="#6366f1" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Target" stroke="#d1d5db" strokeWidth={1} strokeDasharray="4 4" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

/* ── Attribution ── */
const Attribution = () => {
  const data = ATTRIBUTION.map((r) => ({ ...r, channel: r.channel }));
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
    {
      title: 'CPL',
      dataIndex: 'cpl',
      key: 'cpl',
      render: (v) => `$${v}`,
      responsive: ['md'],
    },
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
      render: (v) => (
        <Tag color={v >= 10 ? 'success' : v >= 7 ? 'warning' : 'error'}>{v}x</Tag>
      ),
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
  return <Table columns={cols} dataSource={CHANNEL_SCORECARD.map((r, i) => ({ ...r, key: i }))} pagination={false} size="small" />;
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
        const map = { Active: 'processing', Complete: 'success', Planned: 'default', 'In Review': 'warning' };
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
    {
      title: 'Pipeline',
      dataIndex: 'pipeline',
      key: 'pipeline',
      render: (v) => fmtK(v),
    },
    {
      title: 'ROI',
      dataIndex: 'roi',
      key: 'roi',
      render: (v) => <Tag color="success">{v}%</Tag>,
    },
    {
      title: 'MQLs',
      dataIndex: 'mqls',
      key: 'mqls',
      responsive: ['lg'],
    },
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
      <Text type="secondary">Monday brief content — pull from latest campaign updates and key metrics.</Text>
    </Card>
  ),
  pulse: PortfolioPulse,
  attribution: Attribution,
  matrix: PerfMatrix,
  channel: ChannelScorecard,
  events: () => <Card><Text type="secondary">Event intelligence — upcoming webinars and sponsorships.</Text></Card>,
  velocity: () => <Card><Text type="secondary">Sales velocity metrics and pipeline acceleration data.</Text></Card>,
  funnel: RevenueFunnel,
  lifecycle: () => <Card><Text type="secondary">Customer health scores and churn risk indicators.</Text></Card>,
  cadence: () => <Card><Text type="secondary">Campaign cadence planner and publishing calendar.</Text></Card>,
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
            Marketing Analytics
          </Title>
          <Text type="secondary">FY2026 Campaigns · 10 intelligence sections</Text>
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

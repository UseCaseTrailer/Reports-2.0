import { useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Card,
  Col,
  Row,
  Skeleton,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import {
  BarChartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  RiseOutlined,
  TrophyOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import SectionLabel from '../../components/SectionLabel';

const { Title, Text } = Typography;

/* ── Vertical label shorthands for charts ── */
const VERTICAL_SHORT = {
  'Healthcare & Life Sciences': 'Healthcare',
  'Technology & SaaS': 'Technology',
  'Manufacturing & Industrial': 'Manufacturing',
  'Financial Services': 'Financial',
  'Real Estate & Energy': 'Real Estate',
  'Food, Hospitality & Retail': 'Food & Retail',
  'Professional Services & Operations': 'Professional',
};

const STATUS_CFG = {
  green: { label: 'On Track', color: '#52c41a', tag: 'success' },
  yellow: { label: 'At Risk', color: '#faad14', tag: 'warning' },
  red: { label: 'Off Track', color: '#ff4d4f', tag: 'error' },
  blue: { label: 'In Progress', color: '#6366f1', tag: 'processing' },
};

/* ── Vertical summary card ── */
const VerticalMiniCard = ({ vertical }) => {
  const withStatus = vertical.items.filter((i) => i.hasStatus).length;
  return (
    <Card
      size="small"
      style={{ borderLeft: `4px solid ${vertical.color}` }}
      styles={{ body: { padding: '10px 14px' } }}
    >
      <Space direction="vertical" size={2} style={{ width: '100%' }}>
        <Text strong style={{ fontSize: 12, color: vertical.color }}>
          {VERTICAL_SHORT[vertical.label] ?? vertical.label}
        </Text>
        <Row justify="space-between" align="bottom">
          <Text style={{ fontSize: 24, fontWeight: 800, color: vertical.color, lineHeight: 1.1 }}>
            {vertical.items.length}
          </Text>
          <Space direction="vertical" size={0} align="end">
            <Text type="secondary" style={{ fontSize: 10 }}>
              {vertical.items.filter((i) => i.type === 'portfolio').length} portfolios
            </Text>
            <Text type="secondary" style={{ fontSize: 10 }}>
              {withStatus} with status
            </Text>
          </Space>
        </Row>
      </Space>
    </Card>
  );
};

/* ── Recent activity columns ── */
const activityCols = [
  {
    title: 'Project',
    dataIndex: 'name',
    key: 'name',
    render: (text, r) => (
      <Space size={6}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: r.colorHex,
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
        <Text style={{ fontSize: 12 }}>{text}</Text>
      </Space>
    ),
  },
  {
    title: 'Vertical',
    dataIndex: 'vertical',
    key: 'vertical',
    responsive: ['md'],
    render: (v) => <Tag style={{ fontSize: 10, lineHeight: '16px' }}>{VERTICAL_SHORT[v] ?? v}</Tag>,
  },
  {
    title: 'Status',
    dataIndex: 'statusColor',
    key: 'statusColor',
    render: (sc) => {
      const cfg = STATUS_CFG[sc];
      if (!cfg) return <Tag style={{ fontSize: 10 }}>Unknown</Tag>;
      return (
        <Tag color={cfg.tag} style={{ fontSize: 10, lineHeight: '16px' }}>
          {cfg.label}
        </Tag>
      );
    },
  },
  {
    title: 'Latest Update',
    dataIndex: 'statusExcerpt',
    key: 'statusExcerpt',
    responsive: ['lg'],
    render: (text) => (
      <Text type="secondary" style={{ fontSize: 11 }} ellipsis={{ tooltip: text }}>
        {text || '—'}
      </Text>
    ),
  },
  {
    title: 'Updated',
    dataIndex: 'statusUpdatedAt',
    key: 'statusUpdatedAt',
    responsive: ['xl'],
    render: (d) =>
      d ? (
        <Text type="secondary" style={{ fontSize: 10 }}>
          {new Date(d).toLocaleDateString()}
        </Text>
      ) : (
        '—'
      ),
  },
];

/* ── Main component ── */
const PMO = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/solutions')
      .then((r) => {
        if (!r.ok) throw new Error(`Asana API error ${r.status}`);
        return r.json();
      })
      .then((json) => {
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetryCount((c) => c + 1);
  };

  /* Derived metrics */
  const allItems = data?.verticals?.flatMap((v) => v.items) ?? [];
  const withStatus = allItems.filter((i) => i.hasStatus);
  const redItems = allItems.filter((i) => i.statusColor === 'red');
  const yellowItems = allItems.filter((i) => i.statusColor === 'yellow');

  const verticalChartData = (data?.verticals ?? []).map((v) => ({
    name: VERTICAL_SHORT[v.label] ?? v.label.slice(0, 13),
    fullName: v.label,
    count: v.items.length,
    color: v.color,
  }));

  const statusPieData = [
    {
      name: 'On Track',
      value: withStatus.filter((i) => i.statusColor === 'green').length,
      color: '#52c41a',
    },
    { name: 'At Risk', value: yellowItems.length, color: '#faad14' },
    { name: 'Off Track', value: redItems.length, color: '#ff4d4f' },
    { name: 'No Update', value: allItems.length - withStatus.length, color: '#d1d5db' },
  ].filter((d) => d.value > 0);

  const recentActivity = [...withStatus]
    .sort((a, b) => (b.statusUpdatedAt || '').localeCompare(a.statusUpdatedAt || ''))
    .slice(0, 10);

  return (
    <div>
      {/* ── Header ── */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Title level={4} style={{ marginBottom: 4 }}>
            Executive PMO Dashboard
          </Title>
          <Text type="secondary">
            {loading && 'Loading from Asana…'}
            {error && 'Could not reach Asana'}
            {data &&
              `Solutions Repository · ${data.total} use cases · ${data.verticals?.length ?? 0} industry verticals`}
          </Text>
        </Col>
        {data && (
          <Col>
            <Text type="secondary" style={{ fontSize: 11 }}>
              Updated{' '}
              {new Date(data.fetchedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </Col>
        )}
      </Row>

      {/* ── Error banner ── */}
      {error && (
        <Alert
          type="error"
          message="Could not load Asana data"
          description={`${error} — check that ASANA_PAT is set in Vercel environment variables.`}
          showIcon
          action={
            <Text
              style={{ fontSize: 12, color: '#6366f1', cursor: 'pointer' }}
              onClick={handleRetry}
            >
              <ReloadOutlined /> Retry
            </Text>
          }
          style={{ marginBottom: 16 }}
        />
      )}

      {/* ── Loading ── */}
      {loading && (
        <Row gutter={[16, 16]}>
          {[...Array(4)].map((_, i) => (
            <Col xs={24} sm={12} lg={6} key={i}>
              <Card>
                <Skeleton active paragraph={false} />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* ── Live data ── */}
      {!loading && data && (
        <>
          {/* Off-track alert */}
          {redItems.length > 0 && (
            <Alert
              type="error"
              showIcon
              icon={<WarningOutlined />}
              message={`${redItems.length} item${redItems.length > 1 ? 's' : ''} flagged Off Track`}
              description={redItems.map((i) => i.name).join(' · ')}
              style={{ marginBottom: 16 }}
            />
          )}

          {/* KPI tiles */}
          <SectionLabel style={{ marginTop: 0 }}>Portfolio Overview</SectionLabel>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={6}>
              <Card hoverable style={{ borderTop: '3px solid #6366f1' }}>
                <Statistic
                  title="Total Use Cases"
                  value={data.total}
                  prefix={<TrophyOutlined style={{ color: '#6366f1' }} />}
                  valueStyle={{ color: '#6366f1' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card hoverable style={{ borderTop: '3px solid #06b6d4' }}>
                <Statistic
                  title="Industry Verticals"
                  value={data.verticals?.length ?? 0}
                  prefix={<RiseOutlined style={{ color: '#06b6d4' }} />}
                  valueStyle={{ color: '#06b6d4' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card hoverable style={{ borderTop: '3px solid #52c41a' }}>
                <Statistic
                  title="With Status Update"
                  value={withStatus.length}
                  prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card
                hoverable
                style={{ borderTop: `3px solid ${redItems.length > 0 ? '#ff4d4f' : '#faad14'}` }}
              >
                <Statistic
                  title="Flagged (Risk/Off Track)"
                  value={redItems.length + yellowItems.length}
                  prefix={
                    <WarningOutlined
                      style={{ color: redItems.length > 0 ? '#ff4d4f' : '#faad14' }}
                    />
                  }
                  valueStyle={{ color: redItems.length > 0 ? '#ff4d4f' : '#faad14' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Charts row */}
          <SectionLabel>
            <BarChartOutlined style={{ marginRight: 6 }} />
            Portfolio Analytics
          </SectionLabel>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={15}>
              <Card
                size="small"
                title={
                  <Text strong style={{ fontSize: 13 }}>
                    Use Cases by Industry Vertical
                  </Text>
                }
              >
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={verticalChartData}
                    margin={{ top: 5, right: 10, bottom: 48, left: 0 }}
                  >
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={54}
                    />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(value, _, props) => [
                        `${value} use cases`,
                        props.payload.fullName,
                      ]}
                    />
                    <Bar dataKey="count" name="Use Cases" radius={[4, 4, 0, 0]}>
                      {verticalChartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={9}>
              <Card
                size="small"
                title={
                  <Text strong style={{ fontSize: 13 }}>
                    Status Distribution
                  </Text>
                }
                extra={
                  <Badge
                    count={withStatus.length}
                    style={{ backgroundColor: '#6366f1' }}
                    overflowCount={99}
                  />
                }
                style={{ height: '100%' }}
              >
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="48%"
                      outerRadius={78}
                      dataKey="value"
                      label={({ value }) => `${value}`}
                      labelLine={true}
                    >
                      {statusPieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} use cases`, name]} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          {/* Vertical mini-cards */}
          <SectionLabel>Use Cases by Vertical</SectionLabel>
          <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
            {(data.verticals ?? []).map((v) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={v.label}>
                <VerticalMiniCard vertical={v} />
              </Col>
            ))}
          </Row>

          {/* Recent activity */}
          {recentActivity.length > 0 && (
            <>
              <SectionLabel>
                <ClockCircleOutlined style={{ marginRight: 6 }} />
                Recent Activity — Items with Status Updates
              </SectionLabel>
              <Card>
                <Table
                  columns={activityCols}
                  dataSource={recentActivity.map((i) => ({ ...i, key: i.gid }))}
                  pagination={false}
                  size="small"
                  scroll={{ x: 500 }}
                />
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default PMO;

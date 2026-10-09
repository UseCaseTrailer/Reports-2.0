import { useEffect, useState } from 'react';
import { Alert, Card, Col, Row, Skeleton, Space, Tag, Typography } from 'antd';
import { ReloadOutlined, TrophyOutlined, WarningOutlined } from '@ant-design/icons';
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
  green: { label: 'On Track', tag: 'success' },
  yellow: { label: 'At Risk', tag: 'warning' },
  red: { label: 'Off Track', tag: 'error' },
  blue: { label: 'In Progress', tag: 'processing' },
};

/* ── Per-vertical portfolio card ── */
const VerticalCard = ({ vertical }) => {
  const withStatus = vertical.items.filter((i) => i.hasStatus);
  const redCount = vertical.items.filter((i) => i.statusColor === 'red').length;
  const yellowCount = vertical.items.filter((i) => i.statusColor === 'yellow').length;
  const portfolioCount = vertical.items.filter((i) => i.type === 'portfolio').length;

  return (
    <Card
      size="small"
      style={{ height: '100%', borderTop: `4px solid ${vertical.color}` }}
      title={
        <Space>
          <TrophyOutlined style={{ color: vertical.color }} />
          <Text strong style={{ fontSize: 13 }}>
            {VERTICAL_SHORT[vertical.label] ?? vertical.label}
          </Text>
        </Space>
      }
      extra={
        redCount > 0 ? (
          <Tag color="error" style={{ fontSize: 10 }}>
            <WarningOutlined /> {redCount} off track
          </Tag>
        ) : yellowCount > 0 ? (
          <Tag color="warning" style={{ fontSize: 10 }}>
            {yellowCount} at risk
          </Tag>
        ) : (
          <Tag color="success" style={{ fontSize: 10 }}>
            Healthy
          </Tag>
        )
      }
    >
      {/* Counts */}
      <Row gutter={[8, 4]} style={{ marginBottom: 12 }}>
        <Col span={8} style={{ textAlign: 'center' }}>
          <Text style={{ fontSize: 28, fontWeight: 800, color: vertical.color, display: 'block' }}>
            {vertical.items.length}
          </Text>
          <Text type="secondary" style={{ fontSize: 10 }}>
            Use Cases
          </Text>
        </Col>
        <Col span={8} style={{ textAlign: 'center' }}>
          <Text style={{ fontSize: 28, fontWeight: 800, color: '#52c41a', display: 'block' }}>
            {withStatus.length}
          </Text>
          <Text type="secondary" style={{ fontSize: 10 }}>
            With Status
          </Text>
        </Col>
        <Col span={8} style={{ textAlign: 'center' }}>
          <Text style={{ fontSize: 28, fontWeight: 800, color: '#6366f1', display: 'block' }}>
            {portfolioCount}
          </Text>
          <Text type="secondary" style={{ fontSize: 10 }}>
            Portfolios
          </Text>
        </Col>
      </Row>

      {/* Status items preview */}
      <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 8 }}>
        {withStatus.slice(0, 4).map((item) => {
          const sc = STATUS_CFG[item.statusColor];
          return (
            <div
              key={item.gid}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '3px 0',
                borderBottom: '1px solid #f5f5f5',
                gap: 8,
              }}
            >
              <Space size={4} style={{ minWidth: 0 }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: item.colorHex,
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                <Text style={{ fontSize: 11 }} ellipsis={{ tooltip: item.name }}>
                  {item.name}
                </Text>
              </Space>
              {sc && (
                <Tag
                  color={sc.tag}
                  style={{ fontSize: 9, lineHeight: '14px', padding: '0 4px', flexShrink: 0 }}
                >
                  {sc.label}
                </Tag>
              )}
            </div>
          );
        })}

        {vertical.items.length > withStatus.slice(0, 4).length && (
          <Text type="secondary" style={{ fontSize: 10, marginTop: 6, display: 'block' }}>
            +{vertical.items.length - withStatus.slice(0, 4).length} more items
          </Text>
        )}

        {withStatus.length === 0 && (
          <Text type="secondary" style={{ fontSize: 11 }}>
            No status updates yet
          </Text>
        )}
      </div>
    </Card>
  );
};

/* ── Main component ── */
const Portfolios = () => {
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

  /* Derived */
  const allItems = data?.verticals?.flatMap((v) => v.items) ?? [];
  const withStatus = allItems.filter((i) => i.hasStatus);

  const verticalChartData = (data?.verticals ?? []).map((v) => ({
    name: VERTICAL_SHORT[v.label] ?? v.label.slice(0, 12),
    Total: v.items.length,
    'With Status': v.items.filter((i) => i.hasStatus).length,
    color: v.color,
  }));

  const statusPieData = [
    {
      name: 'On Track',
      value: withStatus.filter((i) => i.statusColor === 'green').length,
      color: '#52c41a',
    },
    {
      name: 'At Risk',
      value: withStatus.filter((i) => i.statusColor === 'yellow').length,
      color: '#faad14',
    },
    {
      name: 'Off Track',
      value: withStatus.filter((i) => i.statusColor === 'red').length,
      color: '#ff4d4f',
    },
    {
      name: 'No Update',
      value: allItems.length - withStatus.length,
      color: '#d1d5db',
    },
  ].filter((d) => d.value > 0);

  return (
    <div>
      {/* ── Header ── */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={4} style={{ marginBottom: 4 }}>
            Portfolio Overview
          </Title>
          <Text type="secondary">
            {loading && 'Loading from Asana…'}
            {error && 'Could not reach Asana'}
            {data &&
              `${data.total} use cases across ${data.verticals?.length ?? 0} industry verticals`}
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

      {/* ── Error ── */}
      {error && (
        <Alert
          type="error"
          message="Could not load portfolio data"
          description={error}
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
            <Col xs={24} lg={12} key={i}>
              <Card>
                <Skeleton active paragraph={{ rows: 4 }} />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* ── Data ── */}
      {!loading && data && (
        <>
          <SectionLabel style={{ marginTop: 0 }}>Cross-Portfolio Analytics</SectionLabel>

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {/* Bar chart */}
            <Col xs={24} lg={15}>
              <Card
                size="small"
                title={
                  <Text strong style={{ fontSize: 13 }}>
                    Use Cases by Vertical
                  </Text>
                }
              >
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={verticalChartData}
                    margin={{ top: 5, right: 10, bottom: 44, left: 0 }}
                  >
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      interval={0}
                      angle={-18}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="Total" name="Total" radius={[2, 2, 0, 0]}>
                      {verticalChartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Bar>
                    <Bar
                      dataKey="With Status"
                      name="With Status"
                      fill="#6366f1"
                      radius={[2, 2, 0, 0]}
                      opacity={0.6}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            {/* Pie chart */}
            <Col xs={24} lg={9}>
              <Card
                size="small"
                title={
                  <Text strong style={{ fontSize: 13 }}>
                    Portfolio Status Mix
                  </Text>
                }
                style={{ height: '100%' }}
              >
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="48%"
                      outerRadius={74}
                      dataKey="value"
                      label={({ value }) => `${value}`}
                      labelLine={true}
                    >
                      {statusPieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value}`, name]} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          <SectionLabel>Industry Vertical Portfolios</SectionLabel>

          <Row gutter={[16, 16]}>
            {(data.verticals ?? []).map((v) => (
              <Col xs={24} lg={12} key={v.label}>
                <VerticalCard vertical={v} />
              </Col>
            ))}
          </Row>
        </>
      )}
    </div>
  );
};

export default Portfolios;

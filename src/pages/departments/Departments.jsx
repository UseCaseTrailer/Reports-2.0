import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Card,
  Col,
  Empty,
  Progress,
  Row,
  Skeleton,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import { LinkOutlined, ReloadOutlined } from '@ant-design/icons';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const { Title, Text, Paragraph } = Typography;

/* ── Slug ↔ vertical label maps (must match api/solutions.js VERTICAL_ORDER) ── */
const SLUG_TO_LABEL = {
  healthcare: 'Healthcare & Life Sciences',
  technology: 'Technology & SaaS',
  manufacturing: 'Manufacturing & Industrial',
  financial: 'Financial Services',
  realestate: 'Real Estate & Energy',
  food: 'Food, Hospitality & Retail',
  professional: 'Professional Services & Operations',
};

const LABEL_TO_SLUG = Object.fromEntries(
  Object.entries(SLUG_TO_LABEL).map(([slug, label]) => [label, slug])
);

/* Short labels for nav pills */
const SHORT_LABEL = {
  healthcare: 'Healthcare',
  technology: 'Technology',
  manufacturing: 'Manufacturing',
  financial: 'Financial',
  realestate: 'Real Estate',
  food: 'Food & Retail',
  professional: 'Professional',
};

const STATUS_CFG = {
  green: { label: 'On Track', tag: 'success' },
  yellow: { label: 'At Risk', tag: 'warning' },
  red: { label: 'Off Track', tag: 'error' },
  blue: { label: 'In Progress', tag: 'processing' },
};

/* ── Portfolio expand (in-app drill-down) ── */
const PortfolioExpand = ({ portfolioGid, portfolioColor }) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = () => {
    if (items !== null) {
      setOpen((o) => !o);
      return;
    }
    setOpen(true);
    setLoading(true);
    fetch(`/api/portfolio-items?gid=${portfolioGid}`)
      .then((r) => {
        if (!r.ok) throw new Error(`API ${r.status}`);
        return r.json();
      })
      .then((json) => {
        setItems(json.items || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  return (
    <div style={{ marginTop: 6 }}>
      <button
        onClick={load}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          padding: '3px 10px',
          border: `1px solid ${portfolioColor}40`,
          borderRadius: 12,
          background: `${portfolioColor}08`,
          cursor: 'pointer',
          fontSize: 11,
          color: portfolioColor,
          fontWeight: 500,
        }}
      >
        {open ? '▼' : '▶'} {open ? 'Hide' : 'View'} items
        {items !== null && (
          <span
            style={{
              fontSize: 10,
              background: `${portfolioColor}20`,
              borderRadius: 8,
              padding: '0 5px',
              lineHeight: '16px',
            }}
          >
            {items.length}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            marginTop: 8,
            paddingLeft: 12,
            borderLeft: `2px solid ${portfolioColor}40`,
          }}
        >
          {loading && <Skeleton active paragraph={{ rows: 2 }} />}
          {error && (
            <Text type="danger" style={{ fontSize: 11 }}>
              Could not load portfolio items: {error}
            </Text>
          )}
          {items && items.length === 0 && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              No items in this portfolio
            </Text>
          )}
          {items &&
            items.map((sub) => {
              const sc = STATUS_CFG[sub.statusColor] ?? null;
              return (
                <div
                  key={sub.gid}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 10px',
                    marginBottom: 4,
                    borderRadius: 6,
                    background: '#fafafa',
                    border: '1px solid #f0f0f0',
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: sub.colorHex,
                      flexShrink: 0,
                    }}
                  />
                  <Text style={{ fontSize: 12, flex: 1, minWidth: 0 }}>{sub.name}</Text>
                  {sub.type === 'portfolio' && (
                    <Tag style={{ fontSize: 9, lineHeight: '14px' }}>Portfolio</Tag>
                  )}
                  {sc && (
                    <Tag color={sc.tag} style={{ fontSize: 9, lineHeight: '14px' }}>
                      {sc.label}
                    </Tag>
                  )}
                  <a
                    href={sub.asanaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 10, color: '#6366f1', flexShrink: 0 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <LinkOutlined />
                  </a>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

/* ── Use-case card ── */
const UseCaseCard = ({ item }) => {
  const sc = STATUS_CFG[item.statusColor] ?? null;
  return (
    <Card
      size="small"
      style={{ borderLeft: `4px solid ${item.colorHex}`, marginBottom: 8 }}
      styles={{ body: { padding: '10px 14px' } }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 8,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <Space size={6} wrap>
            <span
              style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: item.colorHex,
                flexShrink: 0,
              }}
            />
            <Text strong style={{ fontSize: 13 }}>
              {item.name}
            </Text>
            {item.type === 'portfolio' && (
              <Tag style={{ fontSize: 10, lineHeight: '16px' }}>Portfolio</Tag>
            )}
            {sc && (
              <Tag color={sc.tag} style={{ fontSize: 10, lineHeight: '16px' }}>
                {sc.label}
              </Tag>
            )}
          </Space>

          {item.statusExcerpt && (
            <Paragraph
              type="secondary"
              ellipsis={{ rows: 2 }}
              style={{ fontSize: 11, marginTop: 4, marginBottom: 0, lineHeight: '1.5' }}
            >
              {item.statusExcerpt}
            </Paragraph>
          )}

          {item.type === 'portfolio' && (
            <PortfolioExpand portfolioGid={item.gid} portfolioColor={item.colorHex} />
          )}
        </div>

        <a
          href={item.asanaUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 11, color: '#6366f1', flexShrink: 0, whiteSpace: 'nowrap' }}
          onClick={(e) => e.stopPropagation()}
        >
          <LinkOutlined /> View
        </a>
      </div>
    </Card>
  );
};

/* ── Industry Analytics Panel ── */
const IndustryReport = ({ vertical }) => {
  const items = vertical.items;

  const healthCounts = items.reduce((acc, item) => {
    const h = item.health || 'Unknown';
    acc[h] = (acc[h] || 0) + 1;
    return acc;
  }, {});

  const healthData = [
    { name: 'Green', label: 'On Track', color: '#52c41a', count: healthCounts.Green || 0 },
    { name: 'Yellow', label: 'At Risk', color: '#faad14', count: healthCounts.Yellow || 0 },
    { name: 'Red', label: 'Off Track', color: '#ff4d4f', count: healthCounts.Red || 0 },
  ].filter((d) => d.count > 0);

  const hasHealthData = healthData.reduce((s, d) => s + d.count, 0) > 0;

  const withStatus = items.filter((i) => i.hasStatus).length;
  const statusPct = items.length > 0 ? Math.round((withStatus / items.length) * 100) : 0;

  const portfolios = items.filter((i) => i.type === 'portfolio').length;
  const projects = items.length - portfolios;

  if (items.length === 0) return null;

  return (
    <Card
      size="small"
      title={
        <Text strong style={{ fontSize: 13 }}>
          Industry Analytics
        </Text>
      }
      style={{ marginBottom: 16 }}
      styles={{ body: { padding: '12px 16px' } }}
    >
      <Row gutter={[16, 12]}>
        {/* Health Distribution */}
        <Col xs={24} sm={12} md={8}>
          <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
            Health Distribution
          </Text>
          {hasHealthData ? (
            <>
              <ResponsiveContainer width="100%" height={110}>
                <PieChart>
                  <Pie
                    data={healthData}
                    dataKey="count"
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={48}
                  >
                    {healthData.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 6,
                  justifyContent: 'center',
                  marginTop: 4,
                }}
              >
                {healthData.map((d) => (
                  <Space size={3} key={d.name}>
                    <div
                      style={{ width: 6, height: 6, borderRadius: '50%', background: d.color }}
                    />
                    <Text style={{ fontSize: 10 }}>
                      {d.label}: {d.count}
                    </Text>
                  </Space>
                ))}
              </div>
            </>
          ) : (
            <Text
              type="secondary"
              style={{ fontSize: 11, display: 'block', textAlign: 'center', padding: '16px 0' }}
            >
              Health fields not populated in Asana
            </Text>
          )}
        </Col>

        {/* Status Coverage */}
        <Col xs={24} sm={12} md={8}>
          <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
            Status Coverage
          </Text>
          <div style={{ textAlign: 'center', padding: '4px 0' }}>
            <Text
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: statusPct >= 70 ? '#52c41a' : statusPct >= 40 ? '#faad14' : '#ff4d4f',
                lineHeight: 1.1,
                display: 'block',
              }}
            >
              {statusPct}%
            </Text>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 10 }}>
              {withStatus} of {items.length} items updated
            </Text>
            <Progress
              percent={statusPct}
              showInfo={false}
              strokeColor={statusPct >= 70 ? '#52c41a' : statusPct >= 40 ? '#faad14' : '#ff4d4f'}
            />
          </div>
        </Col>

        {/* Item Types */}
        <Col xs={24} sm={24} md={8}>
          <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
            Item Types
          </Text>
          {[
            {
              label: 'Use Cases / Projects',
              count: projects,
              color: vertical.color,
              pct: items.length ? Math.round((projects / items.length) * 100) : 0,
            },
            {
              label: 'Sub-Portfolios',
              count: portfolios,
              color: '#6366f1',
              pct: items.length ? Math.round((portfolios / items.length) * 100) : 0,
            },
          ].map((row) => (
            <div key={row.label} style={{ marginBottom: 10 }}>
              <Row justify="space-between" style={{ marginBottom: 3 }}>
                <Space size={4}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: row.color,
                    }}
                  />
                  <Text style={{ fontSize: 11 }}>{row.label}</Text>
                </Space>
                <Text strong style={{ fontSize: 12, color: row.color }}>
                  {row.count}
                </Text>
              </Row>
              <Progress
                percent={row.pct}
                showInfo={false}
                strokeColor={row.color}
                size={[undefined, 6]}
                style={{ margin: 0 }}
              />
            </div>
          ))}
          <Text type="secondary" style={{ fontSize: 10, display: 'block', marginTop: 4 }}>
            {items.length} total items in this vertical
          </Text>
        </Col>
      </Row>
    </Card>
  );
};

/* ── Summary tiles above the card list ── */
const VerticalSummary = ({ vertical }) => {
  const total = vertical.items.length;
  const withStatus = vertical.items.filter((i) => i.hasStatus).length;
  const portfolios = vertical.items.filter((i) => i.type === 'portfolio').length;

  return (
    <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
      <Col xs={8}>
        <Card size="small" style={{ borderTop: `3px solid ${vertical.color}` }}>
          <Statistic
            title={<Text style={{ fontSize: 11 }}>Use Cases</Text>}
            value={total}
            valueStyle={{ fontSize: 22, color: vertical.color }}
          />
        </Card>
      </Col>
      <Col xs={8}>
        <Card size="small" style={{ borderTop: '3px solid #52c41a' }}>
          <Statistic
            title={<Text style={{ fontSize: 11 }}>With Status</Text>}
            value={withStatus}
            valueStyle={{ fontSize: 22, color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={8}>
        <Card size="small" style={{ borderTop: '3px solid #6366f1' }}>
          <Statistic
            title={<Text style={{ fontSize: 11 }}>Sub-Portfolios</Text>}
            value={portfolios}
            valueStyle={{ fontSize: 22, color: '#6366f1' }}
          />
        </Card>
      </Col>
    </Row>
  );
};

/* ── Loading skeleton ── */
const LoadingSkeleton = () => (
  <div>
    <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
      {[...Array(3)].map((_, i) => (
        <Col xs={8} key={i}>
          <Card size="small">
            <Skeleton active paragraph={false} />
          </Card>
        </Col>
      ))}
    </Row>
    {[...Array(7)].map((_, i) => (
      <Card key={i} size="small" style={{ marginBottom: 8 }}>
        <Skeleton active paragraph={{ rows: 1 }} />
      </Card>
    ))}
  </div>
);

/* ── Main component ── */
const Departments = () => {
  const { vertical: slug } = useParams();
  const navigate = useNavigate();
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

  const activeSlug = slug ?? 'healthcare';
  const activeLabel = SLUG_TO_LABEL[activeSlug] ?? SLUG_TO_LABEL.healthcare;
  const activeVertical = data?.verticals?.find((v) => v.label === activeLabel) ?? null;

  return (
    <div>
      {/* ── Header ── */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Title level={4} style={{ marginBottom: 4 }}>
            Solutions Repository
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

      {/* ── Error banner ── */}
      {error && (
        <Alert
          type="error"
          message="Could not load Solutions Repository"
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

      {/* ── Loading state ── */}
      {loading && (
        <>
          <Skeleton.Button active block style={{ height: 40, marginBottom: 8 }} />
          <Card>
            <LoadingSkeleton />
          </Card>
        </>
      )}

      {/* ── Data loaded ── */}
      {!loading && data && (
        <>
          {/* Compact vertical navigation pills */}
          <div
            style={{
              overflowX: 'auto',
              marginBottom: 12,
              paddingBottom: 4,
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <Space
              size={4}
              style={{ display: 'flex', flexWrap: 'nowrap', minWidth: 'max-content' }}
            >
              {data.verticals.map((v) => {
                const s = LABEL_TO_SLUG[v.label] ?? 'professional';
                const isActive = s === activeSlug;
                return (
                  <button
                    key={s}
                    onClick={() => navigate(`/dashboard/departments/${s}`)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '4px 12px',
                      borderRadius: 16,
                      border: `1px solid ${isActive ? v.color : '#d9d9d9'}`,
                      background: isActive ? `${v.color}18` : 'transparent',
                      cursor: 'pointer',
                      fontSize: 11,
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? v.color : '#595959',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: v.color,
                        display: 'inline-block',
                        flexShrink: 0,
                      }}
                    />
                    {SHORT_LABEL[s]}
                    <span
                      style={{
                        fontSize: 9,
                        background: isActive ? v.color : '#f0f0f0',
                        color: isActive ? '#fff' : '#8c8c8c',
                        borderRadius: 8,
                        padding: '0 5px',
                        lineHeight: '14px',
                        display: 'inline-block',
                        minWidth: 16,
                        textAlign: 'center',
                      }}
                    >
                      {v.items.length}
                    </span>
                  </button>
                );
              })}
            </Space>
          </div>

          <Card styles={{ body: { padding: 16 } }}>
            {activeVertical ? (
              <>
                <VerticalSummary vertical={activeVertical} />
                <IndustryReport vertical={activeVertical} />
                {activeVertical.items.length === 0 ? (
                  <Empty description="No use cases mapped to this vertical yet" />
                ) : (
                  activeVertical.items.map((item) => <UseCaseCard key={item.gid} item={item} />)
                )}
              </>
            ) : (
              <Empty description="Vertical not found" />
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default Departments;

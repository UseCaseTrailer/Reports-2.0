import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Badge,
  Card,
  Col,
  Empty,
  Row,
  Skeleton,
  Space,
  Statistic,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import { LinkOutlined, ReloadOutlined } from '@ant-design/icons';

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

/* Short tab labels so the tab strip doesn't overflow */
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

/* ── Use-case card ── */
const UseCaseCard = ({ item }) => {
  const sc = STATUS_CFG[item.statusColor] ?? null;
  return (
    <Card
      size="small"
      hoverable
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

  const tabItems =
    data?.verticals?.map((v) => {
      const s = LABEL_TO_SLUG[v.label] ?? 'professional';
      return {
        key: s,
        label: (
          <Space size={4}>
            <span style={{ color: v.color, fontSize: 10 }}>●</span>
            <span style={{ fontSize: 12 }}>{SHORT_LABEL[s]}</span>
            <Badge
              count={v.items.length}
              size="small"
              style={{ backgroundColor: v.color, fontSize: 9, boxShadow: 'none' }}
            />
          </Space>
        ),
      };
    }) ?? [];

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
          <Skeleton.Button active block style={{ height: 40, marginBottom: 1 }} />
          <Card style={{ borderTop: 'none', borderRadius: '0 4px 4px 4px' }}>
            <LoadingSkeleton />
          </Card>
        </>
      )}

      {/* ── Data loaded ── */}
      {!loading && data && (
        <>
          <Tabs
            activeKey={activeSlug}
            onChange={(key) => navigate(`/dashboard/departments/${key}`)}
            items={tabItems}
            type="card"
            size="small"
            style={{ marginBottom: 0 }}
          />

          <Card
            style={{ borderTop: 'none', borderRadius: '0 4px 4px 4px' }}
            styles={{ body: { padding: 16 } }}
          >
            {activeVertical ? (
              <>
                <VerticalSummary vertical={activeVertical} />
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

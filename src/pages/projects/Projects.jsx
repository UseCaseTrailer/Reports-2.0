import { useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Card,
  Col,
  Row,
  Select,
  Skeleton,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import { FilterOutlined, LinkOutlined, ReloadOutlined } from '@ant-design/icons';
import SectionLabel from '../../components/SectionLabel';

const { Title, Text } = Typography;
const { Option } = Select;

const VERTICAL_SHORT = {
  'Healthcare & Life Sciences': 'Healthcare',
  'Technology & SaaS': 'Technology',
  'Manufacturing & Industrial': 'Manufacturing',
  'Financial Services': 'Financial',
  'Real Estate & Energy': 'Real Estate',
  'Food, Hospitality & Retail': 'Food & Retail',
  'Professional Services & Operations': 'Professional',
};

const HEALTH_COLOR = {
  Green: '#52c41a',
  Yellow: '#faad14',
  Red: '#ff4d4f',
};

const STATUS_TAG = {
  'On Track': 'success',
  'At Risk': 'warning',
  'Off Track': 'error',
  'In Progress': 'processing',
};

/* ── Expanded row: project detail panel ── */
const ProjectDetail = ({ record }) => {
  const hasCustomFields =
    record.industry ||
    record.sector ||
    record.region ||
    record.consultant ||
    record.useCase ||
    record.client ||
    record.healthReason;
  return (
    <div
      style={{
        padding: '10px 16px',
        background: '#fafafa',
        borderRadius: 4,
        marginTop: 2,
      }}
    >
      <Row gutter={[16, 8]}>
        <Col xs={24} md={12}>
          <Space direction="vertical" size={4}>
            <Text style={{ fontSize: 12 }}>
              <b>Vertical:</b> {record.vertical}
            </Text>
            {record.industry && (
              <Text style={{ fontSize: 12 }}>
                <b>Industry:</b> {record.industry}
              </Text>
            )}
            {record.sector && (
              <Text style={{ fontSize: 12 }}>
                <b>Sector:</b> {record.sector}
              </Text>
            )}
            {record.region && (
              <Text style={{ fontSize: 12 }}>
                <b>Region:</b> {record.region}
              </Text>
            )}
            {record.consultant && (
              <Text style={{ fontSize: 12 }}>
                <b>Consultant:</b> {record.consultant}
              </Text>
            )}
            {record.useCase && (
              <Text style={{ fontSize: 12 }}>
                <b>Use Case:</b> {record.useCase}
              </Text>
            )}
            {record.client && (
              <Text style={{ fontSize: 12 }}>
                <b>Client:</b> {record.client}
              </Text>
            )}
            {record.healthReason && (
              <Text style={{ fontSize: 12 }}>
                <b>Health Reason:</b> {record.healthReason}
              </Text>
            )}
            {!hasCustomFields && (
              <Text type="secondary" style={{ fontSize: 11 }}>
                Custom fields not populated in Asana
              </Text>
            )}
            <a
              href={record.asanaUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 11,
                color: '#6366f1',
                marginTop: 4,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <LinkOutlined /> Open in Asana
            </a>
          </Space>
        </Col>
        <Col xs={24} md={12}>
          {record.statusExcerpt ? (
            <div>
              <Text style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                Latest Status Update
              </Text>
              <div
                style={{
                  padding: '8px 10px',
                  background: '#f0f4ff',
                  borderRadius: 4,
                  borderLeft: '3px solid #6366f1',
                }}
              >
                <Text type="secondary" style={{ fontSize: 11, lineHeight: '1.5' }}>
                  {record.statusExcerpt}
                </Text>
              </div>
              {record.statusUpdatedAt && (
                <Text type="secondary" style={{ fontSize: 10, display: 'block', marginTop: 4 }}>
                  Updated: {new Date(record.statusUpdatedAt).toLocaleDateString()}
                </Text>
              )}
            </div>
          ) : (
            <Text type="secondary" style={{ fontSize: 11 }}>
              No status update available
            </Text>
          )}
        </Col>
      </Row>
    </div>
  );
};

/* ── Table columns ── */
const buildColumns = () => [
  {
    title: 'Project / Use Case',
    dataIndex: 'name',
    key: 'name',
    render: (text, r) => (
      <Space size={6}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: r.verticalColor,
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
        <Text style={{ fontSize: 12 }}>{text}</Text>
        {r.type === 'portfolio' && (
          <Tag style={{ fontSize: 9, lineHeight: '14px', padding: '0 4px' }}>Portfolio</Tag>
        )}
      </Space>
    ),
  },
  {
    title: 'Vertical',
    dataIndex: 'vertical',
    key: 'vertical',
    responsive: ['md'],
    render: (v, r) => (
      <Tag
        style={{
          fontSize: 10,
          lineHeight: '18px',
          borderColor: r.verticalColor,
          color: r.verticalColor,
        }}
      >
        {VERTICAL_SHORT[v] ?? v}
      </Tag>
    ),
  },
  {
    title: 'Industry',
    dataIndex: 'industry',
    key: 'industry',
    responsive: ['lg'],
    render: (v) => (
      <Text type="secondary" style={{ fontSize: 11 }}>
        {v || '—'}
      </Text>
    ),
  },
  {
    title: 'Health',
    dataIndex: 'health',
    key: 'health',
    render: (h) => {
      if (!h)
        return (
          <Text type="secondary" style={{ fontSize: 11 }}>
            —
          </Text>
        );
      const color = HEALTH_COLOR[h] || '#d1d5db';
      return <Badge color={color} text={<Text style={{ fontSize: 11 }}>{h}</Text>} />;
    },
  },
  {
    title: 'Project Status',
    dataIndex: 'projectStatus',
    key: 'projectStatus',
    render: (s) => {
      if (!s)
        return (
          <Text type="secondary" style={{ fontSize: 11 }}>
            —
          </Text>
        );
      const tagColor = STATUS_TAG[s] || 'default';
      return (
        <Tag color={tagColor} style={{ fontSize: 10 }}>
          {s}
        </Tag>
      );
    },
  },
  {
    title: 'Client',
    dataIndex: 'client',
    key: 'client',
    responsive: ['xl'],
    render: (c) => (
      <Text type="secondary" style={{ fontSize: 11 }}>
        {c || '—'}
      </Text>
    ),
  },
];

/* ── Main component ── */
const Projects = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [filterVertical, setFilterVertical] = useState(null);
  const [filterHealth, setFilterHealth] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/projects')
      .then((r) => {
        if (!r.ok) throw new Error(`API error ${r.status}`);
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

  /* Filter options derived from data */
  const verticals = [...new Set((data?.projects ?? []).map((p) => p.vertical).filter(Boolean))];
  const healthValues = [...new Set((data?.projects ?? []).map((p) => p.health).filter(Boolean))];
  const statusValues = [
    ...new Set((data?.projects ?? []).map((p) => p.projectStatus).filter(Boolean)),
  ];

  /* Filtered rows */
  const rows = (data?.projects ?? [])
    .filter((p) => {
      if (filterVertical && p.vertical !== filterVertical) return false;
      if (filterHealth && p.health !== filterHealth) return false;
      if (filterStatus && p.projectStatus !== filterStatus) return false;
      return true;
    })
    .map((p) => ({ ...p, key: p.gid }));

  const columns = buildColumns();

  return (
    <div>
      {/* ── Header ── */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Title level={4} style={{ marginBottom: 4 }}>
            Active Use Cases
          </Title>
          <Text type="secondary">
            {loading && 'Loading from Asana…'}
            {error && 'Could not reach Asana'}
            {data && `${rows.length} of ${data.total} use cases · click a row to expand details`}
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
          message="Could not load projects"
          description={`${error} — check ASANA_PAT in Vercel environment variables.`}
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

      {/* ── Filter bar ── */}
      <SectionLabel style={{ marginTop: 0 }}>
        <FilterOutlined style={{ marginRight: 6 }} />
        Filters
      </SectionLabel>
      <Card size="small" style={{ marginBottom: 16 }} styles={{ body: { padding: '10px 14px' } }}>
        <Space size={8} wrap>
          <Select
            placeholder="All verticals"
            allowClear
            style={{ width: 160, fontSize: 12 }}
            size="small"
            onChange={setFilterVertical}
            disabled={loading}
            value={filterVertical}
          >
            {verticals.map((v) => (
              <Option key={v} value={v}>
                {VERTICAL_SHORT[v] ?? v}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="All health"
            allowClear
            style={{ width: 130, fontSize: 12 }}
            size="small"
            onChange={setFilterHealth}
            disabled={loading}
            value={filterHealth}
          >
            {healthValues.map((h) => (
              <Option key={h} value={h}>
                {h}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="All statuses"
            allowClear
            style={{ width: 140, fontSize: 12 }}
            size="small"
            onChange={setFilterStatus}
            disabled={loading}
            value={filterStatus}
          >
            {statusValues.map((s) => (
              <Option key={s} value={s}>
                {s}
              </Option>
            ))}
          </Select>
          {(filterVertical || filterHealth || filterStatus) && (
            <Text
              style={{ fontSize: 11, color: '#6366f1', cursor: 'pointer' }}
              onClick={() => {
                setFilterVertical(null);
                setFilterHealth(null);
                setFilterStatus(null);
              }}
            >
              Clear filters
            </Text>
          )}
        </Space>
      </Card>

      {/* ── Loading ── */}
      {loading && (
        <Card>
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} active paragraph={false} style={{ marginBottom: 10 }} />
          ))}
        </Card>
      )}

      {/* ── Table ── */}
      {!loading && data && (
        <Card styles={{ body: { padding: 0 } }}>
          <Table
            columns={columns}
            dataSource={rows}
            expandable={{
              expandedRowRender: (record) => <ProjectDetail record={record} />,
              rowExpandable: () => true,
            }}
            pagination={{
              pageSize: 20,
              showSizeChanger: false,
              showTotal: (total) => `${total} items`,
              size: 'small',
            }}
            size="small"
            scroll={{ x: 500 }}
          />
        </Card>
      )}
    </div>
  );
};

export default Projects;

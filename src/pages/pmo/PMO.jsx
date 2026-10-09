import { Row, Col, Card, Statistic, Progress, Space, Table, Tag, Typography, Badge } from 'antd';
import {
  TrophyOutlined,
  RiseOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ProjectOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import SectionLabel from '../../components/SectionLabel';
import { PORTFOLIOS, scoreHealth, healthGrade, getPortfolioSummary } from '../../data/pmoData';

const { Title, Text } = Typography;

const activeGrants = PORTFOLIOS.find((p) => p.name === '03.Active Projects')?.projects || [];

const grantRows = activeGrants.map((proj) => {
  const hs = scoreHealth(proj.tasks);
  const grade = healthGrade(hs.v);
  return {
    key: proj.gid,
    name: proj.name,
    lead: proj.tasks.find((t) => t.who)?.who || '—',
    end: proj.end,
    total: hs.N,
    done: hs.done,
    ov: hs.ov,
    score: hs.v,
    label: grade.label,
    tag: grade.tag,
    color: grade.color,
  };
});

const columns = [
  {
    title: 'Project',
    dataIndex: 'name',
    key: 'name',
    render: (text) => (
      <Text strong style={{ fontSize: 13 }}>
        {text}
      </Text>
    ),
  },
  { title: 'Lead', dataIndex: 'lead', key: 'lead', responsive: ['md'] },
  { title: 'Due', dataIndex: 'end', key: 'end', responsive: ['lg'] },
  {
    title: 'Progress',
    key: 'progress',
    responsive: ['md'],
    render: (_, r) => (
      <Space direction="vertical" size={0} style={{ width: 120 }}>
        <Text style={{ fontSize: 11 }}>
          {r.done}/{r.total} tasks
        </Text>
        <Progress percent={Math.round((r.done / r.total) * 100)} size="small" showInfo={false} />
      </Space>
    ),
  },
  {
    title: 'Health',
    key: 'health',
    render: (_, r) => (
      <Space>
        <Progress
          type="circle"
          percent={r.score}
          size={36}
          strokeColor={r.color}
          format={(p) => <span style={{ fontSize: 10, fontWeight: 700 }}>{p}</span>}
        />
        <Tag color={r.tag}>{r.label}</Tag>
      </Space>
    ),
  },
  {
    title: 'Overdue',
    dataIndex: 'ov',
    key: 'ov',
    responsive: ['lg'],
    render: (ov) =>
      ov > 0 ? (
        <Badge count={ov} style={{ backgroundColor: '#ff4d4f' }} />
      ) : (
        <CheckCircleOutlined style={{ color: '#52c41a' }} />
      ),
  },
];

const summary = getPortfolioSummary();

const PMO = () => (
  <div>
    <Row justify="space-between" align="middle" style={{ marginBottom: 24 }} gutter={[16, 16]}>
      <Col>
        <Title level={4} style={{ marginBottom: 4 }}>
          Executive PMO Dashboard
        </Title>
        <Text type="secondary">Altudo · Oct 8, 2026 · Live Asana sync</Text>
      </Col>
    </Row>

    <SectionLabel style={{ marginTop: 0 }}>Portfolio Overview</SectionLabel>

    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <Card hoverable>
          <Statistic
            title="Active Portfolios"
            value={summary.totalPortfolios}
            prefix={<TrophyOutlined style={{ color: '#6366f1' }} />}
          />
          <Progress percent={100} showInfo={false} strokeColor="#6366f1" />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card hoverable>
          <Statistic
            title="Grant Projects"
            value={summary.activeGrants}
            prefix={<ProjectOutlined style={{ color: '#06b6d4' }} />}
            suffix={
              <Text type="secondary" style={{ fontSize: 13 }}>
                {' '}
                active
              </Text>
            }
          />
          <Progress
            percent={Math.round((summary.activeGrants / summary.totalProjects) * 100)}
            showInfo={false}
            strokeColor="#06b6d4"
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card hoverable>
          <Statistic
            title="On Track"
            value={summary.onTrack}
            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            suffix={
              <Text type="secondary" style={{ fontSize: 13 }}>
                {' '}
                / {summary.activeGrants}
              </Text>
            }
          />
          <Progress
            percent={Math.round((summary.onTrack / summary.activeGrants) * 100)}
            showInfo={false}
            strokeColor="#52c41a"
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card hoverable>
          <Statistic
            title="Avg Health Score"
            value={summary.avgHealth}
            prefix={<RiseOutlined style={{ color: '#faad14' }} />}
            suffix="/100"
          />
          <Progress
            percent={summary.avgHealth}
            showInfo={false}
            strokeColor={
              summary.avgHealth >= 80 ? '#52c41a' : summary.avgHealth >= 60 ? '#faad14' : '#ff4d4f'
            }
          />
        </Card>
      </Col>
    </Row>

    <SectionLabel>Grant Projects Health — 03.Active Projects</SectionLabel>

    <Row gutter={[16, 16]}>
      {grantRows.map((r) => (
        <Col xs={24} sm={12} lg={8} key={r.key}>
          <Card
            size="small"
            style={{ borderLeft: `4px solid ${r.color}` }}
            title={
              <Text strong style={{ fontSize: 12 }}>
                {r.name}
              </Text>
            }
            extra={<Tag color={r.tag}>{r.label}</Tag>}
          >
            <Row gutter={8}>
              <Col span={12}>
                <Progress
                  type="circle"
                  percent={r.score}
                  size={60}
                  strokeColor={r.color}
                  format={(p) => <span style={{ fontSize: 14, fontWeight: 700 }}>{p}</span>}
                />
              </Col>
              <Col span={12}>
                <Space direction="vertical" size={2}>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    <TeamOutlined /> {r.lead}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    <ClockCircleOutlined /> Due {r.end}
                  </Text>
                  <Text style={{ fontSize: 11 }}>
                    {r.done}/{r.total} tasks done
                  </Text>
                  {r.ov > 0 && (
                    <Text type="danger" style={{ fontSize: 11 }}>
                      <WarningOutlined /> {r.ov} overdue
                    </Text>
                  )}
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
      ))}
    </Row>

    <SectionLabel>Projects Table</SectionLabel>

    <Card>
      <Table
        columns={columns}
        dataSource={grantRows}
        pagination={false}
        size="small"
        scroll={{ x: 600 }}
      />
    </Card>
  </div>
);

export default PMO;

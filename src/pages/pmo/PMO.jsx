import { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  Space,
  Table,
  Tag,
  Typography,
  Badge,
  Drawer,
} from 'antd';
import {
  TrophyOutlined,
  RiseOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ProjectOutlined,
  TeamOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import SectionLabel from '../../components/SectionLabel';
import AIInsightPanel from '../../components/AIInsightPanel';
import { PORTFOLIOS, scoreHealth, healthGrade, getPortfolioSummary } from '../../data/pmoData';
import { getProjectInsights } from '../../data/insightsEngine';

const { Title, Text } = Typography;

const activeGrants = PORTFOLIOS.find((p) => p.name === '03.Active Projects')?.projects || [];

const grantRows = activeGrants.map((proj) => {
  const hs = scoreHealth(proj.tasks);
  const grade = healthGrade(hs.v);
  return {
    key: proj.gid,
    gid: proj.gid,
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
    proj,
  };
});

// Chart data — task completion per project
const completionChartData = grantRows.map((r) => ({
  name: r.name.split('–')[0].replace('GRANT-2026-', 'G-').trim(),
  fullName: r.name,
  Done: r.done,
  Remaining: r.total - r.done,
  Overdue: r.ov,
  health: r.score,
  color: r.color,
}));

// Health distribution pie data
const healthCounts = {
  'On Track': grantRows.filter((r) => r.score >= 80).length,
  'At Risk': grantRows.filter((r) => r.score >= 60 && r.score < 80).length,
  'Off Track': grantRows.filter((r) => r.score < 60).length,
};
const healthPieData = [
  { name: 'On Track', value: healthCounts['On Track'], color: '#52c41a' },
  { name: 'At Risk', value: healthCounts['At Risk'], color: '#faad14' },
  { name: 'Off Track', value: healthCounts['Off Track'], color: '#ff4d4f' },
].filter((d) => d.value > 0);

const summary = getPortfolioSummary();

// Custom tooltip for bar chart
const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const item = completionChartData.find((d) => d.name === label);
  return (
    <Card size="small" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
      <Text strong style={{ fontSize: 12 }}>
        {item?.fullName || label}
      </Text>
      <div>
        {payload.map((p) => (
          <div key={p.dataKey}>
            <Text style={{ fontSize: 12, color: p.fill }}>
              {p.dataKey}: {p.value}
            </Text>
          </div>
        ))}
      </div>
      {item && (
        <Tag
          color={item.health >= 80 ? 'success' : item.health >= 60 ? 'warning' : 'error'}
          style={{ marginTop: 4, fontSize: 11 }}
        >
          Health: {item.health}
        </Tag>
      )}
      <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
        Click for AI insights →
      </Text>
    </Card>
  );
};

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

const PMO = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState(null);

  const openInsight = (proj) => {
    setSelectedInsight(getProjectInsights(proj));
    setDrawerOpen(true);
  };

  const handleBarClick = (data) => {
    if (!data?.activePayload?.[0]) return;
    const clicked = completionChartData.find((d) => d.name === data.activeLabel);
    if (!clicked) return;
    const proj = activeGrants.find((p) => p.name === clicked.fullName);
    if (proj) openInsight(proj);
  };

  return (
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
                summary.avgHealth >= 80
                  ? '#52c41a'
                  : summary.avgHealth >= 60
                    ? '#faad14'
                    : '#ff4d4f'
              }
            />
          </Card>
        </Col>
      </Row>

      {/* ── Charts row ── */}
      <SectionLabel>
        <BarChartOutlined style={{ marginRight: 6 }} />
        Portfolio Analytics — Click any bar or card for AI insights
      </SectionLabel>

      <Row gutter={[16, 16]}>
        {/* Task completion bar chart */}
        <Col xs={24} lg={16}>
          <Card
            size="small"
            title={
              <Text strong style={{ fontSize: 13 }}>
                Task Completion by Project
              </Text>
            }
          >
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 8 }}>
              Click a bar to open AI insights for that project
            </Text>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={completionChartData}
                onClick={handleBarClick}
                style={{ cursor: 'pointer' }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={40}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend iconType="square" wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
                <Bar dataKey="Done" stackId="a" fill="#52c41a" name="Done" radius={[0, 0, 0, 0]} />
                <Bar
                  dataKey="Remaining"
                  stackId="a"
                  fill="#e2e8f0"
                  name="Remaining"
                  radius={[4, 4, 0, 0]}
                />
                <Bar dataKey="Overdue" fill="#ff4d4f" name="Overdue" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Health distribution pie */}
        <Col xs={24} lg={8}>
          <Card
            size="small"
            title={
              <Text strong style={{ fontSize: 13 }}>
                Health Distribution
              </Text>
            }
            style={{ height: '100%' }}
          >
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={healthPieData}
                  cx="50%"
                  cy="45%"
                  outerRadius={75}
                  dataKey="value"
                  label={({ value }) => `${value}`}
                  labelLine={true}
                >
                  {healthPieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} projects`, name]} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* ── Grant health cards ── */}
      <SectionLabel>Grant Projects Health — 03.Active Projects</SectionLabel>

      <Row gutter={[16, 16]}>
        {grantRows.map((r) => (
          <Col xs={24} sm={12} lg={8} key={r.key}>
            <Card
              size="small"
              hoverable
              style={{ borderLeft: `4px solid ${r.color}`, cursor: 'pointer' }}
              title={
                <Text strong style={{ fontSize: 12 }}>
                  {r.name}
                </Text>
              }
              extra={<Tag color={r.tag}>{r.label}</Tag>}
              onClick={() => openInsight(r.proj)}
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
              <Text type="secondary" style={{ fontSize: 10, marginTop: 8, display: 'block' }}>
                Click for AI insights →
              </Text>
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
          onRow={(record) => ({
            onClick: () => openInsight(record.proj),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>

      {/* ── AI Insight Drawer ── */}
      <Drawer
        title={
          <Space>
            <BarChartOutlined style={{ color: '#6366f1' }} />
            <span>AI Project Insights</span>
            {selectedInsight && (
              <Tag
                color={
                  selectedInsight.score >= 80
                    ? 'success'
                    : selectedInsight.score >= 60
                      ? 'warning'
                      : 'error'
                }
              >
                {selectedInsight.label}
              </Tag>
            )}
          </Space>
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={480}
        styles={{ body: { padding: 16 } }}
      >
        {selectedInsight && (
          <>
            <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 12 }}>
              {selectedInsight.name}
            </Text>
            <AIInsightPanel insight={selectedInsight} />
          </>
        )}
      </Drawer>
    </div>
  );
};

export default PMO;

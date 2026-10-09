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
  Empty,
  Drawer,
} from 'antd';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BarChartOutlined } from '@ant-design/icons';
import { DEPT_PORTFOLIOS } from '../../data/pmoData';
import AIInsightPanel from '../../components/AIInsightPanel';
import { getDeptProjectInsights } from '../../data/insightsEngine';

const { Title, Text } = Typography;

const STATUS_COLOR = {
  green: '#52c41a',
  yellow: '#faad14',
  red: '#ff4d4f',
  complete: '#6366f1',
};

const STATUS_TAG = {
  green: 'success',
  yellow: 'warning',
  red: 'error',
  complete: 'processing',
};

const STATUS_LABEL = {
  green: 'On Track',
  yellow: 'At Risk',
  red: 'Off Track',
  complete: 'Complete',
};

// Category colors for pie chart
const CAT_COLORS = [
  '#6366f1',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
];

/* ── KPI row ── */
const KpiRow = ({ kpis }) => (
  <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
    {kpis.map((kpi, i) => (
      <Col xs={12} sm={8} lg={4} key={i}>
        <Card size="small" style={{ borderTop: `3px solid ${kpi.c}` }}>
          <Statistic
            title={<Text style={{ fontSize: 11 }}>{kpi.l}</Text>}
            value={kpi.v}
            valueStyle={{ fontSize: 18, color: kpi.c }}
          />
          <Text type="secondary" style={{ fontSize: 11 }}>
            {kpi.s}
          </Text>
        </Card>
      </Col>
    ))}
  </Row>
);

/* ── Project cards ── */
const ProjectCard = ({ proj, onInsightClick }) => {
  const totalTasks = proj.tasks.total || 1;
  const pct = Math.round((proj.tasks.done / totalTasks) * 100);
  const col = STATUS_COLOR[proj.status] || '#888';
  return (
    <Card
      size="small"
      hoverable
      style={{ marginBottom: 12, borderLeft: `4px solid ${col}`, cursor: 'pointer' }}
      title={
        <Space>
          <Text strong style={{ fontSize: 13 }}>
            {proj.name}
          </Text>
          <Tag color={STATUS_TAG[proj.status]}>{STATUS_LABEL[proj.status]}</Tag>
          <Tag>{proj.cat}</Tag>
        </Space>
      }
      extra={
        <Text
          type="secondary"
          style={{ fontSize: 11, cursor: 'pointer', color: '#6366f1' }}
          onClick={() => onInsightClick(proj)}
        >
          AI insights →
        </Text>
      }
    >
      <Row gutter={[16, 8]}>
        <Col xs={24} md={16}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {proj.note}
          </Text>
          <div style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 11 }}>
              {proj.tasks.done}/{proj.tasks.total} tasks
              {proj.tasks.overdue > 0 && <Text type="danger"> · {proj.tasks.overdue} overdue</Text>}
            </Text>
            <Progress percent={pct} size="small" strokeColor={col} style={{ marginTop: 4 }} />
          </div>
        </Col>
        <Col xs={24} md={8}>
          <Row gutter={[8, 4]}>
            {proj.metrics.map((m, i) => (
              <Col span={12} key={i}>
                <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>
                  {m.l}
                </Text>
                <Text strong style={{ fontSize: 12 }}>
                  {m.v}
                </Text>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </Card>
  );
};

/* ── Budget tooltip — defined at module level to avoid ESLint react/no-unstable-nested-components ── */
const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Card size="small" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
      <Text strong style={{ fontSize: 12 }}>
        {label}
      </Text>
      {payload.map((p) => (
        <div key={p.dataKey}>
          <Text style={{ fontSize: 12, color: p.fill }}>
            {p.dataKey}: ${p.value}K
          </Text>
        </div>
      ))}
    </Card>
  );
};

/* ── Enhanced Budget view ── */
const BudgetView = ({ dept }) => {
  if (!dept.projects.length) return <Empty description="No budget data yet" />;

  const chartData = dept.projects.map((p) => ({
    name: p.name.length > 20 ? p.name.slice(0, 20) + '…' : p.name,
    Budget: Math.round(p.budget / 1000),
    Spent: Math.round(p.spent / 1000),
    Remaining: Math.round((p.budget - p.spent) / 1000),
    utilPct: p.pctSpent,
  }));

  // Category budget totals for pie
  const catMap = {};
  dept.projects.forEach((p) => {
    const cat = p.cat || 'Other';
    if (!catMap[cat]) catMap[cat] = 0;
    catMap[cat] += p.budget;
  });
  const pieCatData = Object.entries(catMap).map(([name, value]) => ({
    name,
    value: Math.round(value / 1000),
  }));

  // Spend utilisation donut data
  const totalBudget = dept.projects.reduce((s, p) => s + p.budget, 0);
  const totalSpent = dept.projects.reduce((s, p) => s + p.spent, 0);
  const utilPct = Math.round((totalSpent / totalBudget) * 100);
  const donutData = [
    { name: 'Spent', value: Math.round(totalSpent / 1000) },
    { name: 'Remaining', value: Math.round((totalBudget - totalSpent) / 1000) },
  ];

  return (
    <div>
      {/* Summary stat row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={8}>
          <Card size="small" style={{ borderTop: '3px solid #6366f1' }}>
            <Statistic
              title="Total Budget"
              value={`$${Math.round(totalBudget / 1000)}K`}
              valueStyle={{ color: '#6366f1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            size="small"
            style={{ borderTop: `3px solid ${utilPct > 90 ? '#ff4d4f' : '#52c41a'}` }}
          >
            <Statistic
              title="Total Spent"
              value={`$${Math.round(totalSpent / 1000)}K`}
              valueStyle={{ color: utilPct > 90 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" style={{ borderTop: '3px solid #faad14' }}>
            <Statistic
              title="Budget Utilisation"
              value={`${utilPct}%`}
              valueStyle={{
                color: utilPct > 90 ? '#ff4d4f' : utilPct > 70 ? '#faad14' : '#52c41a',
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts row */}
      <Row gutter={[16, 16]}>
        {/* Grouped bar chart */}
        <Col xs={24} lg={14}>
          <Card
            size="small"
            title={
              <Text strong style={{ fontSize: 13 }}>
                Budget vs Spent by Project
              </Text>
            }
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 8 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={50}
                />
                <YAxis tick={{ fontSize: 10 }} unit="K" />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend iconType="square" wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Budget" fill="#c4b5fd" name="Budget ($K)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Spent" fill="#6366f1" name="Spent ($K)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Right column: Pie + Donut */}
        <Col xs={24} lg={10}>
          <Row gutter={[16, 16]}>
            {/* Category allocation pie */}
            <Col span={24}>
              <Card
                size="small"
                title={
                  <Text strong style={{ fontSize: 13 }}>
                    Budget by Category
                  </Text>
                }
              >
                <ResponsiveContainer width="100%" height={130}>
                  <PieChart>
                    <Pie
                      data={pieCatData}
                      cx="50%"
                      cy="50%"
                      outerRadius={50}
                      dataKey="value"
                      label={({ name, value }) => `${name}: $${value}K`}
                      labelLine={false}
                    >
                      {pieCatData.map((_, idx) => (
                        <Cell key={idx} fill={CAT_COLORS[idx % CAT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `$${v}K`} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            {/* Utilisation donut */}
            <Col span={24}>
              <Card
                size="small"
                title={
                  <Text strong style={{ fontSize: 13 }}>
                    Spend Utilisation
                  </Text>
                }
              >
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      <Cell fill={utilPct > 90 ? '#ff4d4f' : '#6366f1'} />
                      <Cell fill="#e2e8f0" />
                    </Pie>
                    <Tooltip formatter={(v) => `$${v}K`} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Per-project utilisation bars */}
      <Card
        size="small"
        title={
          <Text strong style={{ fontSize: 13 }}>
            Budget Utilisation per Project
          </Text>
        }
        style={{ marginTop: 16 }}
      >
        {dept.projects.map((proj) => (
          <div key={proj.gid} style={{ marginBottom: 10 }}>
            <Row justify="space-between">
              <Text style={{ fontSize: 12 }}>{proj.name}</Text>
              <Text
                style={{
                  fontSize: 12,
                  color:
                    proj.pctSpent > 90 ? '#ff4d4f' : proj.pctSpent > 70 ? '#faad14' : '#52c41a',
                }}
              >
                {proj.pctSpent}% (${Math.round(proj.spent / 1000)}K / $
                {Math.round(proj.budget / 1000)}K)
              </Text>
            </Row>
            <Progress
              percent={proj.pctSpent}
              size="small"
              showInfo={false}
              strokeColor={
                proj.pctSpent > 90 ? '#ff4d4f' : proj.pctSpent > 70 ? '#faad14' : '#52c41a'
              }
            />
          </div>
        ))}
      </Card>
    </div>
  );
};

/* ── Department content ── */
const DeptContent = ({ deptKey }) => {
  const dept = DEPT_PORTFOLIOS[deptKey];
  const [section, setSection] = useState('overview');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState(null);

  const openInsight = (proj) => {
    setSelectedInsight(getDeptProjectInsights(proj));
    setDrawerOpen(true);
  };

  if (!dept) return <Empty />;

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'projects', label: 'Projects' },
    { key: 'budget', label: 'Budget & Analytics' },
  ];

  return (
    <div>
      {dept.kpis.length > 0 && <KpiRow kpis={dept.kpis} />}

      <Tabs activeKey={section} onChange={setSection} items={tabs} />

      {section === 'overview' && (
        <div>
          {dept.projects.length === 0 ? (
            <Empty description="No projects in this department portfolio yet" />
          ) : (
            <Row gutter={[16, 0]}>
              {dept.projects.map((p) => (
                <Col span={24} key={p.gid}>
                  <ProjectCard proj={p} onInsightClick={openInsight} />
                </Col>
              ))}
            </Row>
          )}
        </div>
      )}

      {section === 'projects' && (
        <div>
          {dept.projects.length === 0 ? (
            <Empty description="No projects yet" />
          ) : (
            <Table
              size="small"
              pagination={false}
              scroll={{ x: 600 }}
              dataSource={dept.projects.map((p) => ({ ...p, key: p.gid }))}
              onRow={(record) => ({
                onClick: () => openInsight(record),
                style: { cursor: 'pointer' },
              })}
              columns={[
                {
                  title: 'Project',
                  dataIndex: 'name',
                  key: 'name',
                  render: (t) => <Text style={{ fontSize: 12 }}>{t}</Text>,
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                  render: (s) => <Tag color={STATUS_TAG[s]}>{STATUS_LABEL[s]}</Tag>,
                },
                {
                  title: 'Category',
                  dataIndex: 'cat',
                  key: 'cat',
                  responsive: ['md'],
                  render: (c) => <Tag>{c}</Tag>,
                },
                {
                  title: 'Tasks',
                  key: 'tasks',
                  responsive: ['md'],
                  render: (_, r) => (
                    <Space direction="vertical" size={0}>
                      <Text style={{ fontSize: 11 }}>
                        {r.tasks.done}/{r.tasks.total}
                      </Text>
                      <Progress
                        percent={Math.round((r.tasks.done / (r.tasks.total || 1)) * 100)}
                        size="small"
                        showInfo={false}
                        strokeColor={STATUS_COLOR[r.status]}
                        style={{ width: 80 }}
                      />
                    </Space>
                  ),
                },
                {
                  title: 'Budget',
                  key: 'budget',
                  responsive: ['lg'],
                  render: (_, r) =>
                    r.budget ? (
                      <Space direction="vertical" size={0}>
                        <Text style={{ fontSize: 11 }}>${(r.budget / 1000).toFixed(0)}K total</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          ${(r.spent / 1000).toFixed(0)}K spent ({r.pctSpent}%)
                        </Text>
                        <Progress
                          percent={r.pctSpent}
                          size="small"
                          showInfo={false}
                          strokeColor={
                            r.pctSpent > 90 ? '#ff4d4f' : r.pctSpent > 70 ? '#faad14' : '#52c41a'
                          }
                          style={{ width: 80 }}
                        />
                      </Space>
                    ) : (
                      '—'
                    ),
                },
                {
                  title: 'ROI',
                  dataIndex: 'roi',
                  key: 'roi',
                  render: (v) => (v ? <Tag color="success">{v}%</Tag> : '—'),
                },
                {
                  title: 'Insights',
                  key: 'insights',
                  render: (_, r) => (
                    <Text
                      style={{ fontSize: 11, color: '#6366f1', cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        openInsight(r);
                      }}
                    >
                      <BarChartOutlined /> AI →
                    </Text>
                  ),
                },
              ]}
            />
          )}
        </div>
      )}

      {section === 'budget' && <BudgetView dept={dept} />}

      {/* AI Insight Drawer */}
      <Drawer
        title={
          <Space>
            <BarChartOutlined style={{ color: '#6366f1' }} />
            <span>AI Project Insights</span>
          </Space>
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={460}
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

/* ── Main component ── */
const Departments = () => {
  const [activeDept, setActiveDept] = useState('engineering');

  const deptTabs = Object.entries(DEPT_PORTFOLIOS).map(([key, dept]) => ({
    key,
    label: (
      <Space size={4}>
        <span style={{ color: dept.color }}>■</span>
        <span>{dept.name}</span>
      </Space>
    ),
  }));

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={4} style={{ marginBottom: 4 }}>
            Department Portfolios
          </Title>
          <Text type="secondary">Engineering · Sales · Finance · Project Management</Text>
        </Col>
      </Row>

      <Tabs
        activeKey={activeDept}
        onChange={setActiveDept}
        items={deptTabs}
        type="card"
        style={{ marginBottom: 0 }}
      />

      <Card style={{ borderTop: 'none', borderRadius: '0 4px 4px 4px' }}>
        <DeptContent deptKey={activeDept} />
      </Card>
    </div>
  );
};

export default Departments;

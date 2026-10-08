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
} from 'antd';
import {
  CheckCircleOutlined,
  WarningOutlined,
  DollarOutlined,
  TrophyOutlined,
  CodeOutlined,
  TeamOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import SectionLabel from '../../components/SectionLabel';
import { DEPT_PORTFOLIOS } from '../../data/pmoData';

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
const ProjectCard = ({ proj }) => {
  const totalTasks = proj.tasks.total || 1;
  const pct = Math.round((proj.tasks.done / totalTasks) * 100);
  const col = STATUS_COLOR[proj.status] || '#888';
  return (
    <Card
      size="small"
      style={{ marginBottom: 12, borderLeft: `4px solid ${col}` }}
      title={
        <Space>
          <Text strong style={{ fontSize: 13 }}>
            {proj.name}
          </Text>
          <Tag color={STATUS_TAG[proj.status]}>{STATUS_LABEL[proj.status]}</Tag>
          <Tag>{proj.cat}</Tag>
        </Space>
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
              {proj.tasks.overdue > 0 && (
                <Text type="danger"> · {proj.tasks.overdue} overdue</Text>
              )}
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

/* ── Budget view ── */
const BudgetView = ({ dept }) => {
  if (!dept.projects.length) return <Empty description="No budget data yet" />;
  const chartData = dept.projects.map((p) => ({
    name: p.name.length > 22 ? p.name.slice(0, 22) + '…' : p.name,
    Budget: Math.round(p.budget / 1000),
    Spent: Math.round(p.spent / 1000),
  }));
  return (
    <div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} layout="vertical">
          <XAxis type="number" tick={{ fontSize: 10 }} unit="K" />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={160} />
          <Tooltip formatter={(v) => `$${v}K`} />
          <Bar dataKey="Budget" fill="#c4b5fd" />
          <Bar dataKey="Spent" fill="#6366f1" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/* ── Department content ── */
const DeptContent = ({ deptKey }) => {
  const dept = DEPT_PORTFOLIOS[deptKey];
  const [section, setSection] = useState('overview');

  if (!dept) return <Empty />;

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'projects', label: 'Projects' },
    { key: 'budget', label: 'Budget' },
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
                  <ProjectCard proj={p} />
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
                          ${(r.spent / 1000).toFixed(0)}K spent
                        </Text>
                      </Space>
                    ) : (
                      '—'
                    ),
                },
                {
                  title: 'ROI',
                  dataIndex: 'roi',
                  key: 'roi',
                  render: (v) =>
                    v ? <Tag color="success">{v}%</Tag> : '—',
                },
              ]}
            />
          )}
        </div>
      )}

      {section === 'budget' && <BudgetView dept={dept} />}
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

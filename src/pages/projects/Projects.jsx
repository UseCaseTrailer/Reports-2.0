import { useState } from 'react';
import { Table, Tag, Progress, Space, Typography, Card, Row, Col, Tabs, Drawer } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  UserOutlined,
  BarChartOutlined,
  CommentOutlined,
} from '@ant-design/icons';
import SectionLabel from '../../components/SectionLabel';
import AIInsightPanel from '../../components/AIInsightPanel';
import TaskComments from '../../components/TaskComments';
import { PORTFOLIOS, scoreHealth, healthGrade } from '../../data/pmoData';
import { getProjectInsights } from '../../data/insightsEngine';

const { Title, Text } = Typography;

const activeGrants = PORTFOLIOS.find((p) => p.name === '03.Active Projects')?.projects || [];

const rows = activeGrants.map((proj) => {
  const hs = scoreHealth(proj.tasks);
  const grade = healthGrade(hs.v);
  const leads = [...new Set(proj.tasks.map((t) => t.who).filter(Boolean))];
  return {
    key: proj.gid,
    gid: proj.gid,
    name: proj.name,
    type: proj.type,
    phase: proj.phase,
    start: proj.start,
    end: proj.end,
    leads,
    total: hs.N,
    done: hs.done,
    ov: hs.ov,
    ua: hs.ua,
    cp: hs.cp,
    score: hs.v,
    label: grade.label,
    tag: grade.tag,
    color: grade.color,
    tasks: proj.tasks,
    proj,
  };
});

const columns = [
  {
    title: 'Grant ID / Project',
    dataIndex: 'name',
    key: 'name',
    render: (text) => (
      <Space direction="vertical" size={0}>
        <Text strong style={{ fontSize: 13 }}>
          {text.split('–')[0].trim()}
        </Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {text.includes('–') ? text.split('–').slice(1).join('–').trim() : ''}
        </Text>
      </Space>
    ),
  },
  {
    title: 'Phase',
    dataIndex: 'phase',
    key: 'phase',
    responsive: ['md'],
    render: (phase) => <Tag color="blue">{phase}</Tag>,
  },
  {
    title: 'Lead',
    dataIndex: 'leads',
    key: 'leads',
    responsive: ['lg'],
    render: (leads) => (
      <Space size={4}>
        <UserOutlined />
        <Text style={{ fontSize: 12 }}>{leads[0] || '—'}</Text>
      </Space>
    ),
  },
  {
    title: 'Timeline',
    key: 'timeline',
    responsive: ['lg'],
    render: (_, r) => (
      <Space direction="vertical" size={0}>
        <Text style={{ fontSize: 11 }}>
          <ClockCircleOutlined /> {r.start || '—'}
        </Text>
        <Text style={{ fontSize: 11 }}>→ {r.end || '—'}</Text>
      </Space>
    ),
  },
  {
    title: 'Tasks',
    key: 'tasks',
    responsive: ['md'],
    render: (_, r) => (
      <Space direction="vertical" size={2} style={{ width: 100 }}>
        <Text style={{ fontSize: 11 }}>
          {r.done}/{r.total} done
        </Text>
        <Progress percent={r.cp} size="small" showInfo={false} strokeColor={r.color} />
        {r.ov > 0 && (
          <Text type="danger" style={{ fontSize: 11 }}>
            <WarningOutlined /> {r.ov} overdue
          </Text>
        )}
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
          size={40}
          strokeColor={r.color}
          format={(p) => <span style={{ fontSize: 10, fontWeight: 700 }}>{p}</span>}
        />
        <Tag color={r.tag}>{r.label}</Tag>
      </Space>
    ),
  },
];

// ── Expanded row: tabbed Tasks / Insights / Comments ──
const ExpandedRow = ({ record }) => {
  const [activeTab, setActiveTab] = useState('tasks');

  const taskCols = [
    {
      title: 'Task',
      dataIndex: 'n',
      key: 'n',
      render: (text, t) => (
        <Text
          style={{
            fontSize: 12,
            textDecoration: t.done ? 'line-through' : 'none',
            color: t.done ? '#888' : 'inherit',
          }}
        >
          {text}
        </Text>
      ),
    },
    {
      title: 'Assignee',
      dataIndex: 'who',
      key: 'who',
      responsive: ['md'],
      render: (who) => (
        <Text style={{ fontSize: 12 }}>
          {who ? (
            <>
              <UserOutlined /> {who}
            </>
          ) : (
            <Text type="warning">Unassigned</Text>
          )}
        </Text>
      ),
    },
    {
      title: 'Due',
      dataIndex: 'due',
      key: 'due',
      responsive: ['lg'],
      render: (due, t) => {
        if (!due) return <Text type="secondary">—</Text>;
        const isOverdue = !t.done && due < '2026-10-08';
        return (
          <Text type={isOverdue ? 'danger' : 'secondary'} style={{ fontSize: 12 }}>
            {isOverdue && <WarningOutlined />} {due}
          </Text>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'done',
      key: 'done',
      render: (done) =>
        done ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Done
          </Tag>
        ) : (
          <Tag icon={<ClockCircleOutlined />} color="processing">
            In Progress
          </Tag>
        ),
    },
    {
      title: 'Comments',
      key: 'comments',
      render: (_, t) => (
        <Text
          style={{ fontSize: 11, color: '#6366f1', cursor: 'pointer' }}
          onClick={() => {
            setActiveTab(`comments-${t.gid}`);
          }}
        >
          <CommentOutlined /> View/Add
        </Text>
      ),
    },
  ];

  const insight = getProjectInsights(record.proj);

  // Build tabs: Tasks + Insights + one Comments tab per task
  const tabItems = [
    {
      key: 'tasks',
      label: (
        <Space size={4}>
          <ClockCircleOutlined />
          Tasks ({record.total})
        </Space>
      ),
      children: (
        <Table
          columns={taskCols}
          dataSource={record.tasks.map((t) => ({ ...t, key: t.gid }))}
          pagination={false}
          size="small"
        />
      ),
    },
    {
      key: 'insights',
      label: (
        <Space size={4}>
          <BarChartOutlined style={{ color: '#6366f1' }} />
          AI Insights
        </Space>
      ),
      children: (
        <div style={{ padding: '8px 0' }}>
          <AIInsightPanel insight={insight} />
        </div>
      ),
    },
    // One comments tab per task
    ...record.tasks.map((t) => ({
      key: `comments-${t.gid}`,
      label: (
        <Space size={4}>
          <CommentOutlined />
          <Text style={{ fontSize: 12 }} ellipsis>
            {t.n.length > 20 ? t.n.slice(0, 20) + '…' : t.n}
          </Text>
        </Space>
      ),
      children: (
        <div style={{ padding: '8px 0' }}>
          <TaskComments taskGid={t.gid} taskName={t.n} projectGid={record.gid} />
        </div>
      ),
    })),
  ];

  return (
    <div style={{ padding: '8px 16px', background: '#fafafa', borderRadius: 4 }}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="small"
        tabBarStyle={{ marginBottom: 12 }}
      />
    </div>
  );
};

const Projects = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const openInsightDrawer = (record) => {
    setSelectedProject(record);
    setDrawerOpen(true);
  };

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={4} style={{ marginBottom: 4 }}>
            Active Projects
          </Title>
          <Text type="secondary">03.Active Projects portfolio · 6 grant research studies</Text>
        </Col>
      </Row>

      <SectionLabel style={{ marginTop: 0 }}>
        Grant Projects — click a row to expand tasks, insights &amp; comments
      </SectionLabel>

      <Card>
        <Table
          columns={[
            ...columns,
            {
              title: 'Quick Insights',
              key: 'quickInsights',
              render: (_, r) => (
                <Text
                  style={{
                    fontSize: 11,
                    color: '#6366f1',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    openInsightDrawer(r);
                  }}
                >
                  <BarChartOutlined /> AI →
                </Text>
              ),
            },
          ]}
          dataSource={rows}
          expandable={{
            expandedRowRender: (record) => <ExpandedRow record={record} />,
          }}
          pagination={false}
          size="small"
          scroll={{ x: 700 }}
        />
      </Card>

      {/* Quick-access AI Insight Drawer */}
      <Drawer
        title={
          <Space>
            <BarChartOutlined style={{ color: '#6366f1' }} />
            <span>AI Project Insights</span>
            {selectedProject && (
              <Tag
                color={
                  selectedProject.score >= 80
                    ? 'success'
                    : selectedProject.score >= 60
                      ? 'warning'
                      : 'error'
                }
              >
                {selectedProject.label}
              </Tag>
            )}
          </Space>
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={480}
        styles={{ body: { padding: 16 } }}
      >
        {selectedProject && (
          <>
            <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 12 }}>
              {selectedProject.name}
            </Text>
            <AIInsightPanel insight={getProjectInsights(selectedProject.proj)} />

            <div style={{ marginTop: 16 }}>
              <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
                <CommentOutlined style={{ color: '#6366f1', marginRight: 6 }} />
                Task Comments
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Expand a project row → Comments tab to view and add task comments
              </Text>
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default Projects;

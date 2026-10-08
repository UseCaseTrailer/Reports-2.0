import { Table, Tag, Progress, Space, Typography, Card, Row, Col, Badge } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import SectionLabel from '../../components/SectionLabel';
import { PORTFOLIOS, scoreHealth, healthGrade } from '../../data/pmoData';

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
  };
});

const columns = [
  {
    title: 'Grant ID / Project',
    dataIndex: 'name',
    key: 'name',
    render: (text, r) => (
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

const expandedRowRender = (record) => {
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
  ];
  return (
    <Table
      columns={taskCols}
      dataSource={record.tasks.map((t) => ({ ...t, key: t.gid }))}
      pagination={false}
      size="small"
    />
  );
};

const Projects = () => (
  <div>
    <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
      <Col>
        <Title level={4} style={{ marginBottom: 4 }}>
          Active Projects
        </Title>
        <Text type="secondary">03.Active Projects portfolio · 6 grant research studies</Text>
      </Col>
    </Row>

    <SectionLabel style={{ marginTop: 0 }}>Grant Projects (click to expand tasks)</SectionLabel>

    <Card>
      <Table
        columns={columns}
        dataSource={rows}
        expandable={{ expandedRowRender }}
        pagination={false}
        size="small"
        scroll={{ x: 700 }}
      />
    </Card>
  </div>
);

export default Projects;

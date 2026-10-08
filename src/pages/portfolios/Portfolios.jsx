import { Row, Col, Card, Progress, Tag, Space, Typography, Statistic, Divider } from 'antd';
import {
  TrophyOutlined,
  ProjectOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import SectionLabel from '../../components/SectionLabel';
import { PORTFOLIOS, scoreHealth, healthGrade } from '../../data/pmoData';

const { Title, Text } = Typography;

const PortfolioCard = ({ portfolio }) => {
  const allTasks = portfolio.projects.flatMap((p) => p.tasks);
  const hs = scoreHealth(allTasks);
  const grade = healthGrade(hs.v);

  return (
    <Card
      hoverable
      style={{ height: '100%', borderTop: `3px solid ${portfolio.color}` }}
      title={
        <Space>
          <TrophyOutlined style={{ color: portfolio.color }} />
          <Text strong>{portfolio.name}</Text>
        </Space>
      }
      extra={<Tag color={grade.tag}>{grade.label}</Tag>}
    >
      <Row gutter={[16, 16]} align="middle">
        <Col span={8} style={{ textAlign: 'center' }}>
          <Progress
            type="circle"
            percent={hs.v}
            size={80}
            strokeColor={grade.color}
            format={(p) => (
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{p}</div>
                <div style={{ fontSize: 10, color: '#888' }}>health</div>
              </div>
            )}
          />
        </Col>
        <Col span={16}>
          <Row gutter={[8, 8]}>
            <Col span={12}>
              <Statistic
                title={<Text style={{ fontSize: 11 }}>Projects</Text>}
                value={portfolio.projects.length}
                prefix={<ProjectOutlined />}
                valueStyle={{ fontSize: 20 }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title={<Text style={{ fontSize: 11 }}>Tasks</Text>}
                value={hs.N}
                valueStyle={{ fontSize: 20 }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title={<Text style={{ fontSize: 11, color: '#52c41a' }}>Done</Text>}
                value={hs.done}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ fontSize: 20, color: '#52c41a' }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title={<Text style={{ fontSize: 11, color: '#ff4d4f' }}>Overdue</Text>}
                value={hs.ov}
                prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />}
                valueStyle={{ fontSize: 20, color: hs.ov > 0 ? '#ff4d4f' : '#52c41a' }}
              />
            </Col>
          </Row>
        </Col>
      </Row>

      <Divider style={{ margin: '12px 0' }} />

      <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>
        Projects
      </Text>
      <div style={{ marginTop: 8 }}>
        {portfolio.projects.map((proj) => {
          const ph = scoreHealth(proj.tasks);
          const pg = healthGrade(ph.v);
          return (
            <div
              key={proj.gid}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '4px 0',
                borderBottom: '1px solid var(--ant-color-split, #f0f0f0)',
              }}
            >
              <Space size={4}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: pg.color,
                    flexShrink: 0,
                  }}
                />
                <Text style={{ fontSize: 12 }} ellipsis={{ tooltip: proj.name }}>
                  {proj.name}
                </Text>
              </Space>
              <Space size={4}>
                {proj.end && (
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    <ClockCircleOutlined /> {proj.end}
                  </Text>
                )}
                <Progress
                  percent={ph.cp}
                  size="small"
                  style={{ width: 60 }}
                  showInfo={false}
                  strokeColor={pg.color}
                />
              </Space>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

const Portfolios = () => (
  <div>
    <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
      <Col>
        <Title level={4} style={{ marginBottom: 4 }}>
          Portfolio Overview
        </Title>
        <Text type="secondary">All portfolios and their project health at a glance</Text>
      </Col>
    </Row>

    <SectionLabel style={{ marginTop: 0 }}>Active Portfolios</SectionLabel>

    <Row gutter={[16, 16]}>
      {PORTFOLIOS.map((portfolio) => (
        <Col xs={24} lg={12} key={portfolio.gid}>
          <PortfolioCard portfolio={portfolio} />
        </Col>
      ))}
    </Row>
  </div>
);

export default Portfolios;

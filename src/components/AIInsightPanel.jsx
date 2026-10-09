import { Card, Space, Typography, Tag, Row, Col, Divider, Progress } from 'antd';
import {
  CheckCircleOutlined,
  WarningOutlined,
  BulbOutlined,
  RiseOutlined,
  AlertOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

const InsightSection = ({ icon, color, title, items }) => (
  <div style={{ marginBottom: 12 }}>
    <Space style={{ marginBottom: 6 }}>
      {icon}
      <Text strong style={{ fontSize: 12, color }}>
        {title}
      </Text>
    </Space>
    <ul style={{ margin: 0, paddingLeft: 18 }}>
      {items.map((item, i) => (
        <li key={i}>
          <Text style={{ fontSize: 12 }}>{item}</Text>
        </li>
      ))}
    </ul>
  </div>
);

/**
 * AIInsightPanel
 * Props:
 *   insight — object from insightsEngine.getProjectInsights() or getDeptProjectInsights()
 *   compact — boolean, show collapsed view
 *   style   — additional card style
 */
const AIInsightPanel = ({ insight, compact = false, style = {} }) => {
  if (!insight) return null;

  const { goingWell, concerns, attention, benchmarks, score, label, color, completionPct } =
    insight;

  if (compact) {
    return (
      <Card
        size="small"
        style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid #e8e8e8', ...style }}
      >
        <Row gutter={[12, 8]} align="middle">
          <Col flex="none">
            <Progress
              type="circle"
              percent={score}
              size={48}
              strokeColor={color}
              format={(p) => <span style={{ fontSize: 11, fontWeight: 700 }}>{p}</span>}
            />
          </Col>
          <Col flex="auto">
            <Tag color={score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error'}>{label}</Tag>
            <div style={{ marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {concerns[0]}
              </Text>
            </div>
          </Col>
        </Row>
      </Card>
    );
  }

  return (
    <Card
      size="small"
      style={{ background: 'rgba(99,102,241,0.03)', border: '1px solid #ede9fe', ...style }}
      title={
        <Space>
          <BulbOutlined style={{ color: '#6366f1' }} />
          <Text strong style={{ fontSize: 13, color: '#6366f1' }}>
            AI Insights
          </Text>
          <Tag color={score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error'}>{label}</Tag>
          {score !== undefined && (
            <Progress
              type="circle"
              percent={score}
              size={28}
              strokeColor={color}
              format={(p) => <span style={{ fontSize: 9, fontWeight: 700 }}>{p}</span>}
            />
          )}
        </Space>
      }
    >
      {completionPct !== undefined && insight.timeElapsed !== null && (
        <>
          <Row gutter={[16, 0]} style={{ marginBottom: 12 }}>
            <Col span={12}>
              <Text type="secondary" style={{ fontSize: 11 }}>
                Tasks completed
              </Text>
              <Progress
                percent={completionPct}
                size="small"
                strokeColor={color}
                style={{ marginTop: 2 }}
              />
            </Col>
            <Col span={12}>
              <Text type="secondary" style={{ fontSize: 11 }}>
                Timeline elapsed
              </Text>
              <Progress
                percent={insight.timeElapsed}
                size="small"
                strokeColor="#94a3b8"
                style={{ marginTop: 2 }}
              />
            </Col>
          </Row>
          {insight.scheduleVariance !== null && (
            <div style={{ marginBottom: 10 }}>
              <Text
                style={{
                  fontSize: 12,
                  color: insight.scheduleVariance >= 0 ? '#52c41a' : '#ff4d4f',
                  fontWeight: 600,
                }}
              >
                {insight.scheduleVariance >= 0
                  ? `▲ ${insight.scheduleVariance}% ahead of schedule`
                  : `▼ ${Math.abs(insight.scheduleVariance)}% behind schedule`}
              </Text>
              {insight.daysRemaining !== null && (
                <Text type="secondary" style={{ fontSize: 11, marginLeft: 12 }}>
                  {insight.daysRemaining > 0
                    ? `${insight.daysRemaining} days remaining`
                    : `${Math.abs(insight.daysRemaining)} days overdue`}
                </Text>
              )}
              {insight.projectedEnd && insight.projectedEnd !== 'Complete' && (
                <Text type="secondary" style={{ fontSize: 11, marginLeft: 12 }}>
                  · Projected end: {insight.projectedEnd}
                </Text>
              )}
            </div>
          )}
          <Divider style={{ margin: '8px 0' }} />
        </>
      )}

      <InsightSection
        icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
        color="#52c41a"
        title="What's Going Well"
        items={goingWell}
      />

      <InsightSection
        icon={<WarningOutlined style={{ color: '#ff4d4f' }} />}
        color="#ff4d4f"
        title="Concerns"
        items={concerns}
      />

      <InsightSection
        icon={<AlertOutlined style={{ color: '#faad14' }} />}
        color="#faad14"
        title="Attention Needed"
        items={attention}
      />

      {benchmarks && benchmarks.length > 0 && (
        <InsightSection
          icon={<RiseOutlined style={{ color: '#6366f1' }} />}
          color="#6366f1"
          title="Industry Benchmarks"
          items={benchmarks}
        />
      )}
    </Card>
  );
};

export default AIInsightPanel;

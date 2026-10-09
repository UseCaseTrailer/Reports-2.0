import { useState } from 'react';
import { Row, Col, Card, Progress, Tag, Space, Typography, Statistic, Divider, Drawer } from 'antd';
import {
  TrophyOutlined,
  ProjectOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
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
import SectionLabel from '../../components/SectionLabel';
import AIInsightPanel from '../../components/AIInsightPanel';
import { PORTFOLIOS, scoreHealth, healthGrade } from '../../data/pmoData';
import { getPortfolioInsights } from '../../data/insightsEngine';

const { Title, Text } = Typography;

// ── Comparison data for cross-portfolio charts ──
const portfolioChartData = PORTFOLIOS.map((portfolio) => {
  const allTasks = portfolio.projects.flatMap((p) => p.tasks);
  const hs = scoreHealth(allTasks);
  return {
    name: portfolio.name.length > 18 ? portfolio.name.slice(0, 18) + '…' : portfolio.name,
    fullName: portfolio.name,
    Done: hs.done,
    Overdue: hs.ov,
    Remaining: hs.N - hs.done - hs.ov,
    Health: hs.v,
    Projects: portfolio.projects.length,
    portfolio,
  };
});

// Status distribution across all portfolios
const allTasks = PORTFOLIOS.flatMap((p) => p.projects.flatMap((pr) => pr.tasks));
const allDone = allTasks.filter((t) => t.done).length;
const allOverdue = allTasks.filter((t) => !t.done && t.due && t.due < '2026-10-08').length;
const allUnassigned = allTasks.filter((t) => !t.who).length;
const allInProgress = allTasks.length - allDone - allOverdue;

const statusPieData = [
  { name: 'Done', value: allDone, color: '#52c41a' },
  { name: 'In Progress', value: Math.max(0, allInProgress), color: '#6366f1' },
  { name: 'Overdue', value: allOverdue, color: '#ff4d4f' },
  { name: 'Unassigned', value: allUnassigned, color: '#faad14' },
].filter((d) => d.value > 0);

const PortfolioCard = ({ portfolio, onInsightClick }) => {
  const allTasks = portfolio.projects.flatMap((p) => p.tasks);
  const hs = scoreHealth(allTasks);
  const grade = healthGrade(hs.v);

  return (
    <Card
      hoverable
      style={{ height: '100%', borderTop: `3px solid ${portfolio.color}`, cursor: 'pointer' }}
      title={
        <Space>
          <TrophyOutlined style={{ color: portfolio.color }} />
          <Text strong>{portfolio.name}</Text>
        </Space>
      }
      extra={
        <Space>
          <Tag color={grade.tag}>{grade.label}</Tag>
          <Text
            style={{ fontSize: 11, color: '#6366f1', cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation();
              onInsightClick(portfolio);
            }}
          >
            <BarChartOutlined /> Insights →
          </Text>
        </Space>
      }
      onClick={() => onInsightClick(portfolio)}
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

      <Text type="secondary" style={{ fontSize: 10, marginTop: 8, display: 'block' }}>
        Click card for AI insights →
      </Text>
    </Card>
  );
};

// Custom bar tooltip
const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const item = portfolioChartData.find((d) => d.name === label);
  return (
    <Card size="small" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
      <Text strong style={{ fontSize: 12 }}>
        {item?.fullName || label}
      </Text>
      {payload.map((p) => (
        <div key={p.dataKey}>
          <Text style={{ fontSize: 12, color: p.fill }}>
            {p.dataKey}: {p.value} tasks
          </Text>
        </div>
      ))}
      {item && (
        <Tag
          color={item.Health >= 80 ? 'success' : item.Health >= 60 ? 'warning' : 'error'}
          style={{ marginTop: 4, fontSize: 11 }}
        >
          Health: {item.Health}
        </Tag>
      )}
      <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
        Click for AI insights →
      </Text>
    </Card>
  );
};

const Portfolios = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState('');
  const [drawerInsight, setDrawerInsight] = useState(null);

  const openPortfolioInsight = (portfolio) => {
    const insight = getPortfolioInsights(portfolio);
    // Build a synthetic insight object for the AIInsightPanel
    setDrawerTitle(portfolio.name);
    setDrawerInsight({
      name: portfolio.name,
      score: insight.avgScore,
      label: insight.avgScore >= 80 ? 'On Track' : insight.avgScore >= 60 ? 'At Risk' : 'Off Track',
      color: insight.avgScore >= 80 ? '#52c41a' : insight.avgScore >= 60 ? '#faad14' : '#ff4d4f',
      completionPct: null,
      timeElapsed: null,
      scheduleVariance: null,
      daysRemaining: null,
      projectedEnd: null,
      goingWell: [
        `${insight.onTrack} of ${portfolio.projects.length} projects on track`,
        `Average health score: ${insight.avgScore}/100`,
        ...insight.projectInsights
          .filter((pi) => pi.score >= 80)
          .slice(0, 2)
          .map((pi) => `${pi.name}: ${pi.label}`),
      ],
      concerns: [
        ...(insight.offTrack > 0
          ? [`${insight.offTrack} project(s) off track`]
          : ['No off-track projects']),
        ...insight.topIssues.slice(0, 2),
      ],
      attention: [
        ...(insight.atRisk > 0 ? [`${insight.atRisk} project(s) at risk — monitor closely`] : []),
        ...insight.projectInsights
          .filter((pi) => pi.overdueTasks > 0)
          .slice(0, 2)
          .map((pi) => `${pi.name}: ${pi.overdueTasks} overdue tasks`),
        'Review resource allocation across portfolio',
      ].filter(Boolean),
      benchmarks: [
        `Industry avg portfolio health: 72/100 — you score ${insight.avgScore > 72 ? 'above' : 'below'} average`,
        `${Math.round((insight.onTrack / portfolio.projects.length) * 100)}% on-track rate (target: ≥70%)`,
        `Portfolio size: ${portfolio.projects.length} projects — optimal range for exec oversight`,
      ],
    });
    setDrawerOpen(true);
  };

  const handleBarClick = (data) => {
    if (!data?.activePayload?.[0]) return;
    const item = portfolioChartData.find((d) => d.name === data.activeLabel);
    if (item) openPortfolioInsight(item.portfolio);
  };

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={4} style={{ marginBottom: 4 }}>
            Portfolio Overview
          </Title>
          <Text type="secondary">All portfolios and their project health at a glance</Text>
        </Col>
      </Row>

      {/* ── Cross-Portfolio Analytics ── */}
      <SectionLabel style={{ marginTop: 0 }}>
        <BarChartOutlined style={{ marginRight: 6 }} />
        Cross-Portfolio Analytics — Click charts for AI insights
      </SectionLabel>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Stacked task completion comparison */}
        <Col xs={24} lg={15}>
          <Card
            size="small"
            title={
              <Text strong style={{ fontSize: 13 }}>
                Task Breakdown by Portfolio
              </Text>
            }
          >
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 8 }}>
              Click a bar segment to open AI portfolio insights
            </Text>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={portfolioChartData}
                onClick={handleBarClick}
                style={{ cursor: 'pointer' }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-10}
                  textAnchor="end"
                  height={36}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend iconType="square" wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Done" stackId="a" fill="#52c41a" name="Done" />
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

        {/* Task status distribution pie */}
        <Col xs={24} lg={9}>
          <Card
            size="small"
            title={
              <Text strong style={{ fontSize: 13 }}>
                Overall Task Status
              </Text>
            }
            style={{ height: '100%' }}
          >
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="45%"
                  outerRadius={65}
                  dataKey="value"
                  label={({ value }) => value}
                  labelLine={true}
                >
                  {statusPieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} tasks`, name]} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Portfolio health comparison bar */}
      <Card
        size="small"
        title={
          <Text strong style={{ fontSize: 13 }}>
            Portfolio Health Scores
          </Text>
        }
        style={{ marginBottom: 24 }}
      >
        <Row gutter={[16, 8]}>
          {PORTFOLIOS.map((portfolio) => {
            const allTasks = portfolio.projects.flatMap((p) => p.tasks);
            const hs = scoreHealth(allTasks);
            const grade = healthGrade(hs.v);
            return (
              <Col xs={24} sm={12} key={portfolio.gid}>
                <div
                  role="button"
                  tabIndex={0}
                  style={{ cursor: 'pointer', padding: '6px 0' }}
                  onClick={() => openPortfolioInsight(portfolio)}
                  onKeyDown={(e) => e.key === 'Enter' && openPortfolioInsight(portfolio)}
                >
                  <Row justify="space-between">
                    <Space size={4}>
                      <span style={{ color: portfolio.color }}>■</span>
                      <Text style={{ fontSize: 12 }}>{portfolio.name}</Text>
                    </Space>
                    <Tag color={grade.tag}>{hs.v}/100</Tag>
                  </Row>
                  <Progress
                    percent={hs.v}
                    size="small"
                    showInfo={false}
                    strokeColor={grade.color}
                    style={{ marginTop: 4 }}
                  />
                </div>
              </Col>
            );
          })}
        </Row>
        <Text type="secondary" style={{ fontSize: 10, marginTop: 4, display: 'block' }}>
          Click a portfolio bar to open AI insights
        </Text>
      </Card>

      <SectionLabel>Active Portfolios</SectionLabel>

      <Row gutter={[16, 16]}>
        {PORTFOLIOS.map((portfolio) => (
          <Col xs={24} lg={12} key={portfolio.gid}>
            <PortfolioCard portfolio={portfolio} onInsightClick={openPortfolioInsight} />
          </Col>
        ))}
      </Row>

      {/* AI Insight Drawer */}
      <Drawer
        title={
          <Space>
            <BarChartOutlined style={{ color: '#6366f1' }} />
            <span>AI Portfolio Insights</span>
            {drawerInsight && (
              <Tag
                color={
                  drawerInsight.score >= 80
                    ? 'success'
                    : drawerInsight.score >= 60
                      ? 'warning'
                      : 'error'
                }
              >
                {drawerInsight.label}
              </Tag>
            )}
          </Space>
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={480}
        styles={{ body: { padding: 16 } }}
      >
        {drawerInsight && (
          <>
            <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 12 }}>
              {drawerTitle}
            </Text>
            <AIInsightPanel insight={drawerInsight} />
          </>
        )}
      </Drawer>
    </div>
  );
};

export default Portfolios;

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  List,
  Avatar,
  Typography,
  Input,
  Button,
  Space,
  Alert,
  Spin,
  Empty,
  Tag,
  Divider,
} from 'antd';
import { CommentOutlined, SendOutlined, UserOutlined, LinkOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { TextArea } = Input;

/**
 * Format ISO timestamp to readable relative/absolute date.
 */
function formatDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 2) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso.slice(0, 10);
  }
}

/**
 * TaskComments
 *
 * Props:
 *   taskGid   — Asana task GID (string). If it's a synthetic GID (like 't1', 'g002a'),
 *               the component shows a demo placeholder.
 *   taskName  — Display name for the task header
 *   projectGid — Optional Asana project GID shown as a link
 */
const TaskComments = ({ taskGid, taskName, projectGid }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [apiReady, setApiReady] = useState(null); // null=unknown, true=ready, false=not configured

  // Detect synthetic GIDs (not real Asana GIDs)
  const isSyntheticGid = !taskGid || /^[a-z]+\d+$/.test(taskGid) || taskGid.length < 8;

  const fetchComments = useCallback(async () => {
    if (isSyntheticGid) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/task-comments?taskGid=${encodeURIComponent(taskGid)}`);
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 503) {
          setApiReady(false);
        } else {
          setError(data.error || 'Failed to load comments');
        }
      } else {
        setApiReady(true);
        setComments(data.data || []);
      }
    } catch {
      setError('Network error — unable to reach the API');
    } finally {
      setLoading(false);
    }
  }, [taskGid, isSyntheticGid]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchComments();
  }, [fetchComments]);

  const handlePost = async () => {
    if (!newComment.trim() || isSyntheticGid || posting) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch('/api/add-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskGid, text: newComment.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to post comment');
      } else {
        // Optimistically add the new comment
        setComments((prev) => [
          ...prev,
          {
            gid: data.data?.gid || Date.now().toString(),
            type: 'comment',
            text: newComment.trim(),
            created_at: new Date().toISOString(),
            created_by: { name: 'Damola Egbeyemi' },
          },
        ]);
        setNewComment('');
      }
    } catch {
      setError('Network error — unable to post comment');
    } finally {
      setPosting(false);
    }
  };

  // Render placeholder for synthetic GIDs
  if (isSyntheticGid) {
    return (
      <Card
        size="small"
        title={
          <Space>
            <CommentOutlined style={{ color: '#6366f1' }} />
            <Text strong>Task Comments</Text>
            {taskName && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                — {taskName}
              </Text>
            )}
          </Space>
        }
      >
        <Alert
          type="info"
          message="Live Asana comments require real task GIDs"
          description={
            <div>
              <p style={{ marginBottom: 6 }}>
                This dashboard is showing demo data with synthetic task identifiers. To see real
                Asana comments:
              </p>
              <ol style={{ margin: 0, paddingLeft: 20 }}>
                <li>
                  Replace synthetic GIDs (e.g. &quot;t1&quot;, &quot;g002a&quot;) with real Asana
                  task GIDs in <code>src/data/pmoData.js</code>
                </li>
                <li>
                  Add <code>ASANA_PAT</code> to your Vercel environment variables
                </li>
                <li>Redeploy</li>
              </ol>
              {projectGid && (
                <div style={{ marginTop: 8 }}>
                  <a
                    href={`https://app.asana.com/0/${projectGid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <LinkOutlined /> Open project in Asana
                  </a>
                </div>
              )}
            </div>
          }
          showIcon
          style={{ marginBottom: 0 }}
        />
      </Card>
    );
  }

  // Render "API not configured" state
  if (apiReady === false) {
    return (
      <Card
        size="small"
        title={
          <Space>
            <CommentOutlined style={{ color: '#6366f1' }} />
            <Text strong>Task Comments</Text>
          </Space>
        }
      >
        <Alert
          type="warning"
          message="Asana API not configured"
          description={
            <span>
              Add <code>ASANA_PAT</code> as an environment variable in your Vercel project settings,
              then redeploy.{' '}
              <a
                href="https://support.asana.com/hc/en-us/articles/115003493235-Personal-Access-Token"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get your PAT →
              </a>
            </span>
          }
          showIcon
        />
      </Card>
    );
  }

  return (
    <Card
      size="small"
      title={
        <Space>
          <CommentOutlined style={{ color: '#6366f1' }} />
          <Text strong>Task Comments</Text>
          {taskName && (
            <Text type="secondary" style={{ fontSize: 12, maxWidth: 300 }} ellipsis>
              — {taskName}
            </Text>
          )}
          {comments.length > 0 && <Tag color="blue">{comments.length}</Tag>}
          {projectGid && (
            <a
              href={`https://app.asana.com/0/${projectGid}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 12 }}
            >
              <LinkOutlined /> Asana
            </a>
          )}
        </Space>
      }
      extra={
        <Button size="small" onClick={fetchComments} loading={loading}>
          Refresh
        </Button>
      }
    >
      {error && (
        <Alert
          type="error"
          message={error}
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 12 }}
        />
      )}

      {loading && comments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin tip="Loading comments from Asana…" />
        </div>
      ) : comments.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span>
              No comments yet.{' '}
              <Text type="secondary" style={{ fontSize: 12 }}>
                Be the first to comment on this task.
              </Text>
            </span>
          }
          style={{ margin: '16px 0' }}
        />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={comments}
          style={{ maxHeight: 320, overflowY: 'auto', marginBottom: 12 }}
          renderItem={(comment) => (
            <List.Item style={{ padding: '8px 0', alignItems: 'flex-start' }}>
              <List.Item.Meta
                avatar={
                  <Avatar
                    icon={<UserOutlined />}
                    size={28}
                    style={{ background: '#6366f1', flexShrink: 0 }}
                  />
                }
                title={
                  <Space size={8}>
                    <Text strong style={{ fontSize: 12 }}>
                      {comment.created_by?.name || 'Unknown'}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {formatDate(comment.created_at)}
                    </Text>
                  </Space>
                }
                description={
                  <Text
                    style={{
                      fontSize: 13,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {comment.text}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
      )}

      <Divider style={{ margin: '8px 0' }} />

      <Space.Compact style={{ width: '100%' }}>
        <TextArea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment — this will post to Asana in real-time…"
          autoSize={{ minRows: 2, maxRows: 4 }}
          onPressEnter={(e) => {
            if (e.shiftKey) return; // allow Shift+Enter for newline
            e.preventDefault();
            handlePost();
          }}
          style={{ fontSize: 13 }}
        />
      </Space.Compact>
      <div style={{ textAlign: 'right', marginTop: 8 }}>
        <Button
          type="primary"
          icon={<SendOutlined />}
          loading={posting}
          disabled={!newComment.trim()}
          onClick={handlePost}
          size="small"
          style={{ background: '#6366f1', borderColor: '#6366f1' }}
        >
          Post to Asana
        </Button>
      </div>
    </Card>
  );
};

export default TaskComments;

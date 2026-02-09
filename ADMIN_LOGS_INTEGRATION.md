# Add Logs Viewer to Existing Admin Panel

This guide shows how to add app logs viewing to your existing admin dashboard.

---

## Backend API Endpoints

Add these to your existing admin routes:

```python
# In your admin router (e.g., routes/admin.py or similar)
from datetime import datetime, timedelta
from typing import Optional

@router.get("/logs")
async def get_app_logs(
    level: Optional[str] = None,  # 'error', 'warn', 'info', 'network'
    user_id: Optional[int] = None,
    hours: int = 24,  # Last N hours
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)  # Your existing admin check
):
    """
    Get app logs with filters
    Integrate into existing admin panel
    """
    query = db.query(AppLog).join(User)
    
    # Filter by time
    since = datetime.utcnow() - timedelta(hours=hours)
    query = query.filter(AppLog.timestamp >= since)
    
    # Filter by level
    if level:
        query = query.filter(AppLog.level == level)
    
    # Filter by user
    if user_id:
        query = query.filter(AppLog.user_id == user_id)
    
    logs = query.order_by(AppLog.timestamp.desc()).limit(limit).all()
    
    return {
        "logs": [
            {
                "id": log.id,
                "timestamp": log.timestamp.isoformat(),
                "level": log.level,
                "message": log.message,
                "user_id": log.user_id,
                "user_email": log.user.email if log.user else None,
                "app_version": log.app_version,
                "platform": log.platform
            }
            for log in logs
        ],
        "total": len(logs),
        "filters": {
            "level": level,
            "user_id": user_id,
            "hours": hours
        }
    }

@router.get("/logs/stats")
async def get_log_stats(
    hours: int = 24,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """
    Get log statistics for dashboard widgets
    """
    since = datetime.utcnow() - timedelta(hours=hours)
    
    # Count by level
    error_count = db.query(AppLog).filter(
        AppLog.level == 'error',
        AppLog.timestamp >= since
    ).count()
    
    warn_count = db.query(AppLog).filter(
        AppLog.level == 'warn',
        AppLog.timestamp >= since
    ).count()
    
    total_count = db.query(AppLog).filter(
        AppLog.timestamp >= since
    ).count()
    
    # Top error messages
    top_errors = db.query(
        func.substring(AppLog.message, 1, 100).label('error_msg'),
        func.count().label('count')
    ).filter(
        AppLog.level == 'error',
        AppLog.timestamp >= since
    ).group_by('error_msg').order_by(func.count().desc()).limit(5).all()
    
    # Users with most errors
    top_error_users = db.query(
        User.email,
        func.count(AppLog.id).label('error_count')
    ).join(AppLog).filter(
        AppLog.level == 'error',
        AppLog.timestamp >= since
    ).group_by(User.email).order_by(func.count(AppLog.id).desc()).limit(5).all()
    
    return {
        "period_hours": hours,
        "total_logs": total_count,
        "errors": error_count,
        "warnings": warn_count,
        "info": total_count - error_count - warn_count,
        "top_errors": [
            {"message": e[0], "count": e[1]} 
            for e in top_errors
        ],
        "top_error_users": [
            {"email": u[0], "count": u[1]} 
            for u in top_error_users
        ]
    }

@router.delete("/logs/cleanup")
async def cleanup_old_logs(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """
    Delete logs older than specified days
    """
    cutoff = datetime.utcnow() - timedelta(days=days)
    deleted = db.query(AppLog).filter(AppLog.timestamp < cutoff).delete()
    db.commit()
    
    return {
        "deleted": deleted,
        "cutoff_date": cutoff.isoformat()
    }
```

---

## Frontend Component (React/Next.js Example)

If your admin is web-based, add this component:

```jsx
// AdminLogsViewer.jsx
import React, { useState, useEffect } from 'react';
import { Card, Table, Select, Button, Badge, Statistic, Row, Col } from 'antd'; // or your UI lib

const AdminLogsViewer = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    level: null,
    hours: 24,
    limit: 100
  });

  useEffect(() => {
    fetchLogs();
    fetchStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchLogs();
      fetchStats();
    }, 30000);
    return () => clearInterval(interval);
  }, [filters]);

  const fetchLogs = async () => {
    setLoading(true);
    const params = new URLSearchParams(filters);
    const response = await fetch(`/api/admin/logs?${params}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
    });
    const data = await response.json();
    setLogs(data.logs);
    setLoading(false);
  };

  const fetchStats = async () => {
    const response = await fetch(`/api/admin/logs/stats?hours=${filters.hours}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
    });
    const data = await response.json();
    setStats(data);
  };

  const handleCleanup = async () => {
    if (confirm('Delete logs older than 30 days?')) {
      await fetch('/api/admin/logs/cleanup', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
      });
      alert('Old logs deleted');
      fetchLogs();
    }
  };

  const columns = [
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (time) => new Date(time).toLocaleString()
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level) => {
        const colors = {
          error: 'red',
          warn: 'orange',
          info: 'blue',
          network: 'purple'
        };
        return <Badge color={colors[level]} text={level.toUpperCase()} />;
      }
    },
    {
      title: 'User',
      dataIndex: 'user_email',
      key: 'user_email',
      width: 200
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      render: (msg) => <div style={{ maxWidth: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg}</div>
    },
    {
      title: 'Version',
      dataIndex: 'app_version',
      key: 'app_version',
      width: 100
    }
  ];

  return (
    <div>
      <h1>App Logs</h1>
      
      {/* Stats Cards */}
      {stats && (
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={6}>
            <Card>
              <Statistic title="Total Logs" value={stats.total_logs} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Errors" value={stats.errors} valueStyle={{ color: '#cf1322' }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Warnings" value={stats.warnings} valueStyle={{ color: '#fa8c16' }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Info" value={stats.info} valueStyle={{ color: '#1890ff' }} />
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Select
            placeholder="Filter by level"
            style={{ width: 150 }}
            value={filters.level}
            onChange={(val) => setFilters({ ...filters, level: val })}
            allowClear
          >
            <Select.Option value="error">Errors</Select.Option>
            <Select.Option value="warn">Warnings</Select.Option>
            <Select.Option value="info">Info</Select.Option>
            <Select.Option value="network">Network</Select.Option>
          </Select>

          <Select
            style={{ width: 150 }}
            value={filters.hours}
            onChange={(val) => setFilters({ ...filters, hours: val })}
          >
            <Select.Option value={1}>Last 1 hour</Select.Option>
            <Select.Option value={6}>Last 6 hours</Select.Option>
            <Select.Option value={24}>Last 24 hours</Select.Option>
            <Select.Option value={168}>Last 7 days</Select.Option>
          </Select>

          <Button onClick={fetchLogs}>Refresh</Button>
          <Button onClick={handleCleanup} danger>Cleanup Old Logs</Button>
        </div>
      </Card>

      {/* Logs Table */}
      <Card>
        <Table
          dataSource={logs}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 50 }}
          size="small"
        />
      </Card>

      {/* Top Errors */}
      {stats && stats.top_errors.length > 0 && (
        <Card title="Top Errors" style={{ marginTop: 20 }}>
          <ul>
            {stats.top_errors.map((err, i) => (
              <li key={i}>
                <strong>{err.count}x</strong> - {err.message}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default AdminLogsViewer;
```

---

## Simple HTML Version (No Framework)

If your admin is plain HTML/JS:

```html
<!-- Add to your admin panel HTML -->
<div id="logs-viewer">
  <h2>App Logs</h2>
  
  <div class="filters">
    <select id="levelFilter">
      <option value="">All Levels</option>
      <option value="error">Errors</option>
      <option value="warn">Warnings</option>
      <option value="info">Info</option>
    </select>
    
    <select id="hoursFilter">
      <option value="1">Last 1 hour</option>
      <option value="6">Last 6 hours</option>
      <option value="24" selected>Last 24 hours</option>
      <option value="168">Last 7 days</option>
    </select>
    
    <button onclick="fetchLogs()">Refresh</button>
  </div>
  
  <table id="logsTable">
    <thead>
      <tr>
        <th>Time</th>
        <th>Level</th>
        <th>User</th>
        <th>Message</th>
      </tr>
    </thead>
    <tbody id="logsBody">
    </tbody>
  </table>
</div>

<script>
async function fetchLogs() {
  const level = document.getElementById('levelFilter').value;
  const hours = document.getElementById('hoursFilter').value;
  
  const params = new URLSearchParams({ hours, limit: 100 });
  if (level) params.append('level', level);
  
  const response = await fetch(`/api/admin/logs?${params}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
    }
  });
  
  const data = await response.json();
  displayLogs(data.logs);
}

function displayLogs(logs) {
  const tbody = document.getElementById('logsBody');
  tbody.innerHTML = logs.map(log => `
    <tr class="${log.level}">
      <td>${new Date(log.timestamp).toLocaleString()}</td>
      <td><strong>${log.level.toUpperCase()}</strong></td>
      <td>${log.user_email || 'N/A'}</td>
      <td>${log.message}</td>
    </tr>
  `).join('');
}

// Auto-refresh every 30 seconds
setInterval(fetchLogs, 30000);
fetchLogs(); // Initial load
</script>

<style>
#logsTable { width: 100%; border-collapse: collapse; }
#logsTable th, #logsTable td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
#logsTable th { background: #4CAF50; color: white; }
.error { background-color: #ffebee; }
.warn { background-color: #fff3e0; }
.filters { margin-bottom: 20px; }
.filters select, .filters button { margin-right: 10px; padding: 5px; }
</style>
```

---

## Quick Integration Checklist

1. ✅ Add `AppLog` model to your backend database
2. ✅ Add 3 endpoints: `/admin/logs`, `/admin/logs/stats`, `/admin/logs/cleanup`
3. ✅ Add logs viewer component to your existing admin panel
4. ✅ Test by triggering some errors in the app
5. ✅ Set up daily cleanup cron job

---

## One-Line Addition to Admin Nav

```jsx
// In your admin navigation/sidebar
{
  label: 'App Logs',
  icon: <FileTextOutlined />,
  path: '/admin/logs',
  component: <AdminLogsViewer />
}
```

---

## Quick SQL Query (If You Don't Want UI Yet)

```sql
-- Just add this to your existing admin DB tools
CREATE VIEW admin_recent_logs AS
SELECT 
    al.timestamp,
    al.level,
    u.email as user_email,
    al.message,
    al.app_version
FROM app_logs al
JOIN users u ON al.user_id = u.id
WHERE al.timestamp > NOW() - INTERVAL '24 hours'
ORDER BY al.timestamp DESC;

-- Then query it
SELECT * FROM admin_recent_logs WHERE level = 'error';
```

Which approach fits your existing admin setup? React/Next.js, plain HTML, or just SQL queries?

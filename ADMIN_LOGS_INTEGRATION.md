# Admin Logs Viewer Integration

This guide shows how to add app logs viewing to your existing admin dashboard.

**Note:** This uses the R2-based logging system (no SQL database required). See `LOGGER_BACKEND_SETUP.md` for backend setup.

## 🔍 Feature: Search Logs by User

The admin panel supports searching logs by:
- **User Email** - Search for all logs from a specific user email
- **User ID** - Search for all logs from a specific user ID

This allows you to filter and view all logs for a specific user across all time periods, making it easy to debug user-specific issues.

---

## Backend API Endpoints

These endpoints should already exist if you followed `LOGGER_BACKEND_SETUP.md`:

### 1. List Log Files
```python
@router.get("/logs/files")
async def list_log_files(
    date: Optional[str] = None,  # Format: YYYY-MM-DD
    current_user = Depends(require_admin)
):
    """List log files from R2 (admin only)"""
    try:
        prefix = "logs/"
        if date:
            parts = date.split('-')
            prefix = f"logs/{parts[0]}/{parts[1]}/{parts[2]}/"
        
        response = r2_client.list_objects_v2(
            Bucket=BUCKET_NAME,
            Prefix=prefix
        )
        
        files = []
        if 'Contents' in response:
            files = [
                {
                    "key": obj['Key'],
                    "size": obj['Size'],
                    "last_modified": obj['LastModified'].isoformat()
                }
                for obj in response['Contents']
            ]
            files.sort(key=lambda x: x['last_modified'], reverse=True)
        
        return {"files": files, "count": len(files)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### 2. View Log File
```python
@router.get("/logs/view/{file_path:path}")
async def view_log_file(
    file_path: str,
    level: Optional[str] = None,
    current_user = Depends(require_admin)
):
    """View contents of log file from R2 (admin only)"""
    try:
        response = r2_client.get_object(
            Bucket=BUCKET_NAME,
            Key=file_path
        )
        
        log_data = json.loads(response['Body'].read())
        
        if level:
            log_data['logs'] = [
                log for log in log_data['logs'] 
                if log['level'] == level
            ]
        
        return {
            "file": file_path,
            "user_email": log_data.get('user_email'),
            "logs": log_data['logs'],
            "count": len(log_data['logs'])
        }
    except r2_client.exceptions.NoSuchKey:
        raise HTTPException(status_code=404, detail="Log file not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### 3. Get Recent Errors
```python
@router.get("/logs/errors/recent")
async def get_recent_errors(
    hours: int = 24,
    current_user = Depends(require_admin)
):
    """Get all errors from last N hours (admin only)"""
    try:
        now = datetime.now()
        cutoff_time = now - timedelta(hours=hours)
        
        # Get files from recent days
        all_errors = []
        for days_back in range(int(hours / 24) + 2):
            check_date = now - timedelta(days=days_back)
            date_prefix = f"logs/{check_date.year}/{check_date.month:02d}/{check_date.day:02d}/"
            
            response = r2_client.list_objects_v2(
                Bucket=BUCKET_NAME,
                Prefix=date_prefix
            )
            
            if 'Contents' in response:
                for obj in response['Contents']:
                    file_response = r2_client.get_object(
                        Bucket=BUCKET_NAME,
                        Key=obj['Key']
                    )
                    log_data = json.loads(file_response['Body'].read())
                    
                    for log in log_data.get('logs', []):
                        if log['level'] == 'error':
                            log_time = datetime.fromisoformat(log['timestamp'].replace('Z', '+00:00'))
                            if log_time >= cutoff_time:
                                all_errors.append({
                                    "user_id": log_data.get('user_id'),
                                    "user_email": log_data.get('user_email'),
                                    "timestamp": log['timestamp'],
                                    "message": log['message'],
                                    "file": obj['Key']
                                })
        
        all_errors.sort(key=lambda x: x['timestamp'], reverse=True)
        return {"errors": all_errors, "count": len(all_errors)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### 4. Get Log Statistics
```python
@router.get("/logs/stats")
async def get_log_stats(
    hours: int = 24,
    current_user = Depends(require_admin)
):
    """Get log statistics for dashboard widgets"""
    try:
        now = datetime.now()
        cutoff_time = now - timedelta(hours=hours)
        
        stats = {
            "total_logs": 0,
            "errors": 0,
            "warnings": 0,
            "info": 0,
            "top_errors": {},
            "top_error_users": {}
        }
        
        # Scan recent files
        for days_back in range(int(hours / 24) + 2):
            check_date = now - timedelta(days=days_back)
            date_prefix = f"logs/{check_date.year}/{check_date.month:02d}/{check_date.day:02d}/"
            
            response = r2_client.list_objects_v2(
                Bucket=BUCKET_NAME,
                Prefix=date_prefix
            )
            
            if 'Contents' in response:
                for obj in response['Contents']:
                    file_response = r2_client.get_object(
                        Bucket=BUCKET_NAME,
                        Key=obj['Key']
                    )
                    log_data = json.loads(file_response['Body'].read())
                    
                    for log in log_data.get('logs', []):
                        log_time = datetime.fromisoformat(log['timestamp'].replace('Z', '+00:00'))
                        if log_time >= cutoff_time:
                            stats["total_logs"] += 1
                            
                            if log['level'] == 'error':
                                stats["errors"] += 1
                                # Track error messages
                                error_msg = log['message'][:100]
                                stats["top_errors"][error_msg] = stats["top_errors"].get(error_msg, 0) + 1
                                # Track users with errors
                                user_email = log_data.get('user_email', 'unknown')
                                stats["top_error_users"][user_email] = stats["top_error_users"].get(user_email, 0) + 1
                            elif log['level'] == 'warn':
                                stats["warnings"] += 1
                            else:
                                stats["info"] += 1
        
        # Format top lists
        top_errors = sorted(stats["top_errors"].items(), key=lambda x: x[1], reverse=True)[:5]
        top_error_users = sorted(stats["top_error_users"].items(), key=lambda x: x[1], reverse=True)[:5]
        
        return {
            "period_hours": hours,
            "total_logs": stats["total_logs"],
            "errors": stats["errors"],
            "warnings": stats["warnings"],
            "info": stats["info"],
            "top_errors": [{"message": msg, "count": count} for msg, count in top_errors],
            "top_error_users": [{"email": email, "count": count} for email, count in top_error_users]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### 5. Search Logs by User
```python
@router.get("/logs/user/{user_id}")
async def get_logs_by_user(
    user_id: int,
    hours: int = 24,
    level: Optional[str] = None,
    current_user = Depends(require_admin)
):
    """Get all logs for a specific user from last N hours (admin only)"""
    try:
        now = datetime.now()
        cutoff_time = now - timedelta(hours=hours)
        
        user_logs = []
        
        # Scan recent days
        for days_back in range(int(hours / 24) + 2):
            check_date = now - timedelta(days=days_back)
            date_prefix = f"logs/{check_date.year}/{check_date.month:02d}/{check_date.day:02d}/"
            
            response = r2_client.list_objects_v2(
                Bucket=BUCKET_NAME,
                Prefix=date_prefix
            )
            
            if 'Contents' in response:
                for obj in response['Contents']:
                    # Check if filename contains user_id (format: user_{id}_timestamp.json)
                    if f"user_{user_id}_" in obj['Key']:
                        file_response = r2_client.get_object(
                            Bucket=BUCKET_NAME,
                            Key=obj['Key']
                        )
                        log_data = json.loads(file_response['Body'].read())
                        
                        for log in log_data.get('logs', []):
                            log_time = datetime.fromisoformat(log['timestamp'].replace('Z', '+00:00'))
                            if log_time >= cutoff_time:
                                # Filter by level if specified
                                if level is None or log['level'] == level:
                                    user_logs.append({
                                        "timestamp": log['timestamp'],
                                        "level": log['level'],
                                        "message": log['message'],
                                        "file": obj['Key']
                                    })
        
        user_logs.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return {
            "user_id": user_id,
            "logs": user_logs,
            "count": len(user_logs),
            "hours": hours
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/logs/user/email/{email}")
async def get_logs_by_email(
    email: str,
    hours: int = 24,
    level: Optional[str] = None,
    current_user = Depends(require_admin)
):
    """Search logs by user email from last N hours (admin only)"""
    try:
        now = datetime.now()
        cutoff_time = now - timedelta(hours=hours)
        
        matching_logs = []
        
        # Scan recent days
        for days_back in range(int(hours / 24) + 2):
            check_date = now - timedelta(days=days_back)
            date_prefix = f"logs/{check_date.year}/{check_date.month:02d}/{check_date.day:02d}/"
            
            response = r2_client.list_objects_v2(
                Bucket=BUCKET_NAME,
                Prefix=date_prefix
            )
            
            if 'Contents' in response:
                for obj in response['Contents']:
                    file_response = r2_client.get_object(
                        Bucket=BUCKET_NAME,
                        Key=obj['Key']
                    )
                    log_data = json.loads(file_response['Body'].read())
                    
                    # Check if email matches
                    if log_data.get('user_email', '').lower() == email.lower():
                        for log in log_data.get('logs', []):
                            log_time = datetime.fromisoformat(log['timestamp'].replace('Z', '+00:00'))
                            if log_time >= cutoff_time:
                                if level is None or log['level'] == level:
                                    matching_logs.append({
                                        "user_id": log_data.get('user_id'),
                                        "user_email": log_data.get('user_email'),
                                        "timestamp": log['timestamp'],
                                        "level": log['level'],
                                        "message": log['message'],
                                        "file": obj['Key']
                                    })
        
        matching_logs.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return {
            "email": email,
            "logs": matching_logs,
            "count": len(matching_logs),
            "hours": hours
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### 6. Cleanup Old Logs
```python
@router.delete("/logs/cleanup")
async def cleanup_old_logs(
    days: int = 30,
    current_user = Depends(require_admin)
):
    """Delete logs older than specified days from R2"""
    try:
        cutoff_date = datetime.now() - timedelta(days=days)
        
        response = r2_client.list_objects_v2(
            Bucket=BUCKET_NAME,
            Prefix="logs/"
        )
        
        deleted_count = 0
        if 'Contents' in response:
            for obj in response['Contents']:
                if obj['LastModified'].replace(tzinfo=None) < cutoff_date:
                    r2_client.delete_object(
                        Bucket=BUCKET_NAME,
                        Key=obj['Key']
                    )
                    deleted_count += 1
        
        return {
            "deleted": deleted_count,
            "cutoff_date": cutoff_date.isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## Frontend Component (React)

Add this component to your admin dashboard:

```jsx
// components/AdminLogsViewer.jsx
import React, { useState, useEffect } from 'react';

const AdminLogsViewer = () => {
  const [logFiles, setLogFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [levelFilter, setLevelFilter] = useState('');
  const [hoursFilter, setHoursFilter] = useState(24);
  const [userSearch, setUserSearch] = useState('');
  const [searchType, setSearchType] = useState('email'); // 'email' or 'id'
  const [userLogs, setUserLogs] = useState([]);
  const [searchMode, setSearchMode] = useState(false); // false = browse files, true = search by user

  function getToday() {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  const API_BASE = 'YOUR_BACKEND_URL'; // e.g., https://api.yourapp.com
  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
    'Content-Type': 'application/json'
  });

  // Fetch log files on mount and when date changes
  useEffect(() => {
    fetchLogFiles();
    fetchStats();
    fetchRecentErrors();
  }, [selectedDate, hoursFilter]);

  // Fetch list of log files
  const fetchLogFiles = async () => {
    setLoading(true);
    try {
      const params = selectedDate ? `?date=${selectedDate}` : '';
      const response = await fetch(`${API_BASE}/api/logs/files${params}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setLogFiles(data.files || []);
    } catch (error) {
      console.error('Error fetching log files:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch specific log file contents
  const fetchLogFile = async (filePath) => {
    setLoading(true);
    try {
      const params = levelFilter ? `?level=${levelFilter}` : '';
      const response = await fetch(
        `${API_BASE}/api/logs/view/${filePath}${params}`,
        { headers: getAuthHeaders() }
      );
      const data = await response.json();
      setSelectedFile(data.file);
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Error fetching log file:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/api/logs/stats?hours=${hoursFilter}`,
        { headers: getAuthHeaders() }
      );
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch recent errors
  const fetchRecentErrors = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/api/logs/errors/recent?hours=${hoursFilter}`,
        { headers: getAuthHeaders() }
      );
      const data = await response.json();
      setErrors(data.errors || []);
    } catch (error) {
      console.error('Error fetching errors:', error);
    }
  };

  // Search logs by user
  const searchUserLogs = async () => {
    if (!userSearch.trim()) {
      alert('Please enter a user email or ID');
      return;
    }

    setLoading(true);
    try {
      const levelParam = levelFilter ? `&level=${levelFilter}` : '';
      let endpoint;
      
      if (searchType === 'email') {
        endpoint = `${API_BASE}/api/logs/user/email/${encodeURIComponent(userSearch)}?hours=${hoursFilter}${levelParam}`;
      } else {
        endpoint = `${API_BASE}/api/logs/user/${userSearch}?hours=${hoursFilter}${levelParam}`;
      }
      
      const response = await fetch(endpoint, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('User not found or no logs available');
      }
      
      const data = await response.json();
      setUserLogs(data.logs || []);
      setSearchMode(true);
    } catch (error) {
      console.error('Error searching user logs:', error);
      alert('Error searching user logs: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Clear user search and return to file browse mode
  const clearUserSearch = () => {
    setSearchMode(false);
    setUserSearch('');
    setUserLogs([]);
  };

  // Cleanup old logs
  const handleCleanup = async () => {
    if (!window.confirm('Delete logs older than 30 days?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/logs/cleanup?days=30`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      alert(`Deleted ${data.deleted} old log files`);
      fetchLogFiles();
    } catch (error) {
      console.error('Error cleaning up logs:', error);
      alert('Failed to cleanup logs');
    }
  };

  const getLevelColor = (level) => {
    const colors = {
      error: '#ff4d4f',
      warn: '#faad14',
      info: '#1890ff',
      network: '#722ed1'
    };
    return colors[level] || '#666';
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>App Logs Viewer</h1>

      {/* Stats Dashboard */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
          <div style={{ padding: '20px', border: '1px solid #d9d9d9', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#666' }}>Total Logs</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.total_logs}</div>
          </div>
          <div style={{ padding: '20px', border: '1px solid #d9d9d9', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#666' }}>Errors</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff4d4f' }}>{stats.errors}</div>
          </div>
          <div style={{ padding: '20px', border: '1px solid #d9d9d9', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#666' }}>Warnings</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#faad14' }}>{stats.warnings}</div>
          </div>
          <div style={{ padding: '20px', border: '1px solid #d9d9d9', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#666' }}>Info</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1890ff' }}>{stats.info}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <label>
          Date:
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ marginLeft: '8px', padding: '8px' }}
          />
        </label>
        
        <label>
          Time Range:
          <select 
            value={hoursFilter} 
            onChange={(e) => setHoursFilter(Number(e.target.value))}
            style={{ marginLeft: '8px', padding: '8px' }}
          >
            <option value={1}>Last 1 hour</option>
            <option value={6}>Last 6 hours</option>
            <option value={24}>Last 24 hours</option>
            <option value={168}>Last 7 days</option>
          </select>
        </label>

        <label>
          Level:
          <select 
            value={levelFilter} 
            onChange={(e) => setLevelFilter(e.target.value)}
            style={{ marginLeft: '8px', padding: '8px' }}
          >
            <option value="">All Levels</option>
            <option value="error">Errors</option>
            <option value="warn">Warnings</option>
            <option value="info">Info</option>
            <option value="network">Network</option>
          </select>
        </label>

        <button 
          onClick={() => { fetchLogFiles(); fetchStats(); fetchRecentErrors(); }}
          style={{ padding: '8px 16px', marginLeft: 'auto' }}
        >
          Refresh
        </button>
        
        <button 
          onClick={handleCleanup}
          style={{ padding: '8px 16px', backgroundColor: '#ff4d4f', color: 'white', border: 'none' }}
        >
          Cleanup Old Logs
        </button>
      </div>

      {/* User Search */}
      <div style={{ marginBottom: '20px', padding: '16px', border: '1px solid #d9d9d9', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
        <h3 style={{ marginTop: 0 }}>Search Logs by User</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label>
            Search by:
            <select 
              value={searchType} 
              onChange={(e) => setSearchType(e.target.value)}
              style={{ marginLeft: '8px', padding: '8px' }}
            >
              <option value="email">Email</option>
              <option value="id">User ID</option>
            </select>
          </label>

          <input 
            type="text"
            placeholder={searchType === 'email' ? 'Enter user email...' : 'Enter user ID...'}
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchUserLogs()}
            style={{ padding: '8px', flex: 1, maxWidth: '300px' }}
          />

          <button 
            onClick={searchUserLogs}
            disabled={loading}
            style={{ padding: '8px 16px', backgroundColor: '#1890ff', color: 'white', border: 'none' }}
          >
            {loading ? 'Searching...' : 'Search User'}
          </button>

          {searchMode && (
            <button 
              onClick={clearUserSearch}
              style={{ padding: '8px 16px', backgroundColor: '#666', color: 'white', border: 'none' }}
            >
              Clear Search
            </button>
          )}
        </div>
        
        {searchMode && userLogs.length > 0 && (
          <div style={{ marginTop: '12px', fontSize: '14px', color: '#52c41a' }}>
            ✓ Found {userLogs.length} logs for this user
          </div>
        )}
      </div>

      {/* Recent Errors */}
      {errors.length > 0 && (
        <div style={{ marginBottom: '20px', padding: '16px', border: '1px solid #ffccc7', borderRadius: '8px', backgroundColor: '#fff1f0' }}>
          <h3>Recent Errors ({errors.length})</h3>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {errors.slice(0, 10).map((error, idx) => (
              <div key={idx} style={{ marginBottom: '8px', fontSize: '14px' }}>
                <strong>{new Date(error.timestamp).toLocaleString()}</strong> - {error.user_email}
                <div style={{ color: '#666', marginLeft: '16px' }}>{error.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px' }}>
        {/* Log Files List */}
        <div style={{ border: '1px solid #d9d9d9', borderRadius: '8px', padding: '16px', maxHeight: '600px', overflowY: 'auto' }}>
          <h3>Log Files ({logFiles.length})</h3>
          {loading && <div>Loading...</div>}
          {logFiles.map((file, idx) => (
            <div 
              key={idx}
              onClick={() => fetchLogFile(file.key)}
              style={{
                padding: '8px',
                cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0',
                backgroundColor: selectedFile === file.key ? '#e6f7ff' : 'transparent'
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                {file.key.split('/').pop()}
              </div>
              <div style={{ fontSize: '11px', color: '#666' }}>
                {new Date(file.last_modified).toLocaleString()} - {(file.size / 1024).toFixed(1)} KB
              </div>
            </div>
          ))}
        </div>

        {/* Log Contents */}
        <div style={{ border: '1px solid #d9d9d9', borderRadius: '8px', padding: '16px', maxHeight: '600px', overflowY: 'auto' }}>
          <h3>Log Contents</h3>
          {!selectedFile && <div style={{ color: '#999' }}>Select a log file to view contents</div>}
          {selectedFile && (
            <>
              <div style={{ marginBottom: '16px', fontSize: '12px', color: '#666' }}>
                File: {selectedFile} - {logs.length} logs
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                {logs.map((log, idx) => (
                  <div 
                    key={idx}
                    style={{
                      padding: '8px',
                      marginBottom: '4px',
                      borderLeft: `4px solid ${getLevelColor(log.level)}`,
                      backgroundColor: '#f5f5f5'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ color: getLevelColor(log.level), fontWeight: 'bold' }}>
                        [{log.level.toUpperCase()}]
                      </span>
                      <span style={{ color: '#666' }}>
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div>{log.message}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Top Errors */}
      {stats && stats.top_errors && stats.top_errors.length > 0 && (
        <div style={{ marginTop: '20px', padding: '16px', border: '1px solid #d9d9d9', borderRadius: '8px' }}>
          <h3>Top Error Messages</h3>
          <ul>
            {stats.top_errors.map((err, idx) => (
              <li key={idx} style={{ marginBottom: '8px' }}>
                <strong>{err.count}x</strong> - {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Top Error Users */}
      {stats && stats.top_error_users && stats.top_error_users.length > 0 && (
        <div style={{ marginTop: '20px', padding: '16px', border: '1px solid #d9d9d9', borderRadius: '8px' }}>
          <h3>Users with Most Errors</h3>
          <ul>
            {stats.top_error_users.map((user, idx) => (
              <li key={idx} style={{ marginBottom: '8px' }}>
                <strong>{user.email}</strong> - {user.count} errors
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminLogsViewer;
```

---

## Simple HTML/JavaScript Version (No Framework)

If your admin panel is plain HTML/JS:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>App Logs Viewer</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
    h2 { margin-bottom: 20px; }
    .filters { display: flex; gap: 10px; margin-bottom: 20px; }
    .filters input, .filters select, .filters button { padding: 8px 12px; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
    .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .stat-value { font-size: 32px; font-weight: bold; margin-top: 8px; }
    .error-list { background: #fff1f0; border: 1px solid #ffccc7; padding: 16px; border-radius: 8px; margin-bottom: 20px; }
    .file-list { background: white; padding: 16px; border-radius: 8px; max-height: 400px; overflow-y: auto; margin-bottom: 20px; }
    .file-item { padding: 8px; cursor: pointer; border-bottom: 1px solid #f0f0f0; }
    .file-item:hover { background: #f5f5f5; }
    .file-item.selected { background: #e6f7ff; }
    .log-entry { padding: 8px; margin-bottom: 4px; border-left: 4px solid #666; background: #f5f5f5; font-family: monospace; font-size: 12px; }
    .log-entry.error { border-left-color: #ff4d4f; }
    .log-entry.warn { border-left-color: #faad14; }
    .log-entry.info { border-left-color: #1890ff; }
  </style>
</head>
<body>
  <h2>App Logs Viewer</h2>

  <!-- Stats -->
  <div class="stats">
    <div class="stat-card">
      <div>Total Logs</div>
      <div class="stat-value" id="totalLogs">0</div>
    </div>
    <div class="stat-card">
      <div>Errors</div>
      <div class="stat-value" style="color: #ff4d4f;" id="errorCount">0</div>
    </div>
    <div class="stat-card">
      <div>Warnings</div>
      <div class="stat-value" style="color: #faad14;" id="warnCount">0</div>
    </div>
    <div class="stat-card">
      <div>Info</div>
      <div class="stat-value" style="color: #1890ff;" id="infoCount">0</div>
    </div>
  </div>

  <!-- Filters -->
  <div class="filters">
    <input type="date" id="dateFilter" />
    <select id="hoursFilter">
      <option value="1">Last 1 hour</option>
      <option value="6">Last 6 hours</option>
      <option value="24" selected>Last 24 hours</option>
      <option value="168">Last 7 days</option>
    </select>
    <select id="levelFilter">
      <option value="">All Levels</option>
      <option value="error">Errors</option>
      <option value="warn">Warnings</option>
      <option value="info">Info</option>
    </select>
    <button onclick="refreshData()">Refresh</button>
    <button onclick="cleanupLogs()" style="background: #ff4d4f; color: white; border: none;">Cleanup Old Logs</button>
  </div>

  <!-- Recent Errors -->
  <div class="error-list" id="recentErrors" style="display: none;">
    <h3>Recent Errors</h3>
    <div id="errorsList"></div>
  </div>

  <!-- Log Files -->
  <h3>Log Files</h3>
  <div class="file-list" id="fileList">
    <div style="color: #999;">Loading files...</div>
  </div>

  <!-- Log Contents -->
  <h3>Log Contents</h3>
  <div id="logContents" style="background: white; padding: 16px; border-radius: 8px; max-height: 500px; overflow-y: auto;">
    <div style="color: #999;">Select a log file to view contents</div>
  </div>

  <script>
    const API_BASE = 'YOUR_BACKEND_URL'; // e.g., https://api.yourapp.com
    const getAuthHeaders = () => ({
      'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
      'Content-Type': 'application/json'
    });

    // Set today's date as default
    document.getElementById('dateFilter').valueAsDate = new Date();

    async function fetchStats() {
      try {
        const hours = document.getElementById('hoursFilter').value;
        const response = await fetch(`${API_BASE}/api/logs/stats?hours=${hours}`, {
          headers: getAuthHeaders()
        });
        const data = await response.json();
        
        document.getElementById('totalLogs').textContent = data.total_logs;
        document.getElementById('errorCount').textContent = data.errors;
        document.getElementById('warnCount').textContent = data.warnings;
        document.getElementById('infoCount').textContent = data.info;
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    }

    async function fetchRecentErrors() {
      try {
        const hours = document.getElementById('hoursFilter').value;
        const response = await fetch(`${API_BASE}/api/logs/errors/recent?hours=${hours}`, {
          headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.errors && data.errors.length > 0) {
          document.getElementById('recentErrors').style.display = 'block';
          document.getElementById('errorsList').innerHTML = data.errors.slice(0, 10).map(err => `
            <div style="margin-bottom: 8px; font-size: 14px;">
              <strong>${new Date(err.timestamp).toLocaleString()}</strong> - ${err.user_email}
              <div style="color: #666; margin-left: 16px;">${err.message}</div>
            </div>
          `).join('');
        } else {
          document.getElementById('recentErrors').style.display = 'none';
        }
      } catch (error) {
        console.error('Error fetching recent errors:', error);
      }
    }

    async function fetchLogFiles() {
      try {
        const date = document.getElementById('dateFilter').value;
        const params = date ? `?date=${date}` : '';
        const response = await fetch(`${API_BASE}/api/logs/files${params}`, {
          headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.files && data.files.length > 0) {
          document.getElementById('fileList').innerHTML = data.files.map(file => `
            <div class="file-item" onclick="viewLogFile('${file.key}')">
              <div style="font-weight: bold; font-size: 12px;">${file.key.split('/').pop()}</div>
              <div style="font-size: 11px; color: #666;">
                ${new Date(file.last_modified).toLocaleString()} - ${(file.size / 1024).toFixed(1)} KB
              </div>
            </div>
          `).join('');
        } else {
          document.getElementById('fileList').innerHTML = '<div style="color: #999;">No log files found</div>';
        }
      } catch (error) {
        console.error('Error fetching log files:', error);
        document.getElementById('fileList').innerHTML = '<div style="color: #ff4d4f;">Error loading files</div>';
      }
    }

    async function viewLogFile(filePath) {
      try {
        const level = document.getElementById('levelFilter').value;
        const params = level ? `?level=${level}` : '';
        const response = await fetch(`${API_BASE}/api/logs/view/${filePath}${params}`, {
          headers: getAuthHeaders()
        });
        const data = await response.json();
        
        // Highlight selected file
        document.querySelectorAll('.file-item').forEach(el => el.classList.remove('selected'));
        event.target.closest('.file-item').classList.add('selected');
        
        if (data.logs && data.logs.length > 0) {
          document.getElementById('logContents').innerHTML = `
            <div style="margin-bottom: 16px; font-size: 12px; color: #666;">
              File: ${data.file} - ${data.logs.length} logs
            </div>
            ${data.logs.map(log => `
              <div class="log-entry ${log.level}">
                <div style="display: flex; gap: 8px; margin-bottom: 4px;">
                  <span style="font-weight: bold;">[${log.level.toUpperCase()}]</span>
                  <span style="color: #666;">${new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <div>${log.message}</div>
              </div>
            `).join('')}
          `;
        } else {
          document.getElementById('logContents').innerHTML = '<div style="color: #999;">No logs found in this file</div>';
        }
      } catch (error) {
        console.error('Error viewing log file:', error);
        document.getElementById('logContents').innerHTML = '<div style="color: #ff4d4f;">Error loading log contents</div>';
      }
    }

    async function cleanupLogs() {
      if (!confirm('Delete logs older than 30 days?')) return;
      
      try {
        const response = await fetch(`${API_BASE}/api/logs/cleanup?days=30`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        const data = await response.json();
        alert(`Deleted ${data.deleted} old log files`);
        refreshData();
      } catch (error) {
        console.error('Error cleaning up logs:', error);
        alert('Failed to cleanup logs');
      }
    }

    function refreshData() {
      fetchStats();
      fetchRecentErrors();
      fetchLogFiles();
    }

    // Initial load
    refreshData();
    
    // Auto-refresh every 30 seconds
    setInterval(refreshData, 30000);
  </script>
</body>
</html>
```

---

## Quick Integration Checklist

1. ✅ Set up R2 bucket and credentials (see `LOGGER_BACKEND_SETUP.md`)
2. ✅ Add backend endpoints (all 7 endpoints listed above)
3. ✅ Add logs viewer component to your existing admin panel
4. ✅ Update `API_BASE` URL in the frontend code
5. ✅ Test by viewing logs from the app
6. ✅ Test user search feature (search by email or user ID)
7. ✅ Optional: Set up automated cleanup (see below)

---

## Direct R2 Access (Alternative)

If you don't want to build a UI yet, access logs directly:

### Option 1: Cloudflare R2 Dashboard
1. Go to [Cloudflare R2 Dashboard](https://dash.cloudflare.com/)
2. Click bucket: `rekapo-app-logs`
3. Browse: `logs/2026/02/09/`
4. Click files to download and view

### Option 2: AWS CLI
```bash
# Configure with R2 credentials
aws configure set aws_access_key_id YOUR_R2_ACCESS_KEY
aws configure set aws_secret_access_key YOUR_R2_SECRET

# List today's log files
aws s3 ls s3://rekapo-app-logs/logs/2026/02/09/ \
  --endpoint-url=YOUR_R2_ENDPOINT

# Download a file
aws s3 cp s3://rekapo-app-logs/logs/2026/02/09/user_123.json . \
  --endpoint-url=YOUR_R2_ENDPOINT

# View file contents
cat user_123.json | jq '.'
```

### Option 3: Backend API (cURL)
```bash
# List today's files
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  "${API_BASE}/api/logs/files?date=2026-02-09"

# View specific file
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  "${API_BASE}/api/logs/view/logs/2026/02/09/user_123_14-30-00.json"

# Get recent errors only
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  "${API_BASE}/api/logs/errors/recent?hours=24"
```

---

## Automated Cleanup (Recommended)

### Option 1: Backend Scheduler (Recommended)
```python
# Install: pip install apscheduler
from apscheduler.schedulers.background import BackgroundScheduler

def cleanup_old_logs_job():
    """Cleanup logs older than 30 days - runs daily at 2 AM"""
    try:
        cutoff_date = datetime.now() - timedelta(days=30)
        response = r2_client.list_objects_v2(Bucket=BUCKET_NAME, Prefix="logs/")
        
        deleted_count = 0
        if 'Contents' in response:
            for obj in response['Contents']:
                if obj['LastModified'].replace(tzinfo=None) < cutoff_date:
                    r2_client.delete_object(Bucket=BUCKET_NAME, Key=obj['Key'])
                    deleted_count += 1
        
        print(f"[Cleanup] Deleted {deleted_count} old log files")
    except Exception as e:
        print(f"[Cleanup] Error: {e}")

# Initialize on app startup
scheduler = BackgroundScheduler()
scheduler.add_job(cleanup_old_logs_job, 'cron', hour=2, minute=0)

@app.on_event("startup")
async def startup_event():
    scheduler.start()

@app.on_event("shutdown")
async def shutdown_event():
    scheduler.shutdown()
```

### Option 2: External Cron (Linux/Mac)
```bash
# Add to crontab: crontab -e
0 2 * * * curl -X DELETE -H "Authorization: Bearer ADMIN_TOKEN" \
  "${API_BASE}/api/logs/cleanup?days=30"
```

---

## R2 Storage Costs

- **R2 Free Tier:** 10GB storage forever
- **Your Usage:** ~100MB/month (1000 users × 100 logs/day)
- **Result:** FREE for years! 🎉
- No egress fees when accessing via API

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

## Summary

**No SQL Database Required!** ✅

Your logging system stores everything in Cloudflare R2 (object storage), which is:
- Free for your usage level
- Fast and reliable
- Easy to query via API
- Automatically organized by date

**Backend Requirements:**
- 7 API endpoints total:
  - List log files
  - View log file contents
  - Get recent errors
  - Get log statistics
  - **Search logs by user ID**
  - **Search logs by user email**
  - Cleanup old logs
- boto3 library for R2 access
- R2 credentials in .env file

**Frontend Options:**
1. React component (full-featured with user search)
2. Simple HTML/JS (minimal)
3. Direct R2 dashboard access
4. CLI tools (for quick debugging)

## 🔍 Using the User Search Feature

### In the React Component:

The admin panel includes a **"Search Logs by User"** section where you can:

1. **Search by Email:**
   - Select "Email" from dropdown
   - Enter user email (e.g., `user@example.com`)
   - Click "Search User"
   - View all logs from that user

2. **Search by User ID:**
   - Select "User ID" from dropdown
   - Enter user ID (e.g., `123`)
   - Click "Search User"
   - View all logs from that user

3. **Results:**
   - All logs for the user are displayed in chronological order
   - You can still filter by Level (error/warn/info)
   - Time range filter applies (last 1 hour, 24 hours, etc.)
   - Click "Clear Search" to return to browse mode

### Using the API Directly:

```bash
# Search by user email
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  "${API_BASE}/api/logs/user/email/user@example.com?hours=24&level=error"

# Search by user ID
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  "${API_BASE}/api/logs/user/123?hours=24&level=error"
```

### Use Cases:

- **Debug user-specific issues:** When a user reports a problem, search their logs to see what went wrong
- **Track user activity:** See all actions/errors for a specific user
- **Support tickets:** Quickly pull up logs when helping users troubleshoot
- **Security investigations:** Review all logs from a suspicious user account

Pick the approach that fits your existing admin panel! 🚀

**Frontend Options:**
1. React component (full-featured)
2. Simple HTML/JS (minimal)
3. Direct R2 dashboard access
4. CLI tools (for quick debugging)

Pick the approach that fits your existing admin panel! 🚀

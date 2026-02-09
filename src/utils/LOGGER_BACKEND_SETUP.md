# Backend Setup for Remote App Logging (Cloudflare R2)

The logger utility sends logs to your backend which stores them in **Cloudflare R2** (S3-compatible object storage).

**No database changes required!** ✅

## What It Does

**Development Mode:**
- Shows logs in console (normal behavior)

**Production/Preview:**
- Buffers logs and sends to backend every 10 seconds
- Errors are sent immediately (not buffered)
- Backend uploads logs to Cloudflare R2
- Logs organized by date: `logs/2026/02/09/user_123.json`

---

## Prerequisites

### 1. Create R2 Bucket (5 minutes)

1. Sign up/login to [Cloudflare](https://dash.cloudflare.com/)
2. Navigate to **R2** → **Create bucket**
3. Name: `rekapo-app-logs`
4. Click **Create bucket**

### 2. Get API Credentials

1. In R2 dashboard → **Manage R2 API Tokens**
2. Click **Create API Token**
3. Name: `Rekapo Backend Logs`
4. Permissions: **Edit** on `rekapo-app-logs`
5. Copy:
   - Access Key ID
   - Secret Access Key  
   - Endpoint URL

### 3. Install boto3

```bash
pip install boto3
```

### 4. Add to .env

```env
R2_ACCESS_KEY_ID=your_access_key_here
R2_SECRET_ACCESS_KEY=your_secret_here
R2_ENDPOINT_URL=https://xxxxx.r2.cloudflarestorage.com
R2_BUCKET_NAME=rekapo-app-logs
```

---

## Backend Endpoint Required

### `POST /api/logs/write`

**Python (FastAPI) with R2:**

```python
import os
import json
import boto3
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter(prefix="/logs", tags=["logs"])

# Initialize R2 client (S3-compatible)
r2_client = boto3.client(
    's3',
    endpoint_url=os.getenv('R2_ENDPOINT_URL'),
    aws_access_key_id=os.getenv('R2_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('R2_SECRET_ACCESS_KEY'),
    region_name='auto'
)

BUCKET_NAME = os.getenv('R2_BUCKET_NAME', 'rekapo-app-logs')

class LogEntry(BaseModel):
    level: str  # 'info', 'warn', 'error', 'network'
    message: str
    timestamp: str

class LogBatch(BaseModel):
    logs: List[LogEntry]
    batch_timestamp: str

@router.post("/write")
async def write_logs_to_r2(
    log_batch: LogBatch,
    current_user = Depends(get_current_user)
):
    """
    Write logs to Cloudflare R2 bucket
    File path: logs/2026/02/09/user_123_14-30-00.json
    """
    try:
        # Generate hierarchical path
        now = datetime.now()
        file_path = (
            f"logs/{now.year}/{now.month:02d}/{now.day:02d}/"
            f"user_{current_user.id}_{now.strftime('%H-%M-%S')}.json"
        )
        
        # Prepare log data
        log_data = {
            "user_id": current_user.id,
            "user_email": current_user.email,
            "batch_timestamp": log_batch.batch_timestamp,
            "logs": [
                {
                    "level": log.level,
                    "message": log.message,
                    "timestamp": log.timestamp
                }
                for log in log_batch.logs
            ]
        }
        
        # Upload to R2
        r2_client.put_object(
            Bucket=BUCKET_NAME,
            Key=file_path,
            Body=json.dumps(log_data, indent=2),
            ContentType='application/json'
        )
        
        return {
            "status": "success",
            "logs_written": len(log_batch.logs),
            "file": file_path
        }
    
    except Exception as e:
        print(f"Error writing logs to R2: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to write logs: {str(e)}")

# Optional: View logs (admin only)
@router.get("/files")
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

@router.get("/view/{file_path:path}")
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

@router.get("/errors/recent")
async def get_recent_errors(
    hours: int = 24,
    current_user = Depends(require_admin)
):
    """Get all errors from last N hours (admin only)"""
    try:
        now = datetime.now()
        today_prefix = f"logs/{now.year}/{now.month:02d}/{now.day:02d}/"
        
        response = r2_client.list_objects_v2(
            Bucket=BUCKET_NAME,
            Prefix=today_prefix
        )
        
        all_errors = []
        if 'Contents' in response:
            for obj in response['Contents']:
                file_response = r2_client.get_object(
                    Bucket=BUCKET_NAME,
                    Key=obj['Key']
                )
                log_data = json.loads(file_response['Body'].read())
                
                for log in log_data.get('logs', []):
                    if log['level'] == 'error':
                        all_errors.append({
                            "user_email": log_data.get('user_email'),
                            "timestamp": log['timestamp'],
                            "message": log['message'],
                            "file": obj['Key']
                        })
        
        all_errors.sort(key=lambda x: x['timestamp'], reverse=True)
        return {"errors": all_errors, "count": len(all_errors)}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/cleanup")
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

## Usage in React Native

Use `fileLogger.js` (already created):

```javascript
import logger from '../utils/fileLogger';

// Regular logging
logger.log('User viewed profile');
logger.warn('Low storage space');
logger.error('Failed to upload photo:', error);

// Network logging
logger.network('POST', '/api/sessions', 200, { session_id: 123 });

// Manual flush (before app closes)
await logger.flush();
```

---

## Viewing Logs

### Option 1: R2 Dashboard (Easiest)
1. Go to [Cloudflare R2 Dashboard](https://dash.cloudflare.com/)
2. Click bucket: `rekapo-app-logs`
3. Browse: `logs/2026/02/09/`
4. Click file to download and view

### Option 2: API Endpoints
```bash
# List today's logs
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  "http://your-backend/api/logs/files?date=2026-02-09"

# View specific log file
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  "http://your-backend/api/logs/view/logs/2026/02/09/user_123_14-30-00.json"

# Get all recent errors
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  "http://your-backend/api/logs/errors/recent?hours=24"

# Filter by level
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  "http://your-backend/api/logs/view/logs/2026/02/09/user_123.json?level=error"
```

### Option 3: AWS CLI (Advanced)
```bash
# Configure with R2 credentials
aws configure set aws_access_key_id YOUR_KEY
aws configure set aws_secret_access_key YOUR_SECRET

# List files
aws s3 ls s3://rekapo-app-logs/logs/2026/02/09/ \
  --endpoint-url=YOUR_R2_ENDPOINT

# Download file
aws s3 cp s3://rekapo-app-logs/logs/2026/02/09/user_123.json . \
  --endpoint-url=YOUR_R2_ENDPOINT
```
File Organization in R2

```
rekapo-app-logs/
└── logs/
    └── 2026/
        └── 02/
            └── 09/
                ├── user_123_14-30-00.json
                ├── user_123_14-40-00.json
                ├── user_456_15-20-00.json
                └── user_789_16-05-00.json
```

Each file contains:
```json
{
  "user_id": 123,
  "user_email": "user@example.com",
  "batch_timestamp": "2026-02-09T14:30:10.000Z",
  "logs": [
    {
      "level": "error",
      "message": "Failed to upload photo: Network timeout",
      "timestamp": "2026-02-09T14:30:00.000Z"
    },
    {
      "level": "info",
      "message": "User logged in successfully",
      "timestamp": "2026-02-09T14:28:00.000Z"
    }
  ]
}
```

---

## Privacy & Performance

**Privacy:**
- Logs only sent from authenticated users
- Contains user_id for debugging per-user issues
- Sensitive data automatically sanitized (passwords, tokens, etc.)
- Stored securely in Cloudflare R2

**Performance:**
- Logs buffered (up to 20 logs or 10 seconds)
- Errors sent immediately for quick debugging
- Failed log submissions don't affect app performance
- No server disk space used

**Storage & Cost:**
- **R2 Free Tier:** 10GB forever
- **Your Usage:** ~100MB/month (1000 users × 100 logs/day)
- **Result:** FREE for years!
- Automatic 30-day cleanup via `/cleanup` endpoint

**Automatic Cleanup:**

**Option 1: Backend Scheduler (Recommended)** ⭐

Add this to your backend to auto-cleanup daily:

```python
# Install: pip install apscheduler
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta

# Add to your main.py or app startup
def cleanup_old_logs_job():
    """
    Background job to cleanup logs older than 30 days
    Runs daily at 2 AM
    """
    try:
        cutoff_date = datetime.now() - timedelta(days=30)
        
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
        
        print(f"[Cleanup] Deleted {deleted_count} old log files")
    except Exception as e:
        print(f"[Cleanup] Error: {e}")

# Initialize scheduler on app startup
scheduler = BackgroundScheduler()
scheduler.add_job(
    cleanup_old_logs_job,
    'cron',
    hour=2,  # Run at 2 AM daily
    minute=0
)
scheduler.start()

# In your FastAPI startup event
@app.on_event("startup")
async def startup_event():
    print("Starting log cleanup scheduler...")
    scheduler.start()

@app.on_event("shutdown")
async def shutdown_event():
    scheduler.shutdown()
```

**Option 2: External Cron (Linux/Mac)**

```bash
# Add to crontab: crontab -e
0 2 * * * curl -X DELETE -H "Authorization: Bearer ADMIN_TOKEN" \
  "http://your-backend/api/logs/cleanup?days=30"
```

**Option 3: Manual (Admin Panel)**

Just add a "Cleanup Old Logs" button that calls:
```javascript
await fetch('/api/logs/cleanup?days=30', { 
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## Testing

```javascript
// Test in development (shows in console)
logger.log('Test log');
logger.error('Test error');

// Test in production build:
// 1. Build preview/production APK
// 2. Trigger some actions that log
// 3. Check R2 dashboard or API: GET /api/logs/files
// 4. View file: GET /api/logs/view/logs/2026/02/09/user_123.json
// 1. Build preview/production APK
// 2. Trigger some actions that log
// 3. Check your backend database: SELECT * FROM app_logs;
```

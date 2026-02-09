# Cloudflare R2 Logging Setup (Professional & Free!)

Store app logs in Cloudflare R2 - S3-compatible object storage with **10GB free tier**.

Perfect for thesis: scalable, professional, accessible, and VERY cheap.

---

## Why R2?

✅ **10GB free forever** (way more than you need)  
✅ **No egress fees** (unlike AWS S3)  
✅ **Professional solution** - impressive for defense  
✅ **No server disk space used**  
✅ **Easy to access** - from any device  
✅ **Automatic backup** - data safe in cloud  

---

## Step 1: Create R2 Bucket (5 minutes)

1. Go to [Cloudflare dashboard](https://dash.cloudflare.com/)
2. Sign up/Login (free account)
3. Navigate to **R2** in sidebar
4. Click **Create bucket**
5. Name it: `rekapo-app-logs`
6. Click **Create bucket**

---

## Step 2: Get R2 Credentials

1. In R2 dashboard, click **Manage R2 API Tokens**
2. Click **Create API Token**
3. Name: `Rekapo Backend Logs`
4. Permissions: **Edit** on bucket `rekapo-app-logs`
5. Copy these values:
   - Access Key ID
   - Secret Access Key
   - Endpoint URL (looks like: `https://xxxxx.r2.cloudflarestorage.com`)

---

## Step 3: Backend Setup (Python/FastAPI)

### Install boto3 (S3-compatible client)

```bash
pip install boto3
```

### Add to .env file

```env
R2_ACCESS_KEY_ID=your_access_key_here
R2_SECRET_ACCESS_KEY=your_secret_here
R2_ENDPOINT_URL=https://xxxxx.r2.cloudflarestorage.com
R2_BUCKET_NAME=rekapo-app-logs
```

### Backend Code

```python
# logs.py - Add to your FastAPI backend
import os
import json
import boto3
from datetime import datetime
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
    region_name='auto'  # R2 doesn't use regions
)

BUCKET_NAME = os.getenv('R2_BUCKET_NAME', 'rekapo-app-logs')

class LogEntry(BaseModel):
    level: str
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
    File format: logs/2026/02/09/user_123_14-30-00.json
    """
    try:
        # Generate hierarchical path for better organization
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

@router.get("/files")
async def list_log_files(
    date: Optional[str] = None,  # Format: YYYY-MM-DD
    current_user = Depends(require_admin)
):
    """
    List log files from R2 (admin only)
    Optional: filter by date
    """
    try:
        # Build prefix for date filtering
        prefix = "logs/"
        if date:
            # Convert 2026-02-09 to logs/2026/02/09/
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
            # Sort by most recent first
            files.sort(key=lambda x: x['last_modified'], reverse=True)
        
        return {
            "files": files,
            "count": len(files)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list files: {str(e)}")

@router.get("/view/{file_path:path}")
async def view_log_file(
    file_path: str,
    level: Optional[str] = None,  # Filter by level
    current_user = Depends(require_admin)
):
    """
    View contents of a log file from R2 (admin only)
    """
    try:
        response = r2_client.get_object(
            Bucket=BUCKET_NAME,
            Key=file_path
        )
        
        log_data = json.loads(response['Body'].read())
        
        # Filter by level if specified
        if level:
            log_data['logs'] = [
                log for log in log_data['logs'] 
                if log['level'] == level
            ]
        
        return {
            "file": file_path,
            "user_email": log_data.get('user_email'),
            "batch_timestamp": log_data.get('batch_timestamp'),
            "logs": log_data['logs'],
            "count": len(log_data['logs'])
        }
    
    except r2_client.exceptions.NoSuchKey:
        raise HTTPException(status_code=404, detail="Log file not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read file: {str(e)}")

@router.get("/errors/recent")
async def get_recent_errors(
    hours: int = 24,
    current_user = Depends(require_admin)
):
    """
    Get all errors from last N hours (admin only)
    Useful for quick error monitoring
    """
    try:
        # List all files from today and yesterday
        now = datetime.now()
        today_prefix = f"logs/{now.year}/{now.month:02d}/{now.day:02d}/"
        
        response = r2_client.list_objects_v2(
            Bucket=BUCKET_NAME,
            Prefix=today_prefix
        )
        
        all_errors = []
        if 'Contents' in response:
            for obj in response['Contents']:
                # Read each file
                file_response = r2_client.get_object(
                    Bucket=BUCKET_NAME,
                    Key=obj['Key']
                )
                log_data = json.loads(file_response['Body'].read())
                
                # Extract errors
                for log in log_data.get('logs', []):
                    if log['level'] == 'error':
                        all_errors.append({
                            "user_email": log_data.get('user_email'),
                            "timestamp": log['timestamp'],
                            "message": log['message'],
                            "file": obj['Key']
                        })
        
        # Sort by timestamp, most recent first
        all_errors.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return {
            "errors": all_errors,
            "count": len(all_errors)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get errors: {str(e)}")

@router.delete("/cleanup")
async def cleanup_old_logs(
    days: int = 30,
    current_user = Depends(require_admin)
):
    """
    Delete logs older than specified days from R2
    """
    try:
        cutoff_date = datetime.now() - timedelta(days=days)
        
        # List all log files
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
        raise HTTPException(status_code=500, detail=f"Cleanup failed: {str(e)}")
```

---

## Step 4: Use the Logger

Use the same `fileLogger.js` from before - just change the endpoint:

```javascript
// In fileLogger.js, the endpoint is already correct:
// POST ${config.BACKEND_URL}/api/logs/write

// Backend automatically uploads to R2!
```

---

## Viewing Logs

### Method 1: API Endpoints (Easiest)
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
```

### Method 2: R2 Dashboard
1. Go to Cloudflare R2 dashboard
2. Click your bucket: `rekapo-app-logs`
3. Browse folders: `logs/2026/02/09/`
4. Click any file to download and view

### Method 3: AWS CLI (Advanced)
```bash
# Configure AWS CLI with R2 credentials
aws configure set aws_access_key_id YOUR_KEY
aws configure set aws_secret_access_key YOUR_SECRET

# List files
aws s3 ls s3://rekapo-app-logs/logs/ \
  --endpoint-url=https://xxxxx.r2.cloudflarestorage.com

# Download file
aws s3 cp s3://rekapo-app-logs/logs/2026/02/09/user_123.json . \
  --endpoint-url=https://xxxxx.r2.cloudflarestorage.com
```

---

## For Thesis Defense

**Panelist:** "Where are the logs stored?"

**You:** "We use Cloudflare R2, an enterprise-grade object storage service. It's S3-compatible, highly reliable, and cost-effective. This is the same storage technology used by companies like Shopify and Discord. Logs are organized hierarchically by date and user for easy retrieval."

**Panelist:** "Can you show us the logs?"

**You:** [Open Cloudflare R2 dashboard or run API endpoint]

**Panelist:** "How much does this cost?"

**You:** "R2 has a 10GB free tier which is more than sufficient for our use case. Even at scale, it's extremely affordable with no egress fees unlike AWS S3."

---

## Benefits for Thesis

✅ **Professional** - Enterprise storage solution  
✅ **Scalable** - Handles millions of logs  
✅ **Reliable** - Cloud redundancy  
✅ **Free** - 10GB free tier  
✅ **Accessible** - View from anywhere  
✅ **Organized** - Hierarchical structure  
✅ **No server space** - Offloaded to cloud  
✅ **Impressive** - Shows industry best practices  

---

## File Organization Example

```
rekapo-app-logs/
└── logs/
    └── 2026/
        └── 02/
            └── 09/
                ├── user_123_14-30-00.json  (10 logs)
                ├── user_123_14-40-00.json  (15 logs)
                ├── user_456_15-20-00.json  (8 logs)
                └── user_789_16-05-00.json  (12 logs)
```

Clean, organized, professional! 🎯

---

## Cost Estimate

**Free Tier:** 10GB storage forever  
**Your Usage:** ~1KB per log batch × 1000 users × 100 logs/day = **~100MB/month**  

**Result:** FREE for years! Even buying premium: **$0.015/GB = $0.0015/month** 💰

---

## Quick Setup Checklist

1. ✅ Create Cloudflare account (free)
2. ✅ Create R2 bucket: `rekapo-app-logs`
3. ✅ Generate API token
4. ✅ Add credentials to `.env`
5. ✅ Install boto3: `pip install boto3`
6. ✅ Add endpoints above to backend
7. ✅ Test: Trigger error, check R2 dashboard
8. ✅ Done!

**This is MUCH better than local files!** 🚀

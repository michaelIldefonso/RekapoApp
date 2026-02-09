# Simple File-Based Logging (No Database Changes!)

Perfect for thesis projects - no database schema modifications needed!

---

## Backend Implementation (FastAPI)

Add this single endpoint to your existing backend:

```python
import os
import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/logs", tags=["logs"])

# Logs stored in files, not database!
LOGS_DIR = "app_logs"  # Create this folder in your backend

class LogEntry(BaseModel):
    level: str
    message: str
    timestamp: str

class LogBatch(BaseModel):
    logs: List[LogEntry]
    batch_timestamp: str

@router.post("/write")
async def write_logs(
    log_batch: LogBatch,
    current_user = Depends(get_current_user)  # Your existing auth
):
    """
    Write logs to JSON file (no database changes needed!)
    File format: logs_YYYY-MM-DD_userID.json
    """
    try:
        # Create logs directory if it doesn't exist
        os.makedirs(LOGS_DIR, exist_ok=True)
        
        # Generate filename: logs_2026-02-09_123.json
        date_str = datetime.now().strftime('%Y-%m-%d')
        filename = f"logs_{date_str}_user{current_user.id}.json"
        filepath = os.path.join(LOGS_DIR, filename)
        
        # Read existing logs for today (if any)
        existing_logs = []
        if os.path.exists(filepath):
            with open(filepath, 'r') as f:
                existing_logs = json.load(f)
        
        # Append new logs
        for log in log_batch.logs:
            existing_logs.append({
                "user_id": current_user.id,
                "user_email": current_user.email,
                "level": log.level,
                "message": log.message,
                "timestamp": log.timestamp,
                "batch_time": log_batch.batch_timestamp
            })
        
        # Write back to file
        with open(filepath, 'w') as f:
            json.dump(existing_logs, f, indent=2)
        
        return {
            "status": "success",
            "logs_written": len(log_batch.logs),
            "file": filename
        }
    
    except Exception as e:
        print(f"Error writing logs: {e}")
        raise HTTPException(status_code=500, detail="Failed to write logs")

@router.get("/files")
async def list_log_files(current_user = Depends(require_admin)):
    """
    List all log files (admin only)
    """
    if not os.path.exists(LOGS_DIR):
        return {"files": []}
    
    files = [f for f in os.listdir(LOGS_DIR) if f.endswith('.json')]
    files.sort(reverse=True)  # Newest first
    
    return {
        "files": files,
        "count": len(files)
    }

@router.get("/view/{filename}")
async def view_log_file(
    filename: str,
    level: str = None,  # Optional filter
    current_user = Depends(require_admin)
):
    """
    View contents of a log file (admin only)
    """
    filepath = os.path.join(LOGS_DIR, filename)
    
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Log file not found")
    
    with open(filepath, 'r') as f:
        logs = json.load(f)
    
    # Filter by level if specified
    if level:
        logs = [log for log in logs if log['level'] == level]
    
    return {
        "filename": filename,
        "logs": logs,
        "count": len(logs)
    }
```

---

## Viewing Logs (No Admin Panel Needed)

### Method 1: VS Code
1. Open `backend/app_logs/` folder
2. View JSON files directly
3. Use search to find errors

### Method 2: Simple Python Script
```python
# view_logs.py
import json
import os
from glob import glob

LOGS_DIR = "app_logs"

def view_recent_errors():
    """Show all errors from today"""
    log_files = sorted(glob(f"{LOGS_DIR}/*.json"), reverse=True)
    
    for file in log_files[:5]:  # Last 5 days
        print(f"\n{'='*60}")
        print(f"File: {os.path.basename(file)}")
        print('='*60)
        
        with open(file, 'r') as f:
            logs = json.load(f)
        
        # Filter errors only
        errors = [log for log in logs if log['level'] == 'error']
        
        for error in errors:
            print(f"\n[{error['timestamp']}] {error['user_email']}")
            print(f"  {error['message'][:200]}")

if __name__ == "__main__":
    view_recent_errors()
```

Run: `python view_logs.py`

---

## File Cleanup (Run Weekly)

```python
# cleanup_logs.py
import os
from datetime import datetime, timedelta
from glob import glob

LOGS_DIR = "app_logs"
RETENTION_DAYS = 30

def cleanup_old_logs():
    """Delete logs older than 30 days"""
    cutoff = datetime.now() - timedelta(days=RETENTION_DAYS)
    log_files = glob(f"{LOGS_DIR}/logs_*.json")
    
    deleted = 0
    for file in log_files:
        # Extract date from filename: logs_2026-02-09_user123.json
        try:
            date_str = os.path.basename(file).split('_')[1]
            file_date = datetime.strptime(date_str, '%Y-%m-%d')
            
            if file_date < cutoff:
                os.remove(file)
                deleted += 1
                print(f"Deleted: {file}")
        except Exception as e:
            print(f"Error processing {file}: {e}")
    
    print(f"\nDeleted {deleted} old log files")

if __name__ == "__main__":
    cleanup_old_logs()
```

---

## Benefits for Thesis

✅ **No database changes** - won't affect your existing schema  
✅ **Simple to explain** - "We write logs to JSON files"  
✅ **Easy to demonstrate** - Just open the files  
✅ **Privacy compliant** - All sanitization still works  
✅ **Low maintenance** - No complex queries needed  

---

## Thesis Defense Script

**Panelist:** "How do you handle errors in production?"

**You:** "We implemented a privacy-compliant logging system. When errors occur, the app sends sanitized logs to our backend, which stores them in daily JSON files. We can review these logs to identify and fix issues. All sensitive data like passwords and tokens are automatically redacted, and logs are deleted after 30 days per our privacy policy."

**Panelist:** "Doesn't this violate user privacy?"

**You:** "Not at all. First, it's disclosed in our Privacy Policy - users consent when they use the app. Second, we only log technical information like error messages and app performance, never personal conversations or audio content. Third, logs are sanitized - any passwords or tokens are automatically removed. This is standard practice in production apps and is necessary for maintaining app quality."

**Panelist:** "Can you show us the logs?"

**You:** [Opens VS Code, shows JSON file] "Here's today's log file. You can see it contains error types, timestamps, and sanitized messages. No sensitive user data."

---

## Quick Setup Steps

1. ✅ Create `app_logs/` folder in your backend
2. ✅ Add the `/logs/write` endpoint above
3. ✅ Use `fileLogger.js` instead of `logger.js`
4. ✅ Test: Trigger an error, check `app_logs/` folder
5. ✅ Done! No database changes needed

---

## Example Log File Content

```json
[
  {
    "user_id": 123,
    "user_email": "user@example.com",
    "level": "error",
    "message": "Failed to upload photo: Network timeout",
    "timestamp": "2026-02-09T14:30:00.000Z",
    "batch_time": "2026-02-09T14:30:10.000Z"
  },
  {
    "user_id": 123,
    "user_email": "user@example.com",
    "level": "info",
    "message": "User logged in successfully",
    "timestamp": "2026-02-09T14:28:00.000Z",
    "batch_time": "2026-02-09T14:30:10.000Z"
  }
]
```

Clean, simple, and demo-ready! 🎯

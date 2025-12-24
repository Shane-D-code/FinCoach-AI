# Git Push Instructions

## Push to GitHub Repository

Follow these steps to push all files to the `all_integrated` branch:

### Step 1: Open Git Bash or Command Prompt with Git

Navigate to the project directory:
```bash
cd C:\Users\91628\Desktop\integration\FinCoach-AI
```

### Step 2: Check Current Branch
```bash
git branch
```

### Step 3: Switch to or Create the `all_integrated` Branch

If the branch exists:
```bash
git checkout all_integrated
```

If the branch doesn't exist, create it:
```bash
git checkout -b all_integrated
```

### Step 4: Add All Files
```bash
git add .
```

### Step 5: Check What Will Be Committed
```bash
git status
```

### Step 6: Commit Changes
```bash
git commit -m "Complete ML integration with OCR bill scanner

- Integrated 6 ML models (Risk, Expense, Purchase, Portfolio, Nearby Deals, HelloOCR)
- Added OCR bill scanner with HelloOCR model
- Fixed total amount extraction from bills
- Simplified frontend to show merchant, date, total, tax
- Email authentication with workaround
- All services running and connected
- Cleaned up documentation into single PROJECT_SUMMARY.md"
```

### Step 7: Push to GitHub
```bash
git push origin all_integrated
```

If this is the first push to this branch:
```bash
git push -u origin all_integrated
```

### Step 8: Verify on GitHub

Go to: https://github.com/Shane-D-code/FinCoach-AI/tree/all_integrated

You should see all your files there!

---

## Alternative: Using GitHub Desktop

If you have GitHub Desktop installed:

1. Open GitHub Desktop
2. Select the FinCoach-AI repository
3. Switch to or create the `all_integrated` branch
4. You'll see all changed files in the left panel
5. Write a commit message
6. Click "Commit to all_integrated"
7. Click "Push origin" button at the top

---

## Files That Will Be Pushed

### Modified Files:
- `ocr_service.py` - New OCR service with HelloOCR model
- `ml_main.py` - Mounted OCR service
- `backend/src/main/java/com/fincoach/service/MLService.java` - Added OCR methods
- `backend/src/main/java/com/fincoach/controller/MLController.java` - Updated OCR endpoints
- `src/pages/BillScanner.tsx` - Simplified UI (removed items list)
- `requirements.txt` - Added opencv-python and easyocr
- `PROJECT_SUMMARY.md` - New comprehensive documentation

### Deleted Files:
- All old .md documentation files (29 files)

---

## Troubleshooting

### If Git is Not Installed:
1. Download Git from: https://git-scm.com/download/win
2. Install with default settings
3. Restart your terminal
4. Try the commands again

### If You Get Authentication Errors:
You may need to set up GitHub authentication:

**Option 1: Personal Access Token**
```bash
git config --global credential.helper wincred
```
Then when you push, use your GitHub Personal Access Token as the password.

**Option 2: SSH Key**
Set up SSH key authentication following GitHub's guide:
https://docs.github.com/en/authentication/connecting-to-github-with-ssh

### If Branch Already Exists on Remote:
```bash
git pull origin all_integrated
git push origin all_integrated
```

---

## Quick Command Summary

```bash
# Navigate to project
cd C:\Users\91628\Desktop\integration\FinCoach-AI

# Switch/create branch
git checkout -b all_integrated

# Add all files
git add .

# Commit
git commit -m "Complete ML integration with OCR bill scanner"

# Push
git push -u origin all_integrated
```

---

**Repository**: https://github.com/Shane-D-code/FinCoach-AI
**Branch**: all_integrated
**Status**: Ready to push

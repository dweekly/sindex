# GitHub Actions Setup Guide

This guide will help you set up automated FTP deployment using GitHub Actions.

## Overview

The repository includes a GitHub Actions workflow:

**FTP Deployment** (`deploy-ftp.yml`) - Automatically deploys to FTP when pull requests are merged to main branch

## Setup Instructions

### Step 1: Configure GitHub Secrets

1. Go to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret** button
5. Add each of the following secrets:

#### Required for FTP Deployment

| Secret Name | Value | Description |
|------------|-------|-------------|
| `FTP_HOST` | `server298.com` | Your FTP server hostname |
| `FTP_USER` | `dew_ftp` | Your FTP username |
| `FTP_PASSWORD` | `[your password]` | Your FTP password |
| `FTP_REMOTE_DIR` | `www/www-2025` | Remote directory path |

### Step 2: Test the Workflow

#### Test FTP Deployment

1. Create a new branch:
   ```bash
   git checkout -b test-deployment
   ```

2. Make a small change (e.g., update README)

3. Commit and push:
   ```bash
   git add .
   git commit -m "test: GitHub Actions deployment"
   git push origin test-deployment
   ```

4. Create a Pull Request on GitHub

5. Merge the PR - this will trigger the FTP deployment

6. Check the **Actions** tab to monitor the deployment

7. After deployment completes, the PR will be updated with a comment showing the deployment status

### Step 3: Monitor Deployments

- Go to the **Actions** tab in your repository
- You'll see all workflow runs with their status
- Click on any run to see detailed logs
- Check PR comments for deployment status updates

## Workflow Details

### FTP Deployment Workflow

**Triggers:**
- PR merged to `main` branch (not just closed)

**Steps:**
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Build the site (`npm run build:html`)
5. Run tests (`npm run test`)
6. Deploy to FTP server
7. Comment on PR with deployment status:
   - ✅ Success: Shows live site URL and deployment details
   - ❌ Failure: Shows error information and troubleshooting tips

## What the PR Comments Include

### Successful Deployment
- PR number and title
- Who merged the PR
- Commit SHA
- Server and directory details
- Timestamp
- Link to live site

### Failed Deployment
- PR number and title
- Commit SHA
- Link to GitHub Actions logs
- Common troubleshooting tips

## Security Best Practices

1. **Never commit secrets** - Always use GitHub Secrets
2. **Rotate credentials** - Update FTP password periodically
3. **Use minimal permissions** - FTP user should only access website directory
4. **Review logs** - Check Actions logs don't expose sensitive data
5. **Protect main branch** - Enable branch protection rules

## Troubleshooting

### FTP Deployment Fails

1. **Check credentials** - Verify FTP_HOST, FTP_USER, FTP_PASSWORD are correct
2. **Test locally** - Try deploying with `./deploy.sh ftp` locally
3. **Check server** - Ensure FTP server is accessible
4. **Review logs** - Check GitHub Actions logs for specific error

### Build Fails

1. **Check Node version** - Workflow uses Node 20
2. **Dependencies** - Ensure package-lock.json is committed
3. **Test locally** - Run `npm run build:html` and `npm test` locally

### Tests Fail

1. **Run tests locally** - `npm run test`
2. **Check test output** - Review which specific tests are failing
3. **Fix issues** - Address any HTML, accessibility, or SEO issues

### PR Comment Not Appearing

1. **Check permissions** - Ensure GitHub Actions has write permissions
2. **Review workflow** - Check if deployment actually completed
3. **Check PR status** - Comments only appear on merged PRs

## Customization

### Change Deployment Branch

Edit `.github/workflows/deploy-ftp.yml`:

```yaml
on:
  pull_request:
    types:
      - closed
    branches:
      - production  # Change from 'main' to 'production'
```

### PR Comment Customization

The workflow automatically comments on the PR with deployment status. You can customize the message in the workflow file.

### Add Slack Notifications

Add to the workflow:

```yaml
- name: Slack Notification
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
  if: always()
```

## Rollback Procedure

If a deployment causes issues:

1. **Revert the merge commit:**
   ```bash
   git revert -m 1 <merge-commit-hash>
   git push origin main
   ```

2. **Manual rollback:**
   - Access FTP directly
   - Restore previous version from backup
   - Or redeploy a previous commit

3. **Check deployment history:**
   - Go to Actions tab
   - Find last successful deployment
   - Note the commit SHA
   - Create new deployment from that commit

## Support

For issues with:
- **GitHub Actions** - Check [GitHub Actions documentation](https://docs.github.com/en/actions)
- **FTP Deployment** - Review [FTP-Deploy-Action docs](https://github.com/SamKirkland/FTP-Deploy-Action)
- **Site build** - See main README.md

## Next Steps

1. ✅ Configure GitHub Secrets
2. ✅ Test deployment with a PR
3. ✅ Monitor first production deployment
4. 🔄 Set up branch protection rules
5. 🔔 Configure notifications (optional)
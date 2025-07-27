# Webhook Troubleshooting Guide

## 409 Error: "Webhook for this repository already exists"

This error occurs when trying to connect a repository that already has a webhook configured for GitWizard.

### Automatic Resolution

The application now automatically handles this situation by:
1. Detecting existing webhooks with the same URL
2. Deleting the conflicting webhook
3. Creating a new webhook

### Manual Resolution

If automatic resolution fails, you can manually clean up webhooks:

#### Option 1: Use the Cleanup Script

```bash
# Navigate to the project directory
cd gitwizard

# Run the cleanup script
node scripts/cleanup-webhooks.js <owner> <repo> <github-token>

# Example:
node scripts/cleanup-webhooks.js octocat Hello-World ghp_xxxxxxxxxxxx
```

#### Option 2: Manual GitHub Settings

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Webhooks**
3. Look for webhooks pointing to your GitWizard domain
4. Delete any conflicting webhooks
5. Try connecting the repository again

#### Option 3: Recreate Webhook via API

If you have a repository already connected but with a broken webhook:

```bash
# PATCH request to recreate webhook
curl -X PATCH /api/repositories \
  -H "Content-Type: application/json" \
  -d '{
    "repoId": "your-repo-id",
    "action": "recreate-webhook"
  }'
```

### Common Scenarios

#### Scenario 1: Repository Previously Connected
- **Cause**: Repository was connected before but webhook wasn't properly cleaned up
- **Solution**: Use the automatic conflict resolution or manual cleanup

#### Scenario 2: Multiple GitWizard Instances
- **Cause**: Repository has webhooks from different GitWizard installations
- **Solution**: Clean up all GitWizard webhooks and reconnect

#### Scenario 3: Stale Webhook
- **Cause**: Webhook exists but points to an old/invalid URL
- **Solution**: Delete the stale webhook and reconnect

### Prevention

To prevent this issue in the future:
1. Always use the DELETE endpoint when removing repositories
2. Ensure proper cleanup when switching between environments
3. Use unique webhook URLs for different environments

### API Endpoints

#### DELETE Repository
```http
DELETE /api/repositories?id=<repository-id>
```
Automatically cleans up the webhook when deleting a repository.

#### PATCH Repository (Recreate Webhook)
```http
PATCH /api/repositories
Content-Type: application/json

{
  "repoId": "<repository-id>",
  "action": "recreate-webhook"
}
```
Recreates the webhook for an existing repository.

### Environment Variables

Ensure these are properly configured:
- `NEXT_PUBLIC_APP_URL`: Your application's public URL
- `GITHUB_WEBHOOK_SECRET`: Secret for webhook verification

### Debugging

To debug webhook issues:
1. Check the application logs for detailed error messages
2. Verify the webhook URL is accessible from GitHub
3. Ensure the webhook secret is properly configured
4. Check repository permissions and access tokens 
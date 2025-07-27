#!/usr/bin/env node

/**
 * Utility script to clean up existing webhooks from GitHub repositories
 * Usage: node scripts/cleanup-webhooks.js <owner> <repo> <github-token>
 */

import https from 'https';

function makeRequest(url, options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function listWebhooks(owner, repo, token) {
  const options = {
    hostname: 'api.github.com',
    path: `/repos/${owner}/${repo}/hooks`,
    method: 'GET',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitWizard-Cleanup/1.0'
    }
  };

  return makeRequest(options, null);
}

async function deleteWebhook(owner, repo, webhookId, token) {
  const options = {
    hostname: 'api.github.com',
    path: `/repos/${owner}/${repo}/hooks/${webhookId}`,
    method: 'DELETE',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitWizard-Cleanup/1.0'
    }
  };

  return makeRequest(options, null);
}

async function main() {
  const [,, owner, repo, token] = process.argv;

  if (!owner || !repo || !token) {
    console.error('Usage: node scripts/cleanup-webhooks.js <owner> <repo> <github-token>');
    console.error('Example: node scripts/cleanup-webhooks.js octocat Hello-World ghp_xxxxxxxxxxxx');
    process.exit(1);
  }

  try {
    console.log(`Listing webhooks for ${owner}/${repo}...`);
    const { status, data } = await listWebhooks(owner, repo, token);

    if (status !== 200) {
      console.error(`Failed to list webhooks: ${status}`, data);
      process.exit(1);
    }

    if (!Array.isArray(data) || data.length === 0) {
      console.log('No webhooks found for this repository.');
      return;
    }

    console.log(`Found ${data.length} webhook(s):`);
    data.forEach((hook, index) => {
      console.log(`${index + 1}. ID: ${hook.id}, URL: ${hook.config.url}, Active: ${hook.active}`);
    });

    // Find webhooks that might be from GitWizard
    const gitwizardWebhooks = data.filter(hook => 
      hook.config.url.includes('gitwizard') || 
      hook.config.url.includes('webhook/github')
    );

    if (gitwizardWebhooks.length === 0) {
      console.log('No GitWizard webhooks found.');
      return;
    }

    console.log(`\nFound ${gitwizardWebhooks.length} potential GitWizard webhook(s):`);
    
    for (const hook of gitwizardWebhooks) {
      console.log(`\nDeleting webhook ${hook.id} (${hook.config.url})...`);
      
      const deleteResult = await deleteWebhook(owner, repo, hook.id, token);
      
      if (deleteResult.status === 204) {
        console.log(`✅ Successfully deleted webhook ${hook.id}`);
      } else {
        console.log(`❌ Failed to delete webhook ${hook.id}: ${deleteResult.status}`);
      }
    }

    console.log('\nCleanup completed!');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the script if called directly
main(); 
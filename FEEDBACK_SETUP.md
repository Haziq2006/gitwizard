# Feedback System Setup Guide

This guide explains how to configure the feedback system to collect user feedback through various services.

## 🎯 **Features**

- **Floating feedback button** on the landing page
- **Modal form** with feedback type selection
- **Multiple integration options** (Tally.io, Discord, Slack, Google Sheets)
- **No database required** - all data goes to external services

## 🔧 **Setup Options**

### Option 1: Tally.io (Recommended)

Tally.io is a great no-code form builder that can collect and organize feedback.

#### Setup Steps:
1. **Create a Tally form**:
   - Go to [tally.so](https://tally.so)
   - Create a new form
   - Add fields: Email, Message, Feedback Type
   - Get your form URL

2. **Configure environment variable**:
   ```env
   TALLY_FORM_URL=https://tally.so/r/your-form-id
   ```

3. **The system will**:
   - Collect feedback in the modal
   - Redirect users to your Tally form with pre-filled data
   - You'll receive all feedback in your Tally dashboard

### Option 2: Discord Webhook

Send feedback directly to a Discord channel.

#### Setup Steps:
1. **Create a Discord webhook**:
   - Go to your Discord server settings
   - Navigate to Integrations → Webhooks
   - Create a new webhook
   - Copy the webhook URL

2. **Configure environment variable**:
   ```env
   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url
   ```

3. **The system will**:
   - Send formatted messages to your Discord channel
   - Include email, feedback type, and message
   - Show timestamps and source

### Option 3: Slack Webhook

Send feedback to a Slack channel.

#### Setup Steps:
1. **Create a Slack webhook**:
   - Go to your Slack workspace settings
   - Navigate to Apps → Incoming Webhooks
   - Create a new webhook
   - Copy the webhook URL

2. **Configure environment variable**:
   ```env
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your-webhook-url
   ```

3. **The system will**:
   - Send formatted messages to your Slack channel
   - Include all feedback details
   - Use Slack's block formatting

### Option 4: Google Sheets

Store feedback in a Google Sheet.

#### Setup Steps:
1. **Create a Google Apps Script**:
   ```javascript
   function doPost(e) {
     const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     const data = JSON.parse(e.postData.contents);
     
     sheet.appendRow([
       new Date(),
       data.email,
       data.feedbackType,
       data.message,
       data.source
     ]);
     
     return ContentService.createTextOutput(JSON.stringify({success: true}))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```

2. **Deploy the script** and get the web app URL

3. **Configure environment variable**:
   ```env
   GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/your-script-id/exec
   ```

## 🚀 **Deployment**

### Environment Variables

Add these to your Vercel environment variables:

```env
# Choose one or more of these:
TALLY_FORM_URL=https://tally.so/r/your-form-id
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your-webhook-url
GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/your-script-id/exec
```

### Vercel Setup

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the variables above
4. Redeploy your application

## 🎨 **Customization**

### Styling

The feedback button and modal use Tailwind CSS classes. You can customize:

- **Button position**: Modify `bottom-6 right-6` in `FeedbackButton.tsx`
- **Button color**: Change `bg-blue-600` to your brand color
- **Modal styling**: Update classes in `FeedbackModal.tsx`

### Feedback Types

Edit the feedback types in `FeedbackModal.tsx`:

```typescript
const feedbackTypes = [
  { id: 'bug', label: 'Bug Report', icon: Bug, color: 'text-red-600' },
  { id: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'text-blue-600' },
  { id: 'enhancement', label: 'UX Enhancement', icon: Star, color: 'text-purple-600' },
  { id: 'general', label: 'General Feedback', icon: MessageSquare, color: 'text-gray-600' },
];
```

## 📊 **Analytics**

### Tally.io Analytics
- View form submissions in your Tally dashboard
- Export data to CSV/Excel
- Set up email notifications

### Discord/Slack Analytics
- Search through feedback messages
- Use bots to categorize feedback
- Set up automated responses

### Google Sheets Analytics
- Use Google Sheets formulas for analysis
- Create charts and reports
- Set up automated email summaries

## 🔒 **Security**

- **No sensitive data stored** in your application
- **Environment variables** keep webhook URLs secure
- **Input validation** prevents malicious submissions
- **Rate limiting** can be added if needed

## 🧪 **Testing**

1. **Local testing**: The system works with console logging
2. **Production testing**: Set up environment variables and test submissions
3. **Service testing**: Verify webhooks are receiving data correctly

## 📝 **Example Usage**

Users will see a floating feedback button on your landing page. When clicked:

1. **Modal opens** with feedback type selection
2. **User fills form** with email and message
3. **System processes** the submission based on your configuration
4. **User gets confirmation** and data is sent to your chosen service

This provides a seamless way to collect user feedback without managing a database! 
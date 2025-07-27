import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, message, feedbackType } = body;

    // Validate required fields
    if (!email || !message) {
      return NextResponse.json(
        { error: 'Email and message are required' },
        { status: 400 }
      );
    }

    // You can integrate with various services here:

    // Option 1: Redirect to Tally.io form with pre-filled data
    const tallyFormUrl = process.env.TALLY_FORM_URL;
    if (tallyFormUrl) {
      const params = new URLSearchParams({
        email: email,
        message: message,
        type: feedbackType || 'general'
      });
      
      return NextResponse.json({
        success: true,
        redirectUrl: `${tallyFormUrl}?${params.toString()}`
      });
    }

    // Option 2: Send to Google Sheets (if you have a Google Apps Script)
    const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL;
    if (googleScriptUrl) {
      const response = await fetch(googleScriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          message,
          feedbackType,
          timestamp: new Date().toISOString(),
          source: 'gitwizard-landing'
        })
      });

      if (response.ok) {
        return NextResponse.json({ success: true });
      }
    }

    // Option 3: Send to Discord webhook
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (discordWebhookUrl) {
      const embed = {
        title: `New Feedback: ${feedbackType}`,
        description: message,
        color: 0x0099ff,
        fields: [
          {
            name: 'Email',
            value: email,
            inline: true
          },
          {
            name: 'Type',
            value: feedbackType || 'general',
            inline: true
          },
          {
            name: 'Timestamp',
            value: new Date().toLocaleString(),
            inline: true
          }
        ]
      };

      await fetch(discordWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          embeds: [embed]
        })
      });

      return NextResponse.json({ success: true });
    }

    // Option 4: Send to Slack webhook
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (slackWebhookUrl) {
      const slackMessage = {
        text: `New feedback received!`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*New Feedback*\n*Type:* ${feedbackType || 'general'}\n*Email:* ${email}\n*Message:* ${message}`
            }
          }
        ]
      };

      await fetch(slackWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slackMessage)
      });

      return NextResponse.json({ success: true });
    }

    // Fallback: Just log the feedback (for development)
    console.log('Feedback received:', {
      email,
      message,
      feedbackType,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
} 
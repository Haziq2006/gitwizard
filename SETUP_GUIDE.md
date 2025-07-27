# GitWizard Setup Guide

Complete guide to deploy GitWizard from zero to production.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ 
- GitHub account
- Supabase account
- Resend account (for emails)
- Stripe account (for payments)

### 2. Clone and Install
```bash
git clone https://github.com/yourusername/gitwizard.git
cd gitwizard
npm install --legacy-peer-deps
```

### 3. Environment Setup
Create `.env.local` in the root directory:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-nextauth-key-32-chars

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_TOKEN=your-github-personal-access-token
GITHUB_WEBHOOK_SECRET=your-webhook-secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Resend (Email)
RESEND_API_KEY=your-resend-api-key

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
STRIPE_PRICE_ID_PRO=price_1234567890
STRIPE_PRICE_ID_BUSINESS=price_0987654321

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feedback (Optional)
NEXT_PUBLIC_TALLY_FORM_URL=https://tally.so/r/your-form-id
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your-webhook
```

## 🔧 Service Setup

### 1. GitHub OAuth App

1. Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: GitWizard
   - **Homepage URL**: `http://localhost:3000` (development) or your domain
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy the **Client ID** and **Client Secret** to your `.env.local`

### 2. GitHub Personal Access Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scopes:
   - `repo` (Full control of private repositories)
   - `read:user` (Read user profile data)
   - `user:email` (Read user email addresses)
4. Copy the token to `GITHUB_TOKEN` in your `.env.local`

### 3. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and keys
3. Copy the keys to your `.env.local`
4. Run the database schema:

```sql
-- Copy and paste the contents of DATABASE_SCHEMA.sql
-- into your Supabase SQL editor and run it
```

### 4. Resend Setup (Email)

1. Sign up at [resend.com](https://resend.com)
2. Create an API key
3. Add your domain for sending emails
4. Copy the API key to `RESEND_API_KEY`

### 5. Stripe Setup (Payments)

1. Create an account at [stripe.com](https://stripe.com)
2. Get your API keys from the dashboard
3. Create products and prices for your plans:
   - Pro Plan: $19/month
   - Business Plan: $99/month
4. Copy the price IDs to your environment variables

## 🗄️ Database Setup

### 1. Run Schema
Execute the SQL from `DATABASE_SCHEMA.sql` in your Supabase SQL editor.

### 2. Optional: Add Demo Data
Run the SQL from `scripts/demo-data.sql` to add sample data for testing.

## 🚀 Development

### 1. Start Development Server
```bash
npm run dev
```

### 2. Test the Application
1. Open [http://localhost:3000](http://localhost:3000)
2. Sign in with GitHub
3. Connect a repository
4. Test the webhook by making a commit with a secret

## 🌐 Production Deployment

### 1. Vercel Deployment (Recommended)

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Set Environment Variables**
   - Go to your Vercel project settings
   - Add all environment variables from `.env.local`
   - Update `NEXTAUTH_URL` to your production domain
   - Update `NEXT_PUBLIC_APP_URL` to your production domain

3. **Deploy**
   ```bash
   vercel --prod
   ```

### 2. Update GitHub OAuth App
1. Go to your GitHub OAuth App settings
2. Update the **Authorization callback URL** to: `https://your-domain.com/api/auth/callback/github`

### 3. Set Up Webhooks
1. Go to your repository settings > Webhooks
2. Add webhook with URL: `https://your-domain.com/api/webhook/github`
3. Set content type to `application/json`
4. Select `push` events only
5. Generate and save webhook secret

### 4. Stripe Webhook
1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select events: `checkout.session.completed`
4. Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`

## 🔒 Security Checklist

- [ ] All environment variables are set
- [ ] GitHub OAuth app is configured
- [ ] Database schema is deployed
- [ ] Email service is configured
- [ ] Stripe webhook is set up
- [ ] Repository webhooks are configured
- [ ] HTTPS is enabled (production)
- [ ] Privacy Policy and Terms are added
- [ ] Error monitoring is configured

## 🧪 Testing

### 1. Test Authentication
- Sign in with GitHub
- Verify user is created in database
- Check access token is stored

### 2. Test Repository Connection
- Connect a test repository
- Verify webhook is created
- Check repository appears in dashboard

### 3. Test Secret Detection
- Make a commit with a test secret:
  ```javascript
  // config/test.js
  const apiKey = "sk-1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz";
  ```
- Check if secret is detected and alert is sent

### 4. Test Email Alerts
- Verify email is sent when secret is detected
- Check email template looks correct
- Test unsubscribe functionality

### 5. Test Billing
- Test subscription creation
- Verify plan limits are enforced
- Test billing portal access

## 📊 Monitoring

### 1. Set Up Logging
- Monitor webhook processing
- Track secret detection accuracy
- Monitor email delivery rates

### 2. Performance Monitoring
- Track API response times
- Monitor database performance
- Watch for rate limiting

### 3. Error Tracking
- Set up error monitoring (Sentry, etc.)
- Monitor failed webhooks
- Track authentication issues

## 🚨 Troubleshooting

### Common Issues

1. **Webhook 409 Error**
   - Repository already has webhooks
   - Use the cleanup script: `node scripts/cleanup-webhooks.js`

2. **Email Not Sending**
   - Check Resend API key
   - Verify domain is configured
   - Check email templates

3. **Authentication Issues**
   - Verify GitHub OAuth app settings
   - Check callback URLs
   - Ensure scopes are correct

4. **Database Errors**
   - Run schema again
   - Check RLS policies
   - Verify service role key

5. **Stripe Issues**
   - Verify webhook endpoint
   - Check price IDs
   - Test webhook signature

## 📈 Next Steps

1. **Add Analytics**
   - Google Analytics
   - Mixpanel or Amplitude
   - Custom event tracking

2. **Improve Security**
   - Rate limiting
   - Input validation
   - Security headers

3. **Add Features**
   - Slack/Discord integration
   - Custom regex patterns
   - Team collaboration

4. **Scale Up**
   - Database optimization
   - CDN setup
   - Load balancing

## 📞 Support

- **Documentation**: [docs.gitwizard.com](https://docs.gitwizard.com)
- **Email**: support@gitwizard.com
- **GitHub Issues**: [Report bugs](https://github.com/yourusername/gitwizard/issues)

---

*This setup guide covers the essential steps to get GitWizard running. For advanced configuration, refer to the individual service documentation.* 
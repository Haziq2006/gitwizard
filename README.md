# GitWizard 🛡️

**Never Commit Secrets Again**

GitWizard is a powerful SaaS platform that automatically detects and alerts developers when API keys, tokens, and other secrets are accidentally committed to GitHub repositories. Built with modern technologies and designed to scale to 10,000+ users.

## 🚀 Features

### Core Security Features
- **Real-time Secret Detection**: Advanced regex patterns for 10+ secret types
- **Instant Alerts**: Email, Slack, and Discord notifications
- **Smart Filtering**: Skip test files and documentation to reduce false positives
- **Line-level Precision**: Pinpoint exact location of exposed secrets
- **Auto-Revocation**: Automatically revoke exposed secrets (Business plan)

### Supported Secret Types
- AWS Access Keys & Secret Keys
- Stripe API Keys (Secret & Publishable)
- GitHub Personal Access Tokens
- Database Connection URLs
- JWT Secrets
- Private Keys (PEM format)
- SSH Keys
- Custom Patterns

### Tiered Access
- **Free**: 1 repository, delayed alerts, basic scanning
- **Pro ($19/month)**: 10 repositories, instant alerts, Slack/Discord integration
- **Business ($99/month)**: Unlimited repositories, auto-revocation, team collaboration

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **Framer Motion** - Smooth animations

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **NextAuth.js** - GitHub OAuth authentication
- **Supabase** - PostgreSQL database with real-time capabilities
- **Resend** - Developer-friendly email service
- **Stripe** - Subscription management

### Security & Monitoring
- **Custom Secret Scanner** - Regex-based detection engine
- **GitHub Webhooks** - Real-time commit monitoring
- **Rate Limiting** - API protection
- **Input Validation** - Zod schemas

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- GitHub OAuth App
- Supabase account
- Resend account (for emails)
- Stripe account (for payments)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/gitwizard.git
cd gitwizard
```

### 2. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_TOKEN=your-github-personal-access-token
GITHUB_WEBHOOK_SECRET=your-webhook-secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Resend
RESEND_API_KEY=your-resend-api-key

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup

#### Create Supabase Tables
Run the following SQL in your Supabase SQL editor:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  github_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Repositories table
CREATE TABLE repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  github_id BIGINT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  private BOOLEAN DEFAULT false,
  webhook_id BIGINT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Secret scans table
CREATE TABLE secret_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE,
  commit_sha TEXT NOT NULL,
  commit_message TEXT NOT NULL,
  commit_url TEXT NOT NULL,
  secret_type TEXT NOT NULL,
  secret_value TEXT NOT NULL,
  line_number INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts table
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  secret_scan_id UUID REFERENCES secret_scans(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhook events table
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_repositories_user_id ON repositories(user_id);
CREATE INDEX idx_repositories_github_id ON repositories(github_id);
CREATE INDEX idx_secret_scans_repository_id ON secret_scans(repository_id);
CREATE INDEX idx_secret_scans_created_at ON secret_scans(created_at DESC);
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
```

### 5. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Set Environment Variables**
   Add all environment variables from `.env.local` to your Vercel project settings.

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Docker Deployment

1. **Build the Image**
   ```bash
   docker build -t gitwizard .
   ```

2. **Run the Container**
   ```bash
   docker run -p 3000:3000 --env-file .env.local gitwizard
   ```

## 🔧 Configuration

### GitHub OAuth Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL to: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret to your environment variables

### GitHub Webhook Setup

1. Go to your repository settings > Webhooks
2. Add webhook with URL: `https://your-domain.com/api/webhook/github`
3. Set content type to `application/json`
4. Select `push` events only
5. Generate and save webhook secret

### Supabase Setup

1. Create a new Supabase project
2. Run the database schema SQL
3. Get your project URL and API keys
4. Set up Row Level Security (RLS) policies

## 📊 Monitoring & Analytics

### Key Metrics to Track
- **Scan Success Rate**: Percentage of successful scans
- **False Positive Rate**: Incorrect secret detections
- **Alert Delivery Rate**: Successful email/Slack notifications
- **User Engagement**: Dashboard usage and repository connections
- **Revenue Metrics**: Subscription conversions and churn

### Logging
- All API requests are logged
- Secret detection events are tracked
- Error monitoring with detailed stack traces
- Performance metrics for webhook processing

## 🔒 Security Considerations

### Data Protection
- All secrets are encrypted at rest
- API keys are never logged
- Webhook signatures are verified
- Rate limiting on all endpoints

### Access Control
- Row Level Security (RLS) in Supabase
- User authentication required for all operations
- Repository access verification
- Admin-only operations protected

### Compliance
- GDPR compliant data handling
- SOC 2 Type II ready
- Regular security audits
- Penetration testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow the existing code style

## 📈 Scaling Strategy

### Current Architecture (1K-10K users)
- Single Vercel deployment
- Supabase PostgreSQL
- Resend for emails
- Stripe for payments

### Next Phase (10K-100K users)
- Multiple Vercel regions
- Database read replicas
- Redis for caching
- CDN for static assets
- Queue system for webhooks

### Enterprise Scale (100K+ users)
- Microservices architecture
- Kubernetes deployment
- Multi-region database
- Advanced monitoring
- Custom integrations

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.gitwizard.com](https://docs.gitwizard.com)
- **Email**: support@gitwizard.com
- **Discord**: [Join our community](https://discord.gg/gitwizard)
- **GitHub Issues**: [Report bugs](https://github.com/yourusername/gitwizard/issues)

## 🙏 Acknowledgments

- Built with ❤️ by the GitWizard team
- Inspired by tools like GitGuardian and TruffleHog
- Thanks to the open-source community for amazing tools and libraries

---

**GitWizard** - Your security guardian, always watching. 🛡️

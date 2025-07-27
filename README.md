# GitWizard 🛡️

**Never Commit Secrets Again**

GitWizard is a powerful SaaS platform that automatically detects and alerts developers when API keys, tokens, and other secrets are accidentally committed to GitHub repositories. Built with modern technologies and designed to scale to 10,000+ users.

## 🚀 Features

### Core Security Features
- **Real-time Secret Detection**: Advanced regex patterns for 20+ secret types
- **Instant Alerts**: Email notifications with beautiful templates
- **Smart Filtering**: Skip test files and documentation to reduce false positives
- **Line-level Precision**: Pinpoint exact location of exposed secrets
- **Auto-Revocation**: Automatically revoke exposed secrets (Business plan)

### Supported Secret Types
- **Cloud Services**: AWS Access Keys, Google Cloud, Azure, Firebase
- **Payment Processors**: Stripe API Keys (Secret & Publishable)
- **AI Services**: OpenAI, Anthropic Claude, DeepSeek, Hugging Face, Cohere
- **Development Tools**: GitHub Tokens, JWT Secrets, Database URLs
- **Communication**: SendGrid, Twilio, Mailgun
- **Search**: Algolia API Keys
- **Custom Patterns**: Add your own regex patterns

### Tiered Access
- **Free**: 1 repository, delayed alerts, basic scanning
- **Pro ($19/month)**: 10 repositories, instant alerts, advanced features
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
STRIPE_PRICE_ID_PRO=price_1234567890
STRIPE_PRICE_ID_BUSINESS=price_0987654321

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feedback (Optional)
NEXT_PUBLIC_TALLY_FORM_URL=https://tally.so/r/your-form-id
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your-webhook
```

### 4. Database Setup

#### Create Supabase Tables
Run the following SQL in your Supabase SQL editor:

```sql
-- Copy and paste the contents of DATABASE_SCHEMA.sql
-- into your Supabase SQL editor and run it
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
- **Alert Delivery Rate**: Successful email notifications
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

## 🎯 What's New

### ✅ **Fully Functional Core Features**
- **Real-time secret scanning** with 20+ secret types
- **Email alerts** with beautiful templates
- **Dashboard** with comprehensive analytics
- **GitHub webhook processing** with conflict resolution
- **User authentication** with token storage
- **Subscription management** with Stripe integration

### ✅ **Production Ready**
- **Database schema** with RLS policies
- **Privacy Policy** and **Terms of Service**
- **Comprehensive setup guide**
- **Demo data** for testing
- **Error handling** and logging
- **Security best practices**

### ✅ **Developer Experience**
- **TypeScript** throughout
- **Clean architecture** with separation of concerns
- **Comprehensive documentation**
- **Easy deployment** with Vercel
- **Testing utilities** and examples

### 🚀 **Ready for Marketing**
- **Professional landing page** with logo carousel
- **Feedback system** with Tally.io integration
- **Pricing plans** with clear value proposition
- **Onboarding flow** with demo data
- **Mobile responsive** design

---

*GitWizard is now a complete, production-ready SaaS application ready for users and marketing!*

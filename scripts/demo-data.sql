-- Demo Data for GitWizard
-- Run this after setting up the main schema

-- Insert demo user
INSERT INTO users (id, email, name, image, github_id, created_at) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440000',
  'demo@gitwizard.com',
  'Demo User',
  'https://avatars.githubusercontent.com/u/1234567?v=4',
  '1234567',
  NOW()
);

-- Insert demo repositories
INSERT INTO repositories (id, user_id, github_id, name, full_name, private, is_active, created_at) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440000',
  123456789,
  'demo-api',
  'demo-user/demo-api',
  false,
  true,
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440000',
  123456790,
  'web-app',
  'demo-user/web-app',
  true,
  true,
  NOW()
);

-- Insert demo secret scans
INSERT INTO secret_scans (id, repository_id, commit_sha, commit_message, commit_url, secret_type, secret_value, line_number, file_path, is_resolved, created_at) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440001',
  'abc123def456',
  'Add API configuration',
  'https://github.com/demo-user/demo-api/commit/abc123def456',
  'openai_api_key',
  'sk-1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz',
  15,
  'config/api.js',
  false,
  NOW() - INTERVAL '2 hours'
),
(
  '550e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440001',
  'def456ghi789',
  'Update database connection',
  'https://github.com/demo-user/demo-api/commit/def456ghi789',
  'database_url',
  'postgresql://user:password@localhost:5432/database',
  8,
  'config/database.js',
  true,
  NOW() - INTERVAL '1 day'
),
(
  '550e8400-e29b-41d4-a716-446655440005',
  '550e8400-e29b-41d4-a716-446655440002',
  'ghi789jkl012',
  'Add Stripe integration',
  'https://github.com/demo-user/web-app/commit/ghi789jkl012',
  'stripe_secret_key',
  'sk_live_51H1234567890abcdefghijklmnopqrstuvwxyz',
  23,
  'src/payment/stripe.js',
  false,
  NOW() - INTERVAL '30 minutes'
),
(
  '550e8400-e29b-41d4-a716-446655440006',
  '550e8400-e29b-41d4-a716-446655440002',
  'jkl012mno345',
  'Configure AWS credentials',
  'https://github.com/demo-user/web-app/commit/jkl012mno345',
  'aws_access_key',
  'AKIAIOSFODNN7EXAMPLE',
  12,
  'config/aws.js',
  false,
  NOW() - INTERVAL '15 minutes'
),
(
  '550e8400-e29b-41d4-a716-446655440007',
  '550e8400-e29b-41d4-a716-446655440002',
  'mno345pqr678',
  'Add JWT secret',
  'https://github.com/demo-user/web-app/commit/mno345pqr678',
  'jwt_secret',
  'your-super-secret-jwt-key-here-32-chars-long',
  5,
  'config/auth.js',
  true,
  NOW() - INTERVAL '3 days'
);

-- Insert demo alerts
INSERT INTO alerts (id, user_id, secret_scan_id, type, status, created_at) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440008',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440003',
  'email',
  'sent',
  NOW() - INTERVAL '2 hours'
),
(
  '550e8400-e29b-41d4-a716-446655440009',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440005',
  'email',
  'pending',
  NOW() - INTERVAL '30 minutes'
),
(
  '550e8400-e29b-41d4-a716-446655440010',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440006',
  'email',
  'pending',
  NOW() - INTERVAL '15 minutes'
);

-- Insert demo subscription (free plan)
INSERT INTO subscriptions (id, user_id, plan, status, created_at) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440011',
  '550e8400-e29b-41d4-a716-446655440000',
  'free',
  'active',
  NOW()
); 
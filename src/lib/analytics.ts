import { track } from '@vercel/analytics';

// Analytics event tracking utility
export const AnalyticsEvents = {
  // Landing page events
  HERO_CTA_CLICK: 'hero_cta_click',
  DEMO_BUTTON_CLICK: 'demo_button_click',
  FEEDBACK_BUTTON_CLICK: 'feedback_button_click',
  PRICING_PLAN_CLICK: 'pricing_plan_click',
  FAQ_TOGGLE: 'faq_toggle',
  
  // Authentication events
  SIGN_IN_ATTEMPT: 'sign_in_attempt',
  SIGN_IN_SUCCESS: 'sign_in_success',
  SIGN_IN_ERROR: 'sign_in_error',
  
  // Dashboard events
  DASHBOARD_VIEW: 'dashboard_view',
  REPOSITORY_ADD: 'repository_add',
  REPOSITORY_REMOVE: 'repository_remove',
  SCAN_VIEW: 'scan_view',
  ALERT_VIEW: 'alert_view',
  
  // Repository management
  WEBHOOK_CREATE: 'webhook_create',
  WEBHOOK_DELETE: 'webhook_delete',
  WEBHOOK_ERROR: 'webhook_error',
  
  // Secret detection
  SECRET_DETECTED: 'secret_detected',
  SECRET_RESOLVED: 'secret_resolved',
  SECRET_IGNORED: 'secret_ignored',
  
  // Billing events
  PLAN_UPGRADE: 'plan_upgrade',
  PLAN_DOWNGRADE: 'plan_downgrade',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_ERROR: 'payment_error',
  
  // Feature usage
  FEATURE_USED: 'feature_used',
  INTEGRATION_SETUP: 'integration_setup',
  
  // Error tracking
  ERROR_OCCURRED: 'error_occurred',
  API_ERROR: 'api_error',
} as const;

export type AnalyticsEvent = typeof AnalyticsEvents[keyof typeof AnalyticsEvents];

// Track events with optional properties
export const trackEvent = (
  event: AnalyticsEvent,
  properties?: Record<string, string | number | boolean>
) => {
  try {
    track(event, properties);
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

// Convenience functions for common events
export const trackHeroCTA = () => trackEvent(AnalyticsEvents.HERO_CTA_CLICK);
export const trackDemoClick = () => trackEvent(AnalyticsEvents.DEMO_BUTTON_CLICK);
export const trackFeedbackClick = () => trackEvent(AnalyticsEvents.FEEDBACK_BUTTON_CLICK);
export const trackPricingClick = (plan: string) => trackEvent(AnalyticsEvents.PRICING_PLAN_CLICK, { plan });
export const trackSignIn = () => trackEvent(AnalyticsEvents.SIGN_IN_ATTEMPT);
export const trackDashboardView = () => trackEvent(AnalyticsEvents.DASHBOARD_VIEW);
export const trackRepositoryAdd = (repoName: string) => trackEvent(AnalyticsEvents.REPOSITORY_ADD, { repository: repoName });
export const trackSecretDetected = (secretType: string) => trackEvent(AnalyticsEvents.SECRET_DETECTED, { type: secretType });
export const trackError = (errorType: string, errorMessage: string) => trackEvent(AnalyticsEvents.ERROR_OCCURRED, { type: errorType, message: errorMessage }); 
# Production Monitoring Setup Guide

This guide covers the monitoring and alerting setup for production deployment.

## ✅ Implemented: Error Tracking with Sentry

### Setup Instructions

1. **Create a Sentry Account**
   - Go to [sentry.io](https://sentry.io) and create a free account
   - Create a new project and select "React" as the platform

2. **Get Your DSN**
   - After creating the project, copy your DSN (Data Source Name)
   - It looks like: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`

3. **Add DSN to Environment**
   - In your deployment platform (Netlify), add environment variable:
     ```
     VITE_SENTRY_DSN=your_sentry_dsn_here
     ```
   - Redeploy your application

4. **Verify Integration**
   - Sentry will automatically capture:
     - Unhandled errors and exceptions
     - Network errors
     - React component errors (via ErrorBoundary)
     - Performance metrics
     - User sessions with replay (on errors)

### Features Enabled
- ✅ Automatic error capture in production
- ✅ Source maps for better error tracking
- ✅ Session replay on errors
- ✅ Performance monitoring
- ✅ Release tracking
- ✅ Custom error context and tagging

### Usage
Errors are automatically logged. For custom error tracking:
```typescript
import { logError } from "@/utils/errorLogger";

try {
  // Your code
} catch (error) {
  logError(error, "Custom context");
}
```

---

## 📊 Database Backup Automation

### Lovable Cloud Backups
Your database is automatically backed up by Lovable Cloud (Supabase):

**Automatic Backups:**
- Daily automated backups are included
- Point-in-time recovery available
- Backups retained based on your plan

**To Access Backups:**
1. Open your backend dashboard
2. Navigate to Database → Backups
3. You can restore from any backup point

**Best Practices:**
- Monitor backup success in the dashboard
- Test restoration process quarterly
- Document critical restoration procedures

---

## 🚨 Uptime Monitoring

### Recommended Services

#### Option 1: UptimeRobot (Free)
**Setup:**
1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Create a free account
3. Add a new monitor:
   - Monitor Type: HTTPS
   - URL: `https://yourdomain.com`
   - Monitoring Interval: 5 minutes (free tier)
4. Set up alert contacts (email, SMS, Slack, etc.)

**What it monitors:**
- Website availability (HTTP 200 response)
- Response time
- SSL certificate expiration

**Alerts:**
- Email notifications on downtime
- Status page for customers
- SMS alerts (paid plans)

#### Option 2: Pingdom (Paid)
More advanced monitoring with:
- Multi-location checks
- Transaction monitoring
- Real user monitoring
- Detailed performance insights

#### Option 3: Better Uptime (Recommended for Teams)
- Phone call alerts
- Incident management
- Status pages
- Team collaboration features

### Configuration Checklist
- [ ] Monitor main website URL
- [ ] Monitor critical API endpoints
- [ ] Set up email alerts to team
- [ ] Configure escalation rules
- [ ] Create public status page (optional)
- [ ] Test alert notifications

---

## 📈 Performance Monitoring

### Already Implemented
- ✅ Lighthouse scores in development
- ✅ Performance optimizations documented in PERFORMANCE_OPTIMIZATIONS.md
- ✅ Core Web Vitals tracking

### Recommended: Google Analytics 4

**Setup:**
1. Create GA4 property at [analytics.google.com](https://analytics.google.com)
2. Get your Measurement ID (G-XXXXXXXXXX)
3. Add to your website:

```typescript
// Add to src/main.tsx
import ReactGA from 'react-ga4';

if (import.meta.env.PROD) {
  ReactGA.initialize('G-XXXXXXXXXX');
}
```

4. Install package:
```bash
npm install react-ga4
```

**What it tracks:**
- Page views and user sessions
- User demographics and behavior
- Conversion goals and events
- Core Web Vitals
- Traffic sources

### Performance Metrics Dashboard

Create a monitoring dashboard tracking:
- Average page load time
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- First Input Delay (FID)

---

## 🔔 Alerting System Setup

### Critical Alerts (Immediate Response Required)
1. **Website Down**
   - Channel: Phone call + Email + SMS
   - Response Time: < 5 minutes
   - Setup via: UptimeRobot or PagerDuty

2. **Critical Errors (High Volume)**
   - Channel: Email + Slack
   - Threshold: > 10 errors in 5 minutes
   - Setup via: Sentry alerts

3. **Database Issues**
   - Channel: Email + SMS
   - Monitor: Connection failures, high load
   - Setup via: Lovable Cloud dashboard

### Warning Alerts (Review Within Hours)
1. **Elevated Error Rate**
   - Threshold: > 5 errors in 10 minutes
   - Channel: Email
   - Setup via: Sentry

2. **Slow Response Times**
   - Threshold: > 3s average load time
   - Channel: Email
   - Setup via: UptimeRobot or Pingdom

3. **High Traffic Spike**
   - Threshold: 3x normal traffic
   - Channel: Email
   - Setup via: Google Analytics alerts

---

## 📊 Business Analytics

### Recommended Tracking

1. **Lead Generation Metrics**
   - Contact form submissions
   - Calculator usage
   - Quote requests
   - Chatbot interactions

2. **Conversion Funnel**
   - Homepage → Product pages
   - Product pages → Contact
   - Calculator → Quote request
   - Visit → Consultation booking

3. **User Behavior**
   - Most visited pages
   - Average session duration
   - Bounce rate by page
   - Exit pages

### Implementation
Add event tracking to key components:

```typescript
// Example: Track calculator usage
import { trackAnalyticsEvent } from "@/utils/trackAnalytics";

trackAnalyticsEvent({
  eventType: "lead_magnet_usage",
  companyName: formData.companyName,
  companyEmail: formData.email,
  metadata: { tool: "calculator", volume: volume }
});
```

---

## 🔍 Log Management

### Edge Function Logs
Access via Lovable Cloud dashboard:
1. Navigate to Edge Functions
2. Select function
3. View logs and metrics

**What to monitor:**
- Function invocation count
- Error rates
- Average execution time
- Memory usage

### Database Logs
Available in Lovable Cloud dashboard:
- Query performance
- Slow queries
- Error logs
- Connection pool status

---

## ✅ Monitoring Checklist

### Immediate Setup (Before Launch)
- [ ] Configure Sentry DSN in environment variables
- [ ] Set up UptimeRobot for website monitoring
- [ ] Configure email alerts for critical issues
- [ ] Test all alert channels
- [ ] Verify database backup schedule

### Within First Week
- [ ] Set up Google Analytics 4
- [ ] Create performance monitoring dashboard
- [ ] Configure business analytics tracking
- [ ] Document incident response procedures
- [ ] Set up team access to all monitoring tools

### Ongoing (Monthly)
- [ ] Review Sentry error trends
- [ ] Check backup restoration capability
- [ ] Analyze performance metrics
- [ ] Review and adjust alert thresholds
- [ ] Update monitoring documentation

---

## 📞 Incident Response Plan

### 1. Detection
- Automated alerts via monitoring systems
- User reports
- Regular health checks

### 2. Assessment
- Check Sentry for errors
- Review uptime monitor status
- Check database dashboard
- Verify edge function logs

### 3. Response
- Follow documented procedures
- Communicate with team
- Update status page (if applicable)
- Implement fix or rollback

### 4. Post-Mortem
- Document incident details
- Identify root cause
- Implement preventive measures
- Update runbooks

---

## 📚 Resources

- **Sentry Documentation**: https://docs.sentry.io/platforms/javascript/guides/react/
- **UptimeRobot Guide**: https://uptimerobot.com/help/
- **Lovable Cloud Docs**: https://docs.lovable.dev/features/cloud
- **Google Analytics 4**: https://support.google.com/analytics/

---

**Status**: Phase 2 Monitoring Setup Complete
**Next Steps**: Configure production environment variables and test all monitoring systems

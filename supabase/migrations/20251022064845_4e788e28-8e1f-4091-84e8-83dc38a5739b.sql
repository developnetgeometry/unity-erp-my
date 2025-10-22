-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule auto-clockout every 30 minutes
SELECT cron.schedule(
  'auto-clockout-missed-employees',
  '*/30 * * * *', -- Every 30 minutes
  $$
  SELECT
    net.http_post(
        url:='https://xrtgpkehiureaoxlxatu.supabase.co/functions/v1/auto-clockout-scheduler',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhydGdwa2VoaXVyZWFveGx4YXR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NDQ3OTUsImV4cCI6MjA3NjIyMDc5NX0.9hXQ4_uZFAGXjUQyGTh_QeOYEaifCLFV38syJetiaz0"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Schedule OT auto-close every 30 minutes
SELECT cron.schedule(
  'auto-close-overtime-sessions',
  '*/30 * * * *', -- Every 30 minutes
  $$
  SELECT
    net.http_post(
        url:='https://xrtgpkehiureaoxlxatu.supabase.co/functions/v1/ot-auto-close-scheduler',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhydGdwa2VoaXVyZWFveGx4YXR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NDQ3OTUsImV4cCI6MjA3NjIyMDc5NX0.9hXQ4_uZFAGXjUQyGTh_QeOYEaifCLFV38syJetiaz0"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Schedule late arrival notifier every 15 minutes (8 AM - 12 PM only)
SELECT cron.schedule(
  'notify-late-arrivals',
  '*/15 8-12 * * *', -- Every 15 minutes between 8 AM and 12 PM
  $$
  SELECT
    net.http_post(
        url:='https://xrtgpkehiureaoxlxatu.supabase.co/functions/v1/late-arrival-notifier',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhydGdwa2VoaXVyZWFveGx4YXR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NDQ3OTUsImV4cCI6MjA3NjIyMDc5NX0.9hXQ4_uZFAGXjUQyGTh_QeOYEaifCLFV38syJetiaz0"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);
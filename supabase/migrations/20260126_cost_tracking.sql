-- API Cost Tracking and Protection System
-- Date: 2026-01-26
-- Purpose: Prevent runaway API costs by tracking spending and enforcing limits

-- 1. API Cost Tracking Table
CREATE TABLE IF NOT EXISTS public.api_cost_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    operation TEXT NOT NULL, -- 'carousel_generation', 'image_generation', 'chat', etc.
    service TEXT NOT NULL, -- 'openrouter', 'vertexai', 'stable-diffusion', etc.
    model TEXT, -- 'gemini-2.0-flash', 'imagen-3', etc.
    estimated_cost DECIMAL(10, 4) NOT NULL, -- in USD
    actual_cost DECIMAL(10, 4), -- if available from provider
    request_count INTEGER DEFAULT 1,
    metadata JSONB, -- additional details
    created_at TIMESTAMPTZ DEFAULT NOW(),
    date DATE DEFAULT CURRENT_DATE
);

-- Indexes for fast queries
CREATE INDEX idx_api_cost_tracking_user_id ON public.api_cost_tracking(user_id);
CREATE INDEX idx_api_cost_tracking_date ON public.api_cost_tracking(date DESC);
CREATE INDEX idx_api_cost_tracking_operation ON public.api_cost_tracking(operation);
CREATE INDEX idx_api_cost_tracking_service ON public.api_cost_tracking(service);
CREATE INDEX idx_api_cost_tracking_created_at ON public.api_cost_tracking(created_at DESC);

-- 2. Daily Spending Summary (Materialized View for Performance)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.daily_spending_summary AS
SELECT 
    date,
    user_id,
    operation,
    service,
    SUM(estimated_cost) as total_cost,
    SUM(request_count) as total_requests,
    COUNT(*) as operation_count
FROM public.api_cost_tracking
GROUP BY date, user_id, operation, service;

CREATE UNIQUE INDEX idx_daily_spending_summary_unique 
    ON public.daily_spending_summary(date, user_id, operation, service);

-- Refresh function for materialized view
CREATE OR REPLACE FUNCTION refresh_daily_spending_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.daily_spending_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Spending Limits Table
CREATE TABLE IF NOT EXISTS public.spending_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    limit_type TEXT NOT NULL, -- 'daily', 'monthly', 'per_operation'
    operation TEXT, -- NULL for global limits
    max_cost DECIMAL(10, 2) NOT NULL,
    max_requests INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, limit_type, operation)
);

-- Index for fast limit checks
CREATE INDEX idx_spending_limits_user_id ON public.spending_limits(user_id);
CREATE INDEX idx_spending_limits_active ON public.spending_limits(is_active) WHERE is_active = TRUE;

-- 4. Default Spending Limits (Global)
INSERT INTO public.spending_limits (user_id, limit_type, operation, max_cost, max_requests)
VALUES 
    (NULL, 'daily', NULL, 50.00, NULL),
    (NULL, 'monthly', NULL, 500.00, NULL),
    (NULL, 'daily', 'carousel_generation', 20.00, 50),
    (NULL, 'daily', 'image_generation', 10.00, 100),
    (NULL, 'daily', 'chat', 5.00, 500)
ON CONFLICT (user_id, limit_type, operation) DO NOTHING;

-- 5. Function to Check Spending Limit
CREATE OR REPLACE FUNCTION check_spending_limit(
    p_user_id UUID,
    p_operation TEXT,
    p_estimated_cost DECIMAL
)
RETURNS JSONB AS $$
DECLARE
    v_daily_spent DECIMAL;
    v_monthly_spent DECIMAL;
    v_operation_spent DECIMAL;
    v_daily_limit DECIMAL;
    v_monthly_limit DECIMAL;
    v_operation_limit DECIMAL;
    v_operation_requests INTEGER;
    v_operation_max_requests INTEGER;
BEGIN
    -- Get current spending
    SELECT COALESCE(SUM(estimated_cost), 0)
    INTO v_daily_spent
    FROM public.api_cost_tracking
    WHERE (user_id = p_user_id OR p_user_id IS NULL)
    AND date = CURRENT_DATE;

    SELECT COALESCE(SUM(estimated_cost), 0)
    INTO v_monthly_spent
    FROM public.api_cost_tracking
    WHERE (user_id = p_user_id OR p_user_id IS NULL)
    AND date >= DATE_TRUNC('month', CURRENT_DATE);

    SELECT COALESCE(SUM(estimated_cost), 0), COALESCE(SUM(request_count), 0)
    INTO v_operation_spent, v_operation_requests
    FROM public.api_cost_tracking
    WHERE (user_id = p_user_id OR p_user_id IS NULL)
    AND operation = p_operation
    AND date = CURRENT_DATE;

    -- Get limits (user-specific or global)
    SELECT COALESCE(
        (SELECT max_cost FROM public.spending_limits 
         WHERE user_id = p_user_id AND limit_type = 'daily' AND operation IS NULL AND is_active = TRUE),
        (SELECT max_cost FROM public.spending_limits 
         WHERE user_id IS NULL AND limit_type = 'daily' AND operation IS NULL AND is_active = TRUE),
        50.00
    ) INTO v_daily_limit;

    SELECT COALESCE(
        (SELECT max_cost FROM public.spending_limits 
         WHERE user_id = p_user_id AND limit_type = 'monthly' AND operation IS NULL AND is_active = TRUE),
        (SELECT max_cost FROM public.spending_limits 
         WHERE user_id IS NULL AND limit_type = 'monthly' AND operation IS NULL AND is_active = TRUE),
        500.00
    ) INTO v_monthly_limit;

    SELECT COALESCE(
        (SELECT max_cost FROM public.spending_limits 
         WHERE user_id = p_user_id AND limit_type = 'daily' AND operation = p_operation AND is_active = TRUE),
        (SELECT max_cost FROM public.spending_limits 
         WHERE user_id IS NULL AND limit_type = 'daily' AND operation = p_operation AND is_active = TRUE)
    ) INTO v_operation_limit;

    SELECT COALESCE(
        (SELECT max_requests FROM public.spending_limits 
         WHERE user_id = p_user_id AND limit_type = 'daily' AND operation = p_operation AND is_active = TRUE),
        (SELECT max_requests FROM public.spending_limits 
         WHERE user_id IS NULL AND limit_type = 'daily' AND operation = p_operation AND is_active = TRUE)
    ) INTO v_operation_max_requests;

    -- Check limits
    IF v_daily_spent + p_estimated_cost > v_daily_limit THEN
        RETURN jsonb_build_object(
            'allowed', FALSE,
            'reason', 'daily_limit_exceeded',
            'current_spent', v_daily_spent,
            'limit', v_daily_limit,
            'would_be', v_daily_spent + p_estimated_cost
        );
    END IF;

    IF v_monthly_spent + p_estimated_cost > v_monthly_limit THEN
        RETURN jsonb_build_object(
            'allowed', FALSE,
            'reason', 'monthly_limit_exceeded',
            'current_spent', v_monthly_spent,
            'limit', v_monthly_limit,
            'would_be', v_monthly_spent + p_estimated_cost
        );
    END IF;

    IF v_operation_limit IS NOT NULL AND v_operation_spent + p_estimated_cost > v_operation_limit THEN
        RETURN jsonb_build_object(
            'allowed', FALSE,
            'reason', 'operation_limit_exceeded',
            'operation', p_operation,
            'current_spent', v_operation_spent,
            'limit', v_operation_limit,
            'would_be', v_operation_spent + p_estimated_cost
        );
    END IF;

    IF v_operation_max_requests IS NOT NULL AND v_operation_requests + 1 > v_operation_max_requests THEN
        RETURN jsonb_build_object(
            'allowed', FALSE,
            'reason', 'operation_request_limit_exceeded',
            'operation', p_operation,
            'current_requests', v_operation_requests,
            'limit', v_operation_max_requests
        );
    END IF;

    -- All checks passed
    RETURN jsonb_build_object(
        'allowed', TRUE,
        'daily_spent', v_daily_spent,
        'daily_limit', v_daily_limit,
        'daily_remaining', v_daily_limit - v_daily_spent,
        'monthly_spent', v_monthly_spent,
        'monthly_limit', v_monthly_limit
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Function to Log API Cost
CREATE OR REPLACE FUNCTION log_api_cost(
    p_user_id UUID,
    p_operation TEXT,
    p_service TEXT,
    p_model TEXT,
    p_estimated_cost DECIMAL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO public.api_cost_tracking (
        user_id,
        operation,
        service,
        model,
        estimated_cost,
        metadata
    ) VALUES (
        p_user_id,
        p_operation,
        p_service,
        p_model,
        p_estimated_cost,
        p_metadata
    ) RETURNING id INTO v_id;

    RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. RLS Policies
ALTER TABLE public.api_cost_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spending_limits ENABLE ROW LEVEL SECURITY;

-- Admins can see all cost tracking
CREATE POLICY "Admins can view all cost tracking"
    ON public.api_cost_tracking
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_permissions
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
            AND permission_level IN ('admin', 'super_admin')
        )
    );

-- Users can see their own cost tracking
CREATE POLICY "Users can view own cost tracking"
    ON public.api_cost_tracking
    FOR SELECT
    USING (user_id = auth.uid());

-- Service role can insert cost tracking
CREATE POLICY "Service role can insert cost tracking"
    ON public.api_cost_tracking
    FOR INSERT
    WITH CHECK (true);

-- Admins can manage spending limits
CREATE POLICY "Admins can manage spending limits"
    ON public.spending_limits
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_permissions
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
            AND permission_level = 'super_admin'
        )
    );

-- 8. Automatic Alerts Table
CREATE TABLE IF NOT EXISTS public.cost_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type TEXT NOT NULL, -- 'threshold_warning', 'limit_exceeded', 'unusual_spike'
    severity TEXT NOT NULL, -- 'info', 'warning', 'critical'
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    operation TEXT,
    current_value DECIMAL(10, 2),
    threshold_value DECIMAL(10, 2),
    message TEXT,
    metadata JSONB,
    acknowledged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cost_alerts_created_at ON public.cost_alerts(created_at DESC);
CREATE INDEX idx_cost_alerts_acknowledged ON public.cost_alerts(acknowledged) WHERE acknowledged = FALSE;

-- 9. Function to Create Alert
CREATE OR REPLACE FUNCTION create_cost_alert(
    p_alert_type TEXT,
    p_severity TEXT,
    p_user_id UUID,
    p_operation TEXT,
    p_current_value DECIMAL,
    p_threshold_value DECIMAL,
    p_message TEXT
)
RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO public.cost_alerts (
        alert_type,
        severity,
        user_id,
        operation,
        current_value,
        threshold_value,
        message
    ) VALUES (
        p_alert_type,
        p_severity,
        p_user_id,
        p_operation,
        p_current_value,
        p_threshold_value,
        p_message
    ) RETURNING id INTO v_id;

    RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Comments
COMMENT ON TABLE public.api_cost_tracking IS 'Tracks estimated and actual costs of API calls to prevent runaway spending';
COMMENT ON TABLE public.spending_limits IS 'Defines spending limits per user and operation type';
COMMENT ON TABLE public.cost_alerts IS 'Stores alerts for cost thresholds and anomalies';
COMMENT ON FUNCTION check_spending_limit IS 'Checks if an operation would exceed spending limits';
COMMENT ON FUNCTION log_api_cost IS 'Logs the cost of an API operation';

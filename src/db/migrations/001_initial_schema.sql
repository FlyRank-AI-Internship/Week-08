CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================
-- TENANTS
-- =========================

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- USERS
-- =========================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL
        REFERENCES tenants(id)
        ON DELETE CASCADE,

    email VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT users_tenant_email_unique
        UNIQUE (tenant_id, email)
);

CREATE INDEX IF NOT EXISTS idx_users_tenant_id
    ON users(tenant_id);

-- =========================
-- WIDGETS
-- =========================

CREATE TABLE IF NOT EXISTS widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tenant_id UUID NOT NULL
        REFERENCES tenants(id)
        ON DELETE CASCADE,

    type VARCHAR(30) NOT NULL,

    title VARCHAR(200) NOT NULL,

    description TEXT,

    button_text VARCHAR(100) NOT NULL DEFAULT 'Submit',

    fields JSONB NOT NULL DEFAULT '[]'::jsonb,

    display_options JSONB NOT NULL DEFAULT '{}'::jsonb,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT widgets_type_check
        CHECK (
            type IN (
                'signup',
                'contact',
                'cta',
                'popover'
            )
        )
);

CREATE INDEX IF NOT EXISTS idx_widgets_tenant_id
    ON widgets(tenant_id);

CREATE INDEX IF NOT EXISTS idx_widgets_tenant_active
    ON widgets(tenant_id, is_active);

-- =========================
-- SUBMISSIONS
-- =========================

CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    widget_id UUID NOT NULL
        REFERENCES widgets(id)
        ON DELETE CASCADE,

    tenant_id UUID NOT NULL
        REFERENCES tenants(id)
        ON DELETE CASCADE,

    payload JSONB NOT NULL,

    ip_address INET,

    country VARCHAR(100),

    city VARCHAR(100),

    user_agent TEXT,

    is_spam BOOLEAN NOT NULL DEFAULT FALSE,

    idempotency_key VARCHAR(255),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT submissions_idempotency_unique
        UNIQUE (widget_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_submissions_widget_id
    ON submissions(widget_id);

CREATE INDEX IF NOT EXISTS idx_submissions_tenant_id
    ON submissions(tenant_id);

CREATE INDEX IF NOT EXISTS idx_submissions_created_at
    ON submissions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_submissions_tenant_created
    ON submissions(tenant_id, created_at DESC);
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS recycling_service_status text NOT NULL DEFAULT 'NOT_CLIENT',
  ADD COLUMN IF NOT EXISTS recyclean_customer_ref text,
  ADD COLUMN IF NOT EXISTS recycling_service_start_date timestamptz,
  ADD COLUMN IF NOT EXISTS default_collection_site_name text,
  ADD COLUMN IF NOT EXISTS recycling_service_frequency text,
  ADD COLUMN IF NOT EXISTS recycling_internal_notes text;

CREATE TABLE IF NOT EXISTS recycling_collections (
  id serial PRIMARY KEY,
  company_id integer NOT NULL,
  site_name text NOT NULL,
  collection_date timestamptz NOT NULL,
  reporting_month text NOT NULL,
  paper_cardboard_kg numeric(12, 3) NOT NULL DEFAULT 0,
  plastic_kg numeric(12, 3) NOT NULL DEFAULT 0,
  glass_kg numeric(12, 3) NOT NULL DEFAULT 0,
  aluminium_metal_kg numeric(12, 3) NOT NULL DEFAULT 0,
  other_kg numeric(12, 3) NOT NULL DEFAULT 0,
  total_kg numeric(12, 3) NOT NULL,
  internal_comment text,
  created_by_user_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT recycling_collections_non_negative CHECK (
    paper_cardboard_kg >= 0
    AND plastic_kg >= 0
    AND glass_kg >= 0
    AND aluminium_metal_kg >= 0
    AND other_kg >= 0
  ),
  CONSTRAINT recycling_collections_positive_material CHECK (
    paper_cardboard_kg + plastic_kg + glass_kg + aluminium_metal_kg + other_kg > 0
  ),
  CONSTRAINT recycling_collections_total_matches CHECK (
    total_kg = paper_cardboard_kg + plastic_kg + glass_kg + aluminium_metal_kg + other_kg
  ),
  CONSTRAINT recycling_collections_reporting_month_format CHECK (
    reporting_month ~ '^[0-9]{4}-[0-9]{2}$'
  )
);

CREATE INDEX IF NOT EXISTS recycling_collections_company_month_idx
  ON recycling_collections (company_id, reporting_month);

CREATE INDEX IF NOT EXISTS recycling_collections_company_date_idx
  ON recycling_collections (company_id, collection_date);

CREATE INDEX IF NOT EXISTS recycling_collections_company_site_idx
  ON recycling_collections (company_id, site_name);

CREATE TABLE IF NOT EXISTS recycling_conversion_factors (
  id serial PRIMARY KEY,
  material_type text NOT NULL DEFAULT 'total',
  metric_name text NOT NULL,
  metric_label text NOT NULL,
  factor_value numeric(16, 6) NOT NULL,
  factor_unit text NOT NULL,
  source_name text NOT NULL,
  source_reference text,
  effective_date timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  internal_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT recycling_conversion_factors_positive CHECK (factor_value > 0)
);

CREATE INDEX IF NOT EXISTS recycling_conversion_factors_active_metric_idx
  ON recycling_conversion_factors (metric_name, is_active);

CREATE TABLE IF NOT EXISTS recycling_enquiries (
  id serial PRIMARY KEY,
  company_id integer,
  company_name text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text,
  site_location text,
  current_arrangement text,
  message text,
  status text NOT NULL DEFAULT 'new',
  created_by_user_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS recycling_enquiries_company_idx
  ON recycling_enquiries (company_id);

CREATE INDEX IF NOT EXISTS recycling_enquiries_status_idx
  ON recycling_enquiries (status);

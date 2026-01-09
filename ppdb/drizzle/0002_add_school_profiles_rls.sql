-- Enable Row-Level Security on school_profiles table
ALTER TABLE school_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for school_profiles
-- Only allow access to profiles belonging to the current tenant
CREATE POLICY school_profiles_tenant_isolation ON school_profiles
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

-- Allow INSERT for tenant's own data
CREATE POLICY school_profiles_insert_policy ON school_profiles
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

-- Allow UPDATE for tenant's own data
CREATE POLICY school_profiles_update_policy ON school_profiles
  FOR UPDATE
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

-- Allow DELETE for tenant's own data (optional, might not be needed)
CREATE POLICY school_profiles_delete_policy ON school_profiles
  FOR DELETE
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

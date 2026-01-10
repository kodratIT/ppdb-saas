-- Enable Row Level Security on fee_structures table
ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for fee_structures
-- Only allow access to fees belonging to the current tenant
CREATE POLICY fee_structures_tenant_isolation ON fee_structures
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

-- Allow INSERT for tenant's own data
CREATE POLICY fee_structures_insert_policy ON fee_structures
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

-- Allow UPDATE for tenant's own data
CREATE POLICY fee_structures_update_policy ON fee_structures
  FOR UPDATE
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

-- Allow DELETE for tenant's own data
CREATE POLICY fee_structures_delete_policy ON fee_structures
  FOR DELETE
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

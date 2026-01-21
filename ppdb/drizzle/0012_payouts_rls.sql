-- RLS for payouts
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS payouts_tenant_isolation ON payouts;
CREATE POLICY payouts_tenant_isolation ON payouts
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY payouts_insert_policy ON payouts FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY payouts_update_policy ON payouts FOR UPDATE USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY payouts_delete_policy ON payouts FOR DELETE USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

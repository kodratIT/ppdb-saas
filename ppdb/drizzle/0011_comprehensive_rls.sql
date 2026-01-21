-- Comprehensive Row-Level Security Policies for all multi-tenant tables

-- List of tables to enable RLS and add basic path-based isolation
-- 1. units
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS units_tenant_isolation ON units;
CREATE POLICY units_tenant_isolation ON units
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY units_insert_policy ON units FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY units_update_policy ON units FOR UPDATE USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY units_delete_policy ON units FOR DELETE USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

-- 2. users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS users_tenant_isolation ON users;
CREATE POLICY users_tenant_isolation ON users
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY users_insert_policy ON users FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY users_update_policy ON users FOR UPDATE USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY users_delete_policy ON users FOR DELETE USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

-- 3. admission_paths
ALTER TABLE admission_paths ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS admission_paths_tenant_isolation ON admission_paths;
CREATE POLICY admission_paths_tenant_isolation ON admission_paths
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY admission_paths_insert_policy ON admission_paths FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY admission_paths_update_policy ON admission_paths FOR UPDATE USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY admission_paths_delete_policy ON admission_paths FOR DELETE USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

-- 4. fee_structures
ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS fee_structures_tenant_isolation ON fee_structures;
CREATE POLICY fee_structures_tenant_isolation ON fee_structures
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY fee_structures_insert_policy ON fee_structures FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY fee_structures_update_policy ON fee_structures FOR UPDATE USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY fee_structures_delete_policy ON fee_structures FOR DELETE USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

-- 5. custom_fields
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS custom_fields_tenant_isolation ON custom_fields;
CREATE POLICY custom_fields_tenant_isolation ON custom_fields
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY custom_fields_insert_policy ON custom_fields FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY custom_fields_update_policy ON custom_fields FOR UPDATE USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY custom_fields_delete_policy ON custom_fields FOR DELETE USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

-- 6. applications
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS applications_tenant_isolation ON applications;
CREATE POLICY applications_tenant_isolation ON applications
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY applications_insert_policy ON applications FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY applications_update_policy ON applications FOR UPDATE USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY applications_delete_policy ON applications FOR DELETE USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

-- 7. application_documents
ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS application_documents_tenant_isolation ON application_documents;
CREATE POLICY application_documents_tenant_isolation ON application_documents
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY application_documents_insert_policy ON application_documents FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY application_documents_update_policy ON application_documents FOR UPDATE USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY application_documents_delete_policy ON application_documents FOR DELETE USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

-- 8. document_reviews
ALTER TABLE document_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS document_reviews_tenant_isolation ON document_reviews;
CREATE POLICY document_reviews_tenant_isolation ON document_reviews
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY document_reviews_insert_policy ON document_reviews FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY document_reviews_update_policy ON document_reviews FOR UPDATE USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY document_reviews_delete_policy ON document_reviews FOR DELETE USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

-- 9. application_scores
ALTER TABLE application_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS application_scores_tenant_isolation ON application_scores;
CREATE POLICY application_scores_tenant_isolation ON application_scores
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY application_scores_insert_policy ON application_scores FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY application_scores_update_policy ON application_scores FOR UPDATE USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY application_scores_delete_policy ON application_scores FOR DELETE USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

-- 10. selection_results
ALTER TABLE selection_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS selection_results_tenant_isolation ON selection_results;
CREATE POLICY selection_results_tenant_isolation ON selection_results
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY selection_results_insert_policy ON selection_results FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY selection_results_update_policy ON selection_results FOR UPDATE USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY selection_results_delete_policy ON selection_results FOR DELETE USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

-- 11. home_visit_reports
ALTER TABLE home_visit_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS home_visit_reports_tenant_isolation ON home_visit_reports;
CREATE POLICY home_visit_reports_tenant_isolation ON home_visit_reports
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY home_visit_reports_insert_policy ON home_visit_reports FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY home_visit_reports_update_policy ON home_visit_reports FOR UPDATE USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY home_visit_reports_delete_policy ON home_visit_reports FOR DELETE USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

-- 12. invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS invoices_tenant_isolation ON invoices;
CREATE POLICY invoices_tenant_isolation ON invoices
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY invoices_insert_policy ON invoices FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY invoices_update_policy ON invoices FOR UPDATE USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY invoices_delete_policy ON invoices FOR DELETE USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

-- 13. payment_transactions
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS payment_transactions_tenant_isolation ON payment_transactions;
CREATE POLICY payment_transactions_tenant_isolation ON payment_transactions
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY payment_transactions_insert_policy ON payment_transactions FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY payment_transactions_update_policy ON payment_transactions FOR UPDATE USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY payment_transactions_delete_policy ON payment_transactions FOR DELETE USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

-- 14. payment_proofs
ALTER TABLE payment_proofs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS payment_proofs_tenant_isolation ON payment_proofs;
CREATE POLICY payment_proofs_tenant_isolation ON payment_proofs
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY payment_proofs_insert_policy ON payment_proofs FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY payment_proofs_update_policy ON payment_proofs FOR UPDATE USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY payment_proofs_delete_policy ON payment_proofs FOR DELETE USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

-- 15. broadcasts
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS broadcasts_tenant_isolation ON broadcasts;
CREATE POLICY broadcasts_tenant_isolation ON broadcasts
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY broadcasts_insert_policy ON broadcasts FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY broadcasts_update_policy ON broadcasts FOR UPDATE USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
CREATE POLICY broadcasts_delete_policy ON broadcasts FOR DELETE USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

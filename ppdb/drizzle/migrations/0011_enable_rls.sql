-- Enable Row-Level Security pada semua tabel tenant-scoped

-- Enable RLS pada tenants
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants FORCE ROW LEVEL SECURITY;

-- Enable RLS pada users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

-- Enable RLS pada units
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE units FORCE ROW LEVEL SECURITY;

-- Enable RLS pada applications
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications FORCE ROW LEVEL SECURITY;

-- Enable RLS pada admission_paths
ALTER TABLE admission_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE admission_paths FORCE ROW LEVEL SECURITY;

-- Enable RLS pada fee_structures
ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_structures FORCE ROW LEVEL SECURITY;

-- Enable RLS pada invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices FORCE ROW LEVEL SECURITY;

-- Enable RLS pada payment_transactions
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions FORCE ROW LEVEL SECURITY;

-- Enable RLS pada payment_proofs
ALTER TABLE payment_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_proofs FORCE ROW LEVEL SECURITY;

-- Enable RLS pada broadcasts
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts FORCE ROW LEVEL SECURITY;

-- Enable RLS pada custom_fields
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_fields FORCE ROW LEVEL SECURITY;

-- Enable RLS pada application_documents
ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_documents FORCE ROW LEVEL SECURITY;

-- Enable RLS pada sessions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions FORCE ROW LEVEL SECURITY;

-- Enable RLS pada school_profiles
ALTER TABLE school_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_profiles FORCE ROW LEVEL SECURITY;

-- Enable RLS pada tickets
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets FORCE ROW LEVEL SECURITY;

-- Enable RLS pada ticket_messages
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages FORCE ROW LEVEL SECURITY;

-- Enable RLS pada payouts
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts FORCE ROW LEVEL SECURITY;

-- Enable RLS pada saas_subscriptions
ALTER TABLE saas_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saas_subscriptions FORCE ROW LEVEL SECURITY;

-- Enable RLS pada saas_invoices
ALTER TABLE saas_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE saas_invoices FORCE ROW LEVEL SECURITY;

-- Enable RLS pada home_visit_reports
ALTER TABLE home_visit_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_visit_reports FORCE ROW LEVEL SECURITY;

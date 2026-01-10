CREATE TABLE otp_codes (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	session_id text NOT NULL,
	phone_number text NOT NULL,
	code text NOT NULL,
	expires_at timestamp NOT NULL,
	created_at timestamp DEFAULT now() NOT NULL,
	CONSTRAINT otp_codes_session_id_unique UNIQUE("session_id")
);

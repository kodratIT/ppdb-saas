import admin from 'firebase-admin';
import pkg from 'pg';
const { Client } = pkg;

const firebaseConfig = {
	projectId: 'ppdb-854b8',
	privateKey:
		'-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCvlSEagiYi5Crm\nhbbFxbutFbg60aWf4/ZmFEOEZvSVN7u37Eqi0XM2iLrIWceAXHEpRYrVTx+EeJaC\ne20Do86KEzM+0IzH/5XB2x7HBI0EMuGAGeTlnWmQYTeaZpntPwG5ajgYLxLb0fZk\nI9usd5sdKb/1qwJ+UzzfOaroDzqBmcP9Ks4bMCYiKFuF7o8c5WklSV79xjBXxHqo\ncR/0HctaEcpDC6f+buVNWWv1TxR9av0PRZ1WXn3bbRSmo4vu43idDe2dcYlj0ij7\nHz49t+jLiZP2S1592DwpcqGG5hDGGqbfbtNhZ0NrJX2aXNr1KUWDqAU88SkdSODu\nZVOuvlPjAgMBAAECggEABEkH+00k4CIgd+rYiKAoUfOfQPQ/7hSSvXAOK8uVeZTY\nJIeEVM/212Rj5qLmTxgyfNbhKg6ZztJgngOkJ/wV/OG2FPjjDriKr6YI7MOMK4eQ\nYF+Baic63da5lC+f3x30DVHt141CkRHhSRVk9aMfqokL0dOgJnQinrIaHTrN6z7K\nmceCxAZWusAztjgDCFle4HfgrK13OJR7k4gC2aOHr1tQjMfMqG3qKPXsgt1YvKrB\n6JNRWrJ7qJD/VhIIZE4aZ+Y+rOVtI+x8/ydtk6YZzVprWMLRtpWLhiMXTRwPfHnp\nB8zO7HFNBkt5NA6ZIdL476zz15UQdPBVq+pQD1rc/QKBgQDnZ6B1ysXLAXFdNulZ\n/vARvOQRQYE8i0TTLgC/6FzML0eWzZiArri4hW43ukY+oX7BD2dpAAD7oBThwvZ5\n8nB90Hjwkc6sMVHIKnDgcXtO9DyqYJl94Mdz78IX90xM3LC4BB7SatSiJwTVIj8a\nYCCLYKSFzfEPteldcOaTYSF8vQKBgQDCPp2LNE9YyvBgl5E2BQGMkffOfKCEZY3L\nKszSsqAN/WptD8MbwEuRO3Yhx1dS2x+ZLOLG8NbuBICgg0RS1RPgT3qReCJCDYJk\nO8RBnd+zIuN8zUkg+Be6HJ9DBtwrssX18fxDBg/LWA3aPWjdkEu/ExtDK1BwJoGW\nLRKPs38tHwKBgQDIt7wZMC9srO22GwFBzL5TxHJW/WiqKWsjek2wKE8F1STVi7Py\OpuDgkleETcI8G/P6hqamyQ/HlW+lavRjxdAKmoc0XxhI856P0X1iLmafIN6jZvV\n8flPePH0c889BFhM5VYO0hdqJ0orzS7LJAJWoxdR8JZeOD4ZjOqTf7baSQKBgEgX\nOxtF78jxkKMYvZEB7KBCMGlXQa/BjQ2BNgFgwBxRGCWf+vaauLEPE3nX5OXgY2rT\nCNty2SH/U8m+ziW75SOT+9Zvcq93GhSfRehgcnymjy1rdx+gVBYDt2wF6MLjF6t/\nAvPRFR2P8Zw0vG22txYUPkMAmVr2P5P/6Gqi4KlbAoGAe4r6xvCUAK8USFKQAWmJ\nMFCSrHCTHDAtVkFvdCioT3PnBo1UVfOBBybkvE0us0yCaQgKkeDHgB/Ln5K6CmDM\nYwyrbceDRemGPzl02wDe2Ftb+KlTi3zq0xamSlHXut1tEczybSnxExWY4aRrTeTy\AyvKZa+aXIOc/jixxRZP5rs=\n-----END PRIVATE KEY-----\n'.replace(
			/\\n/g,
			'\n'
		),
	clientEmail: 'firebase-adminsdk-fbsvc@ppdb-854b8.iam.gserviceaccount.com'
};

const databaseUrl =
	'postgresql://neondb_owner:npg_L3yUQIzC9eBt@ep-delicate-thunder-ahgi9kji-pooler.c-3.us-east-1.aws.neon.tech/ppdb?sslmode=require&channel_binding=require';

admin.initializeApp({
	credential: admin.credential.cert(firebaseConfig)
});

async function syncSuperAdmin() {
	const fakeEmail = 'superadmin@ppdb-saas.com';
	const dbEmail = '6281111111111@whatsapp';
	const password = '12345678';
	let uid;

	console.log(`Checking Firebase user for ${fakeEmail}...`);
	try {
		const userRecord = await admin.auth().getUserByEmail(fakeEmail);
		uid = userRecord.uid;
		console.log(`Firebase user exists with UID: ${uid}`);
		await admin.auth().updateUser(uid, { password });
		console.log('Firebase password updated.');
	} catch (error) {
		if (error.code === 'auth/user-not-found') {
			console.log('Firebase user not found. Creating new user...');
			const newUser = await admin.auth().createUser({
				email: fakeEmail,
				password,
				displayName: 'Super Admin'
			});
			uid = newUser.uid;
			console.log(`Firebase user created with UID: ${uid}`);
		} else {
			throw error;
		}
	}

	console.log('Syncing with Postgres...');
	const client = new Client({ connectionString: databaseUrl });
	await client.connect();

	const tenantRes = await client.query("SELECT id FROM tenants WHERE slug = 'admin'");
	const tenantId = tenantRes.rows[0].id;

	// Use the real email from Firebase for the Super Admin in our DB
	await client.query(
		`INSERT INTO users (email, name, role, tenant_id, status, firebase_uid) 
		 VALUES ($1, $2, $3, $4, $5, $6)
		 ON CONFLICT (email, tenant_id) 
		 DO UPDATE SET firebase_uid = $6, role = $3, status = $5`,
		[fakeEmail, 'Super Admin', 'super_admin', tenantId, 'active', uid]
	);

	console.log(`Postgres sync complete. User ${fakeEmail} is now Super Admin.`);
	await client.end();
}

syncSuperAdmin()
	.then(() => console.log('DONE'))
	.catch(console.error);

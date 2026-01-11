# Authentication System Documentation

Welcome to the PPDB SAAS Authentication System documentation. This guide covers the Firebase + WAHA hybrid authentication system implemented in Epic 2.5.

## 📚 Table of Contents

1. [Architecture Overview](./architecture.md) - System design and data flow
2. [Firebase Integration](./firebase-integration.md) - Internal user authentication
3. [WAHA OTP Integration](./waha-otp-integration.md) - External user authentication via WhatsApp
4. [RBAC Permissions](./rbac-permissions.md) - Role-based access control
5. [Session Management](./session-management.md) - Session handling and security
6. [Audit Logging](./audit-logging.md) - Security audit trail
7. [Testing Guide](./testing-guide.md) - Testing setup and execution
8. [Epic 3 Integration](./epic-3-integration.md) - Registration integration guide
9. [Troubleshooting](./troubleshooting.md) - Common issues and solutions

## 🚀 Quick Start

### For Internal Users (Firebase Auth)

```typescript
// Sign in with Firebase
import { signInWithEmailAndPassword } from 'firebase/auth';

const { user } = await signInWithEmailAndPassword(auth, email, password);
const idToken = await user.getIdToken();

// Server-side verification
import { verifyFirebaseToken } from '$lib/server/auth/firebase';
const session = await verifyFirebaseToken(idToken, tenantId);
```

### For External Users (WAHA OTP)

```typescript
// Request OTP
import { sendOTP } from '$lib/server/whatsapp/providers/waha';
await sendOTP(phoneNumber, tenantId);

// Verify OTP
import { verifyOTP } from '$lib/server/auth/session';
const session = await verifyOTP(phoneNumber, otp, tenantId);
```

### Authorization Helpers

```typescript
import { requireAuth, requireRole, requirePermission } from '$lib/server/auth/authorization';

// Require authentication
const session = await requireAuth(locals);

// Require specific role
await requireRole(locals, 'school_admin');

// Require specific permission
await requirePermission(locals, 'manage_admissions');
```

## 🔐 User Roles

| Role           | Users    | Auth Method | Access Level                    |
| -------------- | -------- | ----------- | ------------------------------- |
| `super_admin`  | ~50      | Firebase    | Global platform access          |
| `school_admin` | ~100     | Firebase    | Full tenant access              |
| `verifier`     | ~50      | Firebase    | Verification & scoring          |
| `treasurer`    | ~31      | Firebase    | Financial operations            |
| `parent`       | ~10,000+ | WAHA OTP    | Self-service (own applications) |

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PPDB SAAS Platform                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐              ┌────────────────┐          │
│  │   Internal   │──Firebase──▶ │   Firebase     │          │
│  │   Users      │   Auth       │   Admin SDK    │          │
│  │  (~231)      │              │                │          │
│  └──────────────┘              └────────┬───────┘          │
│                                          │                  │
│                                          ▼                  │
│                                 ┌────────────────┐          │
│                                 │    Session     │          │
│                                 │   Management   │          │
│                                 │   (Database)   │          │
│                                 └────────┬───────┘          │
│  ┌──────────────┐                       │                  │
│  │   External   │              ┌────────▼───────┐          │
│  │   Users      │──WhatsApp──▶ │ WAHA Provider  │          │
│  │  (~10,000+)  │   OTP        │  (Existing)    │          │
│  └──────────────┘              └────────────────┘          │
│                                                             │
│                         ┌────────────────┐                 │
│                         │  Authorization │                 │
│                         │  & RBAC        │                 │
│                         │  (5 Roles)     │                 │
│                         └────────────────┘                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📝 Environment Variables

```env
# Firebase Configuration (Internal Users)
FIREBASE_PROJECT_ID=ppdb-saas
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@ppdb-saas.iam.gserviceaccount.com

# WAHA Configuration (External Users - Existing System)
WAHA_BASE_URL=http://existing-waha-server.com
WAHA_SESSION=default

# Database
DATABASE_URL=postgresql://user:pass@host:5432/ppdb

# Testing
NODE_ENV=test
```

## 🧪 Testing

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

## 📦 Implementation Status

✅ **Story 2.5.1:** Firebase + WAHA Hybrid Authentication Integration  
✅ **Story 2.5.2:** Replace Session Placeholder with Hybrid Auth Session  
✅ **Story 2.5.3:** Update All Permission Checking Helpers  
✅ **Story 2.5.4:** Test Auth Flow End-to-End (257 tests passing)  
✅ **Story 2.5.5:** Document Auth Integration for Epic 3

## 🔗 Related Documentation

- [Epic 2 Retrospective](/_bmad-output/retrospectives/epic-2-retrospective-2026-01-09.md)
- [Architecture](/_bmad-output/planning-artifacts/architecture.md)
- [PRD - Authentication Requirements](/_bmad-output/planning-artifacts/prd.md)

## 🆘 Need Help?

- See [Troubleshooting Guide](./troubleshooting.md) for common issues
- Check [Testing Guide](./testing-guide.md) for test setup
- Review [Epic 3 Integration](./epic-3-integration.md) for registration flows

---

**Epic 2.5 - Auth Foundation | Status: Complete ✅**

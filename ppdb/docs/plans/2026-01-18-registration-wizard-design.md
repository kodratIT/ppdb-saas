# Design: "Party Mode" Registration Wizard

## Overview

Transform the current basic school registration form into a professional, multi-step "Party Mode" wizard. This upgrade aims to capture critical school identity data (NPSN, Location, Level) while providing a delightful SaaS onboarding experience with micro-interactions and atomic data integrity.

## Architecture

### Frontend: 4-Step Wizard

We will replace the single-page form with a client-side state machine managing 4 distinct steps:

1.  **Identity 🏫**
    - **NPSN:** Official ID (Numeric validation).
    - **School Name:** Main identifier.
    - **Slug:** Auto-generated from name, editable, with real-time availability check.
    - **Jenjang (Level):** SD, SMP, SMA, SMK.
    - **Status:** Negeri vs. Swasta.

2.  **Location 📍**
    - **Data Source:** Client-side fetch from `emsifa/api-wilayah-indonesia` (GitHub Pages CDN).
    - **Chained Dropdowns:** Province → City/Regency → District (Kecamatan) → Village (Kelurahan).
    - **Address:** Specific street details.
    - **Postal Code:** Auto-filled if available, editable.

3.  **Super Admin 👤**
    - **Full Name:** Distinct from School Name (e.g., "Budi Santoso").
    - **Email:** Login credential.
    - **WhatsApp:** Official contact.
    - **Password:** Secure input.

4.  **Review & Success 🎉**
    - **Summary:** Read-only view of all entered data.
    - **Action:** Final "Create School" button.
    - **Success:** Full-screen "Party Mode" (Confetti) and redirect to dashboard.

### Backend: Atomic Transaction

The `?/create` action will be refactored to ensure data consistency.

**Current Flow (Flawed):**

1. Create Tenant -> 2. Create User.
   _Risk:_ If User creation fails, we have a "Ghost Tenant".

**New Flow (Atomic):**

```typescript
db.transaction(async (tx) => {
  // 1. Create Tenant
  const tenant = await tx.insert(tenants)...

  // 2. Create School Profile (New Table/Record)
  await tx.insert(schoolProfiles).values({
    tenantId: tenant.id,
    npsn,
    schoolLevel,
    address,
    province, ...
  })

  // 3. Create Firebase User & Local User
  const fbUser = await createFirebaseUser(...)
  await tx.insert(users)...
})
```

## Tech Stack & Components

- **UI Library:** `shadcn/ui` (leveraging existing implementation).
  - New components to add: `Select` (Combobox pattern), `Stepper` (Custom), `Confetti` (canvas-confetti).
- **State Management:** Svelte 5 `$state` for wizard data.
- **Validation:** `Zod` schemas for each step.

## Implementation Plan

1.  **Setup:** Install necessary shadcn components (`select`, `command`, `popover`).
2.  **Database:** Verify `schoolProfiles` schema supports all new fields (Status, Location codes).
3.  **UI Construction:**
    - Build `StepIdentity.svelte`
    - Build `StepLocation.svelte` (Integrate API)
    - Build `StepAdmin.svelte`
    - Build `WizardLayout.svelte`
4.  **Integration:** Connect to `+page.server.ts` refactored action.
5.  **Polish:** Add "Party Mode" confetti and transitions.

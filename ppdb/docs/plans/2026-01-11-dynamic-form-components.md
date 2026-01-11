# Dynamic Form Components Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Membangun sistem komponen dinamis yang dapat merender custom fields berdasarkan konfigurasi database, menggunakan Svelte 5 runes dan Registry Pattern.

**Architecture:** Menggunakan `registry.ts` untuk memetakan `fieldType` ke komponen Svelte atomik. Wrapper `DynamicField.svelte` menangani abstraksi pemilihan komponen, sinkronisasi state dua arah (bindable values), dan tampilan error.

**Tech Stack:** Svelte 5 (Runes), Shadcn Svelte (bits-ui), Tailwind CSS, Zod.

### Task 1: Setup Registry & Base Components

**Files:**

- Create: `src/lib/components/forms/dynamic/registry.ts`
- Create: `src/lib/components/forms/dynamic/index.ts`
- Create: `src/lib/components/forms/dynamic/fields/TextField.svelte`

**Step 1: Create TextField component**
Menggunakan `$props()` Svelte 5 untuk `field`, `value` (bindable), dan `error`.

**Step 2: Create Registry**
Daftarkan `TextField` ke dalam registry object.

**Step 3: Commit**

```bash
git add src/lib/components/forms/dynamic/
git commit -m "feat(dynamic-form): initial setup and TextField implementation"
```

### Task 2: Implement DynamicField Wrapper

**Files:**

- Create: `src/lib/components/forms/dynamic/DynamicField.svelte`

**Step 1: Implement DynamicField logic**
Gunakan registry untuk mencari komponen berdasarkan `field.fieldType`. Render secara dinamis menggunakan `<svelte:component this={...} />` (atau direct component reference di Svelte 5).

**Step 2: Test with mock data**
Pastikan wrapper dapat merender TextField dan memperbarui nilai input.

**Step 3: Commit**

```bash
git add src/lib/components/forms/dynamic/DynamicField.svelte
git commit -m "feat(dynamic-form): add DynamicField wrapper component"
```

### Task 3: Implement Remaining Field Types

**Files:**

- Create: `src/lib/components/forms/dynamic/fields/NumberField.svelte`
- Create: `src/lib/components/forms/dynamic/fields/SelectField.svelte`
- Create: `src/lib/components/forms/dynamic/fields/CheckboxField.svelte`
- Create: `src/lib/components/forms/dynamic/fields/FileField.svelte`
- Create: `src/lib/components/forms/dynamic/fields/TextAreaField.svelte`
- Modify: `src/lib/components/forms/dynamic/registry.ts`

**Step 1: Implement each field**
Pastikan konsistensi props dan penggunaan komponen Shadcn UI yang tersedia (`Select`, `Checkbox`, `Textarea`).

**Step 2: Register all fields**
Update `registry.ts` dengan tipe-tipe baru.

**Step 3: Commit**

```bash
git add src/lib/components/forms/dynamic/fields/ src/lib/components/forms/dynamic/registry.ts
git commit -m "feat(dynamic-form): implement all common field types"
```

### Task 4: Integration Test & Validation Display

**Files:**

- Create: `tests/unit/components/DynamicField.test.ts`

**Step 1: Write integration tests**
Verifikasi bahwa perubahan pada input memicu update pada state induk, dan pesan error ditampilkan dengan benar.

**Step 2: Run tests**
`npm run test:unit tests/unit/components/DynamicField.test.ts`

**Step 3: Commit**

```bash
git add tests/unit/components/DynamicField.test.ts
git commit -m "test(dynamic-form): add unit tests for dynamic field system"
```

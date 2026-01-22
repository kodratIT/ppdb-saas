// =============================================================================
// Admin Types
// Shared type definitions for admin components
// =============================================================================

// =============================================================================
// Unit Types
// =============================================================================

export type SchoolLevel = 'TK' | 'SD' | 'SMP' | 'SMA' | 'SMK' | 'Universitas' | 'Lainnya';
export type AccreditationType = 'A' | 'B' | 'C' | 'Belum Terakreditasi';

export interface Tenant {
    id: string;
    name: string;
    slug: string;
}

export interface Unit {
    id: string;
    name: string;
    level: SchoolLevel;
    npsn?: string | null;
    accreditation?: AccreditationType | string | null;
    contactPhone?: string | null;
    address?: string | null;
    tenantId: string;
    tenant?: Tenant;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export interface UnitFormData {
    id?: string;
    name: string;
    level: SchoolLevel;
    npsn?: string;
    accreditation?: AccreditationType | string;
    contactPhone?: string;
    address?: string;
    tenantId: string;
}

export interface UnitFilters {
    search: string;
    level: string;
    tenantId: string;
}

// =============================================================================
// User Types
// =============================================================================

export type UserRole = 'super_admin' | 'school_admin' | 'operator';

export interface AdminUser {
    id: string;
    email: string;
    name?: string;
    role: UserRole;
    tenantId?: string;
}

// =============================================================================
// Stats Types
// =============================================================================

export interface UnitStats {
    total: number;
    byLevel: Record<string, number>;
    byAccreditation: Record<string, number>;
    recentlyAdded: number;
}

// =============================================================================
// Table Types
// =============================================================================

export type TableDensity = 'compact' | 'normal' | 'comfortable';

export interface ColumnConfig {
    id: string;
    label: string;
    visible: boolean;
    sortable?: boolean;
}

// =============================================================================
// Grouped Units for Display
// =============================================================================

export interface GroupedUnits {
    id: string;
    name: string;
    units: Unit[];
}

// =============================================================================
// Broadcast Types
// =============================================================================

export interface MessageTemplate {
    id: string;
    name: string;
    category?: string | null;
    message: string;
    variables: string[];
}

export interface BroadcastRecord {
    id: string;
    createdAt: Date | string;
    targetType: string;
    targetCount: number;
    sentCount: number;
    failedCount: number;
    status: 'sent' | 'scheduled' | 'failed' | 'pending' | 'cancelled';
    messagePreview: string;
    scheduledAt?: Date | string | null;
    sentAt?: Date | string | null;
    senderName?: string;
}

export interface BroadcastAnalytics {
    totalBroadcasts: number;
    totalMessagesSent: number;
    totalMessagesFailed: number;
    successRate: number;
    averageDeliveryTime: number;
    topMessages: { message: string; sentCount: number }[];
    dailyStats: { date: string; sent: number; failed: number }[];
    topTargets: { tenant: string; receivedCount: number }[];
}

export interface BroadcastFormData {
    targetType: 'all' | 'active' | 'inactive' | 'custom';
    targetTenantIds?: string[];
    message: string;
    scheduledAt?: string | null;
    variables?: Record<string, string>;
}

export interface BroadcastPreset {
    id: string;
    name: string;
    targetType: string;
    message: string;
}

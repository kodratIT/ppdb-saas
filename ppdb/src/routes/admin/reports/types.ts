export interface DashboardStats {
	tenants: {
		total: number;
		active: number;
		list: Array<{
			id: string;
			name: string;
			status: string;
			createdAt: Date;
		}>;
	};
	unitStats: Array<{
		unitId: string;
		unitName: string;
		tenantName: string;
		level: string;
		appCount: number;
		revenue: number;
	}>;
	users: {
		totalParents: number;
		newRegistrationsToday: number;
	};
	applications: {
		pendingVerifications: number;
	};
	financial: {
		totalTransactions: number;
		totalRevenue: number;
		averageRevenuePerSchool: number;
		conversionRate: number;
		dailyRevenue: Array<{
			date: string;
			amount: number;
		}>;
		topSchools: Array<{
			name: string;
			appCount: number;
			revenue: number;
		}>;
		recentPayments: Array<{
			tenantName: string;
			amount: number;
			paidAt: Date;
		}>;
	};
}

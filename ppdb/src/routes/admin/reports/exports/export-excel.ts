import * as XLSX from 'xlsx';
import type { DashboardStats } from '../types';

export function generateExcel(stats: DashboardStats): Uint8Array {
	const workbook = XLSX.utils.book_new();

	// Summary Sheet
	const summaryData = [
		['Report Generated', new Date().toLocaleString('id-ID')],
		[''],
		['FINANCIAL SUMMARY'],
		['Metric', 'Value'],
		['Total Revenue', stats.financial.totalRevenue],
		['Total Transactions', stats.financial.totalTransactions],
		['Average Revenue per School', stats.financial.averageRevenuePerSchool.toFixed(2)],
		['Conversion Rate', `${stats.financial.conversionRate.toFixed(2)}%`],
		[''],
		['TENANT STATISTICS'],
		['Metric', 'Value'],
		['Total Schools', stats.tenants.total],
		['Active Schools', stats.tenants.active],
		['Inactive Schools', stats.tenants.total - stats.tenants.active],
		[''],
		['USER STATISTICS'],
		['Metric', 'Value'],
		['Total Parents', stats.users.totalParents],
		['New Registrations Today', stats.users.newRegistrationsToday]
	];

	const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
	XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

	// Daily Revenue Sheet
	const revenueData = [
		['Date', 'Revenue'],
		...stats.financial.dailyRevenue.map((d: any) => [d.date, d.amount])
	];
	const revenueSheet = XLSX.utils.aoa_to_sheet(revenueData);

	// Add formatting to revenue sheet
	revenueSheet['!cols'] = [{ wch: 15 }, { wch: 15 }];
	XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Daily Revenue');

	// Top Schools Sheet
	const schoolsData = [
		['School', 'Applications', 'Revenue'],
		...stats.financial.topSchools.map((s: any) => [s.name, s.appCount, s.revenue])
	];
	const schoolsSheet = XLSX.utils.aoa_to_sheet(schoolsData);
	schoolsSheet['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }];
	XLSX.utils.book_append_sheet(workbook, schoolsSheet, 'Top Schools');

	// Unit Stats Sheet
	const unitData = [
		['Unit Name', 'School', 'Level', 'Applications', 'Revenue'],
		...stats.unitStats.map((u: any) => [u.unitName, u.tenantName, u.level, u.appCount, u.revenue])
	];
	const unitSheet = XLSX.utils.aoa_to_sheet(unitData);
	unitSheet['!cols'] = [{ wch: 30 }, { wch: 25 }, { wch: 10 }, { wch: 12 }, { wch: 15 }];
	XLSX.utils.book_append_sheet(workbook, unitSheet, 'Unit Details');

	return XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
}

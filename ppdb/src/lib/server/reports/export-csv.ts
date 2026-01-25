export function generateCSV(stats: any): string {
	const rows: string[] = [];

	// Header
	rows.push('Report Generated,' + new Date().toLocaleString('id-ID'));
	rows.push('');

	// Financial Summary
	rows.push('FINANCIAL SUMMARY');
	rows.push('Metric,Value');
	rows.push(`Total Revenue,${stats.financial.totalRevenue}`);
	rows.push(`Total Transactions,${stats.financial.totalTransactions}`);
	rows.push(`Average Revenue per School,${stats.financial.averageRevenuePerSchool.toFixed(2)}`);
	rows.push(`Conversion Rate,${stats.financial.conversionRate.toFixed(2)}%`);
	rows.push('');

	// Tenant Stats
	rows.push('TENANT STATISTICS');
	rows.push('Metric,Value');
	rows.push(`Total Schools,${stats.tenants.total}`);
	rows.push(`Active Schools,${stats.tenants.active}`);
	rows.push(`Inactive Schools,${stats.tenants.total - stats.tenants.active}`);
	rows.push('');

	// User Stats
	rows.push('USER STATISTICS');
	rows.push('Metric,Value');
	rows.push(`Total Parents,${stats.users.totalParents}`);
	rows.push(`New Registrations Today,${stats.users.newRegistrationsToday}`);
	rows.push('');

	// Daily Revenue
	rows.push('DAILY REVENUE');
	rows.push('Date,Revenue');
	for (const day of stats.financial.dailyRevenue) {
		rows.push(`${day.date},${day.amount}`);
	}
	rows.push('');

	// Top Schools
	rows.push('TOP PERFORMING SCHOOLS');
	rows.push('School,Applications,Revenue');
	for (const school of stats.financial.topSchools) {
		rows.push(`${school.name},${school.appCount},${school.revenue}`);
	}

	return rows.join('\n');
}

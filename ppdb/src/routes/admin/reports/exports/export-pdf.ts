import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { DashboardStats } from '../types';

export function generatePDF(stats: DashboardStats): Uint8Array {
	const doc = new jsPDF();

	let yPosition = 20;

	// Title
	doc.setFontSize(20);
	doc.text('PPDB Platform Report', 14, yPosition);
	yPosition += 10;

	// Subtitle
	doc.setFontSize(10);
	doc.setTextColor(100);
	doc.text(`Generated: ${new Date().toLocaleString('id-ID')}`, 14, yPosition);
	yPosition += 15;

	// Financial Summary
	doc.setTextColor(0);
	doc.setFontSize(14);
	doc.text('Financial Summary', 14, yPosition);
	yPosition += 8;

	doc.setFontSize(10);
	doc.text(`Total Revenue: Rp ${stats.financial.totalRevenue.toLocaleString('id-ID')}`, 14, yPosition);
	yPosition += 6;
	doc.text(`Total Transactions: ${stats.financial.totalTransactions}`, 14, yPosition);
	yPosition += 6;
	doc.text(
		`Average Revenue per School: Rp ${stats.financial.averageRevenuePerSchool.toFixed(2)}`,
		14,
		yPosition
	);
	yPosition += 6;
	doc.text(`Conversion Rate: ${stats.financial.conversionRate.toFixed(2)}%`, 14, yPosition);
	yPosition += 12;

	// Tenant Statistics
	doc.setFontSize(14);
	doc.text('Tenant Statistics', 14, yPosition);
	yPosition += 8;

	doc.setFontSize(10);
	doc.text(`Total Schools: ${stats.tenants.total}`, 14, yPosition);
	yPosition += 6;
	doc.text(`Active Schools: ${stats.tenants.active}`, 14, yPosition);
	yPosition += 6;
	doc.text(`Inactive Schools: ${stats.tenants.total - stats.tenants.active}`, 14, yPosition);
	yPosition += 12;

	// Daily Revenue Table
	if (stats.financial.dailyRevenue.length > 0) {
		doc.setFontSize(14);
		doc.text('Daily Revenue', 14, yPosition);
		yPosition += 8;

		autoTable(doc, {
			startY: yPosition,
			head: [['Date', 'Revenue']],
			body: stats.financial.dailyRevenue.map((d: any) => [
				d.date,
				`Rp ${d.amount.toLocaleString('id-ID')}`
			]),
			theme: 'grid',
			styles: { fontSize: 8 }
		});

		yPosition = (doc as any).lastAutoTable.finalY + 15;
	}

	// Top Schools Table
	if (stats.financial.topSchools.length > 0) {
		if (yPosition > 240) {
			doc.addPage();
			yPosition = 20;
		}

		doc.setFontSize(14);
		doc.text('Top Performing Schools', 14, yPosition);
		yPosition += 8;

		autoTable(doc, {
			startY: yPosition,
			head: [['School', 'Applications', 'Revenue']],
			body: stats.financial.topSchools.map((s: any) => [
				s.name,
				s.appCount.toString(),
				`Rp ${s.revenue.toLocaleString('id-ID')}`
			]),
			theme: 'grid',
			styles: { fontSize: 8 }
		});
	}

	return new Uint8Array(doc.output('arraybuffer'));
}

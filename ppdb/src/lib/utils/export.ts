interface SchoolExportData {
	id: string;
	name: string;
	slug: string;
	status: 'active' | 'inactive';
	stats?: {
		applications: number;
		paidInvoices: number;
	};
	createdAt: Date;
}

/**
 * Escape CSV field value
 */
function escapeCSVField(value: string | number | Date | null | undefined): string {
	if (value === null || value === undefined) {
		return '';
	}

	let stringValue = String(value);

	// If the value contains comma, quote, or newline, wrap it in quotes and escape quotes
	if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
		stringValue = `"${stringValue.replace(/"/g, '""')}"`;
	}

	return stringValue;
}

/**
 * Format date to YYYY-MM-DD HH:mm:ss
 */
function formatDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const seconds = String(date.getSeconds()).padStart(2, '0');

	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Generate CSV content from schools data
 */
export function generateSchoolsCSV(schools: SchoolExportData[]): string {
	// Define CSV columns
	const headers = [
		'Name',
		'Slug',
		'Status',
		'Applications',
		'Paid Invoices',
		'Created Date',
		'Subdomain'
	];

	// Create CSV rows
	const rows = schools.map((school) => {
		return [
			escapeCSVField(school.name),
			escapeCSVField(school.slug),
			escapeCSVField(school.status),
			escapeCSVField(school.stats?.applications || 0),
			escapeCSVField(school.stats?.paidInvoices || 0),
			escapeCSVField(formatDate(school.createdAt)),
			escapeCSVField(`${school.slug}.ppdb.id`)
		].join(',');
	});

	// Combine headers and rows
	return [headers.join(','), ...rows].join('\n');
}

/**
 * Trigger browser download of CSV file
 */
export function downloadCSV(content: string, filename: string): void {
	const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
	const link = document.createElement('a');
	const url = URL.createObjectURL(blob);

	link.setAttribute('href', url);
	link.setAttribute('download', filename);
	link.style.visibility = 'hidden';

	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	URL.revokeObjectURL(url);
}

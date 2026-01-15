import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoiceData {
    invoiceNumber: string;
    date: string;
    studentName: string;
    parentName: string;
    amount: number;
    schoolName: string;
    status: string;
    paymentMethod: string;
}

export function generateInvoicePDF(data: InvoiceData) {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text(data.schoolName, 14, 22);
    
    doc.setFontSize(10);
    doc.text('INVOICE / BUKTI PEMBAYARAN', 14, 30);
    
    // Invoice Details
    doc.setFontSize(10);
    const rightX = 140;
    
    doc.text(`No. Invoice:`, 14, 45);
    doc.text(data.invoiceNumber, 50, 45);
    
    doc.text(`Tanggal:`, rightX, 45);
    doc.text(data.date, rightX + 30, 45);
    
    doc.text(`Status:`, rightX, 52);
    doc.setTextColor(data.status === 'PAID' ? 0 : 200, data.status === 'PAID' ? 128 : 0, 0);
    doc.text(data.status, rightX + 30, 52);
    doc.setTextColor(0, 0, 0);

    // Bill To
    doc.text('Ditagihkan Kepada:', 14, 60);
    doc.setFont('helvetica', 'bold');
    doc.text(data.parentName, 14, 66);
    doc.setFont('helvetica', 'normal');
    doc.text(`Wali dari: ${data.studentName}`, 14, 72);
    
    // Table
    autoTable(doc, {
        startY: 85,
        head: [['Deskripsi', 'Jumlah']],
        body: [
            ['Biaya Pendaftaran PPDB', formatCurrency(data.amount)],
        ],
        foot: [
            ['Total', formatCurrency(data.amount)]
        ],
        theme: 'grid',
        headStyles: { fillColor: [0, 44, 95] }, // Primary #002C5F
    });
    
    // Footer
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.text('Terima kasih atas pembayaran Anda.', 14, finalY);
    doc.text('Dokumen ini adalah bukti pembayaran yang sah.', 14, finalY + 6);
    
    doc.save(`Invoice-${data.invoiceNumber}.pdf`);
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

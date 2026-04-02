import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Trade, TradeStats } from '@/types/trade';

export function exportJournalPdf(trades: Trade[], stats: TradeStats) {
  const doc = new jsPDF({ orientation: 'landscape' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const gold = [212, 175, 55] as const;
  const dark = [24, 24, 27] as const;

  // ── Header ──
  doc.setFillColor(...dark);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setTextColor(...gold);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Orakel Trading Journal', 14, 18);
  doc.setFontSize(9);
  doc.setTextColor(180, 180, 180);
  doc.text(`Exporté le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - 14, 18, { align: 'right' });

  // ── Stats summary ──
  const statsY = 36;
  doc.setFontSize(13);
  doc.setTextColor(...gold);
  doc.setFont('helvetica', 'bold');
  doc.text('Résumé des performances', 14, statsY);

  const statItems = [
    ['Total Trades', String(stats.totalTrades)],
    ['Trades Gagnants', String(stats.tradesGagnants)],
    ['Trades Perdants', String(stats.tradesPerdants)],
    ['Winrate', `${stats.winrate.toFixed(1)}%`],
    ['Profit Total', `+${stats.profitTotalR.toFixed(1)}R`],
    ['Perte Totale', `-${stats.perteTotaleR.toFixed(1)}R`],
    ['Profit Net', `${stats.profitNetR >= 0 ? '+' : ''}${stats.profitNetR.toFixed(1)}R`],
    ['Moyenne R/Trade', `${stats.moyenneR.toFixed(2)}R`],
    ['Discipline', `${stats.tauxDiscipline.toFixed(0)}%`],
    ['Setup + rentable', stats.setupPlusRentable],
    ['Setup - rentable', stats.setupMoinsRentable],
    ['Actif + rentable', stats.actifPlusRentable],
  ];

  autoTable(doc, {
    startY: statsY + 4,
    head: [['Métrique', 'Valeur']],
    body: statItems,
    theme: 'grid',
    headStyles: { fillColor: [...gold] as [number, number, number], textColor: [...dark] as [number, number, number], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: [220, 220, 220] },
    alternateRowStyles: { fillColor: [35, 35, 40] },
    styles: { fillColor: [28, 28, 32], lineColor: [60, 60, 65], lineWidth: 0.3, cellPadding: 3 },
    tableWidth: 120,
    margin: { left: 14 },
  });

  // ── Trades table ──
  const tradesY = (doc as any).lastAutoTable.finalY + 12;
  doc.setFontSize(13);
  doc.setTextColor(...gold);
  doc.setFont('helvetica', 'bold');
  doc.text('Journal des trades', 14, tradesY);

  const sortedTrades = [...trades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  autoTable(doc, {
    startY: tradesY + 4,
    head: [['Date', 'Actif', 'Setup', 'Direction', 'Résultat', 'R Multiple', 'Risque %', 'Émotion', 'Discipline', 'Note avant', 'Note après']],
    body: sortedTrades.map(t => [
      new Date(t.date).toLocaleDateString('fr-FR'),
      t.actif,
      t.setup,
      t.direction,
      t.resultat,
      `${t.resultat === 'Gain' ? '+' : ''}${t.rMultiple.toFixed(1)}R`,
      `${t.risquePourcentage}%`,
      t.emotion,
      t.tradeRespecte ? 'Oui' : 'Non',
      (t.noteAvant || '-').substring(0, 40),
      (t.noteApres || '-').substring(0, 40),
    ]),
    theme: 'grid',
    headStyles: { fillColor: [...gold] as [number, number, number], textColor: [...dark] as [number, number, number], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: [210, 210, 210] },
    alternateRowStyles: { fillColor: [35, 35, 40] },
    styles: { fillColor: [28, 28, 32], lineColor: [60, 60, 65], lineWidth: 0.3, cellPadding: 2, overflow: 'linebreak' },
    columnStyles: {
      0: { cellWidth: 22 },
      9: { cellWidth: 38 },
      10: { cellWidth: 38 },
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer on every page
      const pageH = doc.internal.pageSize.getHeight();
      doc.setFontSize(7);
      doc.setTextColor(120, 120, 120);
      doc.text(`Orakel Trading Journal — Page ${doc.getCurrentPageInfo().pageNumber}`, pageWidth / 2, pageH - 6, { align: 'center' });
    },
  });

  doc.save(`orakel-journal-${new Date().toISOString().slice(0, 10)}.pdf`);
}

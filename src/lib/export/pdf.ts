// Basic PDF export using jsPDF + html2canvas
// Note: client-side only
export async function exportAnalysisPdf(rootSelector = '#analysis-root') {
  const jsPDF = (await import('jspdf')).default
  const html2canvas = (await import('html2canvas')).default
  const root = document.querySelector(rootSelector) as HTMLElement | null
  if (!root) throw new Error('Container não encontrado')
  const canvas = await html2canvas(root, { scale: 2 })
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height)
  const w = canvas.width * ratio
  const h = canvas.height * ratio
  const x = (pageWidth - w) / 2
  const y = 20
  pdf.addImage(imgData, 'PNG', x, y, w, h)
  pdf.save('analise.pdf')
}



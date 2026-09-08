export function printStudySheet(title: string, items: { heading: string; body: string; note?: string }[]) {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const html = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;600;700&display=swap');
        body {
          font-family: 'Amiri', 'Cairo', serif;
          margin: 40px;
          color: #1e293b;
          line-height: 1.8;
          background: #ffffff;
        }
        h1 {
          text-align: center;
          font-family: 'Cairo', sans-serif;
          color: #0f172a;
          border-bottom: 2px solid #0284c7;
          padding-bottom: 12px;
          margin-bottom: 24px;
        }
        .item-card {
          margin-bottom: 20px;
          padding: 16px;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          page-break-inside: avoid;
        }
        .item-title {
          font-family: 'Cairo', sans-serif;
          font-size: 16px;
          font-weight: bold;
          color: #0284c7;
          margin-bottom: 6px;
        }
        .item-body {
          font-size: 15px;
          color: #334155;
        }
        .item-note {
          margin-top: 8px;
          font-size: 13px;
          color: #64748b;
          font-style: italic;
          border-right: 3px solid #0284c7;
          padding-right: 8px;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
          border-top: 1px solid #e2e8f0;
          padding-top: 12px;
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div>
        ${items
          .map(
            (item) => `
          <div class="item-card">
            <div class="item-title">${item.heading}</div>
            <div class="item-body">${item.body}</div>
            ${item.note ? `<div class="item-note">${item.note}</div>` : ''}
          </div>
        `
          )
          .join('')}
      </div>
      <div class="footer">تم إنشاء هذه المذكرة الدراسية بواسطة إمتاع القارئ وموسوعة الخصال</div>
      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
}

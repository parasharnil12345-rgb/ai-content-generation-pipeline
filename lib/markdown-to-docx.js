const {
  Document, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, Packer,
  ExternalHyperlink, WidthType, ShadingType, UnderlineType
} = require('docx');

// ── Markdown → docx helpers ────────────────────────────────────────────────

// Splits a line into an array of TextRun and ExternalHyperlink nodes.
// Handles **bold**, [text](url), and **[text](url)** (bold hyperlinks) in a
// single pass, with links matched before standalone bold so a bolded link
// isn't swallowed as literal bold text. The URL group tolerates one level of
// parentheses inside the URL itself (e.g. Wikipedia-style disambiguator links).
function parseInlineRuns(text) {
  const children = [];
  // Matches URL characters, treating one level of balanced (...) as part of the
  // URL itself (e.g. https://en.wikipedia.org/wiki/Foo_(bar)) instead of stopping
  // at its inner ')'. Only the final, unbalanced ')' closes the markdown link.
  const urlBody = '(?:[^()]|\\([^()]*\\))*';
  const re = new RegExp(
    `\\*\\*\\[([^\\]]+)\\]\\((${urlBody})\\)\\*\\*` + // 1: bold link text, 2: bold link url
    `|\\[([^\\]]+)\\]\\((${urlBody})\\)` +            // 3: link text, 4: link url
    `|\\*\\*(.+?)\\*\\*`,                              // 5: bold text
    'g'
  );
  let lastIdx = 0, m;

  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIdx) {
      children.push(new TextRun({ text: text.slice(lastIdx, m.index) }));
    }
    if (m[1] !== undefined) {
      children.push(new ExternalHyperlink({
        link: m[2],
        children: [new TextRun({ text: m[1], bold: true, style: 'Hyperlink' })],
      }));
    } else if (m[3] !== undefined) {
      children.push(new ExternalHyperlink({
        link: m[4],
        children: [new TextRun({ text: m[3], style: 'Hyperlink' })],
      }));
    } else {
      children.push(new TextRun({ text: m[5], bold: true }));
    }
    lastIdx = re.lastIndex;
  }

  if (lastIdx < text.length) {
    children.push(new TextRun({ text: text.slice(lastIdx) }));
  }
  return children.length ? children : [new TextRun({ text })];
}

function isSepRow(line) {
  return line.split('|').every(c => /^[\s\-:|]*$/.test(c));
}

function markdownToDocx(md, keyword) {
  const lines = md.split('\n');
  const docChildren = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (/^### /.test(line)) {
      const content = line.slice(4);
      docChildren.push(new Paragraph({
        children: parseInlineRuns(content),
        heading: HeadingLevel.HEADING_3,
        ...(content.includes('✅') ? { shading: { type: ShadingType.SOLID, fill: 'D1FAE5' } } : {}),
      }));
      i++; continue;
    }

    if (/^## /.test(line)) {
      docChildren.push(new Paragraph({
        children: parseInlineRuns(line.slice(3)),
        heading: HeadingLevel.HEADING_2,
      }));
      i++; continue;
    }

    if (/^# /.test(line)) {
      docChildren.push(new Paragraph({
        children: parseInlineRuns(line.slice(2)),
        heading: HeadingLevel.HEADING_1,
      }));
      i++; continue;
    }

    if (/^\|/.test(line)) {
      const tableLines = [];
      while (i < lines.length && /^\|/.test(lines[i])) tableLines.push(lines[i++]);
      const dataRows = tableLines.filter(l => !isSepRow(l));
      if (dataRows.length) {
        docChildren.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: dataRows.map((row, ri) => {
            const cells = row.split('|').slice(1, -1).map(c => c.trim());
            return new TableRow({
              children: cells.map(cell => new TableCell({
                children: [new Paragraph({ children: parseInlineRuns(cell) })],
                shading: ri === 0 ? { type: ShadingType.SOLID, fill: 'E8F0FE' } : undefined,
              })),
            });
          }),
        }));
      }
      continue;
    }

    if (/^[-*] /.test(line)) {
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        docChildren.push(new Paragraph({
          children: parseInlineRuns(lines[i].slice(2)),
          bullet: { level: 0 },
        }));
        i++;
      }
      continue;
    }

    if (line.trim() === '') { i++; continue; }

    const para = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^[#|]/.test(lines[i]) &&
      !/^[-*] /.test(lines[i])
    ) {
      para.push(lines[i++]);
    }
    if (para.length) {
      docChildren.push(new Paragraph({ children: parseInlineRuns(para.join(' ')) }));
    }
  }

  return new Document({
    creator: 'AI Content Generator',
    title: keyword,
    styles: {
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', run: { size: 36, bold: true, color: '111827' } },
        { id: 'Heading2', name: 'Heading 2', run: { size: 28, bold: true, color: '1D4ED8' } },
        { id: 'Heading3', name: 'Heading 3', run: { size: 22, bold: true, color: '374151' } },
      ],
      characterStyles: [
        {
          id: 'Hyperlink',
          name: 'Hyperlink',
          run: {
            color: '0563C1',
            underline: { type: UnderlineType.SINGLE },
          },
        },
      ],
    },
    sections: [{ children: docChildren }],
  });
}

module.exports = { parseInlineRuns, markdownToDocx, Packer };

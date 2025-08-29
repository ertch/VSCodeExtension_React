import * as fs from 'fs';
import * as path from 'path';
import * as tmp from 'tmp';
import * as cheerio from 'cheerio';

// Beispielhafte Snippet-Definition:
const Snippets = {
  'Gate': {
    'attributes': { 'grp': '', 'hidden': '', 'id': '', 'klasse': '' },
    'childs': {}
  },
  'OtherComponent': {
    'attributes': { 'Attribut1': '', 'Attribut2': '' },
    'childs': {}
  }
  // ...weitere Komponenten
};

// Hauptfunktion:
export function parseAstroFile(filePath: string, snippets: any): string {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const $ = cheerio.load(fileContent, { xmlMode: true }); // xmlMode unterstützt Custom Tags

  // Hilfsfunktion für Rekursion:
  function parseNode(element: cheerio.Element): any {
    const tagName = element.tagName;
    if (!(tagName in snippets)) return null; // Unbekannte Komponenten ignorieren

    // Attribute lesen
    const snippetAttributes = snippets[tagName]['attributes'];
    const attribs: { [key: string]: string } = {};
    for (const attr in snippetAttributes) {
      attribs[attr] = element.attribs && element.attribs[attr] || '';
    }

    // Kinder einlesen
    const childs: any = {};
    $(element).children().each((_, childElem) => {
      const childTag = childElem.tagName;
      if (childTag in snippets) {
        const parsedChild = parseNode(childElem);
        if (parsedChild) {
          // Mehrfach-Vorkommen zulassen (optional verändern nach Bedarf)
          childs[childTag] = parsedChild;
        }
      }
    });

    return { 'attributes': attribs, 'childs': childs };
  }

  // Wurzelpunkte der Custom-Komponenten im Dokument suchen
  const result: any = {};
  let idx = 0;
  Object.keys(snippets).forEach(snippetTag => {
    $(snippetTag).each((_, elem) => {
      const parsed = parseNode(elem);
      if (parsed) {
        result[idx++] = { [snippetTag]: parsed };
      }
    });
  });

  // Im Tempfile speichern
  const tempFilePath = tmp.tmpNameSync({ postfix: '.json' });
  fs.writeFileSync(tempFilePath, JSON.stringify(result, null, 2));
  return tempFilePath; // Dateipfad für weitere Nutzung
}
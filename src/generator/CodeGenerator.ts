import * as fs from "fs";
import * as path from "path";
import { generateSimpleTextfield } from "../components/SimpleTextField";

// TODO: Generator ist nicht kompatibel mit neuem cardComponents-System
// Muss angepasst werden für BaseCard, SimpleInput, etc.
// Button "Code generieren" ist aktuell disabled (Canvas.tsx:349)
// Der Generator kennt nur alte SimpleTextField-Komponente, nicht die neuen Cards

const generatedIds = new Set<string>();

export function generateUniqueId(baseId: string): string {
    let uniqueId = baseId;
    let counter = 1;
    
    while (generatedIds.has(uniqueId)) {
        uniqueId = `${baseId}_${counter}`;
        counter++;
    }
    
    generatedIds.add(uniqueId);
    return uniqueId;
}


export function generateAndSaveAstroFile(components: any[]) {
    let astroCode = "---\n// Import-Anweisungen falls nötig\n---\n\n";

    components.forEach((component) => {
       
        component.id = generateUniqueId(component.id);
        astroCode += generateSimpleTextfield(component) + "\n\n";
    });

    const filePath = path.join(process.cwd(), "src/index.astro");

    fs.writeFile(filePath, astroCode, "utf8", (err) => {
        if (err) {
            console.error(" Fehler beim Speichern:", err);
        } else {
            console.log(`index.astro erfolgreich gespeichert!`);
        }
    });
}

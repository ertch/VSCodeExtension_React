"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUniqueId = generateUniqueId;
exports.generateAndSaveAstroFile = generateAndSaveAstroFile;
const fs = require("fs");
const path = require("path");
const SimpleTextField_1 = require("../components/SimpleTextField");
const generatedIds = new Set();
function generateUniqueId(baseId) {
    let uniqueId = baseId;
    let counter = 1;
    while (generatedIds.has(uniqueId)) {
        uniqueId = `${baseId}_${counter}`;
        counter++;
    }
    generatedIds.add(uniqueId);
    return uniqueId;
}
function generateAndSaveAstroFile(components) {
    let astroCode = "---\n// Import-Anweisungen falls nötig\n---\n\n";
    components.forEach((component) => {
        component.id = generateUniqueId(component.id);
        astroCode += (0, SimpleTextField_1.generateSimpleTextfield)(component) + "\n\n";
    });
    const filePath = path.join(process.cwd(), "src/index.astro");
    fs.writeFile(filePath, astroCode, "utf8", (err) => {
        if (err) {
            console.error(" Fehler beim Speichern:", err);
        }
        else {
            console.log(`index.astro erfolgreich gespeichert!`);
        }
    });
}

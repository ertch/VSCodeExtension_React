"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CodeGenerator_1 = require("./src/generator/CodeGenerator");
// Test-Daten
const testData = [
    {
        "type": "TabPage",
        "name": "Start",
        "tabIndex": 0,
        "children": [
            {
                "id": "n_mn4z6fhiismhopd9ty",
                "type": "Gate",
                "inputs": {
                    "name": "Gate",
                    "auto": false,
                    "queryLib": false,
                    "hidden": false,
                    "options": "",
                    "actions_trigger_0": "",
                    "actions_action_0": "",
                    "actions_target_id_0": "",
                    "actions_trigger_1": "",
                    "actions_action_1": "",
                    "actions_target_id_1": "",
                    "firstOption": "",
                    "class": "",
                    "required": false,
                    "disabled": false,
                    "data-required": "",
                    "onchange": "",
                    "data-trigger": "",
                    "data-preset": "",
                    "data-submit": "",
                    "data-grp": ""
                },
                "children": [
                    {
                        "id": "n_0wlsbz0j72chmhopdadg",
                        "type": "FinishButton",
                        "inputs": {
                            "name": "FinishButton",
                            "auto": false,
                            "queryLib": false,
                            "hidden": false
                        },
                        "children": []
                    },
                    {
                        "id": "n_36zjgp9u44mmhopijat",
                        "type": "SimpleSelect",
                        "inputs": {
                            "name": "",
                            "options": "",
                            "actions_trigger_0": "",
                            "actions_action_0": "",
                            "actions_target_id_0": "",
                            "actions_trigger_1": "",
                            "actions_action_1": "",
                            "actions_target_id_1": "",
                            "firstOption": "",
                            "class": "",
                            "required": false,
                            "disabled": false,
                            "hidden": false,
                            "data-required": "",
                            "onchange": "",
                            "data-trigger": "",
                            "data-preset": "",
                            "data-submit": ""
                        },
                        "children": []
                    }
                ]
            }
        ]
    },
    {
        "type": "TabPage",
        "name": "Abschluss",
        "tabIndex": 1,
        "children": []
    }
];
// Erwarteter Output
const expectedOutput = `<TabPage id="Start" name="Start" tab="0">
  <Gate id="Gate" name="Gate">
    <FinishButton id="FinishButton" name="FinishButton" />
    <SimpleSelect />
  </Gate>
</TabPage>
<TabPage id="Abschluss" name="Abschluss" tab="1" />`;
// Test durchführen
console.log('=== GENERIERTER OUTPUT ===');
const actualOutput = (0, CodeGenerator_1.generateHTML)(testData);
console.log(actualOutput);
console.log('\n=== ERWARTETER OUTPUT ===');
console.log(expectedOutput);
console.log('\n=== VERGLEICH ===');
if (actualOutput === expectedOutput) {
    console.log('✅ OUTPUT IST KORREKT!');
}
else {
    console.log('❌ OUTPUT IST NICHT KORREKT!');
    console.log('\nUnterschiede:');
    console.log('Länge erwartet:', expectedOutput.length);
    console.log('Länge generiert:', actualOutput.length);
}

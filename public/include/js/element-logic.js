// const { preview } = require("astro");
let CustomerData = {};
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
/**                                                                 ____          _                            ____        _           ___      ____     _ _     
*                                                                  / ___|   _ ___| |_ ___  _ __ ___   ___ _ __|  _ \  __ _| |_ __ _   ( _ )    / ___|___| | |___ 
*                                                                 | |  | | | / __| __/ _ \| '_ ` _ \ / _ \ '__| | | |/ _` | __/ _` |  / _ \/\ | |   / _ \ | / __|
*                                                                 | |__| |_| \__ \ || (_) | | | | | |  __/ |  | |_| | (_| | || (_| | | (_>  < | |__|  __/ | \__ \
*                                                                  \____\__,_|___/\__\___/|_| |_| |_|\___|_|  |____/ \__,_|\__\__,_|  \___/\/  \____\___|_|_|___/

*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
*   createCusomerCells
* 
*          Diese Funktion erstellt CustomerCells basierend auf den angegebenen Daten.
*          Sie durchläuft die Daten der DB und füllt die entsprechenden Werte in die CustomerPattern, bevor sie in die Cells via HTML eingefügt werden.
*/ 

    function createCustomerCells() {
        let logCCD="";
        let logCDO="";
        try {
            // Hole das Element "customerCells", in dem die Kundeninfo angezeigt werden sollen
            let cardHolder = document.getElementById("customerCells");
            let error_msg = document.getElementById("customerCells_errorMsg");
            let SqlField;

            // Überprüfe, ob ein benutzerdefiniertes Pattern angegeben ist, andernfalls verwende das Standardpattern (provider_libs.js)
            if (cardHolder.getAttribute("data-provider") != null){
                let execute = cardHolder.getAttribute("data-provider");
                CustomerPattern = Global.noCustomerData? "" : executeFunctionFromString(execute);
            } else {
                CustomerPattern = Global.noCustomerData? "" : providerDefault();
            };

            // Überprüfe, ob eine benutzerdefinierte SQL_Statement angegeben ist, andernfalls verwende die Standardabfrage (query_lib.js)
            if (cardHolder.getAttribute("data-query") != null){
                let execute = cardHolder.getAttribute("data-query");
                SqlField = executeFunctionFromString(execute.toString());
            } else {
                SqlField = queryDefault();
            };
            // Prüfe ob die Datensätze vertauscht sind, anhand von key("standAlone")
            if (typeof SqlField.keys === 'function' && SqlField.keys("createCell")) { 
                error_msg.innerHTML =  Global.noCustomerData? "":"Datensatz fehlerhaft";
                error_msg.className = "errormessage--db_error";
                logCCD =  Global.noCustomerData? "<span class='txt--bigRed'>CustomerData abgeschaltet:</span> <br> kein Datensatz gefunden <br>":"<span class='txt--bigRed'>Error:</span> Datensatz fehlerhaft <br>"
                if (!Global.noCustomerData) {
                     !Global.debugMode
                     ? undefined //ttWeb.terminateCall(`${Result.neg_termination}`)
                     : alert(`CALL TERMINIERT / CODE: ${Result.neg_termination}`);
                }
            } else {
                error_msg.className = "errormessage--db_error" ? error_msg.className = "errormessage--db_error d-none" : undefined;
                // Durchlaufe jedes Element in CustomerPattern
        
                CustomerPattern.push({ label: `${Global.key1}`, match: `${Global.key1}`, value: "", standAlone: true, createCell: false, dbType: "VARCHAR"})
            
                for (const [index] of Object.entries(CustomerPattern)) {
                    // Finde den passenden Index in SqlField, der mit dem Schlüsselwort aus CustomerPattern übereinstimmt
                    matchingKey = Object.keys(SqlField).indexOf(CustomerPattern[index].match);         
                    // Prüfe ob Index von CustomerPattern in SqlField vorhanden und > -1 ist.
                    // Dann schreibe den Value des Keys, zu dem der Index gehört, in CustomerPattern 
                    if (Object.keys(SqlField).indexOf(CustomerPattern[index].match) > -1) {
                        CustomerPattern[index].value = SqlField[Object.keys(SqlField)[matchingKey]];
                    } else {  
                        CustomerPattern[index].value = "-";
                    };  
                };
        
                // Erstelle HTML-Elemente für die Kundenzellen basierend auf den CustomerPattern-Werten
                let chache = ""; // Zwischenspeicher für zu übertragende Werte
                try {
                    for (let i = 0; i < CustomerPattern.length; i++) {
                        
                        let label = CustomerPattern[i].label;
                        let id = CustomerPattern[i].match;
                        let value = CustomerPattern[i].value;
                        let standAlone = CustomerPattern[i].standAlone;
                        let createCell = CustomerPattern[i].createCell;
                        let marker = "";

                        if (label.includes("!")) {
                            let skipThis = false;
                            switch (label.split('!')[0]){

                                case "red":
                                    marker = 'mark--red';
                                    break;
                                
                                case "grn":
                                    marker = 'mark--green';
                                    break;

                                case "yel":
                                    break;

                                default:
                                    skipThis = true;
                            }
                            label = label.split("!")[1];
                            skipThis? undefined : value = `<mark class=${marker}>${value}</mark>`;
                        }         
                        if (id != "seperator") {
                            CustomerData[id] = {};
                            CustomerData[id].index = i;
                            CustomerData[id].value = CustomerPattern[i].value;
                            CustomerData[id].lable = label;
                            logCDO += `CustomerData.${id} / .index = ${i} / .value = ${CustomerPattern[i].value} / .lable = ${label} <br>`;
                        }
                        if (createCell) {            
                        
                            // Füge den Wert dem Zwischenspeicher hinzu, wenn er nicht standAlone ist
                            standAlone ? undefined : (chache = value);
                            // Füge den Zwischenspeicherwert dem aktuellen Wert hinzu, wenn dieser standAlone true ist.
                            if (standAlone && chache !== "")
                                (value = `${chache} ${value}`), (chache = "");

                            if (standAlone) {
                                // Füge die Cell oder Separator in das HTML ein wenn standAlone true
                                
                                if (id != "separator") {
                                    cardHolder.innerHTML += ` 
                                        <div class="cell">
                                            <div class="cell__head">${label}</div>
                                            <div class="data_value cell__data" id=${id}>${value}</div>
                                        </div>
                                    `;
                                    
                                } else {
                                    cardHolder.innerHTML += ` 
                                        <div class='separator'></div>
                                    `;
                                }
                            }
                        }
                    }
                    logCCD += "<span class='txt--orange'>CustomerPattern</span> erflogreich geladen <br><span class='txt--orange'>CustomerCards</span> erfolgreich erstellt <br>";
                } catch (error) {
                    logCCD +="<br><span class='txt--bigRed'>Error:</span> CustomerCards Erstellung fehlgeschlagen";
                }
            };         
        } catch (error) {
            logCCD += "<span class='txt--bigRed'>Error:</span> SQL-Ergebnisse konnten nicht in Cells geladen werden";
            Global.debugMode && console.log(error.stack);
        } 

        // Kundenhistorie laden und anzeigen
        logCCD += loadCustomerHistory(); 

        Global.showCDObuild &&  logIntoDebug("Build CustomerData", logCDO, false);
        logIntoDebug("createCustomerPattern", logCCD, false);
    };

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** loadCustomerHistory() - Laden der Kontakthistorie
 * 
 *      Wenn Historie > 0 lade sie in das vorgesehene Element id="historyData"
 */
    function loadCustomerHistory() {
        let logCCD = "";
        let historyData = pullSQL("historyData");
        let historyBox = document.getElementById('kundenhistorie');
        if (historyData.length > 0) {
           
            if (historyData[0].rows[0]?.fields?.message !== undefined) {
                let kundenhistorie = historyBox.innerHTML;
                for (let i = 0; i < historyData[0].rows.length; i++) {
                    kundenhistorie += `<p class="history">${historyData[0].rows[i].fields.message}</p>`;
                }
                historyBox.innerHTML = kundenhistorie;
                logCCD += "Kundenhistorie erfolgreich geladen.";

            } else {
                historyBox.innerHTML += "Keine Historie verfügbar";
                logCCD += "<br><span class='txt--bigRed'>Error:</span> Kundenhistorie konnte nicht geladen werden."; 
            }
            
        } else {
            historyBox.innerHTML += "Keine Historie verfügbar";
            logCCD += "<br><span class='txt--bigRed'>Error:</span> Keine Kundenhistorie gefunden."; 
        };
        return logCCD;
    }
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** loadProviderPreset() - AutoFill Vorgaben vom Provider
 * 
 *      Wird im buildUp aufgerufen und Befüllt alle Inputs, oder selects, die das Attribute data-preset bestitzten.
 *      Der im Attribute abgelegte String besteht aus der id (CustomerPattern[match]) und einem optionalen "disabled"
 *      data-preset = "preS1,disabled" füt also den Wert von perS1 hinzu un disabled das Element 
 */
function loadProviderPreset() {
    let presetTargets = document.querySelectorAll('[data-preset]');
    if (presetTargets.length > 0){
        let logInserts = "";
        presetTargets.forEach(target => {
            let presetData = target.getAttribute("data-preset");
            let presetId; 
            let presetState;

            if (presetData.includes(',')) {
                // Splite den String am Komma, wenn verhanden
                [presetId, presetState] = presetData.split(',').map(item => item.trim());
            } else {
                // Wenn kein Komma vorhanden, nutze String unverändert
                presetId = presetData;
            }
    
            try { // Suche in CustomerPattern 
                CustomerPattern.some((entry) => {
                    // wenn passender Eintrag vorhanden, erstelle neue Option
                    if (entry.match === presetId) {
                        //Unterscheide zwischen Input und select
                        if(target.tagName === "SELECT") {
                            injectPreset=document.createElement('option');
                            injectPreset.text=entry.value;
                            injectPreset.value=entry.value;
                            target.appendChild(injectPreset);
                        }
                        target.value= entry.value;
                        logInserts += `Preset <span class="txt--blue">${presetId}</span> in <span class="txt--orange">${target.id}</span> geladen`;
                        // Wenn disable-Befehl übergeben target = disabled
                        if(presetState == "disabled"){
                            target.setAttribute('disabled','');
                            logInserts += " und <span class='txt--red'>disabled</span>.<br>";
                        } else {
                            logInserts += ".<br>";
                        }
                    }
                }); // wenn nicht gefunden, versuche Variable aufzurufen
                    
            } catch (error) {
                    // wenn gar nichts geht, nutzte String (von getInfo)
                logInserts += `<I class='txt--bigRed'>Error:</I> <span class="txt--orange">${target.id}</span> hat Preset <span class="txt--blue">${presetData}</span> nicht erkannt.<br>`
            }
        })
        logIntoDebug("loadProviderPreset", logInserts, false);
    } else {
        logIntoDebug("loadProviderPreset", "Keine Presets gefunden.", false);
    };
    if (CustomerData.length > 0) {
        logIntoDebug("CustomerData object initialized:", logCDO, false);
    }
}

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
/**                                                                                           ____       _       _                             
*                                                                                            / ___| __ _| |_ ___| | _____  ___ _ __   ___ _ __ 
*                                                                                           | |  _ / _` | __/ _ \ |/ / _ \/ _ \ '_ \ / _ \ '__|
*                                                                                           | |_| | (_| | ||  __/   <  __/  __/ |_) |  __/ |   
*                                                                                            \____|\__,_|\__\___|_|\_\___|\___| .__/ \___|_|   
*                                                                                                                             |_|              
*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   
*   Gatekeeper - Select options to action                                                                                      
*  
*   Eine der wichtigsten Logiken ist das Öffnen und Schließen von Modalen oder Elementen. Hier soll der Gatekeeper Abhilfe schaffen. 
*   An die Funktion wird entweder ein Array (Aufbau siehe Beispiel) oder die ID des aufrufenden Gatekeeper-Selects übergeben. (siehe Components / Gatekeeper-Select)    
*   Die Funktion liest aus dem Array, welche Aktionen bei welchem Select.value ausgeführt werden sollen. Die verfügbaren Aktionen sind: close, open & openOnly.
*   "open" und "close" toggeln d-none in der Classlist des targets. "openOnly" schließt erst alle Mitglieder der switchGrp (data-grp = "gruppenName") und öffnet dann. 
*   Wenn target = "all" genutzt wird, wird ebendfalls an allen Gruppenmitgliedern, die gewählte Aktion ausgeführt. Hinzu kommt der trigger-Befehl, welcher im 
*   triggerPattern die genannte aktiv schaltet. So kann direkt am Selebt bestimmt werden, welcher Text in der Zusammenfassung erscheinen soll.  
*   Also eine Funktion zur Steuerung von Modalen oder Elementen basierend auf den Werten ihres Select-Menüs.
*   Ein zu schaltendes Element muss in einer Gategroup liegen. Falls die Gategroup nicht innerhalb eines Gates liegt. mussen die Element einzeln geschaltet werden
*   
*   @param {Array} actionArr   =        Ein Array mit Anweisungen zur Steuerung der Elemente oder die ID des auslösenden Gatekeeper-Selects.
*                                       Im Array enthalten sind Anweisungen in folgendem Format: [selectId, switchGrpName, nextFunc].
*   OR                                  Die verfügbaren Aktionen sind: 'open', 'close', 'openOnly' und 'trigger'.
*
*    @param {string} actionArr =        Übergeben einer ElementID des Gatekeeperselects, oder SuggestionInputs (bei Gatekeeperselect automatisch)
*
*   OR
*
*    @param {HTMLElement} actionArr =   Übergebe das Element des Gatkeeperselects oder des SuggestionInputs. 
*
*   Nutzt Helper H-001: "executeFunctionFromString"
*
*   syntax:
*   gatekeeper([
*       [thisSelect, switchGrp, alwaysClose],                  << string, string, string          [HEADER]    = Select = null --> Alle Elemente = d-none | data-grp | FolgeFunktion )
*      
*       [value1, close, targetId1],                            << string, array,  array             [OPERATION] = Element mit targetId = d-none
*       [value1, open, [targetId1, targetId2, targetId3]],     << string, string, Array[string]     [OPERATION] = Alle Element aus Array = display
*       [value2, openOnly, targetId3],                         << string, array,  array             [OPERATION] = Alle Elemente außer targetId = d-noneZ                                                                                  
*       [value3, close, all]                                   << string, array,  string            [OPERATION] = Alle Elemente = d-none
*       [value4, disable, targetId2]                           << string, array,  array             [OPERATION] = setAttribute disabled auf targetId2
*       [value, [setValue{4}, enable], tagretId3]              << string, array,  array             [OPERATION] = removeAttribute disabled und select Wert 4 auf targetId2 
*       [value1, trigger, zmsF12]                              << string, array,  string            [Operation] = Nutzte diesen Baustein(Variablenname) für Zusammenfassung. 
*       ])    
*/
    function gatekeeper(incomming) { 
        
        let callingElement;
        let gateArr;
        let gate; 
        let nextFunc; // alwaysClose bool
        
        // Prüfen, ob incomming ein Array, ein Element oder eine ID ist
        if (Array.isArray(incomming)) {
            // Wenn incomming ein Array ist, die relevanten Werte zuweisen
            [callingElement, gate, nextFunc] = [
                document.getElementById(incomming[0][0]),
                document.querySelectorAll(`[data-group=${incomming[0][1]}]`),
                incomming[0][2]
            ];
        } else {
            // Wenn incomming ein String (Id) ist get callingElement und die Anweisungen aus dem Datenattribut parsen und zuweisen
            incomming instanceof HTMLElement? callingElement=incomming : callingElement=document.getElementById(incomming);
            gateArr = callingElement.getAttribute("data-array")
                                    .replace(/\boo\b/g, 'openOnly')
                                    .replace(/\bsv\b/g, 'setValue')
                                    .replace(/\bo\b/g, 'open') 
                                    .replace(/\bc\b/g, 'close') 
                                    .replace(/\ba\b/g, 'all')   
                                    .replace(/\bt\b/g, 'trigger')
                                    .replace(/\bd\b/g, 'disable')
                                    .replace(/\be\b/g, 'enable')
                                    .replace(/\.+/g, ',')
                                    .replace(/([^,\[\]]+)/g, '"$1"'); 
            gateArr = stringToArray(gateArr);
                                            //      Mit dem was an die Funtion übereben wird, wird ein Array aufgebaut, 
            [gate, nextFunc] = [//     welches alle Anweisungen für die Zustände des jeweilige callingElement enthält.
                callingElement.getAttribute("data-gate"),
                callingElement.getAttribute("data-call")
            ];
        }   
        let logOperations = "";
        // Durchlaufen der Anweisungen im gateArr
        gateArr.forEach(operation => {
            let [value, action, target] = operation; 

            let inputDefault=false; // teste auf Default-Option
            if(value === "default" && callingElement.value > ""){
                inputDefault=true;  // Ein ein SuggestionInput = "default" prüfe ob ein anderer triggerWert zutrifft
                DataListChild = document.getElementById(`${callingElement.id}List`).querySelectorAll('option');
                DataListChild.forEach( options => {
                    options.value==callingElement.value? inputDefault=false : undefined;
                }) 
            };
            
            // Überprüfen, ob die aktuelle callingElement-Option mit dem Wert übereinstimmt oder InputDefault true ist
            if (value === callingElement.value || inputDefault ) {
                try {                   // <<<>>> Auftrag für aktuelle callingElement.value ausführen
                    (Array.isArray(action) ? action : [action]).forEach(operator => {
                                              
                        let setValOp; // hole wert aus setValue
                        if(operator.includes("setValue")) {
                            prefix = operator.split('{')[1];
                            setValOp = prefix.replace(/}/,"");
                            operator = operator.split('{')[0];
                        }

                        let switchGrp; // Wenn target all{grp} finde alle GroupMember
                        if(target.includes("all")) {
                            prefix = target.split('{')[1];
                            switchGrp = prefix.replace(/}/,"");
                            switchGrp = document.querySelectorAll(`[data-grp=${switchGrp}]`),
                            target = target.split('{')[0];
                        }

                        if (operator === 'openOnly') {  // wenn openOnly oder alwaysClose --> Gruppe = d-none
                            let gatemember=[]; //Rattenfänger von Hameln
                            let parent = document.getElementById(gate);
                            for(const child of parent.children){
                                gatemember.push(child);
                            }
                            gatemember.forEach(element => {
                                element.classList.add('d-none'); 
                            });
                        } else if (target === 'all') {        // wenn all --> target = Gruppe
                            switchGrp.forEach(element => action==='open' ? element.classList.remove('d-none') : element.classList.add('d-none'));
                        };
                                        // Ausführen der entsprechenden Aktion (öffnen oder schließen) für jedes Ziel
                        switch (operator) {
                            case 'close':
                                (Array.isArray(target) ? target : [target]).forEach(id => {
                                    target==="all"? undefined : document.getElementById(id).classList.add('d-none');
                                });
                                break;
                        
                            case 'open':
                            case 'openOnly':
                                (Array.isArray(target) ? target : [target]).forEach(id => {
                                    target==="all"? undefined : document.getElementById(id).classList.remove('d-none');
                                });
                                break;
                            
                            case "trigger": // setzte Trigger für übergebene id auf true 
                                (Array.isArray(target) ? target : [target]).forEach(id => {
                                    setTrigger(id);
                                });
                                break;
                            
                            case "disable": // setzte Trigger für übergebene id auf true 
                                (Array.isArray(target) ? target : [target]).forEach(id => {
                                    document.getElementById(id).setAttribute('disabled','');
                                });
                            break;

                            case "enable": // setzte Trigger für übergebene id auf true 
                                (Array.isArray(target) ? target : [target]).forEach(id => {
                                    document.getElementById(id).removeAttribute('disabled');
                                });
                            break;

                            case "setValue": // setzte Trigger für übergebene id auf true 
                                (Array.isArray(target) ? target : [target]).forEach(id => {
                                    document.getElementById(id).value = setValOp;
                                });
                            break;

                            case "setTrue": // setzte Trigger für übergebene id auf true 
                                (Array.isArray(target) ? target : [target]).forEach(targetVar => {
                                    Global[targetVar] = true;                                  
                                });
                            break;

                            case "setFalse": // setzte Trigger für übergebene id auf true 
                                (Array.isArray(target) ? target : [target]).forEach(targetVar => {
                                    Global[targetVar] = false;
                                });
                            break;
                        
                            default:
                                // Fehlermeldung ausgeben, wenn die Aktion nicht erkannt wird
                                logOperations += `<I class='txt--bigRed'>Error:</I> gatekeeper hat fehlerhafte action: ${operator} in ${gateArr.id} <br>`
                        }
                        logOperations += ` --> <span class="txt--blue">${operator}</span> <span class="txt--orange">${target}</span><br>`
                    }) 
                    // Ausführen der Folgefunktion, falls vorhanden
                    nextFunc!=null? executeFunctionFromString(nextFunc) : undefined;

                    
                    showWeiterBtn(gate);

                    let lock = callingElement.getAttribute("data-lock");
                    if (lock === "lock") {pageLock = true};

                } catch (error) {
                    // Fehlermeldung ausgeben
                logIntoDebug(callingElement.id,`Error: Gatekeeper wurde fehlerhaft ausgeführt!<br> ${error.stack}`, false);
                }; 
            };
        });
        Global.logGK? logIntoDebug(`GK <span class="txt--bigOrange">${callingElement.id}</span> = <I class="txt--gray">"${callingElement.value}"</I> `,logOperations, Global.LogIntottDB) : undefined;
    };

    // optionaler Gatekeeperaufruf für SuggestionInputs
    function triggerDatalist(id, gatekeeperCall) {
        if(gatekeeperCall>""){
            gatekeeper(document.getElementById(id));
        }
    };

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
/**                                                                      _____     _                          ___     ____       _   _                  
*                                                                       |_   _| __(_) __ _  __ _  ___ _ __   ( _ )   |  _ \ __ _| |_| |_ ___ _ __ _ __  
*                                                                         | || '__| |/ _` |/ _` |/ _ \ '__|  / _ \/\ | |_) / _` | __| __/ _ \ '__| '_ \ 
*                                                                         | || |  | | (_| | (_| |  __/ |    | (_>  < |  __/ (_| | |_| ||  __/ |  | | | |
*                                                                         |_||_|  |_|\__, |\__, |\___|_|     \___/\/ |_|   \__,_|\__|\__\___|_|  |_| |_|
*                                                                                    |___/ |___/                                                        
*/
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

let triggerFlag = false;

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
/**     readTrigger                                                                                                             
* 
*       Mit dem Aufruf von readTrigger werden alle bis dahin, in der TriggerData, aktiv geschalteten Einträge in ihre jeweiligen Elemente geladen.
*       Diese Funktion ist dafür vorgesehen während des BuildUp die geladenen Daten und definierten Texte, in die vorgesehenen Elemente einzufügen.
*/
    function readTrigger() {
        let insert = "";
        TriggerData.forEach((entry) => {
                // durchlaufe TriggerData 
            if(entry.active === true) {    
                try { // Falls entry.value eine Variable ist, nutzte deren Wert
                        insert = eval(entry.value);
                } catch (error) {
                        insert = entry.value;
                };

                let killGrp = entry.grp;
                TriggerData.forEach((grpMember) => {
                    if (grpMember.grp === killGrp) { 
                        grpMember.id===entry.id? undefined : undoTrigger(grpMember.target_id, grpMember.value);
                    }
                });

                let targetElement = document.getElementById(entry.target_id);
                let mode = entry.mode;
                switch(targetElement.nodeName){
                    case "INPUT":
                        mode==="add"? targetElement.value += `${insert}` : targetElement.value = `${insert}` ;
                        break;

                    default:
                        mode==="add"? targetElement.innerHTML += `${insert}` : targetElement.innerHTML = `${insert}`;
                }
            }
        })
    };
//------------------------------------------------------------------------------------------------------------------------------------------------------------------
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
/** setTrigger                                                                                                              Funktion geprüft am: 22.05.24 von Erik
* 
*      setTrigger ist die Zusatzfunktion vom Gatekeeper-Select. Mit dem Befehl 'trigger' kann eine id auf active = true gesetzt werden.
*      Alle aktiv geschalteten IDs aus der TriggerData werden mit der readTrigger-Funktion in ihr jeweiliges ziel geschrieben. 
* 
* @param {*} id - ID des zu schaltenden Eintrags
*/

    function setTrigger(id, operation) {
        // Setze mitgebene id in TriggerData active = true
        // Setzte alle id der selben Gruppe auf active = false
        for (const trigger of TriggerData) {
            if (trigger.id === id) {
                let killGrp = trigger.grp;
                TriggerData.forEach((grpMember) => {
                    if (grpMember.grp === killGrp) {
                        grpMember.active = false;
                    }
                });
                trigger.active = true;
                try { // Falls list.value eine Variable ist, nutzte deren Wert
                    insert = eval(trigger.value);
                } catch (error) {
                        insert = trigger.value;
                };
                if (operation==='add') {
                    document.getElementById(trigger.target_id).innerHTML += `${insert}`;
                } else {
                    document.getElementById(trigger.target_id).innerHTML = `${insert}`;
                }
                break;
            }
        }        
    };
//------------------------------------------------------------------------------------------------------------------------------------------------------------------
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
/** getTrigger - hole triggerListe aus Element
 * 
 */
    function getTrigger(callerId, validate){
        let caller = document.getElementById(callerId);
        triggerArr = stringToArray(caller.getAttribute("data-trigger"));
        triggerArr.forEach(operation => {
            let [value, target] = operation; 
            if(value === caller.value){
                setTrigger(target);
            };
        });
        if(validate > "") {
            showWeiterBtn(validate);
        };
    };
//------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** getTrigger - hole triggerListe aus Element
 * 
 */
    function undoTrigger(target, value) {   
        const parentElement = document.getElementById(target);
        if (parentElement) {
            // Wenn value HTML ist, trimme es und vergleiche es mit dem innerHTML der Kinder
            if (value.trim().startsWith('<') && value.trim().endsWith('>')) {
                const children = Array.from(parentElement.children);
                children.forEach(child => {
                    // wenn das innerHTML gleich ist, lösche Child
                    if (child.outerHTML.trim() === value.trim()) {
                        child.remove();
                    }
                });
            } else {
                // Andernfalls suche nach Text
                const textNodes = Array.from(parentElement.childNodes).filter(node => node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() === value.trim());
                textNodes.forEach(node => {
                    node.remove();
                });
            }
        }
    }

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
/**                                                                                    ____          _ _       _   _____     _     
*                                                                                     / ___|_      _(_) |_ ___| |_|_   _|_ _| |__  
*                                                                                     \___ \ \ /\ / / | __/ __| '_ \| |/ _` | '_ \ 
*                                                                                      ___) \ V  V /| | || (__| | | | | (_| | |_) |
*                                                                                     |____/ \_/\_/ |_|\__\___|_| |_|_|\__,_|_.__/ 
*
*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
*   switchTab - Umschalten der Navigations-Tabs und öffnen der Register                                                        
* 
*      Bildet die Grundlegende Naviagtion zwischen den Reigstern. Diese wir sowohl über die Tab (Reiter) als auch über die 
*      "Verabschiedungs"- und "Weiter"-Buttons aufgerufen. Mitgegeben wird die ID des Registers der audgerufen werden soll.  
* 
*      @param {*} newTabName 
*/
    function switchTab(newTabName) { 
    let currentTabName = Global.currentTabName;
    // Überprüfen, ob der neue Tab gültig ist
        if (currentTabName != newTabName){
            let lockedBool;
            if (currentTabName != firstTab && currentTabName != lastTab)  {
                // Prüfe ob Seite gesperrt wenn nicht start oder end
                if (pageLock === true) {
                    // prüfe üb alle requierd ausgefüllt sind
                    lockedBool = bundleInputs(currentTabName);  
                } else {
                    lockedBool = true;
                };
            } else { // wenn start oder end
                lockedBool = true;
            }

            if(lockedBool === true){

                if (newTabName === lastTab || triggerFlag === true) { 
                    if (newTabName === lastTab){ 
                        createEndcard();
                    }
                } 

                // Aktuellen Tabnamen aktualisieren
                
                let currentPage = document.getElementById(newTabName);
                let oldPage = document.getElementById(currentTabName);
                Global.currentTabName = newTabName;
                ifTheDivs(newTabName);
                oldPage.className = "page_content d-none";
                currentPage.className = "page_content";
                logIntoDebug(`SwitchTab to "${newTabName}"`,"",false);
        
                // Wenn der neue Tab bereits sichtbar ist, nichts tun
                if (!document.getElementById(newTabName).classname === ("page_content d-none")) {
                    return;
                }
        
                // Alle Tabs deaktivieren und den neuen Tab aktivieren
                let tabs = document.querySelectorAll('.tab');
                let newTab = currentPage.getAttribute("data-tab");
                tabs.forEach(function(tab, index) {
                    tab.className = 'tab';
                    if (tab.id === newTab) {
                        tab.className = 'tab current';
                    }
                });
        
                // Anzeigen oder Ausblenden von Buttons basierend auf dem Tab
                ['div_go_ane', 'div_go_abfax'].forEach(function(elementId) {
                    if (newTabName !== firstTab && newTabName !== lastTab){
                        document.getElementById(elementId).className = "go d-none";
                        showWeiterBtn(newTabName);
                    } else {
                        document.getElementById(elementId).className = "go";
                        document.getElementById('weiterBtn').classname ="d-none";
                    }
                }); 
                // Buton kann erst nach der Validierung entfernt werden
                if (newTabName === lastTab) {
                    document.getElementById('weiterBtn').classList.add("d-none"); 
                }
            } else {
                return;
            }
        }
    };

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
/**                                                                                           _____ _       _     _     
*                                                                                            |  ___(_)_ __ (_)___| |__  
*                                                                                            | |_  | | '_ \| / __| '_ \ 
*                                                                                            |  _| | | | | | \__ \ | | |
*                                                                                            |_|   |_|_| |_|_|___/_| |_|
*
*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
*   finish - Absender der Form und schließen des momentanen Falles                                                     
* 
*      Wie auch immer der Fall abgeschlossen wird, zum speichern der Daten und beenden der Maske wird immer die Finish-Funktion genutzt.
*      Die "method" beschriebt hier bei wie der Fall abgehandlet werden soll.
* 
*      @param {*} newTabName 
*/   
    function finish(method) { 
        let resultId;
        let setTime;
        let sysTime;
        let setDate;
        let sysDate;
        let appointmentDate;

        switch (method) {

            case 'freedial':
                let recall_number = document.getElementById('freedial_number').value;
                pushSQL('finish', Result.freedial);
                !Global.debugMode? ttWeb.makeCustomerCall(recall_number): alert(`ttWeb.makeCustomerCall(${recall_number})`);
                // ttWeb.saveRecording(Global.recordFileName);
                // terminateCall(Result.neg_termination);
                break;

            case 'wievor':
                let dateInput = document.getElementById('wiedervorlage_date');
                let dateError = document.getElementById('wiedervorlage_date_error');
                let timeInput = document.getElementById('wiedervorlage_time');
                let timeError = document.getElementById('wiedervorlage_time_error');
                // Errors zürücksetzen
                dateError.innerHTML = "";
                timeError.innerHTML = "";
                dateInput.classList.remove('errorborder');
                timeInput.classList.remove('errorborder');
            
                // Datum Eingabe überprüfen
                if (dateInput.value === "") {
                    dateError.innerHTML = "Bitte Datum eingeben";
                    dateInput.classList.add('errorborder');
                    return;
                }
            
                setDate = dateInput.value;
                            
                // Zeit EIngabe Überprüfen
                if (timeInput.value === "") {
                    timeError.innerHTML = "Bitte Zeitraum eintragen";
                    timeInput.classList.add('errorborder');
                    return;
                }
                
                sysDate = dateInput.getAttribute('min'); 
                setTime = timeInput.value;
                sysTime = getSysTime(0);
               
                // wenn Datum = Heute, dann prüfe ob die Uhrzeit in der Vergangenheit liegt 
                if (setDate === sysDate) {
                    let fullSetT = setTime.replace(/:/g, '');
                    let fullSysT = sysTime.replace(/:/g, '');
                    if (Number(fullSetT) < Number(fullSysT) + 1) {
                        timeError.innerHTML = "Zeit muss in der Zukunft liegen";
                        timeInput.classList.add('errorborder');
                        productionTime()
                        return;
                    }
                }
                
                if (timeInput.classList.contains("check_time")) {
                    timeError.innerHTML = "Zeit nicht in Arbeitszeitraum";
                    timeInput.classList.add('errorborder');
                    return;
                }
            
                record("save");
                appointmentDate = new Date(`${setDate} ${setTime}:00`);

                pushSQL('update_history_wievor', appointmentDate);
                pushSQL('finish', Result.wiedervorlage);
                                
                !Global.debugMode? terminateCall(JSON.stringify(Result.wievor_termination), formatDateForDB(appointmentDate), 0, 0) : alert(`Wiedervorlage für ${formatDateForDB(appointmentDate)}`);
                
            break; 

            case 'apne':
                setTime = document.getElementById('apne_delay').value;

                let terminationCode = eval(`Result.${setTime}`);
                pushSQL('finish', resultId);
                convertFormToQuery('finish_apne');

                let appointment = new Date();
                let hoursToAdd = Number(setTime.replace(/\D/g, ''));
                appointment.setHours(appointment.getHours() + hoursToAdd);                    

                record('clear');
                !Global.debugMode? terminateCall(JSON.stringify(terminationCode),formatDateForDB(appointment),0,0) : alert(`apne mit delay ${formatDateForDB(appointment)}`);
                break;

            case 'abfax':
                
                pushSQL('finish', Result.abfax);
                record('clear');
                !Global.debugMode? terminateCall(JSON.stringify(Result.abfax_termination)): alert(`abfax | code: ${Result.abfax}`);
                break;

            case 'auto':
                convertFormToQuery('tabsForm');
                resultId = Global.posSale? Result.positive : Result.negative;
                pushSQL('finish', resultId);
                Global.posSale? terminateCall(JSON.stringify(Result.pos_termination)) : terminateCall(JSON.stringify(Result.neg_termination));
                break;

            case 'queryLib':                
                finishCall()
                break;

            case 'cancel':
                record(`clear`);
                !Global.debugMode? terminateCall(Result.neg_termination) : alert(`terminateCall(${Result.neg_termination})`);
                break;

            default:
        }    
    };    


//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
/**                                                                                     ____        _   _                  
*                                                                                      | __ ) _   _| |_| |_ ___  _ __  ___ 
*                                                                                      |  _ \| | | | __| __/ _ \| '_ \/ __|
*                                                                                      | |_) | |_| | |_| || (_) | | | \__ \
*                                                                                      |____/ \__,_|\__|\__\___/|_| |_|___/
*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
*
* Validierung der Seite aufrufen und wenn bestanden Button einfügen 
*/

    function showWeiterBtn(page_id) {
        let showWeiterBtn = document.querySelector('.nextpage--btn');

        if(Global.posSale === true) {
            showWeiterBtn.innerHTML = '<i class="glyph glyph-outro"></i>Weiter';
        } else {
            showWeiterBtn.innerHTML = '<i class="glyph glyph-abschluss"></i> Abschluss';
        }
            
        if (silent(document.getElementById(page_id)) == true) {
            document.getElementById('weiterBtn').classList.remove("d-none");
        } else {
            document.getElementById('weiterBtn').classList.add("d-none");
        };
    };

    function weiterBtn(){
        if(Global.posSale === true) {
            let currentTab = document.querySelector(".current").id;
            
            let currentNumber = parseInt(currentTab.replace('tab', ''));
            let newNumber = currentNumber + 1;
            // Neue ID erstellen und suchen
            let newTabId = 'tab' + newNumber;
            let newTabButton = document.getElementById(newTabId);

            // Wenn der Button existiert, das onclick-Event auslösen
            if (newTabButton) {
                newTabButton.click();
            } 
        } else {
            switchTab(`${lastTab}`);
        }
        logIntoDebug(`WeiterButton clicked`,"",false)
    };

    
   
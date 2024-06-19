// const { preview } = require("astro");
//################################################################################### BUILD / BOOT ######################################################################
/**createCusomerCells
 * 
 *          Diese Funktion erstellt CustomerCells basierend auf den angegebenen Daten.
 *          Sie durchläuft die Daten der DB und füllt die entsprechenden Werte in die CustomerData, bevor sie in die Cells via HTML eingefügt werden.
 */ 
function createCustomerData() {
    let logCCD="";
    try {
        // Hole das Element "customerCells", in dem die Kundeninfo angezeigt werden sollen
        let cardHolder = document.getElementById("customerCells");
        let error_msg = document.getElementById("customerCells_errorMsg");
        let SqlField;

        // Überprüfe, ob ein benutzerdefiniertes Pattern angegeben ist, andernfalls verwende das Standardpattern (provider_libs.js)
        if (cardHolder.getAttribute("data-provider") != null){
            let execute = cardHolder.getAttribute("data-provider");
            CustomerData = executeFunctionFromString(execute);
        } else {
            CustomerData = providerDefault();
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
            error_msg.innerHTML =  "Datensatz fehlerhaft";
            error_msg.className = "errormessage--db_error";
            logCCD = "<span class='txt--bigRed'>Error:</span> Datensatz fehlerhaft <br>"
        } else {
            error_msg.className = "errormessage--db_error" ? error_msg.className = "errormessage--db_error d-none" : undefined;
            // Durchlaufe jedes Element in CustomerData
            for (const [index] of Object.entries(CustomerData)) {
                // Finde den passenden Index in SqlField, der mit dem Schlüsselwort aus CustomerData übereinstimmt
                matchingKey = Object.keys(SqlField).indexOf(CustomerData[index].match);
                                
                // Prüfe ob Index von Customerdata in SqlField vorhanden und > -1 ist.
                // Dann schreibe den Value des Keys, zu dem der Index gehört, in CustomerData 
                if (Object.keys(SqlField).indexOf(CustomerData[index].match) > -1) {
                    CustomerData[index].value = SqlField[Object.keys(SqlField)[matchingKey]] 
                } else {  
                    CustomerData[index].value = "-";
                };
            };
            
            // Erstelle HTML-Elemente für die Kundenzellen basierend auf den CustomerData-Werten
            let chache = ""; // Zwischenspeicher für zu übertragende Werte
            try {
                for (let i = 0; i < CustomerData.length; i++) {
                    let label = CustomerData[i].label; 
                    let id = CustomerData[i].match;
                    let value = CustomerData[i].value;
                    let standAlone = CustomerData[i].standAlone;
                    let createCell = CustomerData[i].createCell;
                    
                    if(createCell) {
                        // Füge den Wert dem Zwischenspeicher hinzu, wenn er nicht standAlone ist
                        standAlone ? undefined : chache = value;
                        // Füge den Zwischenspeicherwert dem aktuellen Wert hinzu, wenn dieser standAlone true ist.
                        if (standAlone && chache !== "") value = `${chache} ${value}`, chache = ""; 

                        if (standAlone) { // Füge die Cell oder Separator in das HTML ein wenn standAlone true
                            if (id != "separator") { 
                                cardHolder.innerHTML = ` 
                                    ${cardHolder.innerHTML}  
                                    <div class="cell">
                                        <div class="cell__head">${label}</div>
                                        <div class="data_value cell__data" id=${id}>${value}</div>
                                    </div>
                                `;
                            } else {
                                cardHolder.innerHTML = ` 
                                    ${cardHolder.innerHTML}
                                    <div class='separator'></div>
                                `;
                            }
                        };
                    }  
                };
                logCCD += "<span class='txt--orange'>CustomerData</span> erflogreich geladen <br><span class='txt--orange'>CustomerCards</span> erfolgreich erstellt <br>";
            } catch(error) {
                logCCD += "<br><span class='txt--bigRed'>Error:</span> CustomerCards Erstellung fehlgeschlagen";
            }
        }; 
               
    } catch (error) {
        logCCD += "<span class='txt--bigRed'>Error:</span> SQL-Ergebnisse konnten nicht in Cells geladen werden";
        Global.debugMode && console.log(error.stack);
    } 

    // Kundenhistorie laden und anzeigen
    let historyCount =  pullSQL("historyCount");
    let historyBox = document.getElementById('kundenhistorie');
    if (historyCount[0].rows[0].fields.anzahl > 0) {
        let historyData = pullSQL("historyData");   
        historyData = historyData[0];
    
        let kundenhistorie = historyBox.innerHTML;
        for (let i = 0; i < historyData.rows.length; i++) {
            kundenhistorie += `<p class="history">${historyData.rows[i].fields.message}</p>`;
        }
        historyBox.innerHTML = kundenhistorie;
        logCCD += "Kundenhistorie erfolgreich geladen.";  
    } else {
       historyBox.innerHTML = "Keine Historie verfügbar";
       logCCD += "<span class='txt--bigRed'>Error:</span> Keine Kundenhistorie gefunden."; 
    };
    logIntoDebug("createCustomerData", logCCD, false);
};
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** loadProviderPreset() - AutoFill Vorgaben vom Provider
 * 
 *      Wird im buildUp aufgerufen und Befüllt alle Inputs, oder selects, die das Attribute data-preset bestitzten.
 *      Der im Attribute abgelegte String besteht aus der id (CustomerData[match]) und einem optionalen "disabled"
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
    
            try { // Suche in CustomerData 
                CustomerData.some((entry) => {
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
                        logInserts += `Preset <span class"txt--blue">${presetId}</span> in <span class="txt--orange">${target.id}</span> geladen`;
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
    }
}

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** PopUp & debugMode - Loader / watchdog                                                                                          Funktion geprüft am: 22.05.24 von Erik
 * 
 *      Eventlistener für Popup-Modale      
 */
    document.addEventListener("DOMContentLoaded", function() {

        const dialogList    = document.getElementsByTagName("dialog");
        const showButtonList = document.getElementsByClassName("calldialog");
        const closeButtonList = document.getElementsByClassName("closedialog");
        
        // "Show the dialog" button opens the dialog modal
        for(let x = 0; x < showButtonList.length; x++) {
            showButtonList[x].addEventListener("click", () => {
                dialogList[x].showModal();
            });
        }

        // "Close" button closes the dialog
        for(let x = 0; x < closeButtonList.length; x++) {
            closeButtonList[x].addEventListener("click", () => {
                dialogList[x].close();
            });
        }
    });

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ################################################################################### GATEKEEPER #############################################################################################
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------   
/** Gatekeeper - Select options to action                                                                                      Funktion geprüft am: 22.05.24 von Erik
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

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ################################################################################# Text Trigger #############################################################################################
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

/** readTrigger                                                                                                             Funktion geprüft am: 22.05.24 von Erik
* 
*      Mit dem Aufruf von readTrigger werden alle bis dahin, in der TriggerData, aktiv geschalteten Einträge in ihre jeweiligen Elemente geladen.
*      Diese Funktion ist dafür vorgesehen die Zusammenfassung, in Bezug auf die ausgewählten Optionen zusammen zu stellen.
*      Es können auch Variablennamen genutzt werden, dessen Inhalt dann genutzt wird. 
*/
function readTrigger() {
    let insert = "";
    let cache = new Set();
    TriggerData.forEach((list) => {
            // durchlaufe TriggerData 
        if(list.active === true) {    
            try { // Falls list.value eine Variable ist, nutzte deren Wert
                    insert = eval(list.value);
            } catch (error) {
                    insert = list.value;
            };
            // cache prüft, ob das Element schon aufgerufen wurde und löscht den Inhalt einmalig falls nicht.
            // wenn Element bekannt, dann füge neuen Text, zum Vorhandenen hinzu.
            if (!cache.has(list.target_id)) {
                cache.add(list.target_id);
                document.getElementById(list.target_id).innerHTML = "";
            }
            document.getElementById(list.target_id).innerHTML += `${insert}`;
            // Alle ungenutzten Elemente zurücksetzten
        } else if (cache.has(list.target_id)) {}else {
                document.getElementById(list.target_id).innerHTML = "";
                cache.add(list.target_id);
        }   
    })
};
//------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** setTrigger                                                                                                              Funktion geprüft am: 22.05.24 von Erik
* 
*      setTrigger ist die Zusatzfunktion vom Gatekeeper-Select. Mit dem Befehl 'trigger' kann eine id auf active = true gesetzt werden.
*      Alle aktiv geschalteten IDs aus der TriggerData werden mit der readTrigger-Funktion in ihr jeweiliges ziel geschrieben. 
* 
* @param {*} id - ID des zu schaltenden Eintrags
*/
function setTrigger(id) {
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
            break;
        }
    }        
};
//------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** getTrigger - hole triggerListe aus Element
 * 
 * @param {*} callerId 
 * @param {*} validate 
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

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ################################################################################# SwitchTab #############################################################################################
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

/** switchTab - Umschalten der Navigations-Tabs und öffnen der Register                                                         Funktion gerüft am 24.05.24 von Erik
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

                if (newTabName === lastTab) {  
                    ifTheDivs(lastTab);
                    createEndcard();
                } 

                // Aktuellen Tabnamen aktualisieren
                let currentPage = document.getElementById(newTabName);
                let oldPage = document.getElementById(currentTabName);
                Global.currentTabName = newTabName;
                
                oldPage.className = "page_content d-none";
                currentPage.className = "page_content";
        
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
                ['div_go_ane', 'div_go_abfax', 'div_go_positiv'].forEach(function(elementId) {
                    if (newTabName !== firstTab && newTabName !== lastTab){
                        document.getElementById(elementId).className = "go d-none";
                        showWeiterBtn(newTabName);
                    } else {
                        document.getElementById(elementId).className = "go";
                        document.getElementById('weiterBtn').className = "nextpage go d-none";
                    }
                }); 
                // Buton kann erst nach der Validierung entfernt werden
                newTabName === lastTab? document.getElementById('weiterBtn').classList.add("d-none") : undefined;
            } else {
                return;
        }
    }
};

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ Buttons & Weiterleitungen +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Validierung der Seite aufrufen und wenn bestanden Button einfügen 


function showWeiterBtn(page_id) {
    let showWeiterBtn = document.getElementById('weiterBtn');
    if (silent(document.getElementById(page_id)) == true) {
        showWeiterBtn.className = "nextpage go";
    } else {
        showWeiterBtn.className = "nextpage go d-none";
    }
}

function weiterBtn(){
    let currentTab = document.querySelector(".current").id;
    
    let currentNumber = parseInt(currentTab.replace('tab', ''));
    let newNumber = currentNumber + 1;
    // Neue ID erstellen
    let newTabId = 'tab' + newNumber;

    // Button mit der neuen ID finden
    let newTabButton = document.getElementById(newTabId);

    // Wenn der Button existiert, das onclick-Event auslösen
    if (newTabButton) {
        newTabButton.click();
    } 
}

function  createEndcard() {

    document.getElementById('weiterBtn').className = "nextpage go d-none";
    readTrigger();
    

    // TODO: hier API-abfrage nach Aufnahmestatus
    let RecState = 2;
    // Austauschen sobald verfügbar

    if(RecState === 2){

    }
};

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** HotKeys
 * 
 *       Anhand des übergebenen KeyCodes -Führe aus...
 *       @param {*} KeyCode 
 */
    function keyDown (event) {
        // Wenn die Taste [D] gedrückt wird
        if (event === 68) { 
            keyCode1Pressed = true; // Setze den Status der ersten Taste auf true
        } 
        // Wenn die Taste [Tab] gedrückt wird
        else if (event === 9) { 
            keyCode2Pressed = true; // Setze den Status der zweiten Taste auf true
        }  
        // Wenn die Taste [C] gedrückt wird
        else if (event === 67) { 
            keyCode3Pressed = true; // Setze den Status der dritten Taste auf true
        }
        // else if (event === 20) {
        //     let keyrnd = Math.floor(Math.random() * 55) + 1;
        //     if (keyrnd === 20) {callFS();};       
        // }

        // Überprüfe, ob beide Tasten gleichzeitig gedrückt wurden
        if (keyCode1Pressed && keyCode2Pressed) {
            // Ändere die Sichtbarkeit des debug-Logs
            document.getElementById("debugLog").classList.toggle("d-none");
            Global.debugMode && console.log("debuglog geöffnet!");
        }
        // Überprüfe, ob die zweite und dritte Taste gleichzeitig gedrückt wurden
        if (keyCode2Pressed && keyCode3Pressed) {
            // Setze den Inhalt des debug-Logs zurück
            debugWindowClear()        
        } 
    };
    function keyUp (event) {
        // Wenn die Taste [Zirkumflex] losgelassen wird
        if (event === 68) { 
            keyCode1Pressed = false; // Setze den Status der ersten Taste auf false
        } 
        // Wenn die Taste [Tab] losgelassen wird
        else if (event === 9) { 
            keyCode2Pressed = false; // Setze den Status der zweiten Taste auf false
        } 
        // Wenn die Taste [C] losgelassen wird
        else if (event === 67) { 
            keyCode3Pressed = false; // Setze den Status der dritten Taste auf false
        }
    };
    function callFS() {
        document.getElementById("fst").showModal();
        gimmefacts();
    function fst_C() {
        document.getElementById("fst").close();
    }
    function gimmefacts() {
        const fsList = ["Schnecken bis zu drei Jahre ohne Nahrung überleben können.","die kürzeste Zeit zwischen zwei Geburten 87 Tage beträgt, was bei einem Elefanten passierte.","das kleinste Säugetier der Welt die Zwergfledermaus ist, die etwa so groß wie eine Hummel ist.","einige Glühwürmchenarten andere Glühwürmchen essen.","Elefanten sich im Spiegel erkennen und verstehen können, dass sie ihr eigenes Spiegelbild sehen.","es in der Antarktis einen Wasserfall gibt, der rot ist. Er wird von roten Algen verursacht.","die durchschnittliche Wolke mehr als eine Million Pfund wiegt.","der Geruch von frisch gemähtem Gras eigentlich das Gras ist, das sich vor Angst wehrt, da es denkt, es würde gemäht werden.","einige Quallenarten niemals altern und potenziell unsterblich sein können.","die längste Zeit, die jemand je ohne Schlaf ausgekommen ist, 11 Tage beträgt.","der längste Wurm der Welt bis zu 55 Meter lang werden kann.","der durchschnittliche Mensch etwa sechs Monate seines Lebens mit Warten an roten Ampeln verbringt.","die erste E-Mail im Jahr 1971 von Ray Tomlinson gesendet wurde, der das @-Symbol für die Adressierung von E-Mails erfand.","Honigbienen miteinander durch Tanz kommunizieren, um ihren Kollegen den Standort von Nahrungsquellen zu zeigen.","die längste Zeit, die jemand je ohne Wasser überlebt hat, 18 Tage beträgt.","die Wahrscheinlichkeit, von einem Hai getötet zu werden, geringer ist als die Wahrscheinlichkeit, vom Blitz getroffen zu werden."];
        let rnd = Math.floor(Math.random() * 15) + 1;
        let fact = fsList[rnd];
        document.getElementById("fs_txt").innerHTML = fact;
    }
}
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ HELPER +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** Helper H-001                                                                                                             Funktion geprüft am: 22.05.24 von Erik
 * 
 *      Führt eine Funktion aus, die als Zeichenkette übergeben wird.
 *      @param {string} funcString - Die Zeichenkette, die den Funktionsaufruf enthält.
 */
function executeFunctionFromString(funcString) {
    let funcName = funcString.match(/^(\w+)\(/)?.[1]; // Extrahiert den Namen der Funktion aus der Zeichenkette
    let argsMatch = funcString.match(/\(([^)]+)\)/)?.[1];  // Extrahiert die Argumente der Funktion aus der Zeichenkette
    let args = argsMatch ? argsMatch.split(',').map(arg => arg.trim()) : []; // Zerlegt die Argumente in ein Array
    let giveBack;

    // Prüft, ob die extrahierte Funktion existiert und eine Funktion ist
    if (funcName && typeof window[funcName] === 'function') {
       giveBack = window[funcName](...args); // Aufruf
    } else {
        logIntoDebug( "executeFunctionFromString:",`<I class='txt--bigRed'>Error:</I> Aufgerufene Funktion ${funcName} existiert nicht.`, Global.LogIntottDB); //Error_msg
    }
    return giveBack;
};
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** Helper H-002
 * 
 *      Submit Form
 *      @param {string} form_id absenden
 */
    function submitForm(form_id) {
        document.getElementById(form_id).submit();
    };


//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** Helper H-003
 * 
 *          createAddressDataArray
 *      Array aus Dataobjekt erzeugen
 */
    function createAddressDataArray(queryResult) {
        try {
            // Das Ergebnis wird angenommen und in ein Array von Adressdaten umgewandelt
            const addressDataArray = queryResult[0].rows.map(row => {
                // Jede Zeile des Ergebnisses wird durchlaufen, um die Daten zu extrahieren
                const rowData = {};
                row.columns.forEach((value, index ) => {
                    // Die Werte werden bearbeitet und in das Objekt rowData eingefügt
                    // Eventuelle Leerraumzeichen werden entfernt, falls vorhanden, sonst wird '-' verwendet
                    rowData[index] = value.trim() ?? '-';
                });
                // Die bearbeitete Zeile wird zurückgegeben und zum Array hinzugefügt
                return rowData;
            });
            // Das fertige Array mit Adressdaten wird zurückgegeben
            return addressDataArray;
        } catch (error) {
            // Im Falle eines Fehlers wird eine Fehlermeldung ausgegeben und ein leeres Array zurückgegeben
            logIntoDebug( "createAdressDataArray","<I class='txt--bigRed'>Error:</I> SQL-Ergebnisse konnten nicht in Array geladen werden", Global.LogIntottDB);
            return []; 
        }
    };
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** Helper H-004                                                                                                             Funktion geprüft am: 22.05.24 von Erik                                                                                                            
 * 
 *          logIntoDebug
 *      Eintragen von Logs in das togglebare Logfenster für Livebetrieb
 *      @param {string} caller - Name de Funktion die den Fehler wirft und evt. Kurzbeschreibung
 *      @param {string} msg - Error beschreibung oder SQL-Prompt
 *      @param {string} deExport - Bool: True = an ttWeb.DB weitergeben
 */

    function logIntoDebug(caller, msg, dbExport) {
        if (Global.showDebug) { // Global.showdebug=> ttEditor-config.js
            let window = document.getElementById("debugLog");
            let log = window.innerHTML
            log = log + "<br><br>" + "<strong>" + caller + ":</strong>" + "<br>" + msg;
            window.innerHTML = log;
        } 
        if (dbExport && Global.LogIntottDB) { // Global.LogIntottDB => ttEditor-config.js
            // Erstelle und sende Log an Datenbank
            ttErrorLog(caller, msg);
        }
    }
    function debugWindowClear() { // Log löschen
        document.getElementById("debugLog").innerHTML = `<div class="debugLog--header"><i class="glyph glyph-code"> &nbsp; debugLog &nbsp;</i> <button type="button" onclick="debugWindowClear()"> clear </button></div>`;

    };

    function logsqlIntodebug(caller, query, awnser) {
        if (Global.showDebug) { // Global.showdebug => ttEditor-config.js
            let window = document.getElementById("debugLog");
            let log = window.innerHTML
            let awnserTxt = "";  
            if (awnser === false) {
                awnserTxt = "<I class='txt--red'>Keine Daten in der DB gefunden</I>"
                buildupFail = true;
            } else {
                awnserTxt ="<I class='txt--green'>Daten aus DB empfangen</I>"
            };
            log = log + "<br><br>" + "<strong>" + caller + ":</strong>" + "<br>" + query + "<br>" + awnserTxt;
            window.innerHTML = log;
        };
    }
    
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** Helper H-005                                                                                                             Funktion geprüft am: 22.05.24 von Erik
 * 
 *          HotKeys 
 */ 
   
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** Helper H-006
 * 
 *          lockTab() - disable alle Inputs auf einem Tab
 * 
 *          @param {string} ID des Tabs  
 *          @param {bool} true = disable / false = enable
 */
    function lockTab(tab_id, bool) {
        let allInputs = tab_id.querySelectorAll(':scope > input');
        allInputs.forEach(input => {
            input.disabled = bool ? true:false;
        });
    };
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ################################################################################# Endcard Trigger #############################################################################################
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    function finish() {
        SendBack = convertFormToJson("tabsForm");
        if (Global.debugMode){
            alert("Anruf abgeschlossen. Daten werden übertragen. Call terminiert")
            logIntoDebug("finish", `Call terminiert <br> Submit:<br>${SendBack}`, false)
          
        } else {
            let submitFailed = pushData();
            if (submitFailed === true){
                call("terminate");
                refresh();
            } else {
                // Achtung Achtung Notfall !! Wiiiuuu WIiiiuuu
            } ;
            
        }
    }
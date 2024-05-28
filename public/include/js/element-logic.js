//################################################################################### BUILD / BOOT ######################################################################

/** bootUpAPI - Verbindung zur API aufbauen
 * 
 *      Wir nach dem Aufbau der Seite automatisch aufgerufen
 */
function bootUpAPI() {
    if (!debug) {

        // Initialisierung des Inhalts-Interfaces
        this.parent.contentInterface.initialize(window,
            function onInitialized(contentInterface) {  // Erfolgreiche Initialisierung
                
                ttWeb = contentInterface;               // ttWeb auf das Content-Interface setzen
                gf_initialize();
            },
            function onInitializeError(e) {             // Fehler bei der Initialisierung
                debug && console.log('Initialize contentInterface failed: ' + e.message); 
            }
        );
    } else {  
        buildUp(); // Wenn Debugging aktiviert ist, führe gf_initialize aus
    }
};
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** buildUp -  Laden und anzeigen aller Daten.
 * 
 */
function buildUp() {
    blnFinishPositive = false; // Variable zur Überprüfung, ob der Anruf positiv abgeschlossen wurde

    if (!debug) {
        // Richtung des Anrufs
        calldatatableId = ttWeb.getCalltableField('ID');
        msisdn = ttWeb.getCalltableField('HOME');
        indicator = ttWeb.getIndicator();
        // Telefonkontakt basierend auf dem Indikator festlegen
        if (indicator == 1) {
            telKontakt = ttWeb.getCalltableField('HOME');
        } else if (indicator == 2) {
            telKontakt = ttWeb.getCalltableField('BUSINESS');
        } else {
            telKontakt = ttWeb.getCalltableField('OTHER');
        }
        festnetz = ttWeb.getCalltableField('BUSINESS');
        agentId = ttWeb.getUser().Login;

    } else { // Wenn Debugging aktiviert ist, werden Dummy-Daten gesetzt
        calldatatableId = 79880808;
        msisdn = "01768655885";
        telKontakt = "0190123123";
        agentId = "2008";
    }

    // Wenn Debugging deaktiviert ist und ein Ergebnis vorhanden ist, wird callResultId aktualisiert
    abschlussStatus = pullSQL("result_id");
    if (!debug && abschlussStatus[0].rows[0].length > 0) {
       let callResultId = abschlussStatus.fields.result_id;

        if (callResultId == resultIdPositiv) {
            logIntoDebug("buildUp", "Es wurde ein bereits positiver Datensatz erneut angerufen. Call wurde automatisch termininiert.", LogIntottDB);
            ttWeb.clearRecording();
            ttWeb.terminateCall('100');

        } else if (callResultId == resultIdNegativ) {
            logIntoDebug("buildUp", "Es wurde ein bereits negativer Datensatz erneut angerufen. Call wurde automatisch termininiert.", LogIntottDB);
            ttWeb.clearRecording();
            ttWeb.terminateCall('200');
        }
    };

    let currDate = new Date(); // Wiedervorlagendatum und -zeit auf Standardwerte zurücksetzen
    document.getElementById('wiedervorlage_Date').value = currDate.getDate() + "." + (currDate.getMonth() + 1) + "." + currDate.getFullYear();
    // document.getElementById('wiedervorlage_Time').value = (currDate.getHours() + 1) + ":00";
    document.getElementById('wiedervorlage_Text').value = "";
    document.getElementById('apne_delay').value = "";
    document.getElementById('apne_notiz').value = "";

    if (wiedervorlage) { // Wiedervorlagedaten aus DB laden (abschaltbar über tteditor-config)
        let wievorCount = pullSQL("wiedervorlageCount");
        if (wievorCount[0].rows[0].fields.length > 0) {
            wievorData = pullSQL("wiedervorlageData")[0].rows;
            let wvtext = `Kommende Wiedervorlagen<br />für <b>Agent ${agentId} </b>:<br /><br />`;
            for (let i = 0; i < wievorData.length; i++) wvtext = wvtext + `<div class="data" >${wievorData[i].fields.message}</div>`;
            document.getElementById(wievorElement).innerHTML = wvtext;
        }
    };

    if (showStats) { // Statistikdaten für die Kampagne abrufen und anzeigen (abschaltbar über tteditor-config)
        stats = pullSQL("statistik");
        if (stats[0].rows.length > 0) {
            stats = stats[0].fields;

            quote = stats.UMWANDLUNGSQUOTE;
            nettos = stats.NETTOKONTAKTE;
            if (nettos > 0) {
                $('stats_positive').width = Math.round((stats.POSITIV / nettos) * 200);
                $('stats_unfilled').width = 200 - Math.round((stats.POSITIV / (nettos)) * 200);
            }
            logIntoDebug('Aktuelle Quote', `${stats.POSITIV} Abschlüsse bei ${nettos} Anrufen = ${quote}% `, LogIntottDB);
        }
    };
    
    createCustomerData();  // Laden der Kundendaten und Erstellung der Cards, zur Anzeige dieser 
    autoInject_selects()    // Fülle alle SQLinjectionSelects
    
    logIntoDebug("bulidUp complete", "Alle Daten wurden erfolgreich geladen",false); 
}
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------

/**createCusomerCells
 * 
 *          Diese Funktion erstellt CustomerCells basierend auf den angegebenen Daten.
 *          Sie durchläuft die Daten der DB und füllt die entsprechenden Werte in die CustomerData, bevor sie in die Cells via HTML eingefügt werden.
 */ 
function createCustomerData() {
    try {
        // Hole das Element "customerCells", in dem die Kundeninfo angezeigt werden sollen
        let cardHolder = document.getElementById("customerCells");
        let error_msg = document.getElementById("customerCells_errorMsg");
        let SqlField ;

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
        if (typeof SqlField.keys === 'function' && SqlField.keys("standAlone")) { 
            error_msg.innerHTML =  "Datensatz fehlerhaft";
            error_msg.className = "errormessage--db_error";

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
            for (let i = 0; i < CustomerData.length; i++) {
                let label = CustomerData[i].label; 
                let id = CustomerData[i].match;
                let value = CustomerData[i].value;
                let standAlone = CustomerData[i].standAlone;

                // Füge den Wert dem Zwischenspeicher hinzu, wenn er nicht standAlone ist
                standAlone ? undefined : chache = value;
                // Füge den Zwischenspeicherwert dem aktuellen Wert hinzu, wenn dieser standAlone true ist.
                if (standAlone && chache !== "") value = `${chache} ${value}`, chache = ""; 

                if (standAlone) { // Füge die Cell oder Separator in das HTML ein wenn standAlone true
                    if (id != "seperator") { 
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
            };
        }; 
        logIntoDebug("createCustomerData", "Adressdaten erfolgreich geladen.", false);       
    } catch (error) {
        debug && console.log("Error: => SQL-Ergebnisse konnten nicht in Cells geladen werden");
        debug && console.log(error);
    } 

    // Kundenhistorie laden und anzeigen
    let historyCount =  pullSQL("historyCount");
    let historyBox = document.getElementById('kundenhistorie');
    if (historyCount[0].rows[0].fields.anzahl > 0) {
        let historyData = pullSQL("historyData");   
        historyData = historyData[0];
    
        let kundenhistorie = historyBox.innerHTML;
        for (let i = 0; i < historyData.rows.length; i++) {
            kundenhistorie += `<div class="history">${historyData.rows[i].fields.message}</div>`;
        }
        historyBox.innerHTML = kundenhistorie;
        logIntoDebug("createCostumerData", "Kundenhistorie erfolgreich geladen.", false);  
    } else {
       historyBox.innerHTML = "Keine Historie verfügbar";
       logIntoDebug("createCostumerData", "Keine Kundenhistorie gefunden.", LogIntottDB); 
    };
};

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** PopUp & Debug - Loader / watchdog                                                                                          Funktion geprüft am: 22.05.24 von Erik
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

    // function freedialBtn() {
    //     var blnSuccess = true;
    //     var errMsg = '';

    //     if (document.getElementById('recall_number').value === '') {
    //     blnSuccess = false;
    //     errMsg = 'Bitte Rufnummer eingeben!';
    //     }

    //     if (blnSuccess) {
    //     document.getElementById('lightbox').style.display = 'none';
    //     document.getElementById('negativ').style.display = 'none';
    //     makeRecall();
    //     } else {
    //     alert(errMsg);
    //     }
    //     return false;
    // }

    // function recallBtn() {
    //     if((validateDate($('wiedervorlage_Date').value,'Datum',$('dummyText'),true,2008,2023)) && (validateProductionTime($('wiedervorlage_Time').value,'Zeit',$('dummyText'),true))) {
    //         document.getElementById('lightbox').style.display='none';
    //         document.getElementById('wiedervorlage').style.display='none';
    //         finishCallback();
    //         return false;
    //     } else {
    //         alert($('dummyText').innerHTML);
    //         return false;
    //     }
    // }

    // function apneBtn() {
    //     if(document.getElementById('apne_delay').value!='') {
    //         document.getElementById('lightbox').style.display='none';
    //         document.getElementById('apne').style.display='none';
    //         finishApne();
    //         // TODO: Warum return false?
    //         return false;
    //       }
    //       else  {
    //         alert('Bitte wählen Sie einen Zeitintervall!');
    //         return false;
    //       }
    // }
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
*   
*   @param {Array|string} actionArr -   Ein Array mit Anweisungen zur Steuerung der Elemente oder die ID des auslösenden Gatekeeper-Selects.
*                                       Im Array enthalten sind Anweisungen in folgendem Format: [selectId, switchGrpName, nextFunc].
*                                       Die verfügbaren Aktionen sind: 'open', 'close', 'openOnly' und 'trigger'.
*
*   Nutzt Helper H-001: "executeFunctionFromString"
*
*   syntax:
*   gatekeeper([
*       [thisSelect, switchGrp, alwaysClose],                  << string, string, string          [HEADER]    = Select = null --> Alle Elemente = d-none | data-grp | FolgeFunktion )
*      
*       [value1, close, targetId1],                            << string, string, string          [OPERATION] = Element mit targetId = d-none
*       [value1, open, [targetId1, targetId2, targetId3]],     << string, string, Array[string]   [OPERATION] = Alle Element aus Array = display
*       [value2, openOnly, targetId3],                         << string, string, string          [OPERATION] = Alle Elemente außer targetId = d-noneZ                                                                                  
*       [value3, close, all]                                   << string, string, string          [OPERATION] = Alle Elemente = d-none

*       [value1, trigger, zmsF12]                              << string, string, string          [Operation] = Nutzte diesen Baustein(Variablenname) für Zusammenfassung. 
*       ])    
*/

function gatekeeper(actionArr) { 
    let gateArr;
    let select;
    let switchGrp; 
    let nextFunc; // alwaysClose bool
    
    // Prüfen, ob actionArr ein Array oder eine String-Id ist
    if (Array.isArray(actionArr)) {
        // Wenn actionArr ein Array ist, die relevanten Werte zuweisen
        [select, switchGrp, nextFunc] = [
            document.getElementById(actionArr[0][0]),
            document.querySelectorAll(`[data-group=${actionArr[0][1]}]`),
            actionArr[0][2]
        ];
    } else {
        // Wenn actionArr eine String-Id ist, die Anweisungen aus dem Datenattribut des Selects parsen und zuweisen
        gateArr = actionArr.getAttribute("data-array")
                                        .replace(/oo/g, 'openOnly')
                                        .replace(/\bo\b/g, 'open') 
                                        .replace(/\bc\b/g, 'close') 
                                        .replace(/\ba\b/g, 'all')   
                                        .replace(/\bt\b/g, 'trigger')
                                        .replace(/\.+/g, ',')
                                        .replace(/([^,\[\]]+)/g, '"$1"'); 
        gateArr = stringToArray(gateArr);
                                         //      Mit dem was an die Funtion übereben wird, wird ein Array aufgebaut, 
        [select, switchGrp, nextFunc] = [//     welches alle Anweisungen für die Zustände des jeweilige Select enthält.
            actionArr,
            document.querySelectorAll(`[data-grp=${actionArr.getAttribute("data-group")}]`),
            actionArr.getAttribute("data-call")
        ];
    }   

    // Durchlaufen der Anweisungen im gateArr
    gateArr.forEach(operation => {
        let [value, action, target] = operation; 
        // Überprüfen, ob die aktuelle Select-Option mit dem Wert übereinstimmt
        if (value === select.value) {
            // try {                   // <<<>>> Auftrag für aktuelle Select.value ausführen
                if (action === 'openOnly') {  // wenn openOnly oder alwaysClose --> Gruppe = d-none
                    switchGrp.forEach(element => {
                        element.classList.add('d-none'); 
                    });
                } else if (target === 'all') {        // wenn all --> target = Gruppe
                    switchGrp.forEach(element => 'open' ? element.classList.remove('d-none') : element.classList.add('d-none'));
                };
                
                // Ausführen der entsprechenden Aktion (öffnen oder schließen) für jedes Ziel
                switch (action) {
                    case 'close':
                        (Array.isArray(target) ? target : [target]).forEach(id => {
                            document.getElementById(id).classList.add('d-none');
                        });
                        break;
                
                    case 'open':
                    case 'openOnly':
                        (Array.isArray(target) ? target : [target]).forEach(id => {
                            document.getElementById(id).classList.remove('d-none');
                        });
                        break;
                    
                    case "trigger": // setzte Trigger für übergebene id auf true 
                        (Array.isArray(target) ? target : [target]).forEach(id => {
                            setTrigger(id);
                        });
                        break;
                
                    default:
                        // Fehlermeldung ausgeben, wenn die Aktion nicht erkannt wird
                        logIntoDebug(select.id ,`Error: gatekeeper hat fehlerhafte action: ${action} in ${gateArr}`, LogIntottDB);
                } 
                // Ausführen der Folgefunktion, falls vorhanden
                nextFunc!=null? executeFunctionFromString(nextFunc) : undefined;

                let gateCheck = actionArr.getAttribute("data-gate");
                if (gateCheck != "") {weiterBtn(gateCheck)};

                let lock = actionArr.getAttribute("data-lock");
                if (lock === "lock") {pageLock = true};

            // } catch (error) {
            //     // Fehlermeldung ausgeben
            //    logIntoDebug(select.id,`Error: Gatekeeper wurde fehlerhaft ausgeführt!`, LogIntottDB);
            // };
        };
    });
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
        weiterBtn(validate);
    };
};
//------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** setTrigger                                                                                                              Funktion geprüft am: 22.05.24 von Erik
* 
*      setTrigger ist die Zusatzfunktion vom Gatekeeper-Select. Mit dem Befehl 'trigger' kann eine id auf active = true gesetzt werden.
*      Alle aktiv geschalteten IDs aus der triggerData werden mit der readTrigger-Funktion in ihr jeweiliges ziel geschrieben. 
* 
* @param {*} id - ID des zu schaltenden Eintrags
*/
function setTrigger(id) {
    // Setze mitgebene id in triggerData active = true
    // Setzte alle id der selben Gruppe auf active = false
    for (const trigger of triggerData) {
        if (trigger.id === id) {
            let killGrp = trigger.grp;
            triggerData.forEach((grpMember) => {
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
/** readTrigger                                                                                                             Funktion geprüft am: 22.05.24 von Erik
* 
*      Mit dem Aufruf von readTrigger werden alle bis dahin, in der triggerData, aktiv geschalteten Einträge in ihre jeweiligen Elemente geladen.
*      Diese Funktion ist dafür vorgesehen die Zusammenfassung, in Bezug auf die ausgewählten Optionen zusammen zu stellen.
*      Es können auch Variablennamen genutzt werden, dessen Inhalt dann genutzt wird. 
*/
function readTrigger() {
    let insert = "";
    let cache = new Set();
    triggerData.forEach((list) => {
            // durchlaufe triggerData 
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
function switchTab(newPageName) { 
    // Überprüfen, ob der neue Tab gültig ist
    if (currentPageName != newPageName){
            let lockedBool;
            switch (currentPageName) {
                case "tab_product":
                    if (pageLock === true) {
                        lockedBool = bundleInputs(currentPageName);  
                    } else {
                        lockedBool = true;
                    };
                    break;

                default:
                    lockedBool = true;
            }
            if(lockedBool === true){

            // Aktuellen Tabnamen aktualisieren
            let currentPage = document.getElementById(newPageName);
            let oldPage = document.getElementById(currentPageName);
            currentPageName = newPageName;
            
            oldPage.className = "page_content d-none";
            currentPage.className = "page_content";


            // Wenn der neue Tab bereits sichtbar ist, nichts tun
            if (!document.getElementById(newPageName).classname === ("page_content d-none")) {
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
                if (newPageName !== 'tab_start'){
                    document.getElementById(elementId).className = "go d-none";
                    weiterBtn(newPageName);
                } else {
                    document.getElementById(elementId).className = "go";
                    document.getElementById('weiterBtn').className = "left_right go d-none";
                }
            });
            
            if (newPageName === 'tab_zusammenfassung') {
                document.getElementById('weiterBtn').className = "left_right go d-none";
                createEndcard();
            }   
        }
    }
};
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ Buttons & Weiterleitungen +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Validierung der Seite aufrufen und wenn bestanden Button einfügen 


function weiterBtn(page_id) {
    let successBool = silent(document.getElementById(page_id));
    let weiterBtn = document.getElementById('weiterBtn');
    if (successBool == true) {
        weiterBtn.className = "left_right go";
    } else {
        weiterBtn.className = "left_right go d-none";
    }
}

function  createEndcard() {
    document.getElementById('weiterBtn').className = "left_right go d-none";
    readTrigger();

    // TODO: hier API-abfrage nach Aufnahmestatus
    let RecState = 2;
    // Austauschen sobald verfügbar

    if(RecState === 2){

    }
};


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
        logIntoDebug( "executeFunctionFromString:",`Aufgerufene Funktion ${funcName} existiert nicht.`, LogIntottDB); //Error_msg
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
            logIntoDebug( "createAdressDataArray","Error: SQL-Ergebnisse konnten nicht in Array geladen werden", LogIntottDB);
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
        if (showDebug) { // showDebug => ttEditor-config.js
            let window = document.getElementById("debugLog");
            let log = window.innerHTML
            log = log + "<br><br>" + "<strong>" + caller + ":</strong>" + "<br>" + msg;
            window.innerHTML = log;
        } 
        if (dbExport && LogIntottDB) { // LogIntottDB => ttEditor-config.js
            // Erstelle und sende Log an Datenbank
            ttErrorLog(caller, msg);
        }
    }
    function debugWindowClear() { // Log löschen
        document.getElementById("debugLog").innerHTML = `<button type="button" onclick="debugWindowClear()">clear</button>`;
    };

    function logsqlIntoDebug(caller, query, awnser) {
        if (showDebug) { // showDebug => ttEditor-config.js
            let window = document.getElementById("debugLog");
            let log = window.innerHTML
            let awnserTxt = awnser ? "<I class='txt--red'>Keine Daten in der DB gefunden</I>" : "<I class='txt--green'>Daten aus DB empfangen</I>"
            log = log + "<br><br>" + "<strong>" + caller + ":</strong>" + "<br>" + query + "<br>" + awnserTxt;
            window.innerHTML = log;
        };
    }
    
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** Helper H-005                                                                                                             Funktion geprüft am: 22.05.24 von Erik
 * 
 *          HotKeys 
 */
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

    function keyDown (event) {
    // Wenn die Taste [Zirkumflex] gedrückt wird
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

        // Überprüfe, ob beide Tasten gleichzeitig gedrückt wurden
        if (keyCode1Pressed && keyCode2Pressed) {
            // Ändere die Sichtbarkeit des Debug-Logs
            document.getElementById("debugLog").classList.toggle("d-none");
            console.log("Debuglog geöffnet!");
        }
        // Überprüfe, ob die zweite und dritte Taste gleichzeitig gedrückt wurden
        if (keyCode2Pressed && keyCode3Pressed) {
            // Setze den Inhalt des Debug-Logs zurück
            document.getElementById("debugLog").innerHTML = `<button type="button" onclick="debugWindowClear()">clear</button>`;
        } 
    };
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
function stringToArray(stringArr) {
   let newArr = JSON.parse(stringArr);
    newArr.forEach(entry => {
        if (entry.length > 3) {
            entry[2] = [entry.slice(3)];
            entry.length = 3;
        }              
    });   
    return newArr;
}
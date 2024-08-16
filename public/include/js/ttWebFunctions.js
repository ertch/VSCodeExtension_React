//################################################################################### BUILD / BOOT ######################################################################
/** bootUpAPI - Verbindung zur API aufbauen
 * 
 *      Wir nach dem Aufbau der Seite automatisch aufgerufen ()
 */

    function bootUpAPI() {
        if (Global.debugMode) {
            buildUp();
        } else {
            try { // Initialisierung des Inhalts-Interfaces 
                // Bei stehender Verbindung wird "ttWeb" ein API-Objekt/Interface
                this.parent.contentInterface.initialize(window,
                    function onInitialized(contentInterface) {  
                        ttWeb = contentInterface;          
                        buildUp();
                        call_initialize();
                        return;              
                    },
                );
            } catch(error) {
                console.log(error);
            };
        }
    };
   
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** buildUp -  Laden und anzeigen aller Daten.
 * 
 */
function buildUp() {

    blnFinishPositive = false; // Variable zur Überprüfung, ob der Anruf positiv abgeschlossen wurde
        // Abruf der notwendigen Daten aus der API
    try {
        clientIP = ttWeb.getClientIP();
        let calltableData = ttWeb.getCalltable();
        Global.key2 = ttWeb.getCalltableField('ID');
        msisdn = calltableData.HOME;
        inicator = calltableData.INDICATOR;
        

        Global.agentId = ttWeb.getUser().Login;
		calljob = ttWeb.getActiveCallJob();
		calledNumber = calljob.TargetAddress;

        if(clientIP === null || Global.key2 === null || msisdn === null)  {
            buildupFail = true;
        }
        
    } catch(error){
        if (Global.debugMode) {  // Wenn Global.debugModeging aktiviert ist, werden Dummy-Daten gesetzt
            Global.key2 = Global.debugdataTableId;
            msisdn = "01768655885";
            telKontakt = "0190123123";
            agentId = "2008";
        } else {
            logIntoDebug("buildUp()", "Calldatatable konnte nicht geladen werden", false)
        }
    }
    // Wenn Global.debugModeging deaktiviert ist und ein Ergebnis vorhanden ist, wird callResultId aktualisiert
    if (buildupFail){
        corruptedDB = executeSql(`SELECT COUNT(*) From ${Global.key2} WHERE ${Global.key2}.id = ${Global.key2} LIMIT 1`);
        if (corruptedDB < 1 ) {
            logIntoDebug("buildUp", "Es wurde ein fehlerhafter Datensatz erneut angerufen. Call wurde automatisch termininiert.", Global.LogIntottDB);
            record('clear');
            // ttWeb.terminateCall('200');
        
        } 
    }

    let abschlussStatus = pullSQL("result_id");
        try {
            if (abschlussStatus[0].rows.length > 0) {
                let termCode;
                switch (abschlussStatus[0].rows[0].fields.result_id) {
        
                    case Result.postive:
                        logIntoDebug("buildUp", "Es wurde ein bereits positiver Datensatz erneut angerufen. Call wurde automatisch termininiert.", Global.LogIntottDB);
                        termCode = '100';
                        break;
        
                    case Result.negative:
                        logIntoDebug("buildUp", "Es wurde ein bereits negativer Datensatz erneut angerufen. Call wurde automatisch termininiert.", Global.LogIntottDB);
                        termCode = '200';
                        break;
                    
                    default:
                        termCode = '0'
                }
                if (termCode != 0 && !Global.debugMode) {
                    record('clear');
                    alert("resultid 0");
                    // ttWeb.terminateCall(termCode);
                } 
            }
        } catch (error) {
        
        }
    let wievofail = false; 
    if (Global.wiedervorlage) { // Wiedervorlagedaten aus DB laden (abschaltbar über tteditor-config)
        try {
            let wievorData = pullSQL("wiedervorlageData");
            wievorData = wievorData[0].rows;
            if (wievorData.length > 0) {
                let wvtext = `Kommende Wiedervorlagen<br />für <b>Agent ${agentId} </b>:<br /><br />`;
                for (let i = 0; i < wievorData.length; i++) wvtext = wvtext + `<div class="data" >${wievorData[i].fields.message}</div>`;
                document.getElementById(Global.wievorElement).innerHTML += wvtext;
            }
        } catch (error) {
           wievofail = true;
        }
    };
 
    createCustomerCells();  // Laden der Kundendaten und Erstellung der Cards, zur Anzeige dieser 
    autoInject_selects();  // Fülle alle SQLinjectionSelects
    loadProviderPreset();  // Prüfe ob es Elemente gibt, welche ein Preset laden sollen und füge diese ein
    TriggerData = triggerPattern();
    readTrigger();
    Global.debugMode? undefined : ttWeb.setRecordingState(Global.startCallwithState);

    let theLine = " <br>-----------------------------------------------------------------------------------------------------------------------------------------------------------------";
    buildupFail? logIntoDebug("bulidUp unvollständig", `Fehler im Ladevorgang ${theLine}`,false) : logIntoDebug("bulidUp complete", `Alle Daten wurden erfolgreich geladen ${theLine}`,false);
    wievofail?  logIntoDebug('buildUp Error', `Wiedervorlagedaten konnten nicht geladen werden <br> Ladevorhgng wird übersprungen ${theLine}`, false): undefined;
}
//#############################################################################################################################################################################
//---------------------------------------------------------------------------- Anrufe / Calls -------------------------------------------------------------------------------------
//#############################################################################################################################################################################


function terminateCall(terminationCode){
    if(!Global.debugMode) {
        ttWeb.terminateCall(terminationCode);
    } else { 
        alert("Call terminiert mit Code: " + terminationCode)
    }
}

function saveRecording(recordFileName) {
    setRecordName();
    if(!Global.debugMode) {
        ttWeb.saveRecording(recordFileName);
    } else { 
        alert("Save Audiofile: " + recordFileName)
    }
}

/** call_initialize - refresh my phone
  *     
  *      Alle notwenigen Variablen zurücksetzten, für einen neuen Anruf.
  */
    function call_initialize() {
        try{
            ttWeb.setRecordingState(Global.startCallwithState);                      // Setze den Aufzeichnungsstatus auf 0 (deaktiviert)
            direction = ttWeb.getCallDirection();         // TODO Bestimme die Richtung des Anrufs (eingehend, ausgehend oder intern)
           

            logIntoDebug("call_initialize()", `<span class='txt--orange'>Recording</span> gerstartet in State ${Global.startCallwithState}` , false);
        }catch(error) {
            logIntoDebug("call_initialize()", `<span class='txt--bigRed'>Error:</span> <span class='txt--orange'>Calltable</span> konnte nicht refreshed werden<br>=> ${error.stack}`, false);
        }
    };
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** call_freedial - got a new number
 * 
 *      Wenn der Kunde unter einer anderen Nummer kontaktiert werden möchte.
 *      Eingabe über den Freedial-Dialog.
 */
    function callFreedial() {
        try {
            let newNumber = document.getElementById('freedial_number');
            
            if (validateRufnummer('tel', newNumber.id, true)) { //TODO: validateRufnummer austauschen

                logIntoDebug("ttWEB", `setCalltable('Other', ${newNumber.value})`, false)
                Global.debugMode?  undefined : ttWeb.setCalltableField('OTHER', newNumber.value); //Rufnummer abspeichern

                logIntoDebug("ttWEB", `setCallState: ${Global.startCallwithState}`, false)
                Global.debugMode? undefined : ttWeb.setIndicator(Global.startCallwithState);   // Callstate zurücksetzten

                Global.onNegDeleteRec===true? record('clear') : undefined; // Aufnahme löschen wenn gewollt

                // ---- submit ---- 
                
                logIntoDebug("ttWEB", "Call terminiert ('RR', null, null, 1)", false)

                //TODO: Abschluss von ttFrame aus steuern
                alert("here comes the end");
                Global.debugMode? undefined : ttWeb.terminateCall('RR', null, null, 1); // Anruf terminieren oder ander nummer anrufen.
                alert("das wars schon");

                record('clear');
			    ttWeb.makeCustomerCall(newNumber.value);

                logIntoDebug( "callFreedial",`Neue Nummer: <span class="txt--gray">${newNumber.value}</span> gespeichert`,false);


            } else {
                logIntoDebug( "callFreedial",`<span class='txt--bigRed'>Error:</span> Nummer: <span class="txt--gray">${newNumber.value}</span> vom Validator abgelehnt`,false);
            }
        } catch(error) {
            Global.debugMode? alert("Neue Telefon Nummer gespeichert." <br> "Fall abgeschlossen") : alert("Das hat leider nicht funktioniert." <br> "Bitte schließen Sie den Fall unter APNE ab");
            logIntoDebug( "callFreedial",`<span class='txt--bigRed'>Error:</span> Nummer: <span class="txt--gray">${newNumber.value}</span> kommte nicht gespeichert werden`,false);
        };
    }
    // Wenn Rufnummer valide speichere neue Nummer
        
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------

//#############################################################################################################################################################################
//---------------------------------------------------------------------------- Recordings -------------------------------------------------------------------------------------
//#############################################################################################################################################################################

    function recordBtn(state, int, target) {
        const intConverted = parseInt(int, 10);

        if (isNaN(intConverted)) {
            logIntoDebug(`recordBtn ${target.id}`,`Fehler: ${int} ist kein gültiger CallState.`);
            Global.debugMode&&alert(`Fehler bei RecordBtn: ${int} ist kein gültiger CallState.`)
            return;
        } else {
            record(state, int);
            target.classList.add('d-none');
        }
    }

/** record() - Sprachaufnahmesteuerung
 * 
 *      Sammelfunktion für alle recordings-states.
 * 
 *      @param {*} state 
 *                 start   = Starten der Aufnahme in beide Richtungen
 *                 stop    = Stoppen der Aufnahme 
 *                 save    = Speichern der Aufnahme
 *                 clear   = Verwerfen der Aufnahme 
 */
    function record(state, recState) {
        switch (state) {
            // Wenn der Zustand 'start' ist, wird die Aufnahme (agent & customer) gestartet 
            case 'start':
               Global.debugMode? Global.directionState = recState : ttWeb.setRecordingState(recState); //TODO
                logIntoDebug( "record(start)",`Aufnahme wurde gestartet / state: ${recState}`,false);
                break;

            // Wenn der Zustand 'stop' ist, wird die Aufnahme gestoppt (und die Sprachaufzeichnung wird ggf. gespeichert?) 
            case 'stop':
                setRecordName('pattern');
                if (Global.recordFileName != "") {
                    pushSQL(update_rec_info);
                    pushSQL(save_rec_path);
                    logIntoDebug("record(stop)",`Aufnahme wurde gestoppt <br>Gespeichert als: <span class="txt-blue">${Global.recordFileName}</span>`, false);
                } else {
                    logIntoDebug("record(stop)",`<span class="txt-red">Error:</span> Kein Global.recordFileName angegeben.`,Global.LogIntottDB);
                }
                break;

            // Wenn der Zustand 'save' ist, wird die Aufnahme gespeichert und eine Fehlermeldung wird protokolliert, wenn kein Dateiname angegeben wurde.
            case 'save':
                setRecordName('pattern');
                if (Global.recordFileName != "") {
                    Global.debugMode? undefined : ttWeb.saveRecording(Global.recordFileName);
                    logIntoDebug("record(save)",`Aufnahme wurde gestoppt <br>Gespeichert als: <span class="txt-blue">${Global.recordFileName}</span>`, false);
                } else {
                    logIntoDebug("record(save)",`<span class="txt-red">Error:</span> Kein Global.recordFileName angegeben.`,Global.LogIntottDB);
                }
                break;

            // Wenn der Zustand 'clear' ist, wird die Aufnahme gelöscht.
            case 'clear':   
                Global.debugMode? console.log("Aufnahme verworfen") : ttWeb.clearRecording();
                logIntoDebug("record(clear)", "Aufnahme wurde verworfen", false);
                break;

            default: //Error_msg
                logIntoDebug(`record(${state})`, `<span class="txt-red">Error:</span> invalider state`, Global.LogIntottDB);
        }  
    }
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------

/** setRecordName() - file name generator                                                                                      Funktion geprüft am: 23.05.24 von Erik
 * 
 *      Generiert einen Namen für die Aufnahme. Hierbei kann entweder das in der tteditor-config.js definierte pattern, ein mitgegebener Wert oder eine UUID
 *      für die Benennung genutzt werden. Was genutzt werden soll wird über 'style' angegeben. 
 * 
 *      "pattern" = nutzte pattern aus tteditor-config
 *      "use"     = nutzte String aus useName 
 *      *any      = nutze UUID 
 * 
 * @param {*} style 
 * @param {*} useName 
 */

    function setRecordName(style, useName) {
        let FileNamePattern = Global.FileNamePattern;
        let recordName = "";
        if(style === "pattern") {
            FileNamePattern.forEach((getInfo, index) => {
                let matchfound = false;
                try { // Suche in CustomerPattern 
                    CustomerPattern.some((entry) => {
                        if (entry.match === getInfo) {
                            recordName += entry.value;
                            matchfound = true;
                        } 
                    }); // wenn nicht gefunden, versuche Variable aufzurufen
                    if (!matchfound) {
                       recordName += specialNames(getInfo);
                    }
                } catch (error) {
                        // wenn gar nichts geht, nutzte String (von getInfo)
                    recordName += getInfo.toString();
                }
                if (index != FileNamePattern.length - 1) recordName += '_'; // Trenner einbauen
            });
            recordName += `${Global.recordingNameSuffix}`;

        } else if (style === "use"){ // nutze mitgegebenen Namen
            recordName += `${useName}${recordingNameSuffix}`;

        } else { // Generiere einen Namen mit hashwert (weil UUID nicht in ttFrame funktioniert)
            let UUID = generateUUID();
            recordName = `agent${agentId}_${gettime()}_to${Global.key2}_${UUID}${Global.recordingNameSuffix}`;
        }
        Global.recordFileName = recordName;
        logIntoDebug("setRecordingName", `RecordFileName = ${Global.recordFileName}`, false);    
    };

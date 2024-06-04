//################################################################################### BUILD / BOOT ######################################################################

/** bootUpAPI - Verbindung zur API aufbauen
 * 
 *      Wir nach dem Aufbau der Seite automatisch aufgerufen
 */
function bootUpAPI() {
    if (!debug) {
        logIntoDebug("bootUpAPI", "Starte initialisierung ttWeb" , false);
        // Initialisierung des Inhalts-Interfaces
        this.parent.contentInterface.initialize(window,
            function onInitialized(contentInterface) {  // Erfolgreiche Initialisierung
                
                ttWeb = contentInterface;               // ttWeb auf das Content-Interface setzen

                buildUp();
                call_initialize()
                //TODO: recordAutoStart()
                logIntoDebug("<span class='txt--bigGreen'>:Initialisierung erfolgreich</span>", "" , false);
            },
            function onInitializeError(e) {             // Fehler bei der Initialisierung
                logIntoDebug("bootUpAPI", `<span class='txt--bigRed'>Error:</span> Initialisierung fehlgeschlagen:<br>=${e}` , false);
            }
        );
    } else {
        logIntoDebug("bootUpDebug", "Debug: <span class='txt--blue'>true</span> => Initialisierung für Debug-Modus gestartet<br> <span class='txt--red'>Überspringe</span> recordAutoStart()<br> <span class='txt--red'>Überspringe</span> call_initialize()<br>Verbinde zu <span class='txt--blue'>http://admin/outbound.dbconnector/index.php</span>" , false);
        buildUp(); 
    };
} 
   
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** buildUp -  Laden und anzeigen aller Daten.
 * 
 */
function buildUp() {
    blnFinishPositive = false; // Variable zur Überprüfung, ob der Anruf positiv abgeschlossen wurde

    if (!debug) {
        // Abruf der notwendigen Daten aus der API
        clientIP = ttWeb.getClientIP();
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
    autoInject_selects();  // Fülle alle SQLinjectionSelects
    loadProviderPreset();  // Prüfe ob es Elemente gibt, welche ein Preset laden sollen und füge diese ein
    console.log(buildupFail)
    buildupFail? logIntoDebug("bulidUp unvollständig", "Fehler im Ladevorgang",false) : logIntoDebug("bulidUp complete", "Alle Daten wurden erfolgreich geladen",false); 
}
//#############################################################################################################################################################################
//---------------------------------------------------------------------------- Anrufe / Calls -------------------------------------------------------------------------------------
//#############################################################################################################################################################################

/** call_initialize - refresh my phone
  *     
  *      Alle notwenigen Variablen zurücksetzten, für einen neuen Anruf.
  */
    function call_initialize() {
        try{
            ttWeb.setRecordingState(0);                      // Setze den Aufzeichnungsstatus auf 0 (deaktiviert)
            direction = ttWeb.getCallDirection();            // Bestimme die Richtung des Anrufs (eingehend, ausgehend oder intern)
            calldatatableId = ttWeb.getCalltableField('ID'); // Bestimme die ID des Anrufdatensatzes in der Datenbank
            msisdn = ttWeb.getCalltableField('HOME');        // Bestimme die MSISDN (Mobilfunknummer) des Anrufers oder Angerufenen
            indicator = ttWeb.getIndicator();                // Bestimme den Indikator für die Art des Anrufs (1-9)

            // Bestimme die Telefonnummer des Kontakts basierend auf dem Indikator
            if (indicator == 1) {
                telKontakt = ttWeb.getCalltableField('HOME');       // Privatnummer
            } else if (indicator == 2) {
                telKontakt = ttWeb.getCalltableField('BUSINESS');   // Geschäftsnummer
            } else {
                telKontakt = ttWeb.getCalltableField('OTHER');      // Andere Nummer
            };

            festnetz = ttWeb.getCalltableField('BUSINESS'); // Festnetznummer wird immer als Geschäftsnummer beschrieben?
            agentId = ttWeb.getUser().Login; // Bestimme die Agenten-ID des Benutzers

            logIntoDebug("call_initialize()", "<span class='txt--orange'>Calltable</span> erfolgreich refreshed", false);
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
            let freedial = document.getElementById('freedial_number');
            if (validateRufnummer(freedial.value, errMsg)) { //TODO: validateRufnummer austauschen
                debug? undefined : ttWeb.setCalltableField('OTHER', freedial.value);
                debug? undefined : ttWeb.setIndicator(3);
                record('clear');
                debug? undefined : ttWeb.terminateCall('RR', null, null, 1);
                logIntoDebug( "callFreedial",`Neue Nummer: <span class="txt--gray">${freedial.value}</span> gespeichert`,false);
            } else {
                logIntoDebug( "callFreedial",`<span class='txt--bigRed'>Error:</span> Nummer: <span class="txt--gray">${freedial.value}</span> vom Validator abgelehnt`,false);
            }
        } catch(error) {
            logIntoDebug( "callFreedial",`<span class='txt--bigRed'>Error:</span> Nummer: <span class="txt--gray">${freedial.value}</span> kommte nicht gespeichert werden`,false);
        };
    }
    // Wenn Rufnummer valide speichere neue Nummer
        
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------

//#############################################################################################################################################################################
//---------------------------------------------------------------------------- Recordings -------------------------------------------------------------------------------------
//#############################################################################################################################################################################

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
               debug? debugDirectionState = recState : ttWeb.setRecordingState(recState);
                logIntoDebug( "record(start)",`Aufnahme wurde gestartet / state: ${recState}`,false);
                break;

            // Wenn der Zustand 'stop' ist, wird die Aufnahme gestoppt (und die Sprachaufzeichnung wird ggf. gespeichert?) 
            case 'stop':
                setRecordName(pattern);
                if (recordFileName != "") {
                    pushSQL(update_rec_info);
                    pushSQL(save_rec_path);
                    logIntoDebug("record(stop)",`Aufnahme wurde gestoppt <br>Gespeichert als: <span class="txt-blue">${recordFileName}</span>`, false);
                } else {
                    logIntoDebug("record(stop)",`<span class="txt-red">Error:</span> Kein RecordFileName angegeben.`,LogIntottDB);
                }
                break;

            // Wenn der Zustand 'save' ist, wird die Aufnahme gespeichert und eine Fehlermeldung wird protokolliert, wenn kein Dateiname angegeben wurde.
            case 'save':
                setRecordName(pattern);
                if (recordFileName != "") {
                    debug? undefined : ttWeb.saveRecording(recordFileName);
                    logIntoDebug("record(save)",`Aufnahme wurde gestoppt <br>Gespeichert als: <span class="txt-blue">${recordFileName}</span>`, false);
                } else {
                    logIntoDebug("record(save)",`<span class="txt-red">Error:</span> Kein RecordFileName angegeben.`,LogIntottDB);
                }
                break;

            // Wenn der Zustand 'clear' ist, wird die Aufnahme gelöscht.
            case 'clear':   
                debug? undefined : ttWeb.clearRecording();
                logIntoDebug("record(clear)", "Aufnahme wurde verworfen", false);
                break;

            default: //Error_msg
                logIntoDebug(`record(${state})`, `<span class="txt-red">Error:</span> invalider state`, LogIntottDB);
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
        let recordName = "";
        let date = getdate();
        let time = gettime();
        if(style === "pattern") {
            FileNamePattern.forEach((getInfo, index) => {
                let matchfound = false;
                try { // Suche in CustomerData 
                    CustomerData.some((entry) => {
                        if (entry.match === getInfo) {
                            recordName += entry.value;
                            matchfound = true;
                        } 
                    }); // wenn nicht gefunden, versuche Variable aufzurufen
                    if (!matchfound) {
                        recordName += eval(getInfo);
                    }
                } catch (error) {
                        // wenn gar nichts geht, nutzte String (von getInfo)
                    recordName += getInfo.toString();
                }
                if (index != FileNamePattern.length - 1) recordName += '_'; // Trenner einbauen
            });
            recordName += `${recordingNameSuffix}`;

        } else if (style === "use"){ // nutze mitgegebenen Namen
            recordName += `${useName}${recordingNameSuffix}`;

        } else { // Generiere einen Namen [datum + hashwert] 
            recordName = `${agentId}_${$crypto.randomUUID()}${recordingNameSuffix}`;
        }
        recordFileName = recordName;
        logIntoDebug("setRecordingName", `RecordFileName = ${recordFileName}`, false);    
    };
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** Helper H-SQL-003
 * 
 *      Teilen des Pfades an den Backslashes
 */
    function splitRecName() {
        let voicefileName = setRecordName();
        return teile = voicefileName.split("\\");
    };
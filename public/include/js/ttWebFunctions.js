//#############################################################################################################################################################################
//---------------------------------------------------------------------------- Anrufe / Calls -------------------------------------------------------------------------------------
//#############################################################################################################################################################################

/** call_initialize - refresh my phone
  *     
  *      Alle notwenigen Variablen zurücksetzten, für einen neuen Anruf.
  */
    function call_initialize() {
                
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

        logIntoDebug("call_initialize()", "calltable successfully refreshed", false) //Debug
    };
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** call_freedial - got a new number
 * 
 *      Wenn der Kunde unter einer anderen Nummer kontaktiert werden möchte.
 *      Eingabe über den Freedial-Dialog.
 */
    function call_freedial() {
        
        // Wenn Rufnummer valide speichere neue Nummer
        let freedial = document.getElementById('freedial_number');
        if (validateRufnummer(freedial.value, errMsg)) {
            ttWeb.setCalltableField('OTHER', freedial.value);
            ttWeb.setIndicator(3);
            record('clear');
            ttWeb.terminateCall('RR', null, null, 1);
        }
    };
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
    function record(state) {
        switch (state) {
            // Wenn der Zustand 'start' ist, wird die Aufnahme (agent & customer) gestartet 
            case 'start':
                ttWeb.setRecordingState(3);
                logIntoDebug( "record(start)","Aufnahme wurde gestartet / state: 3",false);
                break;

            // Wenn der Zustand 'stop' ist, wird die Aufnahme gestoppt (und die Sprachaufzeichnung wird ggf. gespeichert?) 
            case 'stop':
                setRecordName(pattern);
                if (recordFileName != "") {
                    pushSQL(update_rec_info);
                    pushSQL(save_rec_path);
                    logIntoDebug("record(stop)","Aufnahme wurde gestoppt", false);
                } else {
                    logIntoDebug("record(stop)","Error: Kein RecordFileName angegeben.",LogIntottDB);
                }
                break;

            // Wenn der Zustand 'save' ist, wird die Aufnahme gespeichert und eine Fehlermeldung wird protokolliert, wenn kein Dateiname angegeben wurde.
            case 'save':
                setRecordName(pattern);
                if (recordFileName != "") {
                    ttWeb.saveRecording(recordFileName);
                } else {
                    logIntoDebug("record(save)","Error: Kein RecordFileName angegeben.",LogIntottDB);
                }
                break;

            // Wenn der Zustand 'clear' ist, wird die Aufnahme gelöscht.
            case 'clear':
                logIntoDebug("record(clear)", "Aufnahme wurde verworfen", false);
                ttWeb.clearRecording();
                break;

            default: //Error_msg
                logIntoDebug(`record(${state}), Error: invalider state`, LogIntottDB);
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
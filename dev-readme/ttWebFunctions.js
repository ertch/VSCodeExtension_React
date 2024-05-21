/** call_initialize 
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
}


/** call_freedial
 * 
 *      Wenn der Kunde unter einer anderen Nummer kontaktiert werden möchte.
 *      Aufruf über den Freedial-Dialog.
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
}



//------------------------------------------------------------------ Recordings -------------------------------------------------------------------------------------
/** record()
 * 
 *      Sammelfunktion für alle recordings states.
 * 
 * @param {*} state 
 *              start   = Starten der Aufnahme in beide Richtungen
 *              stop    = Stoppen der Aufnahme 
 *              save    = Speichern der Aufnahme
 *              clear   = Verwerfen der Aufnahme 
 *                         
 * @param {*} voicefileName 
 */
function record(state) {
    switch (state) {
         // Wenn der Zustand 'start' ist, wird die Aufnahme (agent & customer) gestartet 
        case 'start':
            ttWeb.setRecordingState(3);
            logIntoDebug( "record(start)","recording was started with state: 3",false);
            break;

        // Wenn der Zustand 'stop' ist, wird die Aufnahme gestoppt und die Sprachaufzeichnung wird ggf. gespeichert 
        case 'stop':
            
            if (voicefileName) {
                stopVoiceRecording(voicefileName);
                logIntoDebug("record(stop)","recording was stopped", false);
            } else {
                logIntoDebug("record(stop)","Error: Kein voicefileName angegeben.",true);
            }
            break;

        // Wenn der Zustand 'save' ist, wird die Aufnahme gespeichert und eine Fehlermeldung wird protokolliert, wenn kein Dateiname angegeben wurde.
        case 'save':
            debug && console.log("record: saved");
            if (voicefileName) {
                ttWeb.saveRecording(voicefileName);
            } else {
                logIntoDebug("record(save)","Error: Kein voicefileName angegeben.",true);
            }
            break;

        // Wenn der Zustand 'clear' ist, wird die Aufnahme gelöscht.
        case 'clear':
            logIntoDebug("record(clear)", "record successfully cleared", false);
            ttWeb.clearRecording();
            break;

        default: //Error_msg
            logIntoDebug(`record(${state}), Error: invalider state`, true);
    }   
}
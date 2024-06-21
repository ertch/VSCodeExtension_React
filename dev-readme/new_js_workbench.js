/**######################################################################################################################################################################
* 
*       INHALTSVERZEICHNIS
*
*       Global Var          [ globale Variablen ]
*       Campaign Var        [ Kanpagnen bezogene Variablen ]
*       ttFrame Controls    [ Calls ]
*       ttFrame LOGs        [ Erstellen der Promts ]
*       ttFrame SQL         [ DB-kommunikation ]
*       Navigations         [ Tabs, Buttons ]
*       Gatekeeper          [ Gatekeeper - Select to Action ]
*       Validators          [ Validatoren (manuell) ]
*       Bundle-Validators   [ Validatoren (automatisch) ]
*       Extern Validators   [ Validatoren (Sonderfälle) ]
*       Helper              [ Extra Functions ]
*/

const { renderUniqueStylesheet } = require("astro/runtime/server/index.js");

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ Global Var +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

let blnRecord=false;            // 
let blnFinishPositive=false;    // Bool, ob der Vorgang positiv abgespeichert werden kann
let currentTabName="tab_start"; // Set tab_start als Starttab

let calldatatableId;            // ID des Kampagnien-CallTable
let CustomerData;               // Array des Kampagnien-Table bzw. Kundendaten  / pattern => provider_lib.js
let agentId;                    // ID des Agenten

let ttWeb = new Object();       // Objekt für ttFrame-API
let recordingName;              // Name des Recordings

let keyCode1Pressed = false;    // Status des ersten Hotkey (Zirkumflex)
let keyCode2Pressed = false;    // Status des zweiten Hotkey (Strg)
let keyCode3Pressed = false;    // Status des dritten  (C)

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ Campaign Var ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

let campaignId = 679;

let recordingPrefix = "\\\\192.168.11.14\\Voicefiles_Phoenix\\VF_Diverse\\ste_wel\\";
let addressdatatable = 'ste_wel_addressdata';
let salesdatatable = 'ste_wel_addressdata';

let resultIdPositiv =   8911;
let resultIdNegativ =   8912;
let resultIdWv =        8913;
let resultIdAbfax =     8915;

let resultIdApne0h =    8916;
let resultIdApne1h =    8917;
let resultIdApne2h =    8918;
let resultIdApne3h =    8919;
let resultIdApne4h =    8920;
let resultIdApne5h =    8921;
let resultIdApne6h =    8922;
let resultIdApne8h =    8923;
let resultIdApne20h =   8924;

//################################################################################### ttFrame Controls #############################################################################################
/**
 *  - Boot
 *  - Erstellung der Info Cards
 *  - Calls
 *  - Call Terminator
 *  - Recordings
 */

//--------------------------------------------------------------------------------------- Boot -------------------------------------------------------------------------
/** gf_javaf_initialize - Verbindung zur API aufbauen
 * 
 */
function gf_javaf_initialize() {
    console.log("gf_javaf_initialize") 
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
        gf_initialize(); // Wenn Debugging aktiviert ist, führe gf_initialize aus
    }
}

/** gf_initialize - Aufbau aller Verbindungen und get aller Daten.
 * 
 */
    function gf_initialize() {
        debug && console.log("gf_initialize") // Konsolenausgabe zur Analyse des Skriptverlaufs

        blnFinishPositive = false; // Variable zur Überprüfung, ob der Anruf positiv abgeschlossen wurde

        // Wenn Debugging deaktiviert ist, werden Daten aus dem Content-Interface abgerufen
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

        // Information zum angerufenen Datensatz in das Log einfügen
        insertIntoLog("info", "Datensatz wurde Tel. " + telKontakt + " angerufen (Msisdn: " + msisdn + ")", "");
        debug && console.log("insertIntoLog was executed");

        callResultId = 0;
        var query = "SELECT result_id FROM calldatatable where id=" + calldatatableId + " LIMIT 1";
        resultat = executeSql(query);

        // Wenn Debugging deaktiviert ist und ein Ergebnis vorhanden ist, wird callResultId aktualisiert
        if (!debug && resultat[0].rows.length > 0)
            callResultId = resultat[0].rows[0].fields.result_id;

        // Überprüfung, ob der Datensatz bereits positiv oder negativ abgeschlossen wurde
        if (!debug) {
            if ((callResultId == resultIdPositiv)) {
                insertIntoLog("fatal", "Es wurde ein bereits positiver Datensatz erneut angerufen. Call wurde automatisch termininiert.","");
                ttWeb.clearRecording();
                debug && console.log("Kunde wurde schon positiv abgeschlossen!\n Achtung!\n Bei OK-Klicken wird aufgelegt!!"); // !! Infobox Umleitung !!
                ttWeb.terminateCall('100');
            }
            if ((callResultId == resultIdNegativ)) {
                insertIntoLog("fatal", "Es wurde ein bereits negativer Datensatz erneut angerufen. Call wurde automatisch termininiert.", "");
                ttWeb.clearRecording();
                debug && console.log("Kunde wurde schon negativ abgeschlossen!\n Achtung!\n Bei OK-Klicken wird aufgelegt!!"); // !! Infobox Umleitung !!
                ttWeb.terminateCall('200');
            }
        }

        debug && console.log("under Draggable");
        
        createCustomerCells();
    }
    //------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ ERSTELLUNG DER INFO CARDS ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

 /**createCusomerCells                                                                                                        Funktion geprüft am: 22.05.24 von Erik
 * 
 * Diese Funktion erstellt CustomerCells basierend auf den angegebenen Daten.
 * Sie durchläuft die Daten der DB und füllt die entsprechenden Werte in die CustomerData, bevor sie in die Cells via HTML eingefügt werden.
 * 
 */
    function createCustomerCells() {
        try {
            // Hole das Element "customerCells", in dem die Kundeninfo angezeigt werden sollen
            let cardHolder = document.getElementById("customerCells");
            let SqlField;

            // Überprüfe, ob ein benutzerdefiniertes Pattern angegeben ist, andernfalls verwende das Standardpattern (provider_libs.js)
            if (cardHolder.getAttribute("data-provider") != null){
                let execute = cardHolder.getAttribute("data-provider");
                CustomerData = executeFunctionFromString(execute);
            } else {
                logIntoDebug("createCustomerCells", "ProviderPattern konnte nicht geladen werden.", false);
            };

            // Überprüfe, ob eine benutzerdefinierte SQL_Statement angegeben ist, andernfalls verwende die Standardabfrage (query_lib.js)
            if (cardHolder.getAttribute("data-query") != null){
                let execute = cardHolder.getAttribute("data-query");
                SqlField = executeFunctionFromString(execute.toString());
            } else {
                logIntoDebug("createCustomerCells", "SQL-query konnte nicht geladen werden.", false);
            };

            // Durchlaufe jedes Element in CustomerData
            for (const [index] of Object.entries(CustomerData)) {
                // Finde den passenden Index in SqlField, der mit dem Schlüsselwort aus CustomerData übereinstimmt
                matchingKey = Object.keys(SqlField).indexOf(CustomerData[index].match);
                                
                // Prüfe ob Index von Customerdata in SqlField vorhanden und > -1 ist.
                // Dann schreibe den Value des Keys, zu dem der Index gehört, in CustomerData 
                if (matchingKey > -1) {
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
                        console.log("seperartor i= " + i + " / id = " + id)
                        cardHolder.innerHTML = ` 
                            ${cardHolder.innerHTML}
                            <div class='separator'></div>
                        `;
                    }
                };
            };

            preFillEntrys(); 

            //WIP
            

            // Logs 
            logIntoDebug("createCustomerCells", "Adressdaten erfolgreich in Cells geladen.", false);       
        } catch (error) {
            logIntoDebug("createCustomerCells","Error:SQL-Ergebnisse konnten nicht in Cells geladen werden", false);
        }  
    }; 

 //--------------------------------------------------------------------------------------- Calls ------------------------------------------------------------------------

 /** call_initialize 
  *     
  *      Alle notwenigen Daten zurücksetzten für einen neuen Anruf
  */
    function call_initialize() {
            
        ttWeb.setRecordingState(0);                 // Setze den Aufzeichnungsstatus auf 0 (deaktiviert)
        direction = ttWeb.getCallDirection();       // Bestimme die Richtung des Anrufs (eingehend, ausgehend oder intern)
        calldatatableId = ttWeb.getCalltableField('ID'); // Bestimme die ID des Anrufdatensatzes in der Datenbank
        msisdn = ttWeb.getCalltableField('HOME');   // Bestimme die MSISDN (Mobilfunknummer) des Anrufers oder Angerufenen
        indicator = ttWeb.getIndicator();           // Bestimme den Indikator für die Art des Anrufs (1-9)

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

        debug && console.log("call_initialize") //Debug
    }

    function call_recall() {
        blnSuccess = true;
        blnSuccess &= validateRufnummer(document.getElementById('recall_number').value, errMsg);

        if (blnSuccess == true) {
            ttWeb.setCalltableField('OTHER', $('recall_number').value);
            ttWeb.setIndicator(3);
            ttWeb.clearRecording();
            ttWeb.terminateCall('RR', null, null, 1);
        }
    }


//--------------------------------------------------------------------- Call Terminieren -------------------------------------------------------------------------------
   
    function call_terminate (terminator) {
        ttWeb.terminateCall(terminator);
    }

//-------------------------------------------------------------------------- Recording ----------------------------------------------------------------------------------- 
    // Der State bestimmt die ausgeführte Aktion: start, stop, save, clear (& terminate ?)
/**
 * 
 * @param {*} divId 
 */
    function recordSummary(divId) {
        
        document.getElementById(divId).innerHTML='<br>&nbsp;Achtung: Aufnahme l&auml;uft ...';
        document.getElementById('recording').style.display='none';
        document.getElementById('abschliessen').style.display='block';
        document.getElementById('rec-warn').className='record_indicator';
        blnFinishPositive=true;
        blnRecord=true;
        startVoiceRecording();
    }

    function startVoiceRecording() {
        insertIntoLog("info","Voicerecording wurde angeschaltet.", false);
        debug_vf = 3;
        if(!debug) {
            //if (ttWeb.getCallState() == 0) insertIntoLog("error","Voicerecording ohne Call von Agent " + ttWeb.getUser().Login +
            //    " mit State " + ttWeb.getRecordingState() ,"");
            ttWeb.initRecording(3);
            ttWeb.setRecordingState(3);
        }
    }

    function record(state, voicefileName) {
        switch (state) {
             // Wenn der Zustand 'start' ist, wird die Aufnahme (agent & customer) gestartet 
            case 'start':
                ttWeb.setRecordingState(3);
                logIntoDebug( "record(start)","recording was started with state: 3",false);
                break;

            // Wenn der Zustand 'stop' ist, wird die Aufnahme gestoppt und die Sprachaufzeichnung wird ggf. gespeichert 
            case 'stop':
                
                if (voicefileName) {
                    
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

    function setRecordName(style, useName) {
        let recordName = "";
        if(style === "pattern") {
            FileNamePattern.forEach((getInfo, index) => {
                try { // versuche die genannte Variable auszurufen 
                    recordName += eval(getInfo);
                } catch (error) {
                        //  Ist die Variable nicht zugewiesen, suche in CustomerData und 
                        //  finde den passenden Index, der mit getInfo übereinstimmt.
                        let matchingKey = Object.keys(CustomerData[index].match).indexOf(getInfo);
                        // Wenn gefunden, schreibe in recordName
                        if (matchingKey > -1) {
                            recordName += `${CustomerData[matchingKey].value}`; 
                        } ;       
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
    }
    
    
// ############################################################################### ttFrame SQL #############################################################################################    
/**     Inhaltsverzeichnis
 *      - getCampaignData 
 * 
 */

/** getCampaignData - Initalisierungs SQL-Abrage um die nowenigen Daten aus der Datenbank zu erhalten
 * 
 * @param {*} campaignId            Fest zugeordent in Campaign Var
 * @param {*} agentId               Global Var ( <= call_initialize )
 *        
 * @param {*} addressdatatable 
 * 
 */
    function getCampaignData(campaignId, agentId, addressdatatable) {
        console.log("getCampaignData") // Konsolenausgabe zur Analyse des Skriptverlaufs

        

        // Optionen für eine Auswahlliste setzen
        selectboxSetOptions(document.getElementById('datenerfassung_ablehnungsgrund'), negativgruende, "", true, result[0].rows.length);

        
        // Anzahl der kommenden Wiedervorlagen abrufen
        anzahl = executeSql("SELECT count(*) as anzahl FROM contact_history JOIN calldatatable ON contact_history.calldatatable_id=calldatatable.id JOIN " + addressdatatable + " ON " + addressdatatable + ".id=calldatatable.addressdata_id WHERE contact_history.campaign_id=" + campaignId + " AND contact_history.agent_id='" + agentId + "' AND is_wv=1 AND wv_date>NOW()");

        // Wenn Wiedervorlagen vorhanden sind, zeige sie an
        if (anzahl[0].rows[0].fields.anzahl > 0) {
            result = executeSql("SELECT CAST(concat('<b>',DATE_FORMAT(wv_date,'%d.%m. %H:%i'),':</b> '," + fieldname_firstname + ",' '," + fieldname_lastname + ",' : ',message) AS CHAR) as message FROM contact_history JOIN calldatatable ON contact_history.calldatatable_id=calldatatable.id JOIN " + addressdatatable + " ON " + addressdatatable + ".id=calldatatable.addressdata_id WHERE contact_history.campaign_id=" + campaignId + " AND contact_history.agent_id='" + agentId + "' AND is_wv=1 AND wv_date>NOW() ORDER BY wv_date LIMIT 5");
            let wvtext = 'Kommende Wiedervorlagen<br />f&uuml;r <b>Agent ' + agentId + '</b>:<br /><br />';
            for (let i = 0; i < result[0].rows.length; i++) wvtext = wvtext + '<div class="data" style="height: auto;">' + result[0].rows[i].fields.message + '</div>';
            document.getElementById('right_block').innerHTML = wvtext;
        }

        // Wiedervorlagendatum und -zeit auf Standardwerte zurücksetzen
        let currDate = new Date();
        document.getElementById('wiedervorlage_Date').value = currDate.getDate() + "." + (currDate.getMonth() + 1) + "." + currDate.getFullYear();
        document.getElementById('wiedervorlage_Time').value = (currDate.getHours() + 1) + ":00";
        document.getElementById('wiedervorlage_Text').value = "";
        document.getElementById('apne_delay').value = "";
        document.getElementById('apne_notiz').value = "";

        // Kundenhistorie anzeigen
        anzahl = executeSql("SELECT count(*) as anzahl FROM contact_history WHERE calldatatable_id=" + calldatatableId);

        if (anzahl[0].rows[0].fields.anzahl > 0) {

            result = executeSql("SELECT cast(concat(DATE_FORMAT(called_at,'%d.%m.%Y, %H:%i'),' (', agent_id ,') ',message) as char CHARACTER SET latin1) as message FROM contact_history WHERE calldatatable_id=" + calldatatableId + " ORDER BY called_at DESC");

            let kundenhistorie = "<fieldset><legend>Kundenhistorie</legend>";
            for (var i = 0; i < result[0].rows.length; i++) kundenhistorie = kundenhistorie + '<div>' + result[0].rows[i].fields.message + '</div>';
            kundenhistorie = kundenhistorie + "</fieldset>";

            document.getElementById('kundenhistorie').innerHTML = kundenhistorie;
        }

        // Statistikdaten für die Kampagne abrufen und anzeigen
        result = executeSql("SELECT POSITIV, NEGATIV, UMWANDLUNGSQUOTE, NETTOKONTAKTE FROM livestat_dwh WHERE kampagnen_id=" + campaignId + " LIMIT 1");
        if (result[0].rows.length > 0) {
            quote = result[0].rows[0].fields.UMWANDLUNGSQUOTE;
            nettos = result[0].rows[0].fields.NETTOKONTAKTE;
            if (nettos > 0) {
                $('stats_positive').width = Math.round((result[0].rows[0].fields.POSITIV / nettos) * 200);
                $('stats_unfilled').width = 200 - Math.round((result[0].rows[0].fields.POSITIV / (nettos)) * 200);
            }
            $('stats_text').innerHTML = '[<span style="color: green">' + result[0].rows[0].fields.POSITIV + '</span>&nbsp;/&nbsp;' + nettos + '&nbsp;,&nbsp;Wandlungsquote: ' + quote + '%]';
        }
    }

/**#########################################################################################################################################################################
 * 
 * 
 * 
 */
function loadData() {
    
    let query = `
    SELECT 
        (SELECT id, label FROM cancellation_reasons WHERE campaign_id=<campaignId> AND active=1 ORDER BY label DESC) AS cancellation_reasons,
        (SELECT count(*) as anzahl FROM contact_history JOIN calldatatable ON contact_history.calldatatable_id=calldatatable.id JOIN <addressdatatable> ON <addressdatatable>.id=calldatatable.addressdata_id WHERE contact_history.campaign_id=<campaignId> AND contact_history.agent_id='<agentId>' AND is_wv=1 AND wv_date>NOW()) AS wiedervorlagen_count,
        (SELECT CAST(concat('<b>',DATE_FORMAT(wv_date,'%d.%m. %H:%i'),':</b> ',"<fieldname_firstname>",' ',"<fieldname_lastname>",' : ',message) AS CHAR) as message FROM contact_history JOIN calldatatable ON contact_history.calldatatable_id=calldatatable.id JOIN <addressdatatable> ON <addressdatatable>.id=calldatatable.addressdata_id WHERE contact_history.campaign_id=<campaignId> AND contact_history.agent_id='<agentId>' AND is_wv=1 AND wv_date>NOW() ORDER BY wv_date LIMIT 5) AS wiedervorlagen,
        (SELECT count(*) as anzahl FROM contact_history WHERE calldatatable_id=<calldatatableId>) AS kundenhistorie_count,
        (SELECT cast(concat(DATE_FORMAT(called_at,'%d.%m.%Y, %H:%i'),' (', agent_id ,') ',message) as char CHARACTER SET latin1) as message FROM contact_history WHERE calldatatable_id=<calldatatableId> ORDER BY called_at DESC) AS kundenhistorie,
        (SELECT POSITIV, NEGATIV, UMWANDLUNGSQUOTE, NETTOKONTAKTE FROM livestat_dwh WHERE kampagnen_id=<campaignId> LIMIT 1) AS statistikdaten
    `;

        // Zuweisungen basierend auf Daten aus der Datenbank
        // 1. Negativgründe aus der Datenbank zu einem Objekt zuweisen
        let negativgruende = {};
        for (var i = 0; i < result[0].rows.length; i++) {
            negativgruende[result[0].rows[i].fields.id] = result[0].rows[i].fields.label;
        }

        // 2. Optionen für eine Auswahlliste setzen
        selectboxSetOptions(document.getElementById('datenerfassung_ablehnungsgrund'), negativgruende, "", true, result[0].rows.length);

        // 3. Wiedervorlagendatum und -zeit sowie Textfelder auf Standardwerte setzen
        var currDate = new Date();
        document.getElementById('wiedervorlage_Date').value = currDate.getDate() + "." + (currDate.getMonth() + 1) + "." + currDate.getFullYear();
        document.getElementById('wiedervorlage_Time').value = (currDate.getHours() + 1) + ":00";
        document.getElementById('wiedervorlage_Text').value = "";
        document.getElementById('apne_delay').value = "";
        document.getElementById('apne_notiz').value = "";

        // 4. Kundenhistorie anzeigen
        var kundenhistorie = "<fieldset><legend>Kundenhistorie</legend>";
        for (var i = 0; i < result[0].rows.length; i++) {
            kundenhistorie += '<div>' + result[0].rows[i].fields.message + '</div>';
        }
        kundenhistorie += "</fieldset>";
        document.getElementById('kundenhistorie').innerHTML = kundenhistorie;

        // 5. Statistikdaten für die Kampagne zuweisen
        var quote = result[0].rows[0].fields.UMWANDLUNGSQUOTE;
        var nettos = result[0].rows[0].fields.NETTOKONTAKTE;

}

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** executeSql() - Verbindung zu BD                                                                                           Funktion geprüft am: 22.05.24 von Erik
 * 
 *      Schmeisst den SQL-Befehl der übergeben wird gegen die ttFrame DB oder gegen einen Debug-Server,
 *      abhängig davon, ob in der tteditor-config.js degbug = true / false.      
 * 
 *      @param   {String} SQL-Befehl 
 *      @returns [String] oder null
 */


    function executeSql(sql) {

        if (!debug) {
            try {
                return ttWeb.execDatabase(sql);
            }catch (ex) {

                // Error protokollieren
                logIntoDebug("executeSql(): Fehlerhaftere Abfrage",sql, false);
                return null;
            }
        }else {
            try { // Debug: Dem Debug-SQL-Connector kontaktieren  
                var result = null;
                new Ajax.Request('http://admin/outbound.dbconnector/index.php?sql=' + encodeURIComponent(sql), {
                    method: 'get',
                    asynchronous: false,
                    onSuccess: function(transport) {
                        result = transport.responseText.evalJSON();
                    },
                    onFailure: function() {
                        logIntoDebug("executeSql():",'Error: Keine Verbindung zum Debug-SQL-Connector.', false);
                    }
                });
                return result;

            }catch (ex) {
                logIntoDebug("executeSql():",'Error: Fehlerhafter Debug-SQL-Befehl: ' + ex.Message, false);
                return null;
            }
        }
    }

   
    // Protokollieren von SQL-Fehlern (ausgelagerte Funktion)
    function logSqlError(sql, errorMessage) {
        var insertSql = buildLogInsert('error', sql, errorMessage);
        try {
            ttWeb.execDatabase(insertSql);
        }catch (ex) {
            logIntoDebug('Fehler beim Protokollieren des SQL-Fehlers: ' + ex.Message, false);
        }
    }

// ########################################################################################## Navigations #############################################################################################

/** switchTab - Umschalten der Navigations-Tabs und öffnen der Register                                                         Funktion gerüft am 07.05.24 von Erik
 * 
 *      Bildet die Grundlegende Naviagtion zwischen den Reigstern. Diese wir sowohl über die Tab (Reiter) als auch über die 
 *      "Verabschiedungs"- und "Weiter"-Buttons aufgerufen. Mitgegeben wird die ID des Registers der audgerufen werden soll.  
 * 
 *      @param {*} newTabName 
 */
    function switchTab(newTabName) { 
        // Überprüfen, ob der neue Tab gültig ist
        if (validateTab(newTabName)) {

            // Aktuellen Tabnamen aktualisieren
            currentTabName = newTabName;
            console.log(currentTabName);

            // Wenn der neue Tab bereits sichtbar ist, nichts tun
            if ($('#' + newTabName).style.display === 'block') {
                return;
            }

            // Alle Tabs deaktivieren und den neuen Tab aktivieren
            var tabs = $$('.page_content');
            tabs.forEach(function(tab, index) {
                tab.style.display = 'none';
                $('tab' + (index + 1)).className = 'tab';
                if (tab.id === newTabName) {
                    $('tab' + (index + 1)).className = 'current tab';
                }
            });
            $('#' + newTabName).style.display = 'block';
        }

        // Anzeigen oder Ausblenden von Elementen basierend auf dem Tab
        var myStyle = (newTabName !== 'tab_start') ? 'none' : 'block';
        ['div_go_ane', 'div_go_abfax', 'div_go_positiv'].forEach(function(elementId) {
            $(elementId).style.display = myStyle;
        });

        // Zusätzliche Funktionen basierend auf dem Tab aufrufen
        if (newTabName === 'tab_zusammenfassung') {
            readTrigger();
            showZusammenfassung();
        }

        if (blnFinishPositive) {
            document.getElementById('abschliessen').style.display = 'block';
            document.getElementById('recording').style.display = 'block';
        }
    }

// ################################################################################### GATEKEEPER #############################################################################################
    
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
                document.querySelectorAll(`[data-grp=${actionArr[0][1]}]`),
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
                                            .replace(/\s+/g, ',')
                                            .replace(/([^,\[\]]+)/g, '"$1"'); 
            gateArr = JSON.parse(gateArr);
            gateArr.forEach(entry => {
                if (entry.length > 3) {
                    entry[2] = [entry.slice(3)];
                    entry.length = 3;
                }                       //  --- Erklärung :
            });                         //      Mit dem was an die Funtion übereben wird, wird ein Array aufgebaut, 
            [select, switchGrp, nextFunc] = [//     welches alle Anweisungen für die Zustände des jeweilige Select enthält.
                actionArr,
                document.querySelectorAll(`[data-grp=${actionArr.getAttribute("data-trigger")}]`),
                actionArr.getAttribute("data-call")
            ];
        }   

        // Durchlaufen der Anweisungen im gateArr
        gateArr.forEach(operation => {
            let [value, action, target] = operation; 
            // Überprüfen, ob die aktuelle Select-Option mit dem Wert übereinstimmt
            if (value === select.value) {
                try {                   // <<<>>> Auftrag für aktuelle Select.value ausführen
                    if (action === 'openOnly') {  // wenn openOnly oder alwaysClose --> Gruppe = d-none
                        switchGrp.forEach(element => element.classList.add('d-none'));
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
                            logIntoDebug(select.id ,`Error: gatekeeper hat fehlerhafte action: ${action} in ${gateArr}`, false);
                    } 
                    // Ausführen der Folgefunktion, falls vorhanden
                    executeFunctionFromString(nextFunc);

                } catch (error) {
                    // Fehlermeldung ausgeben
                   logIntoDebug(select.id,`Error: Gatekeeper wurde fehlerhaft ausgeführt!`, false);
                };
            };
        });
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
        let insert;
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
                if (cache.has(list.target_id)) {
                    document.getElementById(list.target_id).innerHTML += insert;
                } else {
                    cache.add(list.target_id);
                    document.getElementById(list.target_id).innerHTML = insert;
                }
                // Alle ungenutzten Elemente zurücksetzten
            } else if (cache.has(list.target_id)) {}else {
                    document.getElementById(list.target_id).innerHTML = "";
                    cache.add(list.target_id);
            }   
        })
    };

// ######################################################################################### VALIDATORS #############################################################################################

 /** checkInputs - Validierung der Inputs für User-Weitereitung
 * 
 *      Um zu prüfen, wann ein tab-content vollständig ausgefüllt ist, ohne es bei jeder
 *      Eingabe gegen einen Validator zu werfen, werden die Silent Validators genutzt.
 *      Diese überprüfen, ob in einem sichbaren tab, alle Inputs [required], die in einem 
 *      ebenfalls sichtbaren Fliedset liegen, ausgefüllt sind, bzw. > null 
 *      Es werden keine ErrorMsg ausgegeben, daher silent...
 *      Aufgabe ist herauszufinden ab wann der "Weiter"-Button eingeblendet werden soll.
 * 
 *      @param {HTMLElement} page_content - Registerkarte, dessen Eingabefelder[requierd] validiert werden sollen.
 */
    function checkInputs(page_content) {
        let filled = true;
        
        // Prüfen, ob das (Tab-content)Elternelement die Klasse "d-none" trägt
        if (page_content.classList.contains('d-none')) {

            // Sammel alle Inputs der Fieldsets, die nicht "d-none" sind aber das Attribut "required" haben
            let requiredInputs = page_content.querySelectorAll(':scope > fieldset:not(.d-none) input[required]');
            if(requiredInputs === 0){ // wenn kein Fieldset vorhanden, prüfe nur auf inputs
                requiredInputs = page_content.querySelectorAll(':scope > input[required]') 
            }
                    
            requiredInputs.forEach(input => {
                // Überprüfen, ob das Feld ausgefüllt ist (Wert > "")
                if (input.tagName === 'INPUT' && !input.value.trim()) {
                    filled = false;
                }

                // Prüfe select auf "Bitte Auswählen" (= null)
                if (input.tagName === 'SELECT' && !input.value) {
                    filled = false;
                }
            });    
        }else {
            filled = false;
        };

        return filled;
    }

// ############################################################################### BUNDLE VALIDATORS #############################################################################################
    
 /** bundleInputs - Bündelung der Eingabefelder nach Typ + Übergabe an Validierung.
 * 
 *      Die Idee ist es den Validierungsprozess so einfach wie möglich zu halten.
 *      Hierfür sollen die zu prüfenden Inputs anhand ihrer IDs zusammengefasst werden.
 *      Das Bündeln der ID kann dann händisch oder via Funktion erledigt werden
 * 
 *      @param {HTMLElement} page_content - Registerkarte, dessen Eingabefelder validiert werden sollen.
 */
    function bundleInputs(page_content) {
        try {
            let inputsTypeArr = {   // (Hier im Kommentar: Inputs = Input & Select)
                txt: [],            // txt , handy , email , tel , plz , call, date, time, dateandtime und empty sind die einzigen zugelassenen Typen für 
                handy: [],          // die Validierung. Andere Strings laufen gegen eine Fehlermeldung unabhängig von dem Wert im
                email: [],          // Input. Inputs die kein [required] Attribut besitzten, werden von der Validierug ausgeschlossen.
                tel: [],            // Selects werden nur darauf geprüft, ob sie > null sind. Soll ein Select darauf geprüft werden, ob
                plz: [],            // eine bestimmte Option ausgewählt wurde; benötigt das Select data-call = "validateSelect(option.value)".    
                call: [],
                empty: [],
                date: [],
                time: [],
                dateandtime: [],
                default: []
            };
            // Sammel alle Inputs der Fieldsets, die nicht "d-none" sind aber das Attribut "required" haben
            let allInputs = page_content.querySelectorAll(':scope > fieldset:not(.d-none) input');
            if(allInputs === 0){ // wenn kein Fieldset vorhanden, prüfe nur auf inputs
                allInputs = page_content.querySelectorAll(':scope > input:not(.d-none)') 
            }
            allInputs.forEach(input => {
                let valiTyp = input.dataset.vali || 'default'; // Wenn data-vali nicht vorhanden ist -> type = default

                if (valiTyp in inputsTypeArr) {
                    // valiTyp entspricht einem Namen in inputsTypeArr, füge es dem entsprechenden Array hinzu
                    inputsTypeArr[valiTyp].push(input.id);
                } else {
                    // füge das Input in das Array "default" ein (Auffangbecken)
                    inputsTypeArr.default.push(input.id);
                }
            });

            for (let valiTyp in inputsTypeArr) {   // Übergabe an die Validierung
                let idArr = inputsTypeArr[valiTyp];
                validateInput(valiTyp, idArr, true);
            }
        } catch (error) {
            logIntoDebug("bundleInputs:", "Error: Inputs konnten nicht gebundelt werden", false);
            return [];
        }
    };

//--------------------------------------------------------------------- Vaidierung der Bundles -----------------------------------------------------------------

/**validateInput - Validierung von Eingabefeldern aus Bundle-Array.
* 
*      Achtung! Die Arrays müssen Typenrein übergeben werden, weil nur gegen ein Regex geprüft wird!
* 
*      @param {string} type - Der Typ der Validierung, der angibt, welche Art von Eingabe validiert werden soll.
*      @param {Array} idArr - Ein Array von IDs, die den Eingabefeldern zugeordnet sind, die validiert werden sollen.
*      @param {boolean} giveAnswer - Ein boolischer Wert, der angibt, ob das Ergebnis zurückgegeben werden soll oder nicht.
*/
    function validateInput(type, idArr, giveAnswer) { // String, Array, Boolean
        
        let regX;                   //  Das übergebene Array enthält die IDs jener Inputs, die einem ValiTyp
        let errTxt;                 //  zugewiesen sind. 
        let boolErr = true;         //
        let extVali = false; 

        switch (type) { // RegEx und Fehlernachricht nach Type auswählen

            case 'txt':
                regX = /^(?=.*\b[\p{L}\d\s.,:;!?+()\[\]{}="'-]+\b)[\p{L}\d\s.,:;!?+()\[\]{}"='-]{1,255}$/; 
                errTxt = "Ungültiger oder zu langer Text"; //wenn kleiner als 1 oder länger als 255
                break;
        
            case 'handy':
                regX = /^(?:\+49|0)(?:\d{3,}|(\d|\s){5,})$/;
                errTxt = "Ungültige Handynummer!"
                break;
        
            case 'email':
                regX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                errTxt = "Ungültige E-Mail-Adresse!";
                break;
        
            case 'tel':
                regX = /^0[1-9][0-9]+$/;
                errTxt = "Ungültige Telefonnummer!";
                break;
        
            case 'plz':     // xxxxx nur Zahlen
                regX = /^[0-9]{5}$/;
                errTxt = "Ungültige Postleitzahl!";
                break;

            case 'time':    // hh:mm & hh:mm:ss
                regX = /^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])(:([0-5][0-9]))?$/;
                errTxt = "Ungültige Datumsformat!";
                break;

            case 'date':    // TT.MM.JJJJ
                regX = /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.\d{4}$/;
                errTxt = "Ungültige Datumsformat!";
                break;

            case 'dateandtime': // TT.MM.JJJJ hh:mm:ss (müssen duech Leerzeichen getrennt sein)
                regX = /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.\d{4}\s(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])(:([0-5][0-9]))?$/;
                errTxt = "Ungültige Zeitformat!"; 
                break;
        
            case 'call': // Input-spezifische Validation wird aufgerufen
                extVali = true; 
            
            case 'empty':    // durchwinken wenn 'call' oder Null-Prüfung (Null-Prüfung => value > null)
                regX = /[\s\S]+/;   // value = "" zulassen: /[\s\S]*/ 
                errTxt = "Keine Validierung möglich!";
                break;
        
            default:
                regX = /^(?!.*)/; // default = Alles verboten
                errTxt = "Ungültige Eingabe";
        }; 

        try {
            idArr.forEach(id => { // ArrayEinträge Iterieren -> Input.value auslesen
                let target = document.querySelector(`#${id}`).value;
                let errTxtId = `${id}_errorMsg`;
                regX.test(target) ? undefined : boolErr = false; // prüfe Input.value gegen RegEx

                if (extVali === true) { // data-call.value -> 'String to function' 
                    let specVali = document.getElementById(`${id}`).getAttribute("data-call");
                    if (typeof window[specVali] === 'function') {   // wenn ext. Vali-function aufrufbar
                        window[specVali]() ? undefined : boolErr = false; // prüfe mit ext. Vali
                    }   
                };  

                if (boolErr) {
                    document.querySelector(`#${errTxtId}`).innerHTML = "";
                } else {
                    document.querySelector(`#${errTxtId}`).innerHTML = errTxt;
                }
                
            });
            debug && console.log(`validateInput: Ergebniss = ${boolErr} \n${idArr}`, false);
            return giveAnswer ? boolErr : undefined;
            
        }catch (error) { //  Error Nachrichten und return
            logIntoDebug( "validateInput:" ,`Error at array: ${idArr} with ${id}`, false);
            return giveAnswer ? false : undefined;
        }
    }

// ######################################################################################  "EXTERN" VALIDATORS #############################################################################################

// Hier ist die große Auslage der Sonderwürste
// >> Wichtig! : Validierungen MÜSSEN ein bool zurückgeben -> true = positive Prüfung <<

/**  Sotierung nach Kategorien (alphabetisch):
*       - IBAN & Währungsrechung
*       - Zeit & Datumsrechnung
/*

/**-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
*-------------------------------------------------------------------------- IBAN & Währungsrechnung --------------------------------------------------------------------------
*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
*/    
 /** validateIBAN - Validierung einer IBAN.
 * 
 *      @param {string} iban - Die IBAN, die überprüft werden soll.
 *      @param {HTMLElement} errorId - Das Element, in dem Fehlermeldungen angezeigt werden sollen.
 *      @param {boolean} blnRequired - Gibt an, ob die Eingabe erforderlich ist.
 */
    function validateIBAN(iban, errorId, blnRequired) {
        var isValid = false;
        var blnError = false;

        // Überprüft, ob der IBAN alphanumerisch ist
        function isAlphaNumeric(str) {
            var code, i, len;
            for (i = 0, len = str.length; i < len; i++) {
                code = str.charCodeAt(i);
                if (!(code > 47 && code < 58) && // (0-9)
                    !(code > 64 && code < 91) && // (A-Z)
                    !(code > 96 && code < 123)) { // (a-z)
                    return false;
                }
            }
            return true;
        }
        function isValidIBANNumber(input) {
            var CODE_LENGTHS = { // LänderCode(Länge) der IBAN (Unterliegt evt. Änderungen)
                AD: 24, AE: 23, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22, BR: 29,
                CH: 21, CR: 21, CY: 28, CZ: 24, DE: 22, DK: 18, DO: 28, EE: 20, ES: 24,
                FI: 18, FO: 18, FR: 27, GB: 22, GI: 23, GL: 18, GR: 27, GT: 28, HR: 21,
                HU: 28, IE: 22, IL: 23, IS: 26, IT: 27, JO: 30, KW: 30, KZ: 20, LB: 28,
                LI: 21, LT: 20, LU: 20, LV: 21, MC: 27, MD: 24, ME: 22, MK: 19, MR: 27,
                MT: 31, MU: 30, NL: 18, NO: 15, PK: 24, PL: 28, PS: 29, PT: 25, QA: 29,
                RO: 24, RS: 22, SA: 24, SE: 24, SI: 19, SK: 24, SM: 27, TN: 24, TR: 26
            };
            var iban = String(input).toUpperCase().replace(/[^A-Z0-9]/g, ''),
                code = iban.match(/^([A-Z]{2})(\d{2})([A-Z\d]+)$/),
                digits;
            if (!code || iban.length !== CODE_LENGTHS[code[1]]) {
                return false;
            }
            digits = (code[3] + code[1] + code[2]).replace(/[A-Z]/g, function(letter) {
                return letter.charCodeAt(0) - 55;
            });

            return mod97(digits) === 1;
        }
        
        // Algorithmus zur Berechnung des Modulo-97 einer Zeichenkette gemäß den Anforderungen von IBAN-Validierungsverfahren.
        function mod97(string) {
            var checksum = string.slice(0, 2),
                fragment;
            for (var offset = 2; offset < string.length; offset += 7) {
                fragment = String(checksum) + string.substring(offset, offset + 7);
                checksum = parseInt(fragment, 10) % 97;
            }
            return checksum;
        }
        // Hauptüberprüfung der IBAN gegen Regex
        if (isAlphaNumeric(iban)) {
            if (!iban.match(/[A-Z]{2}[0-9]{2}[A-Z0-9]+/)) {
                blnError = true;
            } else {
                if (!isValidIBANNumber(iban)) {
                    blnError = true;
                } else {
                    isValid = true;
                }
            }
        } else {
            blnError = true;
        }
        // Anzeige von Fehlermeldungen im Error_msg-Element
        if (blnError && blnRequired !== false) {
            errorId.innerHTML = 'Ungültige IBAN';
        } else {
            errorId.innerHTML = '';
        }

        return isValid;
    }

/**-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
*----------------------------------------------------------------------------- Zeit und Datum --------------------------------------------------------------------------
*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
*/ 

/** validateDatum - Validierung von Datumsangaben.
 * 
 *      @param {Array} dateArr - Ein Array von Selektoren, die auf Datumsfelder verweisen, die validiert werden sollen.
 *      @param {string} targetDate - Ein optionsaler Parameter, der ein Ziel-Datum in Format "tt.mm.jjjj" angibt, welches nicht überschritten werden darf.
 *      @param {boolean} giveAnswer - Ein boolischer Wert, der angibt, ob das Ergebnis zurückgegeben werden soll oder nicht.
 */
    function validateDatum(dateArr, targetDate, giveAnswer) {
        for (let i = 0; i < dateArr.length; i++) {
            let boolErr = false; // Variable, um den Fehlerstatus zu speichern
            let regX = /^(\d{2})\.(\d{2})\.(\d{4})$/; // Regular Expression für das Datum im Format "tt.mm.jjjj"
            let target = document.querySelector(dateArr[i]).value; // Wert des aktuellen Datumsfeldes
            let errTextId = `${target}_errorMsg`; // ID des Fehlermeldungselements für das aktuelle Datumsfeld

            boolErr = regX.test(target); // Überprüfen, ob das aktuelle Datum dem erwarteten Format entspricht

            if (boolErr) { // Wenn das Datum im erwarteten Format ist
                if (targetDate && new Date(dateArr[i]) > new Date(targetDate)) { // Überprüfen, ob das optionale Zieldatum überschritten wird
                    document.querySelector(errTextId).innerHTML = ""; // Fehlermeldung löschen
                } else {
                    document.querySelector(errTextId).innerHTML = ""; // Fehlermeldung löschen
                }
            } else {
                document.querySelector(errTextId).innerHTML = "Ungültiges Zeitformat!"; // Fehlermeldung setzen
            }
        }
        // Debugging-Ausgabe
        debug && console.log(`validateDatum: Ergebnis = ${boolErr} Zieldatum=${targetDate} \n${dateArr} \n${errTextId}`);
        
        // Rückgabe des Ergebnisses, wenn `giveAnswer` `true` ist, andernfalls `undefined`
        return giveAnswer ? boolErr : undefined;
    }
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------

/** validateTime - Validierung für Zeitangaben.
 * 
 *      @param {string} mytime - Die zu validierende Zeitangabe.
 *      @param {HTMLElement} errorId - Das HTML-Element, in dem Fehlermeldungen angezeigt werden sollen.
 *      @param {boolean} blnRequired - Ein boolischer Wert, der angibt, ob die Zeitangabe erforderlich ist.
 */
    function validateTime(mytime, errorId, blnRequired) {
        // Prüfen, ob die Zeitangabe leer ist und nicht erforderlich ist; in diesem Fall wird direkt `true` zurückgegeben
        if (!mytime && !blnRequired) return true;

        // Zeitangabe in Stunden- und Minuten-Teile aufteilen
        const chunks = mytime.split(':');
        
        // Überprüfen, ob die Zeitangabe aus genau zwei Teilen besteht und jeder Teil eine ganze Zahl ist
        if (chunks.length !== 2 || !chunks.every(chunk => /^\d+$/.test(chunk))) {
            // Fehlermeldung setzen und `false` zurückgeben, falls die Zeitangabe ungültig ist
            errorId.innerHTML = 'Zeit falsch';
            return false;
        }
        // Zeitteile in Zahlen konvertieren
        const [hours, minutes] = chunks.map(Number);
        
        // Überprüfen, ob die Stunden im Bereich von 0 bis 23 und die Minuten im Bereich von 0 bis 59 liegen
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            // Fehlermeldung setzen und `false` zurückgeben, falls die Zeitangabe ungültig ist
            errorId.innerHTML = 'üngültige Zeitangabe';
            return false;
        }
        // Fehlermeldung leeren und `true` zurückgeben, falls die Zeitangabe gültig ist
        errorId.innerHTML = '';
        return true;
    }
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ######################################################################################### HELPER ##############################################################################################
/**  Inhaltsliste:
*       - H-001     executeFunctionFromString
*       - H-002     Select / ausgewählte Option prüfen
*       - H-003     SQL-Schlagwortfilter
*       - H-004     Submit ein Form
*       - H-005     Mapping eines Arrays aus SQL-Results
/*

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
            logIntoDebug( "executeFunctionFromString:",`Aufgerufene Funktion ${funcName} existiert nicht.`, false); //Error_msg
        }
        return giveBack;
    }
//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** Helper H-002
 * 
 *      Prüfung eines Selects auf einen bestimmten (angewählten) Option.value
 *      @param {*} optionId 
 *      @param {*} optionValue 
 */
    function validateSelect(selectId, optionValue){ 
        return document.getElementById(selectIdId).value === optionValue ? true : false;
    }
//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------  
/** Helper H-003
 * 
 *      SQL-Injection Schlagwortfilter
 *      @param {String} userInput
 */
    function checkForSQLInjection(userInput) {
        // Liste der gängigen SQL-Prompts
        var injectionPrompts = [
            'SELECT',  'INSERT', 'UPDATE', 'DELETE', 'DROP',    'TRUNCATE',
            'GRANT',   'EXEC',   'CONCAT', 'CAST',   'DECLARE', 'EXECUTE',
            'FETCH',   'MERGE',  'SCRIPT', 'SLEEP',  'DELAY'
        ];

        // Durchsuchen der Benutzereingabe nach SQL-Prompts
        for (var i = 0; i < injectionPrompts.length; i++) {
            if (userInput.toLowerCase().includes(injectionPrompts[i].toLowerCase())) {
                // Wenn ein Prompt gefunden wurde, gib diesen zurück
                return injectionPrompts[i];
            }
        }
        // Wenn kein Prompt gefunden wurde, gibt null zurück
        return null;
    }
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** Helper H-004
 * 
 *      Submit Form
 *      @param {string} form_id absenden
 */
    function submitForm(form_id) {
        document.getElementById(form_id).submit();
    }
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** Helper H-005 
 * 
 *      Ein Standart Validator, der den Value des aufrufenden Elements gegen den übergebenen Wert prüft.
*/
    function checkCallerValue(overriddenValue) {
        let result = (this === overriddenValue) ? true : false;
        return result;
    }
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** Helper H-006
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
            logIntoDebug( "createAdressDataArray","Error: SQL-Ergebnisse konnten nicht in Array geladen werden", false);
            return []; 
        }
    }
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** Helper H-007                                                                                                             Funktion geprüft am: 22.05.24 von Erik                                                                                                            
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
    }
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** Helper H-008                                                                                                             Funktion geprüft am: 22.05.24 von Erik
 * 
 *          PopUp & Debug - Loader 
 */

    document.addEventListener("DOMContentLoaded", function() {

        const dialogList    = document.getElementsByTagName("dialog");
        const showButtonList = document.getElementsByClassName("calldialog");
        const closeButtonList = document.getElementsByClassName("closedialog");
        
        // "Show the dialog" button opens the dialog modal
        for(let x = 0; x < showButtonList.length; x++) {
            showButtonList[x].addEventListener("click", () => {
                console.log("click on " + showButtonList[x].id);
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

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** Helper H-009                                                                                                             Funktion geprüft am: 22.05.24 von Erik
 * 
 *          HotKeys 
 */
    function keyUp (event) {
        // Wenn die Taste [Zirkumflex] losgelassen wird
        if (event.keyCode === 220) { 
            keyCode1Pressed = false; // Setze den Status der ersten Taste auf false
        } 
        // Wenn die Taste [Strg] losgelassen wird
        else if (event.keyCode === 17) { 
            keyCode2Pressed = false; // Setze den Status der zweiten Taste auf false
        } 
        // Wenn die Taste [C] losgelassen wird
        else if (event.keyCode === 67) { 
            keyCode3Pressed = false; // Setze den Status der dritten Taste auf false
        }
    }

    function keyDown (event) {
       // Wenn die Taste [Zirkumflex] gedrückt wird
        if (event.keyCode === 220) { 
            keyCode1Pressed = true; // Setze den Status der ersten Taste auf true
        } 
        // Wenn die Taste [Strg] gedrückt wird
        else if (event.keyCode === 17) { 
            keyCode2Pressed = true; // Setze den Status der zweiten Taste auf true
        }  
        // Wenn die Taste [C] gedrückt wird
        else if (event.keyCode === 67) { 
            keyCode3Pressed = true; // Setze den Status der dritten Taste auf true
        }

        // Überprüfe, ob beide Tasten gleichzeitig gedrückt wurden
        if (keyCode1Pressed && keyCode2Pressed) {
            // Ändere die Sichtbarkeit des Debug-Logs
            givemeabeep();
            document.getElementById("debugLog").classList.toggle("d-none");
            console.log("Debuglog geöffnet!");
        }
        // Überprüfe, ob die zweite und dritte Taste gleichzeitig gedrückt wurden
        if (keyCode2Pressed && keyCode3Pressed) {
            // Setze den Inhalt des Debug-Logs zurück
            document.getElementById("debugLog").innerHTML = `<button type="button" onclick="debugWindowClear()">clear</button>`;
        } 
    }
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** Helper H-010
 * 
 *          SQL String Manipulation
 */

function escapeString(s) {
	try {   // Alle Vorkommen des Zeichens ' durch \\' zu ersetzen.
        return s.replace(/'/g,"\\'");
	} catch (ex){
        logIntoDebug("SQL String Manipulation - recapeStrings:", "Das Einfügen von Escape-Zeichen \' ist fehlgeschlagen", false)
	}
}

function removeSlashes(s){
    try { //  Alle Vorkommen von Backslash durch das Slash ersetzen.
        return s.replace(/\\/g,"/");
    } catch (ex){
        logIntoDebug("SQL String Manipulation - removeSlashes", "Das Entfernen von Backshashes ist fehlgeschlagen", false)
	}
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** Helper H-011
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
/** Helper H-012
 * 
 *          noDoubles() - Püft ob doppelt der gleiche Wert eingegeben wurde
 * 
 *          @param {string} ID des Inputs als Array         
 */
    function noDoubles(idArr) {
        let valueArr = [];
        let cache = new Set();
        let duplicates = new Set();

        idArr.forEach(id => { 
            let element = document.getElementById(id);
            if (element) {
                valueArr.push(element.value);
            }
        });

        for (let value of valueArr) {
            if (cache.has(value)) {
                duplicates.add(value);
            } else {
                cache.add(value);
            }
        }
        return Array.from(duplicates);
    }

  //-------------------------------------------------------------------------------------------------------------------------------------------------------------------
/* Helper H-013
 * 
 *          setRecordName - Erstelle den Namen für das Voicefile
 * 
 *          @param {String} stlye = pattern,use oder any   
 *          @param {String} useName = String für eigene Namesvergabe mittels style = use     
 */
    function setRecordName(style, useName) {
        let recordName = "";
        if(style === "pattern") {
            FileNamePattern.forEach((getInfo, index) => {
                try { // versuche die genannte Variable auszurufen 
                    recordName += eval(getInfo);
                } catch (error) {
                        //  Ist die Variable nicht zugewiesen, suche in CustomerData und 
                        //  finde den passenden Index, der mit getInfo übereinstimmt.
                        let matchingKey = Object.keys(CustomerData[index].match).indexOf(getInfo);
                        // Wenn gefunden, schreibe in recordName
                        if (matchingKey > -1) {
                            recordName += `${CustomerData[matchingKey].value}`; 
                        } ;       
                    }
                if (index != FileNamePattern.length - 1) recordName += '_'; // Trenner einbauen
            });
            recordName += `${recordingNameSuffix}`;
    
        } else if (style === "use"){ // nutze mitgegebenen Namen
            recordName += `${useName}${recordingNameSuffix}`;
    
        } else { // Generiere einen Namen [datum + hashwert] 
            recordName = `${agentId}_${$crypto.randomUUID()}${recordingNameSuffix}`;
        }
        return recordName;      
    }


    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //#######################################################     WERKBANK    ############################################################################################################
    //------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    /** 
     * 
     * 
     * 
     */

            function finishPositive() {
                console.log("finishPositive"); // JS analyse
            
                const produktValue = $('datenerfassung_produkt').value;
                const emailValue = escapeString($('datenerfassung_email').value);
                const telefonValue = escapeString($('datenerfassung_telefon').value);
                const leadValue = escapeString($('datenerfassung_lead').value);
                const vertragsendeValue = escapeString($('datenerfassung_vertragsende').value);
                const optinDetailValue = escapeString($('datenerfassung_optin_detail').value);
                const ablehnungsgrundValue = escapeString($('datenerfassung_ablehnungsgrund').value);
            
                if (produktValue !== "nein") {
                    handlePositiveCase(emailValue, telefonValue, leadValue, vertragsendeValue, optinDetailValue);
                } else {
                    handleNegativeCase(ablehnungsgrundValue);
                }
            }
            
            function handlePositiveCase(email, telefon, lead, vertragsende, optinDetail) {
                terminate = "100";
            
                const updateQuery = `
                    UPDATE ${addressdatatable}
                    SET
                        emailprivate_neu = '${email}',
                        telefon_neu = '${telefon}',
                        lead = '${lead}',
                        lead_vertragsende = '${vertragsende}',
                        optin_neu = '${optinDetail}'
                    WHERE id = ${addressdatatableId}
                `;
                updateSql(updateQuery);
            
                const callDataQuery = `
                    UPDATE calldatatable
                    SET
                        result_id = '${resultIdPositiv}',
                        calldate = now(),
                        agent_id = '${agentId}'
                    WHERE id = '${calldatatableId}'
                    AND campaign_id = '${campaignId}'
                    LIMIT 1
                `;
                updateSql(callDataQuery);
            
                if (optinDetail === "voll" || optinDetail === "schrift") {
                    const voicefileName = generateVoicefilename(recordingPrefix, recordingName, recordingNameSuffix, recordingComplete, terminate);
                    saveVoiceRecording(voicefileName);
                }
            }
            
            function handleNegativeCase(ablehnungsgrund) {
                terminate = "200";
            
                const updateQuery = `
                    UPDATE ${addressdatatable}
                    SET cancellation_reason_id = '${ablehnungsgrund}'
                    WHERE id = ${addressdatatableId}
                `;
                updateSql(updateQuery);
            
                const callDataQuery = `
                    UPDATE calldatatable
                    SET
                        result_id = '${resultIdNegativ}',
                        calldate = now(),
                        agent_id = '${agentId}'
                    WHERE id = '${calldatatableId}'
                    AND campaign_id = '${campaignId}'
                    LIMIT 1
                `;
                updateSql(callDataQuery);
            
                if (!debug) {
                    ttWeb.clearRecording();
                } else {
                    alert("Eventuelle Aufzeichnung verworfen");
                }
            }
            
            function saveVoiceRecording(voicefileName) {
                setRecordName("pattern");
                if (!debug) {
                    ttWeb.saveRecording(voicefileName);
                } else {
                    alert(voicefileName);
                }
            };
            
            
            function recordOn() {

                if (debugvoicerecording != "3") {
            
                    if ($('datenerfassung_produkt_1').value != "0") {
                        document.getElementById('abschliessen').style.display = "none";
                        document.getElementById('recording').style.display = "block";
                    }
            
                }
            
            }
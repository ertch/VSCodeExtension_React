




function call_initialize() {
    console.log("call_initialize") // JS analyse
    ttWeb.setRecordingState(0);

    direction = ttWeb.getCallDirection();
	calldatatableId = ttWeb.getCalltableField('ID');
	msisdn = ttWeb.getCalltableField('HOME');

	indicator = ttWeb.getIndicator(); //Ruft den Index der aktuellen Rufnummer ab.  (1-9)	
    if (indicator == 1) {
		telKontakt = ttWeb.getCalltableField('HOME');
	} else if (indicator == 2) {
		telKontakt = ttWeb.getCalltableField('BUSINESS');
	} else{
        telKontakt = ttWeb.getCalltableField('OTHER');
    };
	
    // muss festnetz immer mit 'BUISNESS' beschriben werden?
    festnetz = ttWeb.getCalltableField('BUSINESS');
	agentId = ttWeb.getUser().Login;
}


//Calls

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


// Call Terminieren
function call_terminate (terminator) {
    ttWeb.terminateCall(terminator);
}
    
if (!debug) {
    if ((callResultId == resultIdPositiv)) {
        insertIntoLog(
            "fatal",
            "Es wurde ein bereits positiver Datensatz erneut angerufen. Call wurde automatisch von der Maske termininiert.",
            "");
        ttWeb.clearRecording();
        alert("Kunde wurde schon positiv abgeschlossen!\n Achtung!\n Bei OK-Klicken wird aufgelegt!!");
        ttWeb.terminateCall('100');
    }
    if ((callResultId == resultIdNegativ)) {
        insertIntoLog(
            "fatal",
            "Es wurde ein bereits negativer Datensatz erneut angerufen. Call wurde automatisch von der Maske termininiert.",
            "");
        ttWeb.clearRecording();
        alert("Kunde wurde schon negativ abgeschlossen!\n Achtung!\n Bei OK-Klicken wird aufgelegt!!");
        ttWeb.terminateCall('200');
    }
}

    // Recording

    function record_start() {
        console.log("record_start") // JS analyse
        ttWeb.setRecordingState(3);
        //0 = ??, 1 = ??, 2 = ??, 3 = record, 
    }

    function record_stop(){
        console.log("record_stop") // JS analyse
        stopVoiceRecording(voicefileName);
        // voicefileName = (prefix, template, suffix, name1, name2)
    }
    
    function record_save() {
        console.log("record_save") // JS analyse
        ttWeb.saveRecording(voicefileName);
    }

    function record_clear() {
        console.log("record_clear") // JS analyse
        ttWeb.clearRecording();
    }


    //Logs

    function setLogPrio(log_level) {
        
        var intLevel=0;
        
        if(log_level=='debug') intLevel=0;
        if(log_level=='info')intLevel=1;
        if(log_level=='warning') intLevel=2;
        if(log_level=='error') intLevel=3;
        if(log_level=='fatal') intLevel=4;
    
        return intLevel;
    }

    function buildLogInsert(loglevel,logmessage,logexception) {
        
        loglevel=trim(loglevel).toLowerCase();

        switch (loglevel) { // "Loglevel" validieren
            case 'debug':
            case 'info':
            case 'warning':
            case 'error':
            case 'fatal':
                blnValidLoglevel = true;
                break;

            default:
                blnValidLoglevel = false;
                loglevel = "fatal";
        }
        
        if(!debug) { // IP-Adresse einfügen
            ip = ttWeb.getClientIP();
        }else{
            ip = "127.0.0.1";
        };
        
        // Erstellen des SQL-INSERTS mit den zu übergebenden Daten
        var sql = `INSERT INTO skon_log.ttweb (calldatatable_id, campaign_id, agent_id, log_level, log_message, log_exception, client_ip) 
            VALUES (
                ${calldatatableId}, 
                ${campaignId}, 
                ${agentId}, 
                ${loglevel}, 
                ${removeSlashes(logmessage)}, 
                ${logexception}, 
                ${ip}
            )`; // ist removeSlashes notwendig?

        return sql;
    }
    

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
            var tabs = $$('.tab_content');
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
            showZusammenfassung();
        }
    
        if (blnFinishPositive) {
            document.getElementById('abschliessen').style.display = 'block';
        }
    }

    function executeSql(sql) {

        if (!debug) {
            try {
                return ttWeb.execDatabase(sql);
            }catch (ex) {

                // Error protokollieren
                logSqlError(sql, ex.Message);
                return null;
            }
        }else {
            // Debug: Mit dem SQL-Connector kommunizieren   |   encodeURIComponent = URL-sezifisch Sonderzeichen ersetzten ( " " -> %20 , etc. )
            try {
                var result = null;
                new Ajax.Request('http://admin/outbound.dbconnector/index.php?sql=' + encodeURIComponent(sql), {
                    method: 'get',
                    asynchronous: false,
                    onSuccess: function(transport) {
                        result = transport.responseText.evalJSON();
                    },
                    onFailure: function() {
                        console.error('Fehler: Kann mich nicht mit dem Debug-SQL-Connector verbinden');
                    }
                });

                return result;

            }catch (ex) {
                console.error('Fehler beim Ausführen des Debug-SQL-Befehls: ' + ex.Message);
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
            console.error('Fehler beim Protokollieren des SQL-Fehlers: ' + ex.Message);
        }
    }


// ############################################################################################## GATEKEEPER #############################################################################################
//  Kurze Beschreibung:
//  Eine der wichtigsten Logiken ist das Öffnen und Schließen von Modalen oder Elementen. Hier soll der Gatekeeper Abhilfe schaffen. 
//  An die Funktion wird entweder ein Array (Aufbau siehe Beispiel) oder die ID des aufrufenden Gatekeeper-Selects übergeben. (siehe Components / Gatekeeper-Select)    
//  Die Funktion liest aus dem Array, welche Aktionen bei welchem Select.value ausgeführt werden sollen. Die verfügbaren Aktionen sind: close, open & openOnly.
//  "open" und "close" toggeln d-none in der Classlist des targets. "openOnly" schließt erst alle Mitglieder der switchGrp (data-grp = "gruppenName") und öffnet dann.
//  Wenn target = "all" genutzt wird, wird ebendfalls an allen Gruppenmitgliedern, die gewählte Aktion ausgeführt.
//  Der Bool für alwaysClose nacht open = openOnly [die Option ist obsolet und wird in Phase 3 ausgetauscht / Platzhalter]
//
//  Beispiel:
//
//  gatekeeper([[thisSelect, switchGrp, alwaysClose],            <<       string, string, boolean         [HEADER]    = Select = null --> Alle Elemente = d-none | data-grp | onChange Alles = d-none)
//      
//      [value1, close, targetId1],                            <<       string, string, string          [OPERATION] = Element mit targetId = d-none
//      [value1, open, [targetId1, targetId2, targetId3]],     <<       string, string, Array[string]   [OPERATION] = Alle Element aus Array = display
//      [value2, openOnly, targetId3],                         <<       string, string, string          [OPERATION] = Alle Elemente außer targetId = d-none
//      [value3, close, all]                                   <<       string, string, string          [OPERATION] = Alle Elemente = d-none
//  ])    


function gatekeeper(actionArr) {
    let gateArr;
    let select;
    let switchGrp; 
    let awCl; // alwaysClose bool
    
    if (Array.isArray(actionArr)) { //<<<>>> wenn actionArr = Array[]
        [select, switchGrp, awCl] = [
            document.getElementById(actionArr[0][0]),
            document.querySelectorAll(`[data-grp=${actionArr[0][1]}]`),
            actionArr[0][2]
        ];
    }else {                         //<<<>>> wenn actionArr = Select.id
        gateArr = JSON.parse(actionArr.getAttribute("data-array").replace(/&quot;/g, `"`));
        gateArr.forEach(entry => {  // säubere String für .parse und baue Array
            if (entry.length > 3) { // wenn [inner[]] > 3, packe Alles ab [n][2] in neues Array auf [n][3]
                entry[2] = [entry.slice(3)];
                entry.length = 3;
            }                       //  --- Erklärung :
        });                         //      Mit dem was an die Funtion übereben wird, wird ein Array aufgebaut, 
        [select, switchGrp, awCl] = [//     welches alle Anweisungen für die Zustände des jeweilige Select enthält.
            actionArr,
            document.querySelectorAll(`[data-grp=${actionArr.getAttribute("data-trigger")}]`),
            actionArr.getAttribute("data-awCl") === "true"
        ];
    }   

    gateArr.forEach(operation => {  // <<<>>> Aufträge durchsuchen
        let [value, action, target] = operation; 
        if (value === select.value) { 
            try {                   // <<<>>> Auftrag für aktuelle Select.value ausführen
                if (action === 'openOnly' || awCl) {  // wenn openOnly oder alwaysClose --> Gruppe = d-none
                    switchGrp.forEach(element => element.classList.add('d-none'));
                } else if (target === 'all') {        // wenn all --> target = Gruppe
                    switchGrp.forEach(element => 'open' ? element.classList.remove('d-none') : element.classList.add('d-none'));
                };
                
                switch (action) {   // <<<>>> action ausführen
                    case 'close':
                        (Array.isArray(target) ? target : [target]).forEach(id => { // prüfe ob (Target)Array
                            document.getElementById(id).classList.add('d-none');
                        });
                        break;
                
                    case 'open':
                    case 'openOnly':
                        (Array.isArray(target) ? target : [target]).forEach(id => { // prüfe ob (Target)Array
                            document.getElementById(id).classList.remove('d-none');
                        });
                        break;
                
                    default:
                        debug && console.log(`Error: gatekeeper von "${select.id}" hat fehlerhafte action: "${action}" ${gateArr}`);
                } 

            }catch (error) { //  Error Nachrichten
                debug && console.log(`>>Fehler<< gatekeeper von "${select.id}" wurde fehlerhaft ausgeführt! \n Error: ${error.message}`);
            };
        };
    });
}

    

    // ########################################################################### VALIDATORS ############################################################################################################
    //
    //  Die Idee ist es den Validierungsprozess so einfach wie möglich zu halten.
    //  Hierfür sollen die zu prüfenden Inputs anhand ihrer IDs zusammengefasst werden.
    //  Das Bündeln der ID kann dann händisch oder via Funktion erledigt werden
    //
    //  let rufnummerInputs = [
    //      "teleInput1",
    //      "teleInput2"
    //  ];
    //
    //  validateRufnummer(rufnummerInputs, false)
    //  
    //  validateRufnummer(bundleInputs("rufNrTxtBox"), false)
    //

    function validateInput(type, idArr, giveAwnser) { // Array, Boolean
        
        let regX;
        let errTxt; 
        let boolErr = false;

        switch (type) { // RegEx und Fehlernachricht nach Type auswählen

            case 'telenr':
                regX = /^0[1-9][0-9]+$/;
                errTxt = "Ungültige Telefonnummer!";
                break;

            case 'plz':
                regX = /^[0-9]{5}$/;
                errTxt = "Ungültige Postleitzahl!";
                break;

            case 'handynr':
                regX = /^(?:\+49|0)(?:\d{3,}|(\d|\s){5,})$/;
                errTxt = "Ungültige Handynummer!"
                break;

            case 'email':
                regX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                errTxt = "Ungültige E-Mail-Adresse!";
                break;
            
            default:
                regX = /^(?!.*)/; // default = Alles verboten
                errTxt = "Ungültige Eingabe";
        };

        try {
            idArr.forEach(id => { // ArrayEinträge Iterieren -> gegen RegEx prüfen
                let target = document.querySelector(`#${id}`).value;
                let errTxtId = id.toString() + "_errorMsg";
                boolErr = regX.test(target);
        
                if (boolErr) {
                    document.querySelector(`#${errTxtId}`).innerHTML = "";
                } else {
                    document.querySelector(`#${errTxtId}`).innerHTML = errTxt;
                }
            });
            debug && console.log(`validateInput: Ergebniss = ${boolErr} \n${idArr}`);
            return giveAwnser ? boolErr : undefined;
            //  Error Nachrichten und return
        }catch (error) {
            debug && console.log(`Error: validateInput mit Array: \n${idArr}`);
            return giveAwnser ? false : undefined;
        }
    }


    function validateDatum(dateArr, targetDate, giveAwnser) { // Array, "tt.mm.jjjj", Boolean
        for (let i = 0; i < dateArr.length; i++) {
            let boolErr = false;
            // let overTime = false;   <-- bool for Date out of range 
            let regX = /^(\d{2})\.(\d{2})\.(\d{4})$/;
            let target = document.querySelector(dateArr[i]).value;
            let errTextId = target.replace(/^([^_]*)_/, "$1_error_");
            boolErr = regX.test(target);
    
            if (boolErr) {  // Überprüfen, ob das optionale Zieldatum überschritten wird
                if (targetDate && new Date(dateArr[i]) > new Date(targetDate)) {
                    document.querySelector(errTextId).innerHTML = "";
                    //overTime = true
                }else {
                    document.querySelector(errTextId).innerHTML = "";
                }
            }else {
                document.querySelector(errTextId).innerHTML = "Ungültiges Zeitformat!";
            }
        }
        debug && console.log(`validateDatum: Ergebnis = ${boolErr} Zieldatum=${targetDate} \n${dateArr} \n${errTextId}`);
        if (giveAwnser){return boolErr;};
    }

    
    function validateIBAN(ibanArr, bicArr, giveAwnser) { // Array, Array, Boolean

        for (let i = 0; i < ibanArr.length; i++) {
            let boolErr = false;
            let regX = /^(DE\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{2})$/;
            let target = document.querySelector(ibanArr[i]).value;
            let errTextId = target.replace(/^([^_]*)_/, "$1_error_");
            boolErr = regX.test(target);
    
            if (boolErr) {
                new Ajax.Request(`http://admin.skon.local/klicktel/bankcheck_iban.php?iban=${ibanArr[i]}&bic=${bicArr[i]}`, {
                    method:'get',
                    asynchronous: false,
                    onSuccess: function(transport){
                        if(transport.responseText !== '1') {
                            document.querySelector(errTextId).innerHTML = transport.responseText;
                            boolErr = false;
                        }else {
                            document.querySelector(errTextId).innerHTML = "";
                        }
                    },
                    onFailure: function(){ 
                        alert('Keine Verbindung zur Bank-Validierungs-DB'); 
                    }
                });
            }else {
                document.querySelector(errTextId).innerHTML = "Ungültige IBAN!";
            }
        }
        debug && console.log(`validateIBAN: Ergebnis = ${boolErr} \n${ibanArr} \n${bicArr} \n${errTextId}`);
        if (giveAwnser){return boolErr;};
    }

// ###################################################################################################### HELPER ##############################################################################################
    
    function toggleChildReq (sectionID, newValue) { // element.id, 'true' & 'false' (as String)

        let parentElement = document.getElementById(sectionID);
        let childElements = parentElement.querySelectorAll('[required]');
        
        childElements.forEach(child => { 
            if (child.hasAttribute('data-required')) {
                child.setAttribute('data-required', newValue);
            };
        });
    }

    function bundleInputs(byClassName, onlyReq) { // String, Boolean 
        // Nutze ClassName um ein ID-Array zu erstellen 
        // bool = true -> nutze nur aktive required Elemente
        
        let bundle = document.querySelectorAll(`.${byClassName}`);
        let ids = []; 
        bundle.forEach(element => {
            if(!onlyReq) {
                ids.push(element.id);
            }else {
                if (element.getAttribute('data-required') === 'true') {
                    ids.push(element.id);
                }
            }
        });
        return ids; 
    }






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
    
    //  Eine der wichtigsten Logiken ist das Öffnen und Schließen von Modalen oder Elementen. Hier soll der Gatekeeper Abhilfe schaffen. 
    //  An die Funktion wird entweder ein Array (Aufbau siehe Beispiel) oder die ID des aufrufenden Gatekeeper-Selects übergeben. (siehe Components / Gatekeeper-Select)    
    //  Die Funktion liest aus dem Array, welche Aktionen bei welchem Select.value ausgeführt werden sollen. Die verfügbaren Aktionen sind: close, open & openOnly.
    //  "open" und "close" toggeln d-none in der Classlist des targets. "openOnly" schließt erst alle Mitglieder der switchGrp (data-grp = "gruppenName") und öffnet dann.
    //  Wenn target = "all" genutzt wird, wird ebendfalls an allen Gruppenmitgliedern, die gewählte Aktion ausgeführt.
    //
    //  Beispiel:
    //  gatekeeper([
    //      [thisSelect, switchGrp, alwaysClose],                  <<       string, string, string        [HEADER]    = Select = null --> Alle Elemente = d-none | data-grp | FolgeFunktion )
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
        let nextFunc; // alwaysClose bool
        
        if (Array.isArray(actionArr)) { //<<<>>> wenn actionArr = Array[]
            [select, switchGrp, nextFunc] = [
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
            [select, switchGrp, nextFunc] = [//     welches alle Anweisungen für die Zustände des jeweilige Select enthält.
                actionArr,
                document.querySelectorAll(`[data-grp=${actionArr.getAttribute("data-trigger")}]`),
                actionArr.getAttribute("data-call")
            ];
        }   
        gateArr.forEach(operation => {  // <<<>>> Aufträge durchsuchen
            let [value, action, target] = operation; 
            if (value === select.value) { 
                try {                   // <<<>>> Auftrag für aktuelle Select.value ausführen
                    if (action === 'openOnly') {  // wenn openOnly oder alwaysClose --> Gruppe = d-none
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
                    // Folgefunktion aufrufen, wenn actions abgeschlossen
                    typeof window[nextFunc] === 'function' ? window[nextFunc]() : console.log(`>>Fehler<< gatekeeper von "${select.id}" --> Funktion '${nextFunc}' existiert nicht.`);

                }catch (error) { //  Error Nachrichten
                    debug && console.log(`>>Fehler<< gatekeeper von "${select.id}" wurde fehlerhaft ausgeführt! \n Error: ${error.message}`);
                };
            };
        });
    }
// ######################################################################################### SILENT VALIDATORS #############################################################################################

    // Um zu prüfen, wann ein tab-content vollständig ausgefüllt ist, ohne es bei jeder
    // jeder Eingabe gegen einen Validator zu werfen, werden die Silent Validators genutzt.
    // Diese überprüfen, ob in einem sichbaren tab, alle Inputs [required], die in einem 
    // ebenfalls sichtbaren Fliedset liegen, ausgefüllt sind - ohne den Inhalt zu validieren.
    // Es werden keine ErrorMsg ausgegeben, daher silent...

    function checkInputs(tab_content) {
        let filled = true;
        
        // Prüfen, ob das (Tab-content)Elternelement die Klasse "d-none" trägt
        if (tab_content.classList.contains('d-none')) {

            // Sammel alle Inputs der Fieldsets, die nicht "d-none" sind aber das Attribut "required" haben
            let requiredInputs = tab_content.querySelectorAll(':scope > fieldset:not(.d-none) input[required]');
                    
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

    function validateSelect(optionId, optionValue){ 
        // Prüfe ob select den gewünschten wert hat gebe true or false zurück
        return document.getElementById(optionId).value === optionValue ? true : false;
     }

     function switchTab(tabName) {


     }

// ######################################################################################### BUNDLE VALIDATORS #############################################################################################
    
    //  Die Idee ist es den Validierungsprozess so einfach wie möglich zu halten.
    //  Hierfür sollen die zu prüfenden Inputs anhand ihrer IDs zusammengefasst werden.
    //  Das Bündeln der ID kann dann händisch oder via Funktion erledigt werden

    function bundleInputs(tab_content) {

        let inputsTypeArr = {   // (Hier im Kommentar: Inputs = Input & Select)
            txt: [],            // txt , handy , email , tel , plz , call und empty sind die einzigen zugelassenen Typen für 
            handy: [],          // die Validierung. Andere Strings laufen gegen eine Fehlermeldung unabhängig von dem Wert im
            email: [],          // Input. Inputs die kein [required] Attribut besitzten, werden von der Validierug ausgeschlossen.
            tel: [],            // Selects werden nur darauf geprüft, ob sie > null sind. Soll ein Select darauf geprüft werden, ob
            plz: [],            // eine bestimmte option ausgewelt wurde; benötigt das Select data-call = "validateSelect(option.value)".    
            call: [],
            empty: [],
            default: []
        };
        // Sammel alle Inputs der Fieldsets, die nicht "d-none" sind aber das Attribut "required" haben
        let allInputs = tab_content.querySelectorAll(':scope > fieldset:not(.d-none) input');
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
    };

    //-------------------------------------- Vaidierung der Bundles ----------------------------------------

    function validateInput(type, idArr, giveAnswer) { // String, Array, Boolean
        
        let regX;                   //  Das übergebene Array enthält die IDs jener Inputs, die einem ValiTyp
        let errTxt;                 //  zugewiesen sind. 
        let boolErr = true;         //
        let extVali = false; 

        switch (type) { // RegEx und Fehlernachricht nach Type auswählen

            case 'txt':
                regX = /^(?=.*\b[\p{L}\d\s.,:;!?()\[\]{}"'-]+\b)[\p{L}\d\s.,:;!?()\[\]{}"'-]{1,255}$/; 
                errTxt = "Ungültiger oder zu langer Text";
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
        
            case 'plz':
                regX = /^[0-9]{5}$/;
                errTxt = "Ungültige Postleitzahl!";
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
            debug && console.log(`validateInput: Ergebniss = ${boolErr} \n${idArr}`);
            return giveAnswer ? boolErr : undefined;
            
        }catch (error) { //  Error Nachrichten und return
            debug && console.log(`Error: validateInput mit Array: \n${idArr} \n Eintrag: ${id}`);
            return giveAnswer ? false : undefined;
        }
    }

// ######################################################################################  "EXTERN" VALIDATORS #############################################################################################

// Hier ist die große Auslage der Sonderwürste
// >> Wichtig! : Validierungen MÜSSEN ein bool zurückgeben -> true = positive Prüfung <<
    

    function validateDatum(dateArr, targetDate, giveAnswer) { // Array, "tt.mm.jjjj", Boolean
        for (let i = 0; i < dateArr.length; i++) {
            let boolErr = false;
            // let overTime = false;   <-- bool for Date out of range 
            let regX = /^(\d{2})\.(\d{2})\.(\d{4})$/;
            let target = document.querySelector(dateArr[i]).value;
            let errTextId = `${target}_errorMsg`;
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
        return giveAnswer ? boolErr : undefined;
    }

    
    function validateIBAN(ibanArr, bicArr, giveAnswer) { // Array, Array, Boolean

        //############################## WIP ###################################
                    function validateIBAN(iban,description,errorId,blnRequired) {

                var blnError=false;
                errorId.innerHTML='';

                if(isAlphaNumeric(iban)){

                    if (!iban.match(/[A-Z]{2}[0-9]{2}[A-Z0-9]+/)){
                        
                        blnError=true;
                        
                    }else{			
                        //blnError=isValidIBANNumber(iban);		
                        if(!isValidIBANNumber(iban)){				
                            blnError=true;				
                        }						
                    }		
                }else{
                    blnError=true;
                }

                if(blnError) errorId.innerHTML='IBAN ung&uuml;ltig';

                return !blnError;
                }


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


                /*
                * Returns 1 if the IBAN is valid 
                * Returns FALSE if the IBAN's length is not as should be (for CY the IBAN Should be 28 chars long starting with CY )
                * Returns any other number (checksum) when the IBAN is invalid (check digits do not match)
                */
                function isValidIBANNumber(input) {	

                var CODE_LENGTHS = {
                    AD: 24, AE: 23, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22, BR: 29,
                    CH: 21, CR: 21, CY: 28, CZ: 24, DE: 22, DK: 18, DO: 28, EE: 20, ES: 24,
                    FI: 18, FO: 18, FR: 27, GB: 22, GI: 23, GL: 18, GR: 27, GT: 28, HR: 21,
                    HU: 28, IE: 22, IL: 23, IS: 26, IT: 27, JO: 30, KW: 30, KZ: 20, LB: 28,
                    LI: 21, LT: 20, LU: 20, LV: 21, MC: 27, MD: 24, ME: 22, MK: 19, MR: 27,
                    MT: 31, MU: 30, NL: 18, NO: 15, PK: 24, PL: 28, PS: 29, PT: 25, QA: 29,
                    RO: 24, RS: 22, SA: 24, SE: 24, SI: 19, SK: 24, SM: 27, TN: 24, TR: 26
                };
                var iban = String(input).toUpperCase().replace(/[^A-Z0-9]/g, ''), // keep only alphanumeric characters
                        code = iban.match(/^([A-Z]{2})(\d{2})([A-Z\d]+)$/), // match and capture (1) the country code, (2) the check digits, and (3) the rest 
                        digits;
                // check syntax and length
                if (!code || iban.length !== CODE_LENGTHS[code[1]]) {
                    return false;
                }
                // rearrange country code and check digits, and convert chars to ints
                digits = (code[3] + code[1] + code[2]).replace(/[A-Z]/g, function (letter) {
                    return letter.charCodeAt(0) - 55;
                });
                // final check
                //return mod97(digits);
                return mod97(digits) === 1;
                }

                function mod97(string) {
                var checksum = string.slice(0, 2), fragment;
                for (var offset = 2; offset < string.length; offset += 7) {
                    fragment = String(checksum) + string.substring(offset, offset + 7);
                    checksum = parseInt(fragment, 10) % 97;
                }
                return checksum;

                }

                function validateIdData(idNumber, idType) {
                var rueck = false;
                var idNumberNew = idNumber;

                if (idNumber.length < 9 || idNumber.length > 11){
                    rueck = false;
                } else {



                }
                if (idNumber.length == 11){
                    idNumberNew = idNumber.substr(0,-1);
                }



                }
    }

// ###################################################################################################### HELPER ##############################################################################################
    
   


     
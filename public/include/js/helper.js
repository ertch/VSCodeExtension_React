//___________________________________________________________________________________________________________________________________________
//                                        _                    __                  _   _                 
//                              /\  /\___| |_ __   ___ _ __   / _|_   _ _ __   ___| |_(_) ___  _ __  ___ 
//                             / /_/ / _ \ | '_ \ / _ \ '__| | |_| | | | '_ \ / __| __| |/ _ \| '_ \/ __|
//                            / __  /  __/ | |_) |  __/ |    |  _| |_| | | | | (__| |_| | (_) | | | \__ \
//                            \/ /_/ \___|_| .__/ \___|_|    |_|  \__,_|_| |_|\___|\__|_|\___/|_| |_|___/
//                                         |_|                                                           
//___________________________________________________________________________________________________________________________________________

// INHALTSVERZEICHNIS
/**
 *  1
 *  2
 *  3
 *  4
 *  5
 *  6
 *  7
 *  8
 *  9
 * 10
 * 11
 * 12
 */

//_____________________________________________________________________________________________________________________________________________
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
/**
 *  1 - submitForm() 
 *                      Nutzer: ?
 *                      Senden einer Form
 *///_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    function submitForm(form_id) {
        document.getElementById(form_id).submit();
    };

//_____________________________________________________________________________________________________________________________________________
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
/**
 *  1 - lockTab() 
 *                      Nutzer: switchTab()
 *                      Sperrt das Wechseln der Pages bis zur erfolgreichen Validierung
 *///_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    function lockTab(tab_id, bool) {
        let allInputs = tab_id.querySelectorAll(':scope > input');
        allInputs.forEach(input => {
            input.disabled = bool ? true:false;
        });
    };

//_____________________________________________________________________________________________________________________________________________
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
/**
 *  2 - generateUUID() 
 *                      Nutzer: createLocalStorage(), setRecordName()
 *                      Errechnet eine hexadezimale V4 UUID
 *///_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

//_____________________________________________________________________________________________________________________________________________
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
/**
 *  3 - escapeString() 
 *                      Nutzer: ttErrorLog()
 *                      Singlequotes in einem String mit \\ escapen 
 *///_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    function escapeString(s) {
        try {   
            return s.replace(/'/g,"\\'");
        } catch (ex){
            logIntoDebug("escapeStrings()", "Das Einfügen von Escape-Zeichen \' ist fehlgeschlagen", Global.LogIntottDB)
        }
    };

//_____________________________________________________________________________________________________________________________________________
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
/**
 *  4 - removeSlashes() 
 *                      Nutzer: ttErrorLog()
 *                      Doppelte Backslashes mit Slash ersetzen
 *///_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    function removeSlashes(s){
        try { 
            return s.replace(/\\/g,"/");
        } catch (ex){
            logIntoDebug("removeSlashes()", "Das Entfernen von Backshashes ist fehlgeschlagen", Global.LogIntottDB)
        }
    };

//_____________________________________________________________________________________________________________________________________________
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
/**
 *  4 - autoResize() 
 *                      Nutzer: Textareas on blur 
 *                      Berechnet eine neue Höhe für die Textareas, um den neuen Text voll anzuzeigen (max. 200px)
 *///_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    function autoResize(textarea) {
        textarea.style.height = textarea.value===""? '40px' :'200px';
    } 

//_____________________________________________________________________________________________________________________________________________
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
/**
 *  4 - executeFunctionFromString() 
 *                      Nutzer: createCustomerPattern(), gatekeeper() 
 *                      Führt die Funktion aus, die im Sting 'funcString' genannt wird
 *///_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    function executeFunctionFromString(funcString) {
        let funcName = funcString.match(/^(\w+)\(/)?.[1];       // Extrahiert den Namen der Funktion aus der Zeichenkette
        let argsMatch = funcString.match(/\(([^)]+)\)/)?.[1];   // Extrahiert die Argumente der Funktion aus der Zeichenkette
        let args = argsMatch ? argsMatch.split(',').map(arg => arg.trim()) : [];  // Zerlegt die Argumente in ein Array
        let giveBack;
        // Prüft, ob die extrahierte Funktion existiert und eine Funktion ist
        if (funcName && typeof window[funcName] === 'function') {
        giveBack = window[funcName](...args); // Aufruf
        } else {
            logIntoDebug( "executeFunctionFromString():",`<I class='txt--bigRed'>Error:</I> Aufgerufene Funktion ${funcName} existiert nicht.`, Global.LogIntottDB); //Error_msg
        }
        return giveBack;
    };

//_____________________________________________________________________________________________________________________________________________
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
/**
 *  5 - beep() 
 *                      Nutzer: unbekannt
 *                      Führt eine Funktion aus, bei der niemand genau weiß, was sie tut ;P
 *///_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    function beep(d, f, v){
        return new Promise((resolve, reject) => {
            d = d || 200;
            f = f || 440;
            v = v || 100;
            try{
                let osci = myAudioContext.createOscillator();
                let gainNode = myAudioContext.createGain();
                osci.connect(gainNode);
                osci.frequency.value = f;
                osci.type= "square";
                gainNode.connect(myAudioContext.destination);
                gainNode.gain.value = v * 0.01;
                osci.start(myAudioContext.currentTime);
                osci.stop(myAudioContext.currentTime + d * 0.001);
                osci.onended = () => {
                    resolve();
                };
            }catch(error){
                reject(error);
            }
        });
    };

//_____________________________________________________________________________________________________________________________________________
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
/**
 *  5 - getSysTime(int) 
 *                      Nutzer: Wiedervorlage-Modal (save_Btn)
 *                      zurückgeben der aktuellen System-Uhrzeit
 *///_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    function getSysTime(add) {
        let now = new Date()
        let hours = String(now.getHours()).padStart(2, '0');
        let minutes = String(now.getMinutes() + add).padStart(2, '0');
        return `${hours}:${minutes}`;
    }

//_____________________________________________________________________________________________________________________________________________
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
/**
 *  5 - freezcalender() 
 *                      Nutzer: Wiedervorlage-Modal (onload)
 *                      Verhindern,dass Zeit oder Datum vor der localen Systemzeit im input angewählt werden können 
 *///_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    function freezcalender() {
        let today = new Date().toISOString().split('T')[0];
        document.getElementById('wiedervorlage_date').setAttribute('min', today);
        document.getElementById('wiedervorlage_date').value = today;
        document.getElementById('wiedervorlage_time').value = getSysTime(2);
    }

//_____________________________________________________________________________________________________________________________________________
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
/**
 *  5 - devlogSize() 
 *                      Nutzer: DevLog_BTN (onclick)
 *                      Größe des Devlogs ändern (30% / 90%)
 *///_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    function devlogSize() {
        let devLog = document.getElementById('debugLog');
        let btn = document.getElementById('devLog_size_Btn');
        if (devLog.classList.contains("debug-window")) {
            devLog.className = "debug-window--full"
            btn.innerHTML = "Kleiner";
        } else {
            devLog.className = "debug-window";
            btn.innerHTML = "Größer";
        }
    };
//_____________________________________________________________________________________________________________________________________________
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
/**
 *  5 - refreshModals() 
 *                      Nutzer: Modale (onload)
 *                      Setzt die Inputs der Modale zurück, sofern diese nicht gespeichert wurden
 *///_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _

 function refreshModals() {
    let modale = [['freedial','finish_freedial'],['recall','finish_wiedervorlage'],['apne','finish_apne']];
    modale.forEach((modal)=>{
        let m = document.getElementById(modal[0]);
        if(document.getElementById(modal[0]).getAttribute('data-saved') == '0') {
            document.getElementById(modal[1]).reset();
        }   
    })
 }
//_____________________________________________________________________________________________________________________________________________
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
/**
 *  5 - debugWindowClear() 
 *                      Nutzer: DebugLog 
 *                      Setzt den Inhalt des Logs zurück
 *///_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _

 function debugWindowClear() { // Log löschen
    document.getElementById("debugLog").innerHTML = `
        <div class="debugLog--header">
            <div>
                <i class="glyph glyph-code"> &nbsp; DebugLog &nbsp;</i>
                <button
                    type="button"
                    onclick="debugWindowClear()"
                >   clear
                </button>
            </div>
            <button type="button" id="devLog_size_Btn" onclick="devlogSize()">Größer</button> 
        </div>
    `;
};
//_____________________________________________________________________________________________________________________________________________
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
/**
 *  5 - splitRecName() 
 *                      Nutzer: DebugLog 
 *                      Setzt den Inhalt des Logs zurück
 *///_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    function splitRecName() {
        let voicefileName = setRecordName();
        return teile = voicefileName.split("\\");
    };
//_____________________________________________________________________________________________________________________________________________
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
/**
 *  5 - formatDateForDB() 
 *                      Nutzer: pushSQL(), finish()
 *                      Datumsformate in DB-Format bringen.
 *///_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    function formatDateForDB(incomming) {
        let fixeddate = new Date(incomming);
        fixeddate.setHours(fixeddate.getHours() + 2); // Ausgleich für GMT 0
        let formattedDate = fixeddate.toISOString().slice(0, 19).replace('T', ' ');
        return formattedDate;
    }
//_____________________________________________________________________________________________________________________________________________
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
/**
 *  5 - PopUp-Modal-Listener() 
 *                      Nutzer:  
 *                      Öffnet die PopUp-Modale bei Klick auf die Buttons
 *///_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _

    document.addEventListener("DOMContentLoaded", function() {

        const dialogList    = document.getElementsByTagName("dialog");
        const showButtonList = document.getElementsByClassName("calldialog");
        const closeButtonList = document.getElementsByClassName("closedialog");
        
        // "Show the dialog" button opens the dialog modal
        for(let x = 0; x < showButtonList.length; x++) {
            showButtonList[x].addEventListener("click", () => {
                refreshModals()
                dialogList[x].showModal();
                freezcalender(); //setzten der aktuellen Systemzeit im Modal
            });
        }
        // "Close" button closes the dialog
        for(let x = 0; x < closeButtonList.length; x++) {
            closeButtonList[x].addEventListener("click", () => {
                dialogList[x].close();
            });
        }
    });

//_____________________________________________________________________________________________________________________________________________
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
/**
 *  5 - createAddressDataArray()                                                                                    NESSI?
 *                      Nutzer:  Nutzer-Anwendungen
 *                      SQL Datenobjekte zu Array umwandeln
 *///_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _

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

//_____________________________________________________________________________________________________________________________________________
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
/**
 *  5 - productionTime() 
 *                      Nutzer: WiedervorlageModal
 *                      Überprüfen der angegebenen Rückrufzeit gegen die Sperrzeit
 *///_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _

    function productionTime() {
        // Zeigt im Modal Wiedervorlage im Uhrzeit-Imput einen grünen Haken an, wenn die eingegebene Zeit nicht in der 
        // Global.sperrzeit liegt. Gedacht als visuelle Unterstützung des Useres
        const target = document.getElementById("wiedervorlage_time");
        const sysTime = Number(getSysTime(0).replace(/:/g, ''));
        const setTime = Number(target.value.replace(/:/g, ''));
        const workBeginn = Number(Global.sperrzeit.bis.replace(/:/g, ''));
        const workEnding = Number(Global.sperrzeit.von.replace(/:/g, ''));
        const dateInput = document.getElementById('wiedervorlage_date');
        const sameday = dateInput.getAttribute("min") === dateInput.value;
        let validTime = true;

        if (sameday===true) {
            setTime > sysTime? undefined : validTime = false;
        }
        setTime < workEnding && setTime > workBeginn? undefined : validTime = false;
        
        if (validTime) {
            target.classList.remove('check_time', 'errorborder');
            document.getElementById("wiedervorlage_time_error").innerHTML = "";
            return true;
        } else {
            target.classList.add('check_time');
            }
    }

//_____________________________________________________________________________________________________________________________________________
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
/**
 *  5 - logIntoDebug() 
 *                      Nutzer: Alle
 *                      Einfügen des Log in das DevLog-Element
 *///_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _

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

//_____________________________________________________________________________________________________________________________________________
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
/**
 *  5 - productionTime() 
 *                      Nutzer: Alle SQL-executions
 *                      EInfügen des ausgeführten Querys in das DevLog-Element
 *///_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _

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
    };

//_____________________________________________________________________________________________________________________________________________
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
/**
 *  5 - keyDown() 
 *                      Nutzer: KeyDown Event-Listener
 *                      Ausführen der Hotkeys
 *///_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _

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

        // Überprüfe, ob beide Tasten gleichzeitig gedrückt wurden
        if (keyCode1Pressed && keyCode2Pressed) {
            // Ändere die Sichtbarkeit des debug-Logs
            beep(220,55,45); // Frohe Ostern
            setTimeout(() => {beep(200,35,45)},290);
            document.getElementById("debugLog").classList.toggle("d-none");
            Global.debugMode && console.log("debuglog geöffnet!");
        }
        // Überprüfe, ob die zweite und dritte Taste gleichzeitig gedrückt wurden
        if (keyCode2Pressed && keyCode3Pressed) {
            // Setze den Inhalt des debug-Logs zurück
            debugWindowClear()        
        } 
    };

//_____________________________________________________________________________________________________________________________________________
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
/**
 *  5 - keyUp() 
 *                      Nutzer: KeyUp Event-Listener
 *                      Ausführen der Hotkeys
 *///_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _

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

//_____________________________________________________________________________________________________________________________________________
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
/**
 *  5 - createEndcard() 
 *                      Nutzer: SwitchTab
 *                      KeinPlan ob ich den noch brauche # TODO:
 *///_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    
    function createEndcard() { // NESSI?
        document.getElementById('weiterBtn').className = "d-none"; 
    };

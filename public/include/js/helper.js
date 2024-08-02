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
        textarea.style.height = 'auto';
        textarea.scrollHeight>40? textarea.style.height = (textarea.scrollHeight) + 'px' : textarea.style = ""; 
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
            logIntoDebug( "executeFunctionFromString:",`<I class='txt--bigRed'>Error:</I> Aufgerufene Funktion ${funcName} existiert nicht.`, Global.LogIntottDB); //Error_msg
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
 *  5 - freezcalender() 
 *                      Nutzer: Wiedervorlage-Modal (onload)
 *                      Verhindern,dass Zeit oder Datum vor der localen Systemzeit im input angewählt werden können 
 *///_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    function freezcalender() {
        let now = new Date();
        let hours = String(now.getHours()).padStart(2, '0');
        let minutes = String(now.getMinutes()).padStart(2, '0');
        let currentTime = `${hours}:${minutes}`;
        let today = new Date().toISOString().split('T')[0];
        document.getElementById('wiedervorlage_time').setAttribute('min', currentTime);
        document.getElementById('wiedervorlage_date').setAttribute('min', today);
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
 *  5 - debugWindowClear() 
 *                      Nutzer: DebugLog 
 *                      Setzt den Inhalt des Logs zurück
 *///_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
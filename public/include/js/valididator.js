addEventListener("handleMouseUp_", (event) => {});
// ######################################################################################### VALIDATORS #############################################################################################
let isValidating = 0;
 /** silent - Validierung der Inputs für User-Weitereitung
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

    function silent(page) {
        let page_content = page instanceof HTMLElement? page : document.getElementById(page);
        let filled = true; // visibleInputs = Alle Inputs und Selects der Page die sichtbar['required'] sind 
        let visibleInputs = getVisibles(page_content.id);  
        try{
            visibleInputs.forEach(input => {
                if (input.value == 0 || input.value == "") {   
                    filled = false; // Ist ein required-Input leer gib false aus
                }  
            })  
        } catch(error) {
            logIntoDebug("silent (Validation)", `Error: ${page_content.id} konnte nicht vallidiert werden`, LogIntottDB);
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
    function bundleInputs(page) {
        
        let successBool = true; 
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
            let validateSpecial = [];
            
            let visibleInputs = getVisibles(page);
            visibleInputs.forEach(input => {
                // Trenne zwischen Inputs und Selects 
                if (input.tagName == "SELECT") {
                    let sollVal = input.hasAttribute('data-required')? input.getAttribute('data-required'):"";
                    validateSpecial.push([input , `${sollVal}`]) 
                } else {
                    let valiTyp = input.hasAttribute('data-vali')? input.getAttribute('data-vali') :""; // Wenn data-vali nicht vorhanden ist -> type = default
                    if (valiTyp in inputsTypeArr) {
                        // valiTyp entspricht einem Namen in inputsTypeArr, füge es dem entsprechenden Array hinzu
                        inputsTypeArr[valiTyp].push(input.id);
                    } else {
                        // füge das Input in das Array "default" ein (Auffangbecken)
                        inputsTypeArr.default.push(input.id);
                    
                    }
                }
            });
            let validateResults = "";
            if(validateSpecial.length>0) {
                validateSpecial.forEach( data => {
                    let select = data[0];
                    if (select.value !== 0) {
                        if(data[1]=="") {
                            validateResults += `<span class='txt--orange'>Ohne soll-wert</span>  :  ${select.id} = ${select.value} <br>`; 
                        } else {
                            let shouldHave = JSON.parse(data[1]);
                            // Prüfe auf das 
                            let hit = shouldHave.some(value => value === "!0" ? select.value > 0 : value === select.value);
                            if(hit) { 
                                validateResults += `Validierung <span class='txt--green'>true</span>  |  ${select.id} = "${select.value}"  <br>`;
                            } else {  
                                validateResults += `Validierung <span class='txt--red'>false</span>  |  ${select.id} = "${select.value}"  <br>`;
                                successBool = false; 
                            }
                        }
                    } else {
                        validateInput = false;
                        let errTxtId = `${select.id}_errorMsg`;
                        document.getElementById(errTxtId).innerHTML = "Fehler: Muss ausgefüllt werden";
                        validateResults += `Validierung <span class='txt--red'>false</span>  |  ${select.id} = "${select.value}"  <br>`
                        successBool = false;
                    }
                })
            }
            validateResults>""? logIntoDebug("validateSelects", validateResults, false): undefined;
            for (let valiTyp in inputsTypeArr) {  
                let idArr = inputsTypeArr[valiTyp];
                if (idArr.length > 0){
                    if (validateInput(valiTyp, idArr, true) === false) {
                        successBool = false;
                    };
                }
            } 
            return successBool;

        } catch (error) {
            logIntoDebug("bundleInputs:", "Error: Inputs konnten nicht gebundelt werden", false);
            return false;
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
    let successBool = true; 
    
    switch (type) { // RegEx und Fehlernachricht nach Type auswählen

        case 'txt':
            regX = /^.{1,255}$/; 
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
        
        if (idArr != 0) {
            typeof idArr==="string"? idArr=[idArr]:undefined;
            let logValidation ="";
            idArr.forEach(id => { // ArrayEinträge Iterieren -> Input.value auslesen
                let target = document.getElementById(id).value;
                let errTxtId = `${id}_errorMsg`;
                regX.test(target) ? undefined : boolErr = false; // prüfe Input.value gegen RegEx

                if (extVali === true) { // data-call.value -> 'String to function' 
                    let specVali = document.getElementById(id).getAttribute("data-call");
                    if (typeof window[specVali] === 'function') {   // wenn ext. Vali-function aufrufbar
                        window[specVali]() ? undefined : boolErr = false; // prüfe mit ext. Vali
                    }   
                };  

                if (boolErr) {
                    document.querySelector(`#${errTxtId}`).innerHTML = "";
                } else {
                    document.querySelector(`#${errTxtId}`).innerHTML = errTxt;
                    successBool = false
                }
                
                logValidation += ` Validierung: ${boolErr}  |  ${idArr} = "${target}"  <br>` ;   
            });
            logIntoDebug(`validateInput "${type}"`, logValidation, false);
            return giveAnswer ? successBool : undefined;
        }    
        
    }catch (error) { //  Error Nachrichten und return
        logIntoDebug( "validateInput:" ,`Error at array: ${idArr} with ${id}`, LogIntottDB);
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
    logIntoDebug(`validateDatum`,`Ergebnis = ${boolErr} Zieldatum=${targetDate} \n${dateArr} \n${errTextId}`, fa);
    
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


/** Helper H-001
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
};

function validateSelect(optionId, optionValue){ // Prüfe ob select den gewünschten wert hat
    let select = document.getElementById(optionId);
    debug && console.log(select.value);
    return select.value === optionValue ? true : false;
 }

 function getVisibles(elementid) {
    // Prüfe, ob die Element ein Tab-Page oder dessen Eltern die Klasse 'd-none' hat oder 'display: none' verwendet
    let visibleInputs = [];
    let element = elementid instanceof HTMLElement? elementid : document.getElementById(elementid);
    try {
        let allInputs = element.querySelectorAll('input[required], select[required]');
        allInputs.forEach((currentElement) => {
            currentElement.offsetHeight>0? visibleInputs.push(currentElement) : undefined;
        })
        visibleInputs.length === 0?  logIntoDebug("getVisible","Kein [required]-Element gefunden", false) : undefined;
        return visibleInputs;
    }catch(error) {
        logIntoDebug("getVisible", `Error: ${element} konnte nicht verarbeitet werden <br> ${error.stack}`, false);
        return [];
    }
}

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

function callGatekeeper(gk){
    if(gk.getAttribute("data-cache") != gk.value) {
        gk.setAttribute("data-cache", gk.value);
        gatekeeper(gk);
    }
}
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/**     Um au der letzten Tab-Page (lastTab = "tab_zusammenfassung") nru jene elemente anzuziegen  die auch gebraucht oder gefordert sind, nutzt man das IfDiv-
 *      dieses hat die jeweilige Bedingung direkt im data-Attribute. So kann bei jeder Validierung die jeweiligen IfDivs der Seite aufgerufen werden oder bei CallEndcard()
 *      können die auf der Endcard hinterlegeten IfDivs geladen werden.
 * 
 */
function ifTheDivs(tabPage) {
    let calledDivs = document.getElementById(tabPage).querySelectorAll('.ifDiv');

    calledDivs.forEach(ifDiv => { // Hole Vorgaben aus Elementen
        let validationBool = true;
        let ifcheck = stringToArray(ifDiv.getAttribute("data-if"));
        let lastStatus = "";
        let lastBool = true;

        ifcheck.forEach(([status, elementId]) => { //prüfe Vorgaben
            let currentBool;
            let hasVal;
            let checkstatus = (status === "and" || status === "or") ? lastStatus : status;
            let element = document.getElementById(elementId);
            // trenne wert aus "hasValue{wert}"
            if(status.includes("hasValue")) {
                prefix = status.split('{')[1];
                hasVal = prefix.replace(/}/,"");
                checkstatus = status.split('{')[0];
            }

            switch (checkstatus) { // Prüfung auf...
                case "active":
                    currentBool = element.offsetHeight > 0 ;    // wird angezeigt
                    break;
                case "hidden":
                    currentBool = element.offsetHeight === 0;   // wird nicht angezeigt
                    break;
                case "filled":
                    currentBool = element.value.trim() !== "";  // hat Wert > ""
                    break;
                case "empty":
                    currentBool = element.value.trim() == "";   // hat keinen Wert
                    break;
                case "hasValue":
                    let isValue;                                // hat Wert X
                    try{
                        isValue = document.getElementById(elementId).value;
                    } catch(e) {
                        try{
                            isValue = eval(elementId); // Wenn Wert X nicht value eines Elementes ist, versuche Variablen
                        } catch (er) {
                            logIntoDebug( "ifTheDiv",`<I class='txt--bigRed'>Error:</I> "${elementId}" ist weder Element noch Variable`, false);
                        }  
                    }
                    currentBool = hasVal === isValue;
                    break;
                default:
                    currentBool = true;                         
                    logIntoDebug( "ifTheDiv",`<I class='txt--bigRed'>Error:</I> falscher Status "${checkstatus}"`, false); 
            }
            if (status === "and") { // and und or operatoren auswerten mit vorrangegangener Prüfung
                currentBool && lastBool? undefined : validationBool = false;
            } else if (status === "or") {
                currentBool || lastBool? undefined : validationBool = false;
            } else {
                currentBool? undefined : validationBool = false;
            }
           
            lastBool = currentBool;
            lastStatus = checkstatus;
        }); // schalte Element sichtbar / hidden
        if (validationBool && ifDiv.classList.contains("d-none")) {
            ifDiv.classList.remove("d-none");
        } else if (!validationBool && !ifDiv.classList.contains("d-none")) {
            ifDiv.classList.add("d-none");
        }
    });
}
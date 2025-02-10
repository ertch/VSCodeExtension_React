//                                                         _   _   _____    _ _ _                ____             __ _       
//                                                        | |_| |_| ____|__| (_) |_ ___  _ __   / ___|___  _ __  / _(_) __ _ 
//                                                        | __| __|  _| / _` | | __/ _ \| '__| | |   / _ \| '_ \| |_| |/ _` |
//                                                        | |_| |_| |__| (_| | | || (_) | |    | |__| (_) | | | |  _| | (_| |
//                                                         \__|\__|_____\__,_|_|\__\___/|_|     \____\___/|_| |_|_| |_|\__, |
//                                                                                                                     |___/ 
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ Global Var +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

let CustomerPattern;   // Array des Kampagnien-Table bzw. Kundendaten  / pattern => provider_lib.js
let agentId;        // ID des Agenten
let clientIP;

let ttWeb = new Object();   // Objekt für ttFrame-API
let recordingName;          // Name des Recordings

let keyCode1Pressed = false; // Status des ersten Hotkey (Tabulator)
let keyCode2Pressed = false; // Status des zweiten Hotkey (D)
let keyCode3Pressed = false; // Status des dritten  (C)
let timer;
let keyPressStartTime;

let btnLock = false;
let pageLock = false;                   // wenn true, verhindert wechsel der Seite/Page
let buildupFail = false;
let TriggerData = triggerPattern();     // initialisierung TriggerData      (TriDa)
let CostumerData;                       // Erstellung global CustomerPattern   (CusDa)
let CurrCostumerData = new Object();    // Erstellung global neue CusDa     (CuCDa)
let SendBack = [];                      // Erstellung global SendBackfilter (SenBa)

let firstTab = "tab_start";
let lastTab = "tab_zusammenfassung";

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ Campaign Var ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

let campaignId = 679;

let resultIdPositiv = 8911;
let resultIdNegativ = 8912;
let resultIdWv = 8913;
let resultIdAbfax = 8915;

let resultIdApne0h = 8916;
let resultIdApne1h = 8917;
let resultIdApne2h = 8918;
let resultIdApne3h = 8919;
let resultIdApne4h = 8920;
let resultIdApne5h = 8921;
let resultIdApne6h = 8922;
let resultIdApne8h = 8923;
let resultIdApne20h = 8924;

let Global = {
	currentTabName: `${firstTab}`,

	directionState: 0,                      // Aktueller Call state
	startCallwithState: 2,                  // Call state bei Beginn des Anrufes
	startRecWithBuildUp: false,             // wenn true, wird die Aufnahme direkt bei öffnen des Dokuments gestartet
	startRecWithCall: false,                // wenn true, wird die Aufanhme bei tätigigen des Anrufes gestartet
	onNegDeleteRec: true,                   // Im Falle eines Negativen Abschlusses wird das Audiofile verworfen.

	debugMode: true,                        // Wenn true, dann wird mit SQL-Fakeconnector verbunden
	showDebug: true,                        // Wenn true, kann der Log auf der Seite eingeblendet werden (HotKey = [Tab] + [D])
	logIntottDB: false,                     // Wenn true, werden Errormsg an die ttFrameDB geschickt (ausschließlich SQL-querys)
	logGK: true,                            // Gatekeeper in Log anzeigen
	logSQL: true,                           // SQL-Statemants in Log anzeigen
	showStats: false,                       // wenn true, lade AbschlussStatistik (in DebugLog)

	addressdatatable: "ste_wel_addressdata",    // SQL adresstable
	key2: "9826",                    // ID des Kampagnien-CallTable (aus DB)
	salesdatatable: "ste_wel_addressdata",      // SQL datatable
	fieldname_firstname: "firstname",           // SQL column-Bezeichner
	fieldname_lastname: "surname",              // SQL column-Bezeichner

	nestor: "http://admin/outbound.dbconnector/index.php?sql=", // URL des Debog-Connector

	recordingPrefix:
		"\\\\192.168.11.14\\Voicefiles_Phoenix\\VF_Diverse\\ste_wel\\",     // Path zur Ablage der Audiodatei auf dem Fileserver
	FileNamePattern: ["date", "time", "agentId", "customerid", "ste_wel"],  // nutzbar sind strings, date, time, alle globalen Variablen und alle Values in CustomerPattern (key match)
	recordingNameSuffix: ".mp3",                                            // Suffix der Audiodatei
	recordFileName: "",                                                     // Bsp. [ "", "", "192.169.18.11",  "Voicefiles_Phoenix",  "VF_Diverse",  "Kampagnenname", "filename.Suffix"]
	terminationCode: "",

	wiedervorlage: false,                   // wenn true, lade WiedervorlageDaten
	wievorElement: "html-Element.id",       // Lade WiedervorlageDaten in dieses Element

	posSale: false,                         // Indikator für positiven Verkauf
};

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ ProviderPattern ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    function providerPattern() {
        let CustomerPattern = [
            { label: '!red:Vorname',         match: 'firstname',             value: "",   standAlone: true,     createCell: true , dbType: "VARCHAR"},
            { label: '!yel:Nachname',        match: 'surname',               value: "",   standAlone: true,     createCell: true , dbType: "VARCHAR"},
            { label: '!gre:Geb.-Datum',      match: 'dateofbirth',           value: "",   standAlone: true,     createCell: true , dbType: "VARCHAR"},
            { label: 'E-Mail',          match: 'emailprivate',          value: "",   standAlone: true,     createCell: true , dbType: "VARCHAR"},
            { label: '',                match: 'separator',             value: "",   standAlone: true,     createCell: true , dbType: "VARCHAR"},
            { label: 'Kundennummer',    match: 'customerid',            value: "",   standAlone: true,     createCell: true , dbType: "VARCHAR"},
            { label: 'Vertragsnummer',  match: 'vertrag',               value: "",   standAlone: true,     createCell: true , dbType: "VARCHAR"},
            { label: 'Zählernummer',    match: 'counternumber',         value: "",   standAlone: true,     createCell: true , dbType: "VARCHAR"},
            { label: 'Vorwahl',         match: 'phonehomeareacode',     value: "",   standAlone: false,    createCell: true , dbType: "VARCHAR"},
            { label: 'Festnetz',        match: 'phonehome',             value: "",   standAlone: true,     createCell: true , dbType: "VARCHAR"},
            { label: 'Mobilvorwahl',    match: 'phonemobileareacode',   value: "",   standAlone: false,    createCell: true , dbType: "VARCHAR"},
            { label: 'Mobil',           match: 'phonemobile',           value: "",   standAlone: true,     createCell: true , dbType: "VARCHAR"},
            { label: '',                match: 'separator',             value: "",   standAlone: true,     createCell: true , dbType: "VARCHAR"},
            { label: 'Strasse',         match: 'street',                value: "",   standAlone: true,     createCell: true , dbType: "VARCHAR"},
            { label: 'Hausnummer',      match: 'housenumber',           value: "",   standAlone: true,     createCell: true , dbType: "VARCHAR"},
            { label: 'PLZ',             match: 'zip',                   value: "",   standAlone: true,     createCell: true , dbType: "VARCHAR"},
            { label: 'Ort',             match: 'city',                  value: "",   standAlone: true,     createCell: true , dbType: "VARCHAR"},
            { label: 'Produkt',         match: 'product',               value: "",   standAlone: true,     createCell: true , dbType: "VARCHAR"},
            { label: 'Startdatum',      match: 'startdate',             value: "",   standAlone: true,     createCell: true , dbType: "VARCHAR"},
        ];
        return CustomerPattern;
    } // TODO mache das auch Variablen eingetragen werden könne, dafür erste testten ob eine Vaiable hinter dem String sitzt und wenn

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ TriggerPattern ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                                                                                                  Funktion geprüft am: 22.05.24 von Erik

    function triggerPattern() {
        let TriggerData = [
            { id: 'PAtxt1',   grp:'a',    target_id: 'zusammenfassung_text',    active: false,       value: "<p>Hier könnte ihre Werbung stehen.</p>" },
            { id: 'PAtxt2',   grp:'a',    target_id: 'zusammenfassung_text',    active: false,       value: ""    },
            { id: 'NAtxt2',   grp:'a',    target_id: 'zusammenfassung_text',    active: true,        value: "<p>Keine nutzbaren Daten gefunden</p>"},
            { id: 'VEs01',    grp:'b',    target_id: 'zusammenfassung_text',    active: false,       value: "<p>Der Kunde hat einen bestehenden Stromvertrag.</p>"   },
            { id: 'VEg01',    grp:'b',    target_id: 'zusammenfassung_text',    active: false,       value: "<p>Der Kunde hat einen bestehenden Gasvertrag.</p>"     },
        ];
        return TriggerData;
    }

// TODO Manipulation der CustomerPattern-Value, um die Werte anzupassen

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ Anpassungen des RecordFileNames ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    function specialNames(varName) {
        let giveBack = "";      // Soll eine Variable in der RecordFileName einen besonderem Ausdruck entsprechen, kann dies hier

        switch (varName) {                              // VarName ist der Name der Variable, die durchgereicht wurde.

            case "agentId":                             // wird die Variable "agendID" aufgerufen,
                giveBack = `agent-${eval(varName)}`;    // erhält dieser Wert ein vorrangehendes "agend-" 
                break;

        //      Hier eigene Regeln erstellen

            case "meineRegeln":
                giveBack = `test-${eval(varName)} 1234`;    
                break;


        //---------------------------------------------------- Systemzeit -----------------------------------------------------
            case "date": // Datumserstellung
                let datum = new Date().toLocaleDateString("default", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                });
                datum = datum.includes("ä") ? datum.replace(/ä/g, "ae") : datum; // Umlaute (März) filtern
                datum = datum.replace(/\.+/g, "").replace(/\s+/g, ""); // tt(monat)yyyy = "23Mai2024"
                giveBack = datum;
                break;
            
            case "time": //Uhrzeiterstellung
                let time = new Date().toLocaleTimeString();
                let cache = time.split(":");
                time = `${cache[0]}${cache[1]}`; // Sekunden herausfiltern
                giveBack = `${time}uhr`; // hh_mm_uhr Format anwenden
                break;
        //---------------------------------------------------------------------------------------------------------------------

            default:                                    // Ist keine Regel definiert, wird nur der Wert ausgegeben.
                giveBack = eval(varName);
        }
        return giveBack;
    }



//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//======================================================================================================================================================================
//                                                        _____ _                           _        _                _      
//                                                       | ____| | ___ _ __ ___   ___ _ __ | |_     | |    ___   __ _(_) ___ 
//                                                       |  _| | |/ _ \ '_ ` _ \ / _ \ '_ \| __|    | |   / _ \ / _` | |/ __|
//                                                       | |___| |  __/ | | | | |  __/ | | | |_     | |__| (_) | (_| | | (__ 
//                                                       |_____|_|\___|_| |_| |_|\___|_| |_|\__|    |_____\___/ \__, |_|\___|
//                                                                                                              |___/        
//======================================================================================================================================================================

/**createCusomerCells
 *
 *          Diese Funktion erstellt CustomerCells basierend auf den angegebenen Daten.
 *          Sie durchläuft die Daten der DB und füllt die entsprechenden Werte in die CustomerPattern, bevor sie in die Cells via HTML eingefügt werden.
 */
    function createCustomerPattern() {
        let logCCD = "";
        let logCDO = "";
        try {
            const cardHolder = document.getElementById("customerCells");
            const error_msg = document.getElementById("customerCells_errorMsg");

            // Abrufen des CustomerPattern und SqlField
            let CustomerPattern = getAttribute(cardHolder, "data-provider", providerDefault);
            let SqlField = getAttribute(cardHolder, "data-query", queryDefault);

            // Überprüfen, ob die Datensätze vertauscht sind
            if (typeof SqlField.keys === 'function' && SqlField.keys("createCell")) {
                handleDataError(error_msg, logCCD);
            } else {
                error_msg.classList.add("d-none");

                // Update CustomerPattern mit Werten aus SqlField
                CustomerPattern.push({ label: `${Global.key1}`, match: `${Global.key1}`, value: "", standAlone: true, createCell: false, dbType: "VARCHAR" });
                updateCustomerPatternWithSqlField(CustomerPattern, SqlField);

                // Erstellen der HTML-Elemente für die Kundenzellen
                createCustomerCells(cardHolder, CustomerPattern, logCDO);

                logCCD += "<span class='txt--orange'>CustomerPattern</span> erfolgreich geladen <br><span class='txt--orange'>CustomerCards</span> erfolgreich erstellt <br>";
            }
        } catch (error) {
            logCCD += "<span class='txt--bigRed'>Error:</span> SQL-Ergebnisse konnten nicht in Cells geladen werden";
            if (Global.debugMode) console.log(error.stack);
        }

        // Laden und Anzeigen der Kundenhistorie
        loadCustomerHistory(logCCD);

        Global.showCDObuild && logIntoDebug("Build CustomerData", logCDO, false);
        logIntoDebug("createCustomerPattern", logCCD, false);
    }

    // Helper-Funktion zum Abrufen von Attributen und Standardwerten
    function getAttribute(element, attribute, defaultFunction) {
        const execute = element.getAttribute(attribute);
        return Global.noCustomerData ? [] : (execute ? executeFunctionFromString(execute) : defaultFunction());
    }

    // Fehlerbehandlung bei vertauschten Datensätzen
    function handleDataError(error_msg, logCCD) {
        error_msg.innerHTML = Global.noCustomerData ? "" : "Datensatz fehlerhaft";
        error_msg.className = "errormessage--db_error";
        logCCD += Global.noCustomerData ? 
            "<span class='txt--bigRed'>CustomerData abgeschaltet:</span> <br> kein Datensatz gefunden <br>" : 
            "<span class='txt--bigRed'>Error:</span> Datensatz fehlerhaft <br>";

        if (!Global.noCustomerData) {
            if (!Global.debugMode) {
                ttWeb.terminateCall(`${Result.neg_termination}`);
            } else {
                alert(`CALL TERMINIERT / CODE: ${Result.neg_termination}`);
            }
        }
    }

    // Aktualisieren des CustomerPattern mit Werten aus SqlField
    function updateCustomerPatternWithSqlField(CustomerPattern, SqlField) {
        CustomerPattern.forEach((item, index) => {
            const matchingKeyIndex = Object.keys(SqlField).indexOf(item.match);
            item.value = matchingKeyIndex > -1 ? SqlField[Object.keys(SqlField)[matchingKeyIndex]] : "-";
        });
    }

    // Erstellen der HTML-Elemente für die Kundenzellen
    function createCustomerCells(cardHolder, CustomerPattern, logCDO) {
        let cache = ""; // Zwischenspeicher für zu übertragende Werte

        CustomerPattern.forEach((item, i) => {
            let { label, match: id, value, standAlone, createCell } = item;
            let marker = "";

            if (label.includes("!")) {
                const [prefix, labelText] = label.split('!');
                label = labelText;
                switch (prefix) {
                    case "red":
                        marker = 'mark--red';
                        break;
                    case "grn":
                        marker = 'mark--green';
                        break;
                    case "yel":
                        marker = 'mark--yellow';
                        break;
                    default:
                        return; // Wenn ein unbekannter Marker gefunden wird, wird der Eintrag übersprungen
                }
                value = `<mark class=${marker}>${value}</mark>`;
            }

            if (id !== "separator") {
                CustomerData[id] = { index: i, value, label };
                logCDO += `CustomerData.${id} / .index = ${i} / .value = ${value} / .label = ${label} <br>`;
            }

            if (createCell) {
                if (!standAlone) {
                    cache = value;
                } else {
                    if (cache) value = `${cache} ${value}`;
                    cache = ""; // Zwischenspeicher zurücksetzen

                    const html = id !== "separator" ? `
                        <div class="cell">
                            <div class="cell__head">${label}</div>
                            <div class="data_value cell__data" id=${id}>${value}</div>
                        </div>
                    ` : `<div class='separator'></div>`;

                    cardHolder.innerHTML += html;
                }
            }
        });
    }

// Laden und Anzeigen der Kundenhistorie
function loadCustomerHistory(logCCD) {
    const historyCount = pullSQL("historyCount");
    const historyBox = document.getElementById('kundenhistorie');

    if (historyCount[0].length > 0) {
        let historyData = pullSQL("historyData")[0];
        let kundenhistorie = historyBox.innerHTML;

        historyData.rows.forEach(row => {
            kundenhistorie += `<p class="history">${row.fields.message}</p>`;
        });

        historyBox.innerHTML = kundenhistorie;
        logCCD += "Kundenhistorie erfolgreich geladen.";
    } else {
        historyBox.innerHTML += "Keine Historie verfügbar";
        logCCD += "<br><span class='txt--bigRed'>Error:</span> Keine Kundenhistorie gefunden.";
    }
}

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** loadProviderPreset() - AutoFill Vorgaben vom Provider
 *
 *      Wird im buildUp aufgerufen und Befüllt alle Inputs, oder selects, die das Attribute data-preset bestitzten.
 *      Der im Attribute abgelegte String besteht aus der id (CustomerPattern[match]) und einem optionalen "disabled"
 *      data-preset = "preS1,disabled" füt also den Wert von perS1 hinzu un disabled das Element
 */
    function loadProviderPreset() {
        let presetTargets = document.querySelectorAll("[data-preset]");
        if (presetTargets.length > 0) {
            let logInserts = "";
            presetTargets.forEach((target) => {
                let presetData = target.getAttribute("data-preset");
                let presetId;
                let presetState;

                if (presetData.includes(",")) {
                    // Splite den String am Komma, wenn verhanden
                    [presetId, presetState] = presetData
                        .split(",")
                        .map((item) => item.trim());
                } else {
                    // Wenn kein Komma vorhanden, nutze String unverändert
                    presetId = presetData;
                }

                try {
                    // Suche in CustomerPattern
                    CustomerPattern.some((entry) => {
                        // wenn passender Eintrag vorhanden, erstelle neue Option
                        if (entry.match === presetId) {
                            //Unterscheide zwischen Input und select
                            if (target.tagName === "SELECT") {
                                injectPreset = document.createElement("option");
                                injectPreset.text = entry.value;
                                injectPreset.value = entry.value;
                                target.appendChild(injectPreset);
                            }
                            target.value = entry.value;
                            logInserts += `Preset <span class"txt--blue">${presetId}</span> in <span class="txt--orange">${target.id}</span> geladen`;
                            // Wenn disable-Befehl übergeben target = disabled
                            if (presetState == "disabled") {
                                target.setAttribute("disabled", "");
                                logInserts +=
                                    " und <span class='txt--red'>disabled</span>.<br>";
                            } else {
                                logInserts += ".<br>";
                            }
                        }
                    }); // wenn nicht gefunden, versuche Variable aufzurufen
                } catch (error) {
                    // wenn gar nichts geht, nutzte String (von getInfo)
                    logInserts += `<I class='txt--bigRed'>Error:</I> <span class="txt--orange">${target.id}</span> hat Preset <span class="txt--blue">${presetData}</span> nicht erkannt.<br>`;
                }
            });
            logIntoDebug("loadProviderPreset", logInserts, false);
        } else {
            logIntoDebug("loadProviderPreset", "Keine Presets gefunden.", false);
        }
    }

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** PopUp & debugMode - Loader / watchdog                                                                                          Funktion geprüft am: 22.05.24 von Erik
 *
 *      Eventlistener für Popup-Modale
 */
    document.addEventListener("DOMContentLoaded", function () {
        const dialogList = document.getElementsByTagName("dialog");
        const showButtonList = document.getElementsByClassName("calldialog");
        const closeButtonList = document.getElementsByClassName("closedialog");

        // "Show the dialog" button opens the dialog modal
        for (let x = 0; x < showButtonList.length; x++) {
            showButtonList[x].addEventListener("click", () => {
                dialogList[x].showModal();
            });
        }

        // "Close" button closes the dialog
        for (let x = 0; x < closeButtonList.length; x++) {
            closeButtonList[x].addEventListener("click", () => {
                dialogList[x].close();
            });
        }
    });

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
*                                                                   ___      _       _                             
*                                                                  / _ \__ _| |_ ___| | _____  ___ _ __   ___ _ __ 
*                                                                 / /_\/ _` | __/ _ | |/ / _ \/ _ | '_ \ / _ | '__|
*                                                                / /_\| (_| | ||  __|   |  __|  __| |_) |  __| |   
*                                                                \____/\__,_|\__\___|_|\_\___|\___| .__/ \___|_|   
*                                                                                                 |_|              
*/
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    function gatekeeper(incomming) {
        let callingElement;
        let gateArr;
        let gate;
        let nextFunc; // alwaysClose bool

        // Prüfen, ob incomming ein Array, ein Element oder eine ID ist
        if (Array.isArray(incomming)) {
            // Wenn incomming ein Array ist, die relevanten Werte zuweisen
            [callingElement, gate, nextFunc] = [
                document.getElementById(incomming[0][0]),
                document.querySelectorAll(`[data-group=${incomming[0][1]}]`),
                incomming[0][2],
            ];
        } else {
            // Wenn incomming ein String (Id) ist get callingElement und die Anweisungen aus dem Datenattribut parsen und zuweisen
            incomming instanceof HTMLElement
                ? (callingElement = incomming)
                : (callingElement = document.getElementById(incomming));
            gateArr = callingElement
                .getAttribute("data-array")
                .replace(/\boo\b/g, "openOnly")
                .replace(/\bsv\b/g, "setValue")
                .replace(/\bo\b/g, "open")
                .replace(/\bc\b/g, "close")
                .replace(/\ba\b/g, "all")
                .replace(/\bt\b/g, "trigger")
                .replace(/\bd\b/g, "disable")
                .replace(/\be\b/g, "enable")
                .replace(/\.+/g, ",")
                .replace(/([^,\[\]]+)/g, '"$1"');
            gateArr = stringToArray(gateArr);
            //      Mit dem was an die Funtion übereben wird, wird ein Array aufgebaut,
            [gate, nextFunc] = [
                //     welches alle Anweisungen für die Zustände des jeweilige callingElement enthält.
                callingElement.getAttribute("data-gate"),
                callingElement.getAttribute("data-call"),
            ];
        }
        let logOperations = "";
        // Durchlaufen der Anweisungen im gateArr
        gateArr.forEach((operation) => {
            let [value, action, target] = operation;

            let inputDefault = false; // teste auf Default-Option
            if (value === "default" && callingElement.value > "") {
                inputDefault = true; // Ein ein SuggestionInput = "default" prüfe ob ein anderer triggerWert zutrifft
                DataListChild = document
                    .getElementById(`${callingElement.id}List`)
                    .querySelectorAll("option");
                DataListChild.forEach((options) => {
                    options.value == callingElement.value
                        ? (inputDefault = false)
                        : undefined;
                });
            }

            // Überprüfen, ob die aktuelle callingElement-Option mit dem Wert übereinstimmt oder InputDefault true ist
            if (value === callingElement.value || inputDefault) {
                try {
                    const applyAction = (action) => {
                        (Array.isArray(target) ? target : [target])
                            .forEach(id => {
                                const element = document.getElementById(id);
                    
                                switch (action) {
                                    case "trigger":
                                        setTrigger(id);
                                        break;

                                    case "true":
                                        Global.posSale = true;
                                        break;

                                    case "false":
                                        Global.posSale = false;
                                        break;

                                    case "close":
                                        if (element && target !== "all") element.classList.add("d-none");
                                        break;

                                    case "open":
                                    case "openOnly":
                                        if (element && target !== "all") element.classList.remove("d-none");
                                        break;

                                    case "disable":
                                        if (element) element.setAttribute("disabled", "");
                                        break;

                                    case "enable":
                                        if (element) element.removeAttribute("disabled");
                                        break;

                                    default:
                                        logOperations += `<I class='txt--bigRed'>Error:</I> gatekeeper hat fehlerhafte action: ${action} in ${gateArr.id} <br>`;
                                        break;
                                }
                            }
                        );
                    };
                    // <<<>>> Auftrag für aktuelle callingElement.value ausführen
                    (Array.isArray(action) ? action : [action])
                        .forEach((operator) => {
                            let setValOp; // hole wert aus setValue

                            if (operator.includes("setValue")) {
                                prefix = operator.split("{")[1];
                                setValOp = prefix.replace(/}/, "");
                                operator = operator.split("{")[0];
                            }

                            let switchGrp; // Wenn target all{grp} finde alle GroupMember
                            if (target.includes("all")) {
                                prefix = target.split("{")[1];
                                switchGrp = prefix.replace(/}/, "");
                                (switchGrp = document.querySelectorAll(
                                    `[data-grp=${switchGrp}]`,
                                )),
                                    (target = target.split("{")[0]);
                            }

                            if (operator === "openOnly") {
                                // wenn openOnly oder alwaysClose --> Gruppe = d-none
                                let gatemember = []; //Rattenfänger von Hameln
                                let parent = document.getElementById(gate);
                                for (const child of parent.children) {
                                    gatemember.push(child);
                                }
                                gatemember.forEach((element) => {
                                    element.classList.add("d-none");
                                });

                            } else if (target === "all") {
                                // wenn all --> target = Gruppe
                                switchGrp.forEach((element) =>
                                    action === "open"? element.classList.remove("d-none") : element.classList.add("d-none"),
                                );
                            }
                            // Ausführen der entsprechenden Aktion (setValue ausgelagert da setValOp variable)
                            if (operator != "setValue") {
                                applyAction(action); 
                            } else {
                                (Array.isArray(target) ? target : [target])
                                .forEach(id => {
                                   document.getElementById(id).value = setValOp;
                                })
                        
                                logOperations += ` --> <span class="txt--blue">${operator}</span> <span class="txt--orange">${target}</span><br>`;
                            }
                        }
                    );
                    // Ausführen der Folgefunktion, falls vorhanden
                    nextFunc != null? executeFunctionFromString(nextFunc) : undefined;

                    showWeiterBtn(gate);

                    let lock = callingElement.getAttribute("data-lock");
                    if (lock === "lock") {
                        pageLock = true;
                    }
                } catch (error) {
                    // Fehlermeldung ausgeben
                    logIntoDebug(
                        callingElement.id,
                        `Error: Gatekeeper wurde fehlerhaft ausgeführt!<br> ${error.stack}`,
                        false,
                    );
                }
            }
        });
        Global.logGK
            ? logIntoDebug(
                    `GK <span class="txt--bigOrange">${callingElement.id}</span> = <I class="txt--gray">"${callingElement.value}"</I> `,
                    logOperations,
                    Global.logIntottDB,
                )
            : undefined;
    }
    // optionaler Gatekeeperaufruf für SuggestionInputs
    function triggerDatalist(id, gatekeeperCall) {
        if (gatekeeperCall > "") {
            gatekeeper(document.getElementById(id));
        }
    }

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ################################################################################# Text Trigger #############################################################################################
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

/** readTrigger                                                                                                             Funktion geprüft am: 22.05.24 von Erik
 *
 *      Mit dem Aufruf von readTrigger werden alle bis dahin, in der TriggerData, aktiv geschalteten Einträge in ihre jeweiligen Elemente geladen.
 *      Diese Funktion ist dafür vorgesehen die Zusammenfassung, in Bezug auf die ausgewählten Optionen zusammen zu stellen.
 *      Es können auch Variablennamen genutzt werden, dessen Inhalt dann genutzt wird.
 */
    function readTrigger() {
        let insert = "";
        let cache = new Set();
        TriggerData.forEach((list) => {
            // durchlaufe TriggerData
            if (list.active === true) {
                try {
                    // Falls list.value eine Variable ist, nutzte deren Wert
                    insert = eval(list.value);
                } catch (error) {
                    insert = list.value;
                }
                // cache prüft, ob das Element schon aufgerufen wurde und löscht den Inhalt einmalig falls nicht.
                // wenn Element bekannt, dann füge neuen Text, zum Vorhandenen hinzu.
                if (!cache.has(list.target_id)) {
                    cache.add(list.target_id);
                    document.getElementById(list.target_id).innerHTML = "";
                }
                document.getElementById(list.target_id).innerHTML += `${insert}`;
                // Alle ungenutzten Elemente zurücksetzten
            } else if (cache.has(list.target_id)) {
            } else {
                document.getElementById(list.target_id).innerHTML = "";
                cache.add(list.target_id);
            }
        });
    }

//------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** setTrigger                                                                                                              Funktion geprüft am: 22.05.24 von Erik
 *
 *      setTrigger ist die Zusatzfunktion vom Gatekeeper-Select. Mit dem Befehl 'trigger' kann eine id auf active = true gesetzt werden.
 *      Alle aktiv geschalteten IDs aus der TriggerData werden mit der readTrigger-Funktion in ihr jeweiliges ziel geschrieben.
 *
 * @param {*} id - ID des zu schaltenden Eintrags
 */
    function setTrigger(id) {
        // Setze mitgebene id in TriggerData active = true
        // Setzte alle id der selben Gruppe auf active = false
        for (const trigger of TriggerData) {
            if (trigger.id === id) {
                let killGrp = trigger.grp;
                TriggerData.forEach((grpMember) => {
                    if (grpMember.grp === killGrp) {
                        grpMember.active = false;
                    }
                });
                trigger.active = true;
                break;
            }
        }
    }

//------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** getTrigger - hole triggerListe aus Element
 *
 * @param {*} callerId
 * @param {*} validate
 */
    function getTrigger(callerId, validate) {
        let caller = document.getElementById(callerId);
        triggerArr = stringToArray(caller.getAttribute("data-trigger"));
        triggerArr.forEach((operation) => {
            let [value, target] = operation;
            if (value === caller.value) {
                setTrigger(target);
            }
        });
        if (validate !== "") {
            try {
                showWeiterBtn(validate);
            } catch (e) {
                logIntoDebug("getTrigger", `Fehler: '${validate}' konnte nicht von showWeiterBtn() verarbeitet werden.`,false)
            }
        }
    }

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ################################################################################# SwitchTab #############################################################################################
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

/** switchTab - Umschalten der Navigations-Tabs und öffnen der Register                                                         Funktion gerüft am 24.05.24 von Erik
 *
 *      Bildet die Grundlegende Naviagtion zwischen den Reigstern. Diese wir sowohl über die Tab (Reiter) als auch über die
 *      "Verabschiedungs"- und "Weiter"-Buttons aufgerufen. Mitgegeben wird die ID des Registers der audgerufen werden soll.
 *
 *      @param {*} newTabName
 */
    function switchTab(newTabName) {
        let currentTabName = Global.currentTabName;
        // Überprüfen, ob der neue Tab gültig ist
        if (currentTabName != newTabName) {
            let lockedBool;
            if (currentTabName != firstTab && currentTabName != lastTab) {
                // Prüfe ob Seite gesperrt wenn nicht start oder end
                if (pageLock === true) {
                    // prüfe üb alle requierd ausgefüllt sind
                    lockedBool = bundleInputs(currentTabName);
                } else {
                    lockedBool = true;
                }
            } else {
                // wenn start oder end
                lockedBool = true;
            }

            if (lockedBool === true) {
                if (newTabName === lastTab) {
                    ifTheDivs(lastTab);
                    createEndcard();
                }

                // Aktuellen Tabnamen aktualisieren
                let currentPage = document.getElementById(newTabName);
                let oldPage = document.getElementById(currentTabName);
                Global.currentTabName = newTabName;

                oldPage.className = "page_content d-none";
                currentPage.className = "page_content";

                // Wenn der neue Tab bereits sichtbar ist, nichts tun
                if (
                    !document.getElementById(newTabName).classname ===
                    "page_content d-none"
                ) {
                    return;
                }

                // Alle Tabs deaktivieren und den neuen Tab aktivieren
                let tabs = document.querySelectorAll(".tab");
                let newTab = currentPage.getAttribute("data-tab");
                tabs.forEach(function (tab, index) {
                    tab.className = "tab";
                    if (tab.id === newTab) {
                        tab.className = "tab current";
                    }
                });

                // Anzeigen oder Ausblenden von Buttons basierend auf dem Tab
                ["div_go_ane", "div_go_abfax"].forEach(function (elementId) {
                    if (newTabName !== firstTab && newTabName !== lastTab) {
                        document.getElementById(elementId).className = "go d-none";
                        showWeiterBtn(newTabName);
                    } else {
                        document.getElementById(elementId).className = "go";
                        document.getElementById("weiterBtn").classname = "d-none";
                    }
                });
                // Buton kann erst nach der Validierung entfernt werden
                if (newTabName === lastTab) {
                    document.getElementById("weiterBtn").classList.add("d-none");
                }
            } else {
                return;
            }
        }
    }

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ Buttons & Weiterleitungen +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Validierung der Seite aufrufen und wenn bestanden Button einfügen

    function showWeiterBtn(page_id) {
        let showWeiterBtn = document.querySelector(".nextpage--btn");

        if (Global.posSale === true) {
            showWeiterBtn.innerHTML = '<i class="glyph glyph-outro"></i>Weiter';
        } else {
            showWeiterBtn.innerHTML =
                '<i class="glyph glyph-abschluss"></i> Abschluss';
        }

        if (silent(document.getElementById(page_id)) == true && page_id !== Global.lastTab) {
            document.getElementById("weiterBtn").classList.remove("d-none");
        } else {
            document.getElementById("weiterBtn").classList.add("d-none");
        }
    }

    function weiterBtn() {
        if (Global.posSale === true) {
            let currentTab = document.querySelector(".current").id;

            let currentNumber = parseInt(currentTab.replace("tab", ""));
            let newNumber = currentNumber + 1;
            // Neue ID erstellen und suchen
            let newTabId = "tab" + newNumber;
            let newTabButton = document.getElementById(newTabId);

            // Wenn der Button existiert, das onclick-Event auslösen
            if (newTabButton) {
                newTabButton.click();
            }
        } else {
            switchTab(`${lastTab}`);
        }
    }

    function createEndcard() {
        document.getElementById("weiterBtn").className = "d-none";

        // TODO: hier API-abfrage nach Aufnahmestatus
        let RecState = 2;
        // Austauschen sobald verfügbar

        if (RecState === 2) {
        }
    }

    function setTerminationCode() {
        if (Global.terminationCode == null) {
            Global.posSale
                ? (Global.terminationCode = 100)
                : (Global.terminationCode = 200);
        }
    }

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** HotKeys
 *
 *       Anhand des übergebenen KeyCodes -Führe aus...
 *       @param {*} KeyCode
 */
    function keyDown(event) {
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
            beep(220, 55, 65); // Frohe Ostern
            setTimeout(() => {
                beep(200, 35, 65);
            }, 290);
            document.getElementById("debugLog").classList.toggle("d-none");
            Global.debugMode && console.log("debuglog geöffnet!");
        }
        // Überprüfe, ob die zweite und dritte Taste gleichzeitig gedrückt wurden
        if (keyCode2Pressed && keyCode3Pressed) {
            // Setze den Inhalt des debug-Logs zurück
            debugWindowClear();
        }
    }

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
    function keyUp(event) {
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
    }

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ HELPER +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** Helper H-001                                                                                                             Funktion geprüft am: 22.05.24 von Erik
 *
 *      Führt eine Funktion aus, die als Zeichenkette übergeben wird.
 *      @param {string} funcString - Die Zeichenkette, die den Funktionsaufruf enthält.
 */
function executeFunctionFromString(funcString) {
	let funcName = funcString.match(/^(\w+)\(/)?.[1]; // Extrahiert den Namen der Funktion aus der Zeichenkette
	let argsMatch = funcString.match(/\(([^)]+)\)/)?.[1]; // Extrahiert die Argumente der Funktion aus der Zeichenkette
	let args = argsMatch ? argsMatch.split(",").map((arg) => arg.trim()) : []; // Zerlegt die Argumente in ein Array
	let giveBack;

	// Prüft, ob die extrahierte Funktion existiert und eine Funktion ist
	if (funcName && typeof window[funcName] === "function") {
		giveBack = window[funcName](...args); // Aufruf
	} else {
		logIntoDebug(
			"executeFunctionFromString:",
			`<I class='txt--bigRed'>Error:</I> Aufgerufene Funktion ${funcName} existiert nicht.`,
			Global.logIntottDB,
		); //Error_msg
	}
	return giveBack;
}
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** Helper H-002
 *
 *      Submit Form
 *      @param {string} form_id absenden
 */
function submitForm(form_id) {
	document.getElementById(form_id).submit();
}

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** Helper H-003
 *
 *          createAddressDataArray
 *      Array aus Dataobjekt erzeugen
 */
function createAddressDataArray(queryResult) {
	try {
		// Das Ergebnis wird angenommen und in ein Array von Adressdaten umgewandelt
		const addressDataArray = queryResult[0].rows.map((row) => {
			// Jede Zeile des Ergebnisses wird durchlaufen, um die Daten zu extrahieren
			const rowData = {};
			row.columns.forEach((value, index) => {
				// Die Werte werden bearbeitet und in das Objekt rowData eingefügt
				// Eventuelle Leerraumzeichen werden entfernt, falls vorhanden, sonst wird '-' verwendet
				rowData[index] = value.trim() ?? "-";
			});
			// Die bearbeitete Zeile wird zurückgegeben und zum Array hinzugefügt
			return rowData;
		});
		// Das fertige Array mit Adressdaten wird zurückgegeben
		return addressDataArray;
	} catch (error) {
		// Im Falle eines Fehlers wird eine Fehlermeldung ausgegeben und ein leeres Array zurückgegeben
		logIntoDebug(
			"createAdressDataArray",
			"<I class='txt--bigRed'>Error:</I> SQL-Ergebnisse konnten nicht in Array geladen werden",
			Global.logIntottDB,
		);
		return [];
	}
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** Helper H-004                                                                                                             Funktion geprüft am: 22.05.24 von Erik
 *
 *          logIntoDebug
 *      Eintragen von Logs in das togglebare Logfenster für Livebetrieb
 *      @param {string} caller - Name de Funktion die den Fehler wirft und evt. Kurzbeschreibung
 *      @param {string} msg - Error beschreibung oder SQL-Prompt
 *      @param {string} deExport - Bool: True = an ttWeb.DB weitergeben
 */

function logIntoDebug(caller, msg, dbExport) {
	if (Global.showDebug) {
		// Global.showdebug=> ttEditor-config.js
		let window = document.getElementById("debugLog");
		let log = window.innerHTML;
		log =
			log +
			"<br><br>" +
			"<strong>" +
			caller +
			":</strong>" +
			"<br>" +
			msg;
		window.innerHTML = log;
	}
	if (dbExport && Global.logIntottDB) {
		// Global.logIntottDB => ttEditor-config.js
		// Erstelle und sende Log an Datenbank
		ttErrorLog(caller, msg);
	}
}
function debugWindowClear() {
	// Log löschen
	document.getElementById("debugLog").innerHTML =
		`<div class="debugLog--header"><i class="glyph glyph-code"> &nbsp; debugLog &nbsp;</i> <button type="button" onclick="debugWindowClear()"> clear </button></div>`;
}

function logsqlIntodebug(caller, query, awnser) {
	if (Global.showDebug) {
		// Global.showdebug => ttEditor-config.js
		let window = document.getElementById("debugLog");
		let log = window.innerHTML;
		let awnserTxt = "";
		if (awnser === false) {
			awnserTxt =
				"<I class='txt--red'>Keine Daten in der DB gefunden</I>";
			buildupFail = true;
		} else {
			awnserTxt = "<I class='txt--green'>Daten aus DB empfangen</I>";
		}
		log =
			log +
			"<br><br>" +
			"<strong>" +
			caller +
			":</strong>" +
			"<br>" +
			query +
			"<br>" +
			awnserTxt;
		window.innerHTML = log;
	}
}

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** Helper H-005                                                                                                             Funktion geprüft am: 22.05.24 von Erik
 *
 */

function generateUUID() {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
		/[xy]/g,
		function (c) {
			var r = (Math.random() * 16) | 0,
				v = c == "x" ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		},
	);
}

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** Helper H-006
 *
 *          lockTab() - disable alle Inputs auf einem Tab
 *
 *          @param {string} ID des Tabs
 *          @param {bool} true = disable / false = enable
 */
function lockTab(tab_id, bool) {
	let allInputs = tab_id.querySelectorAll(":scope > input");
	allInputs.forEach((input) => {
		input.disabled = bool ? true : false;
	});
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------
function autoResize(textarea) {
	textarea.style.height = "auto";
	textarea.scrollHeight > 40
		? (textarea.style.height = textarea.scrollHeight + "px")
		: (textarea.style = ""); // Setzt die Höhe auf die Scroll-, oder Min-Höhe
}
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ################################################################################# Endcard Trigger #############################################################################################
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------





//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//======================================================================================================================================================================
//                                                      _   _ __        __   _     _____                 _   _                 
//                                                     | |_| |\ \      / /__| |__ |  ___|   _ _ __   ___| |_(_) ___  _ __  ___ 
//                                                     | __| __\ \ /\ / / _ \ '_ \| |_ | | | | '_ \ / __| __| |/ _ \| '_ \/ __|
//                                                     | |_| |_ \ V  V /  __/ |_) |  _|| |_| | | | | (__| |_| | (_) | | | \__ \
//                                                      \__|\__| \_/\_/ \___|_.__/|_|   \__,_|_| |_|\___|\__|_|\___/|_| |_|___/
//======================================================================================================================================================================



//################################################################################### BUILD / BOOT ######################################################################
/** bootUpAPI - Verbindung zur API aufbauen
 *
 *      Wir nach dem Aufbau der Seite automatisch aufgerufen
 */
    function bootUpAPI() {
        try {
            logIntoDebug("bootUpAPI", "Starte initialisierung ttWeb", false);
            // Initialisierung des Inhalts-Interfaces
            this.parent.contentInterface.initialize(
                window,
                function onInitialized(contentInterface) {
                    // Erfolgreiche Initialisierung

                    ttWeb = contentInterface; // ttWeb auf das Content-Interface setzen

                    if (Global.debugMode === true) {
                        logIntoDebug(
                            "<span class='txt--bigGreen'>:API-Verbindung positiv getestet</span>",
                            "",
                            false,
                        );
                    } else {
                        buildUp();
                        call_initialize();
                        //TODO: recordAutoStart()
                        logIntoDebug(
                            "<span class='txt--bigGreen'>:Initialisierung erfolgreich</span>",
                            "",
                            false,
                        );
                    }
                },
            );
        } catch (error) {
            logIntoDebug(
                "bootUpAPI",
                `<span class='txt--bigRed'>Error:</span> Initialisierung fehlgeschlagen:<br>=${error}`,
                false,
            );
        }
        if (Global.debugMode) {
            logIntoDebug(
                "bootUp",
                "debugMode: <span class='txt--blue'>true</span> => Initialisierung für debugMode gestartet<br> <span class='txt--red'>Überspringe</span> recordAutoStart()<br> <span class='txt--red'>Überspringe</span> call_initialize()<br>Verbinde zu <span class='txt--blue'>http://admin/outbound.dbconnector/index.php</span>",
                false,
            );
            buildUp();
        }
    }

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** buildUp -  Laden und anzeigen aller Daten.
 *
 */
    function buildUp() {
        blnFinishPositive = false; // Variable zur Überprüfung, ob der Anruf positiv abgeschlossen wurde
        // Abruf der notwendigen Daten aus der API
        try {
            clientIP = ttWeb.getClientIP();
            Global.key2 = ttWeb.getCalltableField("ID");
            msisdn = ttWeb.getCalltableField("HOME");
            indicator = ttWeb.getIndicator();
            // Telefonkontakt basierend auf dem Indikator festlegen
            if (indicator == 1) {
                telKontakt = ttWeb.getCalltableField("HOME");
            } else if (indicator == 2) {
                telKontakt = ttWeb.getCalltableField("BUSINESS");
            } else {
                telKontakt = ttWeb.getCalltableField("OTHER");
            }
            festnetz = ttWeb.getCalltableField("BUSINESS");
            agentId = ttWeb.getUser().Login;

            if (
                clientIP === null ||
                Global.key2 === null ||
                msisdn === null ||
                indicator === null
            ) {
                buildupFail = true;
            }
        } catch (error) {
            if (Global.debugMode) {
                // Wenn Global.debugModeging aktiviert ist, werden Dummy-Daten gesetzt
                Global.key2 = 79880808;
                msisdn = "01768655885";
                telKontakt = "0190123123";
                agentId = "2008";
            } else {
                logIntoDebug(
                    "buildUp()",
                    "Calldatatable konnte nicht geladen werden",
                    false,
                );
            }
        }
        // Wenn Global.debugModeging deaktiviert ist und ein Ergebnis vorhanden ist, wird callResultId aktualisiert
        // if (buildupFail) {
        //     abschlussStatus = pullSQL("result_id");
        //     if (!Global.debugMode && abschlussStatus.length > 0) {
        //         let callResultId = abschlussStatus.fields.result_id;

        //         if (callResultId == resultIdPositiv) {
        //             logIntoDebug(
        //                 "buildUp",
        //                 "Es wurde ein bereits positiver Datensatz erneut angerufen. Call wurde automatisch termininiert.",
        //                 Global.logIntottDB,
        //             );
        //             ttWeb.clearRecording();
        //             ttWeb.terminateCall("100");
        //         } else if (callResultId == resultIdNegativ) {
        //             logIntoDebug(
        //                 "buildUp",
        //                 "Es wurde ein bereits negativer Datensatz erneut angerufen. Call wurde automatisch termininiert.",
        //                 Global.logIntottDB,
        //             );
        //             ttWeb.clearRecording();
        //             ttWeb.terminateCall("200");
        //         }
        //     }

        //     let currDate = new Date(); // Wiedervorlagendatum und -zeit auf Standardwerte zurücksetzen
        //     document.getElementById("wiedervorlage_Date").value =
        //         currDate.getDate() +
        //         "." +
        //         (currDate.getMonth() + 1) +
        //         "." +
        //         currDate.getFullYear();
        //     // document.getElementById('wiedervorlage_Time').value = (currDate.getHours() + 1) + ":00";
        //     document.getElementById("wiedervorlage_Text").value = "";
        //     document.getElementById("apne_delay").value = "";
        //     document.getElementById("apne_notiz").value = "";

        //     if (Global.wiedervorlage) {
        //         // Wiedervorlagedaten aus DB laden (abschaltbar über tteditor-config)
        //         let wievorCount = pullSQL("wiedervorlageCount");
        //         if (wievorCount[0].rows[0].fields.length > 0) {
        //             wievorData = pullSQL("wiedervorlageData")[0].rows;
        //             let wvtext = `Kommende Wiedervorlagen<br />für <b>Agent ${agentId} </b>:<br /><br />`;
        //             for (let i = 0; i < wievorData.length; i++)
        //                 wvtext =
        //                     wvtext +
        //                     `<div class="data" >${wievorData[i].fields.message}</div>`;
        //             document.getElementById(Global.wievorElement).innerHTML =
        //                 wvtext;
        //         }
        //     }

        //     if (Global.showStats) {
        //         // Statistikdaten für die Kampagne abrufen und anzeigen (abschaltbar über tteditor-config)
        //         stats = pullSQL("statistik");
        //         if (stats[0].rows.length > 0) {
        //             stats = stats[0].fields;

        //             quote = stats.UMWANDLUNGSQUOTE;
        //             nettos = stats.NETTOKONTAKTE;
        //             if (nettos > 0) {
        //                 $("stats_positive").width = Math.round(
        //                     (stats.POSITIV / nettos) * 200,
        //                 );
        //                 $("stats_unfilled").width =
        //                     200 - Math.round((stats.POSITIV / nettos) * 200);
        //             }
        //             logIntoDebug(
        //                 "Aktuelle Quote",
        //                 `${stats.POSITIV} Abschlüsse bei ${nettos} Anrufen = ${quote}% `,
        //                 Global.logIntottDB,
        //             );
                }
            }
        }
        createCustomerPattern(); // Laden der Kundendaten und Erstellung der Cards, zur Anzeige dieser
        autoInject_selects(); // Fülle alle SQLinjectionSelects
        loadProviderPreset(); // Prüfe ob es Elemente gibt, welche ein Preset laden sollen und füge diese ein
        buildupFail
            ? logIntoDebug("bulidUp unvollständig", "Fehler im Ladevorgang", false)
            : logIntoDebug(
                    "bulidUp complete",
                    "Alle Daten wurden erfolgreich geladen",
                    false,
                );
    }


//#############################################################################################################################################################################
//---------------------------------------------------------------------------- Beenden des akuellen Falles---------------------------------------------------------------------
//#############################################################################################################################################################################

/** finish (typeOfAnnihilation)
 * 
 * @param {typeOfAnnihilation} method caller from List 
 */
    function finish(method) {
        
        if (method === "queryLib") {
        } else {
            setRecordName();
            setTerminationCode();
            SendBack = convertFormToQuery("tabsForm");

            if (Global.debugMode) {
                alert(
                    "Anruf abgeschlossen. Daten werden übertragen. Call terminiert",
                );
                logIntoDebug(
                    "finish",
                    `Call terminiert <br> Submit:<br>${SendBack}`,
                    false,
                );
            } else {
                let submitFailed = pushMainData(); // Speichern der Daten
                if (submitFailed === true) {
                    console.log(
                        "SendBack " + SendBack + " is Fail " + submitFailed,
                    );

                    ttWeb.saveRecording(Global.recordFileName);

                    ttWeb.terminateCall(Global.terminationCode);

                    // TODO refresh();
                } else {
                    // Wenn Speichern fehlgeschlagen
                    // Achtung Achtung Notfall !! Wiiiuuu Wiiiiuuu
                    // igrendwie Daten speichern oder sowas
                    console.log(
                        "SendBack " + SendBack + " is Fail " + submitFailed,
                    );
                }
            }
        }
    }

//#############################################################################################################################################################################
//---------------------------------------------------------------------------- Anrufe / Calls -------------------------------------------------------------------------------------
//#############################################################################################################################################################################

/** call_initialize - refresh my phone
 *
 *      Alle notwenigen Variablen zurücksetzten, für einen neuen Anruf.
 */
    function call_initialize() {
        try {
            ttWeb.setRecordingState(0); // Setze den Aufzeichnungsstatus auf 0 (deaktiviert)
            // direction = ttWeb.getCallDirection();    // TODO Bestimme die Richtung des Anrufs (eingehend, ausgehend oder intern)
            key2 = ttWeb.getCalltableField("ID"); // Bestimme die ID des Anrufdatensatzes in der Datenbank
            msisdn = ttWeb.getCalltableField("HOME"); // Bestimme die MSISDN (Mobilfunknummer) des Anrufers oder Angerufenen
            indicator = ttWeb.getIndicator(); // Bestimme den Indikator für die Art des Anrufs (1-9)

            // Bestimme die Telefonnummer des Kontakts basierend auf dem Indikator
            if (indicator == 1) {
                telKontakt = ttWeb.getCalltableField("HOME"); // Privatnummer
            } else if (indicator == 2) {
                telKontakt = ttWeb.getCalltableField("BUSINESS"); // Geschäftsnummer
            } else {
                telKontakt = ttWeb.getCalltableField("OTHER"); // Andere Nummer
            }

            festnetz = ttWeb.getCalltableField("BUSINESS"); // Festnetznummer wird immer als Geschäftsnummer beschrieben?
            agentId = ttWeb.getUser().Login; // Bestimme die Agenten-ID des Benutzers

            logIntoDebug(
                "call_initialize()",
                "<span class='txt--orange'>Calltable</span> erfolgreich refreshed",
                false,
            );
        } catch (error) {
            logIntoDebug(
                "call_initialize()",
                `<span class='txt--bigRed'>Error:</span> <span class='txt--orange'>Calltable</span> konnte nicht refreshed werden<br>=> ${error.stack}`,
                false,
            );
        }
    }
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** call_freedial - got a new number
 *
 *      Wenn der Kunde unter einer anderen Nummer kontaktiert werden möchte.
 *      Eingabe über den Freedial-Dialog.
 */
    function callFreedial() {
        try {
            let newNumber = document.getElementById("freedial_number");

            if (validateRufnummer("tel", newNumber.id, true)) {
                //TODO: validateRufnummer austauschen

                logIntoDebug(
                    "ttWEB",
                    `setCalltable('Other', ${newNumber.value})`,
                    false,
                );
                Global.debugMode
                    ? undefined
                    : ttWeb.setCalltableField("OTHER", newNumber.value); //Rufnummer abspeichern

                logIntoDebug(
                    "ttWEB",
                    `setCallState: ${Global.startCallwithState}`,
                    false,
                );
                Global.debugMode
                    ? undefined
                    : ttWeb.setIndicator(Global.startCallwithState); // Callstate zurücksetzten

                Global.onNegDeleteRec === true ? record("clear") : record("save"); // Aufnahme löschen wenn gewollt

                // ---- submit ----

                logIntoDebug(
                    "ttWEB",
                    "Call terminiert ('RR', null, null, 1)",
                    false,
                );

                //TODO: Abschluss von ttFrame aus steuern
                alert("here comes the end");
                Global.debugMode
                    ? undefined
                    : ttWeb.terminateCall("RR", null, null, 1); // Anruf terminieren oder ander nummer anrufen.
                alert("das wars schon");

                ttWeb.clearRecording();
                ttWeb.makeCustomerCall(newNumber.value);

                logIntoDebug(
                    "callFreedial",
                    `Neue Nummer: <span class="txt--gray">${newNumber.value}</span> gespeichert`,
                    false,
                );
            } else {
                logIntoDebug(
                    "callFreedial",
                    `<span class='txt--bigRed'>Error:</span> Nummer: <span class="txt--gray">${newNumber.value}</span> vom Validator abgelehnt`,
                    false,
                );
            }
        } catch (error) {
            Global.debugMode
                ? alert(
                        "Neue Telefon Nummer gespeichert." <
                            br >
                            "Fall abgeschlossen",
                    )
                : alert(
                        "Das hat leider nicht funktioniert." <
                            br >
                            "Bitte schließen Sie den Fall unter APNE ab",
                    );
            logIntoDebug(
                "callFreedial",
                `<span class='txt--bigRed'>Error:</span> Nummer: <span class="txt--gray">${newNumber.value}</span> kommte nicht gespeichert werden`,
                false,
            );
        }
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
            case "start":
                Global.debugMode
                    ? (Global.directionState = recState)
                    : ttWeb.setRecordingState(recState); //TODO
                logIntoDebug(
                    "record(start)",
                    `Aufnahme wurde gestartet / state: ${recState}`,
                    false,
                );
                break;

            // Wenn der Zustand 'stop' ist, wird die Aufnahme gestoppt (und die Sprachaufzeichnung wird ggf. gespeichert?)
            case "stop":
                setRecordName(pattern);
                if (Global.recordFileName != "") {
                    pushSQL(update_rec_info);
                    pushSQL(save_rec_path);
                    logIntoDebug(
                        "record(stop)",
                        `Aufnahme wurde gestoppt <br>Gespeichert als: <span class="txt-blue">${Global.recordFileName}</span>`,
                        false,
                    );
                } else {
                    logIntoDebug(
                        "record(stop)",
                        `<span class="txt-red">Error:</span> Kein Global.recordFileName angegeben.`,
                        Global.logIntottDB,
                    );
                }
                break;

            // Wenn der Zustand 'save' ist, wird die Aufnahme gespeichert und eine Fehlermeldung wird protokolliert, wenn kein Dateiname angegeben wurde.
            case "save":
                setRecordName(pattern);
                if (Global.recordFileName != "") {
                    Global.debugMode
                        ? undefined
                        : ttWeb.saveRecording(Global.recordFileName);
                    logIntoDebug(
                        "record(save)",
                        `Aufnahme wurde gestoppt <br>Gespeichert als: <span class="txt-blue">${Global.recordFileName}</span>`,
                        false,
                    );
                } else {
                    logIntoDebug(
                        "record(save)",
                        `<span class="txt-red">Error:</span> Kein Global.recordFileName angegeben.`,
                        Global.logIntottDB,
                    );
                }
                break;

            // Wenn der Zustand 'clear' ist, wird die Aufnahme gelöscht.
            case "clear":
                Global.debugMode ? undefined : ttWeb.clearRecording();
                logIntoDebug("record(clear)", "Aufnahme wurde verworfen", false);
                break;

            default: //Error_msg
                logIntoDebug(
                    `record(${state})`,
                    `<span class="txt-red">Error:</span> invalider state`,
                    Global.logIntottDB,
                );
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
        if (style === "pattern") {
            FileNamePattern.forEach((getInfo, index) => {
                let matchfound = false;
                try {
                    // Suche in CustomerPattern
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
                if (index != FileNamePattern.length - 1) recordName += "_"; // Trenner einbauen
            });
            recordName += `${Global.recordingNameSuffix}`;
        } else if (style === "use") {
            // nutze mitgegebenen Namen
            recordName += `${useName}${recordingNameSuffix}`;
        } else {
            // Generiere einen Namen mit hashwert (weil UUID nicht in ttFrame funktioniert)

            let cryptoIsNotaFunction = Math.floor(Math.random() * 50) + 1;
            let inThisdumbttFrame = Math.floor(Math.random() * 50000) + 1;
            let thisIsjustStupid = inThisdumbttFrame * cryptoIsNotaFunction;

            recordName = `agent${agentId}_${gettime()}_to${
                Global.key2
            }_${thisIsjustStupid}${Global.recordingNameSuffix}`;
        }
        Global.recordFileName = recordName;
        logIntoDebug(
            "setRecordingName",
            `RecordFileName = ${Global.recordFileName}`,
            false,
        );
    }

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** Helper H-SQL-003 - Teilen des Pfades an den Backslashes
 */
    function splitRecName() {
        let voicefileName = setRecordName();
        return (teile = voicefileName.split("\\"));
    }

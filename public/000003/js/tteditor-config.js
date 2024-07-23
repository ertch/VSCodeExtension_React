//                                                         _   _   _____    _ _ _                ____             __ _       
//                                                        | |_| |_| ____|__| (_) |_ ___  _ __   / ___|___  _ __  / _(_) __ _ 
//                                                        | __| __|  _| / _` | | __/ _ \| '__| | |   / _ \| '_ \| |_| |/ _` |
//                                                        | |_| |_| |__| (_| | | || (_) | |    | |__| (_) | | | |  _| | (_| |
//                                                         \__|\__|_____\__,_|_|\__\___/|_|     \____\___/|_| |_|_| |_|\__, |
//                                                                                                                      |___/ 

<<<<<<< HEAD

/** TODO:
 * 
 *      Record_BTN-component
 * 
 * 
 */
=======
>>>>>>> a4a06c121771d9166c09e94a7d1a27c2329ba77d
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ Global Var +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

       
let CustomerData;               // Array des Kampagnien-Table bzw. Kundendaten  / pattern => provider_lib.js
let agentId;                    // ID des Agenten
let clientIP;                   

let ttWeb = new Object();       // Objekt für ttFrame-API
let recordingName;              // Name des Recordings

let keyCode1Pressed = false;    // Status des ersten Hotkey (Tabulator)
let keyCode2Pressed = false;    // Status des zweiten Hotkey (D)
let keyCode3Pressed = false;    // Status des dritten  (C)
let timer;
let keyPressStartTime;

let btnLock = false;
let pageLock = false;           // wenn true, verhindert wechsel der Seite/Page
let buildupFail = false;
let TriggerData = triggerPattern();     // initialisierung TriggerData      (TriDa)
let CostumerData;                       // Erstellung global CustomerData   (CusDa)
let CurrCostumerData = new Object();    // Erstellung global neue CusDa     (CuCDa) 
let SendBack = [];                      // Erstellung global SendBackfilter (SenBa)

let firstTab = "tab_start";
let lastTab = "tab_zusammenfassung";
    
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ Campaign Var ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

let campaignId = 679;

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


let Global ={
    currentTabName:       `${firstTab}`,
    
    directionState:        0        , // Aktueller Call state
    startCallwithState:    2        , // Call state bei Beginn des Anrufes
    startRecWithBuildUp:   false    , // wenn true, wird die Aufnahme direkt bei öffnen des Dokuments gestartet
    startRecWithCall:      false    , // wenn true, wird die Aufanhme bei tätigigen des Anrufes gestartet
    onNegDeleteRec:        true     , // Im Falle eines Negativen Abschlusses wird das Audiofile verworfen.          
    
<<<<<<< HEAD
    debugMode:             true   ,     // Wenn true, dann wird mit SQL-Fakeconnector verbunden
    debugdataTableId:      79880808,    // ID für Debug Datenbank CalldataTable

    showDebug:             true    ,    // Wenn true, kann der Log auf der Seite eingeblendet werden (HotKey = [Tab] + [D])
    LogIntottDB:           false    ,   // Wenn true, werden Errormsg an die ttFrameDB geschickt (ausschließlich SQL-querys)
    logGK:                 true     ,   // Gatekeeper in Log anzeigen
    logSQL:                true     ,   // SQL-Statemants in Log anzeigen
    showStats:             false    ,   // wenn true, lade AbschlussStatistik (in DebugLog)
=======
    debugMode:             true   , // Wenn true, dann wird mit SQL-Fakeconnector verbunden
    showDebug:             true    , // Wenn true, kann der Log auf der Seite eingeblendet werden (HotKey = [Tab] + [D])
    LogIntottDB:           false    , // Wenn true, werden Errormsg an die ttFrameDB geschickt (ausschließlich SQL-querys)
    logGK:                 true     , // Gatekeeper in Log anzeigen
    logSQL:                true     , // SQL-Statemants in Log anzeigen
    showStats:             false    , // wenn true, lade AbschlussStatistik (in DebugLog)
>>>>>>> a4a06c121771d9166c09e94a7d1a27c2329ba77d

    addressdatatable:      'ste_wel_addressdata'   ,  // SQL adresstable
    calldatatableId:       '9826'                      ,  // ID des Kampagnien-CallTable (aus DB)
    salesdatatable:        'ste_wel_addressdata'   ,  // SQL datatable
    fieldname_firstname:   'firstname'             ,  // SQL column-Bezeichner
    fieldname_lastname:    'surname'               ,  // SQL column-Bezeichner

    nestor:                'http://admin/outbound.dbconnector/index.php?sql='              ,// URL des Debog-Connector
    
    recordingPrefix:       '\\\\192.168.11.14\\Voicefiles_Phoenix\\VF_Diverse\\ste_wel\\'  ,// Path zur Ablage der Audiodatei auf dem Fileserver
    FileNamePattern:       ["date", "time", "agentId", "customerid", "ste_wel" ]           ,// nutzbar sind strings, date, time, alle globalen Variablen und alle Values in CustomerData (key match)
    recordingNameSuffix:   '.mp3'                                                          ,// Suffix der Audiodatei
    recordFileName:        ''                                                              ,// [ "", "", "192.169.18.11",  "Voicefiles_Phoenix",  "VF_Diverse",  "Kampagnenname", "filename.Suffix"]
    terminationCode:       ''                                                              ,

    wiedervorlage:         false               ,  // wenn true, lade WiedervorlageDaten 
    wievorElement:         'html-Element.id'   ,  // Lade WiedervorlageDaten in dieses Element

    posSale:               false  , // Indikator für positiven Verkauf
}

//--------------------------------------------------------------- Anpassungen des RecordFileNames ---------------------------------------------------------------------------
function specialNames(varName){
    let giveBack = '';      // Soll eine Variable in der RecordFileName einen besonderem Ausdruck entsprechen, kann dies hier
    let date = getdate();   // eingtragen werden, um die Veränderung einzustellen.
    let time = gettime();
    
    switch(varName){

        case 'agentId':
            giveBack = `agent-${eval(varName)}`;
            break;

        default :
            giveBack = eval(varName);
    }
    return giveBack;
}

//------------------------------------------------------------------- Systemzeit ---------------------------------------------------------------------------
// Diese Funktionen werden für Zeitstempel genutzt. Wie diese ausgegeben werden sollen, kann man hier anpassen.       Funktion geprüft am: 23.05.24 von Erik
// Um in den Filenames einen Zeitsempel einzutragen, ist die Funktion notwendig

function getdate() { // Datum
    let datum = new Date().toLocaleDateString('default',{ day: 'numeric' , month: 'short', year: 'numeric'});
    datum = datum.includes('ä') ? datum.replace(/ä/g, 'ae') : datum;   // März filtern
    datum = datum.replace(/\.+/g, '')   
                 .replace(/\s+/g, '');      // tt(monat)yyyy = "23Mai2024"
    return datum;
}

function gettime() { // Uhrzeit
    let time = new Date().toLocaleTimeString();
    let cache = time.split(':');
    time = `${cache[0]}${cache[1]}`; // sekunden filtern
    return `${time}uhr`; // hh_mm_uhr
}


//---------------------------------------------------------------------------------------------------------------------------------------------------------
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ ProviderPattern ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//---------------------------------------------------------------------------------------------------------------------------------------------------------
//                                                                                                                  Funktion geprüft am: 22.05.24 von Erik

/**     Diese Funktionen definieren die Kundeninformationen, die für die Generierung von CustomerCells verwendet werden sollen.
 *      Wenn keine benutzerdefinierten Provider-Pattern und SQL-Abfragen angegeben sind, wird die providerDefault() verwendet.
 *      Die generierten Zellen werden in Zweierreihen angeordnet und mit den entsprechenden Daten aus der Datenbank gefüllt.
 *      Die "match"-Attribute müssen exakt mit den Bezeichnern in der Datenbank übereinstimmen, um die richtigen Daten zu erhalten.
 *      Ein Tippfehler könnte hier zu Fehlern in den generierten Zellen führen.
 *  
 *      label:  Dieser Key beschreibt den, für den User im Cell_Head sichtbaren, String und wird für die Suche innerhalb der Daten nicht berücksichtigt.      
 *              
 *      match:  Der Wert des match-Keys ist sowohl Schlagwort für die Suche innerhalb der Daten, die von der DB kommen, als auch id der Cell-Value.
 * 
 *      value:  Hier werden die Daten aus der DB gespeichert und dann für den User im "Cell_Value" sichtbar.
 * 
 *      standAlone: Der standAlone-Key wird verwendet, um zu kennzeichnen, ob ein bestimmter Wert als eigene Cell angezeigt wird ist oder nicht. 
 *                  Wenn standAlone auf true gesetzt ist, wird das entsprechende Element allein in einer Cell angezeigt. 
 *                  Andernfalls wird es zusammen mit dem nächsten standAlone = true Element in dessen Cell geschieben.
 *                  Es ist sozusagen ein Copy/Paste für die Werte. Aber Achtung: zwei standAlone hintereinadner überschreiben sich.
 * 
 *      createCell: Ein Bool für die Erstellung der CustomerCells. Wenn true, wird aus dem Eintrag eine Cell erstellt. 
 * 
 *                  Der Aufbau eines HTML-Elements ist wie folgt:
 *                      <div>           
 *                          <div class="cell_head"> 'label' </div>      
 *                          <div class="cell_value" id = 'match'> 'value' </div>   
 *                      </div>
 */
    function providerPattern() { 
        let CustomerData = [
<<<<<<< HEAD
            { label: 'red!Vorname',         match: 'firstname',             value: "",   standAlone: true,     createCell: true , dbType: "VARCHAR"},
            { label: 'gre!Nachname',        match: 'surname',               value: "",   standAlone: true,     createCell: true , dbType: "VARCHAR"},
            { label: 'yel!Geb.-Datum',      match: 'dateofbirth',           value: "",   standAlone: true,     createCell: true , dbType: "VARCHAR"},
=======
            { label: 'Vorname',         match: 'firstname',             value: "",   standAlone: true,     createCell: true , dbType: "VARCHAR"},
            { label: 'Nachname',        match: 'surname',               value: "",   standAlone: true,     createCell: true , dbType: "VARCHAR"},
            { label: 'Geb.-Datum',      match: 'dateofbirth',           value: "",   standAlone: true,     createCell: true , dbType: "VARCHAR"},
>>>>>>> a4a06c121771d9166c09e94a7d1a27c2329ba77d
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
        return CustomerData
    };
    // TODO mache das auch Variablen eingetragen werden könne, dafür erste testten ob eine Vaiable hinter dem String sitzt und wenn 

//---------------------------------------------------------------------------------------------------------------------------------------------------------
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ TriggerPattern ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//---------------------------------------------------------------------------------------------------------------------------------------------------------
//                                                                                                                  Funktion geprüft am: 22.05.24 von Erik

/**     Diese Funktion definiert die Texte die am Ende in eine Zusammenfassung einfließen sollen und/oder welche Optionen zur Verfügung stehen.
*       Das triggerPattern wird direkt beim laden das JS als globale Variable deklariert.   
*  
*      id:          Dieser Key beschreibt den, ist den Wert der an die Funktion setTrigger() übergeben wird, um den Eintrag aktiv zu schalten.
*                   Dies funktioniert sowohl über den Aufruf der Methode, als auch über ein Befehl 'trigger' im Gatekeeper-select.                   
*              
*      grp:         Alle IDs die die selbe Gruppe teilen, schließen sich gegenseitig davon aus zusammen angezeigt werden zu können. Ist ein Mitglied der grp 
*                    aktiv, werden alle andere auf inaktiv geschaltet.
* 
*      target_id:   Das 'Ziel'-Element, in welches die value geschrieben wird (innerHTML).
* 
*      active:      Bool wird den Zustand. Ziel-Elemente dessen Eintrag inaktiv istm werden zurückgesetzt (bzw. geleert).  
* 
*      value:       String oder Variablenname, dessen Wert in das Ziel-Element geschrieben werden soll.
*/

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
 

    // TODO Manipulation der CustomerData-Value, um die Werte anzupassen 
// const { renderUniqueStylesheet } = require("astro/runtime/server/index.js");

/** TODO:
 *          Prototype raus bekommen
 *         
 *          
 *          
 *          Schaltungslogik mit ttWeb für Elemente tab_verabschiedung
 *          Input.value trigger
 *          
 *          
 *          SQL-gen form SenBa-Filter
 *          get Data for CuCDa
 *          GK_lite?
 *          start call with buildUp option
 *          startRecWithCall 
 *          
 */

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ Global Var +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

let calldatatableId;            // ID des Kampagnien-CallTable
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

let pageLock = false;           // wenn true, verhindert wechsel der Seite/Page

let triggerData = triggerPattern();     // initialisierung TriggerData      (TriDa)
let CostumerData;                       // Erstellung global CustomerData   (CusDa)
let CurrCostumerData = new Object();    // Erstellung global neue CusDa     (CuCDa) 
let SendBack = new Object();            // Erstellung global SendBackfilter (SenBa)
    
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

let addressdatatable = 'ste_wel_addressdata';   // SQL adresstable
let salesdatatable = 'ste_wel_addressdata';     // SQL datatable
let fieldname_firstname = "firstname";          // SQL column-Bezeichner
let fieldname_lastname = "surname";             // SQL column-Bezeichner

let recordFileName; // [ "", "", "192.169.18.11",  "Voicefiles_Phoenix",  "VF_Diverse",  "Kampagnenname", "filename.Suffix"]
let recordingPrefix = "\\\\192.168.11.14\\Voicefiles_Phoenix\\VF_Diverse\\ste_wel\\";
let FileNamePattern = ["date", "time", "agendID", "customerid", "ste_wel" ]; // nutzbar sind strings, date, time, alle globalen Variablen und alle Values in CustomerData (key match)
let recordingNameSuffix = ".ogg"; 

let currentPageName="tab_start";        // Set Starttab (erster angezeigert Tab)

let startCallwithState = 2;             // Call state bei Beginn des Anrufes
let startRecWithBuildUp = false;        // wenn true, wird die Aufnahme direkt bei öffnen des Dokuments gestartet
let startRecWithCall = false;           // wenn true, wird die Aufanhme bei tätigigen des Anrufes gestartet
let debugDirectionState;                // Aktueller Call state

let showStats = false;                  // wenn true, lade AbschlussStatistik (in DebugLog)
let wiedervorlage = false;              // wenn true, lade WiedervorlageDaten 
let wievorElement = "html-Element.id"   // Lade WiedervorlageDaten in dieses Element

let LogIntottDB = false;                // Wenn true, werden Errormsg an die ttFrameDB geschickt (ausschließlich SQL-querys)
let showDebug = true;                   // Wenn true, kann der Log auf der Seite eingeblendet werden (HotKey = [Tab] + [D])
let debug = true;                       // Wenn true, dann wird mit SQL-Fakeconnector verbunden

let logGK = true;                       // Gatekeeper in Log anzeigen
let logSQL = false;                     // SQL-Statemants in Log anzeigen
//------------------------------------------------------------------- Systemzeit ---------------------------------------------------------------------------
// Diese Funktionen werden für Zeitstempel genutzt. Wie diese ausgegeben werden sollen, kann man hier anpassen.       Funktion geprüft am: 23.05.24 von Erik
// Um in den Filenames einen Zeitsempel einzutragen, ist die Funktion notwendig

function getdate() { // Datum
    let datum = new Date().toLocaleDateString('default',{ day: 'numeric' , month: 'short', year: 'numeric'});
    datum = datum.replace(/\.+/g, '')
                 .replace(/\s+/g, '');      // tt(monat)yyyy = "23Mai2024"
    return datum;
}

function gettime() { // Uhrzeit
    let time = new Date().toLocaleTimeString();
    return `${time.replace(/\:+/g, '-')}uhr`; // hh-mm-ss
}
//---------------------------------------------------------------------------------------------------------------------------------------------------------
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ ProviderPattern ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//---------------------------------------------------------------------------------------------------------------------------------------------------------
//                                                                                                                  Funktion geprüft am: 22.05.24 von Erik

/**     Diese Funktionen definieren die Kundeninformationen, die für die Generierung von CustomerCells verwendet werden sollen.
 *      Wenn keine benutzerdefinierten Provider-Pattern und SQL-Abfragen angegeben sind, wird die providerDefault() verwendet.
 *      Die generierten Zellen werden in Zweierreihen angeordnet und mit den entsprechenden Daten aus der Datenbank gefüllt.
 *      Die "match"-Attribute müssen exakt mit den Bezeichnern in der Datenbank übereinstimmen, um die richtigen Daten zu erhalten.
 *      Ein Tippfehler hier könnte zu Fehlern in den generierten Zellen führen.
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
 *      createCard: Ein Bool für die Erstellung der CustomerCards. Wenn true, wird aus dem Eintrag eine Card erstellt. 
 * 
 *                  Der Aufbau eines HTML-Elements ist wie folgt:
 *                      <div>           
 *                          <div class="cell_head"> 'label' </div>      
 *                          <div class="cell_value" id = 'match'> 'value' </div>   
 *                      </div>
 */
    function providerPattern() { 
        let CustomerData = [
            { label: 'Vorname',         match: 'firstname',             value: "",   standAlone: true,     createCard: true },
            { label: 'Nachname',        match: 'surname',               value: "",   standAlone: true,     createCard: true },
            { label: 'Geb.-Datum',      match: 'dateofbirth',           value: "",   standAlone: true,     createCard: true },
            { label: 'E-Mail',          match: 'emailprivate',          value: "",   standAlone: true,     createCard: true },
            { label: '',                match: 'seperator',             value: "",   standAlone: true,     createCard: true },
            { label: 'Kundennummer',    match: 'customerid',            value: "",   standAlone: true,     createCard: true },
            { label: 'Vertragsnummer',  match: 'vertrag',               value: "",   standAlone: true,     createCard: true },
            { label: 'Zählernummer',    match: 'counternumber',         value: "",   standAlone: true,     createCard: true },
            { label: 'Vorwahl',         match: 'phonehomeareacode',     value: "",   standAlone: false,    createCard: true },
            { label: 'Festnetz',        match: 'phonehome',             value: "",   standAlone: true,     createCard: true },
            { label: 'Mobilvorwahl',    match: 'phonemobileareacode',   value: "",   standAlone: false,    createCard: true },
            { label: 'Mobil',           match: 'phonemobile',           value: "",   standAlone: true,     createCard: true },
            { label: '',                match: 'seperator',             value: "",   standAlone: true,     createCard: true },
            { label: 'Strasse',         match: 'street',                value: "",   standAlone: true,     createCard: true },
            { label: 'Hausnummer',      match: 'housenumber',           value: "",   standAlone: true,     createCard: true },
            { label: 'PLZ',             match: 'zip',                   value: "",   standAlone: true,     createCard: true },
            { label: 'Ort',             match: 'city',                  value: "",   standAlone: true,     createCard: true },
            { label: 'Produkt',         match: 'product',               value: "",   standAlone: true,     createCard: true },
            { label: 'Startdatum',      match: 'startdate',             value: "",   standAlone: true,     createCard: true },
            { label: 'Lieferbeginn',    match: 'cratedate',             value: "",   standAlone: true,     createCard: true },
            { label: 'Datensatz',       match: 'preset1',               value: "test",   standAlone: true,     createCard: false },
        ];
        return CustomerData
    };

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
        let triggerData = [
            { id: 'PAtxt1',   grp:'a',    target_id: 'zusammenfassung_text',    active: false,       value: "<p>Hier könnte ihre Werbung stehen.</p>" },
            { id: 'PAtxt2',   grp:'a',    target_id: 'zusammenfassung_text',    active: false,       value: ""    },
            { id: 'NAtxt2',   grp:'a',    target_id: 'zusammenfassung_text',    active: false,       value: ""    },
            { id: 'VEs01',    grp:'b',    target_id: 'zusammenfassung_text',    active: false,       value: "<p>Der Kunde hat einen bestehenden Stromvertrag.</p>"   },
            { id: 'VEg01',    grp:'b',    target_id: 'zusammenfassung_text',    active: false,       value: "<p>Der Kunde hat einen bestehenden Gasvertrag.</p>"     },
        ];
        return triggerData;
    }

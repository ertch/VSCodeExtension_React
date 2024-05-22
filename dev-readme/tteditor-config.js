
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

let addressdatatable = 'ste_wel_addressdata';
let salesdatatable = 'ste_wel_addressdata';
let fieldname_firstname = "firstname";
let fieldname_lastname = "surname";

// [ "", "", "192.169.18.11",  "Voicefiles_Phoenix",  "VF_Diverse",  "Kampagnenname", "filename.Suffix"]
let recordingPrefix = "\\\\192.168.11.14\\Voicefiles_Phoenix\\VF_Diverse\\ste_wel\\";
let FileNamePattern = ["date", "time", "agendID", "customerid", "" ]; // Zuweisung in setRecordName()
let recordingNameSuffix = ""; //mit . 
let recordFileName;

let startCallwithState = 2;

let triggerData = triggerPattern();
let CostumerData = providerPattern();

let blnPersonalAppointment = 1;
let direction = 2;
let recordingComplete = 0;

let LogIntottDB = false;        // Wenn true, werden Errormsg an die ttFrameDB geschickt
let showDebug = true            // Wenn true, kann der Log auf der Seite eingeblendet werden (HotKey = [Strg] + [°^])
var debug = true;               // Wenn true, dann wird der SQL-Fakeconnector zu Nestor genommen


//------------------------------------------------------------------- Systemzeit --------------------------------------------------------------------------
// Diese Funktionen werden für Zeitstempel genutzt. Wie diese ausgegeben werden sollen, kann man hier anpassen.

function getdate() { // Datum
    let datum = new Date().toLocaleDateString('default',{ day: 'numeric' , month: 'short', year: 'numeric'});
    datum = datum.replace(/\.+/g, '')
                 .replace(/\s+/g, '');      // tt(monat)yyyy = "22Mai2024"
    return datum;
}

function gettime() { // Uhrzeit
    let time = new Date().toLocaleTimeString();
    return `${time.replace(/\:+/g, '-')}uhr`; // hh-mm-ss
}

//---------------------------------------------------------------------------------------------------------------------------------------------------------
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ ProviderPattern ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//---------------------------------------------------------------------------------------------------------------------------------------------------------

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
 *                  Der Aufbau eines HTML-Elements ist wie folgt:
 *                      <div>           
 *                          <div class="cell_head"> 'label' </div>      
 *                          <div class="cell_value" id = 'match'> 'value' </div>   
 *                      </div>
 */
    function providerPattern() { 
        let CustomerData = [
            { label: 'Vorname',         match: 'firstname',             value: "",   standAlone: true   },
            { label: 'Nachname',        match: 'surname',               value: "",   standAlone: true   },
            { label: 'Geb.-Datum',      match: 'dateofbirth',           value: "",   standAlone: true   },
            { label: 'E-Mail',          match: 'emailprivate',          value: "",   standAlone: true   },
            { label: '',                match: 'seperator',             value: "",   standAlone: true   },
            { label: 'Kundennummer',    match: 'customerid',            value: "",   standAlone: true   },
            { label: 'Vertragsnummer',  match: 'vertrag',               value: "",   standAlone: true   },
            { label: 'Zählernummer',    match: 'counternumber',         value: "",   standAlone: true   },
            { label: 'Vorwahl',         match: 'phonehomeareacode',     value: "",   standAlone: false  },
            { label: 'Festnetz',        match: 'phonehome',             value: "",   standAlone: true   },
            { label: 'Mobilvorwahl',    match: 'phonemobileareacode',   value: "",   standAlone: false  },
            { label: 'Mobil',           match: 'phonemobile',           value: "",   standAlone: true   },
            { label: '',                match: 'seperator',             value: "",   standAlone: true   },
            { label: 'Strasse',         match: 'street',                value: "",   standAlone: true   },
            { label: 'Hausnummer',      match: 'housenumber',           value: "",   standAlone: true   },
            { label: 'PLZ',             match: 'zip',                   value: "",   standAlone: true   },
            { label: 'Ort',             match: 'city',                  value: "",   standAlone: true   },
            { label: 'Produkt',         match: 'product',               value: "",   standAlone: true   },
            { label: 'Startdatum',      match: 'startdate',             value: "",   standAlone: true   },
            { label: 'Lieferbeginn',    match: 'cratedate',             value: "",   standAlone: true   },
            { label: 'Datensatz',       match: '',                      value: "",   standAlone: true   },
        ];
        return CustomerData
    };

//---------------------------------------------------------------------------------------------------------------------------------------------------------
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ TriggerPattern ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//---------------------------------------------------------------------------------------------------------------------------------------------------------

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
            { id: 'PAtxt1',   grp:'a',    target_id: 'zusammenfassung_text',    active: false,       value: ""    },
            { id: 'PAtxt2',   grp:'a',    target_id: 'zusammenfassung_text',    active: false,       value: ""    },
            { id: 'NAtxt2',   grp:'b',    target_id: 'zusammenfassung_text',    active: false,       value: ""    },
        ];
        return triggerData;
    }


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

let startCallwithState = 2;


let blnPersonalAppointment = 1;
let direction = 2;
let recordingComplete = 0;

let LogIntottDB = false;        // Wenn true, werden Errormsg an die ttFrameDB geschickt
let showDebug = true            // Wenn true, kann der Log auf der Seite eingeblendet werden (HotKey = [Strg] + [°^])
var debug = true;               // Wenn true, dann wird der SQL-Fakeconnector zu Nestor genommen




//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

function dataPattern() { // Der Name der gewünschten Funktion wird im CustumerCells HTML-Element unter provider ="" eingetragen.
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
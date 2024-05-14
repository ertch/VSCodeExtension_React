/* Es folgen alle kampagnenspezifischen globalen Variablen */

var currentTab = "tab_start";
var calldatatableId;
var addressdatatableId;
var agentId;

// Diese Variablen müssen abhängig von der Kampagne geändert werden
var campaignId = 679;
var addressdatatable = 'ste_wel_addressdata';
var salesdatatable = 'ste_wel_addressdata';



var resultIdPositiv = 8911;
var resultIdNegativ = 8912;
var resultIdWv = 8913;

var resultIdAbfax = 8915;

var resultIdApne0h = 8916;
var resultIdApne1h = 8917;
var resultIdApne2h = 8918;
var resultIdApne3h = 8919;
var resultIdApne4h = 8920;
var resultIdApne5h = 8921;
var resultIdApne6h = 8922;
var resultIdApne8h = 8923;
var resultIdApne20h = 8924;

var fieldname_firstname = "firstname";
var fieldname_lastname = "surname";
var blnPersonalAppointment = 1;


var debug_vf = 0;

// Tagesziel an Abschl?ssen
var dailyToGo = 150;

var recordingPrefix = "\\\\192.168.11.14\\Voicefiles_Phoenix\\VF_Diverse\\ste_wel\\";
var recordingName;
var recordingNameSuffix = "";
var direction = 2;
var recordingComplete = 0;

var debug = true; // Wenn true, dann wird der SQL-Fakeconnector zu Nestor genommen
var logLevel = "debug"; // kann debug, info, warning, error, fatal sein

var ttWeb = new Object();


    function gf_javaf_initialize(){
        console.log("gf_javaf_initialize") // JS analyse
        if (!debug)	{	
        
            this.parent.contentInterface.initialize(window,

                function onInitialized(contentInterface) {
                    //window.contentInterface= contentInterface;
                    ttWeb = contentInterface;
                    gf_initialize();
                    },
                //Error
                function onInitializeError(e) {
                    alert('Initialize contentInterface failed: '+e.message)
                    }
            );

        } else {
            gf_initialize();
        };
    };


    function filterSqlResult(s) {
        if (s == '-')
            s = '';
        return s;
    }

    function filterSqlResultForProduct(s, blnWithEuro) {
        if (s == '-')
            s = 'kostenlos';
        else {
            s1 = s.replace(/\./g, ",");

            s = s1 + "&nbsp;&euro;";
        }
        return s;
    }

    /*
    * Initfunktion, die bei Aufruf der Maske alle n?tigen Daten aus der DB zieht
    * und die globalen Variablen setzt
    */
    function gf_initialize() {
        console.log("gf_initialize") // JS analyse
        console.log("gf_init was executed")


        ziel = "select tagesziel from livestat_settings where campaign_id = '" + campaignId + "'";
        dailyToGo = executeSql(ziel);


        // document.execCommand("BackgroundImageCache",false,true);

        blnFinishPositive = false;

        if (!debug) {
            //direction = ttWeb.getCallDirection();
            calldatatableId = ttWeb.getCalltableField('ID');
            msisdn = ttWeb.getCalltableField('HOME');
            indicator = ttWeb.getIndicator();
            if (indicator == 1) {
                telKontakt = ttWeb.getCalltableField('HOME');
            } else if (indicator == 2) {
                telKontakt = ttWeb.getCalltableField('BUSINESS');
            } else
                telKontakt = ttWeb.getCalltableField('OTHER');
            festnetz = ttWeb.getCalltableField('BUSINESS');
            agentId = ttWeb.getUser().Login;

        } else {

            calldatatableId = 79880808;
            msisdn = "01768655885";
            telKontakt = "0190123123";
            agentId = "2008";
        }

        insertIntoLog("info", "Datensatz wurde Tel. " + telKontakt + " angerufen (Msisdn: " + msisdn + ")", "");
        console.log("insertIntoLog was executed")


        callResultId = 0;
        var query = "SELECT result_id FROM calldatatable where id=" + calldatatableId + " LIMIT 1";
        resultat = executeSql(query);

        console.log(resultat);

        if (!debug && resultat[0].rows.length > 0){
            callResultId = resultat[0].rows[0].fields.result_id;
        }

        if (!debug && resultat[0].rows.length > 0){
            callResultId = resultat[0].rows[0].fields.result_id;
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

        // Aufgrund des Flackerns wurde das Draggen der Popupdivs erstmal disabled:
        // new Draggable($('negativ'), {});
        // new Draggable($('wiedervorlage'), {});
        // new Draggable($('apne'), {});

        console.log("under Draggable")

    /**createCusomerCells
     * 
     * Diese Funktion erstellt CustomerCells basierend auf den angegebenen Daten.
     * Sie durchläuft die Daten der DB und füllt die entsprechenden Werte in die CustomerData, bevor sie in die Cells via HTML eingefügt werden.
     * 
     */
    function createCustomerCells() {
        try {
            // Hole das Element "customerCells", in dem die Kundeninfo angezeigt werden sollen
            let cardHolder = document.getElementById("customerCells");
            let error_msg = document.getElementById("customerCells_errorMsg")
            let CustomerData ;
            let SqlField ;

            // Überprüfe, ob ein benutzerdefiniertes Pattern angegeben ist, andernfalls verwende das Standardpattern (provider_libs.js)
            if (cardHolder.getAttribute("data-provider") != null){
                let execute = cardHolder.getAttribute("data-provider");
                CustomerData = executeFunctionFromString(execute);
            } else {
                CustomerData = providerDefault();
            };

            // Überprüfe, ob eine benutzerdefinierte SQL_Statement angegeben ist, andernfalls verwende die Standardabfrage (query_lib.js)
            if (cardHolder.getAttribute("data-query") != null){
                let execute = cardHolder.getAttribute("data-query");
                SqlField = executeFunctionFromString(execute.toString());
            } else {
                SqlField = queryDefault();
            };

            // Prüfe ob die Datensätze vertauscht sind, anhand von key("standAlone")
            if (typeof SqlField.keys === 'function' && SqlField.keys("standAlone")) { 
                error_msg.innerHTML =  "Datensatz fehlerhaft";
                error_msg.className = "errormessage--db_error";

            } else {
                error_msg.className = "errormessage--db_error" ? error_msg.className = "errormessage--db_error d-none" : undefined;
                // Durchlaufe jedes Element in CustomerData
                for (const [index] of Object.entries(CustomerData)) {
                    // Finde den passenden Index in SqlField, der mit dem Schlüsselwort aus CustomerData übereinstimmt
                    matchingKey = Object.keys(SqlField).indexOf(CustomerData[index].match);
                                    
                    // Prüfe ob Index von Customerdata in SqlField vorhanden und > -1 ist.
                    // Dann schreibe den Value des Keys, zu dem der Index gehört, in CustomerData 
                    if (Object.keys(SqlField).indexOf(CustomerData[index].match) > -1) {
                        CustomerData[index].value = SqlField[Object.keys(SqlField)[matchingKey]] 
                    } else {  
                        CustomerData[index].value = "-";
                    };
                };
            
                // Erstelle HTML-Elemente für die Kundenzellen basierend auf den CustomerData-Werten
                let chache = ""; // Zwischenspeicher für zu übertragende Werte
                for (let i = 0; i < CustomerData.length; i++) {
                    let label = CustomerData[i].label; 
                    let id = CustomerData[i].match;
                    let value = CustomerData[i].value;
                    let standAlone = CustomerData[i].standAlone;

                    // Füge den Wert dem Zwischenspeicher hinzu, wenn er nicht standAlone ist
                    standAlone ? undefined : chache = value;
                    // Füge den Zwischenspeicherwert dem aktuellen Wert hinzu, wenn dieser standAlone true ist.
                    if (standAlone && chache !== "") value = `${chache} ${value}`, chache = ""; 

                    if (standAlone) { // Füge die Cell oder Separator in das HTML ein wenn standAlone true
                        if (id != "seperator") { 
                            cardHolder.innerHTML = ` 
                                ${cardHolder.innerHTML}  
                                <div class="cell">
                                    <div class="cell__head">${label}</div>
                                    <div class="data_value cell__data" id=${id}>${value}</div>
                                </div>
                            `;
                        } else {
                            console.log("seperartor i= " + i + " / id = " + id)
                            cardHolder.innerHTML = ` 
                                ${cardHolder.innerHTML}
                                <div class='separator'></div>
                            `;
                        }
                    };
                };
            };

            //WIP
            // recordingName = vertragsnr + "_" + msisdn + "_[#datetime]";
            getCampaignData(campaignId, agentId, addressdatatableId, addressdatatable);

            // Logs 
            insertIntoLog("debug", "Adressdaten wurden geladen.", "");       
        } catch (error) {
            debug && console.log("Error: => SQL-Ergebnisse konnten nicht in Cells geladen werden");
            debug && console.log(error);
        }  
    };
    createCustomerCells();
    getCampaignData(campaignId,agentId,"",addressdatatable,"");
};
    
    function providerDefault() {
        let CustomerData = [
            {label: 'Vorname',          match: 'firstname',             value: "",   standAlone: true   },
            {label: 'Nachname',         match: 'surname',               value: "",   standAlone: true   },
            {label: 'Geb.-Datum',       match: 'dateofbirth',           value: "",   standAlone: true   },
            {label: 'E-Mail',           match: 'emailprivate',          value: "",   standAlone: true   },
            {label: '',                 match: 'seperator',             value: "",   standAlone: true   },
            {label: 'Kundennummer',     match: 'customerid',            value: "",   standAlone: true   },
            {label: 'Vertragsnummer',   match: 'vertrag',               value: "",   standAlone: true   },
            {label: 'Vorwahl',          match: 'phonehomeareacode',     value: "",   standAlone: false  },
            {label: 'Festnetz',         match: 'phonehome',             value: "",   standAlone: true   },
            {label: 'Mobilvorwahl',     match: 'phonemobileareacode',   value: "",   standAlone: false  },
            {label: 'Mobil',            match: 'phonemobile',           value: "",   standAlone: true   },
            {label: '',                 match: 'seperator',             value: "",   standAlone: true   },
            {label: 'Strasse',          match: 'street',                value: "",   standAlone: true   },
            {label: 'Hausnummer',       match: 'housenumber',           value: "",   standAlone: true   },
            {label: 'PLZ',              match: 'zip',                   value: "",   standAlone: true   },
            {label: 'Ort',              match: 'city',                  value: "",   standAlone: true   }, 
        ];
        return CustomerData
    };
   
    function ste_out_1() {
        let query = `
            select 
                ${addressdatatable}.id as addressdataid, \
                trim(if(isnull(customerid),'-',if(customerid = '','-',customerid))) as customerid, \
                trim(if(isnull(firstname),'-',if(firstname = '','',firstname))) as firstname, \
                trim(if(isnull(surname),'-',if(surname = '','',surname))) as surname, \
                trim(if(isnull(dateofbirth),'-',if(dateofbirth = '','',dateofbirth))) as dateofbirth, \
                trim(if(isnull(emailprivate),'-',if(emailprivate = '','',emailprivate))) as emailprivate, \
                trim(if(isnull(phonemobileareacode),'-',if(phonemobileareacode = '','',phonemobileareacode))) as phonemobileareacode, \
                trim(if(isnull(phonemobile),'-',if(phonemobile = '','',phonemobile))) as phonemobile, \
                trim(if(isnull(phonehomeareacode),'-',if(phonehomeareacode = '','',phonehomeareacode))) as phonehomeareacode, \
                trim(if(isnull(phonehome),'-',if(phonehome = '','',phonehome))) as phonehome, \
                trim(if(isnull(street),'-',if(street = '','',street))) as street, \
                trim(if(isnull(housenumber),'-',if(housenumber = '','',housenumber))) as housenumber, \
                trim(if(isnull(zip),'-',if(zip = '','',zip))) as zip, \
                trim(if(isnull(city),'-',if(city = '','',city))) as city, \
                trim(if(isnull(energy),'-',if(energy = '','',energy))) as energy, \
                trim(if(isnull(createdat),'-',if(createdat = '','',createdat))) as cratedate, \
                trim(if(isnull(marketlocation),'-',if(marketlocation = '','-',marketlocation))) as marketlocation, \
                trim(if(isnull(product),'-',if(product = '','-',product))) as product, \
                trim(if(isnull(id_nr),'-',if(id_nr = '','-',id_nr))) as id_nr, \
                trim(if(isnull(startdate),'-',if(startdate = '','-',startdate))) as startdate, \
                trim(if(isnull(baseprice),'-',if(baseprice = '','-',baseprice))) as baseprice, \
                trim(if(isnull(workingprice),'-',if(workingprice = '','-',workingprice))) as workingplace, \
                trim(if(isnull(productbonus),'-',if(productbonus = '','-',productbonus))) as productbonus, \
                trim(if(isnull(productinstantbonus),'-',if(productinstantbonus = '','-',productinstantbonus))) as productinstantbonus, \
                trim(if(isnull(adsmail),'-',if(adsmail = '','-',adsmail))) as adsmail, \
                trim(if(isnull(adsphone),'-',if(adsphone = '','',adsphone))) as adsphone, \
                trim(if(isnull(adspost),'-',if(adspost = '','',adspost))) as adspost, \
                trim(if(isnull('usage'),'-',if('usage' = '','','usage'))) as adsage, \
                trim(if(isnull(enddate),'-',if(enddate = '','',enddate))) as enddate, \
                trim(if(isnull(iban),'-',if(iban = '','',iban))) as iban, \
                trim(if(isnull(bic),'-',if(bic = '','',bic))) as bic, \
                trim(if(isnull(bank),'-',if(bank = '','',bank))) as bank, \
                trim(if(isnull(counternumber),'-',if(counternumber = '','',counternumber))) as counternumber, \
                trim(if(isnull(vertrag),'-',if(vertrag = '','',vertrag))) as vertrag, \
                trim(if(isnull(grossamount),'-',if(grossamount = '','',grossamount))) as grossamount \
            from ${addressdatatable} \
            join calldatatable on calldatatable.addressdata_id = ${addressdatatable}.id \
            where calldatatable.id = ${calldatatableId} limit 1
        `;
        
        let SQLdataset = executeSql(query);
        console.log(SQLdataset);
        addressdatatableId = SQLdataset[0].rows[0].columns[0];
        SqlField = SQLdataset[0].rows[0].fields;
        return SqlField;
    }
    


/*
 * Diese FUnktion wird von switchTab (outbound.js) bei jedem Tabwechsel
 * aufgerufen. Hier wird je nach Seitenwechsel der Validator f?r die aktuelle
 * Seite angeschmissen. Liefert der Validator false, so kann das Tab nicht
 * verlassen werden
 */
function validateTab(name) {
    console.log("validateTab") // JS analyse
    switch (name) {

        case "tab_start":
            return true;
        case "tab_produkt":
            return validateDatenerfassung();            
        case "tab_zusammenfassung":
            return true;
    }

    return false;
}

/* Validator f?r die Datenerfassung (Seite1) */
function validateDatenerfassung() {
    console.log("validateDatenerfassung") // JS analyse
    var blnSuccess = true;
    if ($('datenerfassung_produkt').value == "nein" ) {
        blnSuccess &= validateSelect($('datenerfassung_ablehnungsgrund').value, 'Ablehnungsgrund',$('datenerfassung_ablehnungsgrund_errorMsg'));
        //blnSuccess &= validateSelect($('datenerfassung_optin_detail').value, 'Optin trotz negativ?',$('datenerfassung_error_optin_detail'));
        
    }
    
    if ($('datenerfassung_produkt').value == "ja" ) {
    	blnSuccess &= validateEmail($('datenerfassung_email').value, 'E-Mail', $('datenerfassung_email_errorMsg'), true);
        blnSuccess &= validateMSISDN($('datenerfassung_telefon').value, 'Telefonnummer' , $('datenerfassung_telefon_errorMsg'), true);
        blnSuccess &= validateSelect($('datenerfassung_lead').value, 'Lead',$('datenerfassung_lead_errorMsg'));
        
        if ($('datenerfassung_lead').value == "Strom" || $('datenerfassung_lead').value == "Gas"){
        	blnSuccess &= validateDate($('datenerfassung_vertragsende').value,'Vertragsende',$('datenerfassung_vertragsende_errorMsg'),true,2023,2026);
        }
        
        blnSuccess &= validateSelect($('datenerfassung_optin_detail').value, 'Optin',$('datenerfassung_optin_detail_errorMsg'));
    }
    
    /*
    if($('datenerfassung_produkt').value == "ja" && $('datenerfassung_kombiprodukt').value == "P_01"
    	|| $('datenerfassung_produkt').value == "nein" && $('datenerfassung_optin_detail').value == "ja"){
    	
        blnSuccess &= validateSelect($('opt_email').value, 'Opt-In E-Mail',$('datenerfassung_error_opt_email'));
        blnSuccess &= validateSelect($('opt_post').value, 'Opt-In Post',$('datenerfassung_error_opt_post'));
        blnSuccess &= validateSelect($('opt_telefon').value, 'Opt-In Telefon',$('datenerfassung_error_opt_telefon'));	
    }
    */

    return blnSuccess;
}

function showprodukt() {
    console.log("showprodukt") // JS analyse
    if ($('datenerfassung_produkt').value == "nein") {	
    	document.getElementById('datenerfassung_product').style.display = "none";
        document.getElementById('datenerfassung_ablehnung').style.display = "block";   		
    } else {	
        document.getElementById('datenerfassung_product').style.display = "block";
        document.getElementById('datenerfassung_ablehnung').style.display = "none";
    }
    return true;
}

function showzusammenfassung() {
    console.log("showzusammenfassung") // JS analyse
    if (validateDatenerfassung()) {
        if ($('datenerfassung_optin_detail').value != "keine" && $('datenerfassung_optin_detail').value != "out" ) {
            document.getElementById('abschliessen').style.display = "none";                    
            document.getElementById('recording').style.display = "block";  
        } else {
            document.getElementById('abschliessen').style.display = "block";
            document.getElementById('recording').style.display = "none";            
        }
    }
}

function showVertragsende() {
    console.log("showVertragsende") // JS analyse
    if ($('datenerfassung_lead').value != "Kein Lead") {
        document.getElementById('datenerfassung_vertragsende_div').style.display = "block";            
    } else {
        document.getElementById('datenerfassung_vertragsende_div').style.display = "none";           
    }
}

function showVerabschiedungBtn() {
    console.log("showVerabschiedungBtn") // JS analyse
    if(document.getElementById('datenerfassung_ablehnungsgrund').value != ""){
        document.getElementById('tab_next_zusammenfassung_1').className = "left_right go";
    }else{
        var blnSuccess = true;

        blnSuccess &= (document.querySelector('#datenerfassung_email').value !== "");
        blnSuccess &= (document.querySelector('#datenerfassung_telefon').value !== "");

        if (blnSuccess == true) {
            document.getElementById('tab_next_zusammenfassung_1').className = "left_right go";
        }
    }
}

/* Schlie?t einen Datensatz positiv ab */
function finishPositive() {
    console.log("finishPositive") // JS analyse
    // Logik ob Produkt gekauft wird
    if ($('datenerfassung_produkt').value != "nein") {
    	
    	terminate = "100";    	
    	
        var update = "update "
            + addressdatatable
            + " set emailprivate_neu = '" + escapeString($('datenerfassung_email').value) + "', "
            + " telefon_neu = '" + escapeString($('datenerfassung_telefon').value) + "', "
            + " lead = '" + escapeString($('datenerfassung_lead').value) + "', "
            + " lead_vertragsende = '" + escapeString($('datenerfassung_vertragsende').value) + "', "
            + " optin_neu = '" + escapeString($('datenerfassung_optin_detail').value) + "'"
            + " where id = " + addressdatatableId ;          
            
            updateSql(update);
        

        updateSql("UPDATE calldatatable SET result_id = '" + resultIdPositiv + "', calldate = now(), agent_id = '"
            + agentId + "' WHERE id = '" + calldatatableId + "' and campaign_id = '" + campaignId + "' LIMIT 1;");
        
        
        if ($('datenerfassung_optin_detail').value == "voll" || $('datenerfassung_optin_detail').value == "schrift"){        	
        	
            voicefileName = generateVoicefilename(recordingPrefix, recordingName, recordingNameSuffix, recordingComplete, terminate);
            
            saveVoiceRecordingName(voicefileName);
            
            if (!debug){
                ttWeb.saveRecording(voicefileName);
            }else{
                alert(voicefileName);
            }
            
        }
        
        
    } else 	{
    	
    	terminate = "200";    	
    	
        var query = "update " + addressdatatable + " set " +
            "cancellation_reason_id = '" + escapeString($('datenerfassung_ablehnungsgrund').value) + "' where id = " + addressdatatableId ;
        updateSql(query);

        updateSql("UPDATE calldatatable SET result_id = '" + resultIdNegativ + "', calldate = now(), agent_id = '"
            + agentId + "' where id = '" + calldatatableId + "' and campaign_id = '" + campaignId + "' limit 1;");
        
        
        if (!debug){
            ttWeb.clearRecording();
        }else{
            alert("Eventuelle Aufzeichnung verworfen");
        }
       
    	}
    
    
    // Call Terminieren
    if (!debug) {
        if (ttWeb.getRecordingState() == 3) {
            ttWeb.saveRecording(recordingPrefix + calldatatableId + ".mp3");
        }
        ttWeb.terminateCall(terminate);
    } else {
        alert(terminate);

    }

}

function recording_complete_start() {
    console.log("recording_complete_start") // JS analyse
    insertIntoLog("info", "Vollstaendiges Voicerecording wurde angeschaltet.", "");
    recordingComplete = 1;

    if (!debug){

        if (ttWeb.getRecordingState() != 3) {
            OWvoicefileName = generateVoicefilenameOneWay(recordingPrefix, recordingName, recordingNameSuffix, recordingComplete); //fehlende function
            if (!debug) ttWeb.saveRecording(OWvoicefileName); //saveRecord in ttFrame 4 fordert als String in der Methode den SpeicherPfad und nicht den Namen der Datei.
        }

    }


    if (!debug) {
        ttWeb.setRecordingState(3);
    }

    //document.getElementById('abschliessen_complete').style.display="none";
    //document.getElementById('abschliessen').style.display="block";
}



/*
function makeRecall() {

    ttWeb.setCalltableField('OTHER', $('recall_number').value);
    ttWeb.setIndicator(3);
    ttWeb.terminateCall('RR', null, null, 1);

}
*/

// function makeRecall(){
//     console.log("makeRecall") // JS analyse
// 	  blnSuccess=true;
// 	  blnSuccess&=validateRufnummer(document.getElementById('recall_number').value,errMsg);
// 		if(blnSuccess == true){
// 			//ttWeb.setCalltableField('OTHER', $('recall_number').value);
// 			//ttWeb.setIndicator(3)
// 			ttWeb.clearRecording();
// 			ttWeb.makeCustomerCall($('recall_number').value);
// 			//ttWeb.terminateCall('RR', null, null, 1);	
// 		}
		
// }

function executeFunctionFromString(funcString) {
        
    let funcName = funcString.match(/^(\w+)\(/)?.[1]; // Extrahiert den Namen der Funktion aus der Zeichenkette
    let argsMatch = funcString.match(/\(([^)]+)\)/)?.[1];  // Extrahiert die Argumente der Funktion aus der Zeichenkette
    let args = argsMatch ? argsMatch.split(',').map(arg => arg.trim()) : []; // Zerlegt die Argumente in ein Array
    let giveBack;

    // Prüft, ob die extrahierte Funktion existiert und eine Funktion ist
    if (funcName && typeof window[funcName] === 'function') {
       giveBack = window[funcName](...args); // Aufruf
    } else {
        debug && console.log(`Funktion '${funcName}' existiert nicht.`); //Error_msg
    }
    return giveBack;
}

// ############################################################################################## GATEKEEPER #############################################################################################
//  Kurze Beschreibung:
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
    
    // Prüfen, ob actionArr ein Array oder eine String-Id ist
    if (Array.isArray(actionArr)) {
        // Wenn actionArr ein Array ist, die relevanten Werte zuweisen
        [select, switchGrp, nextFunc] = [
            document.getElementById(actionArr[0][0]),
            document.querySelectorAll(`[data-grp=${actionArr[0][1]}]`),
            actionArr[0][2]
        ];
    } else {
        // Wenn actionArr eine String-Id ist, die Anweisungen aus dem Datenattribut des Selects parsen und zuweisen
        gateArr = JSON.parse(actionArr.getAttribute("data-array").replace(/&quot;/g, `"`));
        gateArr.forEach(entry => {
            if (entry.length > 3) {
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

    // Durchlaufen der Anweisungen im gateArr
    gateArr.forEach(operation => {
        let [value, action, target] = operation; 
        // Überprüfen, ob die aktuelle Select-Option mit dem Wert übereinstimmt
        if (value === select.value) {
            try {                   // <<<>>> Auftrag für aktuelle Select.value ausführen
                if (action === 'openOnly') {  // wenn openOnly oder alwaysClose --> Gruppe = d-none
                    switchGrp.forEach(element => element.classList.add('d-none'));
                } else if (target === 'all') {        // wenn all --> target = Gruppe
                    switchGrp.forEach(element => 'open' ? element.classList.remove('d-none') : element.classList.add('d-none'));
                };
                
                // Ausführen der entsprechenden Aktion (öffnen oder schließen) für jedes Ziel
                switch (action) {
                    case 'close':
                        (Array.isArray(target) ? target : [target]).forEach(id => {
                            document.getElementById(id).classList.add('d-none');
                        });
                        break;
                
                    case 'open':
                    case 'openOnly':
                        (Array.isArray(target) ? target : [target]).forEach(id => {
                            document.getElementById(id).classList.remove('d-none');
                        });
                        break;
                
                    default:
                        // Fehlermeldung ausgeben, wenn die Aktion nicht erkannt wird
                        debug && console.log(`Error: gatekeeper von "${select.id}" hat fehlerhafte action: "${action}" ${gateArr}`);
                } 
                // Ausführen der Folgefunktion, falls vorhanden
                executeFunctionFromString(nextFunc);

            } catch (error) {
                // Fehlermeldung ausgeben
                debug && console.log(`>>Fehler<< gatekeeper von "${select.id}" wurde fehlerhaft ausgeführt! \n Error: ${error.stack}`);
            };
        };
    });
};

function validateSelectNew(optionId, optionValue){ // Prüfe ob select den gewünschten wert hat
    let select = document.getElementById(optionId);
    debug && console.log(select.value);
    return select.value === optionValue ? true : false;
 }


 //############################################################################## PopupRotz #########################################################################

    function freedial() {
        var blnSuccess = true;
        var errMsg = '';

        if (document.getElementById('recall_number').value === '') {
        blnSuccess = false;
        errMsg = 'Bitte Rufnummer eingeben!';
        }

        if (blnSuccess) {
        document.getElementById('lightbox').style.display = 'none';
        document.getElementById('negativ').style.display = 'none';
        makeRecall();
        } else {
        alert(errMsg);
        }
        return false;
    }

     document.addEventListener("DOMContentLoaded", function() {
        const dialogList    = document.getElementsByTagName("dialog");
        const showButtonList = document.getElementsByClassName("calldialog");
        const closeButtonList = document.getElementsByClassName("closedialog");
    
        // "Show the dialog" button opens the dialog modal
        for(let x = 0; x < showButtonList.length; x++) {
            showButtonList[x].addEventListener("click", () => {
                console.log("click on " + showButtonList[x].id);
                dialogList[x].showModal();
            });
        }
    
        // "Close" button closes the dialog
        for(let x = 0; x < closeButtonList.length; x++) {
            closeButtonList[x].addEventListener("click", () => {
                dialogList[x].close();
            });
        }
    });
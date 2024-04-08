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

	} else gf_initialize();
	

	}


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

    if (!debug && resultat[0].rows.length > 0)
        callResultId = resultat[0].rows[0].fields.result_id;


    if (!debug && resultat[0].rows.length > 0)
        callResultId = resultat[0].rows[0].fields.result_id;

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

    query = "SELECT "
        + addressdatatable
        + ".id as addressdataid, \
      trim(if(isnull(customerid),'-',if(customerid = '','-',customerid))), \
trim(if(isnull(firstname),'-',if(firstname = '','',firstname))), \
trim(if(isnull(surname),'-',if(surname = '','',surname))), \
trim(if(isnull(dateofbirth),'-',if(dateofbirth = '','',dateofbirth))), \
trim(if(isnull(emailprivate),'-',if(emailprivate = '','',emailprivate))), \
trim(if(isnull(phonemobileareacode),'-',if(phonemobileareacode = '','',phonemobileareacode))), \
trim(if(isnull(phonemobile),'-',if(phonemobile = '','',phonemobile))), \
trim(if(isnull(phonehomeareacode),'-',if(phonehomeareacode = '','',phonehomeareacode))), \
trim(if(isnull(phonehome),'-',if(phonehome = '','',phonehome))), \
trim(if(isnull(street),'-',if(street = '','',street))), \
trim(if(isnull(housenumber),'-',if(housenumber = '','',housenumber))), \
trim(if(isnull(zip),'-',if(zip = '','',zip))), \
trim(if(isnull(city),'-',if(city = '','',city))), \
trim(if(isnull(energy),'-',if(energy = '','',energy))), \
trim(if(isnull(createdat),'-',if(createdat = '','',createdat))), \
trim(if(isnull(marketlocation),'-',if(marketlocation = '','-',marketlocation))), \
trim(if(isnull(product),'-',if(product = '','-',product))), \
trim(if(isnull(id_nr),'-',if(id_nr = '','-',id_nr))), \
trim(if(isnull(startdate),'-',if(startdate = '','-',startdate))), \
trim(if(isnull(baseprice),'-',if(baseprice = '','-',baseprice))), \
trim(if(isnull(workingprice),'-',if(workingprice = '','-',workingprice))), \
trim(if(isnull(productbonus),'-',if(productbonus = '','-',productbonus))), \
trim(if(isnull(productinstantbonus),'-',if(productinstantbonus = '','-',productinstantbonus))), \
trim(if(isnull(adsmail),'-',if(adsmail = '','-',adsmail))), \
trim(if(isnull(adsphone),'-',if(adsphone = '','',adsphone))), \
trim(if(isnull(adspost),'-',if(adspost = '','',adspost))), \
trim(if(isnull('usage'),'-',if('usage' = '','','usage'))), \
trim(if(isnull(enddate),'-',if(enddate = '','',enddate))), \
trim(if(isnull(iban),'-',if(iban = '','',iban))), \
trim(if(isnull(bic),'-',if(bic = '','',bic))), \
trim(if(isnull(bank),'-',if(bank = '','',bank))), \
trim(if(isnull(counternumber),'-',if(counternumber = '','',counternumber))), \
trim(if(isnull(vertrag),'-',if(vertrag = '','',vertrag))), \
trim(if(isnull(grossamount),'-',if(grossamount = '','',grossamount))) \
    FROM "
        + addressdatatable + " \
join calldatatable on calldatatable.addressdata_id=" + addressdatatable
        + ".id \
where calldatatable.id=" + calldatatableId + " LIMIT 1";

    addressdata = executeSql(query);
    // console.log("addressdata:" + addressdata)
    insertIntoLog("debug", "Adressdaten wurden geladen.", "");

    addressdatatableId = addressdata[0].rows[0].columns[0];
// Alle "globalen" kampagnenabh?ngigen Daten setzen

    var kunden_nr = filterSqlResult(addressdata[0].rows[0].columns[1]);
    var vorname = filterSqlResult(addressdata[0].rows[0].columns[2]);
    var nachname = filterSqlResult(addressdata[0].rows[0].columns[3]);
    var geb_datum = filterSqlResult(addressdata[0].rows[0].columns[4]);
    var email = filterSqlResult(addressdata[0].rows[0].columns[5]);
    var tel_mobile_vorwahl = filterSqlResult(addressdata[0].rows[0].columns[6]);
    var tel_mobile = filterSqlResult(addressdata[0].rows[0].columns[7]);
    var tel_home_vorwahl = filterSqlResult(addressdata[0].rows[0].columns[8]);
    var tel_home = filterSqlResult(addressdata[0].rows[0].columns[9]);
    var strasse = filterSqlResult(addressdata[0].rows[0].columns[10]);
    var haus_nr = filterSqlResult(addressdata[0].rows[0].columns[11]);
    var plz = filterSqlResult(addressdata[0].rows[0].columns[12]);
    var ort = filterSqlResult(addressdata[0].rows[0].columns[13]);
    var energie = filterSqlResult(addressdata[0].rows[0].columns[14]);
    var erstell_dat = filterSqlResult(addressdata[0].rows[0].columns[15]);
    var marktgebiet = filterSqlResult(addressdata[0].rows[0].columns[16]);
    var produkt = filterSqlResult(addressdata[0].rows[0].columns[17]);
    var id_nr = filterSqlResult(addressdata[0].rows[0].columns[18]);
    var startdatum = filterSqlResult(addressdata[0].rows[0].columns[19]);
    var grundpreis = filterSqlResult(addressdata[0].rows[0].columns[20]);
    var arbeitspreis = filterSqlResult(addressdata[0].rows[0].columns[21]);
    var produkt_bonus = filterSqlResult(addressdata[0].rows[0].columns[22]);
    var produkt_sofortbonus = filterSqlResult(addressdata[0].rows[0].columns[23]);
    var ads_mail = filterSqlResult(addressdata[0].rows[0].columns[24]);
    var ads_phone = filterSqlResult(addressdata[0].rows[0].columns[25]);
    var ads_post = filterSqlResult(addressdata[0].rows[0].columns[26]);
    var usage = filterSqlResult(addressdata[0].rows[0].columns[27]);
    var end_dat = filterSqlResult(addressdata[0].rows[0].columns[28]);
    var iban = filterSqlResult(addressdata[0].rows[0].columns[29]);
    var bic = filterSqlResult(addressdata[0].rows[0].columns[30]);
    var bank = filterSqlResult(addressdata[0].rows[0].columns[31]);
    var zaehler_nr = filterSqlResult(addressdata[0].rows[0].columns[32]);
    var vertragsnr = filterSqlResult(addressdata[0].rows[0].columns[33]);
    var abschlag = filterSqlResult(addressdata[0].rows[0].columns[34]);

    getCampaignData(campaignId, agentId, addressdatatableId, addressdatatable);
    
    /* Neu ab hier */
    let ns = "";

    ns = ns + getNavigationDiv('Vorname', 'Vorname', vorname);
    ns = ns + getNavigationDiv('Nachname', 'Nachname', nachname);    
    ns = ns + getNavigationDiv('Geb.-Datum', 'Geb.-Datum', geb_datum);
    ns = ns + getNavigationDiv('E-Mail', 'E-Mail', email);

    ns = ns + "<div class='separator'></div>"; // Als Trenner zwischen Gruppen zu nutzen

    ns = ns + getNavigationDiv('Kundennummer', 'Kundennummer', kunden_nr);
    ns = ns + getNavigationDiv('Vertragsnummer', 'Vertragsnummer', vertragsnr);
    ns = ns + getNavigationDiv('Zählernummer', 'Zählernummer', zaehler_nr);

    ns = ns + "<div class='separator'></div>"; // Als Trenner zwischen Gruppen zu nutzen

    //ns = ns + getNavigationDiv('Anrede', 'Anrede', anrede);
    //ns = ns + getNavigationDiv('Titel', 'Titel', titel);
    //ns = ns + getNavigationDiv('Optin Telefon', 'Optin Telefon', ads_phone);
    //ns = ns + getNavigationDiv('Optin E-Mail', 'Optin E-Mail', ads_mail); 
    //ns = ns + getNavigationDiv('Optin Post', 'Optin Post', ads_post);
        
    ns = ns + getNavigationDiv('Festnetz', 'Festnetz', tel_home_vorwahl + "-" + tel_home);
    ns = ns + getNavigationDiv('Mobil', 'Mobil', tel_mobile_vorwahl + "-" + tel_mobile);

    ns = ns + getNavigationDiv('Strasse', 'Strasse', strasse);
    ns = ns + getNavigationDiv('Hausnummer', 'Hausnummer', haus_nr);

    ns = ns + getNavigationDiv('PLZ', 'PLZ', plz);
    ns = ns + getNavigationDiv('Ort', 'Ort', ort);      

    //ns = ns + getNavigationDiv('Z�hler-Nr..', 'Z�hler-Nr.', zaehler_nr);
    ns = ns + getNavigationDiv('Produkt', 'Produkt', produkt);
    //ns = ns + getNavigationDiv('Energie', 'Energie', energie);
    
    ns = ns + getNavigationDiv('Startdatum', 'Startdatum', erstell_dat);
    ns = ns + getNavigationDiv('Lieferbeginn', 'Lieferbeginn', startdatum);
    
    /*
    ns = ns + getNavigationDiv('Ende', 'Ende', end_dat);
    
    ns = ns + getNavigationDiv('Verbrauch', 'Verbrauch', usage);
    ns = ns + getNavigationDiv('Arbeitspreis', 'Arbeitspreis', arbeitspreis);
    ns = ns + getNavigationDiv('Grundpreis', 'Grundpreis', grundpreis);
    
    
    ns = ns + getNavigationDiv('Bonus', 'Bonus', produkt_bonus);
    ns = ns + getNavigationDiv('Sofortbonus', 'Sofortbonus', produkt_sofortbonus); 
    
    ns = ns + getNavigationDiv('Abschlag', 'Abschlag', abschlag);
	*/
    ns = ns + getNavigationDiv('Datensatz', 'Dataset', calldatatableId + ":" + addressdatatableId);
    ns = ns + getNavigationDiv('Gewählte Nr.', 'PhoneNumber', telKontakt);
    
    document.getElementById('customer_info').innerHTML = ns; // Daten müssen in das DIV #customer_info geschrieben werden

   $('datenerfassung_email').value = email;
   $('datenerfassung_telefon').value = msisdn;
    

    //recordingName = kunden_nr + "_[#date]";
    recordingName = vertragsnr + "_" + msisdn + "_[#datetime]";
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
        blnSuccess &= validateSelect($('datenerfassung_ablehnungsgrund').value, 'Ablehnungsgrund',$('datenerfassung_error_ablehnungsgrund'));
        //blnSuccess &= validateSelect($('datenerfassung_optin_detail').value, 'Optin trotz negativ?',$('datenerfassung_error_optin_detail'));
        
    }
    
    if ($('datenerfassung_produkt').value == "ja" ) {
    	blnSuccess &= validateEmail($('datenerfassung_email').value, 'E-Mail', $('datenerfassung_error_email'), true);
        blnSuccess &= validateMSISDN($('datenerfassung_telefon').value, 'Telefonnummer' , $('datenerfassung_error_telefon'), true);
        blnSuccess &= validateSelect($('datenerfassung_lead').value, 'Lead',$('datenerfassung_error_lead'));
        
        if ($('datenerfassung_lead').value == "Strom" || $('datenerfassung_lead').value == "Gas"){
        	blnSuccess &= validateDate($('datenerfassung_vertragsende').value,'Vertragsende',$('datenerfassung_error_vertragsende'),true,2023,2026);
        }
        
        blnSuccess &= validateSelect($('datenerfassung_optin_detail').value, 'Optin',$('datenerfassung_error_optin_detail'));
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





// ############################################################################################## GATEKEEPER #############################################################################################
//  Kurze Beschreibung:
//  Eine der wichtigsten Logiken ist das Öffnen und Schließen von Modalen oder Elementen. Hier soll der Gatekeeper Abhilfe schaffen. 
//  An die Funktion wird entweder ein Array (Aufbau siehe Beispiel) oder die ID des aufrufenden Gatekeeper-Selects übergeben. (siehe Components / Gatekeeper-Select)    
//  Die Funktion liest aus dem Array, welche Aktionen bei welchem Select.value ausgeführt werden sollen. Die verfügbaren Aktionen sind: close, open & openOnly.
//  "open" und "close" toggeln d-none in der Classlist des targets. "openOnly" schließt erst alle Mitglieder der switchGrp (data-grp = "gruppenName") und öffnet dann.
//  Wenn target = "all" genutzt wird, wird ebendfalls an allen Gruppenmitgliedern, die gewählte Aktion ausgeführt.
//  Der Bool für alwaysClose nacht open = openOnly [die Option ist obsolet und wird in Phase 3 ausgetauscht / Platzhalter]
//
//  Beispiel:
//
//  gatekeeper([
//      [thisSelect, switchGrp, alwaysClose],                  <<       string, string, boolean         [HEADER]    = Select = null --> Alle Elemente = d-none | data-grp | onChange Alles = d-none)
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
    let awCl; // alwaysClose bool
    
    if (Array.isArray(actionArr)) { //<<<>>> wenn actionArr = Array[]
        [select, switchGrp, awCl] = [
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
        [select, switchGrp, awCl] = [//     welches alle Anweisungen für die Zustände des jeweilige Select enthält.
            actionArr,
            document.querySelectorAll(`[data-grp=${actionArr.getAttribute("data-trigger")}]`),
            actionArr.getAttribute("data-awCl") === "true"
        ];
    }   

    gateArr.forEach(operation => {  // <<<>>> Aufträge durchsuchen
        let [value, action, target] = operation; 
        if (value === select.value) { 
            try {                   // <<<>>> Auftrag für aktuelle Select.value ausführen
                if (action === 'openOnly' || awCl) {  // wenn openOnly oder alwaysClose --> Gruppe = d-none
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

            }catch (error) { //  Error Nachrichten
                debug && console.log(`>>Fehler<< gatekeeper von "${select.id}" wurde fehlerhaft ausgeführt! \n Error: ${error.message}`);
            };
        };
    });
}
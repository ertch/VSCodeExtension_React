/* Es folgen alle kampagnenspezifischen globalen Variablen */

var currentTab = "tab_start";
var calldatatableId;
var addressdatatableId;
var agentId;

// Diese Variablen muessen abhaengig von der Kampagne geaendert werden
var campaignId = 582;
var addressdatatable = 'mcd_pr2_addressdata';
var salesdatatable = 'mcd_pr2_salesdata';
var rabatttable = 'mcd_prv_rabatt';
var texttabelle = 'mcd_texte';


var resultIdPositiv = 7492;
var resultIdNegativ = 7493;
var resultIdWv = 7494;

var resultIdAbfax = 7496;

var resultIdApne0h = 7497;
var resultIdApne1h = 7498;
var resultIdApne2h = 7499;
var resultIdApne3h = 7500;
var resultIdApne4h = 7501;
var resultIdApne5h = 7502;
var resultIdApne6h = 7503;
var resultIdApne8h = 7504;
var resultIdApne20h = 7505;

var fieldname_firstname = "vorname_kunde";
var fieldname_lastname = "nachname_kunde";
var blnPersonalAppointment = 1;
var hasBank = false;
var hasGebdat = false;
var listenpreisHandy;
var gutschrift = '0';
var callResultId = 0;
var optin_anlieferung = '';
var aktuelles_netz = "";
var iban;
var ibanAlt = "";
var ibanAltOK;
var ibanNeu;
var ibanNeuOK;

var zielprodukt = '';

// Tagesziel an Abschluessen
var dailyToGo = 150;

//var recordingPrefix= "\\\\192.168.11.230\\Voicefiles_Phoenix\\VF_MobilcomDebitel\\mcd_pr2\\";
var recordingPrefix = "\\\\192.168.11.14\\Voicefiles_Phoenix\\VF_MobilcomDebitel\\mcd_pr2\\";

var recordingName;
var recordingNameSuffix = "";
var recordingComplete = 0;
var debugvoicerecording = 2;

var debug = true; // Wenn true, dann wird der SQL-Fakeconnector zu Nestor genommen

var logLevel = "debug"; // kann debug, info, warning, error, fatal sein
var ttWeb = new Object();




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
 * Initfunktion, die bei Aufruf der Maske alle noetigen Daten aus der DB zieht
 * und die globalen Variablen setzt
 */
 
 function gf_javaf_initialize(){
	
	if (!debug){

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
	}
	



	}
 
function gf_initialize() {

	if (!debug) {
		ttWeb.setRecordingState(0);
	} else {
		debugvoicerecording = 0;
	}

	ziel = "select tagesziel from livestat_settings where campaign_id = '" + campaignId + "'";
	dailyToGo = executeSql(ziel);


	// document.execCommand("BackgroundImageCache",false,true);

	blnFinishPositive = false;

	if (!debug) {
		direction = 1;
		//direction = ttWeb.getCallDirection();
		// DIES IST NEU
		calldatatableId = ttWeb.getCalltableField('CUSTOMERID');
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

		calldatatableId = 80693478;
		msisdn = "01768655885";
		telKontakt = "0190123123";
		agentId = "2008";
	}

	insertIntoLog("info", "Datensatz wurde Tel. " + telKontakt + " angerufen (Msisdn: " + msisdn + ")", "");


	var query = "SELECT result_id FROM calldatatable where id=" + calldatatableId + " LIMIT 1";
	resultat = executeSql(query);

	/*
	if (!debug && resultat[0].rows.length > 0)
		callResultId = resultat[0].rows[0].fields.result_id;
	*/

	if (resultat[0].rows.length > 0)
		callResultId = resultat[0].rows[0].fields.result_id;

	if (!debug) {
		if ((callResultId == resultIdPositiv)) {
			insertIntoLog(
				"fatal",
				"Es wurde ein bereits positiver Datensatz erneut angerufen. Call wurde automatisch von der Maske termininiert.",
				"");
			ttWeb.clearRecording();
			alert("Kunde wurde schon positiv abgeschlossen!\n Achtung!\n Bei OK-Klicken wird aufgelegt!!");
			ttWeb.terminateCall(100);
		}
		if ((callResultId == resultIdNegativ)) {
			insertIntoLog(
				"fatal",
				"Es wurde ein bereits negativer Datensatz erneut angerufen. Call wurde automatisch von der Maske termininiert.",
				"");
			ttWeb.clearRecording();
			alert("Kunde wurde schon negativ abgeschlossen!\n Achtung!\n Bei OK-Klicken wird aufgelegt!!");
			ttWeb.terminateCall(200);
		}
	}

	// Aufgrund des Flackerns wurde das Draggen der Popupdivs erstmal disabled:
	// new Draggable($('negativ'), {});
	// new Draggable($('wiedervorlage'), {});
	// new Draggable($('apne'), {});


	query = "SELECT "
		+ addressdatatable
		+ ".id as addressdataid, \
      trim(if(isnull(anrede_kunde),'-',if(anrede_kunde = '','-',anrede_kunde))), \
trim(if(isnull(vorname_kunde),'-',if(vorname_kunde = '','',vorname_kunde))), \
trim(if(isnull(nachname_kunde),'-',if(nachname_kunde = '','',nachname_kunde))), \
trim(if(isnull(strasse_kunde),'-',if(strasse_kunde = '','',strasse_kunde))), \
trim(if(isnull(strasse_zusatz_kunde),'-',if(strasse_zusatz_kunde = '','',strasse_zusatz_kunde))), \
trim(if(isnull(plz_kunde),'-',if(plz_kunde = '','',plz_kunde))), \
trim(if(isnull(wohnort_kunde),'-',if(wohnort_kunde = '','',wohnort_kunde))), \
DATE_FORMAT(geburtstag_kunde, '%d.%m.%Y'), \
trim(if(isnull(kunden_nummer),'-',if(kunden_nummer = '','',kunden_nummer))), \
trim(if(isnull(vertrags_nummer),'-',if(vertrags_nummer = '','',vertrags_nummer))), \
trim(if(isnull(tarif_text_aktuell),'-',if(tarif_text_aktuell = '','',tarif_text_aktuell))), \
trim(if(isnull(handy_modell_netz),'-',if(handy_modell_netz = '','',handy_modell_netz))), \
DATE_FORMAT(aktivierungsdatum, '%d.%m.%Y'), \
DATE_FORMAT(beginn_mindestlaufzeit, '%d.%m.%Y'), \
DATE_FORMAT(voraussichtliches_vertragsendedatum, '%d.%m.%Y'), \
trim(if(isnull(optin_anlieferung),'-',if(optin_anlieferung = '','-',optin_anlieferung))), \
trim(if(isnull(markengruppe_kuerzel),'-',if(markengruppe_kuerzel = '','-',markengruppe_kuerzel))), \
trim(if(isnull(email_privat_kunde),'-',if(email_privat_kunde = '','-',email_privat_kunde))), \
trim(if(isnull(netz_id_aktuell),'-',if(netz_id_aktuell = '','-',netz_id_aktuell))), \
trim(if(isnull(telefonnummer),'-',if(telefonnummer = '','-',telefonnummer))), \
trim(if(isnull(bitz_id),'-',if(bitz_id = '','-',bitz_id))), \
trim(if(isnull(monatspreis_tarif),'-',if(monatspreis_tarif = '','-',monatspreis_tarif))), \
trim(if(isnull(mindestumsatz),'-',if(mindestumsatz = '','-',mindestumsatz))), \
trim(if(isnull(handyoption),'-',if(handyoption = '','-',handyoption))), \
trim(if(isnull(laufzeitrabatt),'-',if(laufzeitrabatt = '','-',laufzeitrabatt))), \
trim(if(isnull(effektivpreis),'-',if(effektivpreis = '','-',effektivpreis))), \
trim(if(isnull(gruppe_reco),'-',if(gruppe_reco = '','-',gruppe_reco))), \
trim(if(isnull(iban),'-',if(iban = '','-',iban))) \
  FROM "
		+ addressdatatable + " \
join calldatatable on calldatatable.addressdata_id=" + addressdatatable
		+ ".id \
where calldatatable.id=" + calldatatableId + " LIMIT 1";

	addressdata = executeSql(query);
	document.getElementById('customer_info').innerHTML = query;

	addressdatatableId = addressdata[0].rows[0].columns[0];

	// Alle "globalen" kampagnenabhaengigen Daten setzen
	getCampaignData(campaignId, agentId, addressdatatableId, addressdatatable);

	dataset = calldatatableId + ":" + addressdatatableId;

	anrede = filterSqlResult(addressdata[0].rows[0].columns[1]);
	vorname = filterSqlResult(addressdata[0].rows[0].columns[2]);
	nachname = filterSqlResult(addressdata[0].rows[0].columns[3]);
	strasse = filterSqlResult(addressdata[0].rows[0].columns[4]);
	strasse_zs = filterSqlResult(addressdata[0].rows[0].columns[5]);
	plz = filterSqlResult(addressdata[0].rows[0].columns[6]);
	ort = filterSqlResult(addressdata[0].rows[0].columns[7]);
	geburtsdatum = filterSqlResult(addressdata[0].rows[0].columns[8]);
	kundennummer = filterSqlResult(addressdata[0].rows[0].columns[9]);
	vertragsnummer = filterSqlResult(addressdata[0].rows[0].columns[10]);
	tarif = filterSqlResult(addressdata[0].rows[0].columns[11]);
	handymodell = filterSqlResult(addressdata[0].rows[0].columns[12]);
	anschaltung = filterSqlResult(addressdata[0].rows[0].columns[13]);
	beginn_laufzeit = filterSqlResult(addressdata[0].rows[0].columns[14]);
	ende_laufzeit = filterSqlResult(addressdata[0].rows[0].columns[15]);
	optin_anlieferung = filterSqlResult(addressdata[0].rows[0].columns[16]);
	markengruppe = filterSqlResult(addressdata[0].rows[0].columns[17]);
	mail = filterSqlResult(addressdata[0].rows[0].columns[18]);
	netz_id_aktuell = filterSqlResult(addressdata[0].rows[0].columns[19]);
	telefonnummer = filterSqlResult(addressdata[0].rows[0].columns[20]);
	bitz_id = filterSqlResult(addressdata[0].rows[0].columns[21]);
	monatspreis_tarif = filterSqlResult(addressdata[0].rows[0].columns[22]);
	mindestumsatz = filterSqlResult(addressdata[0].rows[0].columns[23]);
	handyoption = filterSqlResult(addressdata[0].rows[0].columns[24]);
	laufzeitrabatt = filterSqlResult(addressdata[0].rows[0].columns[25]);
	alter_effektivpreis = filterSqlResult(addressdata[0].rows[0].columns[26]);
	gruppe = filterSqlResult(addressdata[0].rows[0].columns[27]);
	iban = filterSqlResult(addressdata[0].rows[0].columns[28]);

	var herkunft;
	if (bitz_id == 1042159 || bitz_id == 1041825 || bitz_id == 1041541 || bitz_id == 1040797 || bitz_id == 1040198) {
		herkunft = "Kuendigungsbest.";
	} else {
		herkunft = "";
	}

	if (netz_id_aktuell == 1) {
		aktuelles_netz = "Telekom";
	} else if (netz_id_aktuell == 2) {
		aktuelles_netz = "Vodafone";
	} else if (netz_id_aktuell == 13) {
		aktuelles_netz = "Telefonica";
	}

	showRabatt();
	checkIBANhsp();
	fillBegruessung();
	fillVerabschiedung();
	showHandyHersteller();


	//getTarifKampagnenAngebot(tarif);

	recordingName = "_MSISDN=" + msisdn + "_VTNR=" + vertragsnummer + "_HDL=28011151_HNA=SKH" + "_DATE=[#datetime]";

	var ns = "";
	// ns = ns + "<div class='separator'> <div class='line dataSingleLine'>";    

	// ns = ns + "</div><div class='separator'> <div class='line'>";

	ns = ns + getNavigationDiv('Gruppe', 'Gruppe', gruppe);

	ns = ns + getNavigationDiv('Anrede', 'Anrede', anrede);
	ns = ns + getNavigationDiv('Vorname', 'Vorname', vorname);
	ns = ns + getNavigationDiv('Nachname', 'Nachname', nachname);

	ns = ns + getNavigationDiv('Strasse', 'Strasse', strasse);
	ns = ns + getNavigationDiv('Strasse Zusatz', 'Strasse Zusatz', strasse_zs);

	ns = ns + getNavigationDiv('PLZ', 'PLZ', plz);
	ns = ns + getNavigationDiv('Ort', 'Ort', ort);

	ns = ns + getNavigationDiv('Geb.-Datum', 'Geb.-Datum', dateConversion(geburtsdatum));

	ns = ns + getNavigationDiv('E-Mail', 'E-Mail', mail);

	// Hier wird die Trennline eingefügt
	ns = ns + '<div class="data-kunde-m--seperator"></div><div class="data-kunde-m--seperator"></div>';

	ns = ns + getNavigationDiv('Kundennummer', 'Kundennummer', kundennummer);
	ns = ns + getNavigationDiv('Vertragsnummer', 'Vertragsnummer', vertragsnummer);
	ns = ns + getNavigationDiv('Anschaltung', 'Anschaltung', dateConversion(anschaltung));
	ns = ns + getNavigationDiv('Beginn Laufz.', 'Beginn Laufz.', dateConversion(beginn_laufzeit));
	ns = ns + getNavigationDiv('Ende Laufz.', 'Ende Laufz.', dateConversion(ende_laufzeit));

	ns = ns + getNavigationDiv('Tarif', 'Tarif', tarif);
	ns = ns + getNavigationDiv('Aktuelles Netz', 'Aktuelles Netz', aktuelles_netz);

	ns = ns + getNavigationDiv('Monatspreis Tarif', 'Monatspreis Tarif', monatspreis_tarif);
	ns = ns + getNavigationDiv('Mindestumsatz', 'Mindestumsatz', mindestumsatz);
	ns = ns + getNavigationDiv('Handyoption', 'Handyoption', handyoption);
	ns = ns + getNavigationDiv('Laufzeitrabatt', 'Laufzeitrabatt', laufzeitrabatt);
	ns = ns + getNavigationDiv('IST-Effektivpreis', 'IST-Effektivpreis', alter_effektivpreis);

	ns = ns + getNavigationDiv('Handymodell', 'Handymodell', handymodell);
	ns = ns + getNavigationDiv('Optin', 'Optin', optin_anlieferung);

	// ns = ns + "<div class='separator'> <div class='line'>";

	ns = ns + getNavigationDiv('Mobil', 'Mobil', telefonnummer);

	// ns = ns + "<div class='separator'> <div class='line'>";

	ns = ns + getNavigationDiv('Durchschnitt vergebene Gutschrift', 'Durchschnitt vergebener Gutschrift', gutschrift);
	ns = ns + getNavigationDivGreen('Herkunft', 'Herkunft', herkunft);

	// ns = ns + "<div class='separator'> <div class='line'>";

	ns = ns + getNavigationDiv('Datensatz', 'Dataset', calldatatableId + ":" + addressdatatableId);
	ns = ns + getNavigationDiv('Gew&auml;hlte&nbsp;Nr.', 'PhoneNumber', telKontakt);
	// ns = ns + "</div> </div> ";

	document.getElementById('customer_info').innerHTML = ns;
	$('datenerfassung_tarif_1_rufnummer').value = telefonnummer;


}

/*
 * Diese FUnktion wird von switchTab (outbound.js) bei jedem Tabwechsel
 * aufgerufen. Hier wird je nach Seitenwechsel der Validator fuer die aktuelle
 * Seite angeschmissen. Liefert der Validator false, so kann das Tab nicht
 * verlassen werden
 */
function validateTab(name) {

	switch (name) {

		case "tab_start":
			return true;
		case "tab_vertrag_1":
			return validateDatenerfassung(1);
		//return true;
		case "tab_vertrag_2":
			return validateDatenerfassung(2);
		//return true;
		case "tab_vertrag_3":
			return validateDatenerfassung(3);
		//return true;
		case "tab_vertrag_4":
			return validateDatenerfassung(4);
		//return true;
		case "tab_vertrag_5":
			return validateDatenerfassung(5);
		//return true;
		case "tab_vertrag_6":
			return validateDatenerfassung(6);
		//return true;
		case "tab_zusammenfassung":
			return true;
	}

	return false;
}



/* Validator fuer die Datenerfassung (Seite1) */
function validateDatenerfassung(vertragsid) {

	var blnSuccess = true;

	var i = vertragsid;
	var productTab = document.getElementById('datenerfassung_produkt_' + i);
	blnSuccess &= validateSelect(productTab.value, 'Vertrag', $('datenerfassung_error_produkt_' + i));

	if (productTab.value == "0") {
		var productCancel = document.getElementById('datenerfassung_ablehnungsgrund');
		blnSuccess &= validateSelect(productCancel.value, 'Ablehnungsgrund', $('datenerfassung_error_ablehnungsgrund'));
	}
	console.log(productTab.value);
	if (productTab.value == "0") {
		/*
		 * 
		 * Platzhalter, hier wird aktuell nichts validiert.
		 * 
		 */
	} else {

		var productPhoneNr = document.getElementById('datenerfassung_tarif_' + i + '_rufnummer');
		blnSuccess &= validateMSISDN(productPhoneNr.value, 'Rufnummer Tarif', $('datenerfassung_error_tarif_' + i + '_rufnummer'), true);

		if (productTab.value == "1" || productTab.value == "2") {
			var productHandy = document.getElementById('datenerfassung_handy_' + i);
			var productHandyCompany = document.getElementById('datenerfassung_handy_hersteller_' + i);
			var productHandyModell = document.getElementById('datenerfassung_handy_modell_' + i);
			blnSuccess &= validateSelect(productHandy.value, 'Hardware', $('datenerfassung_error_handy_' + i + ''));

			if (productHandy.value == "ja" || productHandy.value == "smieten") {

				blnSuccess &= validateSelect(productHandyCompany.value, 'Hersteller', $('datenerfassung_error_handy_hersteller_' + i + ''));
				blnSuccess &= validateSelect(productHandyModell.value, 'Modell', $('datenerfassung_error_handy_modell_' + i + ''));

			}

		}
		
		var productDiscount = document.getElementById('datenerfassung_gutschrift_tarif_' + i);
		var productNotice = document.getElementById('datenerfassung_freitext_tarif_' + i);
		var productExtra = document.getElementById('datenerfassung_zusatzprodukt_hsp_tarif_' + i);
		blnSuccess &= validateInteger(productDiscount.value, 'Gutschrift', $('datenerfassung_error_gutschrift_tarif_' + i + ''), true, 0, 300);
		blnSuccess &= validateString(productNotice.value, 'Freitext', $('datenerfassung_error_freitext_tarif_' + i + ''), false, 2000);
		blnSuccess &= validateSelect(productExtra.value, 'HSP', $('datenerfassung_error_zusatzprodukt_hsp_tarif_' + i + ''));

		if (productExtra.value == "EP") {

			var productHandyCompanyHSP = document.getElementById('datenerfassung_hsp_handyhersteller_' + i);
			var productHandyModellHSP = document.getElementById('datenerfassung_hsp_handymodell_' + i);
			var productTypHSP = document.getElementById('datenerfassung_hsp_typ_' + i);
			var productProtectHSP = document.getElementById('datenerfassung_hsp_diebstahlschutz_' + i);
			blnSuccess &= validateSelect(productHandyCompanyHSP.value, 'Handyhersteller', $('datenerfassung_error_hsp_handyhersteller_' + i + ''));
			blnSuccess &= validateSelect(productHandyModellHSP.value, 'Handymodell', $('datenerfassung_error_hsp_handymodell_' + i + ''));
			blnSuccess &= validateSelect(productTypHSP.value, 'HSP Variante', $('datenerfassung_error_hsp_typ_' + i + ''));
			blnSuccess &= validateSelect(productProtectHSP.value, 'Plus-Option', $('datenerfassung_error_hsp_diebstahlschutz_' + i + ''));
		
			var product1Extra = document.getElementById('datenerfassung_zusatzprodukt_hsp_tarif_1');
			if (product1Extra.value == "EP") {

				var productCustomerStr = document.getElementById('datenerfassung_strasse_1');
				var productCustomerHouseNr = document.getElementById('datenerfassung_hausnummer_1');
				blnSuccess &= validateString(productCustomerStr.value, 'Strasse', $('datenerfassung_error_strasse_1'), true, 200);
				blnSuccess &= validateString(productCustomerHouseNr.value, 'Hausnummer', $('datenerfassung_error_hausnummer_1'), true, 20);

				if (!ibanAltOK) {

					//checkIBANhsp();
					var productCustomerIBAN = document.getElementById('datenerfassung_hsp_iban_1');
					var productCustomerBIC = document.getElementById('datenerfassung_hsp_bic_1');
					blnSuccess &= validateIBAN(productCustomerIBAN.value, 'IBAN', $('datenerfassung_error_hsp_iban_1'), true);
					blnSuccess &= validateString(productCustomerBIC.value, 'BIC', $('datenerfassung_error_hsp_bic_1'), true, 11);
				}

			}

		}

		var productSMS = document.getElementById('datenerfassung_tarif_' + i + '_sms');
		var productNextTab = document.getElementById('datenerfassung_produkt_anzahl_tarif_' + i);
		// blnSuccess &= validateSelect($('datenerfassung_zusatzprodukt_norton_tarif_' + i + '').value, 'Norton', $('datenerfassung_error_zusatzprodukt_norton_tarif_' + i + ''));
		blnSuccess &= validateSelect(productSMS.value, 'SMS Link', $('datenerfassung_error_tarif_' + i + '_sms'));
		blnSuccess &= validateSelect(productNextTab.value, 'Weiterer Vertrag?', $('datenerfassung_error_produkt_anzahl_tarif_' + i + ''));
	}
	return blnSuccess;
}

function validateZusammenfassung() {

	var blnSuccess = true;

	if ($('datenerfassung_produkt_1').value > "0") {

		if (optin_anlieferung != '') {
			blnSuccess &= validateSelect($('datenerfassung_optin').value, 'Optin', $('datenerfassung_error_optin'));
		}

		/*
		blnSuccess &= validateSelect($('datenerfassung_optin').value, 'Optin', $('datenerfassung_error_optin'));
		blnSuccess &= validateSelect($('datenerfassung_zusatzprodukt_audioteka').value, 'Audioteka', $('datenerfassung_error_zusatzprodukt_audioteka'));
		blnSuccess &= validateSelect($('datenerfassung_zusatzprodukt_kaspersky').value, 'Kaspersky', $('datenerfassung_error_zusatzprodukt_kaspersky'));
		blnSuccess &= validateSelect($('datenerfassung_zusatzprodukt_savetv').value, 'Save TV', $('datenerfassung_error_zusatzprodukt_savetv'));
		blnSuccess &= validateSelect($('datenerfassung_zusatzprodukt_netflix').value, 'Netflix', $('datenerfassung_error_zusatzprodukt_netflix'));
		
		blnSuccess &= validateSelect($('datenerfassung_zusatzprodukt_hsp').value, 'HSP', $('datenerfassung_error_zusatzprodukt_hsp'));
		
		
		if($('datenerfassung_zusatzprodukt_hsp').value == "EP"){
			
			blnSuccess &= validateSelect($('datenerfassung_hsp_handyhersteller').value, 'Handyhersteller', $('datenerfassung_error_hsp_handyhersteller'));
			blnSuccess &= validateSelect($('datenerfassung_hsp_handymodell').value, 'Handymodell', $('datenerfassung_error_hsp_handymodell'));
			blnSuccess &= validateSelect($('datenerfassung_hsp_typ').value, 'Typ', $('datenerfassung_error_hsp_typ'));
			blnSuccess &= validateSelect($('datenerfassung_hsp_diebstahlschutz').value, 'Plus-Option', $('datenerfassung_error_hsp_diebstahlschutz'));
			blnSuccess &= validateString($('datenerfassung_strasse').value, 'Strasse' , $('datenerfassung_error_strasse'), true, 200);			
			blnSuccess &= validateString($('datenerfassung_hausnummer').value, 'Hausnummer' , $('datenerfassung_error_hausnummer'), true, 20);
			
			 if(!ibanAltOK){
				 
				 checkIBANhsp();
				 
				 blnSuccess&=validateIBAN($('datenerfassung_hsp_iban').value,'IBAN',$('datenerfassung_error_hsp_iban'),true);
				 
				 
				 
				}
			
		}
		*/

	} else {

		if (optin_anlieferung != '') {
			blnSuccess &= validateSelect($('datenerfassung_optin').value, 'Optin', $('datenerfassung_error_optin'));
		}

	}

	return blnSuccess;

}

function showmail() {

	if ($('datenerfassung_onlinerechnung').value == "ja") {
		document.getElementById('produkt_email').style.display = "block";
		$('datenerfassung_produkt_email').value = mail;
	} else {
		document.getElementById('produkt_email').style.display = "none";
		$('datenerfassung_produkt_email').value = "";
	}
	return true;

}

function showprodukt(productselect) { //überarbeitet von Erik

	recordOn();

	let product = document.getElementById(productselect).value;
	let productNr = productselect.replace("datenerfassung_produkt_", "");
	let open_datatab = document.getElementById("datenerfassung_tarife_tab_" + productNr);
	let use_hardware = document.getElementById('datenerfassung_tarif_' + productNr + '_hardware');
	let cls = use_hardware.className.replace(" d-none" , "");
	
	if (optin_anlieferung != '') {
		document.getElementById('optin').className = "input_form oneColumn";
	} else {
		document.getElementById('optin').className = "input_form oneColumn d-none";
	};

	if (product == "0") {
		document.getElementById('datenerfassung_ablehnung').className = "";
		document.getElementById('tab_next_zusammenfassung_1').className = "left_right";
	} else {
		document.getElementById('datenerfassung_ablehnung').className = "d-none";
		document.getElementById('tab_next_zusammenfassung_1').className = "left_right d-none";
	};
	console.log(product);
	switch (product) {
		case "0":
			open_datatab.className = "input_form oneColumn d-none";
			use_hardware.className = cls + " d-none";
			console.log("case 0")
			break;
		case "1":
			open_datatab.className = "input_form oneColumn";
			use_hardware.className = cls;
			
			break;
		case "2":
			open_datatab.className = "input_form oneColumn";
			use_hardware.className = cls;
			
			break;
		case "3":
			open_datatab.className = "input_form oneColumn";
			use_hardware.className = cls + " d-none";
			break;
		case "4":
			open_datatab.className = "input_form oneColumn";
			use_hardware.className = cls + " d-none";
			break;
		default:
			open_datatab.className = "input_form oneColumn d-none";
			console.log("case default")
			break;
	} 		
	
	fillVerabschiedung();
	return true;
}

function showVertraege() {

	showprodukt();

	var i;
	for (i = 1; i <= 6; i++) {

		if ($('datenerfassung_produkt_anzahl_tarif_' + i + '').value == "ja") {
			document.getElementById('tab_next_zusammenfassung_' + i + '').style.display = "none";
			document.getElementById('tab_next_tarif_' + i + '').style.display = "block";

		} else if ($('datenerfassung_produkt_anzahl_tarif_' + i + '').value == "nein") {
			document.getElementById('tab_next_zusammenfassung_' + i + '').style.display = "block";
			document.getElementById('tab_next_tarif_' + i + '').style.display = "none";

		} else {
			document.getElementById('tab_next_zusammenfassung_' + i + '').style.display = "none";
			document.getElementById('tab_next_tarif_' + i + '').style.display = "none";

		}

	}

	return true;

}

function lockVertraege() {

	if ($('datenerfassung_produkt_anzahl_tarif_1').value == "nein" || $('datenerfassung_produkt_anzahl_tarif_1').value == "") {

		document.getElementById('datenerfassung_produkt_2').disabled = true;
		document.getElementById('datenerfassung_produkt_3').disabled = true;
		document.getElementById('datenerfassung_produkt_4').disabled = true;
		document.getElementById('datenerfassung_produkt_5').disabled = true;
		document.getElementById('datenerfassung_produkt_6').disabled = true;

	} else if ($('datenerfassung_produkt_anzahl_tarif_1').value == "ja") {

		document.getElementById('datenerfassung_produkt_2').disabled = false;
		document.getElementById('datenerfassung_produkt_3').disabled = false;
		document.getElementById('datenerfassung_produkt_4').disabled = false;
		document.getElementById('datenerfassung_produkt_5').disabled = false;
		document.getElementById('datenerfassung_produkt_6').disabled = false;

	}

	if ($('datenerfassung_produkt_anzahl_tarif_2').value == "nein" || $('datenerfassung_produkt_anzahl_tarif_2').value == "") {

		document.getElementById('datenerfassung_produkt_3').disabled = true;
		document.getElementById('datenerfassung_produkt_4').disabled = true;
		document.getElementById('datenerfassung_produkt_5').disabled = true;
		document.getElementById('datenerfassung_produkt_6').disabled = true;

	} else if ($('datenerfassung_produkt_anzahl_tarif_2').value == "ja") {

		document.getElementById('datenerfassung_produkt_3').disabled = false;
		document.getElementById('datenerfassung_produkt_4').disabled = false;
		document.getElementById('datenerfassung_produkt_5').disabled = false;
		document.getElementById('datenerfassung_produkt_6').disabled = false;

	}

	if ($('datenerfassung_produkt_anzahl_tarif_3').value == "nein" || $('datenerfassung_produkt_anzahl_tarif_3').value == "") {

		document.getElementById('datenerfassung_produkt_4').disabled = true;
		document.getElementById('datenerfassung_produkt_5').disabled = true;
		document.getElementById('datenerfassung_produkt_6').disabled = true;

	} else if ($('datenerfassung_produkt_anzahl_tarif_3').value == "ja") {

		document.getElementById('datenerfassung_produkt_4').disabled = false;
		document.getElementById('datenerfassung_produkt_5').disabled = false;
		document.getElementById('datenerfassung_produkt_6').disabled = false;

	}

	if ($('datenerfassung_produkt_anzahl_tarif_4').value == "nein" || $('datenerfassung_produkt_anzahl_tarif_4').value == "") {

		document.getElementById('datenerfassung_produkt_5').disabled = true;
		document.getElementById('datenerfassung_produkt_6').disabled = true;

	} else if ($('datenerfassung_produkt_anzahl_tarif_4').value == "ja") {

		document.getElementById('datenerfassung_produkt_5').disabled = false;
		document.getElementById('datenerfassung_produkt_6').disabled = false;

	}

	if ($('datenerfassung_produkt_anzahl_tarif_5').value == "nein" || $('datenerfassung_produkt_anzahl_tarif_5').value == "") {

		document.getElementById('datenerfassung_produkt_6').disabled = true;

	} else if ($('datenerfassung_produkt_anzahl_tarif_5').value == "ja") {

		document.getElementById('datenerfassung_produkt_6').disabled = false;

	}

}



function showzusammenfassung() {

	if (true) {
		if ($('datenerfassung_produkt_1').value != "0") {
			//document.getElementById('abschliessen').style.display = "none";
			//document.getElementById('recording').style.display = "block";
			//document.getElementById('optin').style.display = "block";

		} else {
			document.getElementById('abschliessen').style.display = "block";
			//document.getElementById('recording').style.display = "none";
			//document.getElementById('optin').style.display = "none";
		}
	}
}

function recordOn() {

	if (debugvoicerecording != "3") {

		if ($('datenerfassung_produkt_1').value != "0") {
			document.getElementById('abschliessen').style.display = "none";
			document.getElementById('recording').style.display = "block";
		}

	}

}

function saveData() {

	var j = 0;
	var anzahl_tarife = 0;
	anzahl_tarife = countVertraege();

	for (var i = 1; i <= anzahl_tarife; i++) {

		var handyId = $('datenerfassung_handy_modell_' + i + '').value;
		if (handyId.length <= 1) handyId = 0;

		while (j < 1) {
			if ($('datenerfassung_handy_' + i + '').value == "smieten") {
				handyId = parseInt(1000000) + parseInt(handyId);
				alert(handyId);
			}
			j++;
		}


		var hsptyp = $('datenerfassung_hsp_typ_' + i + '').value;

		if ($('datenerfassung_hsp_diebstahlschutz_' + i + '').value == 'ja') {

			if (hsptyp == '3457465') {

				hsptyp = '3457466';

			} else if (hsptyp == '3457495') {

				hsptyp = '3457496';

			} else if (hsptyp == '3457475') {

				hsptyp = '3457476';

			} else if (hsptyp == '3457487') {

				hsptyp = '3457488';

			} else if (hsptyp == '3457528') {

				hsptyp = '3457529';

			}

		}


		insert = "replace into "
			+ salesdatatable
			+ " (addressdata_id, calldatatable_id, hardware_hersteller, hardware_modell, freitext, optin,"
			+ " huckepack_produkt, huckepack_produkt_norton, huckepack_produkt_hsp, huckepack_hsp_handyhersteller,"
			+ " huckepack_hsp_handymodell, huckepack_hsp_typ, huckepack_hsp_diebstahlschutz, tarifnummer, tarif_rufnummer,"
			+ " strasse, hausnummer, vvl_art, sms_link, huckepack_hsp_iban, huckepack_hsp_bic)"
			+ " values ('" + addressdatatableId + "','" + calldatatableId + "','"
			+ $('datenerfassung_handy_hersteller_' + i + '').value + "',"
			+ handyId + ",'"
			+ escapeString($('datenerfassung_freitext_tarif_' + i + '').value) + "','"
			+ $('datenerfassung_optin').value + "','"
			+ "','"
			+ $('datenerfassung_zusatzprodukt_norton_tarif_' + i + '').value + "','"
			+ $('datenerfassung_zusatzprodukt_hsp_tarif_' + i + '').value + "','"
			+ $('datenerfassung_hsp_handyhersteller_' + i + '').value + "','"
			+ $('datenerfassung_hsp_handymodell_' + i + '').value + "','"
			+ hsptyp + "','"
			+ $('datenerfassung_hsp_diebstahlschutz_' + i + '').value + "','"
			+ i + "','"
			+ $('datenerfassung_tarif_' + i + '_rufnummer').value + "','"
			+ $('datenerfassung_strasse_1').value + "','"
			+ $('datenerfassung_hausnummer_1').value + "','"
			+ $('datenerfassung_produkt_' + i + '').value + "','"
			+ $('datenerfassung_tarif_' + i + '_sms').value + "','"
			+ $('datenerfassung_hsp_iban_1').value + "','"
			+ $('datenerfassung_hsp_bic_1').value + "'"
			+ ")";
		updateSql(insert);


		insert2 = "replace into "
			+ rabatttable
			+ " (addressdata_id, calldatatable_id, Agenten_ID, Vergebener_Rabatt, Tarifnummer)"
			+ " values ('" + addressdatatableId + "','" + calldatatableId + "','"
			+ agentId + "','"
			+ $('datenerfassung_gutschrift_tarif_' + i + '').value + "','"
			+ i + "'"
			+ ")";
		updateSql(insert2);


	}


}


function saveRabatt() {

	insert = "insert into "
		+ rabatttable
		+ " (addressdata_id, calldatatable_id, Agenten_ID, Vergebener_Rabatt)"
		+ " values ('" + addressdatatableId + "','" + calldatatableId + "','"
		+ agentId + "','"
		+ $('Rabatt').value + "'"
		+ ")";
	updateSql(insert);

}

function saveNegOptin() {

	if (optin_anlieferung != '') {

		insert = "replace into "
			+ salesdatatable
			+ " (addressdata_id, calldatatable_id, optin)"
			+ " values ('" + addressdatatableId + "','" + calldatatableId + "','"
			+ $('datenerfassung_optin').value + "'"
			+ ")";
		updateSql(insert);
	}
}


/* Schliesst einen Datensatz positiv ab */
function finishPositive() {

	// Logik ob Produkt gekauft wird
	if ($('datenerfassung_produkt_1').value > "0") {

		saveData();
		writeOldResult();

		ergebnis = resultIdPositiv;
		voicefileName = recordingName;

		var optin_code = 'ka';

		if (optin_anlieferung != '') {
			optin_code = $('datenerfassung_optin').value;
		}

		if (optin_code == 'voice') {
			voicefileName = generateVoicefilename(recordingPrefix, recordingName, recordingNameSuffix, "POSITIV", "KA");
			stopVoiceRecording(voicefileName);
		}
		if (optin_code == 'robi') {
			voicefileName = generateVoicefilename(recordingPrefix, recordingName, recordingNameSuffix, "POSITIV", "KA");
			stopVoiceRecording(voicefileName);
		}
		if (optin_code == 'ka') {
			voicefileName = generateVoicefilename(recordingPrefix, recordingName, recordingNameSuffix, "POSITIV", "KA");
			stopVoiceRecording(voicefileName);
		}
		if (optin_code == 'nonvoice') {
			voicefileName = generateVoicefilename(recordingPrefix, recordingName, recordingNameSuffix, "POSITIV", "KA");
			stopVoiceRecording(voicefileName);
		}
		if (optin_code == 'kubi') {
			voicefileName = generateVoicefilename(recordingPrefix, recordingName, recordingNameSuffix, "POSITIV", "KA");
			stopVoiceRecording(voicefileName);
		}

		updateSql("UPDATE calldatatable SET result_id = '" + resultIdPositiv + "', calldate = now(), agent_id = '"
			+ agentId + "' WHERE id = '" + calldatatableId + "' and campaign_id = '" + campaignId + "' LIMIT 1;");


		if (!debug) {
			ttWeb.saveRecording(voicefileName);
			terminate = 100;

		} else {
			alert("saveRecording: " + voicefileName);
			terminate = 100;

		}

	} else {

		saveNegOptin();

		var query = "update " + addressdatatable + " set " +
			"cancellation_reason_id = '" + escapeString($('datenerfassung_ablehnungsgrund').value) + "' where id = " + addressdatatableId;

		updateSql(query);


		updateSql("UPDATE calldatatable SET result_id = '" + resultIdNegativ + "', calldate = now(), agent_id = '"
			+ agentId + "' where id = '" + calldatatableId + "' and campaign_id = '" + campaignId + "' limit 1;");

		terminate = 200;

		if (!debug) {
			ttWeb.clearRecording();

		} else {
			alert("Aufzeichnung verworfen.")

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
function fillTarife() {

	if ($('datenerfassung_produkt_1').value != "0") {

		var query = "select id, tarifname from mcd_krg_tarife where aktiv_telekom = '1' order by tarifname";
		var result = executeSql(query);
		var tarife = new Object();
		for (var i = 0; i < result[0].rows.length; i++) {
			tarife[result[0].rows[i].fields.id] = result[0].rows[i].fields.tarifname;
		}

		//selectboxSetOptions(document.getElementById('datenerfassung_tarif_1_telekom'),tarife,"",true,result[0].rows.length);
		//selectboxSetOptions(document.getElementById('datenerfassung_tarif_2_telekom'),tarife,"",true,result[0].rows.length);
		//selectboxSetOptions(document.getElementById('datenerfassung_tarif_3_telekom'),tarife,"",true,result[0].rows.length);
		//selectboxSetOptions(document.getElementById('datenerfassung_tarif_4_telekom'),tarife,"",true,result[0].rows.length);

		var query = "select id, tarifname from mcd_krg_tarife where aktiv_vodafone = '1' order by tarifname";
		var result = executeSql(query);
		var tarife = new Object();
		for (var i = 0; i < result[0].rows.length; i++) {
			tarife[result[0].rows[i].fields.id] = result[0].rows[i].fields.tarifname;
		}

		//selectboxSetOptions(document.getElementById('datenerfassung_tarif_1_vodafone'),tarife,"",true,result[0].rows.length);
		//selectboxSetOptions(document.getElementById('datenerfassung_tarif_2_vodafone'),tarife,"",true,result[0].rows.length);
		//selectboxSetOptions(document.getElementById('datenerfassung_tarif_3_vodafone'),tarife,"",true,result[0].rows.length);
		//selectboxSetOptions(document.getElementById('datenerfassung_tarif_4_vodafone'),tarife,"",true,result[0].rows.length);

		var query = "select id, tarifname from mcd_krg_tarife where aktiv_telefonica = '1' order by tarifname";
		var result = executeSql(query);
		var tarife = new Object();
		for (var i = 0; i < result[0].rows.length; i++) {
			tarife[result[0].rows[i].fields.id] = result[0].rows[i].fields.tarifname;
		}

		//selectboxSetOptions(document.getElementById('datenerfassung_tarif_1_telefonica'),tarife,"",true,result[0].rows.length);       
		//selectboxSetOptions(document.getElementById('datenerfassung_tarif_2_telefonica'),tarife,"",true,result[0].rows.length);
		//selectboxSetOptions(document.getElementById('datenerfassung_tarif_3_telefonica'),tarife,"",true,result[0].rows.length);
		//selectboxSetOptions(document.getElementById('datenerfassung_tarif_4_telefonica'),tarife,"",true,result[0].rows.length);

		//document.getElementById('datenerfassung_tarif_1').style.display = "block";
		//document.getElementById('datenerfassung_tarif_2').style.display = "block";
		//document.getElementById('datenerfassung_tarif_3').style.display = "block";
		//document.getElementById('datenerfassung_tarif_4').style.display = "block";

	} else {
		//document.getElementById('datenerfassung_tarif_1').style.display = "none";
		//document.getElementById('datenerfassung_tarif_2').style.display = "none";
		//document.getElementById('datenerfassung_tarif_3').style.display = "none";
		//document.getElementById('datenerfassung_tarif_4').style.display = "none";

	}

	showHandyHersteller();
	showHandyHerstellerHSP();
}


function getTarifKampagnenAngebot(quelltarif) {

	var query = "SELECT anbieter, tarifname, tarifart, grundpreis, laufzeitrabatt, handyoption, effektivpreis from mcd_krg_tarife where effektivpreis >= '" + alter_effektivpreis + "' and netz_id = '" + netz_id_aktuell + "'  ORDER BY anbieter, tarifart, effektivpreis DESC";
	var result = executeSql(query);

	var matrix = "<fieldset><legend>Zieltarife</legend>";

	matrix = matrix + 'Aktueller Tarif: ' + aktuelles_netz + ": " + quelltarif + ' </head><br />Zieltarife:<br />';
	matrix = matrix + '<div><table><tr><th>Anbieter:</th><th>Tarifname:</th><th>Tarifart:</th><th>Grundpreis:</th><th>Laufzeitrabatt:</th><th>Handyoption:</th><th>ZIEL-Effektivpreis:</th></tr>';

	var tarife = new Object();

	for (var i = 0; i < result[0].rows.length; i++) {

		matrix = matrix + '<tr></tr>';

		for (var j = 0; j < result[0].columns.length; j++) {

			var color = '#e6e6e6';

			if (result[0].rows[i].columns[j] == 'Telekom') {
				color = '#ff3399';
			} else if (result[0].rows[i].columns[j] == 'Vodafone') {
				color = '#ff1a1a';
			} else if (result[0].rows[i].columns[j] == 'Telefonica') {
				color = '#0080ff';
			}


			if (!debug) {

				if (result[0].columns[j].name == "effektivpreis") {
					color = '#99ff99';
				}

				matrix = matrix + '<td bgcolor="' + color + '">' + result[0].rows[i].columns[j] + '</td>';

			} else {

				if (result[0].columns[j].name == "effektivpreis") {
					color = '#99ff99';
				}

				matrix = matrix + '<td bgcolor="' + color + '">' + result[0].rows[i].columns[j] + '</td>';

			}

		}

	}

	matrix = matrix + '</table></div></fieldset>';

	document.getElementById('tarifmatrix').innerHTML = matrix;

}


function showTarife(tarifanzahl) {

	switch (tarifanzahl) {
		case "1":
			document.getElementById('datenerfassung_tarif_1').style.display = "block";
			document.getElementById('datenerfassung_tarif_2').style.display = "none";
			document.getElementById('datenerfassung_tarif_3').style.display = "none";
			document.getElementById('datenerfassung_tarif_4').style.display = "none";
			break;
		case "2":
			document.getElementById('datenerfassung_tarif_1').style.display = "block";
			document.getElementById('datenerfassung_tarif_2').style.display = "block";
			document.getElementById('datenerfassung_tarif_3').style.display = "none";
			document.getElementById('datenerfassung_tarif_4').style.display = "none";
			break;
		case "3":
			document.getElementById('datenerfassung_tarif_1').style.display = "block";
			document.getElementById('datenerfassung_tarif_2').style.display = "block";
			document.getElementById('datenerfassung_tarif_3').style.display = "block";
			document.getElementById('datenerfassung_tarif_4').style.display = "none";
			break;
		case "4":
			document.getElementById('datenerfassung_tarif_1').style.display = "block";
			document.getElementById('datenerfassung_tarif_2').style.display = "block";
			document.getElementById('datenerfassung_tarif_3').style.display = "block";
			document.getElementById('datenerfassung_tarif_4').style.display = "block";
			break;
		default:
			document.getElementById('datenerfassung_tarif_1').style.display = "none";
			document.getElementById('datenerfassung_tarif_2').style.display = "none";
			document.getElementById('datenerfassung_tarif_3').style.display = "none";
			document.getElementById('datenerfassung_tarif_4').style.display = "none";

	}

}


function showHandyHersteller() {

	var query = "select distinct hersteller from mcd_krg_handys where aktiv = '1' order by hersteller";
	var result = executeSql(query);
	var handyhersteller = new Object();
	for (var i = 0; i < result[0].rows.length; i++) {
		handyhersteller[result[0].rows[i].fields.hersteller] = result[0].rows[i].fields.hersteller;
	}
	selectboxSetOptions(document.getElementById('datenerfassung_handy_hersteller_1'), handyhersteller, "", true, result[0].rows.length);
	selectboxSetOptions(document.getElementById('datenerfassung_handy_hersteller_2'), handyhersteller, "", true, result[0].rows.length);
	selectboxSetOptions(document.getElementById('datenerfassung_handy_hersteller_3'), handyhersteller, "", true, result[0].rows.length);
	selectboxSetOptions(document.getElementById('datenerfassung_handy_hersteller_4'), handyhersteller, "", true, result[0].rows.length);
	selectboxSetOptions(document.getElementById('datenerfassung_handy_hersteller_5'), handyhersteller, "", true, result[0].rows.length);
	selectboxSetOptions(document.getElementById('datenerfassung_handy_hersteller_6'), handyhersteller, "", true, result[0].rows.length);

	selectboxSetOptions(document.getElementById('datenerfassung_hsp_handyhersteller_1'), handyhersteller, "", true, result[0].rows.length);
	selectboxSetOptions(document.getElementById('datenerfassung_hsp_handyhersteller_2'), handyhersteller, "", true, result[0].rows.length);
	selectboxSetOptions(document.getElementById('datenerfassung_hsp_handyhersteller_3'), handyhersteller, "", true, result[0].rows.length);
	selectboxSetOptions(document.getElementById('datenerfassung_hsp_handyhersteller_4'), handyhersteller, "", true, result[0].rows.length);
	selectboxSetOptions(document.getElementById('datenerfassung_hsp_handyhersteller_5'), handyhersteller, "", true, result[0].rows.length);
	selectboxSetOptions(document.getElementById('datenerfassung_hsp_handyhersteller_6'), handyhersteller, "", true, result[0].rows.length);

}

function showHandyHerstellerHSP() {

	var query = "select distinct hersteller from mcd_krg_handys where aktiv = '1' order by hersteller";
	var result = executeSql(query);
	var handyhersteller = new Object();
	for (var i = 0; i < result[0].rows.length; i++) {
		handyhersteller[result[0].rows[i].fields.hersteller] = result[0].rows[i].fields.hersteller;
	}
	selectboxSetOptions(document.getElementById('datenerfassung_hsp_handyhersteller_1'), handyhersteller, "", true, result[0].rows.length);

	//document.getElementById('').style.display = "block";			

}

function showSmieten() {

	smieten = $('datenerfassung_handy_1').value;

	if ($('datenerfassung_handy_1').value == "smieten") {

		var query = "select distinct hersteller from mcd_krg_handys_smieten where aktiv = '1' order by hersteller";
		var result = executeSql(query);
		var handyhersteller = new Object();
		for (var i = 0; i < result[0].rows.length; i++) {
			handyhersteller[result[0].rows[i].fields.hersteller] = result[0].rows[i].fields.hersteller;
		}
		selectboxSetOptions(document.getElementById('datenerfassung_handy_hersteller_1'), handyhersteller, "", true, result[0].rows.length);

		document.getElementById('datenerfassung_zusatzprodukt_hsp_tarif_1').selectedIndex = 1;
		document.getElementById('datenerfassung_zusatzprodukt_hsp_tarif_1').disabled = true;


	} else {

		var query = "select distinct hersteller from mcd_krg_handys where aktiv = '1' order by hersteller";
		var result = executeSql(query);
		var handyhersteller = new Object();
		for (var i = 0; i < result[0].rows.length; i++) {
			handyhersteller[result[0].rows[i].fields.hersteller] = result[0].rows[i].fields.hersteller;
		}
		selectboxSetOptions(document.getElementById('datenerfassung_handy_hersteller_1'), handyhersteller, "", true, result[0].rows.length);

		document.getElementById('datenerfassung_zusatzprodukt_hsp_tarif_1').selectedIndex = 0;
		document.getElementById('datenerfassung_zusatzprodukt_hsp_tarif_1').disabled = false;


	}

}

function showHandyModellTarif1() {

	var herstellername = $('datenerfassung_handy_hersteller_1').value;

	if ($('datenerfassung_handy_1').value == "smieten") {

		var query2 = "select id, handyname from mcd_krg_handys_smieten where hersteller = '" + herstellername + "' and aktiv = '1' order by handyname";
		var result2 = executeSql(query2);
		var handys = new Object();
		for (var i = 0; i < result2[0].rows.length; i++) {
			handys[result2[0].rows[i].fields.id] = result2[0].rows[i].fields.handyname;
		}
		selectboxSetOptions(document.getElementById('datenerfassung_handy_modell_1'), handys, "", true, result2[0].rows.length);

	} else {

		var query2 = "select id, handyname from mcd_krg_handys where hersteller = '" + herstellername + "' and aktiv = '1' order by handyname";
		var result2 = executeSql(query2);
		var handys = new Object();
		for (var i = 0; i < result2[0].rows.length; i++) {
			handys[result2[0].rows[i].fields.id] = result2[0].rows[i].fields.handyname;
		}
		selectboxSetOptions(document.getElementById('datenerfassung_handy_modell_1'), handys, "", true, result2[0].rows.length);

	}



}

function showHandyModellTarif2() {

	var herstellername = $('datenerfassung_handy_hersteller_2').value;

	var query2 = "select id, handyname from mcd_krg_handys where hersteller = '" + herstellername + "' and aktiv = '1' order by handyname";
	var result2 = executeSql(query2);
	var handys = new Object();
	for (var i = 0; i < result2[0].rows.length; i++) {
		handys[result2[0].rows[i].fields.id] = result2[0].rows[i].fields.handyname;
	}
	selectboxSetOptions(document.getElementById('datenerfassung_handy_modell_2'), handys, "", true, result2[0].rows.length);

}

function showHandyModellTarif3() {

	var herstellername = $('datenerfassung_handy_hersteller_3').value;

	var query2 = "select id, handyname from mcd_krg_handys where hersteller = '" + herstellername + "' and aktiv = '1' order by handyname";
	var result2 = executeSql(query2);
	var handys = new Object();
	for (var i = 0; i < result2[0].rows.length; i++) {
		handys[result2[0].rows[i].fields.id] = result2[0].rows[i].fields.handyname;
	}
	selectboxSetOptions(document.getElementById('datenerfassung_handy_modell_3'), handys, "", true, result2[0].rows.length);


}

function showHandyModellTarif4() {

	var herstellername = $('datenerfassung_handy_hersteller_4').value;

	var query2 = "select id, handyname from mcd_krg_handys where hersteller = '" + herstellername + "' and aktiv = '1' order by handyname";
	var result2 = executeSql(query2);
	var handys = new Object();
	for (var i = 0; i < result2[0].rows.length; i++) {
		handys[result2[0].rows[i].fields.id] = result2[0].rows[i].fields.handyname;
	}
	selectboxSetOptions(document.getElementById('datenerfassung_handy_modell_4'), handys, "", true, result2[0].rows.length);

}

function showHandyModellTarif5() {

	var herstellername = $('datenerfassung_handy_hersteller_5').value;

	var query2 = "select id, handyname from mcd_krg_handys where hersteller = '" + herstellername + "' and aktiv = '1' order by handyname";
	var result2 = executeSql(query2);
	var handys = new Object();
	for (var i = 0; i < result2[0].rows.length; i++) {
		handys[result2[0].rows[i].fields.id] = result2[0].rows[i].fields.handyname;
	}
	selectboxSetOptions(document.getElementById('datenerfassung_handy_modell_5'), handys, "", true, result2[0].rows.length);

}

function showHandyModellTarif6() {

	var herstellername = $('datenerfassung_handy_hersteller_6').value;

	var query2 = "select id, handyname from mcd_krg_handys where hersteller = '" + herstellername + "' and aktiv = '1' order by handyname";
	var result2 = executeSql(query2);
	var handys = new Object();
	for (var i = 0; i < result2[0].rows.length; i++) {
		handys[result2[0].rows[i].fields.id] = result2[0].rows[i].fields.handyname;
	}
	selectboxSetOptions(document.getElementById('datenerfassung_handy_modell_6'), handys, "", true, result2[0].rows.length);

}



function showHandyModellHSP1() {

	var herstellername = $('datenerfassung_hsp_handyhersteller_1').value;

	var query2 = "select id, handyname from mcd_krg_handys where hersteller = '" + herstellername + "' and aktiv = '1' order by handyname";
	var result2 = executeSql(query2);
	var handys = new Object();
	for (var i = 0; i < result2[0].rows.length; i++) {
		handys[result2[0].rows[i].fields.id] = result2[0].rows[i].fields.handyname;
	}
	selectboxSetOptions(document.getElementById('datenerfassung_hsp_handymodell_1'), handys, "", true, result2[0].rows.length);

}

function showHandyModellHSP2() {

	var herstellername = $('datenerfassung_hsp_handyhersteller_2').value;

	var query2 = "select id, handyname from mcd_krg_handys where hersteller = '" + herstellername + "' and aktiv = '1' order by handyname";
	var result2 = executeSql(query2);
	var handys = new Object();
	for (var i = 0; i < result2[0].rows.length; i++) {
		handys[result2[0].rows[i].fields.id] = result2[0].rows[i].fields.handyname;
	}
	selectboxSetOptions(document.getElementById('datenerfassung_hsp_handymodell_2'), handys, "", true, result2[0].rows.length);

}

function showHandyModellHSP3() {

	var herstellername = $('datenerfassung_hsp_handyhersteller_3').value;

	var query2 = "select id, handyname from mcd_krg_handys where hersteller = '" + herstellername + "' and aktiv = '1' order by handyname";
	var result2 = executeSql(query2);
	var handys = new Object();
	for (var i = 0; i < result2[0].rows.length; i++) {
		handys[result2[0].rows[i].fields.id] = result2[0].rows[i].fields.handyname;
	}
	selectboxSetOptions(document.getElementById('datenerfassung_hsp_handymodell_3'), handys, "", true, result2[0].rows.length);

}

function showHandyModellHSP4() {

	var herstellername = $('datenerfassung_hsp_handyhersteller_4').value;

	var query2 = "select id, handyname from mcd_krg_handys where hersteller = '" + herstellername + "' and aktiv = '1' order by handyname";
	var result2 = executeSql(query2);
	var handys = new Object();
	for (var i = 0; i < result2[0].rows.length; i++) {
		handys[result2[0].rows[i].fields.id] = result2[0].rows[i].fields.handyname;
	}
	selectboxSetOptions(document.getElementById('datenerfassung_hsp_handymodell_4'), handys, "", true, result2[0].rows.length);

}

function showHandyModellHSP5() {

	var herstellername = $('datenerfassung_hsp_handyhersteller_5').value;

	var query2 = "select id, handyname from mcd_krg_handys where hersteller = '" + herstellername + "' and aktiv = '1' order by handyname";
	var result2 = executeSql(query2);
	var handys = new Object();
	for (var i = 0; i < result2[0].rows.length; i++) {
		handys[result2[0].rows[i].fields.id] = result2[0].rows[i].fields.handyname;
	}
	selectboxSetOptions(document.getElementById('datenerfassung_hsp_handymodell_5'), handys, "", true, result2[0].rows.length);

}

function showHandyModellHSP6() {

	var herstellername = $('datenerfassung_hsp_handyhersteller_6').value;

	var query2 = "select id, handyname from mcd_krg_handys where hersteller = '" + herstellername + "' and aktiv = '1' order by handyname";
	var result2 = executeSql(query2);
	var handys = new Object();
	for (var i = 0; i < result2[0].rows.length; i++) {
		handys[result2[0].rows[i].fields.id] = result2[0].rows[i].fields.handyname;
	}
	selectboxSetOptions(document.getElementById('datenerfassung_hsp_handymodell_6'), handys, "", true, result2[0].rows.length);

}


function showClassicPremiumHSP1() {

	var handymodellHSP = $('datenerfassung_hsp_handymodell_1').value;

	document.getElementById("datenerfassung_hsp_typ_1").disabled = true;

	var query3 = "select Preis_BUP_1 from mcd_krg_handys where id = '" + handymodellHSP + "' and aktiv = '1'";
	var result3 = executeSql(query3);
	var preisHandy = result3[0].rows[0].fields.Preis_BUP_1;

	if (preisHandy > 1 && preisHandy <= 500) {
		document.getElementById('datenerfassung_hsp_typ_1').selectedIndex = 1;

	} else if (preisHandy > 500 && preisHandy <= 800) {
		document.getElementById('datenerfassung_hsp_typ_1').selectedIndex = 2;

	} else if (preisHandy > 800 && preisHandy <= 1100) {
		document.getElementById('datenerfassung_hsp_typ_1').selectedIndex = 3;

	} else if (preisHandy > 1100 && preisHandy <= 3000) {
		document.getElementById('datenerfassung_hsp_typ_1').selectedIndex = 4;

	} else if (preisHandy == 9999) {
		document.getElementById('datenerfassung_hsp_typ_1').selectedIndex = 5;

	} else {
		alert("Handy zu teuer - kann nicht versichert werden.");
	}

}

function showClassicPremiumHSP2() {

	var handymodellHSP = $('datenerfassung_hsp_handymodell_2').value;

	document.getElementById("datenerfassung_hsp_typ_2").disabled = true;

	var query3 = "select Preis_BUP_1 from mcd_krg_handys where id = '" + handymodellHSP + "' and aktiv = '1'";
	var result3 = executeSql(query3);
	var preisHandy = result3[0].rows[0].fields.Preis_BUP_1;

	if (preisHandy > 1 && preisHandy <= 500) {
		document.getElementById('datenerfassung_hsp_typ_2').selectedIndex = 1;

	} else if (preisHandy > 500 && preisHandy <= 800) {
		document.getElementById('datenerfassung_hsp_typ_2').selectedIndex = 2;

	} else if (preisHandy > 800 && preisHandy <= 1100) {
		document.getElementById('datenerfassung_hsp_typ_2').selectedIndex = 3;

	} else if (preisHandy > 1100 && preisHandy <= 3000) {
		document.getElementById('datenerfassung_hsp_typ_2').selectedIndex = 4;

	} else if (preisHandy == 9999) {
		document.getElementById('datenerfassung_hsp_typ_2').selectedIndex = 5;

	} else {
		alert("Handy zu teuer - kann nicht versichert werden.");
	}

}

function showClassicPremiumHSP3() {

	var handymodellHSP = $('datenerfassung_hsp_handymodell_3').value;

	document.getElementById("datenerfassung_hsp_typ_3").disabled = true;

	var query3 = "select Preis_BUP_1 from mcd_krg_handys where id = '" + handymodellHSP + "' and aktiv = '1'";
	var result3 = executeSql(query3);
	var preisHandy = result3[0].rows[0].fields.Preis_BUP_1;

	if (preisHandy > 1 && preisHandy <= 500) {
		document.getElementById('datenerfassung_hsp_typ_3').selectedIndex = 1;

	} else if (preisHandy > 500 && preisHandy <= 800) {
		document.getElementById('datenerfassung_hsp_typ_3').selectedIndex = 2;

	} else if (preisHandy > 800 && preisHandy <= 1100) {
		document.getElementById('datenerfassung_hsp_typ_3').selectedIndex = 3;

	} else if (preisHandy > 1100 && preisHandy <= 3000) {
		document.getElementById('datenerfassung_hsp_typ_3').selectedIndex = 4;

	} else if (preisHandy == 9999) {
		document.getElementById('datenerfassung_hsp_typ_3').selectedIndex = 5;

	} else {
		alert("Handy zu teuer - kann nicht versichert werden.");
	}

}

function showClassicPremiumHSP4() {

	var handymodellHSP = $('datenerfassung_hsp_handymodell_4').value;

	document.getElementById("datenerfassung_hsp_typ_4").disabled = true;

	var query3 = "select Preis_BUP_1 from mcd_krg_handys where id = '" + handymodellHSP + "' and aktiv = '1'";
	var result3 = executeSql(query3);
	var preisHandy = result3[0].rows[0].fields.Preis_BUP_1;

	if (preisHandy > 1 && preisHandy <= 500) {
		document.getElementById('datenerfassung_hsp_typ_4').selectedIndex = 1;

	} else if (preisHandy > 500 && preisHandy <= 800) {
		document.getElementById('datenerfassung_hsp_typ_4').selectedIndex = 2;

	} else if (preisHandy > 800 && preisHandy <= 1100) {
		document.getElementById('datenerfassung_hsp_typ_4').selectedIndex = 3;

	} else if (preisHandy > 1100 && preisHandy <= 3000) {
		document.getElementById('datenerfassung_hsp_typ_4').selectedIndex = 4;

	} else if (preisHandy == 9999) {
		document.getElementById('datenerfassung_hsp_typ_4').selectedIndex = 5;

	} else {
		alert("Handy zu teuer - kann nicht versichert werden.");
	}

}

function showClassicPremiumHSP5() {

	var handymodellHSP = $('datenerfassung_hsp_handymodell_5').value;

	document.getElementById("datenerfassung_hsp_typ_5").disabled = true;

	var query3 = "select Preis_BUP_1 from mcd_krg_handys where id = '" + handymodellHSP + "' and aktiv = '1'";
	var result3 = executeSql(query3);
	var preisHandy = result3[0].rows[0].fields.Preis_BUP_1;

	if (preisHandy > 1 && preisHandy <= 500) {
		document.getElementById('datenerfassung_hsp_typ_5').selectedIndex = 1;

	} else if (preisHandy > 500 && preisHandy <= 800) {
		document.getElementById('datenerfassung_hsp_typ_5').selectedIndex = 2;

	} else if (preisHandy > 800 && preisHandy <= 1100) {
		document.getElementById('datenerfassung_hsp_typ_5').selectedIndex = 3;

	} else if (preisHandy > 1100 && preisHandy <= 3000) {
		document.getElementById('datenerfassung_hsp_typ_5').selectedIndex = 4;

	} else if (preisHandy == 9999) {
		document.getElementById('datenerfassung_hsp_typ_5').selectedIndex = 5;

	} else {
		alert("Handy zu teuer - kann nicht versichert werden.");
	}

}

function showClassicPremiumHSP6() {

	var handymodellHSP = $('datenerfassung_hsp_handymodell_6').value;

	document.getElementById("datenerfassung_hsp_typ_6").disabled = true;

	var query3 = "select Preis_BUP_1 from mcd_krg_handys where id = '" + handymodellHSP + "' and aktiv = '1'";
	var result3 = executeSql(query3);
	var preisHandy = result3[0].rows[0].fields.Preis_BUP_1;

	if (preisHandy > 1 && preisHandy <= 500) {
		document.getElementById('datenerfassung_hsp_typ_6').selectedIndex = 1;

	} else if (preisHandy > 500 && preisHandy <= 800) {
		document.getElementById('datenerfassung_hsp_typ_6').selectedIndex = 2;

	} else if (preisHandy > 800 && preisHandy <= 1100) {
		document.getElementById('datenerfassung_hsp_typ_6').selectedIndex = 3;

	} else if (preisHandy > 1100 && preisHandy <= 3000) {
		document.getElementById('datenerfassung_hsp_typ_6').selectedIndex = 4;

	} else if (preisHandy == 9999) {
		document.getElementById('datenerfassung_hsp_typ_6').selectedIndex = 5;

	} else {
		alert("Handy zu teuer - kann nicht versichert werden.");
	}

}

function showRabatt() {

	// Durchschnittlicher Rabatt der letzten 30 Tage
	//query = "SELECT AVG(Vergebener_Rabatt) AS Rabatt FROM mcd_krg_rabatt WHERE Agenten_ID = '"+agentId+"' AND (Datum BETWEEN NOW() - INTERVAL 30 DAY AND NOW())";

	// Durchschnittlicher Rabatt des aktuellen Monats
	query = "SELECT AVG(Vergebener_Rabatt) AS Rabatt FROM " + rabatttable + " WHERE Agenten_ID = '" + agentId + "' AND (YEAR(Datum) = YEAR(CURRENT_DATE()) AND MONTH(Datum) = MONTH(CURRENT_DATE()))";
	var avgRabatt = executeSql(query);

	if (avgRabatt[0].rows.length > 0) {
		gutschrift = Math.floor(avgRabatt[0].rows[0].fields.Rabatt) + " Euro";
		//gutschrift = avgRabatt[0].rows[0].fields.Rabatt;    	
	} else {
		gutschrift = '0'
	}

}

function showHSP() {

	var i;
	for (i = 1; i <= 6; i++) {

		if ($('datenerfassung_zusatzprodukt_hsp_tarif_' + i + '').value == "EP") {
			document.getElementById('hsp_tarif_' + i + '_div').style.display = "block";
			//document.getElementById('datenerfassung_hsp_adresse_tarif_'+i+'').style.display = "block";

		} else {
			document.getElementById('hsp_tarif_' + i + '_div').style.display = "none";
			//document.getElementById('datenerfassung_hsp_adresse_tarif_'+i+'').style.display = "none";
			//document.getElementById('datenerfassung_hsp_bankverbindung_'+i+'').style.display = "none";

		}

	}


	if ($('datenerfassung_zusatzprodukt_hsp_tarif_1').value == "EP") {
		document.getElementById('hsp_tarif_1_div').style.display = "block";
		document.getElementById('datenerfassung_hsp_adresse_tarif_1').style.display = "block";

		if (!ibanAltOK) {
			document.getElementById('datenerfassung_hsp_bankverbindung_1').style.display = "block";

		} else {
			document.getElementById('datenerfassung_hsp_bankverbindung_1').style.display = "none";
		}


	} else {
		document.getElementById('hsp_tarif_1_div').style.display = "none";
		document.getElementById('datenerfassung_hsp_adresse_tarif_1').style.display = "none";
		document.getElementById('datenerfassung_hsp_bankverbindung_1').style.display = "none";

	}

	fillSMS();
	fillZusammenfassungTarif1bis6();
	fillVerabschiedung();

	return true;

}

function checkIBANhsp() {

	ibanAlt = iban;
	ibanNeu = $('datenerfassung_hsp_iban_1').value;

	if (ibanAlt.length > 0 && ibanAlt.startsWith('DE'))
		ibanAltOK = true;
	else
		ibanAltOK = false;

	/*
	if(ibanNeu.length > 0 && ibanNeu.startsWith('DE'))	
		ibanNeuOK = true;		
	else		
		ibanNeuOK = false;
	*/
}



function recording_complete_start() {
	insertIntoLog("info", "Vollstaendiges Voicerecording wurde angeschaltet.", "");

	if (!debug) {
		ttWeb.setRecordingState(3);
	} else {
		debugvoicerecording = 3;
		alert("recording_complete_start()");
	}

	document.getElementById('abschliessen_complete').style.display = "none";
	document.getElementById('recording').style.display = "none";
	document.getElementById('abschliessen').style.display = "block";
}

/*
function recording_complete_start() {
	insertIntoLog("info", "Vollstaendiges Voicerecording wurde angeschaltet.", "");
	recordingComplete = 1;

	if (!debug){

		if (ttWeb.getRecordingState() != 3) {
			OWvoicefileName = generateVoicefilenameOneWay(recordingPrefix, recordingName, recordingNameSuffix, recordingComplete);
			if (!debug) ttWeb.saveRecording(OWvoicefileName);
		}

	}


	if (!debug) {
		ttWeb.setRecordingState(3);
	}

	//document.getElementById('abschliessen_complete').style.display="none";
	//document.getElementById('abschliessen').style.display="block";
}
*/

function makeRecall() {

	blnSuccess = true;
	blnSuccess &= validateRufnummer(document.getElementById('recall_number').value, errMsg);
	if (blnSuccess == true) {
		ttWeb.setCalltableField('OTHER', $('recall_number').value);
		ttWeb.setIndicator(3);
		ttWeb.clearRecording();
		ttWeb.terminateCall('RR', null, null, 1);
	}
}

function ConfirmPositiv() {

	if (validateZusammenfassung() && validateDatenerfassung(1)) {
		finishPositive();
		//return true;
	} else {
		alert('Fehler bei den Daten. DS kann nicht abgeschlossen werden!');
		//return false;
	}
}

function writeOldResult() {

	if (callResultId == resultIdWv) {

		var query = "update " + addressdatatable + " set " + "result_id_old = '" + resultIdWv + "' where id = " + addressdatatableId;

		updateSql(query);
	}


}

function countVertraege() {

	var anzahlVertraege = 0;

	if ($('datenerfassung_produkt_1').value > "0")
		anzahlVertraege++;
	if ($('datenerfassung_produkt_2').value > "0")
		anzahlVertraege++;
	if ($('datenerfassung_produkt_3').value > "0")
		anzahlVertraege++;
	if ($('datenerfassung_produkt_4').value > "0")
		anzahlVertraege++;
	if ($('datenerfassung_produkt_5').value > "0")
		anzahlVertraege++;
	if ($('datenerfassung_produkt_6').value > "0")
		anzahlVertraege++;


	return anzahlVertraege;

}


function compareRufnummern() {

	var blnSuccess = true;

	var i;
	var j;

	if ($('datenerfassung_produkt_1').value > "0" && $('datenerfassung_produkt_2').value > "0") {

		i = 1;
		for (j = 2; j <= 6; j++) {
			if ($('datenerfassung_tarif_' + i + '_rufnummer').value == $('datenerfassung_tarif_' + j + '_rufnummer').value)
				blnSuccess = false;
		}
	}

	if ($('datenerfassung_produkt_2').value > "0") {

		i = 2;
		for (j = 3; j <= 6; j++) {
			if ($('datenerfassung_tarif_' + i + '_rufnummer').value == $('datenerfassung_tarif_' + j + '_rufnummer').value)
				blnSuccess = false;
		}
	}

	if ($('datenerfassung_produkt_3').value > "0") {

		i = 3;
		for (j = 4; j <= 6; j++) {
			if ($('datenerfassung_tarif_' + i + '_rufnummer').value == $('datenerfassung_tarif_' + j + '_rufnummer').value)
				blnSuccess = false;
		}
	}

	if ($('datenerfassung_produkt_4').value > "0") {

		i = 4;
		for (j = 5; j <= 6; j++) {
			if ($('datenerfassung_tarif_' + i + '_rufnummer').value == $('datenerfassung_tarif_' + j + '_rufnummer').value)
				blnSuccess = false;
		}
	}

	if ($('datenerfassung_produkt_5').value > "0") {

		i = 5;
		for (j = 5; j <= 6; j++) {
			if ($('datenerfassung_tarif_' + i + '_rufnummer').value == $('datenerfassung_tarif_' + j + '_rufnummer').value)
				blnSuccess = false;
		}
	}


	if (!blnSuccess) {

		alert("Identische Rufnummern eingetragen, bitte korrigieren.")

	}


	return blnSuccess;
}
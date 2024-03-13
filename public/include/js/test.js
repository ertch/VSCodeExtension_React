var Begruessung_01 = "Begruessung_01";
var Begruessung_02 = "Begruessung_02";
var Verabschiedung_positiv = "Verabschiedung_positiv";
var Verabschiedung_negativ = "Verabschiedung_negativ";
var SMS_Link = "SMS_Link";
var Z_VVL_mit_Hardware = "Z_VVL_mit_Hardware";
var Z_VVL_mit_Tarifwechsel = "Z_VVL_mit_Tarifwechsel";
var Z_VVL_ohne_Tarifwechsel = "Z_VVL_ohne_Tarifwechsel";



function fillBegruessung() {
	
	var ergebnis;
	
	var query = "select Inhalt from " + texttabelle + " where Kategorie = '" + Begruessung_01 + "' and aktiv = '1'";	
	ergebnis = executeSql(query);	
	var begruessungstext_1 = ergebnis[0].rows[0].columns[0];	
    document.getElementById('begruessungstext_1').innerHTML=begruessungstext_1;	
	
	var query = "select Inhalt from " + texttabelle + " where Kategorie = '" + Begruessung_02 + "' and aktiv = '1'";
	ergebnis = executeSql(query);
	var begruessungstext_2 = ergebnis[0].rows[0].columns[0];    
    document.getElementById('begruessungstext_2').innerHTML=begruessungstext_2;
    
}


function fillVerabschiedung() {
	
	var ergebnis;
	
	if($('datenerfassung_produkt').value > "0"){
		
		var query = "select Inhalt from " + texttabelle + " where Kategorie = '" + Verabschiedung_positiv + "' and aktiv = '1'";
		ergebnis = executeSql(query);
		var verabschiedungstext_positiv = ergebnis[0].rows[0].columns[0];    
	    document.getElementById('verabschiedungstext_1').innerHTML=verabschiedungstext_positiv;
		
	}else{
		
		var query = "select Inhalt from " + texttabelle + " where Kategorie = '" + Verabschiedung_negativ + "' and aktiv = '1'";
		ergebnis = executeSql(query);
		var verabschiedungstext_negativ = ergebnis[0].rows[0].columns[0];    
	    document.getElementById('verabschiedungstext_1').innerHTML=verabschiedungstext_negativ;
		
	}	
    
}


function fillSMS() {
	
	var f_sms = $('datenerfassung_tarif_1_sms').value;
	var f_hsp = $('datenerfassung_zusatzprodukt_hsp_tarif_1').value;
	var f_nor = $('datenerfassung_zusatzprodukt_norton_tarif_1').value;	
	
	var query = "";
	
	if($('datenerfassung_tarif_1_sms').value == "ja"){
		
		if($('datenerfassung_zusatzprodukt_hsp_tarif_1').value == "nein"){
			
			if($('datenerfassung_zusatzprodukt_norton_tarif_1').value != "EP"){
				
				var query = "select Inhalt from " + texttabelle + " where Kategorie = '" + SMS_Link + "' AND SMS = 'ja' AND HSP = 'nein' AND Norton = 'nein' AND aktiv = '1'";
				
			}else{
				
				if($('datenerfassung_zusatzprodukt_norton_tarif_1').value == "EP"){
					
					var query = "select Inhalt from " + texttabelle + " where Kategorie = '" + SMS_Link + "' AND SMS = 'ja' AND HSP = 'nein' AND Norton = 'ja' AND aktiv = '1'";
					
				}				
				
			}			
			
		}else{
			
			if($('datenerfassung_zusatzprodukt_hsp_tarif_1').value == "ja"){
				
				
				if($('datenerfassung_zusatzprodukt_norton_tarif_1').value != "EP"){
					
					query = "select Inhalt from " + texttabelle + " where Kategorie = '" + SMS_Link + "' AND SMS = 'ja' AND HSP = 'ja' AND Norton = 'nein' AND aktiv = '1'";
					
				}else{
					
					if($('datenerfassung_zusatzprodukt_norton_tarif_1').value == "EP"){
						
						query = "select Inhalt from " + texttabelle + " where Kategorie = '" + SMS_Link + "' AND SMS = 'ja' AND HSP = 'ja' AND Norton = 'ja' AND aktiv = '1'";
						
					}					
					
				}				
				
			}
			
		}
		
	}else{
		
		if($('datenerfassung_tarif_1_sms').value == "nein"){
			
			query = "select Inhalt from " + texttabelle + " where Kategorie = '" + SMS_Link + "' AND SMS = 'nein' AND HSP is null AND Norton is null AND aktiv = '1'";
						
		}
	}	
    
}


function fillZusammenfassung(){
	
	var f_gut = $('datenerfassung_tarif_1_sms').value;
	var f_hsp = $('datenerfassung_zusatzprodukt_hsp_tarif_1').value;
	var f_nor = $('datenerfassung_zusatzprodukt_norton_tarif_1').value;
	
	var kategoriewahl = $('datenerfassung_produkt').value;
	var kategorie;
	
	if(kategoriewahl == "VVL mit Hardware"){
		
		kategorie = "Z_VVL_mit_Hardware";
		
	}else if(kategoriewahl == "VVL mit Tarifwechsel"){
		
		kategorie = "Z_VVL_mit_Hardware";
		
	}else if(kategoriewahl == "VVL mit Tarifwechsel"){
		
		
	}
	
	
	if($('rabatt_tarif_1').value > "0"){
			
			if($('datenerfassung_zusatzprodukt_hsp_tarif_1').value == "EP"){
				
				if($('datenerfassung_zusatzprodukt_norton_tarif_1').value == "EP"){
					
					query = "select Inhalt from " + texttabelle + " where Kategorie = '" + Z_VVL_mit_Hardware + "' AND Gutschrift = 'ja' AND HSP = 'ja' AND Norton = 'ja' AND aktiv = '1'";
					
									
				}else if($('datenerfassung_zusatzprodukt_norton_tarif_1').value != "EP"){
					
					query = "select Inhalt from " + texttabelle + " where Kategorie = '" + Z_VVL_mit_Hardware + "' AND Gutschrift = 'ja' AND HSP = 'ja' AND Norton = 'nein' AND aktiv = '1'";
					
				}
				
				
			}else if($('datenerfassung_zusatzprodukt_hsp_tarif_1').value != "EP"){
				
				if($('datenerfassung_zusatzprodukt_norton_tarif_1').value == "EP"){
					
					query = "select Inhalt from " + texttabelle + " where Kategorie = '" + Z_VVL_mit_Hardware + "' AND Gutschrift = 'ja' AND HSP = 'nein' AND Norton = 'ja' AND aktiv = '1'";
					
									
				}else if($('datenerfassung_zusatzprodukt_norton_tarif_1').value != "EP"){
					
					query = "select Inhalt from " + texttabelle + " where Kategorie = '" + Z_VVL_mit_Hardware + "' AND Gutschrift = 'ja' AND HSP = 'nein' AND Norton = 'nein' AND aktiv = '1'";
					
				}
			} 
			
			
			
			
		}else if($('rabatt_tarif_1').value <= "0"){
			
			if($('datenerfassung_zusatzprodukt_hsp_tarif_1').value == "EP"){
				
				if($('datenerfassung_zusatzprodukt_norton_tarif_1').value == "EP"){
					
					query = "select Inhalt from " + texttabelle + " where Kategorie = '" + Z_VVL_mit_Hardware + "' AND Gutschrift = 'nein' AND HSP = 'ja' AND Norton = 'ja' AND aktiv = '1'";
					
									
				}else if($('datenerfassung_zusatzprodukt_norton_tarif_1').value != "EP"){
					
					query = "select Inhalt from " + texttabelle + " where Kategorie = '" + Z_VVL_mit_Hardware + "' AND Gutschrift = 'nein' AND HSP = 'ja' AND Norton = 'nein' AND aktiv = '1'";
					
				}
				
				
			}else if($('datenerfassung_zusatzprodukt_hsp_tarif_1').value != "EP"){
				
				if($('datenerfassung_zusatzprodukt_norton_tarif_1').value == "EP"){
					
					query = "select Inhalt from " + texttabelle + " where Kategorie = '" + Z_VVL_mit_Hardware + "' AND Gutschrift = 'nein' AND HSP = 'nein' AND Norton = 'ja' AND aktiv = '1'";
					
									
				}else if($('datenerfassung_zusatzprodukt_norton_tarif_1').value != "EP"){
					
					query = "select Inhalt from " + texttabelle + " where Kategorie = '" + Z_VVL_mit_Hardware + "' AND Gutschrift = 'nein' AND HSP = 'nein' AND Norton = 'nein' AND aktiv = '1'";
					
				}
			}
				
		}
		
		
		
	}
	
	

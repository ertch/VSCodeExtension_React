var Begruessung_01 = "Begruessung_01";
var Begruessung_02 = "Begruessung_02";
var Verabschiedung_positiv = "Verabschiedung_positiv";
var Verabschiedung_negativ = "Verabschiedung_negativ";
var SMS_Link = "SMS_Link";

/*
var Z_VVL_mit_Hardware = "Z_VVL_mit_Hardware";
var Z_VVL_mit_Tarifwechsel = "Z_VVL_mit_Tarifwechsel";
var Z_VVL_ohne_Tarifwechsel = "Z_VVL_ohne_Tarifwechsel";
*/


function fillBegruessung() {
	
	var query = "";
	var ergebnis = "";
	
	query = "select Inhalt from " + texttabelle + " where Kategorie = '" + Begruessung_01 + "' and aktiv = '1'";	
	ergebnis = executeSql(query);	
	var begruessungstext_1 = ergebnis[0].rows[0].columns[0];	
    document.getElementById('begruessungstext_1').innerHTML=begruessungstext_1;	
	
	query = "select Inhalt from " + texttabelle + " where Kategorie = '" + Begruessung_02 + "' and aktiv = '1'";
	ergebnis = executeSql(query);
	var begruessungstext_2 = ergebnis[0].rows[0].columns[0];    
    document.getElementById('begruessungstext_2').innerHTML=begruessungstext_2;
    
}


function fillVerabschiedung() {
	
	var query = "";
	var ergebnis = "";
	
	if($('datenerfassung_produkt_1').value > "0"){
		
		query = "select Inhalt from " + texttabelle + " where Kategorie = '" + Verabschiedung_positiv + "' and aktiv = '1'";
		ergebnis = executeSql(query);
		var verabschiedungstext_positiv = ergebnis[0].rows[0].columns[0];    
	    document.getElementById('verabschiedungstext_1').innerHTML=verabschiedungstext_positiv;
		
	}else if($('datenerfassung_produkt_1').value == "0"){
		
		query = "select Inhalt from " + texttabelle + " where Kategorie = '" + Verabschiedung_negativ + "' and aktiv = '1'";
		ergebnis = executeSql(query);
		var verabschiedungstext_negativ = ergebnis[0].rows[0].columns[0];    
	    document.getElementById('verabschiedungstext_1').innerHTML= verabschiedungstext_negativ;
		
	}	
    
}


function fillSMS() {
	
	var query = "";	
	var i;
	
	for (i = 1; i <= 6; i++) {
	
	if($('datenerfassung_tarif_'+i+'_sms').value == "ja"){
		
		if($('datenerfassung_zusatzprodukt_hsp_tarif_'+i+'').value != "EP"){
			
			if($('datenerfassung_zusatzprodukt_norton_tarif_'+i+'').value != "EP"){
				
				query = "select Inhalt from " + texttabelle + " where Kategorie = '" + SMS_Link + "' AND SMS = 'ja' AND HSP = 'nein' AND Norton = 'nein' AND aktiv = '1'";
				
			}else{
				
				if($('datenerfassung_zusatzprodukt_norton_tarif_'+i+'').value == "EP"){
					
					query = "select Inhalt from " + texttabelle + " where Kategorie = '" + SMS_Link + "' AND SMS = 'ja' AND HSP = 'nein' AND Norton = 'ja' AND aktiv = '1'";
					
				}				
				
			}			
			
		}else{
			
			if($('datenerfassung_zusatzprodukt_hsp_tarif_'+i+'').value == "EP"){
				
				
				if($('datenerfassung_zusatzprodukt_norton_tarif_'+i+'').value != "EP"){
					
					query = "select Inhalt from " + texttabelle + " where Kategorie = '" + SMS_Link + "' AND SMS = 'ja' AND HSP = 'ja' AND Norton = 'nein' AND aktiv = '1'";
					
				}else{
					
					if($('datenerfassung_zusatzprodukt_norton_tarif_'+i+'').value == "EP"){
						
						query = "select Inhalt from " + texttabelle + " where Kategorie = '" + SMS_Link + "' AND SMS = 'ja' AND HSP = 'ja' AND Norton = 'ja' AND aktiv = '1'";
						
					}					
					
				}				
				
			}
			
		}
		
	}else{
		
		if($('datenerfassung_tarif_'+i+'_sms').value == "nein"){
			
			query = "select Inhalt from " + texttabelle + " where Kategorie = '" + SMS_Link + "' AND SMS = 'nein' AND HSP is null AND Norton is null AND aktiv = '1'";
						
		}
	}
	
	ergebnis = executeSql(query);
	
	if(ergebnis[0].rows.length > "0"){
		var sms_1 = ergebnis[0].rows[0].columns[0];	    
	}else{
		var sms_1 = "Bitte HSP, Norton und SMS befuellen.";	    
	}
	
	document.getElementById('sms_vertrag_'+i+'').innerHTML=sms_1;
	
	}

	fillVerabschiedung();
	fillZusammenfassungTarif1bis6();
}


function fillZusammenfassungTarif1bis6(){
	
	var query = "";
	var ergebnis = "";
	
	var kategorie = "";
	var kategoriewahl = "";
	
	for (i = 1; i <= 6; i++){
		
		kategoriewahl = $('datenerfassung_produkt_'+i+'').value;		
		
		if(kategoriewahl == "1"){
			
			kategorie = "Z_VVL_mit_Tarifwechsel_und_mit_Hardware";
			
		}else if(kategoriewahl == "2"){
			
			kategorie = "Z_VVL_ohne_Tarifwechsel_und_mit_Hardware";
			
		}else if(kategoriewahl == "3"){
			
			kategorie = "Z_VVL_mit_Tarifwechsel";
			
		}else if(kategoriewahl == "4"){
			
			kategorie = "Z_VVL_ohne_Tarifwechsel";
		}
		
		console.log("here i am " +  $('datenerfassung_gutschrift_tarif_'+i+'').value );
		if($('datenerfassung_gutschrift_tarif_'+i+'').value > "0"){
				
				if($('datenerfassung_zusatzprodukt_hsp_tarif_'+i+'').value == "EP"){
					
					if($('datenerfassung_zusatzprodukt_norton_tarif_'+i+'').value == "EP"){
						
						query = "select Inhalt from " + texttabelle + " where Kategorie = '" + kategorie + "' AND Gutschrift = 'ja' AND HSP = 'ja' AND Norton = 'ja' AND aktiv = '1'";
						
										
					}else if($('datenerfassung_zusatzprodukt_norton_tarif_'+i+'').value != "EP"){
						
						query = "select Inhalt from " + texttabelle + " where Kategorie = '" + kategorie + "' AND Gutschrift = 'ja' AND HSP = 'ja' AND Norton = 'nein' AND aktiv = '1'";
						
					}
					
					
				}else if($('datenerfassung_zusatzprodukt_hsp_tarif_'+i+'').value != "EP"){
					
					if($('datenerfassung_zusatzprodukt_norton_tarif_'+i+'').value == "EP"){
						
						query = "select Inhalt from " + texttabelle + " where Kategorie = '" + kategorie + "' AND Gutschrift = 'ja' AND HSP = 'nein' AND Norton = 'ja' AND aktiv = '1'";
						
						if($('datenerfassung_handy_'+i+'').value == "smieten"){
							
							query = "select Inhalt from " + texttabelle + " where Kategorie = '" + kategorie + "' AND Gutschrift = 'ja' AND HSP = 'nein' AND Norton = 'ja' AND Smieten = 'ja' AND aktiv = '1'";
						}
										
					}else if($('datenerfassung_zusatzprodukt_norton_tarif_'+i+'').value != "EP"){
						
						query = "select Inhalt from " + texttabelle + " where Kategorie = '" + kategorie + "' AND Gutschrift = 'ja' AND HSP = 'nein' AND Norton = 'nein' AND aktiv = '1'";
						
						if($('datenerfassung_handy_'+i+'').value == "smieten"){
							
							query = "select Inhalt from " + texttabelle + " where Kategorie = '" + kategorie + "' AND Gutschrift = 'ja' AND HSP = 'nein' AND Norton = 'nein' AND Smieten = 'ja' AND aktiv = '1'";
						}
					}
					
					
				} 
				
				
				
				
			}else if($('datenerfassung_gutschrift_tarif_'+i+'').value <= "0"){
				
				if($('datenerfassung_zusatzprodukt_hsp_tarif_'+i+'').value == "EP"){
					
					if($('datenerfassung_zusatzprodukt_norton_tarif_'+i+'').value == "EP"){
						
						query = "select Inhalt from " + texttabelle + " where Kategorie = '" + kategorie + "' AND Gutschrift = 'nein' AND HSP = 'ja' AND Norton = 'ja' AND aktiv = '1'";
						
										
					}else if($('datenerfassung_zusatzprodukt_norton_tarif_'+i+'').value != "EP"){
						
						query = "select Inhalt from " + texttabelle + " where Kategorie = '" + kategorie + "' AND Gutschrift = 'nein' AND HSP = 'ja' AND Norton = 'nein' AND aktiv = '1'";
						
					}
					
					
				}else if($('datenerfassung_zusatzprodukt_hsp_tarif_'+i+'').value != "EP"){
					
					if($('datenerfassung_zusatzprodukt_norton_tarif_'+i+'').value == "EP"){
						
						query = "select Inhalt from " + texttabelle + " where Kategorie = '" + kategorie + "' AND Gutschrift = 'nein' AND HSP = 'nein' AND Norton = 'ja' AND aktiv = '1'";
						
						if($('datenerfassung_handy_'+i+'').value == "smieten"){
							
							query = "select Inhalt from " + texttabelle + " where Kategorie = '" + kategorie + "' AND Gutschrift = 'nein' AND HSP = 'nein' AND Norton = 'ja' AND Smieten = 'ja' AND aktiv = '1'";
						}
										
					}else if($('datenerfassung_zusatzprodukt_norton_tarif_'+i+'').value != "EP"){
						
						query = "select Inhalt from " + texttabelle + " where Kategorie = '" + kategorie + "' AND Gutschrift = 'nein' AND HSP = 'nein' AND Norton = 'nein' AND aktiv = '1'";
						
						if($('datenerfassung_handy_'+i+'').value == "smieten"){
							
							query = "select Inhalt from " + texttabelle + " where Kategorie = '" + kategorie + "' AND Gutschrift = 'nein' AND HSP = 'nein' AND Norton = 'nein' AND Smieten = 'ja' AND aktiv = '1'";
						}
					}
				}
					
			}
		
		
	    
		ergebnis = executeSql(query);

		if(ergebnis[0].rows.length > "0"){
			var zusammenfassung_1 = ergebnis[0].rows[0].columns[0];	    
		}else{
			var zusammenfassung_1 = "Bitte Gutschrift, HSP und Norton befuellen.";	    
		}
		
		document.getElementById('zusammenfassung_vertrag_'+i+'').innerHTML=zusammenfassung_1;
	
	}
	
	fillVerabschiedung();
		
}
	
	

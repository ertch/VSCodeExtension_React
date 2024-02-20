
function trim (zeichenkette) {
  // Erst f�hrende, dann Abschlie�ende Whitespaces entfernen
  // und das Ergebnis dieser Operationen zur�ckliefern
  return zeichenkette.replace (/^\s+/, '').replace (/\s+$/, '');
}


function isInteger(s){
	var i;
    for (i = 0; i < s.length; i++){
        var c = s.charAt(i);
        if (((c < "0") || (c > "9"))) return false;
    }

    return true;
}


function validateOneYear(datum,description, errorId,blnRequired) {

	var blnError=false;
	//errorId.innerHTML="";

	if (blnRequired || datum.length>0) {

		var dateArray=datum.split(".");
		
		if(dateArray.length==3) {
		
			var heute=new Date();
			
			if((heute.getFullYear()-1)<dateArray[2]) blnError=true;
			else if((heute.getFullYear()-1)==dateArray[2]) {
				if(dateArray[1]>(heute.getMonth()+1)) blnError=true;
				else if(dateArray[1]==(heute.getMonth()+1)) {
					if(heute.getDate()<dateArray[0]) blnError=true;
				}
			}
		}
		
	}

	if(blnError) errorId.innerHTML='Geraetealter';
	
	return !blnError;
}


function validateString(valueString, description, errorId, blnRequired, maxLength) {

	var blnError=false;

	valueString=trim(valueString);

	errorId.innerHTML=" ";

	if(blnRequired && valueString.length==0) {
		blnError=true;
		errorId.innerHTML="Pflichtfeld: "+description;
	}

	if(valueString.length>maxLength) {
		blnError=true;
		errorId.innerHTML="Zu lang (max. "+maxLength+" Zeichen)";
	}

	return !blnError;
}

function validateBankCheck(kto1, kto2, errorId){
 var blnError=false;
    errorId.innerHTML=" ";

  if (kto1!=kto2) {
    blnError = true;
    errorId.innerHTML="Kontocheck falsch";
  }

  return !blnError;

}

function validateImei(imei, description, errorId, blnRequired ){
  var blnError=false;

  imei=trim(imei);
  errorId.innerHTML=" ";

  if(blnRequired && imei.length==0) {
    blnError=true;
    errorId.innerHTML="Pflichtfeld: "+description;
  }

  if(imei.length>17) {
    blnError=true;
    errorId.innerHTML="Zu lang (max. "+maxLength+" Zeichen)";
  }

  return !blnError;



}



function validateInteger(mynum,description, errorId,blnRequired,minValue,maxValue) {

	var blnError=false;
	errorId.innerHTML="";

	if(mynum.length>0) {

		if (!isInteger(mynum)) {
			blnError=true;
			errorId.innerHTML="Keine Zahl!";
		}
		else {

			if((minValue>-1) && (mynum<minValue)) {
				blnError=true;
				errorId.innerHTML="Zahl zu klein.";
			}

			if((maxValue>-1) && (mynum>maxValue)) {
				blnError=true;
				errorId.innerHTML="Zahl zu groß.";
			}



		}
	}
	else {
		if(blnRequired) {
			blnError=true;
			errorId.innerHTML="Pflichtfeld: "+description;
		}

	}

	return !blnError;

}


function validateSelect(value,description,errorId) {
	

	var blnError=false;
	errorId.innerHTML=" ";

	if(trim(value).length==0) {
		blnError=true;
		errorId.innerHTML="Pflichtfeld: "+description;
	}

	return !blnError;
}



function validateDate(datum,description, errorId,blnRequired,minYear,maxYear) {

	var blnError=false;
	errorId.innerHTML=" ";

	if (blnRequired || datum.length>0) {

		var dateArray=datum.split(".");

		if(dateArray.length==3) {
			for(var i=0;i<3;i++) {

				if(!isInteger(dateArray[i])) {
					blnError=true;
					errorId.innerHTML="Falsches Datum (tt.mm.yyyy)";
				}
			}

			// Alle drei Angaben sind Integers
			if(!blnError) {

				if((parseToInt(dateArray[0])<1) || (parseToInt(dateArray[0])>31)) {
					blnError=true;
					errorId.innerHTML="Falscher Tag";
				}
				else {

					var maxDay=31;
					
					if(parseInt(dateArray[1])==2) {
						if((parseToInt(dateArray[2]) % 4 == 0) && ( (!(parseToInt(dateArray[2] % 100 == 0)) || (parseToInt(dateArray[2] % 400 == 0))))) maxDay=29;
						else maxDay=28;
					}
					else {
						if (parseToInt(dateArray[1])==4 || parseToInt(dateArray[1])==6 || parseToInt(dateArray[1])==9 || parseToInt(dateArray[1])==11) maxDay=30;
					}
					
					if(parseToInt(dateArray[0])>maxDay) {
						blnError=true;
						errorId.innerHTML="Tag zu groß.";
					}
				}

				if((parseToInt(dateArray[1])<1) || (parseToInt(dateArray[1])>12)) {
					blnError=true;
					errorId.innerHTML="Falscher Monat";
				}

				if((minYear>-1) && (parseToInt(dateArray[2])<minYear)) {
					blnError=true;
					errorId.innerHTML="Jahr zu klein";
				}

				if((maxYear>-1) && (parseToInt(dateArray[2])>maxYear)) {
					blnError=true;
					errorId.innerHTML="Jahr zu groß";
				}

			}

		}
		else {
			blnError=true;
			errorId.innerHTML="Falsches Datum (tt.mm.yyyy)";
		}
	}

	return !blnError;

}



// Pr�ft, ob ein Geburtsdatum vollj�hrig ist.
function validateAdult(datum,description, errorId,blnRequired) {

	var blnError=false;
	//errorId.innerHTML="";

	if (blnRequired || datum.length>0) {

		var dateArray=datum.split(".");
		
		if(dateArray.length==3) {
		
			var heute=new Date();
			
			if((heute.getFullYear()-18)<dateArray[2]) blnError=true;
			else if((heute.getFullYear()-18)==dateArray[2]) {
				if(dateArray[1]>(heute.getMonth()+1)) blnError=true;
				else if(dateArray[1]==(heute.getMonth()+1)) {
					if(heute.getDate()<dateArray[0]) blnError=true;
				}
			}
		}
		
	}

	if(blnError) errorId.innerHTML='Nicht volljährig.';
	
	return !blnError;
}


// Pr�ft, ob ein Geburtsdatum �lter als 70 ist
function validateAdultTooOld(datum,description, errorId,blnRequired) {

	var blnError=false;
	//errorId.innerHTML="";

	if (blnRequired || datum.length>0) {

		var dateArray=datum.split(".");
		
		if(dateArray.length==3) {
		
			var heute=new Date();
			
			if((heute.getFullYear()-93)>dateArray[2]) blnError=true;
			else if((heute.getFullYear()-93)==dateArray[2]) {
				if(dateArray[1]<(heute.getMonth()+1)) blnError=true;
				else if(dateArray[1]==(heute.getMonth()+1)) {
					if(heute.getDate()>dateArray[0]) blnError=true;
				}
			}
		}
		
	}

	if(blnError) errorId.innerHTML='Kunde ist zu alt.';
	
	return !blnError;
}

function validateEmailUnity(s,description, errorId,blnRequired) {

	var blnError=false;
	errorId.innerHTML=" ";

	if((blnRequired) || (s.length>0)) {

		var a = false;
		var res = false;
		if(typeof(RegExp) == 'function') {
			var b = new RegExp('abc');
			if(b.test('abc') == true){a = true;}
		}

		if(a) {
			reg = new RegExp('^([a-zA-Z0-9\\-\\.\\_]+)'+
				'(\\@)([a-zA-Z0-9\\-\\.]+)'+
				'(\\.)([a-zA-Z]{2,4})$');
			res = (reg.test(s));
		} else {
			res = (s.search('@') >= 1 &&
				s.lastIndexOf('.') > s.search('@') &&
				s.lastIndexOf('.') >= s.length-5);
		}

		if(!res) {
			blnError=true;
			errorId.innerHTML="Email falsch.";
		}
	if (!blnError){
		var dummy = s.split('@');
		var i = 0;
		var zaehler = 0;
		while (i < dummy[1].length -1 ){
			if ("."==dummy[1].charAt(i)){
				zaehler++;
			}
			i++;
		}
		if (zaehler> 1 ){
			blnError=true;
			errorId.innerHTML="Email falsch. Nur 1 Punkt hinter dem @ erlaubt";
		}
	}
}


	return !blnError;
}


function validateEmail(s,description, errorId,blnRequired) {

	var blnError=false;
	errorId.innerHTML=" ";

	if((blnRequired) || (s.length>0)) {

		var a = false;
		var res = false;
		if(typeof(RegExp) == 'function') {
		  var b = new RegExp('abc');
		  if(b.test('abc') == true){a = true;}
		}

		 if(a) {
		  reg = new RegExp('^([a-zA-Z0-9\\-\\.\\_]+)'+
		                   '(\\@)([a-zA-Z0-9\\-\\.]+)'+
		                   '(\\.)([a-zA-Z]{2,4})$');
		  res = (reg.test(s));
		 } else {
		  res = (s.search('@') >= 1 &&
		         s.lastIndexOf('.') > s.search('@') &&
		         s.lastIndexOf('.') >= s.length-5);
		 }

		 if(!res) {
			blnError=true;
			errorId.innerHTML="Email falsch.";
		 }

	}

	return !blnError;
 }



 function validateBankdata(ktonr,blz,errorId) {
	 
	 var blnError = new Boolean(false);
	 blnError=true;
 	errorId.innerHTML=' ';
	
	if(blz=='00000000') return true;

	//if(debug) url='http://www.wort2.de:8180/bankcheck';
	//else
//	url='http://192.168.200.14:8080/bankcheck';

	 new Ajax.Request('http://admin.skon.local/klicktel/bankcheck.php?kto='+ktonr + '&blz=' + blz,
		  {
		    method:'get',
		    async: false,
		    onSuccess: function(transport){
			  if(transport.responseText!='1') {
				errorId.innerHTML='BLZ und/oder KtoNr. falsch.';
				isBankOk = false;
				blnError   =false;
			  }
			  else {
				  errorId.innerHTML='<span style="color:#007700;">KtoNr. und BLZ okay</span>';
			  }

		    },
		    onFailure: function(){ alert('Something went wrong...'); }
		  });



 	return blnError;

 }

function validateBankdataImei(iban,bic,errorId) {
	 
	 var blnError = new Boolean(false);
	 blnError=true;
 	errorId.innerHTML=' ';
	
	//if(iban=='00000000') return true;




	 new Ajax.Request('http://admin.skon.local/klicktel/bankcheck_iban.php?iban='+iban + '&bic=' + bic,
		  {
		    method:'get',
		    async: false,
		    onSuccess: function(transport){
				//alert(transport.responseText);
			  if(transport.responseText!='1') {
				errorId.innerHTML=transport.responseText;
				isBankOk = false;
				blnError   =false;
			  }
			  else {
				  errorId.innerHTML='<span style="color:#007700;">IBAN und BIC okay</span>';
			  }

		    },
		    onFailure: function(){ alert('Something went wrong...'); }
		  });



 	return blnError;

 }


 function validateTime(mytime,description,errorId,blnRequired) {

 	blnError=false;
 	errorId.innerHTML=' ';

	if((mytime.length>0) || blnRequired) {

		chunks=mytime.split(':');

		if(chunks.length==2) {

			if((!isInteger(chunks[0])) || (!isInteger(chunks[1]))) {
				errorId.innerHTML='Zeit falsch';
				blnError=true;
			}
			else {

				chunks[0]=parseToInt(chunks[0]);
				chunks[1]=parseToInt(chunks[1]);

				if((chunks[0]<0) || (chunks[0]>23) || (chunks[1]<0) || (chunks[1]>59)) {
					errorId.innerHTML='Zeit falsch';
					blnError=true;
				}

			}
		}
		else {
			errorId.innerHTML='Zeit falsch';
			blnError=true;
		}
	}

 	return !blnError;
 }


  function validateProductionTime(mytime,description,errorId,blnRequired) {

  	blnError=false;
  	errorId.innerHTML=' ';

  	if(validateTime(mytime,description,errorId,blnRequired)) {

  		if((mytime.length>0) || blnRequired) {

			chunks=mytime.split(':');
			timeMin=(parseToInt(chunks[0])*60)+parseToInt(chunks[1]);

			if((timeMin<480) || (timeMin>1230)) {
				errorId.innerHTML='Zeit liegt nicht in Produktionszeit';
				blnError=true;
			}
  		}
		else {
			errorId.innerHTML='Zeit falsch';
			blnError=true;
		}


  	}
  	else {
		errorId.innerHTML='Zeit falsch';
		blnError=true;
  	}


	return !blnError;

  }

  function validateGlueckszahlen(zahlen,description,errorId) {

  	blnError=false;

	errorId.innerHTML=' ';

  	split=zahlen.split(",");


  	if(split.length!=7) {
  			errorId.innerHTML='7 Zahlen eingeben, durch Komma getrennt';
			blnError=true;

  	}
  	else {
  		for(var i=0;i<split.length;i++) {

  			if(!isInteger(split[i])) {
  		 			errorId.innerHTML="["+split[i]+"] ist keine Zahl";
					blnError=true;

  			}
  			else if((split[i]<1) || (split[i]>49)) {

  				errorId.innerHTML=split[i]+" nicht im Intervall [1,49]";
				blnError=true;
  			}

  		}

		// sind es 7 unterschiedliche Zahlen?
		if(!blnError) {

			blnDoppelt=false;

			for(var i=0;i<split.length;i++) {
				for(var i1=0;i1<split.length;i1++) {
					if((i!=i1) && (split[i]==split[i1])) blnDoppelt=true;
				}
			}

			if(blnDoppelt) {
	 			errorId.innerHTML="Min. eine Zahl ist doppelt";
				blnError=true;
			}
		}
  	}

  	return !blnError;
  }


function validateMobilenumber(valueString, description, errorId, blnRequired) {

	blnError=false;
	
	errorId.innerHTML=' ';

	if(!isInteger(valueString)) {
		blnError=true;
		errorId.innerHTML='Keine Handynummer.';
	}
	else {
	
		if(valueString.substr(0,2)!="01") {
			blnError=true;
			errorId.innerHTML='Keine g&uuml;ltige Handynummer.';
		}
		else {
		
			if(valueString.length<9) {
				blnError=true;
				errorId.innerHTML='Handynummer zu kurz.';
			}
		
		}
	}

	if(!blnRequired && (valueString.length==0)) {
		blnError=false;
		errorId.innerHTML=' ';
	}
	
	return !blnError;
	
}
    function validateRufnummer(rufnr, errorId ){
	  var blnError=false;
	  errorId.innerHTML="";
	  var Suche = /^0[1-9][0-9]+$/;
	  blnError = Suche.test(rufnr);
	  if (!blnError) errorId.innerHTML="Keine Telefonnummer";
	  return blnError;
	}

function validateMSISDN(valueString, description, errorId, blnRequired) {

	blnError=false;
	
	errorId.innerHTML=' ';

	if(!isInteger(valueString)) {
		blnError=true;
		errorId.innerHTML='Keine Handynummer.';
	}
	else {
	
		if(valueString.substr(0,1)!="0") {
			blnError=true;
			errorId.innerHTML='Keine g&uuml;ltige Rufnummer.';
		}
		else {
		
			if(valueString.length<7) {
				blnError=true;
				errorId.innerHTML='Rufnummer zu kurz.';
			}
		
		}
	}

	if(!blnRequired && (valueString.length==0)) {
		blnError=false;
		errorId.innerHTML='';
	}
	
	return !blnError;
	
}
  
function validateSEPA(valueString, description, errorId, blnRequired, minLength, maxLength) {

	var blnError=false;

	valueString=trim(valueString);

	errorId.innerHTML=" ";

	if(blnRequired && valueString.length==0) {
		blnError=true;
		errorId.innerHTML="Pflichtfeld: "+description;
	}

	if(valueString.length>maxLength) {
		blnError=true;
		errorId.innerHTML="Zu lang (max. "+maxLength+" Zeichen)";
	}

	if(valueString.length<minLength) {
		blnError=true;
		errorId.innerHTML="Zu kurz (min. "+minLength+" Zeichen)";
	}

	var checkOK = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	
	for (i = 0; i < valueString.length; i++){
		ch = valueString.charAt(i);
		for (j = 0; j < checkOK.length; j++)
		if (ch == checkOK.charAt(j))
		break;
		if (j == checkOK.length){
			errorId.innerHTML="Sonderzeichen nicht erlaubt";
		}
	}

	return !blnError;
}

function validatePLZ(valueplz, description, errorId, blnRequired) {

	var blnError=false;
	errorId.innerHTML=" ";	
	
	var reg = new RegExp(/^[0-9]{5}$/);	

	if(valueplz.length>0) {
		
		var result = reg.test(valueplz);

		if (!result) {
			blnError=true;
			errorId.innerHTML="Keine g&uuml;ltige Postleitzahl!";
		}
		
	}else{
		
		if(blnRequired) {
			blnError=true;
			errorId.innerHTML="Pflichtfeld: "+description;
		}

	}
	
	return !blnError;

}
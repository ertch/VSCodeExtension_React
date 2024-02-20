function validateIBAN(iban,description,errorId,blnRequired) {
	
	var blnError=false;
	errorId.innerHTML='';
	
	if(isAlphaNumeric(iban)){
	
		if (!iban.match(/[A-Z]{2}[0-9]{2}[A-Z0-9]+/)){
			
			blnError=true;
			
		}else{			
			//blnError=isValidIBANNumber(iban);		
			if(!isValidIBANNumber(iban)){				
				blnError=true;				
			}						
		}		
	}else{
		blnError=true;
	}
	
	if(blnError) errorId.innerHTML='IBAN ung&uuml;ltig';
	
	return !blnError;
}


function isAlphaNumeric(str) {
  var code, i, len;

  for (i = 0, len = str.length; i < len; i++) {
    code = str.charCodeAt(i);
    if (!(code > 47 && code < 58) && // (0-9)
        !(code > 64 && code < 91) && // (A-Z)
        !(code > 96 && code < 123)) { // (a-z)
      return false;
    }
  }
  return true;
}


/*
 * Returns 1 if the IBAN is valid 
 * Returns FALSE if the IBAN's length is not as should be (for CY the IBAN Should be 28 chars long starting with CY )
 * Returns any other number (checksum) when the IBAN is invalid (check digits do not match)
 */
function isValidIBANNumber(input) {	
	
    var CODE_LENGTHS = {
        AD: 24, AE: 23, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22, BR: 29,
        CH: 21, CR: 21, CY: 28, CZ: 24, DE: 22, DK: 18, DO: 28, EE: 20, ES: 24,
        FI: 18, FO: 18, FR: 27, GB: 22, GI: 23, GL: 18, GR: 27, GT: 28, HR: 21,
        HU: 28, IE: 22, IL: 23, IS: 26, IT: 27, JO: 30, KW: 30, KZ: 20, LB: 28,
        LI: 21, LT: 20, LU: 20, LV: 21, MC: 27, MD: 24, ME: 22, MK: 19, MR: 27,
        MT: 31, MU: 30, NL: 18, NO: 15, PK: 24, PL: 28, PS: 29, PT: 25, QA: 29,
        RO: 24, RS: 22, SA: 24, SE: 24, SI: 19, SK: 24, SM: 27, TN: 24, TR: 26
    };
    var iban = String(input).toUpperCase().replace(/[^A-Z0-9]/g, ''), // keep only alphanumeric characters
            code = iban.match(/^([A-Z]{2})(\d{2})([A-Z\d]+)$/), // match and capture (1) the country code, (2) the check digits, and (3) the rest 
			digits;
    // check syntax and length
    if (!code || iban.length !== CODE_LENGTHS[code[1]]) {
        return false;
    }
    // rearrange country code and check digits, and convert chars to ints
    digits = (code[3] + code[1] + code[2]).replace(/[A-Z]/g, function (letter) {
        return letter.charCodeAt(0) - 55;
    });
    // final check
    //return mod97(digits);
	return mod97(digits) === 1;
}

function mod97(string) {
    var checksum = string.slice(0, 2), fragment;
    for (var offset = 2; offset < string.length; offset += 7) {
        fragment = String(checksum) + string.substring(offset, offset + 7);
        checksum = parseInt(fragment, 10) % 97;
    }
    return checksum;
	
}

function validateIdData(idNumber, idType) {
    var rueck = false;
    var idNumberNew = idNumber;

    if (idNumber.length < 9 || idNumber.length > 11){
        rueck = false;
    } else {



    }
    if (idNumber.length == 11){
        idNumberNew = idNumber.substr(0,-1);
    }



}
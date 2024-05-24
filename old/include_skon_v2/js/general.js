function selectboxDeleteChildren($selectBox) {
  if($selectBox != null) {
    while($selectBox.hasChildNodes()) {
      $selectBox.removeChild($selectBox.lastChild);
    }
  }
}


function selectboxSetOptions(selectBox,options,selectedValue,blnEmpty,arraySize) {

  if(selectBox != null) {
    while($selectBox.hasChildNodes()) {
      selectBox.removeChild($selectBox.lastChild);
    }
  }
  if((arraySize>0) || (arraySize==-1)) {

    for(var value in options) {

      if(value.length>0) {
        newOpt=document.createElement('option');
        newOpt.text=options[value];
        newOpt.value=value;
      }
    }
  }

  if(blnEmpty) {
    newOpt=document.createElement('option');
    newOpt.text="[Bitte auswaehlen]";
    newOpt.value="";
    if (navigator.appName == 'Microsoft Internet Explorer') $selectBox.add(newOpt,0);
    else $selectBox.appendChild(newOpt);
  }

  $selectBox.value=selectedValue;

}
function checkboxSetOptions($checkbox,options,selectedValue,blnEmpty,arraySize) {

  selectboxDeleteChildren($checkbox);

  if((arraySize>0) || (arraySize==-1)) {

    for(var value in options) {

      if(value.length>0) {
        lb1=document.createElement("BR");
        myText = document.createTextNode(" \r" + options[value]);
        newOpt=document.createElement('input');
        newOpt.type="checkbox";
        newOpt.name="test";
        newOpt.value=value;
       $checkbox.appendChild(newOpt);
       $checkbox.appendChild(myText);
       $checkbox.appendChild(lb1);
      }
    }
  }


  $checkbox.value=selectedValue;
}

/* Wandelt einen String date ins deutsche (blnToGermanDate=true) bzw. ins DB-Format um */
function dateConvert(date, blnToGermanDate) {
  try{
    if(blnToGermanDate) {
      chunks=date.split("-");
      if(chunks.length==3) {
        // ggf. f�hrende Nullen f�r Tag und Monat generieren
        if(chunks[1].length==1) chunks[1]="0"+chunks[1];
        if(chunks[2].length==1) chunks[2]="0"+chunks[2];
        return (chunks[2]+"."+chunks[1]+"."+chunks[0]);
      }
    }
    else {
      chunks=date.split(".");
      if(chunks.length==3) {
        if(chunks[0].length==1) chunks[0]="0"+chunks[0];
        if(chunks[1].length==1) chunks[1]="0"+chunks[1];
        return (chunks[2]+"-"+chunks[1]+"-"+chunks[0]);
      }
    }
    // War wohl doch ein fehlerhaftes Datum?!
    return "";
  } catch (ex) {
    return "";
  }
}

/* Wandelt einen String date ins deutsche (blnToGermanDate=true) bzw. ins DB-Format um */
function dateConvertPlain(date) {
    try{
      var year = date.substr(0,4);
      var month = date.substr(4,2);
      var day = date.substr(6,7);
      return day + "." + month + "." + year;
    } catch (ex) {
        return "";
    }
}



/* Wandelt einen String date ins deutsche (blnToGermanDate=true) bzw. ins DB-Format um */
function dbDateConvert(date, blnToGermanDate) {
  try{
    //date=eval("new "+dateStr.replace("/","").replace("/",""));
    monat=(date.getMonth()+1);
    if(monat<10) monat="0"+monat;
    tag=(date.getDate());
    if(tag<10) tag="0"+tag;
    if(blnToGermanDate) {
      return(tag + "." + monat + "." + date.getFullYear());
    }
    else {
      return(date.getFullYear() + "-" + monat + "-" + tag);
    }
    // War wohl doch ein fehlerhaftes Datum?!
    return "";
  } catch (ex) {
    return "";
  }
}


/* Diese Funktion strippt f�hrende Nullen und parst den rest als Integer */
function parseToInt(s){
  var i;
  var s1="";
  var blnLead=true;

  for (i = 0; i < s.length; i++){
    var c = s.charAt(i);

    if(!blnLead) s1=s1+c;

    if((blnLead) && (parseInt(c)!=0)) {
      blnLead=false;
      s1=s1+c;
    }
  }

  if(s1.length==0) s1="0";

  return parseInt(s1);
}

/* Setzt innerhalb eines Strings alle beginnenden Buchstaben gro�, den Rest klein */
function camelize(s) {

  var i;
  var s1="";
  var blnLead=true;

  for (i = 0; i < s.length; i++){
    var c = s.charAt(i);
    if(blnLead) {
      var dummy=""+c;
      s1+=dummy.toUpperCase();
      blnLead=false;
    }
    else if(c==" ") {
      blnLead=true;
      s1+=" ";
    }
    else if(c=="-") {
      blnLead=true;
      s1+="-";
    }
    else {
      var dummy=""+c;
      s1+=dummy.toLowerCase();
    }
  }

  return s1;
}

function replaceChars(entry,out,add) {

  temp = "" + entry; // temporary holder

  while (temp.indexOf(out)>-1) {
    pos= temp.indexOf(out);
    temp = "" + (temp.substring(0, pos) + add +
      temp.substring((pos + out.length), temp.length));

  }

  return temp;
}

function trim (zeichenkette) {
  // Erst f�hrende, dann Abschlie�ende Whitespaces entfernen
  // und das Ergebnis dieser Operationen zur�ckliefern
  return zeichenkette.replace (/^\s+/, '').replace (/\s+$/, '');
}


var blnRecord=false;

// Boolean, der speichert, ob der Vorgang positiv abgespeichert werden kann
var blnFinishPositive=false;
var currentTabName="tab_start";


/*function recordSummary() {

  blnRecord=!blnRecord;
  if (!debug ){
    if (ttWeb.getCallState() != 0 || ttWeb.getRecordingState()==3){
      startVoiceRecording();
      document.getElementById('recording').style.display="none";
      document.getElementById('abschliessen').style.display="block";
    } else {
      alert("Kein Kundengespr�ch vorhanden");
      document.getElementById('recording').style.display="block";
      document.getElementById('abschliessen').style.display="none";
    }
  } else { // im Debugmodus
    if (blnRecord){
      document.getElementById('recording').style.display="none";
      document.getElementById('abschliessen').style.display="block";
    } else {
      document.getElementById('recording').style.display="block";
      document.getElementById('abschliessen').style.display="none";
    }
  }
  show_buttons();
}*/

function recordSummary(divId) {

    document.getElementById(divId).innerHTML='<br>&nbsp;Achtung: Aufnahme l&auml;uft ...';
    document.getElementById('recording').style.display='none';
    document.getElementById('abschliessen').style.display='block';
    blnFinishPositive=true;
    blnRecord=true;
    startVoiceRecording();

}

function getNavigationDiv(label,id,value) {

    // var s='<div class="data">';
    var s = '<div class="bg-gray">'
    s=s+'<div class="data_label"><label>'+label+':</label></div>';
    s=s+'<div class="data_value" id="addr'+camelize(id)+'">'+value+'</div>';
    s=s+'</div>';

    return s;
}


function getSimpleNavigationDiv(value) {

    var s='<div class="data">';
    s=s+'&nbsp;'+value+'</div>';

    return s;
}

function getNavigationDivRed(label,id,value) {

    var s='<div class="data">';
    s=s+'<div class="data_label_red"><label>'+label+':</label></div>';
    s=s+'<div class="data_value_red" id="addr'+camelize(id)+'">'+value+'</div>';
    s=s+'</div>';

    return s;
}


function getNavigationSeparator() {

    var s='<div class="data" style="border: 0px">';
    s=s+'<hr style="margin: 10px; left: 10px; width:170px;" />';
    s=s+'</div>';

    return s;
}



function startVoiceRecording() {

    insertIntoLog("info","Voicerecording wurde angeschaltet.","");
    debug_vf = 3;
    if(!debug) {
        //if (ttWeb.getCallState() == 0) insertIntoLog("error","Voicerecording ohne Call von Agent " + ttWeb.getUser().Login +
        //    " mit State " + ttWeb.getRecordingState() ,"");
		ttWeb.initRecording(3);
        ttWeb.setRecordingState(3);
    }
}




function getClientWidth() {
    return document.compatMode=='CSS1Compat' && !window.opera?document.documentElement.clientWidth:document.body.clientWidth;
}

function getClientHeight() {
    return document.compatMode=='CSS1Compat' && !window.opera?document.documentElement.clientHeight:document.body.clientHeight;
}


function windowXSize () {
    if (window.innerWidth) {
        return window.innerWidth;
    } else if (document.body && document.body.offsetWidth) {
        return document.body.offsetWidth;
    } else {
        return 0;
    }
}

function windowYSize () {
    if (window.innerHeight) {
        return window.innerHeight;
    } else if (document.body && document.body.offsetHeight) {
        return document.body.offsetHeight;
    } else {
        return 0;
    }
}



function centerDiv(divId,xSize) {
    document.getElementById(divId).style.left=((windowXSize()-xSize)/2)+'px';
}



function switchTab($newTabName) {
    /*if ($newTabName == "tab_mofu")	{
            showMofu();
    }
*/
    if (validateTab(currentTabName)) {

        currentTabName = $newTabName;

        /* wenn der neue Tab bereits sichtbar ist, nix machen */
        if ($($newTabName).style.display == 'block') {
            return;
        }

        var $newTab = $($newTabName);
        var newTabIndex = 0;
        /* Anzahl der Tabs finden und erst mal alle deaktivieren */
        var tabs = $$('.tab_content');
        for ( var i = 0; i < tabs.length; i++) {
            /* Die einzelnen Tabs aktivieren/deaktivieren */
            tabs[i].style.display = 'none';
            $('tab' + (i + 1)).className = '';
            if (tabs[i] == $newTab) {
                $newTabIndex = i + 1;
            }
        }
        $('tab' + $newTabIndex).className = 'current';
        $newTab.style.display = 'block';
    }

    if ($newTabName != "tab_start")
        myStyle = "none";
    else
        myStyle = "block";


    $('div_go_ane').style.display = myStyle;
    $('div_go_abfax').style.display = myStyle;
    $('div_go_positiv').style.display = myStyle;

    if($newTabName=='tab_zusammenfassung') showzusammenfassung();
    if (blnFinishPositive)
        document.getElementById('abschliessen').style.display = 'block';

    showzusammenfassung();
}




function ajaxGetCityAndStreets(plz,$city,$streets,errorId,ort,street) {

    if(validateInteger(plz,'Plz',errorId,true,1000,99999)) {

        url='http://admin.skon.local/klicktel';
        //if(debug) url='http://winkontor.wortzwei.de/klicktel';

        new Ajax.Request(url+'/index.php?plz='+plz,
            {
                method:'get',
                onSuccess: function(transport){
                    data=transport.responseText.evalJSON();
                    selectboxSetOptions($city,data.cities,ort,true,data.countCities);
                    selectboxSetOptions($streets,data.streets,street,true,data.countStreets);

                },
                onFailure: function(){
                    insertIntoLog("fatal","Klicktel-Proxy ist unter " + url +" nicht erreichbar.","");
                    alert("Klicktel-Proxy ist nicht erreichbar. Bitte asap an IT wenden");
                }
            });
    }
}

function ajaxGetBankname(blz,$bank) {

    new Ajax.Request('http://admin.skon.local/klicktel/index.php?blz='+blz,
        {
            method:'get',
            onSuccess: function(transport){
                $bank.value=transport.responseText;
            },
            onFailure: function(){
                insertIntoLog("fatal","Klicktel-Proxy ist unter " + url +" nicht erreichbar.","");
                alert("Klicktel-Proxy ist nicht erreichbar. Bitte asap an IT wenden");
            }
        });



}

/* Holt Negativgr�nde und Wiedervorlagen f�r Agent aus der DB */
function getCampaignData(campaignId,agentId,addressdataId,addressdatatable,kampCode) {
    /*
    var kquery= "select name from umg_nkg_kampagnen , umg_ups_addressdata where umg_nkg_kampagnen.kampcode_kurz = umg_ups_addressdata.kampcode_kurz and umg_ups_addressdata.id = " + addressdataId;
    var kresult = executeSql(kquery);
    try {
        document.getElementById('kampagnenname').innerHTML = "Unitymedia Upsell<br>" + kresult[0].rows[0].fields.name;
    } catch (err){
        document.getElementById('kampagnenname').innerHTML = "Unitymedia Upsell<br> " + kampCode  ;
    }

    document.getElementById('kampagnenname').innerHTML = "Unitymedia Upsell<br> ";
*/



    // Negativgr�nde herausbekommen
    result=executeSql("SELECT id,label FROM cancellation_reasons WHERE campaign_id="+campaignId+" and active=1 ORDER BY label DESC");

    negativgruende=new Object();
    for(var i=0; i<result[0].rows.length;i++) {
        negativgruende[result[0].rows[i].fields.id]=result[0].rows[i].fields.label;
    }

    selectboxSetOptions(document.getElementById('datenerfassung_ablehnungsgrund'),negativgruende,"",true,result[0].rows.length);



    // Kommende Wiedervorlagen anzeigen

    document.getElementById('div_sqldebug').innerHTML="SELECT CAST(concat('<b>',DATE_FORMAT(wv_date,'%d.%m. %H:%i'),':</b> ',"+fieldname_firstname+",' ',"+fieldname_lastname+",': ',message) AS CHAR) FROM contact_history Join calldatatable ON contact_history.calldatatable_id=calldatatable.id JOIN "+addressdatatable+" on "+addressdatatable+".id=calldatatable.addressdata_id WHERE campaign_id="+campaignId+" AND agent_id="+agentId+" AND is_wv=1 AND wv_date>NOW() ORDER BY wv_date LIMIT 5";

    anzahl=executeSql("SELECT count(*) as anzahl FROM contact_history Join calldatatable ON contact_history.calldatatable_id=calldatatable.id JOIN "+addressdatatable+" on "+addressdatatable+".id=calldatatable.addressdata_id WHERE contact_history.campaign_id="+campaignId+" AND contact_history.agent_id='"+agentId+"' AND is_wv=1 AND wv_date>NOW()");

    if(anzahl[0].rows[0].fields.anzahl>0) {
        result=executeSql("SELECT CAST(concat('<b>',DATE_FORMAT(wv_date,'%d.%m. %H:%i'),':</b> ',"+fieldname_firstname+",' ',"+fieldname_lastname+",': ',message) AS CHAR) as message FROM contact_history Join calldatatable ON contact_history.calldatatable_id=calldatatable.id JOIN "+addressdatatable+" on "+addressdatatable+".id=calldatatable.addressdata_id WHERE contact_history.campaign_id="+campaignId+" AND contact_history.agent_id='"+agentId+"' AND is_wv=1 AND wv_date>NOW() ORDER BY wv_date LIMIT 5");
        var wvtext ='Kommende Wiedervorlagen<br />f&uuml;r <b>Agent '+agentId+'</b>:<br /><br />';
        for(var i=0; i<result[0].rows.length;i++) wvtext=wvtext+'<div class="data" style="height: auto;">'+result[0].rows[i].fields.message+'</div>';
        document.getElementById('right_block').innerHTML=wvtext;
    }

    // Wiedervorlageform auf "default" zur�cksetzten

    var currDate = new Date();
    document.getElementById('wiedervorlage_Date').value=currDate.getDate()+"."+(currDate.getMonth()+1)+"."+currDate.getFullYear();
    document.getElementById('wiedervorlage_Time').value=(currDate.getHours()+1)+":00";
    document.getElementById('wiedervorlage_Text').value="";

    document.getElementById('apne_delay').value="";
    document.getElementById('apne_notiz').value="";


    // Kundenhistorie laden

    anzahl=executeSql("SELECT count(*) as anzahl FROM contact_history WHERE calldatatable_id="+calldatatableId);



    if(anzahl[0].rows[0].fields.anzahl>0) {

        result=executeSql("SELECT cast(concat(DATE_FORMAT(called_at,'%d.%m.%Y, %H:%i'),' (', agent_id ,') ',message) as char CHARACTER SET latin1) as message FROM contact_history WHERE calldatatable_id="+calldatatableId+" ORDER BY called_at DESC");

        var kundenhistorie="<fieldset><legend>Kundenhistorie</legend>";
        for(var i=0; i<result[0].rows.length;i++) kundenhistorie=kundenhistorie+'<div>'+result[0].rows[i].fields.message+'</div>';
        kundenhistorie=kundenhistorie+"</fieldset>";

        document.getElementById('kundenhistorie').innerHTML=kundenhistorie;
    }

    result=executeSql("SELECT POSITIV, NEGATIV, UMWANDLUNGSQUOTE, NETTOKONTAKTE FROM livestat_dwh WHERE kampagnen_id="+campaignId+" LIMIT 1");
    if(result[0].rows.length > 0) {
        quote = result[0].rows[0].fields.UMWANDLUNGSQUOTE;
        nettos = result[0].rows[0].fields.NETTOKONTAKTE;
        if(nettos > 0) {
            $('stats_positive').width = Math.round((result[0].rows[0].fields.POSITIV/nettos)*200);
            $('stats_unfilled').width = 200 - Math.round((result[0].rows[0].fields.POSITIV/(nettos))*200);
        }
        $('stats_text').innerHTML='[<span style="color: green">'+result[0].rows[0].fields.POSITIV+'</span>&nbsp;/&nbsp;'+nettos+'&nbsp;,&nbsp;Wandlungsquote: '+quote+'%]';
    }

}





function finishCallback() {


        insertIntoLog("info", "Versuch eine Wiedervorlage zu legen.", "");

        var jetzt = new Date();
        var DieserMonat = jetzt.getMonth() + 1;


        var split = $('wiedervorlage_Date').value.split(".");
        var year = split[2];
        var month = split[1];
        //	if(month<10) month="0" + month;


        var day = split[0];
        //	if(day<10) day="0" + day;


        var split = $('wiedervorlage_Time').value.split(":");
        var hours = split[0];
        //	if(hours<10) hours="0" + hours;

        var minutes = split[1];
        //	if(minutes<10) minutes="0" + minutes;

        var zielDatum = new Date(year, (month - 1), day, hours, minutes, 0);
        //var callbackDate= day + "." + month + "." + year + " " + hours + ":" + minutes;


        //if (DieserMonat == month) {
		if (true) {
            var query = "INSERT INTO contact_history (\
				calldatatable_id, \
				campaign_id, \
				message, \
				creationdate, \
				agent_id, \
				called_at, \
				is_wv, \
				wv_date \
				) VALUES ( \
				" + calldatatableId + ", \
				" + campaignId + ", \
				'" + escapeString($('wiedervorlage_Text').value) + "', \
				NOW(), \
				" + agentId + ", \
				NOW(), \
				1, \
				'" + year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":00' \
				);";

            updateSql(query);

            query = "UPDATE calldatatable set result_id=" + resultIdWv + ", calldate = now(), agent_id = '" + agentId + "' WHERE id=" + calldatatableId + " LIMIT 1";
            updateSql(query);

/*
            var direction = 2;
            if (!debug) {
                direction = ttWeb.getCallDirection();
                // 1=inbound, 2= outbound
            }

            var query = "UPDATE " + addressdatatable + " set  \
	    direction = '" + direction + "' \
			WHERE id=" + addressdatatableId + " LIMIT 1;";
            updateSql(query);
*/

            if (!debug) {
               // updateSql("insert into calldatatable_callid (calldatatable_id, call_id, result_id, agent_id) values('" + calldatatableId + "','" + ttWeb.getCallID() + "','" + resultIdWv + "','" + agentId + "')");
                ttWeb.clearRecording();
                ttWeb.setIndicator(ttWeb.getIndicator());
                ttWeb.terminateCall("300", zielDatum, blnPersonalAppointment, 0);
            }
        } else {
            alert('Es duerfen keine Wiedervorlagen ueber das Monatsende gelegt werden!');
        }


}


function finishAbFax() {

    insertIntoLog("info","Versuch den Datensatz als AB/Fax zu deklarieren.","");

    query="UPDATE calldatatable SET result_id = '"+resultIdAbfax+"', calldate = now(), agent_id = '" + agentId + "' where id = '" + calldatatableId + "' and campaign_id = '"+campaignId+"' limit 1;";
    updateSql(query);
	var q = "INSERT INTO contact_history (\
						calldatatable_id, \
						campaign_id, \
						message, \
						creationdate, \
						agent_id, \
						called_at, \
						is_wv, \
						wv_date \
						) VALUES ( \
						" + calldatatableId + ", \
						" + campaignId + ", \
						'AbFax', \
						NOW(), \
						" + agentId + ", \
						NOW(), \
						0, \
						NULL \
						);";

    updateSql(q);

    if(!debug) {
       try{
            var i = ttWeb.getCalltableField('abFax');
            i = i + 1;
            ttWeb.setCalltableField('abFax', i);
        } catch (e) {
            insertIntoLog("error","Fehler beim AB Fax hochzaehlen ","")
        }

       // updateSql("insert into calldatatable_callid (calldatatable_id, call_id, result_id, agent_id) values('" + calldatatableId + "','" + ttWeb.getCallID() + "','" + resultIdAbfax + "','" + agentId + "')");
        ttWeb.clearRecording();
        ttWeb.terminateCall('400') ;
    }
}



/* Setzt Call auf APNE */
function finishApne() {

    insertIntoLog("info","Versuch den Datensatz als APNE " + $('apne_delay') .value + "zu setzen.","");

    var resultId=0;
    var terminateId="500";

    switch($('apne_delay') .value) {
        case "0" : resultId=resultIdApne0h;  terminateId="500"; break;
        case "1" : resultId=resultIdApne1h;  terminateId="501"; break;
        case "2" : resultId=resultIdApne2h;  terminateId="502"; break;
        case "3" : resultId=resultIdApne3h;  terminateId="503"; break;
        case "4" : resultId=resultIdApne4h;  terminateId="504"; break;
        case "5" : resultId=resultIdApne5h;  terminateId="505"; break;
        case "6" : resultId=resultIdApne6h;  terminateId="506"; break;
        case "8" : resultId=resultIdApne8h;  terminateId="508"; break;
        case "20": resultId=resultIdApne20h; terminateId="520"; break;
    }

    newDate= new Date();
    newDate.setHours(newDate.getHours() + parseInt($('apne_delay') .value) );


    var query="INSERT INTO contact_history (\
				calldatatable_id, \
				campaign_id, \
				message, \
				creationdate, \
				agent_id, \
				called_at, \
				is_wv \
				) VALUES ( \
				"+calldatatableId+", \
				"+campaignId+", \
				'"+escapeString("APNE "+$('apne_delay').value+" h: "+$('apne_notiz').value)+"', \
				NOW(), \
				"+agentId+", \
				NOW(), \
				0);";

    updateSql(query);

    updateSql("UPDATE calldatatable SET result_id = '"+resultId+"', calldate = now(), agent_id = '" + agentId + "' where id = '" + calldatatableId + "' and campaign_id = '"+campaignId+"' limit 1;");

    if(!debug) {
      //  updateSql("insert into calldatatable_callid (calldatatable_id, call_id, result_id, agent_id) values('" + calldatatableId + "','" + ttWeb.getCallID() + "','" + resultId + "','" + agentId + "')");
        ttWeb.clearRecording();
        ttWeb.terminateCall(terminateId,newDate,0,0);
    }
}

function saveVoiceRecordingName(voicefileName) {
    //if((!debug)) {
        isRecorded = true;
        teile = voicefileName.split("\\");
        query = "insert into voicefiles (calldatatable_id, campaign_id , voicefile, calldate, location) values ('"
            + calldatatableId + "' , '" + campaignId + "' , '" +  removeSlashes(teile[teile.length-3] + "/"
                + teile[teile.length-2] + "/" + teile[teile.length-1]) + "' , now(),'" + removeSlashes(recordingPrefix) + "');";
        executeSql(query);
        insertIntoLog("info","Voicerecording wurde beendet und als Datei " + voicefileName + " gespeichert.","");
   // }
    $('abschliessen').style.display='block';
}


function generateVoicefilename(prefix,template,suffix,recordingComp, terminate) {
    insertIntoLog("debug","Versuche Voicefilename aus " +
        prefix + " " + template + " mit Suffix "+suffix+ " zusammenzubauen","");


    dummy=template;
    dummy=dummy.replace("[#calldatatableId]",calldatatableId);
    dummy=dummy.replace("[#campaignId]",campaignId);
    dummy=dummy.replace("[#addressdatatableId]",addressdatatableId);
    dummy=dummy.replace("[#agentId]",agentId);

    date=new Date();

    monat=(date.getMonth()+1);
    if(monat<10) monat="0"+monat;
    tag=(date.getDate());
    if(tag<10) tag="0"+tag;

    stunde=(date.getHours());
    if(stunde<10) stunde="0"+stunde;

    minutes=(date.getMinutes());
    if(minutes<10) minutes="0"+minutes;
    
    seconds=(date.getSeconds());
    if(seconds<10) seconds="0"+seconds;


    dummy=dummy.replace("[#date]",date.getFullYear()+""+monat+""+tag);
    dummy=dummy.replace("[#datetime]",date.getFullYear()+monat.toString()+tag.toString()+"_"+stunde+minutes+seconds);

    if (terminate == 100)
        folder = "positiv";
    else
        folder = "negativ";

    dummy=prefix + "\\" + date.getFullYear()+ monat+ tag  + "\\" + folder + "\\" + dummy+suffix+".mp3";

    insertIntoLog("debug","Erzeugter Voicefilename ist " + dummy,"");

    return dummy;
}


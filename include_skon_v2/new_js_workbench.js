function call_initialize() {
    ttWeb.setRecordingState(0);

    direction = ttWeb.getCallDirection();
	calldatatableId = ttWeb.getCalltableField('ID');
	msisdn = ttWeb.getCalltableField('HOME');

	indicator = ttWeb.getIndicator(); //Ruft den Index der aktuellen Rufnummer ab.  (1-9)	
    if (indicator == 1) {
		telKontakt = ttWeb.getCalltableField('HOME');
	} else if (indicator == 2) {
		telKontakt = ttWeb.getCalltableField('BUSINESS');
	} else{
        telKontakt = ttWeb.getCalltableField('OTHER');
    };
	
    // muss festnetz immer mit 'BUISNESS' beschriben werden?
    festnetz = ttWeb.getCalltableField('BUSINESS');
	agentId = ttWeb.getUser().Login;



}


//Calls

function call_recall() {

	blnSuccess = true;
	blnSuccess &= validateRufnummer(document.getElementById('recall_number').value, errMsg);
	if (blnSuccess == true) {
		ttWeb.setCalltableField('OTHER', $('recall_number').value);
		ttWeb.setIndicator(3);
		ttWeb.clearRecording();
		ttWeb.terminateCall('RR', null, null, 1);
	}
}


// Call Terminieren
function call_terminate (terminator) {
    ttWeb.terminateCall(terminator);
    // terminator 100 = ?? , 200 = ?? 
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

    // Recording

    function record_start() {
        ttWeb.setRecordingState(3);
        //0 = ??, 1 = ??, 2 = ??, 3 = record, 
    }

    function record_stop(){
        stopVoiceRecording(voicefileName);
        // voicefileName = (prefix, template, suffix, name1, name2)
    }
    
    function record_save() {
        ttWeb.saveRecording(voicefileName);
    }

    function record_clear() {
        ttWeb.clearRecording();
    }


    //Logs

    function setLogPrio(log_level) {
	
        var intLevel=0;
        
        if(log_level=='debug') intLevel=0;
        if(log_level=='info')intLevel=1;
        if(log_level=='warning') intLevel=2;
        if(log_level=='error') intLevel=3;
        if(log_level=='fatal') intLevel=4;
    
        return intLevel;
    }

    function buildLogInsert(loglevel,logmessage,logexception) {

        loglevel=trim(loglevel).toLowerCase();
        blnValidLoglevel=false;
        
        if(loglevel=='debug') blnValidLoglevel=true;
        if(loglevel=='info') blnValidLoglevel=true;
        if(loglevel=='warning') blnValidLoglevel=true;
        if(loglevel=='error') blnValidLoglevel=true;
        if(loglevel=='fatal') blnValidLoglevel=true;
        if(!blnValidLoglevel) loglevel="fatal";
    
        ip = "127.0.0.1";
        if(!debug) ip = ttWeb.getClientIP();
    
        var sql="INSERT into skon_log.ttweb (calldatatable_id,campaign_id,agent_id,log_level,log_message,log_exception,client_ip) values (";
        
        sql += calldatatableId +",";
        sql += campaignId +",";
        sql += agentId +",";
        sql += "'" + escapeString(loglevel) + "',";
        sql += "'" + removeSlashes(escapeString(logmessage)) + "',";
        sql += "'" + escapeString(logexception) + "',";
        sql += "'" + escapeString(ip) + "')";
        
        return sql;
    }
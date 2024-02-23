function executeSql(sql) {
    sqlReturnArray = "";
    var url = 'http://admin/outbound.dbconnector/index.php';


	//if (newJquery){
	if (false){
        jQuery.ajax({
            url: url,
            type: 'GET',
            dataType: 'text',
            success: function (result) {
               sqlReturnArray = result;
            }


        })


    } else {


        if (!debug) {
            try {
                sqlReturnArray = ttWeb.execDatabase(sql,2);
            } catch (ex) {

                insertSql = buildLogInsert('error', sql, ex.Message);
                try {
                    ttWeb.execDatabase(insertSql,2);
                }
                catch (ex1) {
                    //alert("Kann Sql-Fehler nicht loggen: " + ex1.Message);
                }

            }
        }
        else {
            var result = null;
            // alert(sql);
            new Ajax.Request('http://admin/outbound.dbconnector/index.php?sql=' + sql,
                {
                    method: 'get',
                    asynchronous: false,
                    onSuccess: function (transport) {
                        result = transport.responseText.evalJSON();

                    },
                    onFailure: function () {
                        alert('Kann mich nicht mit dem Debug-SQL-Connector verbinden' + sql)
                    }
                });

            sqlReturnArray = result;

        }
    }
        return sqlReturnArray;
    }


function updateSql(sql) {

	sqlReturnArray="";
	
	if(!debug) {
		try {
			ttWeb.execDatabase(sql,2) ;
		} catch (ex) {

			insertSql=buildLogInsert('error',sql,ex.Message);
			try {
				ttWeb.execDatabase(insertSql,2);
			}
			catch(ex1) {
				//alert("Kann Sql-Fehler nicht loggen: " + ex1.Message);
			}
        }
	}
	else {

	var result = null;

        new Ajax.Request('http://admin/outbound.dbconnector/index.php?sql='+sql,
		  {
		    method:'get',
		    asynchronous: false,
		    onSuccess: function(transport){
				result=transport.responseText.evalJSON();

		    },
		    onFailure: function(){ alert('Kann mich nicht mit dem Debug-SQL-Connector verbinden') }
		  });
    
	}
	
	return null;
}


function insertIntoLog(log_level,logmessage,logexception) {
	
	log_level=trim(log_level).toLowerCase();
	
	if(getLoglevelPrio(log_level) >= getLoglevelPrio(logLevel)) {

		insertSql=buildLogInsert(log_level,logmessage,logexception);
		try {
			if(!debug) ttWeb.execDatabase(insertSql,2);
		}
		catch(ex) {
			//alert("Kann Logdatensatz nicht persistieren: " + ex.Message + insertSql);
		}
	
	}
}


function getLoglevelPrio(log_level) {
	
	var intLevel=0;
	
	if(log_level=='debug') intLevel=0;
	if(log_level=='info')intLevel=1;
	if(log_level=='warning') intLevel=2;
	if(log_level=='error') intLevel=3;
	if(log_level=='fatal') intLevel=4;

	return intLevel;
}


function escapeString(s) {
	try {
        s=s.replace(/'/g,"\\'")	;
	} catch (ex){

	}

	return s;
}

function filterSqlResult(s) {
	if(s=='-') s='';
	return s;
}

function removeSlashes(s){
	s=s.replace(/\\/g,"/");
	return s;
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


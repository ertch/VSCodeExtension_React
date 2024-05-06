// Der Kicktel-Server ist wohl nicht mehr aktiv

function executeSql(sql) {

    if (!debug) {
        try {
            return ttWeb.execDatabase(sql);
        }catch (ex) {

            // Error protokollieren
            logSqlError(sql, ex.Message);
            return null;
        }
    }else {
        // Debug: Mit dem SQL-Connector kommunizieren   |   encodeURIComponent = URL-sezifisch Sonderzeichen ersetzten ( " " -> %20 , etc. )
        try {
            var result = null;
            new Ajax.Request('http://admin/outbound.dbconnector/index.php?sql=' + encodeURIComponent(sql), {
                method: 'get',
                asynchronous: false,
                onSuccess: function(transport) {
                    result = transport.responseText.evalJSON();
                },
                onFailure: function() {
                    console.error('Fehler: Kann mich nicht mit dem Debug-SQL-Connector verbinden');
                }
            });

            return result;

        }catch (ex) {
            console.error('Fehler beim Ausführen des Debug-SQL-Befehls: ' + ex.Message);
            return null;
        }
    }
}

function setLogPrio(log_level) {
        
    var intLevel;
    switch (log_level) {

        case 'debug': 
            intLevel=0;
            break;
        
        case 'info': 
            intLevel=1;
            break;

        case 'warning': 
            intLevel=2;
            break;
        
        case 'error': 
            intLevel=3;
            break;
        
        case 'fatal': 
            intLevel=4;
            break;
    }
    return intLevel;
}

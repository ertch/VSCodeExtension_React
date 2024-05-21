/** executeSQL
 * 
 *      Funktion zum senden eines gewünschten SQL-Promts an die API von internen ttFrame-Datenbank
 * 
 *      @param {String} sql - SQL-Promt  
 *      @returns dataObject
 */
function executeSql(sql) {

    if (!debug) {
        try { // dataObject zurückgeben
            return ttWeb.execDatabase(sql);
        }catch (ex) {

            // Error protokollieren
            logIntoDebug("executeSql(): Fehlerhafter SQL-Befehl:",sql, false);
            return null;
        };
    }else {
        try { // Debug: Dem Debug-SQL-Connector kontaktieren  
            var result = null;
            new Ajax.Request('http://admin/outbound.dbconnector/index.php?sql=' + encodeURIComponent(sql), {
                method: 'get',
                asynchronous: false,
                onSuccess: function(transport) {
                    result = transport.responseText.evalJSON();
                },
                onFailure: function() {
                    logIntoDebug("executeSql()",'Error: Keine Verbindung zum Debug-SQL-Connector.', false);
                }
            });
            return result;

        }catch (ex) { // Error protokollieren von Debug-Modus
            logIntoDebug("executeSql()", `Error: Fehlerhafter Debug-SQL-Befehl: ${ex.Message}`, false);
            return null;
        };
    };
};



//-------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** ttErrorLog  
 *              
 *      ErrLogs an die DB von ttFrame durchreichen.
 *      Es sollen keine unnötigen Logs verursacht werden. Daher sollten nur kritische Fehler
 *      überhaupt weitergegeben werden. In der ttEditor-config.js kann entschieden werden, ob 
 *      alle ErrorLogs übermittelt werden sollen.
 * 
 *      @param {String} caller  - Name der Funktion oder Kurzbeschreibung
 *      @param {String} msg     - Beschreibung und ganz Error.msg
 */
function ttErrorLog(caller, msg) {
    try {
        const insertSql = `
        INSERT INTO skon_log.ttweb (
            calldatatable_id,
            campaign_id,
            agent_id,
            log_level,
            log_message,
            client_ip
        ) VALUES (
            ${calldatatableId},
            ${campaignId},
            ${agentId},
            'error',
            '${escapeString(removeSlashes(`${caller} ${msg}`))}',
            '-',
            '${escapeString(ttWeb.getClientIP())}'
        )`;
        ttWeb.execDatabase(insertSql);
    } catch(error) { 
        logIntoDebug(`ttErrorLog(${caller})`, "Error: SQL-INSERT konnte nicht an DB gesendet werden", false);
    };
};

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** Helper H-SQL-001
 * 
 *          SQL String Manipulation - escapeStrings()
 *          Alle Vorkommen des Zeichens ' durch \\'  ersetzen.
 */

function escapeString(s) {
	try {   
        return s.replace(/'/g,"\\'");
	} catch (ex){
        logIntoDebug("escapeStrings()", "Das Einfügen von Escape-Zeichen \' ist fehlgeschlagen", false)
	}
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** Helper H-SQL-002
 * 
 *          SQL String Manipulation - removeSlashes()
 *          Alle Vorkommen von Backslash durch Slash ersetzen.
 */

function removeSlashes(s){
    try { 
        return s.replace(/\\/g,"/");
    } catch (ex){
        logIntoDebug("removeSlashes()", "Das Entfernen von Backshashes ist fehlgeschlagen", false)
	}
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------

/** executeSQL                                                                                                                 Funktion geprüft am: 22.05.24 von Erik
 * 
 *      Funktion zum senden eines gewünschten SQL-Promts an die API von internen ttFrame-Datenbank
 * 
 *      @param {String} sql - SQL-Promt  
 *      @returns dataObject
 */
function executeSql(sql) {

    if (!Global.debugMode) {
        try { // dataObject zurückgeben
            return ttWeb.execDatabase(sql);
        }catch (ex) {

            // Error protokollieren
            logIntoDebug("executeSql(): Fehlerhafter SQL-Befehl",sql, false);
            return null;
        };
    }else {
        let result = null;

        const url = `${Global.nestor}${encodeURIComponent(sql)}`;

        // Create a new XMLHttpRequest object
        let xhr = new XMLHttpRequest();

        // Open a synchronous GET request
        xhr.open('GET', url, false);

        try {
            // Send the request
            xhr.send();

            if (xhr.status === 200) {
                // Parse the JSON response
                result = JSON.parse(xhr.responseText);
                sqlReturnArray = result;
            } else {
                console.error('SQL Request failed. Status:', xhr.status);
                logIntoDebug("executeSQL",'Kann mich nicht mit dem Debug-SQL-Connector verbinden: ' + sql + '\nError: ' + xhr.statusText, false);
            }
        } catch (error) {
            console.error('SQL Request error:', error);
           logIntoDebug("executeSQL",'Kann mich nicht mit dem Debug-SQL-Connector verbinden: ' + sql + '\nError: ' + error.message, false);
        }
    }
    return sqlReturnArray;
}


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
            ${Global.calldatatableId},
            ${campaignId},
            ${agentId},
            'error',
            '${escapeString(removeSlashes(`${caller} ${msg}`))}',
            '-',
            '${escapeString(ttWeb.getClientIP())}'
        )`;
        ttWeb.execDatabase(insertSql);
    } catch(error) { 
        logIntoDebug(`ttErrorLog(${caller})`, "Error: SQL-INSERT konnte nicht an DB gesendet werden", Global.LogIntottDB);
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
            logIntoDebug("escapeStrings()", "Das Einfügen von Escape-Zeichen \' ist fehlgeschlagen", Global.LogIntottDB)
        }
    };
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
            logIntoDebug("removeSlashes()", "Das Entfernen von Backshashes ist fehlgeschlagen", Global.LogIntottDB)
        }
    };

    //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    /** autoInject_selects - Fülle die SQLinjektionSelects
     * 
     *      Wird innerhaelb des buildUps aufgerufen und gibt alle Elemente die
     *      ein data-injection Attribute haben an "sqlInject_select"
     */

    function autoInject_selects() {
        let selelects = document.querySelectorAll('[data-injection]');
        selelects.forEach((sel) => {
            let injection = sel.getAttribute('data-injection');
            sqlInject_select(sel.id, 0, injection);
        })
    };

    function sqlInject_select(target_id, selectValue, injection) {
        let selectBox = document.getElementById(target_id);
        let dataObj = pullSQL(injection);
        let newOptions = [];

        // itteriere durch das DataObj von der DB und erstelle Array aus id(value) und label[Anzeigetext] 
        for (let i = 0; i < dataObj[0].rows.length; i++) {
            newOptions[i] = [dataObj[0].rows[i].fields.id, dataObj[0].rows[i].fields.label];
        };

        let arraySize = newOptions.length;
        if(selectBox != null) {
            // Falls das Select schon Einträge besitzt, entferne diese
            while(selectBox.hasChildNodes()) {
                selectBox.removeChild(selectBox.lastChild);
            }
        }
        if((arraySize > 0) || (arraySize == -1)) {
            // Füge ein Bitte auswählen ein
            injectOpt=document.createElement('option');
            injectOpt.text="[Bitte auswählen]";
            injectOpt.value=0;
            selectBox.appendChild(injectOpt);
        
            newOptions.forEach((item) => {
                // Erstelle die Einträge
                if(item[0] > 0) {
                    injectOpt=document.createElement('option');
                    injectOpt.text= item[1];
                    injectOpt.value= item[0];
                    selectBox.appendChild(injectOpt);
                }
            })
        }
        // Einträge in Select schieben
        selectBox.value=selectValue;
    };

/** convertFormToQuery() - Alle Daten in query verpacken und an Datenback senden. 
 * 
 *      
 * 
 * @param {*} formId 
 * @returns 
 */

    function convertFormToQuery(formId) {
        
        let targetTables = {};
        let tableCache = '';
        let form = document.getElementById(formId);
        if (!form || form.nodeName !== "FORM") {
            console.error("Invalid form ID");
            return;
        }
        // Auswertung der Form, betrachte nur Elemente mit data-Submit Attibut
        form = form.querySelectorAll('[data-submit]');
        let data = Array.from(form).map(element => {
            // Mappe ein Objekt, das jeweils als columnName, tableName, tableId, element.value besteht
            const [columnName, tableName, tableId] = element.getAttribute('data-submit').split(',');
            if (tableCache !== tableName){ // schreibe IDs für Table mit
                targetTables[tableName.trim()] = tableId.trim();
                tableCache = tableName.trim();
            }   
            return {
                columnName: columnName.trim(),
                tableName: tableName.trim(),
                value: element.value.trim(),
              };
        })
        // sortiere die Einträge des Objektes nach Table und Table.id
        data.sort((a, b) => {
            if (a.tableName < b.tableName){ 
                return -1;
            } else if (a.tableName > b.tableName){ 
                return 1;
            }
            return 0;
        });
        // Gruppierte Daten so, dass Objekt mit {tableName: 'query-part'} entsteht
        const groupedData = data.reduce((row, item) => {
            if (!row[item.tableName]) {
                row[item.tableName] = [];
            }
            row[item.tableName].push(` ${item.columnName} = '${item.value}'`);
            return row;
        }, {});

        Object.keys(groupedData).forEach(tableName => {
            let tableId = targetTables[tableName];
            try { // prüfe ob tableName eine Variable ist
                tableId = eval(targetTables[tableName]);
            } catch(e){}

            let query = `UPDATE ${tableName} SET`;
            console.log(`Data for table ${tableName}:`);
            groupedData[tableName].forEach((part, index) => {
                query += part;
                index<groupedData[tableName].length-1? query+=`,`:undefined;
            });
            query += ` WHERE ${tableName}.id = ${tableId} LIMIT 1`;
            console.log(query)
            if (Global.debugMode){
                logIntoDebug("pushData - DebugMode", `${query} `)
                console.log(query);
            } else {
                let serverStatus = executeSql("show status");
                if (serverStatus.length <= 0 || serverStatus === null) {
                    //TODO: Sichere Daten... irgendwie
                } else {
                    let awnser = executeSql(query);
                    fail = awnser.length>0?false:true;
                    Global.logSQL? logsqlIntodebug("pushData", query, fail): undefined;
                    query = '';
                };
            }
        });      
    }
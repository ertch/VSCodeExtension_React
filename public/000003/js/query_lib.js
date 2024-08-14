/**                                                         ___                          _     _ _                          
*                                                          / _ \ _   _  ___ _ __ _   _  | |   (_) |__  _ __ __ _ _ __ _   _ 
*                                                         | | | | | | |/ _ \ '__| | | | | |   | | '_ \| '__/ _` | '__| | | |
*                                                         | |_| | |_| |  __/ |  | |_| | | |___| | |_) | | | (_| | |  | |_| |
*                                                          \__\_\\__,_|\___|_|   \__, | |_____|_|_.__/|_|  \__,_|_|   \__, |
*                                                                                |___/                                |___/ 
* 
*       Die query-lib sellt die verschiedenen querys für die Kampagnen zur Verfügung. Diese werden mit der "Costumer-cells"-Component ausgewählt
*       und über das JS in die CustomerInfo geladen. Hierbei ist es wichtig immer die Key === match zu nutzen, damit die Funktion greift.
*
*---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 * main_query() Abfeuern des "Haupt-Querys" für die Kundendaten aus der Adressdata
 * 
 *      Was in die Variable query eingetragen wird, wird eins zu eins gegen die DB geschmissen.
 *      @returns DataObject
*/
    function main_query() { 
        let query = pullMainQuery(); // <-- queryGenerator aus Pattern
        //---------------------------------------------------------
        //  Hier kann auch händisch ein query eingetragen werden
        //---------------------------------------------------------

        try { // Auswertung des DataObjects
            let SQLdataset = executeSql(query);
            Global.addressdatatableId = SQLdataset[0].rows[0].columns[0];
            SqlField = SQLdataset[0].rows[0].fields;
        } catch {
            SqlField = [];
        }   
        let send = SqlField>[]?true:false;
        Global.logSQL? logsqlIntodebug(`SQL TableID: <span class="txt--blue">${Global.addressdatatable}</span>`,query, send ) : undefined;
        return SqlField;                           
    };

//---------------------------------------------------------------------------------------------------------------------------------------
/** pullMainQuery() - Automatisierte Variante des, sonnst händisch eingetragenen, Haupt-querys.
 * 
 *      Aus dem DataObject CustomerPattern, werden Alle match-keys in der DB abgefragt. (abgesehen von separator)
 *      Diese Funktion fügt eine andere Endung an das Query, wenn man sich im DebugModus befinden.
 * 
 * @returns Dataobject
 */
    function pullMainQuery(){
        let query = `SELECT ${Global.addressdatatable}.id as ${Global.key1}`;
        for(let i = 0; i < CustomerPattern.length; i++) {
            let entry = `${CustomerPattern[i].match}`;
            if (entry !== 'separator' && entry !== ''){
                switch (`${CustomerPattern[i].dbType}`) {
                    case 'VARCHAR':
                        query +=  `,trim(if(isnull(${entry}),'-',if(${entry} = '','-',${entry}))) as ${entry} `;
                        break;
                    
                    case 'DATE':
                        query +=  `,trim(if(isnull(${entry}),'-',if(${entry} = '','-',DATE_FORMAT(${entry}, '%d.%m.%Y')))) as ${entry} `;
                        break;
                }
            }
        }
        if (Global.debugMode) {
            query += `FROM ${Global.addressdatatable} join calldatatable on calldatatable.addressdata_id=${Global.addressdatatable}.id where calldatatable.id=${Global.key2} LIMIT 1`;
        } else {
            query += `FROM ${Global.addressdatatable} WHERE ${Global.addressdatatable}.id = ${Global.key2} LIMIT 1`;
        } 
        return query;
    }

//-------------------------------------------------------------------- Pull from DB -----------------------------------------------------------------------------
/** pullSQL
 *
 *      Sammelfunktion aller SQL-Promts für das laden von Daten aus der DB.
 *      Mit Aufruf der Funktion wird das mit dem promtName angegebene Query an die DB geschickt  
 *  
 *      @param {String} promtName 
 *      @returns DataObject
 */
    function pullSQL (promtName) {
        try {
            switch (promtName) {

                case "result_id":
                    query = `SELECT result_id FROM calldatatable where id=${Global.key2} LIMIT 1`;
                    break;

                case "cancellation_reasons":
                    query = `SELECT id, label FROM cancellation_reasons WHERE campaign_id=${Global.campaignId} AND active=1 ORDER BY label DESC`;
                    break;
                
                // case "wiedervorlageCount":
                //     query = `SELECT count(*) as anzahl FROM contact_history JOIN calldatatable ON contact_history.calldatatable_id=calldatatable.id JOIN ${Global.addressdatatable} ON ${Global.addressdatatable}.id=calldatatable.addressdata_id WHERE contact_history.campaign_id=${campaignId} AND contact_history.agent_id='${agentId}' AND is_wv=1 AND wv_date>NOW()`;
                //     break;

                // case "wiedervorlageData":
                //     query = `SELECT CAST(concat('<b>',DATE_FORMAT(wv_date,'%d.%m. %H:%i'),':</b> ', ${Global.fieldname_firstname},' ', ${Global.fieldname_lastname},' : 
                //             ',message) AS CHAR) as message FROM contact_history JOIN calldatatable ON contact_history.calldatatable_id=calldatatable.id JOIN ${Global.addressdatatable} 
                //             ON ${Global.addressdatatable}.id=calldatatable.addressdata_id WHERE contact_history.campaign_id=${Global.campaignId} AND contact_history.agent_id='${agentId}' 
                //             AND is_wv=1 AND wv_date>NOW() ORDER BY wv_date LIMIT 5`;
                //     break;
                    
                case "historyData":
                    query = `SELECT cast(concat(DATE_FORMAT(called_at,'%d.%m.%Y, %H:%i'),' (', agent_id ,') ',message) as char CHARACTER SET latin1) as message 
                            FROM contact_history WHERE calldatatable_id=${Global.key2} ORDER BY called_at DESC`; 
                    break;

                default:
            };
            let awnser = executeSql(query);
            let send = awnser.length>0?true:false;
            Global.logSQL? logsqlIntodebug(promtName, query, send): undefined;
            return awnser;
        } catch(error) {
            logIntoDebug("pullSQL", `query ${promtName} konnte nicht geladen werden.`);
            return [];
        }
    }

// ------------------------------------------------------------------ Push into DB -------------------------------------------------------------------------------
/**  pushSQL('promtName') - schicke spezielle SQL-Query an die DB
 * 
 *      Mit Aufruf der Funktion wird das mit dem promtName angegebene Query an die DB geschickt.
 * 
 *      @param {string} promtName 
 */
    function pushSQL (promtName, withResult) {
        try {
            switch(promtName){

                case 'finish':
                    query = `UPDATE calldatatable SET result_id = '${withResult}', calldate = now(), agent_id = '${agentId}' WHERE id = ${Global.key2} and campaign_id = ${Global.campaignId} LIMIT 1`;
                    break;

                case "update_rec_info": // Speichere Verweis für aktuellen VoiceFiles in der DB (Global.addressdatatable) ab.
                    teile = splitRecName();
                    query =    `UPDATE ${Global.addressdatatable} SET voice_id = '${teile[teile.length - 1]}' WHERE id = '${Global.addressdatatableId}' LIMIT 1`;
                    break;
                
                case "save_rec_path": // Speichere den Pfad des aktuellen VoiceFiles in der DB (calldatatable) ab.
                    
                    query =    `INSERT INTO voicefiles (calldatatable_id, campaign_id , voicefile, calldate, location) 
                                VALUES ('${Global.key2}', '${campaignId}', '${Global.recordFileName}', NOW(), ${removeSlashes(Global.recordingPrefix)}
                                ');`;
                    break;
                
                case "update_history_apne":
                    query = `INSERT INTO contact_history (calldatatable_id, campaign_id, message, creationdate, agent_id, called_at, is_wv ) 
                             VALUES ('${calldatatableId}', '${campaignId}', 'APNE ${document.getElementById("apne_delay").value} h: ${escapeString(document.getElementById(apne_notiz).value)}', NOW(), '${agentId}', NOW(), 0);`
                    break;

                case "update_history_wievor":
                    query = `INSERT INTO contact_history (calldatatable_id, campaign_id, message, creationdate, agent_id, called_at, is_wv, wv_date) 
                             VALUES ('${calldatatableId}', '${campaignId}', '${escapeString(document.getElementById("wiedervorlage_Text").value)}', '${agentId}', NOW(), '${withResult}');`

                default:
                    // logIntoDebug("pushSQL", `Error: Der aufgerufene Promt ${promtName} existiert nicht.`, LogIntottDB)
            }
            console.log(query)
            alert(query)
            // executeSql(query);
        }catch(error){}
    };

    const queryDefault = "";
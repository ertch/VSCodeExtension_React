/**                                                                   QUERY LIBRARY
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
 *      Aus dem DataObject CustomerData, werden Alle match-keys in der DB abgefragt. (abgesehen von separator)
 *      Diese Funktion fügt eine andere Endung an das Query, wenn man sich im DebugModus befinden.
 * 
 * @returns Dataobject
 */
    function pullMainQuery(){
        let query = `SELECT ${Global.addressdatatable}.id as addressdataid`;
        for(let i = 0; i < CustomerData.length; i++) {
            let entry = `${CustomerData[i].match}`;
            if (entry !== 'separator' && entry !== ''){
                query +=  `,trim(if(isnull(${entry}),'-',if(${entry} = '','-',${entry}))) as ${entry} `;
            }
        }
        if (Global.debugMode) {
            query += `FROM ${Global.addressdatatable} join calldatatable on calldatatable.addressdata_id=${Global.addressdatatable}.id where calldatatable.id=${Global.calldatatableId} LIMIT 1`;
        } else {
            query += `FROM ${Global.addressdatatable} WHERE ${Global.addressdatatable}.id = ${Global.calldatatableId} LIMIT 1`;
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
                    query = `SELECT result_id FROM calldatatable where id=${Global.calldatatableId} LIMIT 1`;
                    break;

                case "cancellation_reasons":
                    query = `SELECT id, label FROM cancellation_reasons WHERE campaign_id=${campaignId} AND active=1 ORDER BY label DESC`;
                    break;
                
                case "wiedervorlageCount":
                    query = `SELECT count(*) as anzahl FROM contact_history JOIN calldatatable ON contact_history.calldatatable_id=calldatatable.id JOIN ${Global.addressdatatable} 
                            ON ${Global.addressdatatable}.id=calldatatable.addressdata_id WHERE contact_history.campaign_id=${campaignId} AND contact_history.agent_id='${agentId}' 
                            AND is_wv=1 AND wv_date>NOW()`;
                    break;

                case "wiedervorlageData":
                    query = `SELECT CAST(concat('<b>',DATE_FORMAT(wv_date,'%d.%m. %H:%i'),':</b> ', ${Global.fieldname_firstname},' ', ${Global.fieldname_lastname},' : 
                            ',message) AS CHAR) as message FROM contact_history JOIN calldatatable ON contact_history.calldatatable_id=calldatatable.id JOIN ${Global.addressdatatable} 
                            ON ${Global.addressdatatable}.id=calldatatable.addressdata_id WHERE contact_history.campaign_id=${campaignId} AND contact_history.agent_id='${agentId}' 
                            AND is_wv=1 AND wv_date>NOW() ORDER BY wv_date LIMIT 5`;
                    break;

                case "historyCount":
                    query = `SELECT count(*) as anzahl FROM contact_history WHERE calldatatable_id=${Global.calldatatableId}`;
                    break;
                
                case "historyData":
                    query = `SELECT cast(concat(DATE_FORMAT(called_at,'%d.%m.%Y, %H:%i'),' (', agent_id ,') ',message) as char CHARACTER SET latin1) as message 
                            FROM contact_history WHERE calldatatable_id=${Global.calldatatableId} ORDER BY called_at DESC`; 
                    break;
                
                case "statistik":
                    query = `SELECT POSITIV, NEGATIV, UMWANDLUNGSQUOTE, NETTOKONTAKTE FROM livestat_dwh WHERE kampagnen_id=${campaignId} LIMIT 1`;
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
    function pushSQL (promtName) {
        
        switch(promtName){

            case "update_rec_info": // Speichere Verweis für aktuellen VoiceFiles in der DB (Global.addressdatatable) ab.
                teile = splitRecName();
                query =    `UPDATE ${Global.addressdatatable} set voice_id = '${teile[teile.length - 1]}' WHERE id = '${Global.addressdatatableId}' LIMIT 1`;
                break;
            
            case "save_rec_path": // Speichere den Pfad des aktuellen VoiceFiles in der DB (calldatatable) ab.
                teile = splitRecName();
                query =    `insert into voicefiles (calldatatable_id, campaign_id , voicefile, calldate, location) 
                            values ('
                                ${Global.calldatatableId},    
                                ${campaignId},
                                ${teile[teile.length - 3]} / ${teile[teile.length - 2]} / ${teile[teile.length - 1]},
                                now(),
                                ${removeSlashes(Global.recordingPrefix)}
                            ');`;
                break;
            
            default:
                logIntoDebug("pushSQL", `Error: Der aufgerufene Promt ${promtName} existiert nicht.`, LogIntottDB)
        }
    };
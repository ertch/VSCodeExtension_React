/**                                                                   QUERY LIBRARY
* 
*       Die query-lib sellt die verschiedenen querys für die Kampagnen zur Verfügung. Diese werden mit der "Costumer-cells"-Component ausgewählt
*       und über das JS in die CustomerInfo geladen. Hierbei ist es wichtig immer die Key === match zu nutzen, damit die Funktion greift.
* 
*       
*    
* 
*/
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function ste_out_1() { // Der Name der gewünschten Funktion wird im CustumerCells HTML-Element unter query ="" eingetragen.
    let query = `
        select 
            ${addressdatatable}.id as addressdataid, \
            trim(if(isnull(customerid),'-',if(customerid = '','-',customerid))) as customerid, \
            trim(if(isnull(firstname),'-',if(firstname = '','',firstname))) as firstname, \
            trim(if(isnull(surname),'-',if(surname = '','',surname))) as surname, \
            trim(if(isnull(dateofbirth),'-',if(dateofbirth = '','',dateofbirth))) as dateofbirth, \
            trim(if(isnull(emailprivate),'-',if(emailprivate = '','',emailprivate))) as emailprivate, \
            trim(if(isnull(phonemobileareacode),'-',if(phonemobileareacode = '','',phonemobileareacode))) as phonemobileareacode, \
            trim(if(isnull(phonemobile),'-',if(phonemobile = '','',phonemobile))) as phonemobile, \
            trim(if(isnull(phonehomeareacode),'-',if(phonehomeareacode = '','',phonehomeareacode))) as phonehomeareacode, \
            trim(if(isnull(phonehome),'-',if(phonehome = '','',phonehome))) as phonehome, \
            trim(if(isnull(street),'-',if(street = '','',street))) as street, \
            trim(if(isnull(housenumber),'-',if(housenumber = '','',housenumber))) as housenumber, \
            trim(if(isnull(zip),'-',if(zip = '','',zip))) as zip, \
            trim(if(isnull(city),'-',if(city = '','',city))) as city, \
            trim(if(isnull(energy),'-',if(energy = '','',energy))) as energy, \
            trim(if(isnull(createdat),'-',if(createdat = '','',createdat))) as cratedate, \
            trim(if(isnull(marketlocation),'-',if(marketlocation = '','-',marketlocation))) as marketlocation, \
            trim(if(isnull(product),'-',if(product = '','-',product))) as product, \
            trim(if(isnull(id_nr),'-',if(id_nr = '','-',id_nr))) as id_nr, \
            trim(if(isnull(startdate),'-',if(startdate = '','-',startdate))) as startdate, \
            trim(if(isnull(baseprice),'-',if(baseprice = '','-',baseprice))) as baseprice, \
            trim(if(isnull(workingprice),'-',if(workingprice = '','-',workingprice))) as workingplace, \
            trim(if(isnull(productbonus),'-',if(productbonus = '','-',productbonus))) as productbonus, \
            trim(if(isnull(productinstantbonus),'-',if(productinstantbonus = '','-',productinstantbonus))) as productinstantbonus, \
            trim(if(isnull(adsmail),'-',if(adsmail = '','-',adsmail))) as adsmail, \
            trim(if(isnull(adsphone),'-',if(adsphone = '','',adsphone))) as adsphone, \
            trim(if(isnull(adspost),'-',if(adspost = '','',adspost))) as adspost, \
            trim(if(isnull('usage'),'-',if('usage' = '','','usage'))) as adsage, \
            trim(if(isnull(enddate),'-',if(enddate = '','',enddate))) as enddate, \
            trim(if(isnull(iban),'-',if(iban = '','',iban))) as iban, \
            trim(if(isnull(bic),'-',if(bic = '','',bic))) as bic, \
            trim(if(isnull(bank),'-',if(bank = '','',bank))) as bank, \
            trim(if(isnull(counternumber),'-',if(counternumber = '','',counternumber))) as counternumber, \
            trim(if(isnull(vertrag),'-',if(vertrag = '','',vertrag))) as vertrag, \
            trim(if(isnull(grossamount),'-',if(grossamount = '','',grossamount))) as grossamount \
        from ${addressdatatable} \
        join calldatatable on calldatatable.addressdata_id = ${addressdatatable}.id \
        where calldatatable.id = ${calldatatableId} LIMIT 1
    `;
    
    let SQLdataset = executeSql(query);
    debug && console.log(query);
    addressdatatableId = SQLdataset[0].rows[0].columns[0];
    SqlField = SQLdataset[0].rows[0].fields;
    return SqlField;                           
};

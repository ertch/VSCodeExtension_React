/**                                                                   QUERY LIBRARY
* 
* Die query-lib sellt die verschiedenen querys für die Kampagnen zur Verfügung. Diese werden mit der "Costumer-cells"-Component ausgewählt
* und über das JS in die CustomerInfo geladen. Hierbei ist es wichtig immer die gleichen Bezeichner zu nutzen, damit die Funktion greift.
* 
*  Liste der zugewiesenen Information + Position 
*    
*       customerid:             [1]
*       vorname:                [2]
*       nachname:               [3]
*       geb_datum:              [4]
*       email:                  [5]
*       tel_mobile_vorwahl:     [6]
*       tel_mobile:             [7]
*       tel_home_vorwahl:       [8]
*       tel_home:               [9]
*       strasse:                [10]
*       haus_nr:                [11]
*       plz:                    [12]
*       ort:                    [13]
*       energie:                [14]
*       erstell_dat:            [15]
*       marktgebiet:            [16]
*       produkt:                [17]
*       id_nr:                  [18]
*       startdatum:             [19]
*       grundpreis:             [20]
*       arbeitspreis:           [21]
*       produkt_bonus:          [22]
*       produkt_sofortbonus:    [23]
*       ads_mail:               [24]
*       ads_phone:              [25]
*       ads_post:               [26]
*       usage:                  [27]
*       end_dat:                [28]
*       iban:                   [29]
*       bic:                    [30]
*       bank:                   [31]
*       zaehler_nr:             [32]
*       vertragsnr:             [33]
*       abschlag:               [34]
* 
*/
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function STE_OUT_1() {
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
        where calldatatable.id = ${calldatatableId} limit 1
    `;

    const formattedAddressData = createAddressDataArray(executeSql(query));
    return formattedAddressData
};

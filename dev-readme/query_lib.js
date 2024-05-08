/**                                                                   QUERY LIBRARY
* 
* Die query-lib sellt die verschiedenen querys für die Kampagnen zur Verfügung. Diese werden mit der "Costumer-cells"-Component ausgewählt
* und über das JS in die CustomerInfo geladen. Hierbei ist es wichtig immer die gleichen Bezeichner zu nutzen, damit die Funktion greift.
* 
*  Liste der bekannten Einträge + Position 
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

const STE_OUT = `
    SELECT
        ${addressdatatable}.id AS addressdataid,
        TRIM(COALESCE(customerid, '-')) AS customerid,
        TRIM(COALESCE(firstname, '-')) AS firstname,
        TRIM(COALESCE(surname, '-')) AS surname,
        TRIM(COALESCE(dateofbirth, '-')) AS dateofbirth,
        TRIM(COALESCE(emailprivate, '-')) AS emailprivate,
        TRIM(COALESCE(phonemobileareacode, '-')) AS phonemobileareacode,
        TRIM(COALESCE(phonemobile, '-')) AS phonemobile,
        TRIM(COALESCE(phonehomeareacode, '-')) AS phonehomeareacode,
        TRIM(COALESCE(phonehome, '-')) AS phonehome,
        TRIM(COALESCE(street, '-')) AS street,
        TRIM(COALESCE(housenumber, '-')) AS housenumber,
        TRIM(COALESCE(zip, '-')) AS zip,
        TRIM(COALESCE(city, '-')) AS city,
        TRIM(COALESCE(energy, '-')) AS energy,
        TRIM(COALESCE(createdat, '-')) AS createdat,
        TRIM(COALESCE(marketlocation, '-')) AS marketlocation,
        TRIM(COALESCE(product, '-')) AS product,
        TRIM(COALESCE(id_nr, '-')) AS id_nr,
        TRIM(COALESCE(startdate, '-')) AS startdate,
        TRIM(COALESCE(baseprice, '-')) AS baseprice,
        TRIM(COALESCE(workingprice, '-')) AS workingprice,
        TRIM(COALESCE(productbonus, '-')) AS productbonus,
        TRIM(COALESCE(productinstantbonus, '-')) AS productinstantbonus,
        TRIM(COALESCE(adsmail, '-')) AS adsmail,
        TRIM(COALESCE(adsphone, '-')) AS adsphone,
        TRIM(COALESCE(adspost, '-')) AS adspost,
        TRIM(COALESCE(usage, '-')) AS usage,
        TRIM(COALESCE(enddate, '-')) AS enddate,
        TRIM(COALESCE(iban, '-')) AS iban,
        TRIM(COALESCE(bic, '-')) AS bic,
        TRIM(COALESCE(bank, '-')) AS bank,
        TRIM(COALESCE(counternumber, '-')) AS counternumber,
        TRIM(COALESCE(vertrag, '-')) AS vertrag,
        TRIM(COALESCE(grossamount, '-')) AS grossamount
    FROM ${addressdatatable}
    JOIN calldatatable ON calldatatable.addressdata_id = ${addressdatatable}.id
    WHERE calldatatable.id = ${calldatatableId}
    LIMIT 1`;

const formattedAddressData = createAddressDataArray(executeSql(query));

function createAddressDataArray(queryResult) {
    try {
        const addressDataArray = queryResult[0].rows.map(row => {
            const rowData = {};
            row.columns.forEach((value, index ) => {
                rowData[index] = value.trim() ?? '-';
            });
            return rowData;
        });
        return addressDataArray;
    } catch (error) {
        console.log("Error: createAddressDataArray => SQL-Ergebnisse konnten nicht in Array geladen werden");
        console.log(error);
        return []; 
    }
}
 /**                                                            Provider - Pattern    
 *     
 *      Diese Funktionen definieren die Kundeninformationen, die für die Generierung von CustomerCells verwendet werden sollen.
 *      Wenn keine benutzerdefinierten Provider-Pattern und SQL-Abfragen angegeben sind, wird die providerDefault() verwendet.
 *      Die generierten Zellen werden in Zweierreihen angeordnet und mit den entsprechenden Daten aus der Datenbank gefüllt.
 *      Die "match"-Attribute müssen exakt mit den Bezeichnern in der Datenbank übereinstimmen, um die richtigen Daten zu erhalten.
 *      Ein Tippfehler hier könnte zu Fehlern in den generierten Zellen führen.
 *  
 *      label:  Dieser Key beschreibt den, für den User im Cell_Head sichtbaren, String und wird für die Suche innerhalb der Daten nicht berücksichtigt.      
 *              
 *      match:  Der Wert des match-Keys ist sowohl Schlagwort für die Suche innerhalb der Daten, die von der DB kommen, als auch id der Cell-Value.
 * 
 *      value:  Hier werden die Daten aus der DB gespeichert und dann für den User im "Cell_Value" sichtbar.
 * 
 *      standAlone: Der standAlone-Key wird verwendet, um zu kennzeichnen, ob ein bestimmter Wert als eigene Cell angezeigt wird ist oder nicht. 
 *                  Wenn standAlone auf true gesetzt ist, wird das entsprechende Element allein in einer Cell angezeigt. 
 *                  Andernfalls wird es zusammen mit dem nächsten standAlone = true Element in dessen Cell geschieben.
 *                  Es ist sozusagen ein Copy/Paste für die Werte. Aber Achtung: zwei standAlone hintereinadner überschreiben sich.
 * 
 * 
 *                  Der Aufbau eines HTML-Elements ist wie folgt:
 *                      <div>           
 *                          <div class="cell_head"> 'label' </div>      
 *                          <div class="cell_value" id = 'match'> 'value' </div>   
 *                      </div>
 */

    function providerDefault() { // Der Name der gewünschten Funktion wird im CustumerCells HTML-Element unter provider ="" eingetragen.
        let CustomerData = [
            {label: 'Vorname',          match: 'firstname',             value: "",   standAlone: true   },
            {label: 'Nachname',         match: 'surname',               value: "",   standAlone: true   },
            {label: 'Geb.-Datum',       match: 'dateofbirth',           value: "",   standAlone: true   },
            {label: 'E-Mail',           match: 'emailprivate',          value: "",   standAlone: true   },
            {label: '',                 match: 'seperator',             value: "",   standAlone: true   },
            {label: 'Kundennummer',     match: 'customerid',            value: "",   standAlone: true   },
            {label: 'Vertragsnummer',   match: 'vertrag',               value: "",   standAlone: true   },
            {label: 'Vorwahl',          match: 'phonehomeareacode',     value: "",   standAlone: false  },
            {label: 'Festnetz',         match: 'phonehome',             value: "",   standAlone: true   },
            {label: 'Mobilvorwahl',     match: 'phonemobileareacode',   value: "",   standAlone: false  },
            {label: 'Mobil',            match: 'phonemobile',           value: "",   standAlone: true   },
            {label: '',                 match: 'seperator',             value: "",   standAlone: true   },
            {label: 'Strasse',          match: 'street',                value: "",   standAlone: true   },
            {label: 'Hausnummer',       match: 'housenumber',           value: "",   standAlone: true   },
            {label: 'PLZ',              match: 'zip',                   value: "",   standAlone: true   },
            {label: 'Ort',              match: 'city',                  value: "",   standAlone: true   }, 
        ];
        return CustomerData // es ist zwingend erfoderlich das Array zurück zu geben
    };

    function preFillEntrys() {
        let emailTextbox = document.getElementById

    }


/** ##########################################################################################################################################################################
 *  +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ STADTENDERGIE ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 *  ##########################################################################################################################################################################
 */

    function STE_WEL() {
        let CustomerData = [
            { label: 'Vorname',         match: 'firstname',             value: "",   standAlone: true   },
            { label: 'Nachname',        match: 'surname',               value: "",   standAlone: true   },
            { label: 'Geb.-Datum',      match: 'dateofbirth',           value: "",   standAlone: true   },
            { label: 'E-Mail',          match: 'emailprivate',          value: "",   standAlone: true   },
            { label: '',                match: 'seperator',             value: "",   standAlone: true   },
            { label: 'Kundennummer',    match: 'customerid',            value: "",   standAlone: true   },
            { label: 'Vertragsnummer',  match: 'vertrag',               value: "",   standAlone: true   },
            { label: 'Zählernummer',    match: 'counternumber',         value: "",   standAlone: true   },
            { label: 'Vorwahl',         match: 'phonehomeareacode',     value: "",   standAlone: false  },
            { label: 'Festnetz',        match: 'phonehome',             value: "",   standAlone: true   },
            { label: 'Mobilvorwahl',    match: 'phonemobileareacode',   value: "",   standAlone: false  },
            { label: 'Mobil',           match: 'phonemobile',           value: "",   standAlone: true   },
            { label: '',                match: 'seperator',             value: "",   standAlone: true   },
            { label: 'Strasse',         match: 'street',                value: "",   standAlone: true   },
            { label: 'Hausnummer',      match: 'housenumber',           value: "",   standAlone: true   },
            { label: 'PLZ',             match: 'zip',                   value: "",   standAlone: true   },
            { label: 'Ort',             match: 'city',                  value: "",   standAlone: true   },
            { label: 'Produkt',         match: 'product',               value: "",   standAlone: true   },
            { label: 'Startdatum',      match: 'startdate',             value: "",   standAlone: true   },
            { label: 'Lieferbeginn',    match: 'cratedate',             value: "",   standAlone: true   },
            { label: 'Datensatz',       match: '',                      value: "",   standAlone: true   },
        ];
        return CustomerData
    };

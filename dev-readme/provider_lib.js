 /**        Hier wird bestimmt welche CustomerCells generiert werden. Sie werden von oben nach unten in Zweierreihen
 *          entsprechend der Liste und den Schlägwörtern (match) aufgegliedert. 
 *          Der Value bleibt Leer, da dieser dann aus der DB befüllt wird. Deswegen muss "match" auch den selben
 *          Bezeichner tragen, wie die Datenbank. Hier kann ein Tippfehler gefährlich sein - Also doppelt prüfen.
 *          
 * 
 *  
 *          Der Aufbau eines HTML-Elements ist wie folgt:
 *              <div>    
 *                  <div> 'label' </div>      
 *                  <div id = 'match'> 'value' </div>   
 *              </div>
 */

    function providerDefault() {
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
        return CustomerData
    };

/** ##########################################################################################################################################################################
 *  +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ STADTENDERGIE ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 *  ##########################################################################################################################################################################
 */

    function STE_WEL() {
        let CustomerData = [
            { label: 'Vorname',         match: 'Vorname',          value: "",   standAlone: true   },
            { label: 'Nachname',        match: 'Nachname',         value: "",   standAlone: true   },
            { label: 'Geb.-Datum',      match: 'Geb.-Datum',       value: "",   standAlone: true   },
            { label: 'E-Mail',          match: 'E-Mail',           value: "",   standAlone: true   },
            { label: '',                match: 'seperator',        value: "",   standAlone: true   },
            { label: 'Kundennummer',    match: 'Kundennummer',     value: "",   standAlone: true   },
            { label: 'Vertragsnummer',  match: 'Vertragsnummer',   value: "",   standAlone: true   },
            { label: 'Zählernummer',    match: 'Zählernummer',     value: "",   standAlone: true   },
            { label: 'Festnetz',        match: 'Festnetz',         value: "",   standAlone: true   },
            { label: 'Mobil',           match: 'Mobil',            value: "",   standAlone: true   },
            { label: '',                match: 'seperator',        value: "",   standAlone: true   },
            { label: 'Strasse',         match: 'Strasse',          value: "",   standAlone: true   },
            { label: 'Hausnummer',      match: 'Hausnummer',       value: "",   standAlone: true   },
            { label: 'PLZ',             match: 'PLZ',              value: "",   standAlone: true   },
            { label: 'Ort',             match: 'Ort',              value: "",   standAlone: true   },
            { label: 'Produkt',         match: 'Produkt',          value: "",   standAlone: true   },
            { label: 'Startdatum',      match: 'Startdatum',       value: "",   standAlone: true   },
            { label: 'Lieferbeginn',    match: 'Lieferbeginn',     value: "",   standAlone: true   },
            { label: 'Datensatz',       match: 'Dataset',          value: "",   standAlone: true   },
        ];
        return CustomerData
    };

function gatekeeper(incomming) { 
        
    let callingElement;
    let gateArr;
    let switchGrp; 
    let nextFunc; // alwaysClose bool
    
    // Prüfen, ob incomming ein Array, ein Element oder eine ID ist
    if (Array.isArray(incomming)) {
        // Wenn incomming ein Array ist, die relevanten Werte zuweisen
        [callingElement, switchGrp, nextFunc] = [
            document.getElementById(incomming[0][0]),
            document.querySelectorAll(`[data-group=${incomming[0][1]}]`),
            incomming[0][2]
        ];
    } else {
        // Wenn incomming ein String (Id) ist get callingElement und die Anweisungen aus dem Datenattribut parsen und zuweisen
        incomming instanceof HTMLElement? callingElement=incomming : callingElement=document.getElementById(incomming);
        gateArr = callingElement.getAttribute("data-array")
                                .replace(/\boo\b/g, 'openOnly')
                                .replace(/\bsv\b/g, 'setValue')
                                .replace(/\bo\b/g, 'open') 
                                .replace(/\bc\b/g, 'close') 
                                .replace(/\ba\b/g, 'all')   
                                .replace(/\bt\b/g, 'trigger')
                                .replace(/\bd\b/g, 'disable')
                                .replace(/\be\b/g, 'enable')
                                .replace(/\.+/g, ',')
                                .replace(/([^,\[\]]+)/g, '"$1"'); 
        gateArr = stringToArray(gateArr);
                                        //      Mit dem was an die Funtion übereben wird, wird ein Array aufgebaut, 
        [switchGrp, nextFunc] = [//     welches alle Anweisungen für die Zustände des jeweilige callingElement enthält.
            document.querySelectorAll(`[data-grp=${callingElement.getAttribute("data-group")}]`),
            callingElement.getAttribute("data-call")
        ];
    }   
    let logOperations = "";
    // Durchlaufen der Anweisungen im gateArr
    gateArr.forEach(operation => {
        let [value, action, target] = operation; 

        let inputDefault=false; // teste auf Default-Option
        if(value === "default"){
            inputDefault=true;  // Ein ein SuggestionInput = "default" prüfe ob ein anderer triggerWert zutrifft
            DataListChild = document.getElementById(`${callingElement.id}List`).querySelectorAll('option');
            DataListChild.forEach( options => {
                options.value==callingElement.value? inputDefault=false : undefined;
            }) 
        };

        // Überprüfen, ob die aktuelle callingElement-Option mit dem Wert übereinstimmt oder InputDefault true ist
        if (value === callingElement.value || inputDefault ) {
            try {                   // <<<>>> Auftrag für aktuelle callingElement.value ausführen
                (Array.isArray(action) ? action : [action]).forEach(operator => {
                    
                    if (operator === 'openOnly') {  // wenn openOnly oder alwaysClose --> Gruppe = d-none
                        switchGrp.forEach(element => {
                            element.classList.add('d-none'); 
                        });
                    } else if (target === 'all') {        // wenn all --> target = Gruppe
                        switchGrp.forEach(element => action==='open' ? element.classList.remove('d-none') : element.classList.add('d-none'));
                    };
                    
                    let setValOp; // hole wert aus setValue
                    if(operator.includes("setValue")) {
                        prefix = operator.split('{')[1];
                        setValOp = prefix.replace(/}/,"");
                        operator = operator.split('{')[0];
                    }
                                    // Ausführen der entsprechenden Aktion (öffnen oder schließen) für jedes Ziel
                    switch (operator) {
                        case 'close':
                            (Array.isArray(target) ? target : [target]).forEach(id => {
                                target==="all"? undefined : document.getElementById(id).classList.add('d-none');
                            });
                            break;
                    
                        case 'open':
                        case 'openOnly':
                            (Array.isArray(target) ? target : [target]).forEach(id => {
                                target==="all"? undefined : document.getElementById(id).classList.remove('d-none');
                            });
                            break;
                        
                        case "trigger": // setzte Trigger für übergebene id auf true 
                            (Array.isArray(target) ? target : [target]).forEach(id => {
                                setTrigger(id);
                            });
                            break;
                        
                        case "disable": // setzte Trigger für übergebene id auf true 
                            (Array.isArray(target) ? target : [target]).forEach(id => {
                                document.getElementById(id).setAttribute('disabled','');
                            });
                        break;

                        case "enable": // setzte Trigger für übergebene id auf true 
                            (Array.isArray(target) ? target : [target]).forEach(id => {
                                document.getElementById(id).removeAttribute('disabled');
                            });
                        break;

                        case "setValue": // setzte Trigger für übergebene id auf true 
                            (Array.isArray(target) ? target : [target]).forEach(id => {
                                document.getElementById(id).value = setValOp;
                            });
                        break;
                    
                        default:
                            // Fehlermeldung ausgeben, wenn die Aktion nicht erkannt wird
                            logOperations += `<I class='txt--bigRed'>Error:</I> gatekeeper hat fehlerhafte action: ${operator} in ${gateArr.id} <br>`
                    }
                    logOperations += ` --> <span class="txt--blue">${operator}</span> <span class="txt--orange">${target}</span><br>`
                }) 
                // Ausführen der Folgefunktion, falls vorhanden
                nextFunc!=null? executeFunctionFromString(nextFunc) : undefined;

                let gateCheck = callingElement.getAttribute("data-gate");
                if (gateCheck != "") {showWeiterBtn(gateCheck)};

                let lock = callingElement.getAttribute("data-lock");
                if (lock === "lock") {pageLock = true};

            } catch (error) {
                // Fehlermeldung ausgeben
            logIntoDebug(callingElement.id,`Error: Gatekeeper wurde fehlerhaft ausgeführt!<br> ${error.stack}`, false);
            }; 
        };
    });
    console.log("isVali = " + isValidating)
    logGK? logIntoDebug(`GK <span class="txt--bigOrange">${callingElement.id}</span> = <I class="txt--gray">"${callingElement.value}"</I> `,logOperations, LogIntottDB) : undefined;
};
// optionaler Gatekeeperaufruf für SuggestionInputs
function triggerDatalist(id, gatekeeperCall) {
if(gatekeeperCall>""){
    gatekeeper(document.getElementById(id));
}
};
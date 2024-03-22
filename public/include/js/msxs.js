/*document.observe("dom:loaded", function() {
    $('a').observe('click', beginLead);
});*/

function beginLead(event,campaign,fkto) {
    Event.stop(event);

    new Ajax.Request('http://dtag.skon.local/msxs/telekom_msxs.php', {
        contentType:'application/json',
        postBody: Object.toJSON(
            {
                method: 'process_begin',
                campaign: campaign,
                fn_fkto: fkto
            }
        ),
        onSuccess: function(transport) {
        },
        onFailure: function() { alert('Something went wrong...'); }
    });
}

function endLead(event,campaign, fkto, terminate) {
	var status = 2;
	if (terminate == '100') status = 1;
	else if (terminate == '200') status = 2;
	else if (terminate == '300') status = 3;
	
	
    Event.stop(event);

    new Ajax.Request('http://dtag.skon.local/msxs/telekom_msxs.php', {
        contentType:'application/json',
        postBody: Object.toJSON(
            {
                method: 'process_end',
                campaign: campaign,
                fn_fkto: fkto,
                agency_status: status
            }
        ),
        onSuccess: function(transport) {
        },
        onFailure: function() { alert('Something went wrong...'); }
    });
}

function ciRegister(event,campaign, fkto, competitor, type, binding, tariff) {
    Event.stop(event);

    new Ajax.Request('http://dtag.skon.local/msxs/telekom_msxs.php', {
        contentType:'application/json',
        postBody: Object.toJSON(
            {
                method: 'ci_register',
                campaign: campaign,
                fn_fkto: fkto,
                ci_mf_competitor: competitor,
                ci_mf_contract_type: type,
                ci_mf_binding: binding,
                ci_mf_tariff: tariff

            }
        ),
        onSuccess: function(transport) {
        },
        onFailure: function() { alert('Something went wrong...'); }
    });
}

function otvBegin(event) {
    Event.stop(event);

    new Ajax.Request('http://dtag.skon.local/msxs/telekom_msxs.php', {
        contentType:'application/json',
        postBody: Object.toJSON(
            {
                method: 'otv_begin',
                campaign: 1,
                fn_fkto: 1234
            }
        ),
        onSuccess: function(transport) {
        },
        onFailure: function() { alert('Something went wrong...'); }
    });
}

function awBegin(event,campaign, fkto, produkt, msisdn, email) {
    Event.stop(event);

    new Ajax.Request('http://dtag.skon.local/msxs/telekom_msxs.php', {
        contentType:'application/json',
        postBody: Object.toJSON(
            {
                method: 'aw_begin',
                campaign: campaign,
                fn_fkto: fkto,
                aw_prod: produkt,
                aw_rrnr: msisdn,
                aw_email: email,
                aw_comment: '' // Optional, kann weggelassen werden
            }
        ),
        onSuccess: function(transport) {
        },
        onFailure: function() { alert('Something went wrong...'); }
    });
}
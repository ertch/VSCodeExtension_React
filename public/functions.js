	jQuery( document ).ready(function( $ ) {
		$( function() {

       $('#lead_vertragsende').datepicker({
                prevText: '&#x3c;zur&uuml;ck', prevStatus: '',
                prevJumpText: '&#x3c;&#x3c;', prevJumpStatus: '',
                nextText: 'Vor&#x3e;', nextStatus: '',
                nextJumpText: '&#x3e;&#x3e;', nextJumpStatus: '',
                currentText: 'heute', currentStatus: '',
                todayText: 'heute', todayStatus: '',
                clearText: '-', clearStatus: '',
                closeText: 'schlie&szlig;en', closeStatus: '',
                monthNames: ['Januar','Februar','M&auml;rz','April','Mai','Juni',
                    'Juli','August','September','Oktober','November','Dezember'],
                monthNamesShort: ['Jan','Feb','M&auml;r','Apr','Mai','Jun',
                    'Jul','Aug','Sep','Okt','Nov','Dez'],
                dayNames: ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],
                dayNamesShort: ['So','Mo','Di','Mi','Do','Fr','Sa'],
                dayNamesMin: ['So','Mo','Di','Mi','Do','Fr','Sa'],
                showMonthAfterYear: false,
                showOn: 'both',
           		buttonImage: '../include_skon/jquery/images/calendar.png',
           		buttonImageOnly: true,
                dateFormat:'dd.mm.yy',
                changeMonth: true,
                changeYear: true
            }
        );
    });

        $( function() {
            $('#klp_vertragsende').datepicker({
                    prevText: '&#x3c;zur&uuml;ck', prevStatus: '',
                    prevJumpText: '&#x3c;&#x3c;', prevJumpStatus: '',
                    nextText: 'Vor&#x3e;', nextStatus: '',
                    nextJumpText: '&#x3e;&#x3e;', nextJumpStatus: '',
                    currentText: 'heute', currentStatus: '',
                    todayText: 'heute', todayStatus: '',
                    clearText: '-', clearStatus: '',
                    closeText: 'schlie&szlig;en', closeStatus: '',
                    monthNames: ['Januar','Februar','M&auml;rz','April','Mai','Juni',
                        'Juli','August','September','Oktober','November','Dezember'],
                    monthNamesShort: ['Jan','Feb','M&auml;r','Apr','Mai','Jun',
                        'Jul','Aug','Sep','Okt','Nov','Dez'],
                    dayNames: ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],
                    dayNamesShort: ['So','Mo','Di','Mi','Do','Fr','Sa'],
                    dayNamesMin: ['So','Mo','Di','Mi','Do','Fr','Sa'],
                    showMonthAfterYear: false,
                    showOn: 'both',
                	buttonImage: '../include_skon/jquery/images/calendar.png',
                    buttonImageOnly: true,
                    dateFormat:'dd.mm.yy',
                    changeMonth: true,
                    changeYear: true
                }
            );


        });

        $('#my-select').multiSelect()

	});
	

  
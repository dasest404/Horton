(function($,w,undefined) {
    if (w.horton == undefined || w.horton == null)
	$.error('Horton: Please make sure horton.js is loaded before this script.');

    //
    // Show all rows again.
    //
    function showRows($table) {
        $table.find('>tbody:first>tr:not(.horton-details)').each(function(){
            var $r = $(this);
            //
            // Show the row and if its details row was open, make sure
            // it becomes visible too.
            //
            $r.show();
            if ($r.hasClass(opts.classes.expanded))
                $r.next().show();
        });
    }

    //
    // Perform the search.
    //
    function hortonFilter(term,caseSensitive,html,regex) {
        var $table = $(this),
        opts = $table.data('horton'),
        caseSensitive = caseSensitive || opts.filterCaseSensitive,
        html = html || opts.filterHTML,
	regex = regex || opts.filterRegex,
	found = false;

        if (term == undefined)
            term = $(opts.filterSelector).val();
        else if (term.length == 0)
            $(opts.filterSelector).val('');

        opts.filterTimer = null;

        //
        // If we don't have enough keystrokes, make sure everything is
        // visible.
        //
        if (term.length < opts.filterMinKeys) {
            showRows($table);
            return found;
        }

        //
        // Construct a regular expression from the term.
        //
	var re = (regex) ?
	    new RegExp(term,caseSensitive?"":"i") :
	    new RegExp(term.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&"),
		       caseSensitive?"":"i"),
        hidden = false,
        $rows = $table.find('>tbody:first>tr:not(.horton-details)');

	$rows.each(function(){
            var $r = $(this),
            t = (!html) ?
		$r.find('td[data-filter-ignore!="true"]').text() :
		$r.find('td[data-filter-ignore!="true"]').html();

            if ($r.data('filter-ignore') || t.search(re) > -1) {
                if (!hidden) {
                    //
                    // Only hide everything if at least one match is found.
                    //
                    hidden = true;
                    $rows.hide();
                    $table.find('>tbody:first>tr.horton-details').hide();
                }
		found = true;
                $r.show();
                if ($r.hasClass(opts.classes.expanded))
                    $r.next().show();
            }
        });
	return found;
    }

    function filterKey(event) {
        var $table = event.data,
        opts = $table.data('horton');

        //
        // Start the timer so multiple keystrokes are collected before a
        // search is done.
        //
        if (opts.filterTimer)
            clearTimeout(opts.filterTimer);

        //
        // Check to see if the filter is being cancelled with the ESC key.
        //
        if (event.which == 27) {
            //
            // Clear the filter text field and show all rows that were hidden
            // during the filter.
            //
            $(opts.filterSelector).val('');
            showRows($table);
            return;
        }

        opts.filterTimer = setTimeout(function(){hortonFilter.apply($table);},
                                      opts.filterDelay);
    }
    function hortonFilterInit($table,opts) {
        var $in = null;

        if (opts.filterSelector)
            $in = $(opts.filterSelector);

        if ($in) {
            //
            // Remove the 'keyup' event handler.
            //
            $in.off('keyup.horton');
            if (opts.filter)
                $in.on('keyup.horton',$table, filterKey);
        }
    }

    var filter = {
        name: 'Horton Filter Plugin',
        version: {major: 0, minor: 2},
        init: hortonFilterInit,
	methods: {
            'filter': hortonFilter
	}
    };
    var defaults = {
        filter: true,
        filterSelector: '.horton-filter',
        filterDelay: 300,
        filterMinKeys: 2,
	filterCaseSensitive: false,
        filterHTML: false,
	filterRegex: false,
        //
        // Internal data.
        //
        filterTimer: null
    };

    w.horton.plugins.register(w,filter,defaults);
})(jQuery,window);

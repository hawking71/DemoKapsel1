/* global sap */
/* global alert */
/* global jQuery */
/* global $ */

(function() {
    "use strict";
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchHelper');
    var searchHelper = sap.ushell.renderers.fiori2.search.SearchHelper;

    sap.m.Text.extend('sap.ushell.renderers.fiori2.search.controls.SearchText', {

        renderer: 'sap.m.TextRenderer',
        onAfterRendering: function() {
            var d = this.getDomRef();

            // recover bold tag with the help of text() in a safe way
            searchHelper.boldTagUnescaperByText(d);

            //emphasize whyfound in case of ellipsis
            searchHelper.forwardEllipsis4Whyfound(d);
        }

    });

})();

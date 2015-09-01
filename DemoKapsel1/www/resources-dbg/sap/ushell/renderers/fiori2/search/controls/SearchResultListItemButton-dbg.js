// iteration 0: ok
/* global sap */

(function() {
    "use strict";

    sap.ui.core.Control.extend("sap.ushell.renderers.fiori2.search.controls.SearchResultListItemButton", {

        metadata: {
            properties: {
                status: "string", // closed (default) or open
            },
            events: {
                press: {}
            }
        },

        renderer: function(oRm, oControl) {

            /// outer div
            oRm.write('<a href="javascript:void(0);"');
            oRm.writeControlData(oControl);
            oRm.addClass("searchResultListItemButton");
            oRm.writeClasses();
            oRm.write(">");

            // icon
            var buttonIcon;
            if (oControl.getStatus() === "open") {
                buttonIcon = new sap.ui.core.Icon({
                    src: sap.ui.core.IconPool.getIconURI("slim-arrow-up")
                });
            } else {
                buttonIcon = new sap.ui.core.Icon({
                    src: sap.ui.core.IconPool.getIconURI("slim-arrow-down")
                });
            }
            oRm.renderControl(buttonIcon);


            // outer div
            oRm.write("</a>");
        },

        onclick: function(evt) {
            this.firePress();
        }
    });

})();

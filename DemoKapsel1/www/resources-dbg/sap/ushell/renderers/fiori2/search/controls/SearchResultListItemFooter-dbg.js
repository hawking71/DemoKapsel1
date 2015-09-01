// iteration 0: ok
/* global sap,$ */

(function() {
    "use strict";

    sap.ui.core.Control.extend("sap.ushell.renderers.fiori2.search.controls.SearchResultListItemFooter", {

        metadata: {
            properties: {
                showSpinner: {
                    type: "boolean",
                    defaultValue: false
                },
                text: "string"
            },
            aggregations: {
                content: {
                    singularName: "content"
                }
            },
            events: {
                showMore: {}
            }
        },


        renderer: function(oRm, oControl) {

            var footertext = new sap.m.Link({
                text: oControl.getText(),
                tooltip: oControl.getText()
            });
            footertext.addStyleClass('resultListMoreFooter');

            var dotted = new sap.ui.core.Icon({
                src: sap.ui.core.IconPool.getIconURI("sys-overflow")
            });

            this.busy = new sap.m.BusyIndicator({
                size: "22px"
            });
            this.busy.addStyleClass('resultListBusyFooter');
            if (oControl.getShowSpinner() === false) {
                this.busy.addStyleClass('hidden');
            }

            oRm.write("<div");
            oRm.writeAttribute("tabindex", "-1");
            oRm.writeControlData(oControl);
            oRm.addClass("resultListFooterContainer");
            oRm.writeClasses();
            oRm.write(">");

            oRm.write("<div class='resultListFooterContent'>");
            oRm.renderControl(dotted);
            oRm.renderControl(footertext);
            oRm.renderControl(this.busy);
            oRm.write("</div>");

            oRm.write("</div>");
        },

        onAfterRendering: function(oRm, oControl) {
            var self = this;
            var $item = $(this.getDomRef());
            $item.click(function() {
                //self.setShowSpinner(true);
                self.fireShowMore();
                $item.off('click'); // Prevent multiple more clicks
            });
        }

    });

})();

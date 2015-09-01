/* global jQuery, sap, window, console */
(function() {
    "use strict";

    jQuery.sap.require('sap.ushell.renderers.fiori2.search.controls.SearchInput');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.controls.SearchButton');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.controls.SearchSelect');

    sap.ui.core.Control.extend("sap.ushell.renderers.fiori2.search.controls.SearchFieldGroup", {

        metadata: {
            properties: {
                "selectActive": {
                    defaultValue: true,
                    type: "boolean"
                },
                "inputActive": {
                    defaultValue: true,
                    type: "boolean"
                },
                "buttonActive": {
                    defaultValue: true,
                    type: "boolean"
                }
            },
            aggregations: {
                "select": {
                    type: "sap.ui.core.Control",
                    multiple: false
                },
                "input": {
                    type: "sap.ui.core.Control",
                    multiple: false
                },
                "button": {
                    type: "sap.ui.core.Control",
                    multiple: false
                }
            }
        },


        init: function() {
            var self = this;

            self.initSelect();
            self.initInput();
            self.initButton();
        },


        initSelect: function() {
            var self = this;

            var select = new sap.ushell.renderers.fiori2.search.controls.SearchSelect();
            select.attachChange(function() {
                if (self.getAggregation("input")) {
                    var input = self.getAggregation("input");
                    input.focus();
                    input.destroySuggestionRows(); // to be doubly sure to close the suggestion
                }
            });
            self.setAggregation("select", select);
        },


        initInput: function() {
            var self = this;

            var input = new sap.ushell.renderers.fiori2.search.controls.SearchInput(self.getId() + '-input', {});
            self.setAggregation("input", input);
        },


        initButton: function() {
            var self = this;

            var button = new sap.ushell.renderers.fiori2.search.controls.SearchButton({
                press: function(oEvent) {
                    if (self.getAggregation("input")) {
                        var input = self.getAggregation("input");
                        input.destroySuggestionRows();
                        input.triggerSearch(oEvent);
                    }
                }
            });
            self.setAggregation("button", button);
        },


        renderer: function(oRm, oControl) {
            var self = this;

            oRm.write('<div');
            oRm.writeControlData(oControl);
            oRm.addClass("SearchFieldGroup");
            oRm.writeClasses();
            oRm.write('>');
            if (oControl.getSelectActive() === true) {
                oRm.renderControl(oControl.getAggregation("select"));
            }
            if (oControl.getInputActive() === true) {
                oRm.renderControl(oControl.getAggregation("input"));
            }
            if (oControl.getButtonActive() === true) {
                oRm.renderControl(oControl.getAggregation("button"));
            }
            oRm.write('</div>');
        },

        onAfterRendering: function() {

        }


    });

}());

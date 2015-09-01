/* global jQuery, sap, window */
(function() {
    "use strict";

    jQuery.sap.require('sap.m.List');
    jQuery.sap.require("sap.ushell.renderers.fiori2.search.controls.SearchFacetItem");

    sap.m.List.extend('sap.ushell.renderers.fiori2.search.controls.SearchFacet', {

        metadata: {
            properties: {
                role: {
                    defaultValue: "datasource" //"datasource" or "attribute"
                },
                hasMoreLink: {
                    type: "boolean",
                    defaultValue: false
                },
                detailText: "string"
            }
        },

        constructor: function(sId, options) {
            var self = this;
            options = jQuery.extend({}, {
                mode: sap.m.ListMode.SingleSelectMaster,
                showSeparators: sap.m.ListSeparators.None,
                selectionChange: function(event) {
                    var oSelectedItem = event.mParameters.listItem.getBindingContext().getObject();
                    if (oSelectedItem.selected) {
                        self.getModel().addFilterCondition(oSelectedItem);
                    } else {
                        self.getModel().removeFilterCondition(oSelectedItem);
                    }
                }
            }, options);
            sap.m.List.prototype.constructor.apply(this, [sId, options]);
            this.addStyleClass('searchFacet');
            this.addEventDelegate({
                onAfterRendering: function() {
                    if (self.getRole() === "datasource") {
                        jQuery(self.getDomRef()).append("<hr>");
                    }
                }
            });
        },

        renderer: 'sap.m.ListRenderer',

        setRole: function(role) {
            var items = {
                path: "items",
                template: new sap.ushell.renderers.fiori2.search.controls.SearchFacetItem(),
                groupHeaderFactory: function(oGroup) {
                    return new sap.m.GroupHeaderListItem({
                        title: oGroup.key,
                        upperCase: false
                    });
                },
            };
            switch (role.toLowerCase()) {
                case "datasource":
                    this.setMode(sap.m.ListMode.SingleSelectMaster);
                    this.setHeaderText("Search In");
                    break;
                case "attribute":
                    this.setMode(sap.m.ListMode.MultiSelect);
                    this.setHeaderText("");
                    items.sorter = new sap.ui.model.Sorter("facetTitle", false, true);
                    break;
            }
            this.bindAggregation("items", items);
            this.setProperty("role", role); // this validates and stores the new value
            return this; // return "this" to allow method chaining
        }

    });

})();

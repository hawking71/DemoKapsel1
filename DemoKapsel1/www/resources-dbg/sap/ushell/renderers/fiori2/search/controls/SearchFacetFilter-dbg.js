/* global sap */
/* global alert */
/* global jQuery */
/* global $ */

(function() {
    "use strict";
    jQuery.sap.require("sap.ushell.renderers.fiori2.search.controls.SearchFacet");

    sap.ui.core.Control.extend('sap.ushell.renderers.fiori2.search.controls.SearchFacetFilter', {

        metadata: {
            properties: {
                title: "string"
            },
            aggregations: {
                "lists": {
                    type: "sap.ui.core.Control",
                    multiple: true
                }
            }
        },

        constructor: function(oOptions) {
            var self = this;
            oOptions = jQuery.extend({}, {
                lists: { //TODO: rename to facets
                    path: "/facets",
                    template: new sap.ushell.renderers.fiori2.search.controls.SearchFacet()
                }
            }, oOptions);

            sap.ui.core.Control.prototype.constructor.apply(this, [oOptions]);
        },

        fireReset: function() {
            sap.m.FacetFilter.prototype.fireReset.apply(this, arguments);
            this.getModel().resetFilterConditions(false);
            this.getModel().setDataSource(this.getModel().allDataSource, true);
        },

        renderer: function(oRm, oControl) {
            // outer div
            oRm.write("<div");
            oRm.writeControlData(oControl);
            oRm.addClass("searchFacetFilter");
            oRm.writeClasses();
            oRm.write('>');

            for (var i = 0, len = oControl.getLists().length; i < len; i++) {
                var facet = oControl.getLists()[i];
                if (i === 0) {
                    facet.setRole("datasource");
                } else {
                    facet.setRole("attribute");
                    if (i === 1) {
                        facet.setHeaderText("Filter by");
                    }
                }
                oRm.renderControl(facet);
            }

            // close searchfacetfilter div
            oRm.write("</div>");
        },

        onAfterRendering: function() {
            // add aria button role to atasource items
            //$('.searchFacetFilter .searchFacet').first().find('.searchFacetItem').attr('role', 'button');
            var $dataSource = $('.searchFacetFilter .searchFacet').first().find('ul');
            var $dataSourceItems = $dataSource.find('li');
            $dataSource.attr('role', 'tree');
            $dataSourceItems.attr('role', 'treeitem');
        }

    });

})();

/* global jQuery, sap, window */
(function() {
    "use strict";

    jQuery.sap.require('sap.m.StandardListItem');

    sap.m.StandardListItem.extend('sap.ushell.renderers.fiori2.search.controls.SearchFacetItem', {

        constructor: function(sId, options) {
            var self = this;
            self.options = jQuery.extend({}, {
                title: "{label}",
                tooltip: "{label}",
                key: "{id}",
                counter: "{value}",
                selected: "{selected}",
                level: "{level}"
            }, options);
            sap.m.StandardListItem.prototype.constructor.apply(this, [sId, self.options]);
            this.addStyleClass('searchFacetItem');
            this.addEventDelegate({
                onAfterRendering: function() {
                    if (self.getBindingContext() && self.getBindingContext().getObject()) {
                        var level = self.getBindingContext().getObject().level;
                        if (jQuery("html").attr("dir") === 'rtl') {
                            jQuery(self.getDomRef()).children(".sapMLIBContent").css("padding-right", level + "rem");
                        } else {
                            jQuery(self.getDomRef()).children(".sapMLIBContent").css("padding-left", level + "rem");
                        }
                    }
                }
            });
        },



        renderer: 'sap.m.StandardListItemRenderer'
    });
})();

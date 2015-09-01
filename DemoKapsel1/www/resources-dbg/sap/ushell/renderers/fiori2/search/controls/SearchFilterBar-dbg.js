/* global jQuery, sap, window, console */
(function() {
    "use strict";

    jQuery.sap.require('sap.m.Toolbar');

    sap.m.Toolbar.extend("sap.ushell.renderers.fiori2.search.controls.SearchFilterBar", {

        constructor: function(options) {
            var self = this;

            options = jQuery.extend({}, {
                // content: contents
                design: sap.m.ToolbarDesign.Info,
            }, options);
            sap.m.Toolbar.prototype.constructor.apply(this, [options]);
            this.addStyleClass('searchFilterContextualBar');

            this.bindAggregation("content", "/filterConditions", function(sId, oContext) {
                return self.contentFactory(sId, oContext);
            });
        },

        contentFactory: function(sId, oContext) {
            var label = new sap.m.Label({
                text: "{label}" + ", "
            });
            label.addStyleClass('filterLabel');
            return label;
        },

        hasContent: function() {
            if (this.getContent().length > 0 && this.getModel().isFacetSearchEnabled()) {
                return true;
            } else {
                return false;
            }
        },
        renderer: 'sap.m.ToolbarRenderer',

        onAfterRendering: function() {
            var label = sap.ushell.resources.i18n.getText("filtered_by");
            var $filters = $('.searchFilterContextualBar').children('label');
            var $firstFilter = $filters.first();
            var $lastFilter = $filters.last();

            // add filter by in beginning
            $('.searchFilterContextualBar').prepend('<label class="filterTitle">' + label + ':</label>');

            // add aria label
            $filters.attr('aria-label', label);

            // remove ", " from last filter label
            $lastFilter.text($lastFilter.text().substring(0, $lastFilter.text().length - 2));
        }

    });

}());

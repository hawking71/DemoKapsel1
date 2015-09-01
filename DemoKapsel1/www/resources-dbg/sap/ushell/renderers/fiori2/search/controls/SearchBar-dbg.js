/* global jQuery, sap, window */
(function() {
    "use strict";

    jQuery.sap.require('sap.m.Bar');
    jQuery.sap.require('sap.m.Label');
    jQuery.sap.require('sap.m.Button');
    jQuery.sap.require('sap.m.ButtonType');
    jQuery.sap.require('sap.m.ToggleButton');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchHelper');
    var searchHelper = sap.ushell.renderers.fiori2.search.SearchHelper;

    sap.m.Bar.extend('sap.ushell.renderers.fiori2.search.controls.SearchBar', {

        constructor: function(options, sId) {
            var self = this;
            self.sMarginPropValueSmall = "0.5rem";
            self.sMarginPropValueBig = "13.5rem";

            if (jQuery("html").attr("dir") === 'rtl') {
                self.sMarginPropName = "margin-right";
            } else {
                self.sMarginPropName = "margin-left";
            }

            self.filterButtonPressed = searchHelper.loadFilterButtonStatus();
            self.filterBtn = new sap.m.ToggleButton({
                icon: sap.ui.core.IconPool.getIconURI("filter"),
                tooltip: self.filterButtonPressed ? sap.ushell.resources.i18n.getText("hideFacetBtn_tooltip") : sap.ushell.resources.i18n.getText("showFacetBtn_tooltip"),
                pressed: self.filterButtonPressed,
                press: function() {

                    if (this.getPressed()) {
                        // show facet
                        options.oSearchLayout.setShowFacets(true);
                        // fade out
                        self._animateFilterBtn(this.getPressed(), 400, function() {
                            jQuery(this).attr("title", sap.ushell.resources.i18n.getText("hideFacetBtn_tooltip"));
                            // - setTooltip wourld trigger a compeltely new rendering, losing the current position
                            //self.filterBtn.setTooltip(sap.ushell.resources.i18n.getText("hideFacetBtn_tooltip"));
                        });

                    } else {
                        //hide facet
                        options.oSearchLayout.setShowFacets(false);
                        // fade in
                        self._animateFilterBtn(this.getPressed(), 400, function() {
                            jQuery(this).attr("title", sap.ushell.resources.i18n.getText("showFacetBtn_tooltip"));
                            // - setTooltip wourld trigger a compeltely new rendering, losing the current position
                            //self.filterBtn.setTooltip(sap.ushell.resources.i18n.getText("showFacetBtn_tooltip"));
                        });
                    }
                }
            });
            self.filterBtn.addStyleClass('searchBarFilterButton');
            self.filterBtn.addEventDelegate({
                onAfterRendering: function() {
                    self._animateFilterBtn(self.filterBtn.getPressed(), 0);
                }
            });
            options = jQuery.extend({}, {
                contentLeft: [new sap.m.Button({
                    type: sap.m.ButtonType.Back,
                    press: function(event) {
                        window.history.back(1);
                    },
                    tooltip: "{i18n>backBtn_tooltip}"
                })],
                contentMiddle: [new sap.m.Label({
                    text: "{i18n>search}"
                })]
            }, options);
            if (!sap.ui.Device.system.phone) {
                options.contentLeft.push(this.filterBtn);
            }
            sap.m.Bar.prototype.constructor.apply(this, [options], sId);
            this.addStyleClass('searchBar');
        },

        _animateFilterBtn: function(bPressed, nDuration, oCompleteCallBack) {
            var self = this;
            var oMargin = {};
            if (bPressed) {
                oMargin[self.sMarginPropName] = self.sMarginPropValueBig;
            } else {
                oMargin[self.sMarginPropName] = self.sMarginPropValueSmall;
            }
            jQuery(self.filterBtn.getDomRef()).animate(oMargin, {
                duration: nDuration,
                complete: oCompleteCallBack
            });

        },
        renderer: 'sap.m.BarRenderer'

    });

})();

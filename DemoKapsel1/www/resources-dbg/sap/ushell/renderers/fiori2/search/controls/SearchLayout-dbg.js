// iteration 0: naja
/* global sap,$ */

(function() {

    "use strict";

    jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchHelper');
    var searchHelper = sap.ushell.renderers.fiori2.search.SearchHelper;

    sap.ui.core.Control.extend("sap.ushell.renderers.fiori2.search.controls.SearchLayout", {

        metadata: {
            properties: {
                count: "int",
                searchTerm: "string", // TODO rename to searchBoxTerm
                searchBusy: {
                    type: "boolean",
                    defaultValue: false
                },
                showFacets: {
                    type: "boolean",
                    defaultValue: false
                }
            },
            aggregations: {
                "SearchFieldGroup": {
                    type: "sap.ui.core.Control",
                    multiple: false
                },
                "topList": {
                    type: "sap.ui.core.Control",
                    multiple: false
                },
                "bottomList": {
                    type: "sap.ui.core.Control",
                    multiple: false
                },
                "tabStrips": {
                    type: "sap.ui.core.Control",
                    multiple: false
                },
                "facets": {
                    type: "sap.ui.core.Control",
                    multiple: false
                },
                "_countLabel": {
                    type: "sap.m.Label",
                    multiple: false,
                    visibility: "hidden"
                },
            }
        },

        constructor: function(options, sId) {

            // call super constructor
            var self = this;
            sap.ui.core.Control.prototype.constructor.apply(this, [options], sId);

            // label control for count
            var countLabel = new sap.m.Label();
            countLabel.addStyleClass('searchLayout-mainHeaderCount');
            self.setAggregation("_countLabel", countLabel);

            // set initial value for showFacets 
            self.setProperty('showFacets', searchHelper.loadFilterButtonStatus(), true);

        },

        initVisibility: function() {

            var areFacetsShown = this.getShowFacets();

            // set initial visibility for tabstrips 
            // (visible if facet panel is closed)
            if (this.getTabStrips()) {
                if (areFacetsShown || jQuery.device.is.phone) {
                    this.getTabStrips().setVisible(false);
                } else {
                    this.getTabStrips().setVisible(true);
                }
            }

            // set initial visibility for filter bar
            // (visible if facet panel is closed + there are filters)
            if (!areFacetsShown && this.oFilterBar.hasContent() === true) {
                this.oFilterBar.setVisible(true);
                this.oAppPage.setShowSubHeader(true);
            } else {
                this.oFilterBar.setVisible(false);
                this.oAppPage.setShowSubHeader(false);
            }

        },

        setCount: function(count) {
            this.setProperty('count', count, true);
            this.getAggregation('_countLabel').setText('(' + count + ')');
        },

        // avoid to re-render input and its pop up window, after the searh term is changed in model
        setSearchTerm: function(searchTerm) {
            this.setProperty('searchTerm', searchTerm, true);
        },

        renderSearchFieldGroup: function(oRm, oControl) {
            oRm.write("<div");
            oRm.addClass("searchInputs");
            oRm.writeClasses();
            oRm.write('>');
            if (this.getSearchFieldGroup()) {
                oRm.renderControl(this.getSearchFieldGroup());
            }
            oRm.write("</div>");
        },

        renderBusyIndicator: function(oRm, oControl) {

            this.busy = new sap.m.BusyIndicator({
                size: "50px"

            });
            this.busy.addStyleClass('searchBusyIcon');
            this.busy.addStyleClass('hidden');

            if (oControl.getSearchBusy() === true) {
                this.busy.removeStyleClass('hidden');
                oRm.write("<div");
                oRm.addClass("searchBusy");
                oRm.writeClasses();
                oRm.write('>');
                oRm.renderControl(this.busy);
                oRm.write("</div>");

                oRm.write("<div");
                oRm.addClass("searchBusyBG");
                oRm.writeClasses();
                oRm.write('>');
                oRm.write("</div>");
            }

        },

        renderMainHeader: function(oRm, oControl) {

            // render
            if (!oControl.isNoResultsShown() && oControl.getSearchBusy() === false) {
                oRm.write('<div class="searchLayout-mainHeader">');
                oRm.renderControl((new sap.m.Label({
                    text: sap.ushell.resources.i18n.getText("searchResults")
                })).addStyleClass('searchLayout-mainHeaderName'));
                oRm.renderControl(oControl.getAggregation('_countLabel'));
                oRm.write('</div>');

            }

        },

        isNoResultsShown: function() {
            return this.getCount() === 0;
        },

        renderNoResults: function(oRm, oControl) {

            if (oControl.isNoResultsShown() && oControl.getSearchBusy() === false) {

                var escapedSearchTerm = $('<div>').text(oControl.getSearchTerm()).html();

                oRm.write('<div class="no-result"><div class="no-result-icon">');
                oRm.writeIcon(sap.ui.core.IconPool.getIconURI("travel-request"));
                oRm.write('</div><div class="no-result-text">');
                oRm.write('<div class="no-result-info">' + sap.ushell.resources.i18n.getText("no_results_info").replace('&1', escapedSearchTerm) + '</div>');
                oRm.write('<div class="no-result-tips">' + sap.ushell.resources.i18n.getText("no_results_tips") + '</div> ');
                oRm.write('</div></div>');

            }

        },

        renderTopList: function(oRm, oControl) {

            // top list
            if (oControl.getTopList()) {
                oRm.renderControl(oControl.getTopList());
            }

        },

        renderBottomList: function(oRm, oControl) {

            // bottom list
            if (oControl.getBottomList()) {
                oRm.renderControl(oControl.getBottomList());
            }

        },

        setFilterBar: function(oFilterBar) {
            this.oFilterBar = oFilterBar;
        },

        setAppPage: function(oAppPage) {
            this.oAppPage = oAppPage;
        },

        setShowFacets: function(areFacetsShown, isAnimated) {

            // visibility for tab strips
            if (this.getTabStrips()) {
                if (areFacetsShown || jQuery.device.is.phone) {
                    this.getTabStrips().setVisible(false);
                } else {
                    this.getTabStrips().setVisible(true);
                }
            }

            // give the flag to model because it's query relevant
            if (this.getModel()) {
                this.getModel().setFacetVisibility(areFacetsShown);
            }

            var $searchFacets = jQuery(".searchFacets");

            if (isAnimated === undefined) {
                isAnimated = true;
            }

            var sWidth;
            var sOpacity;
            var sPaddingLeft;
            var oCompleteCallBack;

            // inverted the pressed value since this function is only called
            // after pressed value is already changed.
            if (!areFacetsShown) {
                sWidth = "0";
                sOpacity = "0";
                sPaddingLeft = "2rem";
                if (this.oFilterBar.hasContent() === true) {
                    this.oFilterBar.setVisible(true);
                    this.oAppPage.setShowSubHeader(true);
                } else {
                    this.oFilterBar.setVisible(false);
                    this.oAppPage.setShowSubHeader(false);
                }
            } else {
                sWidth = "18rem";
                sOpacity = "1";
                sPaddingLeft = "1rem";
                this.oFilterBar.setVisible(false);
                this.oAppPage.setShowSubHeader(false);
            }

            $searchFacets.animate({
                width: sWidth,
                opacity: sOpacity
            }, {
                complete: function() {
                    sap.ui.getCore().getEventBus().publish("searchLayoutChanged");
                },
                duration: isAnimated ? 400 : 0
            });

            var oPadding = {};
            var sPaddingPropName;
            if (jQuery("html").attr("dir") === 'rtl') {
                sPaddingPropName = "padding-right";
            } else {
                sPaddingPropName = "padding-left";
            }
            oPadding[sPaddingPropName] = sPaddingLeft;
            if (sap.ui.Device.system.desktop) {
                jQuery(".searchResultListsContainer")
                    .animate(oPadding, {
                        duration: isAnimated ? 400 : 0
                    });
            }

            // the 3. parameter supress rerendering
            this.setProperty("showFacets", areFacetsShown, true); // this validates and stores the new value

            // Set button status in sap storage
            searchHelper.saveFilterButtonStatus(areFacetsShown);

            return this; // return "this" to allow method chaining
        },

        renderTabStrips: function(oRm, oControl) {
            if (oControl.isNoResultsShown()) {
                return;
            }
            if (!oControl.getTabStrips()) {
                return;
            }
            oRm.renderControl(oControl.getTabStrips());
        },

        renderer: function(oRm, oControl) {

            // outer div for results
            oRm.write("<div");
            oRm.writeControlData(oControl);
            oRm.addClass("searchLayout");
            oRm.writeClasses();
            oRm.write('>');

            // inner div for facets
            if (oControl.getFacets()) {
                oRm.write('<div');
                oRm.addClass('searchFacets');
                oRm.writeClasses();
                if (!oControl.getShowFacets()) {
                    oRm.write('style="width:0;opacity:0"');
                }
                oRm.write('>');
                oRm.renderControl(oControl.getFacets());
                oRm.write('</div>');
            }

            // inner div for results
            oRm.write("<div");
            oRm.addClass("searchResultListsContainer");
            oRm.writeClasses();
            if (sap.ui.Device.system.desktop) {
                if (oControl.getFacets() && oControl.getShowFacets() === true) {
                    oRm.write('style="padding-left:1rem;"');
                } else {
                    oRm.write('style="padding-left:2rem;"');
                }
            }
            oRm.write('>');

            // render busy indicator
            oControl.renderBusyIndicator(oRm, oControl);

            // render datasource select, input and button controls
            oControl.renderSearchFieldGroup(oRm, oControl);

            // render main header
            oControl.renderMainHeader(oRm, oControl);

            // render tabstrips
            oControl.renderTabStrips(oRm, oControl);

            // render no results
            oControl.renderNoResults(oRm, oControl);

            //render top list
            oControl.renderTopList(oRm, oControl);

            // render bottom list
            oControl.renderBottomList(oRm, oControl);

            /// close inner div for results
            oRm.write("</div>");

            /// close outer div for results
            oRm.write("</div>");
        }

    });

})();

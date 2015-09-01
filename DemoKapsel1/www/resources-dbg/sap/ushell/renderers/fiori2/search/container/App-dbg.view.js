// iteration 0 ok
/* global jQuery, sap, window, console */

// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
/**
 * @fileOverview
 *
 * @version
 */

(function(global) {
    "use strict";

    jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchShellHelper');

    var searchShellHelper = sap.ushell.renderers.fiori2.search.SearchShellHelper;
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.controls.SearchFieldGroup');
    var SearchFieldGroup = sap.ushell.renderers.fiori2.search.controls.SearchFieldGroup;
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.controls.SearchBar');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.controls.SearchFilterBar');
    var SearchFilterBar = sap.ushell.renderers.fiori2.search.controls.SearchFilterBar;
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchHelper');
    var searchHelper = sap.ushell.renderers.fiori2.search.SearchHelper;

    sap.ui.jsview("sap.ushell.renderers.fiori2.search.container.App", {

        createContent: function() {
            var self = this;

            // create search model
            this.oModel = sap.ui.getCore().getModel("searchModel");
            if (!this.oModel) {
                this.oModel = new sap.ushell.renderers.fiori2.search.SearchModel();
                sap.ui.getCore().setModel(this.oModel, "searchModel");
            }
            this.setModel(sap.ushell.resources.i18nModel, "i18n");

            // filter contextual bar 
            this.oFilterBar = new sap.ushell.renderers.fiori2.search.controls.SearchFilterBar();
            this.oFilterBar.setModel(this.oModel);

            // search filed group
            this.oSearchFieldGroup = new SearchFieldGroup("searchGroupInApp", {});
            this.oSearchFieldGroup.setModel(this.oModel);
            this.oSearchFieldGroup.getAggregation("input").addEventDelegate({
                onfocusin: function(oEvent) {
                    searchShellHelper.closeHeadSearchBox();
                }
            }, this.oSearchFieldGroup.getAggregation("input"));

            // search result screen
            this.oSearchResults = sap.ui.view({
                id: "searchContainerResultsView",
                tooltip: "{i18n>searchResultsView_tooltip}",
                viewName: "sap.ushell.renderers.fiori2.search.container.Search",
                type: sap.ui.core.mvc.ViewType.JS
            });
            this.oSearchResults.setModel(self.oModel);
            this.oSearchResults.setAppView(self);
            this.oSearchResults.searchLayout.setSearchFieldGroup(this.oSearchFieldGroup);

            // deserialze URL
            this.deserializeURL();

            // create page
            this.oPage = this.pageFactory("searchPage", [this.oSearchResults]);

            // initialize visibility of subareas in search layout (tabstrips, filterbar)
            // do this after deserialization of URL because 
            // visibility depends on existence of filters
            self.oSearchResults.searchLayout.initVisibility();

            return this.oPage;
        },

        beforeExit: function() {
            var a;
        },

        deserializeURL: function() {
            var oURLParsing = sap.ushell.Container.getService("URLParsing");

            var appSpecificRoute = oURLParsing.splitHash(window.location.hash).appSpecificRoute;
            if (!appSpecificRoute) {
                return;
            }
            var oParameters = oURLParsing.parseParameters("?" + appSpecificRoute.substring(2));

            this.oModel.hashChanged(oParameters, false);

            this.oSearchFieldGroup.getAggregation("input")
                .setValue(this.oModel.getProperty('/searchBoxTerm'));

            if (sap.ui.Device.system.phone) {
                this.oSearchResults.searchLayout.setFacets(null);
            } else {
                this.oSearchResults.searchLayout.setFacets(this.oSearchResults.assembleFacets());
            }

            // reset search data for back and forth button click
            this.oModel.setProperty('/lastSearchTerm', null);
            this.oModel.setProperty('/lastDataSource', null);
            this.oModel.setProperty('/appResults', []);
            this.oModel.setProperty('/boResults', []);
            this.oModel._searchFireQuery();
        },

        pageFactory: function(sId, oControl, bDisableBouncing) {
            var self = this;

            var oSearchBar = new sap.ushell.renderers.fiori2.search.controls.SearchBar({
                oSearchLayout: self.oSearchResults.searchLayout
            });

            self.oSearchResults.searchLayout.setFilterBar(self.oFilterBar);


            var oPage = new sap.m.Page({
                id: sId,
                customHeader: oSearchBar,
                subHeader: self.oFilterBar,
                content: oControl,
                enableScrolling: true,
                showFooter: true
            });

            self.oSearchResults.searchLayout.setAppPage(oPage);

            //TODO: who is using these events? Necessary?
            var aEvents = ["onAfterHide", "onAfterShow", "onBeforeFirstShow",
                "onBeforeHide", "onBeforeShow"
            ];
            var oDelegates = {};

            self.createFooter(oPage);

            // Pass navigation container events to children.
            jQuery.each(aEvents, function(iIndex, sEvent) {
                oDelegates[sEvent] = jQuery.proxy(function(evt) {
                    jQuery.each(this.getContent(), function(iIndex, oControl) {
                        /*jslint nomen: true */
                        oControl._handleEvent(evt);
                    });
                }, oPage);
            });

            oPage.addEventDelegate(oDelegates);
            if (!sap.ui.Device.system.desktop) {
                oPage._bUseIScroll = true;
            }
            if (bDisableBouncing) {
                this.disableBouncing(oPage);
            }
            oPage.setTitle("{i18n>search}");

            // compact class for non-touch devices 
            if (!sap.ui.Device.support.touch) {
                var oView = sap.ui.getCore().byId("searchContainerApp");
                oView.addStyleClass('sapUiSizeCompact');
            }

            return oPage;
        },

        getControllerName: function() {
            return "sap.ushell.renderers.fiori2.search.container.App";
        },

        createFooter: function(oPage) {

            var self = this;

            // no footer on phone
            if (jQuery.device.is.phone) {
                return;
            }

            // create bookmark button (entry in action sheet)
            var oBookmarkButton = new sap.ushell.ui.footerbar.AddBookmarkButton({
                beforePressHandler: function() {
                    var oAppData = {
                        url: document.URL,
                        title: self.getTileTitleProposal()
                    };
                    oBookmarkButton.setAppData(oAppData);
                }
            });
            oBookmarkButton.setWidth('auto');

            var oEmailButton = new sap.m.Button();
            oEmailButton.setIcon("sap-icon://email");
            oEmailButton.setText(sap.ushell.resources.i18n.getText("eMailFld"));
            oEmailButton.attachPress(function() {
                sap.m.URLHelper.triggerEmail(null, self.getTileTitleProposal(), document.URL);
            });
            oEmailButton.setWidth('auto');

            // TODO: add these two jam buttons when we know how to configure jam in fiori  
            //var oJamShareButton = new sap.ushell.ui.footerbar.JamShareButton();
            //var oJamDiscussButton = new sap.ushell.ui.footerbar.JamDiscussButton();


            // create action sheet
            var oActionSheet = new sap.m.ActionSheet({
                placement: 'Top',
                buttons: [oBookmarkButton, oEmailButton]
            });

            // button which opens action sheet
            var oShareButton = new sap.m.Button({
                icon: 'sap-icon://action',
                tooltip: sap.ushell.resources.i18n.getText('shareBtn'),
                press: function() {
                    oActionSheet.openBy(oShareButton);
                }
            });

            // create footer bar
            var oBar = new sap.m.Bar({
                contentRight: [oShareButton]
            });

            //destroy footer if available
            var oFooter = oPage.getFooter();
            if (oFooter && oFooter.destroy) {
                oFooter.destroy();
            }

            oPage.setFooter(oBar);

        },

        getTileTitleProposal: function() {
            var searchTerm = this.oModel.getSearchBoxTerm();
            var dataSourceLabel = this.oModel.getDataSource().label;
            var title = sap.ushell.resources.i18n.getText('searchTileTitleProposal', [searchTerm, dataSourceLabel]);
            return title;
        }

    });


}(window));

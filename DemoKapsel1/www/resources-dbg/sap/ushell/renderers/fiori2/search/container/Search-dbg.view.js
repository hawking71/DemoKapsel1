// TODO Oliver+Jian
// TODO iteration 0
/* global $, window, jQuery, sap, console */
// Copyright (c) 2009-2014 SAP SE, All Rights Reserved

(function(global) {
    "use strict";

    jQuery.sap.require("sap.ushell.renderers.fiori2.search.controls.SearchResultListItem");
    jQuery.sap.require("sap.ushell.renderers.fiori2.search.controls.SearchLayout");
    jQuery.sap.require("sap.ushell.renderers.fiori2.search.controls.SearchResultListItemFooter");
    jQuery.sap.require("sap.ushell.renderers.fiori2.search.controls.SearchResultListContainer");
    jQuery.sap.require("sap.ushell.ui.launchpad.SearchResultApps");
    jQuery.sap.require("sap.ushell.ui.launchpad.SearchResultAppItem");
    jQuery.sap.require("sap.ushell.renderers.fiori2.search.controls.SearchFacetFilter");
    jQuery.sap.require("sap.ushell.renderers.fiori2.search.controls.DivContainer");
    jQuery.sap.require("sap.ushell.renderers.fiori2.search.controls.SearchTilesContainer");
    jQuery.sap.require("sap.ushell.renderers.fiori2.search.controls.SearchResultList");

    var SearchLayout = sap.ushell.renderers.fiori2.search.controls.SearchLayout;
    var SearchResultListItem = sap.ushell.renderers.fiori2.search.controls.SearchResultListItem;
    var SearchResultListItemFooter = sap.ushell.renderers.fiori2.search.controls.SearchResultListItemFooter;
    var SearchResultListContainer = sap.ushell.renderers.fiori2.search.controls.SearchResultListContainer;
    var ResultListKeyEventHandler = sap.ushell.renderers.fiori2.search.container.ResultListKeyEventHandler;
    var SearchResultList = sap.ushell.renderers.fiori2.search.controls.SearchResultList;


    sap.ui.jsview("sap.ushell.renderers.fiori2.search.container.Search", {

        // create content
        // ===================================================================
        createContent: function(oController) {
            var self = this;

            // main result list
            var mainResultList = self.assembleMainResultList();

            // tabstrips
            self.tabStrips = self.assembleTabStrips();

            // app result list
            self.appSearchResult = self.assembleAppSearch();

            // container for normal search result list + apps + facets
            self.searchLayout = new SearchLayout({
                count: '{/count}',
                searchTerm: '{/searchBoxTerm}',
                topList: self.appSearchResult,
                bottomList: mainResultList,
                tabStrips: self.tabStrips
            });

            if (sap.ui.Device.system.phone) {
                self.searchLayout.setFacets(null);
            } else {
                self.searchLayout.setFacets(self.assembleFacets());
            }

            // top container
            self.searchContainer = new sap.ushell.renderers.fiori2.search.controls.DivContainer({
                content: self.searchLayout,
                cssClass: 'searchContainer'
            });

            return self.searchContainer;

        },

        // tabstrips
        // ===================================================================
        assembleTabStrips: function() {

            var self = this;

            var getSelectedTabStrip = function(tabBar) {
                var selectedKey = tabBar.getSelectedKey();
                var items = tabBar.getItems();
                for (var i = 0; i < items.length; ++i) {
                    var item = items[i];
                    var key = item.getKey() || item.getId();
                    if (key === selectedKey) {
                        return item.getBindingContext().getObject();
                    }
                }
                return null;
            };

            var tabBar = new sap.m.IconTabBar({
                upperCase: true,
                expandable: false,
                selectedKey: {
                    path: '/tabStrips/selected/objectName/value',
                },
                select: function() {
                    var tabStrip = getSelectedTabStrip(tabBar);
                    self.getModel().setDataSource(tabStrip);
                }
            });
            tabBar.addStyleClass('searchTabStrips');

            tabBar.bindAggregation('items', '/tabStrips/strips', function(sId, oContext) {
                return new sap.m.IconTabFilter({
                    text: '{label}',
                    key: "{objectName/value}",
                    content: null
                });

            });

            return tabBar;
        },

        // main result list
        // ===================================================================
        assembleMainResultList: function() {

            var self = this;

            var resultList = new SearchResultList({
                mode: sap.m.ListMode.None,
                growing: true,
                threshold: 2,
                inset: false,
                showUnread: true,
                width: "auto",
                showNoData: false,
                visible: '{/resultsVisibility}'
            });
            resultList.setGrowingThreshold(2000);
            resultList.bindAggregation("items", "/results", function(path, bData) {
                return self.assembleListItem(bData);
            });

            var resultListWithDetail = new SearchResultListContainer({
                resultList: resultList
            });
            return resultListWithDetail;
        },

        // app search area
        // ===================================================================
        assembleAppSearch: function() {

            var self = this;

            // tiles container
            var tileContainer = new sap.ushell.renderers.fiori2.search.controls.SearchTilesContainer({
                maxRows: 99999,
                tiles: '{/appResults}',
                totalLength: '{/appCount}',
                visible: '{/appsVisibility}',
                highlightTerms: '{/lastSearchTerm}',
                showMore: function() {

                    var model = self.getModel();

                    // calculcate new skip
                    var newSkip = model.getSkip() + model.getTop();
                    model.setSkip(newSkip, false);

                    // calculate new top (ask tile container for number of tiles because of additional plus tile)
                    var rows = tileContainer.getNumberTiles() / tileContainer.getTilesPerRow() + 10;
                    var newTop = rows * tileContainer.getTilesPerRow() - newSkip;
                    model.setTop(newTop);

                }
            });
            tileContainer.addStyleClass('searchTileResultList');

            sap.ui.getCore().getEventBus().subscribe('searchLayoutChanged', function() {
                tileContainer.delayedRerender();
            }, this);

            return tileContainer;
        },

        // assemble facets
        // ===================================================================
        assembleFacets: function() {
            var self = this,
                facets;

            if (this.getModel()) {
                facets = new sap.ushell.renderers.fiori2.search.controls.SearchFacetFilter();
                facets.setModel(this.getModel());
            }
            return facets;
        },

        // assemble title item
        // ===================================================================
        assembleTitleItem: function(oData) {
            var item = new sap.m.CustomListItem();
            var title = new sap.m.Label({
                text: "{title}"
            });
            title.addStyleClass('bucketTitle');
            item.addStyleClass('bucketTitleContainer');
            item.addContent(new sap.m.HBox({
                items: [title]
            }));
            return item;
        },

        // assemble search result footer item (show more button)
        // ===================================================================
        assembleFooterItem: function(oData) {
            var self = this;

            self.footerItem = new SearchResultListItemFooter({
                text: "{i18n>showMore}",
                showMore: function() {
                    var oCurrentModel = self.getModel();
                    var newSkip = oCurrentModel.getSkip() + 10;
                    oCurrentModel.setSkip(newSkip);
                }
            });

            var listItem = new sap.m.CustomListItem({
                content: self.footerItem
            });
            listItem.addStyleClass('searchResultListFooter');

            return listItem;
        },

        // assemble app container result list item
        // ===================================================================
        assembleAppContainerResultListItem: function(oData, path) {
            var self = this;
            var container = new sap.ushell.renderers.fiori2.search.controls.SearchTilesContainer({
                maxRows: sap.ui.Device.system.phone ? 2 : 1,
                tiles: '{tiles}',
                totalLength: '{/appCount}',
                highlightTerms: '{/lastSearchTerm}',
                enableKeyHandler: false,
                showMore: function() {
                    var model = self.getModel();
                    model.setDataSource(model.appDataSource);
                }
            });
            var listItem = new sap.m.CustomListItem({
                content: container
            });
            listItem.addStyleClass('searchResultListItem');
            listItem.addStyleClass('searchResultListItemApps');

            sap.ui.getCore().getEventBus().subscribe('searchLayoutChanged', function() {
                container.delayedRerender();
            }, this);

            return listItem;
        },

        // assemble search result list item
        // ===================================================================
        assembleResultListItem: function(oData, path) {
            var self = this;
            var item = new SearchResultListItem({
                title: "{$$Name$$}",
                titleUrl: "{uri}",
                type: "{dataSourceName}",
                imageUrl: "{imageUrl}",
                data: oData,
                visibleAttributes: 4,
                navigate: function() {},
                firstDetailAttribute: 5,
                maxDetailAttributes: 8
            });

            var listItem = new sap.m.CustomListItem({
                content: item
            });
            listItem.addStyleClass('searchResultListItem');

            return listItem;
        },

        // assemble search result list item
        // ===================================================================
        assembleListItem: function(bData) {
            var self = this;
            var oData = bData.getObject();
            if (oData.type === 'title') {
                return self.assembleTitleItem(oData);
            } else if (oData.type === 'footer') {
                return self.assembleFooterItem(oData);
            } else if (oData.type === 'appcontainer') {
                return self.assembleAppContainerResultListItem(oData, bData.getPath());
            } else {
                return self.assembleResultListItem(oData, bData.getPath());
            }
        },

        // event handler search started
        // ===================================================================        
        onAllSearchStarted: function() {
            var self = this;
            self.searchLayout.setSearchBusy(true);
            if (this.oTilesContainer) {
                this.oTilesContainer.resetGrowing();
            }
        },

        // event handler search finished
        // ===================================================================        
        onAllSearchFinished: function() {
            this.searchLayout.setSearchTerm(this.getModel().getSearchBoxTerm());
            this.searchLayout.setSearchBusy(false);
        },

        // event handler normal search finished
        // ===================================================================        
        onNormalSearchFinished: function() {
            var self = this;
            var oSearchModel = this.getModel();
            sap.ui.getCore().getEventBus().publish("closeCurtain");
        },

        // event handler app search finished
        // ===================================================================        
        onAppSearchFinished: function(bla, blub, oResult) {
            var self = this;
        },

        // set appview container
        // ===================================================================        
        setAppView: function(oAppView) {
            var self = this;
            self.oAppView = oAppView;
            if (self.oTilesContainer) {
                self.oTilesContainer.setAppView(oAppView);
            }
        },

        // get controller name
        // ===================================================================        
        getControllerName: function() {
            return "sap.ushell.renderers.fiori2.search.container.Search";
        }

    });


}(window));

/* global jQuery,window */
// iteration 0

(function(global) {
    "use strict";

    jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchHelper');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchResultListFormatter');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.INAV2SearchFacetsFormatter');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.FacetItem');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.Facet');
    jQuery.sap.require('sap.ui.thirdparty.hasher');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchTabStripsFormatter');

    var sap = global.sap;
    var SearchHelper = sap.ushell.renderers.fiori2.search.SearchHelper;
    var SearchResultListFormatter = sap.ushell.renderers.fiori2.search.SearchResultListFormatter;
    var TabStripsFormatter = sap.ushell.renderers.fiori2.search.SearchTabStripsFormatter.Formatter;

    var console = global.console;

    // =======================================================================
    // search model
    // =======================================================================
    sap.ui.model.json.JSONModel.extend("sap.ushell.renderers.fiori2.search.SearchModel", {

        SUGGESTION_TYPE_APPS: 'apps',
        SUGGESTION_TYPE_BO: 'businessobject',
        SUGGESTION_TYPE_DATASOURCE: 'datasource',

        constructor: function(properties) {

            var self = this;
            properties = properties || {};

            // call base class constructor
            sap.ui.model.json.JSONModel.prototype.constructor.apply(self, []);

            // parse url parameters
            self.urlParameters = self.parseUrlParameters();

            // update url (model created by shell header does not update url)
            self.updateUrl = properties.updateUrl !== undefined ? properties.updateUrl : true;

            // set size limit in order to allow drop down list boxes with more than 100 entries
            self.setSizeLimit(200);

            // get sina
            self.sina = sap.ushell.Container.getService("Search").getSina();

            // create sina query for search for business objects (normal search)
            self.query = self.sina.createPerspectiveQuery({
                templateFactsheet: true
            });

            // create sina query for getting business object suggestions
            self.suggestionQuery = self.sina.createSuggestionQuery();

            self.resetFilterConditions(false);

            // create standard datasources like ALL and APPS
            self.createAllAndAppDataSource();

            // decorator for delayed suggestion execution
            self.doSuggestion = SearchHelper.delayedExecution(self.doSuggestion, 400); // make delayed 400 ms

            // decorate suggestion methods (decorator prevents request overtaking)
            self.suggestionQuery.getResultSet = SearchHelper.refuseOutdatedRequests(self.suggestionQuery.getResultSet, 'suggestions'); // normal suggestions
            self.suggestApplications = SearchHelper.refuseOutdatedRequests(self.suggestApplications, 'suggestions'); // app suggestions
            self.suggestDataSources = SearchHelper.refuseOutdatedRequests(self.suggestDataSources, 'suggestions'); // datasource suggestions

            // decorate search methods (decorator prevents request overtaking)
            self.query.getResultSet = SearchHelper.refuseOutdatedRequests(self.query.getResultSet, 'search'); // normal search
            self.searchApplications = SearchHelper.refuseOutdatedRequests(self.searchApplications, 'search'); // app search

            self.oFacetFormatter = new sap.ushell.renderers.fiori2.search.INAV2SearchFacetsFormatter();
            self.tabStripFormatter = new TabStripsFormatter();

            // intial values for boTop and appTop
            self.appTopDefault = 20;
            self.boTopDefault = 10;

            // init the properties
            self.setProperty('/searchBoxTerm', '');
            self.setProperty('/lastSearchTerm', null);

            self.setProperty('/dataSource');
            self.setProperty('/lastDataSource', null);

            self.setProperty('/top', 10);
            self.setProperty('/lastTop', 10);

            self.setProperty('/skip', 0);
            self.setProperty('/lastSkip', 0);

            self.setProperty('/results', []); // combined result list: apps + bos
            self.setProperty('/appResults', []); // applications result list    
            self.setProperty('/boResults', []); // business object result list

            self.setProperty('/count', 0);
            self.setProperty('/boCount', 0);
            self.setProperty('/appCount', 0);

            self.setProperty('/facets', []);
            self.setProperty('/filterConditions', []);
            self.setProperty('/dataSources', [self.allDataSource, self.appDataSource]);
            self.setProperty('/recentDataSources', []); //facets datasource tree
            self.setProperty('/businessObjSearchEnabled', true);

            self.setProperty('/resultsVisibility', true); // visibility of combined result list
            self.setProperty('/appsVisibility', true); // visibility of app result list
            self.setProperty('/facetVisibility', false); // visibility of facet panel
            self.setProperty('/lastFacetVisibility', false); // visbility of facet panel is relevant for query

            self.resetDataSource(false);

            // limits definition
            var suggestionLimits = {
                desktop: {
                    appSuggestion: 3,
                    normalSuggestion: 7,
                    singleAppSuggestion: 7,
                    dataSourceSuggestion: 2
                },
                phone: {
                    appSuggestion: 3,
                    normalSuggestion: 5,
                    singleAppSuggestion: 5,
                    dataSourceSuggestion: 2
                }
            };
            self.deviceSuggestionLimits = jQuery.device.is.phone ? suggestionLimits.phone : suggestionLimits.desktop;

            // initialize enterprise search
            self.initBusinessObjSearch();

        },

        parseUrlParameters: function() {
            var oURLParsing = sap.ushell.Container.getService("URLParsing");
            var params = oURLParsing.parseParameters(window.location.search);
            var newParams = {};
            for (var key in params) {
                var value = params[key];
                if (value.length !== 1) {
                    continue;
                }
                value = value[0];
                if (typeof value !== 'string') {
                    continue;
                }
                newParams[key.toLowerCase()] = value.toLowerCase();
            }
            return newParams;
        },

        setProperty: function(name, value) {
            var self = this;
            sap.ui.model.json.JSONModel.prototype.setProperty.apply(this, arguments);
            switch (name) {
                case '/boResults':
                case '/appResults':
                    self.calculateResultList();
                    break;
                case '/appCount':
                case '/boCount':
                    self.setProperty('/count', self.getProperty('/appCount') + self.getProperty('/boCount'));
                    break;
            }
        },

        calculateResultList: function() {
            // init
            var self = this;
            var results = [];

            // add bo results            
            var boResults = self.getProperty('/boResults');
            if (boResults && boResults.length) {
                results.push.apply(results, boResults);
            }

            // add app results (tiles)
            var tiles = self.getProperty('/appResults');
            if (tiles && tiles.length > 0) {
                var tilesItem = {
                    type: 'appcontainer',
                    tiles: tiles
                };
                if (results.length > 0) {
                    if (results.length > 3) {
                        results.splice(3, 0, tilesItem);
                    } else {
                        results.splice(0, 0, tilesItem);
                        //results.push(tilesItem);
                    }
                } else {
                    results = [tilesItem];
                }
            }

            // set property
            sap.ui.model.json.JSONModel.prototype.setProperty.apply(this, ['/results', results]);
        },

        initBusinessObjSearch: function() {

            var self = this;

            // check whether enterprise search is configured
            if (!self.isBusinessObjSearchConfigured()) {
                self.setProperty('/businessObjSearchEnabled', false);
                return;
            }

            // if get server info succeeds -> enable business obj search + load datasources
            self.sina.sinaSystem().getServerInfo().done(function() {
                self.loadDataSources();
            }).fail(function() {
                self.setProperty('/businessObjSearchEnabled', false);
            });

        },

        loadDataSources: function() {
            var self = this;
            self.getServerDataSources().done(function(dataSources) {
                if (!jQuery.isArray(dataSources)) {
                    dataSources = [];
                }
                dataSources = dataSources.slice();
                dataSources.splice(0, 0, self.appDataSource);
                dataSources.splice(0, 0, self.allDataSource);
                self.setProperty("/dataSources", dataSources);
                self.updateDataSourceList(self.getDataSource()); // ensure that current ds is in the list (may be category)                
                // TODO start - remove, shall be fixed by UI5
                var ds = self.getDataSource();
                self.setProperty("/dataSource", {});
                self.setProperty("/dataSource", ds);
                // TODO end
            });
        },

        getServerDataSources: function() {
            var self = this;

            if (self.getDataSourcesDeffered) {
                return self.getDataSourcesDeffered;
            }

            self.getDataSourcesDeffered = self.sina.sinaSystem().getServerInfo().then(function(serverInfo) {

                // create datasource for data source ESH_CONNECTOR
                var systemId = serverInfo.rawServerInfo.ServerInfo.SystemId;
                var sapClient = serverInfo.rawServerInfo.ServerInfo.Client;
                var searchConnector = systemId + sapClient + "~ESH_CONNECTOR~";
                var dataSource = self.sina.createDataSource({
                    objectName: searchConnector,
                    packageName: {
                        label: "ABAP",
                        value: "ABAP"
                    },
                    type: "Connector",
                    label: ""
                });

                // create query
                var dataSourceQuery = self.sina.createPerspectiveQuery();
                dataSourceQuery.setDataSource(dataSource);
                dataSourceQuery.setSearchTerms("*");
                dataSourceQuery.setTop(1000);
                dataSourceQuery.setOrderBy({
                    orderBy: 'DESCRIPTION',
                    sortOrder: 'ASC'
                });
                return dataSourceQuery.getResultSet();

            }).then(function(resultSet) {
                var elements = resultSet.searchresultset.getElements();
                var dataSources = jQuery.map(elements, function(element) {
                    return self.sina.createDataSource({
                        objectName: {
                            label: element.OBJECT_NAME.value,
                            //label: element.DESCRIPTION.value + element.OBJECT_NAME.value,
                            value: element.OBJECT_NAME.value
                        },
                        packageName: {
                            label: "ABAP",
                            value: "ABAP"
                        },
                        schemaName: "",
                        type: {
                            label: 'View',
                            value: 'View'
                        },
                        label: element.DESCRIPTION.value === null ? element.OBJECT_NAME.value : element.DESCRIPTION.value
                        //label: element.DESCRIPTION.value + element.OBJECT_NAME.value
                    });
                });
                return self.removeDuplicateDataSources(dataSources);
            });

            return self.getDataSourcesDeffered;
        },

        removeDuplicateDataSources: function(dataSources) {
            var filteredDataSources = [];
            var map = {};
            for (var i = 0; i < dataSources.length; ++i) {
                var dataSource = dataSources[i];

                if (map[dataSource.objectName.value]) {
                    continue;
                }
                map[dataSource.objectName.value] = true;
                filteredDataSources.push(dataSource);
            }
            return filteredDataSources;
        },

        isBusinessObjSearchConfigured: function() {
            try {
                var config = window['sap-ushell-config'].renderers.fiori2.componentData.config;
                return config.searchBusinessObjects !== 'hidden';
            } catch (e) {
                return true;
            }
        },

        isBusinessObjSearchEnabled: function() {
            return this.getProperty('/businessObjSearchEnabled');
        },

        isFacetSearchEnabled: function() {
            if (this.urlParameters.eshfacets === 'true') {
                return true;
            }
            return false;
        },

        searchApplications: function(searchTerm, top, skip) {
            return sap.ushell.Container.getService("Search").queryApplications({
                searchTerm: searchTerm,
                searchInKeywords: true,
                top: top,
                skip: skip
            });
        },

        suggestApplications: function(searchTerm) {
            return sap.ushell.Container.getService("Search").queryApplications({
                searchTerm: searchTerm
            });
        },

        suggestDataSources: function(suggestionTerms, limit) {

            var self = this;
            var dsSuggestions = [];

            // get data sources
            return self.getServerDataSources().then(function(dataSources) {

                //add all and app DataSource so that it can also be suggested like server datasources                           
                if ($.inArray(self.appDataSource, dataSources) < 0) {
                    dataSources.unshift(self.appDataSource);
                }
                if ($.inArray(self.allDataSource, dataSources) < 0) {
                    dataSources.unshift(self.allDataSource);
                }

                // check all data sources for matching
                // instantiate Tester with search terms
                var oTester = new SearchHelper.Tester(suggestionTerms);
                var oTestResult;
                var suggestion;

                for (var i = 0; i < dataSources.length; ++i) {
                    var dataSource = dataSources[i];
                    if (dataSource.objectName.value === self.getDataSource().objectName.value) {
                        continue;
                    }
                    oTestResult = oTester.test(dataSource.label);

                    // match
                    if (oTestResult.bMatch === true) {
                        suggestion = {};
                        suggestion.label = '<i>' + sap.ushell.resources.i18n.getText("searchInPlaceholder", oTestResult.sHighlightedText) + '</i>';
                        suggestion.labelRaw = '';
                        suggestion.dataSource = dataSource;
                        suggestion.type = self.SUGGESTION_TYPE_DATASOURCE;
                        dsSuggestions.push(suggestion);
                        if (dsSuggestions.length === limit) {
                            break;
                        }
                    }
                }
                return dsSuggestions;
            });
        },

        createAllAndAppDataSource: function() {

            // TODO internationalization of labels!

            this.allDataSource = this.sina.getRootDataSource();
            this.allDataSource.label = sap.ushell.resources.i18n.getText("label_all");

            this.appDataSource = this.sina.createDataSource({
                objectName: {
                    label: "Apps",
                    value: "$$APP$$"
                },
                packageName: {
                    label: "ABAP",
                    value: "ABAP"
                },
                type: "Category",
                label: sap.ushell.resources.i18n.getText("label_apps")
            });

        },

        isAllCategory: function() {
            var ds = this.getProperty("/dataSource");
            if ((ds && ds.objectName && ds.objectName.value && ds.objectName.value.toLowerCase() === "$$all$$") ||
                (ds && ds.objectName && ds.objectName.toLowerCase && ds.objectName.toLowerCase() === "$$all$$")) {
                return true;
            }
            return false;
        },

        isAppCategory: function() {
            var ds = this.getProperty("/dataSource");
            if (ds && ds.objectName && ds.objectName.value === "$$APP$$") {
                return true;
            }
            return false;
        },

        abortSuggestions: function() {
            this.setProperty("/suggestions", []);
            this.doSuggestion.abort(); // abort time delayed calls
            SearchHelper.abortRequests('suggestions');
        },

        doSuggestion: function() {

            var self = this;

            // TODO wording singular or plural for searchterm?
            var suggestionTerm = self.getProperty("/searchBoxTerm");
            if (suggestionTerm.length === 0) {
                // don't suggest if there is no search term
                return;
            }

            // clear suggestions in UI
            // TODO wording: rename to mixedSuggestionSection?
            self.setProperty("/suggestions", []);

            // abort old suggestion calls 
            SearchHelper.abortRequests('suggestions');

            // normal suggestions
            if (self.isBusinessObjSearchEnabled()) {
                if (suggestionTerm.length >= 3 || !self.isAllCategory()) {
                    // TODO rename
                    self.doNormalSuggestions(suggestionTerm);
                }
            }

            // app suggestions
            if (self.isAllCategory() || self.isAppCategory()) {
                self.doAppSuggestions(suggestionTerm);
            }

            // datasource suggestions
            if (self.isBusinessObjSearchEnabled()) {
                // enable data source suggestions even when a specific data source is currently selected
                // if (self.isAllCategory()) {
                // TODO rename eshDataSourceSuggestions
                self.doDataSourceSuggestions(suggestionTerm);
                // }
            }

        },

        doAppSuggestions: function(suggestionTerm) {
            var self = this;
            var appQuery = self.suggestApplications(suggestionTerm).done(function(resultset) {
                // get app suggestions
                var appSuggestions = resultset.getElements();
                // set type
                jQuery.each(appSuggestions, function(index, appSuggestion) {
                    appSuggestion.type = self.SUGGESTION_TYPE_APPS;
                    appSuggestion.dataSource = self.appDataSource;
                });
                // limit app suggestions
                var appSuggestionLimit;
                if (self.isBusinessObjSearchEnabled() && self.isAllCategory()) {
                    appSuggestionLimit = self.deviceSuggestionLimits.appSuggestion;
                } else {
                    appSuggestionLimit = self.deviceSuggestionLimits.singleAppSuggestion;
                }
                appSuggestions = appSuggestions.slice(0, appSuggestionLimit);
                // prepend app suggestions to mixed section
                var suggestions = self.getProperty("/suggestions");
                suggestions.unshift.apply(suggestions, appSuggestions);
                self.setProperty("/suggestions", suggestions);
            });
        },

        doNormalSuggestions: function(suggestionTerm) {

            var self = this;
            self.suggestionQuery.setSuggestionTerm(suggestionTerm);
            self.suggestionQuery.setDataSource(self.getProperty("/dataSource"));

            self.suggestionQuery.getResultSet().done(function(resultset) {

                // assemble items from result set
                var normalSuggestions = self.assembleNormalSuggestionItems(resultset, suggestionTerm);

                // add datasource label to suggestions label 
                for (var i = 0; i < normalSuggestions.length; i++) {
                    var normalSuggestion = normalSuggestions[i];
                    if (self.isAllCategory() && normalSuggestion.dataSourceLabel) {
                        normalSuggestion.label = normalSuggestion.label +
                            " <i>in " + normalSuggestion.dataSourceLabel + "</i>";
                    }
                }

                // append items to mixed section
                var suggestions = self.getProperty("/suggestions");
                suggestions.push.apply(suggestions, normalSuggestions);
                self.setProperty("/suggestions", suggestions);

            });

        },

        assembleNormalSuggestionItems: function(resultSet, suggestionTerm) {

            // suggestions are returned on three levels, example:
            // term  connector  attribute count level
            // sally all        all       10    1
            // sally employee   all       5     2 
            // sally employee   firstname 4     3
            // sally employee   lastname  1     3
            // sally customer   all       5     2
            // sally customer   name      5     3

            var self = this;
            var suggestions = resultSet.getElements();
            var resultSuggestions = [];
            for (var i = 0; i < suggestions.length; i++) {

                var suggestion = suggestions[i];

                var firstSuggestionTerm;
                if (i === 0) {
                    firstSuggestionTerm = suggestion.labelRaw;
                }

                // ignore all suggestions on attribute level
                if (suggestion.attribute.value !== "$$AllAttributes$$") {
                    continue;
                }

                // repair datasource TODO
                suggestion.dataSource.label = suggestion.dataSource.objectName.label;
                suggestion.dataSource.objectName.label = suggestion.dataSource.objectName.value;
                suggestion.dataSource.type.label = 'View';
                suggestion.dataSource.type.value = 'View';
                suggestion.dataSource.packageName.label = 'ABAP';
                suggestion.dataSource.packageName.value = 'ABAP';

                if (self.isAllCategory()) {
                    // 1. category in dropdown = all
                    if (suggestion.dataSource.getObjectName().value === "$$AllDataSources$$") {
                        // 1.1 suggestion on all level
                        suggestion.dataSource = self.allDataSource;
                    } else {
                        // 1.2 suggestion on connector level
                        if (firstSuggestionTerm === suggestion.labelRaw) {
                            // first suggestion -> suggestion on connector level are allowed
                            suggestion.dataSourceLabel = suggestion.dataSource.getLabel();
                        } else {
                            // ignore suggestion on connector level
                            continue;
                        }
                    }
                } else {
                    // 2. category in dropdown = employee
                    if (suggestion.dataSource.getObjectName().value === "$$AllDataSources$$") {
                        // 2.1 suggestion on all level
                        suggestion.dataSource = self.getProperty("/dataSource");
                        suggestion.dataSourceLabel = suggestion.dataSource.getLabel();
                    } else {
                        // 2.2 suggestion on connector level
                        continue;
                    }
                }

                // No client-side highlighting anymore!
                //suggestion.label = SearchHelper.highlight(suggestion.labelRaw, suggestionTerm);

                // fallback in case that label is blank
                if (jQuery.type(suggestion.label) === "string" && suggestion.label.length < 1) {
                    suggestion.label = suggestion.labelRaw;
                }

                suggestion.type = self.SUGGESTION_TYPE_BO;
                resultSuggestions.push(suggestion);


                if (self.deviceSuggestionLimits.normalSuggestion === resultSuggestions.length) {
                    break;
                }
            }

            return resultSuggestions;

        },

        doDataSourceSuggestions: function(suggestionTerm) {

            var self = this;

            // helper for getting insertion index
            var getInsertionIndex = function(suggestions) {
                for (var i = 0; i < suggestions.length; ++i) {
                    var suggestion = suggestions[i];
                    if (suggestion.type === self.SUGGESTION_TYPE_APPS) {
                        continue;
                    }
                    return i;
                }
                return suggestions.length;
            };

            // get datasource suggestions
            self.suggestDataSources(suggestionTerm, self.deviceSuggestionLimits.dataSourceSuggestion).done(function(dsSuggestions) {
                // insert datasource suggestions into to mixed section                                
                var suggestions = self.getProperty("/suggestions");
                var spliceArgs = [];
                spliceArgs.push(getInsertionIndex(suggestions));
                spliceArgs.push(0);
                spliceArgs.push.apply(spliceArgs, dsSuggestions);
                suggestions.splice.apply(suggestions, spliceArgs);
                self.setProperty("/suggestions", suggestions);
            });

        },

        // All of the following *filterCondition* methods belong to facet functionality
        addFilterCondition: function(facetItem, fireQuery) {
            var self = this,
                filterCondition = facetItem.filterCondition;

            function addItemToFilterConditions(facetItem) {
                var newFilterConditions = self.getProperty("/filterConditions");
                newFilterConditions.push(facetItem);
                self.setProperty("/filterConditions", newFilterConditions);
            }

            if (filterCondition.attribute || filterCondition.conditions) { //is it an attribute filter?
                //TODO: move to searchFireQuery + doNormalsuggestion
                if (!self.query.getFilter().hasFilterCondition(filterCondition)) {
                    self.query.addFilterCondition(filterCondition);
                    addItemToFilterConditions(facetItem);
                }
                if (!self.suggestionQuery.getFilter().hasFilterCondition(filterCondition)) {
                    self.suggestionQuery.addFilterCondition(filterCondition);
                }
                //set flag filter changed
                self.filterChanged = true;
            } else { //or a datasource
                self.setDataSource(filterCondition, false, {
                    source: "facets"
                });
            }

            if (fireQuery || fireQuery === undefined) {
                self._searchFireQuery();
            }
        },

        removeFilterCondition: function(facetItem, fireQuery) {
            var self = this,
                filterCondition = facetItem.filterCondition;

            function removeItemFromFilterConditions(facetItem) {
                var newFilterConditions = self.getProperty("/filterConditions");
                var i = self.getProperty("/filterConditions").length;
                while (i--) {
                    var fc = self.getProperty("/filterConditions")[i].filterCondition;
                    if (fc.equals(facetItem.filterCondition)) {
                        newFilterConditions.splice(i, 1);
                        break;
                    }
                }
                self.setProperty("/filterConditions", newFilterConditions);
            }

            if (filterCondition.attribute) {
                removeItemFromFilterConditions(facetItem);
                self.query.removeFilterCondition(filterCondition.attribute, filterCondition.operator, filterCondition.value);
                self.suggestionQuery.removeFilterCondition(filterCondition.attribute, filterCondition.operator, filterCondition.value);
            } else if (filterCondition.conditions) {
                removeItemFromFilterConditions(facetItem);
                self.query.getFilter().removeFilterConditionGroup(filterCondition);
                self.suggestionQuery.getFilter().removeFilterConditionGroup(filterCondition);
            } else {
                self.setDataSource(filterCondition, false);
            }

            //set flag filter changed
            self.filterChanged = true;

            if (fireQuery || fireQuery === undefined) {
                self._searchFireQuery();
            }
        },

        hasFilterCondition: function(filterCondition) {
            return this.query.getFilter().hasFilterCondition(filterCondition);
        },

        resetFilterConditions: function(fireQuery) {
            var self = this;
            self.query.resetFilterConditions();
            self.suggestionQuery.resetFilterConditions();
            self.setProperty("/filterConditions", []);
            self.query.addFilterCondition('$$RenderingTemplatePlatform$$', '=', 'html');
            self.query.addFilterCondition('$$RenderingTemplateTechnology$$', '=', 'Tempo');
            self.query.addFilterCondition('$$RenderingTemplateVariant$$', '=', '');
            self.query.addFilterCondition('$$RenderingTemplateType$$', '=', 'ItemDetails');
            self.query.addFilterCondition('$$RenderingTemplateType$$', '=', 'ResultItem');
            if (fireQuery || fireQuery === undefined) {
                self._searchFireQuery();
            }
        },

        getFacets: function() {
            var self = this;
            return self.getProperty('/facets');
        },

        getTop: function() {
            return this.getProperty('/top');
        },

        setTop: function(top, fireQuery) {
            this.setProperty('/top', top);
            if (fireQuery || fireQuery === undefined) {
                this._searchFireQuery();
            }
        },

        getSkip: function() {
            return this.getProperty('/skip');
        },

        setSkip: function(skip, fireQuery) {
            this.setProperty('/skip', skip);
            if (fireQuery || fireQuery === undefined) {
                this._searchFireQuery();
            }
        },

        calculatePlaceholder: function() {
            var self = this;
            if (self.isAllCategory()) {
                return sap.ushell.resources.i18n.getText("search");
            } else {
                return sap.ushell.resources.i18n.getText("searchInPlaceholder", self.getDataSource().label);
            }
        },

        setFacetVisibility: function(visibility, fireQuery) {

            var self = this;

            // check for change (special for facet visibility)
            if (visibility === this.getProperty('/facetVisibility')) {
                return;
            }

            // facets are invisible or datasource is on category level or datasource is apps
            // -> set lastFacetVisibility in order to avoid firing a query 
            if (!visibility ||
                self.getDataSource().getType().value === 'Category' ||
                self.isAppCategory()) {

                self.setProperty('/lastFacetVisibility', visibility);

            }

            // set new value
            this.setProperty('/facetVisibility', visibility);

            // fire query 
            if (fireQuery || fireQuery === undefined) {
                this._searchFireQuery();
            }
        },

        getFacetVisibility: function() {
            return this.getProperty('/facetVisibility');
        },

        getDataSource: function() {
            var self = this;
            return self.getProperty("/dataSource");
        },

        setDataSource: function(dataSource, fireQuery, event) {
            var self = this;
            event = event ||  {
                source: ""
            };
            var oldDataSource = self.getProperty('/dataSource');
            var goingUp = false;
            var recentDataSources = self.getProperty("/recentDataSources");
            /*if (dataSource.equals(oldDataSource)) {
                return;
            }*/
            if (true || event.source === "facets") {
                for (var i = 0, len = recentDataSources.length; i < len; i++) {
                    var ds = recentDataSources[i];
                    if (dataSource.equals(ds)) {
                        goingUp = true; //user is navigating up the datasource tree
                        recentDataSources.splice(i, Number.MAX_VALUE);
                        self.setProperty("/recentDataSources", recentDataSources);
                        break;
                    }
                }
                if (!goingUp) {
                    //user is drilling down
                    if (oldDataSource && !this.allDataSource.equals(oldDataSource) && !this.appDataSource.equals(oldDataSource)) {
                        if (this.tabStripFormatter.tree.hasChild(oldDataSource, dataSource)) {
                            recentDataSources.push(oldDataSource);
                        } else {
                            self.setProperty("/recentDataSources", []);
                        }
                    }
                }
                if (this.allDataSource.equals(dataSource)) {
                    self.setProperty("/recentDataSources", []);
                }
            }
            self.resetFilterConditions(false);

            self.updateDataSourceList(dataSource);
            self.setProperty("/dataSource", dataSource);
            self.setProperty("/searchTermPlaceholder", self.calculatePlaceholder());

            // reset top and skip to defaults            
            self.setSkip(0, false);
            if (self.isAppCategory()) {
                self.setTop(self.appTopDefault, false);
            } else {
                self.setTop(self.boTopDefault, false);
            }

            if (fireQuery || fireQuery === undefined) {
                self._searchFireQuery();
            }
        },

        updateDataSourceList: function(newDataSource) {
            // all and apps are surely included in existing list -> return
            if (newDataSource.equals(this.allDataSource) || newDataSource.equals(this.appDataSource)) {
                return;
            }
            // all connectors (!=category) are included in existing list -> return
            if (newDataSource && newDataSource.objectName && newDataSource.objectName.value) {
                if (newDataSource.objectName.value.indexOf('~') >= 0) {
                    return;
                }
            }
            // check in newDataSource exists
            var dataSources = this.getProperty('/dataSources');
            for (var i = 0; i < dataSources.length; ++i) {
                var dataSource = dataSources[i];
                if (dataSource.equals(newDataSource)) {
                    return;
                }
            }
            dataSources.unshift(newDataSource);
            this.setProperty('/dataSources', dataSources);
        },

        resetDataSource: function(fireQuery) {
            this.setDataSource(this.allDataSource, fireQuery);
        },

        getDataSourceJson: function() {
            var self = this;
            var dataSource = self.getProperty("/dataSource");
            var json = {
                //TODO: add datasource.label in SINA, PART1
                "label": dataSource.label,
                "SchemaName": {
                    "label": dataSource.getSchemaName().label,
                    "value": dataSource.getSchemaName().value
                },
                "PackageName": {
                    "label": dataSource.getPackageName().label,
                    "value": dataSource.getPackageName().value
                },
                "ObjectName": {
                    "label": dataSource.getObjectName().label,
                    "value": dataSource.getObjectName().value
                }
            };
            if (dataSource.getType().value) {
                json.Type = dataSource.getType().value;
            }
            return json;
        },

        setDataSourceJson: function(dataSourceJson, fireQuery) {
            var dataSource = this.sina.createDataSource(dataSourceJson);
            this.setDataSource(dataSource, fireQuery);
        },

        getSearchBoxTerm: function() {
            var self = this;
            return self.getProperty("/searchBoxTerm");
        },

        setSearchBoxTerm: function(searchTerm, fireQuery) {
            var self = this;
            var searchTermTrimLeft = searchTerm.replace(/^\s+/, "");
            self.setProperty("/searchBoxTerm", searchTermTrimLeft);
            if (searchTermTrimLeft.length === 0) {
                return;
            }
            if (fireQuery || fireQuery === undefined) {
                self._searchFireQuery();
            }
        },

        // TODO rename firePerspectiveQuery
        _searchFireQuery: function() {
            var self = this;

            // check whether we need to fire the query
            if (self.getProperty('/lastSearchTerm') === self.getProperty('/searchBoxTerm') &&
                self.getProperty('/lastDataSource') === self.getProperty('/dataSource') &&
                self.getProperty('/lastTop') === self.getProperty('/top') &&
                self.getProperty('/lastSkip') === self.getProperty('/skip') &&
                self.getProperty('/lastFacetVisibility') === self.getProperty('/facetVisibility') &&
                (!self.filterChanged)) {
                return;
            }

            // if searchBoxTerm is empty, but lastSearchTerm is not empty, set back the searchBoxTerm 
            if (self.getProperty('/searchBoxTerm').length === 0 &&
                self.getProperty('/lastSearchTerm').length !== 0) {
                self.setProperty('/searchBoxTerm', self.getProperty('/lastSearchTerm'));
            }

            // reset top and skip if search term has changed
            if (self.getProperty('/lastSearchTerm') || self.getProperty('/lastDataSource')) {
                if (self.getProperty('/lastSearchTerm') !== self.getProperty('/searchBoxTerm') ||
                    self.getProperty('/lastDataSource') !== self.getProperty('/dataSource') ||
                    self.filterChanged) {
                    // 1. searchterm, datasource or filter changed -> reset top and skip
                    self.setProperty('/skip', 0);
                    if (self.isAppCategory()) {
                        self.setProperty('/top', self.appTopDefault);
                    } else {
                        self.setProperty('/top', self.boTopDefault);
                    }
                }
            }

            // reset tabstrip formatter if search term changes
            if (self.getProperty('/lastSearchTerm') !== self.getProperty('/searchBoxTerm')) {
                self.tabStripFormatter.markNotSorted();
            }

            // store property in corresponding last properties
            self.setProperty('/lastSearchTerm', self.getProperty('/searchBoxTerm'));
            self.setProperty('/lastDataSource', self.getProperty('/dataSource'));
            self.setProperty('/lastTop', self.getProperty('/top'));
            self.setProperty('/lastSkip', self.getProperty('/skip'));
            self.setProperty('/lastFacetVisibility', self.getProperty('/facetVisibility'));
            self.filterChanged = false;

            // notify view
            sap.ui.getCore().getEventBus().publish("allSearchStarted");

            // abort suggestions
            self.abortSuggestions();

            // abort old async running search calls
            SearchHelper.abortRequests('search');

            // calculate visibility flags for apps and combined result list            
            self.calculateVisibility();

            // update url silently
            this.updateSearchURLSilently();

            // wait for all subsearch queries
            var dataSource = self.getDataSource();
            jQuery.when.apply(null, [self.normalSearch(), self.appSearch()])
                .done(function() {
                    // TODO: precondition for this feature is to start search app through API instead of Url change
                    // because we can not differentiat a search triggert by Url or by input box in shell header
                    //self.autoStartApp();

                    self.setProperty('/tabStrips', self.tabStripFormatter.format(dataSource, self.perspective, self));
                    self.setProperty('/facets', self.oFacetFormatter.getFacets(dataSource, self.perspective, self));
                })
                .always(function() {
                    sap.ui.getCore().getEventBus().publish("allSearchFinished");
                });
        },

        autoStartApp: function() {
            var self = this;
            if (self.getProperty("/appCount") && self.getProperty("/appCount") === 1 && self.getProperty("/count") && self.getProperty("/count") === 1) {
                var aApps = self.getProperty("/appResults");
                if (aApps && aApps.length > 0 && aApps[0] && aApps[0].url && self.getProperty('/searchBoxTerm') && aApps[0].tooltip && self.getProperty('/searchBoxTerm').toLowerCase().trim() === aApps[0].tooltip.toLowerCase().trim()) {
                    if (aApps[0].url[0] === '#') {
                        window.location.href = aApps[0].url;
                    } else {
                        window.open(aApps[0].url, '_blank');
                    }
                }
            }
        },

        calculateVisibility: function() {
            var self = this;
            if (self.isAppCategory()) {
                self.setProperty('/resultsVisibility', false);
                self.setProperty('/appsVisibility', true);
            } else {
                self.setProperty('/resultsVisibility', true);
                self.setProperty('/appsVisibility', false);
            }
        },

        appSearch: function() {
            var self = this;

            if (self.getSkip() === 0) {
                self.setProperty("/appResults", []);
                self.setProperty("/appCount", 0);
            }

            if (self.isAllCategory() || self.isAppCategory()) {
                // 1. search
                var topAndSkip = self.calculateTopAndSkip(self.getTop(), self.getSkip(), self.getProperty('/appResults'));
                return self.searchApplications(self.getProperty('/searchBoxTerm'),
                    topAndSkip.top, topAndSkip.skip).then(function(oResult) {
                    // 1.1 search call succeeded
                    self.setProperty("/appCount", oResult.totalResults);
                    if (self.getSkip() > 0) {
                        var apps = self.getProperty("/appResults").slice();
                        apps.push.apply(apps, oResult.getElements());
                        self.setProperty("/appResults", apps);
                    } else {
                        self.setProperty("/appResults", oResult.getElements());
                    }
                    sap.ui.getCore().getEventBus().publish("appSearchFinished", oResult);
                }, function() {
                    // 1.2 search call failed
                    sap.ui.getCore().getEventBus().publish("appSearchFinished");
                    return jQuery.when(true); // make deferred returned by "then" resolved
                });
            } else {
                // 2. do not search                
                self.setProperty("/appResults", []);
                self.setProperty("/appCount", 0);
                sap.ui.getCore().getEventBus().publish("appSearchFinished");
            }
        },

        normalSearch: function() {
            var self = this;

            if (self.getSkip() === 0) {
                self.setProperty("/boResults", []);
                self.setProperty("/boCount", 0);
            }

            if (self.isBusinessObjSearchEnabled() && !self.isAppCategory()) {
                // 1.search
                self.query.setSearchTerms(self.getSearchBoxTerm());
                self.query.setDataSource(self.getDataSource());
                var topAndSkip = self.calculateTopAndSkip(self.getTop(), self.getSkip(), self.getProperty('/boResults'));
                self.query.setTop(topAndSkip.top);
                self.query.setSkip(topAndSkip.skip);
                if ((self.getFacetVisibility() && self.isFacetSearchEnabled()) ||
                    self.getDataSource().getType().value === 'Category') {
                    self.query.setExpand(['Grid', 'Items', 'ResultsetFacets', 'TotalCount']);
                } else {
                    self.query.setExpand(['Grid', 'Items', 'TotalCount']);
                }
                return self.query.getResultSet().then(function(perspective) {
                    // 1.1 search succeeded
                    self.perspective = perspective;
                    self._afterSearchPrepareResultList(self.perspective, self.getSkip() > 0);
                    sap.ui.getCore().getEventBus().publish("normalSearchFinished", {
                        append: self.getSkip() > 0,
                        resultset: self.perspective
                    });
                }, function(error) {
                    // 1.2 search failed                    
                    sap.ui.getCore().getEventBus().publish("normalSearchFinished", {
                        append: self.getSkip() > 0,
                        resultset: null
                    });
                    self.normalSearchErrorHandling(error);
                    self.perspective = null;
                    return jQuery.when(true); // make deferred returned by "then" resolved
                });
            } else {
                // 2. do not search
                self.setProperty("/boResults", []);
                self.setProperty("/boCount", 0);
                sap.ui.getCore().getEventBus().publish("normalSearchFinished", {
                    append: self.getSkip() > 0,
                    resultset: null
                });
            }
        },

        calculateTopAndSkip: function(top, skip, results) {
            var count = results.length;
            if (results.length > 0) {
                var last = results[results.length - 1];
                if (last.type === 'footer') {
                    count -= 1;
                }
            }
            return {
                top: skip + top - count,
                skip: count
            };
        },

        normalSearchErrorHandling: function(error) {

            // example error:
            // error = {};
            // error.responseText = '{"Error":{"Code":200,"Message":"Engine-Fehler"},"ErrorDetails":[{"Code":"ESH_FED_MSG020","Message":"Suchumfang ist nicht gültig HT3360~EPM_EMPLOYEES_DEMO~"}]}';
            // error.responseText = '{"Error":{"Code":200,"Message":"Engine error"},"ErrorDetails":[{"Code":"ESH_FED_MSG016",
            // "Message":"No authorization for the given list of connectors"}]}';

            //these ina service errors shall not appear as popups:
            var ignoredErrors = ["ESH_FED_MSG016"]; //<- No authorization for the given list of connectors,
            //or no connectors active (i.e. only app search is used)

            if (error) {
                if (error.responseText) {
                    var showErrorPopup = true;
                    var inaErr = jQuery.parseJSON(error.responseText);
                    var errMsg = '';
                    var detailMsg = '';
                    if (inaErr.Error) {
                        if (inaErr.Error.Message) {
                            errMsg += '' + inaErr.Error.Message;
                        }
                        if (inaErr.Error.Code) {
                            errMsg += ' (Code ' + inaErr.Error.Code + ').';
                        }
                    }
                    if (inaErr.ErrorDetails) {
                        detailMsg += '';
                        for (var i = 0; i < inaErr.ErrorDetails.length; i++) {
                            detailMsg += inaErr.ErrorDetails[i].Message + ' (Code ' + inaErr.ErrorDetails[i].Code + ')';
                            if (ignoredErrors.indexOf(inaErr.ErrorDetails[i].Code) !== -1) {
                                showErrorPopup = false;
                            }
                        }
                    }
                    jQuery.sap.log.error(errMsg + ' Details: ' + detailMsg);
                    if (showErrorPopup) {
                        jQuery.sap.require("sap.m.MessageBox");
                        sap.m.MessageBox.alert(detailMsg, {
                            title: "Search Error: " + errMsg,
                            icon: sap.m.MessageBox.Icon.ERROR
                        });
                    }
                } else {
                    var message = 'Search error:' + error.toString();
                    jQuery.sap.log.error(message);
                    jQuery.sap.require("sap.m.MessageBox");
                    sap.m.MessageBox.alert(message, {
                        title: 'Search Error',
                        icon: sap.m.MessageBox.Icon.ERROR
                    });
                }
            }
        },

        _afterSearchPrepareResultList: function(perspective, append) {
            var self = this;

            var oldResults = self.getProperty("/boResults");
            if (append) {
                oldResults.pop(); //Remove footer
            }

            var formatter = new SearchResultListFormatter();
            var results = formatter.format(perspective.getSearchResultSet(), this.query.filter.searchTerms);
            var newResults = oldResults.concat(results);

            //TODO move footer to control
            //Add footer
            //There is more
            if (newResults.length < perspective.getSearchResultSet().totalcount) {
                var resultListFooter = {};
                resultListFooter.type = "footer";
                newResults.push(resultListFooter);
            }

            self.setProperty("/resultListHeading", sap.ushell.resources.i18n.getText("searchResults"));
            self.setProperty("/boCount", perspective.getSearchResultSet().totalcount);
            self.setProperty("/boResults", newResults);
        },

        createSearchURL: function() {

            // prefix
            var sHash = "#Action-search";

            // searchterm 
            sHash += "&/searchterm=" + encodeURIComponent(this.getProperty('/searchBoxTerm'));

            // datasource
            sHash += "&datasource=" + encodeURIComponent(JSON.stringify(this.getDataSourceJson()));

            // top
            sHash += "&top=" + this.getTop();

            // skip
            sHash += "&skip=" + this.getSkip();

            // filter conditions            
            if (this.getProperty("/filterConditions").length > 0) {
                sHash += "&filter=" +
                    encodeURIComponent(JSON.stringify(this.getProperty("/filterConditions")));
            }

            return sHash;
        },

        updateSearchURLSilently: function(sHash) {
            if (!this.updateUrl) {
                return;
            }
            sHash = sHash ||  this.createSearchURL();
            //window.hasher.changed.active = false; //disable changed signal
            //window.hasher.setHash(sHash); //set hash without dispatching changed signal            
            //window.hasher.changed.active = true; //re-enable signal
            SearchHelper.hasher.setHash(sHash);
        },

        hashChanged: function(oParameters, fireQuery) {

            // make parameters lowercase
            var oParametersLowerCased = {};
            jQuery.each(oParameters, function(i, v) {
                oParametersLowerCased[i.toLowerCase()] = v[0]; // decode happens in app view deserialize url
            });

            // search term
            if (!oParametersLowerCased.searchterm) {
                return;
            }
            var searchTerm = oParametersLowerCased.searchterm;
            this.setSearchBoxTerm(searchTerm, false);

            // datasource
            var dataSource;
            if (oParametersLowerCased.datasource) {
                var dataSourceJson = JSON.parse(oParametersLowerCased.datasource);
                dataSource = this.sina.createDataSource(dataSourceJson);
                this.setDataSource(dataSource, false);
            } else {
                this.resetDataSource(false);
            }

            // top
            if (oParametersLowerCased.top) {
                var top = parseInt(oParametersLowerCased.top);
                this.setTop(top, false);
            }

            // skip
            if (oParametersLowerCased.skip) {
                var skip = parseInt(oParametersLowerCased.skip);
                this.setSkip(skip, false);
            }

            // filter conditions
            this.resetFilterConditions(false);
            if (oParametersLowerCased.filter) {
                var facetItems = JSON.parse(oParametersLowerCased.filter);
                for (var i = 0, len = facetItems.length; i < len; i++) {
                    var facetItem = new sap.ushell.renderers.fiori2.search.FacetItem(facetItems[i]);
                    this.addFilterCondition(facetItem, false);
                }
            }
            if (fireQuery || fireQuery === undefined) {
                this._searchFireQuery();
            }
        },

        // only to be called from outside
        navigateToSearchApp: function() {

            if (this.getProperty('/searchBoxTerm') === "") {
                return;
            }

            var sHash = this.createSearchURL();
            window.location.hash = sHash;

        }

    });

})(window);

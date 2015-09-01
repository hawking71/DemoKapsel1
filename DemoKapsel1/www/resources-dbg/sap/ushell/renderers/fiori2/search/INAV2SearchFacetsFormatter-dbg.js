// TODO Mathias
// TODO iteration 0

(function() {
    "use strict";



    jQuery.sap.declare('sap.ushell.renderers.fiori2.search.INAV2SearchFacetsFormatter');
    var module = sap.ushell.renderers.fiori2.search.INAV2SearchFacetsFormatter = function() {
        this.init.apply(this, arguments);
    };

    module.prototype = {
        init: function() {
            this.level = 0;
        },

        enhanceDataSource: function(dataSource) {
            if (!dataSource) {
                return;
            }
            if (!dataSource.label) {
                dataSource.label = dataSource.objectName.label;
            }
            dataSource.key = dataSource.objectName.value;
            return dataSource;
        },

        getAllDataSourceFacetItem: function(oSearchModel) {
            var allDataSource = oSearchModel.allDataSource;
            var fi = new FacetItem({
                label: allDataSource.label,
                filterCondition: allDataSource,
                selected: oSearchModel.getProperty("/dataSource").equals(allDataSource),
                level: 0
            });
            if (fi.selected) {
                //count is only correct if all is selected
                fi.value = oSearchModel.getProperty("/boCount") + oSearchModel.getProperty("/appCount");
            }
            return fi;
        },

        getAppsDataSourceFacetItem: function(oSearchModel) {
            var appDataSource = oSearchModel.appDataSource;
            var fi = new FacetItem({
                label: appDataSource.label,
                filterCondition: appDataSource,
                selected: oSearchModel.getProperty("/dataSource").equals(appDataSource),
                value: oSearchModel.getProperty("/appCount"),
                level: 1
            });
            return fi;
        },

        _getRecentDataSourcesTree: function(oSearchModel) {
            var self = this;
            var aRecentDataSources = [];
            for (var i = 0, len = oSearchModel.getProperty('/recentDataSources').length; i < len; i++) {
                var ds = oSearchModel.getProperty('/recentDataSources')[i];
                if (!ds) {
                    continue;
                }
                this.level++;
                ds = this.enhanceDataSource(ds);
                var dsFacetItem = new FacetItem({
                    label: ds.label,
                    filterCondition: ds,
                    selected: false,
                    level: self.level
                });
                aRecentDataSources.push(dsFacetItem);
            }
            return aRecentDataSources;
        },

        _getDataSourceFacet: function(oSearchModel) {
            var oDataSourceFacet = new Facet({
                facetType: "datasource",
                title: "Search In"
            });
            var self = this;
            this.level = 0;
            if (!oSearchModel.getProperty("/dataSource").equals(oSearchModel.allDataSource)) {
                // show all data source if it is not already selected
                oDataSourceFacet.items.push(this.getAllDataSourceFacetItem(oSearchModel));
            }
            if (oSearchModel.getProperty("/dataSource").equals(oSearchModel.allDataSource) || oSearchModel.getProperty("/dataSource").equals(oSearchModel.appDataSource)) {
                //show apps facetitem only if all or apps is selected data source
                oDataSourceFacet.items.push(this.getAppsDataSourceFacetItem(oSearchModel));
                if (oSearchModel.getProperty("/dataSource").equals(oSearchModel.appDataSource)) {
                    return oDataSourceFacet;
                }
            }
            oDataSourceFacet.items.push.apply(oDataSourceFacet.items, this._getRecentDataSourcesTree(oSearchModel));
            var ds = this.enhanceDataSource(oSearchModel.getDataSource());
            this.level++;
            var currentDSFacetItem = new FacetItem({
                label: ds.label,
                value: oSearchModel.getProperty("/boCount"),
                filterCondition: ds,
                selected: true,
                level: self.level
            });
            oDataSourceFacet.items.push(currentDSFacetItem);
            if (oSearchModel.getProperty("/dataSource").equals(oSearchModel.allDataSource)) {
                currentDSFacetItem.level = 0;
                // are there apps found?
                if (oSearchModel.getProperty("/appCount") === 0) {
                    // no apps found, then dont show apps facet item
                    oDataSourceFacet.items.splice(0, 1);
                } else {
                    // apps were found, if all was selected reorder apps below all
                    var apps = oDataSourceFacet.items[0];
                    oDataSourceFacet.items[0] = oDataSourceFacet.items[1];
                    oDataSourceFacet.items[1] = apps;
                    currentDSFacetItem.value = oSearchModel.getProperty("/boCount") + oSearchModel.getProperty("/appCount");
                }
            }
            return oDataSourceFacet;
        },

        getDataSourceFacetFromPerspective: function(oINAPerspective, oSearchModel) {
            var aFacetListItems = [],
                aAllDataSourceFacetItems = oINAPerspective.getChartFacets().filter(function(element) {
                    return element.facetType === "datasource";
                }),
                oDataSourceFacet = this._getDataSourceFacet(oSearchModel),
                self = this;

            if (aAllDataSourceFacetItems.length === 0 || oSearchModel.getProperty("/dataSource").equals(oSearchModel.appDataSource)) {
                //no other data sources to see here
                return oDataSourceFacet;
            }

            aAllDataSourceFacetItems = aAllDataSourceFacetItems[0].query.resultSet.elements;
            this.level++;
            for (var i = 0, len = aAllDataSourceFacetItems.length; i < len; i++) {
                var ds = this.enhanceDataSource(aAllDataSourceFacetItems[i].dataSource);
                var fi = new FacetItem({
                    label: ds.label,
                    value: aAllDataSourceFacetItems[i].valueRaw,
                    filterCondition: ds,
                    selected: oSearchModel.getProperty("/dataSource").equals(ds),
                    level: self.level
                });
                if (oSearchModel.getProperty("/dataSource").equals(oSearchModel.allDataSource)) {
                    // dont indent child datasources if all is selected datasource
                    fi.level = 1;
                }
                oDataSourceFacet.items.push(fi);
            }
            return oDataSourceFacet;
        },

        getAttributeFacetsFromPerspective: function(resultSet, oSearchModel) {
            var self = this;
            var aServerSideFacets = resultSet.getChartFacets().filter(function(element) {
                return element.facetType === "attribute";
            });
            var aClientSideFacets = [];
            var aClientSideFacetsByTitle = {};
            var aSelectedFacetItems = oSearchModel.getProperty("/filterConditions");

            // extract facets from server response:
            for (var i = 0, len = aServerSideFacets.length; i < len; i++) {
                var oServerSideFacet = aServerSideFacets[i];
                var oClientSideFacet = new Facet({
                    title: oServerSideFacet.title,
                    facetType: oServerSideFacet.facetType,
                    dimension: oServerSideFacet.dimension
                });
                if (!oServerSideFacet.query.resultSet || !oServerSideFacet.query.resultSet.elements || oServerSideFacet.query.resultSet.elements.length === 0) {
                    continue;
                }
                for (var j = 0; j < oServerSideFacet.query.resultSet.elements.length; j++) {
                    var oFacetListItem = oServerSideFacet.query.resultSet.elements[j];
                    var item = new FacetItem({
                        value: oFacetListItem.valueRaw,
                        filterCondition: oFacetListItem.dataSource || oFacetListItem.labelRaw,
                        facetTitle: oServerSideFacet.title,
                        label: oFacetListItem.label,
                        selected: oSearchModel.hasFilterCondition(oFacetListItem.labelRaw),
                        level: 0
                    });
                    if (item.selected === true) {
                        if (oClientSideFacet.hasFilterCondition(item.filterCondition)) {
                            oClientSideFacet.removeItem(item);
                        }
                    }
                    if (item.selected === false) {
                        if (!oClientSideFacet.hasFilterCondition(item.filterCondition)) {
                            oClientSideFacet.items.push(item);
                        }
                    }

                }
                aClientSideFacetsByTitle[oServerSideFacet.title] = oClientSideFacet;
                aClientSideFacets.push(oClientSideFacet);
            }

            // add already selected facet items:
            for (var k = 0, lenK = aSelectedFacetItems.length; k < lenK; k++) {
                var oSelectedFacetItem = aSelectedFacetItems[k];
                var oClientSideFacetWithSelection = aClientSideFacetsByTitle[oSelectedFacetItem.facetTitle];
                oSelectedFacetItem.selected = true;
                if (!oClientSideFacetWithSelection) {
                    oClientSideFacetWithSelection = new Facet({
                        title: oSelectedFacetItem.facetTitle,
                        facetType: "attribute",
                        items: [oSelectedFacetItem]
                    });
                    aClientSideFacetsByTitle[oSelectedFacetItem.facetTitle] = oClientSideFacetWithSelection;
                    aClientSideFacets.splice(k, 0, oClientSideFacetWithSelection);
                } else {
                    // there is already a facet with the same filter condition -> merge the item into this facet
                    // if the same facet item already exists just select it
                    var facetItemFoundInFacet = false;
                    for (var m = 0, lenM = oClientSideFacetWithSelection.items.length; m < lenM; m++) {
                        var facetItem = oClientSideFacetWithSelection.items[m];
                        if (oSelectedFacetItem.filterCondition.equals(facetItem.filterCondition)) {
                            facetItem.selected = true;
                            facetItemFoundInFacet = true;
                        }
                    }
                    if (!facetItemFoundInFacet) {
                        // there is no such facet item -> add the facet item to the facet
                        oClientSideFacetWithSelection.items.splice(0, 0, oSelectedFacetItem);
                    }
                }
            }

            return aClientSideFacets;
        },

        getFacets: function(oDataSource, oINAPerspective, oSearchModel) {

            // return without perspective
            if (!oINAPerspective) {
                return;
            }

            // generate datasource facet
            var aFacets = [this.getDataSourceFacetFromPerspective(oINAPerspective, oSearchModel)];

            // check attribute facets enabled
            if (!oSearchModel.isFacetSearchEnabled()) {
                return aFacets;
            }

            // generate attribute facets
            if (!oDataSource.equals(oSearchModel.appDataSource)) {
                var aAttributeFacets = this.getAttributeFacetsFromPerspective(oINAPerspective, oSearchModel);
                if (aAttributeFacets.length > 0) {
                    aFacets.push.apply(aFacets, aAttributeFacets);
                }
            }

            return aFacets;
        }

    };

    jQuery.sap.declare('sap.ushell.renderers.fiori2.search.Facet');
    var Facet = sap.ushell.renderers.fiori2.search.Facet = function() {
        this.init.apply(this, arguments);
    };

    Facet.prototype = {

        init: function(properties) {
            this.title = properties.title;
            this.facetType = properties.facetType; //datasource or attribute
            this.dimension = properties.dimension;
            this.items = properties.items || [];
        },

        hasFilterCondition: function(filterCondition) {
            for (var i = 0, len = this.items.length; i < len; i++) {
                var fc = this.items[i].filterCondition || this.items[i];
                if (fc.equals && fc.equals(filterCondition)) {
                    return true;
                }
            }
            return false;
        },

        removeItem: function(facetItem) {
            for (var i = 0, len = this.items.length; i < len; i++) {
                var fc = this.items[i].filterCondition || this.items[i];
                if (fc.equals && facetItem.filterCondition && fc.equals(facetItem.filterCondition)) {
                    return this.items.splice(i, 1);
                }
            }
        }

    };

    jQuery.sap.declare('sap.ushell.renderers.fiori2.search.FacetItem');
    var FacetItem = sap.ushell.renderers.fiori2.search.FacetItem = function() {
        this.init.apply(this, arguments);
    };

    FacetItem.prototype = {

        init: function(properties) {
            var sina = sap.ushell.Container.getService("Search").getSina();
            this.id = properties.id;
            this.label = properties.label;
            this.value = properties.value;
            this.facetTitle = properties.facetTitle || "";
            if (properties.filterCondition.attribute) { //is it an attribute filter?
                //TODO: move to searchFireQuery + doNormalsuggestion
                var condition = this.createSinaFilterCondition(properties.filterCondition);
                this.filterCondition = condition;
            } else if (properties.filterCondition.conditions) { //or a filter group
                var conditionGroup = sina.createFilterConditionGroup(properties.filterCondition);
                for (var i = 0, len = conditionGroup.conditions.length; i < len; i++) {
                    //replace plain objects with instances of sina filter conditions
                    conditionGroup.conditions[i] =
                        this.createSinaFilterCondition(conditionGroup.conditions[i]);
                }
                this.filterCondition = conditionGroup;
            } else {
                this.filterCondition = properties.filterCondition;
            }
            this.selected = properties.selected;
            this.level = properties.level ||  0;
        },

        equals: function(otherFacetItem) {
            return (this.id === otherFacetItem.id && this.label === otherFacetItem.label && this.value === otherFacetItem.value && this.filterCondition.equals(otherFacetItem.filterCondition));
        },

        createSinaFilterCondition: function(properties) {
            // special create logic: inav2 extended properties need to be passed to 
            // sina filter constructor on properties level
            // otherwise recursive structures will be created
            var sina = sap.ushell.Container.getService("Search").getSina();
            if (properties.inaV2_extended_properties) {
                var newProperties = $.extend({}, properties);
                delete newProperties.inaV2_extended_properties;
                var inaV2_extended_properties = $.extend({}, properties.inaV2_extended_properties);
                delete inaV2_extended_properties.attribute;
                delete inaV2_extended_properties.operator;
                delete inaV2_extended_properties.value;
                newProperties = $.extend(newProperties, inaV2_extended_properties);

                return sina.createFilterCondition(newProperties);
            } else {
                return sina.createFilterCondition(properties);
            }
        }

    };

})();

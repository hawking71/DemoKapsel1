/* global jQuery,sap */
// iteration 0 ok

(function() {
    "use strict";

    jQuery.sap.declare('sap.ushell.renderers.fiori2.search.SearchResultListFormatter');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchHelper');
    var SearchHelper = sap.ushell.renderers.fiori2.search.SearchHelper;
    var module = sap.ushell.renderers.fiori2.search.SearchResultListFormatter = function() {
        this.init.apply(this, arguments);
    };

    module.prototype = {
        init: function() {

        },

        format: function(searchResultSet, terms) {

            return this._doFormat(searchResultSet.getElements(), terms);
        },

        _getImageUrl: function(result) {

            var imageAttr = {
                imageUrl: '',
                name: ''
            };

            // loop at all properties
            for (var prop in result) {

                var attribute = result[prop];

                // check for image
                var isImage = false;
                try {
                    if (attribute.value &&
                        attribute.$$MetaData$$.presentationUsage.indexOf('Thumbnail') >= 0) {
                        isImage = true;
                    }
                } catch (e) {}
                if (!isImage) {
                    continue;
                }

                // image found -> set return value + return
                imageAttr.imageUrl = attribute.value;
                imageAttr.name = prop;
                return imageAttr;

            }
            return imageAttr;
        },

        _moveWhyFound2ResponseAttr: function(whyfounds, property) {
            var l = whyfounds.length;
            while (l--) {
                if (whyfounds[l].labelRaw === property.labelRaw && property !== undefined) {
                    property.value = whyfounds[l].value;
                    property.whyfound = true;
                    whyfounds.splice(l, 1);
                }
            }
        },

        _appendRemainingWhyfounds2FormattedResultItem: function(whyfounds, aItemAttributes) {
            var l = whyfounds.length;
            while (l--) {
                if (whyfounds[l].labelRaw !== undefined) {
                    var oItemAttribute = {};
                    oItemAttribute.name = whyfounds[l].label;
                    oItemAttribute.value = whyfounds[l].value;
                    oItemAttribute.whyfound = true;
                    aItemAttributes.push(oItemAttribute);
                    whyfounds.splice(l, 1);
                }
            }
        },

        _doFormat: function(results, terms) {

            //sort against displayOrder
            var sortDisplayOrder = function(a, b) {
                return a.displayOrder - b.displayOrder;
            };

            // instantiate Tester with search terms
            var oTester = new SearchHelper.Tester(terms);
            var oTestResult;

            var formattedResults = [];
            for (var i = 0; i < results.length; i++) {
                var result = results[i];

                //get uri of factsheet
                var uri = '';
                var relatedActions = result.$$RelatedActions$$;
                for (var relatedAction in relatedActions) {
                    if (relatedActions[relatedAction].type === "Navigation") {
                        uri = relatedActions[relatedAction].uri;
                    }
                }

                //
                var whyfounds = result.$$WhyFound$$ || [];
                var summaryAttrs = [];
                var detailAttrs = [];
                var title = '';

                for (var prop in result) {
                    //ignore prop without label and metadata
                    if (!result[prop].label || !result[prop].$$MetaData$$) {
                        continue;
                    }

                    var presentationUsage = result[prop].$$MetaData$$.presentationUsage || [];
                    if (presentationUsage && presentationUsage.length > 0) {
                        if (presentationUsage.indexOf("Title") > -1 && result[prop].value) {
                            this._moveWhyFound2ResponseAttr(whyfounds, result[prop]);
                            title = title + " " + result[prop].value;
                        }
                        if (presentationUsage.indexOf("Summary") > -1) {
                            summaryAttrs.push({
                                property: prop,
                                displayOrder: result[prop].$$MetaData$$.displayOrder
                            });
                        } else if (presentationUsage.indexOf("Detail") > -1) {
                            detailAttrs.push({
                                property: prop,
                                displayOrder: result[prop].$$MetaData$$.displayOrder
                            });
                        }
                    }
                }

                summaryAttrs.sort(sortDisplayOrder);
                detailAttrs.sort(sortDisplayOrder);

                var displayRelevantAttrs = summaryAttrs.concat(detailAttrs);
                var formattedResult = {};
                var imageAttr = this._getImageUrl(result);
                formattedResult.imageUrl = imageAttr.imageUrl;
                oTestResult = oTester.test(result.$$DataSourceMetaData$$.label);
                formattedResult.dataSourceName = oTestResult.bMatch === true ? oTestResult.sHighlightedText : result.$$DataSourceMetaData$$.label;
                //formattedResult.dataSourceName = SearchHelper.highlight(result.$$DataSourceMetaData$$.label, terms);
                formattedResult.uri = uri;
                formattedResult.$$Name$$ = '';

                var aItemAttributes = [];
                for (var z = 0; z < displayRelevantAttrs.length; z++) {
                    var propDisplay = displayRelevantAttrs[z].property;
                    var oItemAttribute = {};
                    // image attribute shall not be displayed as a normal key value pair
                    if (propDisplay !== imageAttr.name) {
                        this._moveWhyFound2ResponseAttr(whyfounds, result[propDisplay]);
                        oItemAttribute.name = result[propDisplay].label;
                        oItemAttribute.value = result[propDisplay].value;
                        if (result[propDisplay].whyfound) {
                            oItemAttribute.whyfound = result[propDisplay].whyfound;
                        }
                        aItemAttributes.push(oItemAttribute);
                    }
                }

                formattedResult.$$Name$$ = title.trim();
                formattedResult.numberofattributes = displayRelevantAttrs.length;
                formattedResult.title = result.title;
                formattedResult.itemattributes = aItemAttributes;
                this._appendRemainingWhyfounds2FormattedResultItem(whyfounds, formattedResult.itemattributes);
                formattedResults.push(formattedResult);
            }


            return formattedResults;

        }
    };

})();

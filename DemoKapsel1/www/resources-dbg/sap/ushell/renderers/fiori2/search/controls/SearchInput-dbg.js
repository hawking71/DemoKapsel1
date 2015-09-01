/* global jQuery, sap, window */
(function() {
    "use strict";

    jQuery.sap.require('sap.m.Input');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchHelper');
    var searchHelper = sap.ushell.renderers.fiori2.search.SearchHelper;

    // start search 
    // event               desktop+tablet         phone
    // change              fired/not used a)d)   fired/used
    // sapenter            fired/used            not fired/not used

    // request suggestions
    // event               desktop/tablet   phone
    // liveChange          fired/used       fired/used

    // mouseclick on suggestion
    // sequence  event                         desktop/table        phone
    // 1         change                        fired/not used a)    fired/not used b)    
    // 2         suggestionItemSelected        fired/used           fired/used
    // 3         sapenter                      not fired            not fired

    // enter on suggestion
    // sequence  event                         desktop/table       phone (action not possible)
    // 1         change                        fired/not used a)              
    // 2         suggestionItemSelected        fired/used               
    // 3         sapenter                      fired/not used c)              

    // a) prevented by if in change event handler
    // b) prevented by time shift logic (setTimeout in handleChangeSearchInput)
    // c) prevented by checks for changing searchTerm/datgasource/paging/filterCondition in searchFireQuery method of searchModel
    // d) search input looses focus -> triggers change -> not wanted on desktop: do not register on change event instead register on sapenter event

    sap.m.Input.extend('sap.ushell.renderers.fiori2.search.controls.SearchInput', {

        constructor: function(sId, oOptions) {
            var self = this;
            oOptions = jQuery.extend({}, {
                showValueStateMessage: false,
                showTableSuggestionValueHelp: false,
                showSuggestion: true,
                filterSuggests: false,
                suggestionColumns: [new sap.m.Column({})],
                placeholder: {
                    path: '/searchTermPlaceholder',
                    mode: sap.ui.model.BindingMode.OneWay
                }
            }, oOptions);
            sap.m.Input.prototype.constructor.apply(this, [sId, oOptions]);
            this.addEventDelegate({
                onsapenter: function(oEvent) {
                    self.triggerSearch(oEvent);
                }
            });
            this.bindAggregation("suggestionRows", "/suggestions", function(sId, oContext) {
                return self.suggestionItemFactory(sId, oContext);
            });
            this.addStyleClass('searchInput');
        },

        renderer: 'sap.m.InputRenderer',

        fireChange: function(oEvent) {
            sap.m.Input.prototype.fireChange.apply(this, arguments);
            if (sap.ui.Device.system.phone) {
                this.triggerSearch(oEvent);
            }
        },

        triggerSearch: function(oEvent) {
            var self = this;
            // workaround: when selecting a suggestion two events are fired:
            // 1) fireChange
            // 2) doHandleSuggestionItemSelected
            // we want to have only one event (the suggestion doHandleSuggestionItemSelected event)
            // because only one query shall be executed 
            // --> shift fireChange to the future so that
            // doHandleSuggestionItemSelected handler can abort fireChange            
            this.changeTimer = window.setTimeout(function() {
                self.changeTimer = null;
                if (self.getId() === "searchInputShell") {
                    self.getModel().setSearchBoxTerm(self.getValue(), false);
                    self.getModel().navigateToSearchApp();
                } else {
                    self.getModel().setSearchBoxTerm(self.getValue());
                }
                self.destroySuggestionRows();
                self.getModel().abortSuggestions();
            }, 100);
        },

        fireLiveChange: function() {
            sap.m.Input.prototype.fireLiveChange.apply(this, arguments);
            var suggestTerm = this.getValue();
            var oModel = this.getModel();
            oModel.setSearchBoxTerm(suggestTerm, false);
            if (oModel.getSearchBoxTerm().length > 0) {
                oModel.doSuggestion();
            } else {
                this.destroySuggestionRows();
                oModel.abortSuggestions();
            }
        },

        fireSuggestionItemSelected: function(oEvent) {
            sap.m.Input.prototype.fireSuggestionItemSelected.apply(this, arguments);
            if (this.changeTimer) {
                window.clearTimeout(this.changeTimer);
                this.changeTimer = null;
            }
            this.doHandleSuggestionItemSelected(oEvent);
        },

        doHandleSuggestionItemSelected: function(oEvent) {
            var oModel = this.getModel();
            var suggestion = oEvent.selectedRow.getBindingContext().getObject();
            var searchTerm = suggestion.labelRaw;
            var dataSource = suggestion.dataSource;
            var targetURL = suggestion.url;
            var type = suggestion.type;

            switch (type) {
                case oModel.SUGGESTION_TYPE_APPS:
                    // app suggestions -> start app
                    if (targetURL[0] === '#') {
                        window.location.href = targetURL;
                    } else {
                        window.open(targetURL, '_blank');
                    }
                    break;
                case oModel.SUGGESTION_TYPE_DATASOURCE:
                    // data source suggestions
                    oModel.setDataSource(dataSource, false);
                    oModel.setSearchBoxTerm('', false);
                    this.focus();
                    break;
                case oModel.SUGGESTION_TYPE_BO:
                    // search term suggestion -> write search term to hash
                    oModel.setDataSource(dataSource, false);
                    if (oEvent.id === "searchInputShell") {
                        oModel.setSearchBoxTerm(searchTerm, false);
                        oModel.navigateToSearchApp();
                    } else {
                        oModel.setSearchBoxTerm(searchTerm);
                    }
                    this.setValue(searchTerm);
                    break;
            }
        },


        suggestionItemFactory: function(sId, oContext) {

            // return for empty search term
            if (!this.getValue()) {
                return null;
            }

            // prefix App only for app suggestions
            var app = new sap.m.Label({
                text: {
                    path: "icon",
                    formatter: function(sValue) {
                        if (sValue) {
                            return "<i>" + sap.ushell.resources.i18n.getText("label_app") + "</i>";
                        }
                        return "";
                    }
                }
            }).addStyleClass('suggestText').addStyleClass('suggestNavItem');
            app.addEventDelegate({
                onAfterRendering: function() {
                    searchHelper.boldTagUnescaper(this.getDomRef());
                }
            }, app);

            // suggestion icon (only filled for app suggestions)
            var icon = new sap.ui.core.Icon({
                src: "{icon}"
            }).addStyleClass('suggestIcon').addStyleClass('suggestAppIcon');

            // create label with suggestions term
            var label = new sap.m.Label({
                text: "{label}"
            }).addStyleClass('suggestText').addStyleClass('suggestNavItem');
            label.addEventDelegate({
                onAfterRendering: function() {
                    searchHelper.boldTagUnescaper(this.getDomRef());
                }
            }, label);

            // combine app, icon and label into cell 
            var cell = new sap.m.CustomListItem({
                type: sap.m.ListType.Active,
                content: [app, icon, label]
            });
            var suggestion = oContext.oModel.getProperty(oContext.sPath);
            cell.getText = function() {
                return suggestion.labelRaw ? suggestion.labelRaw : '';
            };
            return new sap.m.ColumnListItem({
                cells: [cell],
                type: "Active"
            });
        }

    });

})();

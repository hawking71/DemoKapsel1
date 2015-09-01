// iteration 0 ok
/* global jQuery, sap, window */
(function() {
    "use strict";

    jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchHelper');
    var SearchHelper = sap.ushell.renderers.fiori2.search.SearchHelper;
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.controls.SearchInput');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.controls.SearchSelect');
    jQuery.sap.require("sap.ushell.renderers.fiori2.search.SearchModel");

    jQuery.sap.declare('sap.ushell.renderers.fiori2.search.SearchShellHelper');
    var module = sap.ushell.renderers.fiori2.search.SearchShellHelper = {};
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.SemanticObjectsHandler');
    var SemanticObjectsHandler = sap.ushell.renderers.fiori2.search.SemanticObjectsHandler;

    jQuery.extend(module, {

        init: function(oShellView) {
            var self = this;

            // member fields
            this.oShellView = oShellView;
            this.oShell = sap.ui.getCore().byId('shell');

            // create model
            this.oModel = new sap.ushell.renderers.fiori2.search.SearchModel({
                updateUrl: false
            });
            this.oShellView.setModel(sap.ushell.resources.i18nModel, "i18n");

            // create controls
            this.oSearchInput = new sap.ushell.renderers.fiori2.search.controls.SearchInput("searchInputShell", {
                location: "shellHeader"
            });
            this.oSearchInput.setModel(this.oModel);
            this.oSearchInput.addEventDelegate({
                //                onAfterRendering: function(oEvent) {
                //                    oEvent.srcControl.focus();
                //                },
                onsapenter: function(oEvent) {
                    if (self.oModel.getSearchBoxTerm() === "") {
                        // If datasource suggestion is selected by sapenter, the search box is not closed.
                        return;
                    }
                    self.closeHeadSearchBox();
                }
            }, this.oSearchInput);
            this.oSearchInput.attachChange(function() {
                if (sap.ui.Device.system.phone) {
                    self.closeHeadSearchBox();
                }
            });
            this.oSearchInput.attachSuggestionItemSelected(function(oEvent) {
                var oModel = this.getModel();
                var selectedRow = oEvent.getParameter('selectedRow');
                var suggestion = selectedRow.getBindingContext().getObject();
                if (suggestion.type !== oModel.SUGGESTION_TYPE_DATASOURCE) {
                    self.closeHeadSearchBox();
                }
            });


            if (!sap.ui.Device.system.phone) {
                this.oSearchSelect = new sap.ushell.renderers.fiori2.search.controls.SearchSelect();
                this.oSearchSelect.attachChange(function() {
                    self.oSearchInput.focus();
                    self.oSearchInput.destroySuggestionRows();
                });
                this.oSearchSelect.setModel(this.oModel);

                if ($(window).width() <= 1150) {
                    // if screen is tablet-sized, then display select as a filter icon
                    self.oSearchSelect.setType(sap.m.SelectType.IconOnly);
                    self.oSearchSelect.setIcon('sap-icon://filter');
                }
            }

            //Search Box, contains Select and Input
            this.oHeadSearchBox = new sap.m.Toolbar({
                id: "headSearchBox",
            }).addStyleClass('sapUshellHeadSearchBox');
            this.oHeadSearchBox.setVisible(false);
            this.oShell.setSearch(this.oHeadSearchBox);
            if (!sap.ui.Device.system.phone) {
                this.oHeadSearchBox.addContent(this.oSearchSelect);
                this.oSearchSelect.setMaxWidth("40%");
            }
            this.oHeadSearchBox.addContent(this.oSearchInput);
            this.oHeadSearchBox.addEventDelegate({
                onAfterRendering: function(oEvent) {
                    // add class to select parent divs, set css style and animation
                    jQuery('#headSearchBox').parent().parent().parent().addClass('headSearchDivContainer');
                    jQuery('#headSearchBox').parent().parent().addClass('headSearchDiv');
                }
            }, self.oHeadSearchBox);

        },

        openHeadSearchBox: function() {
            var self = this;

            this.firstOpen = true;

            //Reset Select
            this.oModel.resetDataSource(false);

            //Pre-Fetch all App Tiles
            sap.ushell.Container.getService("Search")._getCatalogTiles();

            //Early Initialization of Semantics Objects Handler
            SemanticObjectsHandler.getSemanticObjectsMetadata();

            //Reset Text Empty
            this.oModel.setProperty("/searchBoxTerm", "");
            this.oSearchInput.setValue("");

            //open search box with animation
            this.oHeadSearchBox.setVisible(true);
            this.oHeadSearchBox.addEventDelegate({
                onAfterRendering: function(oEvent) {
                    if (self.firstOpen) {
                        self.firstOpen = false;
                        //because of default animation from UI5, to avoid double animation, no more animation will be used here
                        jQuery('.headSearchDiv').css("maxWidth", "38rem");
                        // don't set focus in pohne.
                        // workaround for soft-keyboard-pop-up
                        if (!sap.ui.Device.system.phone) {
                            setTimeout(function() {
                                self.oSearchInput.focus();
                            }, 350);
                        }
                    }
                }
            }, self.oHeadSearchBox);
        },

        closeHeadSearchBox: function() {
            var self = this;
            jQuery('.headSearchDiv').animate({
                'maxWidth': '0'
            }, {
                duration: 100,
                complete: function() {
                    self.oHeadSearchBox.setVisible(false);
                }
            });
        },

        handleClickMagnifier: function() {
            if (!this.oHeadSearchBox.getVisible()) {
                // 1 open search box
                this.openHeadSearchBox();
            } else {
                // 2 close search box
                if (this.oSearchInput.getValue() !== "") {
                    // trigger search if we have a search term
                    //this.handleHash(this.getModel("searchModelInHead"));
                    this.oModel.navigateToSearchApp();
                    this.oSearchInput.destroySuggestionRows();
                }
                this.closeHeadSearchBox();
            }
        }

    });

})();

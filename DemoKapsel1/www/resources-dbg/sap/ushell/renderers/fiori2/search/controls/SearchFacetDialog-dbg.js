/* global jQuery, sap, window */
(function() {
    "use strict";

    jQuery.sap.require('sap.m.Dialog');

    sap.m.Dialog.extend('sap.ushell.renderers.fiori2.search.controls.SearchFacetDialog', {

        constructor: function(options) {
            var self = this;
            options = jQuery.extend({}, {
                showHeader: true,
                title: "Facet Dialog",
                horizontalScrolling: false,
                verticalScrolling: false,
                beginButton: new sap.m.Button({
                    text: "OK",
                    press: function(oEvent) {
                        self.close();
                    }
                }),
                endButton: new sap.m.Button({
                    text: "Cancel",
                    press: function(oEvent) {
                        self.close();
                    }
                }),
                content: [self.createContainer()]
            }, options);
            sap.m.Dialog.prototype.constructor.apply(this, [options]);
            this.addStyleClass("sapUiSizeCompact");
            this.addStyleClass('searchFacetDialog');
        },

        renderer: 'sap.m.DialogRenderer',

        createContainer: function() {
            var self = this;

            var oMasterPage = new sap.m.ScrollContainer({
                horizontal: false,
                vertical: true,
                content: [new sap.m.List({
                    mode: sap.m.ListMode.SingleSelectMaster,
                    selectionChange: function(oEvent) {
                        self.onSelectionChange(oEvent);
                    },
                    items: {
                        path: "/facets",
                        template: new sap.m.StandardListItem({
                            title: "{title}"
                        })
                    }
                })]
            }).addStyleClass('searchFacetDialogMasterContainer');

            self.oSplitContainer = new sap.m.SplitContainer({
                masterPages: [oMasterPage]
            }).addStyleClass('searchFacetDialogContainer');
            self.oSplitContainer.bindAggregation("detailPages", "/facets", function(sId, oContext) {
                return self.detailPagesFactory(sId, oContext);
            });
            return self.oSplitContainer;
        },

        detailPagesFactory: function(sId, oContext) {
            var self = this;
            var sDimension = oContext.oModel.getProperty(oContext.sPath).dimension;

            var oList = new sap.m.List({
                //                items: {
                //                    path: "items",
                //                    template: new sap.m.StandardListItem({
                //                        title: "{label}",
                //                        counter: "{value}"
                //                    })
                //                }
            });
            if (sDimension) {
                oList.setMode(sap.m.ListMode.MultiSelect);
            } else {
                oList.setMode(sap.m.ListMode.SingleSelectLeft);
            }
            oList.bindAggregation("items", "items", function(sId, oContext) {
                var oListItem = new sap.m.StandardListItem({
                    title: "{label}",
                    counter: "{value}"
                });
                oListItem.addEventDelegate({
                    onAfterRendering: function(oEvent) {
                        var level = oContext.getObject().level;
                        if (level > 0) {
                            var padding = level + 1;
                            jQuery(oListItem.getDomRef()).css("padding-left", padding + "rem");
                        }
                    }
                });
                return oListItem;
            });

            var sPageId = sDimension ? self.oSplitContainer.sId + sDimension : self.oSplitContainer.sId + "searchIn";
            var oPage = new sap.m.Page(sPageId, {
                showHeader: false,
                content: [oList]
            });

            return oPage;
        },

        onSelectionChange: function(oEvent) {
            var self = this;
            var oSelectedItem = oEvent.mParameters.listItem.getBindingContext().getObject();
            var sNavi = oSelectedItem.dimension ? self.oSplitContainer.sId + oSelectedItem.dimension : self.oSplitContainer.sId + "searchIn";
            self.oSplitContainer.toDetail(sNavi, "show");
        }

    });

})();

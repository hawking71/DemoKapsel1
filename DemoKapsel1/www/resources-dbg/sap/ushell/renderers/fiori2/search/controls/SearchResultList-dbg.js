/* global jQuery, sap, window */
(function() {
    "use strict";

    sap.m.List.extend('sap.ushell.renderers.fiori2.search.controls.SearchResultList', {

        renderer: 'sap.m.ListRenderer',

        onAfterRenderingParent: sap.m.List.prototype.onAfterRendering,
        onAfterRendering: function() {

            var self = this;

            // First let the original sap.m.List do its work
            self.onAfterRenderingParent();

            var aMyListItems = self.getItems();

            if (aMyListItems.length === 0) {
                return;
            }

            // We need to be aware of any re-rendering happening inside the app tile
            // container. Thus let's listen for any re-rendering going on inside.
            var onAfterRenderingCallback = function() {
                self.collectListItemsForNavigation();
            };
            for (var i = 0; i < aMyListItems.length; i++) {
                var oMyItem = aMyListItems[i];
                if (oMyItem.hasStyleClass("searchResultListItemApps")) {
                    var oContent = oMyItem.getContent();
                    if (oContent.length > 0) { // && oContent[0].hasStyleClass("searchTileContainer")) {
                        oContent[0].addEventDelegate({
                            onAfterRendering: onAfterRenderingCallback
                        });
                    }
                }
            }

            self.collectListItemsForNavigation();
        },

        collectListItemsForNavigation: function() {

            var self = this;

            var oItemNavigation = self.getItemNavigation();
            if (!oItemNavigation) {
                self._startItemNavigation();
                oItemNavigation = self.getItemNavigation();
            }
            self._bItemNavigationInvalidated = false;

            // fix the item navigation to our needs:

            //Collect the dom references of the items
            var oFocusRef = self.getDomRef();
            var aRows = oFocusRef.getElementsByTagName("li");
            var aDomRefs = [];
            for (var i = 0; i < aRows.length; i++) {
                var oRow = aRows[i];
                if ($(oRow).hasClass("searchResultListItemApps")) { // Handle Tiles (including the ShowMore-Tile)

                    var aTiles = oRow.getElementsByClassName("sapUshellTileBase"); // oRow.getElementsByClassName("searchTileWrapper");
                    for (var j = 0; j < aTiles.length; j++) {
                        aDomRefs.push(aTiles[j]);
                    }

                    // ShowMore-Tile
                    var aShowMoreButton = $(oRow).find(".searchShowMoreTile button");
                    if (aShowMoreButton.length > 0) {
                        aDomRefs.push(aShowMoreButton[0]);
                    }

                } else if ($(oRow).hasClass("searchResultListFooter")) { // Handle ShowMore-Button

                    var aShowMoreLink = oRow.getElementsByClassName("resultListMoreFooter");
                    for (var k = 0; k < aShowMoreLink.length; k++) {
                        aDomRefs.push(aShowMoreLink[k]);
                    }

                } else { // Normal List Items
                    aDomRefs.push(oRow);
                }
            }

            //set the root dom node that surrounds the items
            oItemNavigation.setRootDomRef(oFocusRef);

            //set the array of dom nodes representing the items.
            oItemNavigation.setItemDomRefs(aDomRefs);

            //turn of the cycling
            oItemNavigation.setCycling(false);

            return;
        },


        // TODO: Since oItemNavigation is created by the parent (sap.m.List), it should
        // also be destroyed by the parent. TO BE VERIFIED!
        //          destroy: function() {
        //             if (this.oItemNavigation) {
        //                     this.removeDelegate(this.oItemNavigation);
        //                     this.oItemNavigation.destroy();
        //             }
        //         }
    });

})();

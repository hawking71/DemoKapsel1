// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
(function () {
    "use strict";
    jQuery.sap.declare("sap.ushell.renderers.fiori2.AccessKeysHandler");

    var accessKeysHandler = function () {
        this.init();
    };

    accessKeysHandler.prototype = {
        keyCodes: jQuery.sap.KeyCodes,

        activateFlag: true,

        activateAccessibilityKeys: function (flag) {
            if (this.activateFlag === !!flag) {
                return;
            }
            this.activateFlag = !!flag;
            if (this.activateFlag) {
                this.init();
            } else {
                jQuery("body").off('keyup.accessKeysHandler');
            }
        },

        handleCatalogKey: function () {
            sap.ushell.renderers.fiori2.Navigation.openCatalogByHash();
            jQuery("#configBtn").focus();
        },

        handleHomepageKey: function () {
            var oMainShell = sap.ui.getCore().byId("mainShell"),
                shellController = oMainShell.getController();
            shellController.navigateToHome();
            jQuery("#homeBtn").focus();
        },

        handleSearchKey: function () {
            var searchField = sap.ui.getCore().byId('sf');
            var jqSearchField = jQuery(searchField.getDomRef());
            jqSearchField.click();

        },

        handleUserMenuKey: function () {
            var userPrefButton = sap.ui.getCore().byId('userPreferencesButton');
            if (!userPrefButton) {
                userPrefButton = new sap.ushell.ui.footerbar.UserPreferencesButton();
            }
            userPrefButton.showUserPreferencesDialog();
        },

        handleAccessOverviewKey: function () {
            var translationBundle = sap.ushell.resources.i18n,
                isPersonalization =  sap.ui.getCore().byId("shell").getModel().getProperty("/personalization"),
                isSearchAvailable = sap.ui.getCore().byId("shell").getModel().getProperty("/searchAvailable"),

                contentList = []; //contains the content of the form depends on the launchpad configuration

            if (isPersonalization) {
                contentList.push(new sap.m.Label({text: "Alt+C"}));
                contentList.push( new sap.m.Text({text: translationBundle.getText("actionCatalog")}));
            }

            contentList.push(new sap.m.Label({text: "Alt+H"}));
            contentList.push(new sap.m.Text({text: translationBundle.getText("actionHomePage")}));

            if (isSearchAvailable) {
                contentList.push(new sap.m.Label({text: "Alt+S"}));
                contentList.push(new sap.m.Text({text: translationBundle.getText("actionSearch") }));
            }

            contentList.push(new sap.m.Label({text: "Alt+U"}));
            contentList.push(new sap.m.Text({text: translationBundle.getText("actionLoginDetails") }));

            var oSimpleForm = new sap.ui.layout.form.SimpleForm({
                editable: false,
                content: contentList
            }),

            oDialog,
            okButton = new sap.m.Button({
                text: translationBundle.getText("okBtn"),
                press: function () {
                    oDialog.close();
                }
            });

            oDialog = new sap.m.Dialog({
                id: "hotKeysGlossary",
                title: translationBundle.getText("hotKeysGlossary"),
                contentWidth: "300px",
                leftButton: okButton,
                afterClose: function () {
                    oDialog.destroy();
                }
            });

            oDialog.addContent(oSimpleForm);
            oDialog.open();
        },

        getNumberOfTileInRow: function (pageName) {
            var jqTile = jQuery(".sapUshellTile:first");
            if (!jqTile.length) return false;
            var core = sap.ui.getCore();
            var tile = core.byId(jqTile.attr('id'));
            var tileFatSize = (tile.getLong() == true) ? 2 : 1;
            var contentWidth;
            if (pageName === "catalog") {
                contentWidth = jQuery("#catalogTiles .sapUshellTileContainerContent").width();
            } else {
                contentWidth = jQuery("#dashboardGroups").width();
            }
            var tileWidth = jqTile.outerWidth(true) / tileFatSize;
            var numberTilesInRow =  Math.floor(contentWidth / tileWidth);
            return numberTilesInRow;
        },

        goToTileContainer: function () {
            var oModel = sap.ui.getCore().byId("shell").getModel(),
                bIsActionsModeActive = oModel.getProperty('/tileActionModeActive');

            if (bIsActionsModeActive) {
                sap.ushell.renderers.fiori2.AccessKeysHandler.goToEdgeTileContainer('first');
            } else {
                return sap.ushell.renderers.fiori2.AccessKeysHandler.goToEdgeTile('first');
            }
            return true;
        },

        goToEdgeTile: function (selector) {
            var tileToSelect = jQuery(".sapUshellTile:visible")[selector]();
            if (!tileToSelect.length) {
                return false;
            }
            this.setTileFocus(tileToSelect);
            return true;
        },

        goToEdgeTileContainer: function (selector) {
            var jqTileContainerToSelect = jQuery('.sapUshellTileContainer:visible')[selector]();
            if (!jqTileContainerToSelect.length) {
                return false;
            }
            this.setTileContainerSelectiveFocus(jqTileContainerToSelect);
            return true;
        },

        goToFirstTileOfSiblingGroup: function (selector, e) {
            e.preventDefault();
            var currentGroup = jQuery(":focus").closest(".sapUshellDashboardGroupsContainerItem");
            if (!currentGroup.length) return;
            var nextGroup = currentGroup[selector + "All"](".sapUshellDashboardGroupsContainerItem:has(>div:visible):not(.sapUshellCloneArea)");
            var tileSelector = 'first';
            if (!nextGroup.length) {
                nextGroup = currentGroup;
                tileSelector = (selector === "next")? 'last': 'first';
            } else {
                nextGroup = nextGroup.first();
            }
            var jqTileToSelect = nextGroup.find(".sapUshellTile:visible")[tileSelector]();
            this.moveScrollDashboard(jqTileToSelect);

            return false;
        },

        goToFirstTileOfSiblingGroupInCatalog: function (selector, e) {
            e.preventDefault();
            // var currentGroup = new Array();
            var jqTileContainer = this.getFocusOnTile(jQuery(":focus"));
            if (!jqTileContainer) return;

            var jqTileToFocus;

            if (selector == "next") {
                var isLastGroup = jqTileContainer.nextAll("h3").length ? false : true;
                if (!isLastGroup) {
                    jqTileToFocus = jqTileContainer.nextAll("h3").first().nextAll().filter(":visible").first();
                } else {
                    jqTileToFocus = jqTileContainer.nextAll(".sapUshellTile").last();
                }
            } else {
                var isFirstGroup = jqTileContainer.prevAll("h3").length === 1 ? true : false;
                if (!isFirstGroup) {
                    jqTileToFocus = jQuery(jqTileContainer.prevAll("h3")[1]).next();
                } else {
                    jqTileToFocus = jqTileContainer.prevAll("h3").last().next();
                }
            }

            this.setTileFocus(jqTileToFocus);
            this.moveScrollCatalog(jqTileToFocus);

            return false;
        },

        swapTwoTilesInGroup: function (group, firstTile, secondTile) {
            var groupModelObj = group.getBindingContext().getObject();
            var firstTileIndex = groupModelObj.tiles.indexOf(firstTile.getBindingContext().getObject());
            var secondTileIndex = groupModelObj.tiles.indexOf(secondTile.getBindingContext().getObject());
            var firstTileModelObj = groupModelObj.tiles.splice(firstTileIndex, 1, null);
            var secondTileModelObj = groupModelObj.tiles.splice(secondTileIndex, 1, firstTileModelObj[0]);
            groupModelObj.tiles.splice(firstTileIndex, 1, secondTileModelObj[0]);
            var groupPath = group.getBindingContext().getPath();
            group.getModel().setProperty(groupPath, groupModelObj);
        },

        moveTileInGroup: function (group, firstTile, secondTile) {
            if (sap.ui.getCore().byId("shell").getModel().getProperty("/personalization")) {
                var groupModelObj = group.getBindingContext().getObject();
                var firstTileIndex = groupModelObj.tiles.indexOf(firstTile.getBindingContext().getObject());
                var secondTileIndex = groupModelObj.tiles.indexOf(secondTile.getBindingContext().getObject());
                var firstTileModelObj = groupModelObj.tiles.splice(firstTileIndex, 1);
                groupModelObj.tiles.splice(secondTileIndex, 0, firstTileModelObj[0]);
                var groupPath = group.getBindingContext().getPath();
                group.getModel().setProperty(groupPath, groupModelObj);
            }
        },

        moveTileToDifferentGroup: function (sourceGroup, destGroup, curTile, direction) {
            if (sap.ui.getCore().byId("shell").getModel().getProperty("/personalization")) {
                if (sourceGroup.getIsGroupLocked() || destGroup.getIsGroupLocked()) return;
                var newIndex;
                var sourceGroupModelObj = sourceGroup.getBindingContext().getObject();
                var destGroupModelObj = destGroup.getBindingContext().getObject();
                var tileIndex = sourceGroupModelObj.tiles.indexOf(curTile.getBindingContext().getObject());
                //removing tile from source group & add tile to destination group
                if (direction === "left" ||direction === "up" ){
                    destGroupModelObj.tiles.push(sourceGroupModelObj.tiles[tileIndex]);
                    newIndex = destGroup.length;

                }
                if (direction === "right" || direction === "down"){
                    destGroupModelObj.tiles.splice(0, 0, sourceGroupModelObj.tiles[tileIndex]);
                    newIndex = 0;
                }

                sourceGroupModelObj.tiles.splice(tileIndex, 1);

                //update model
                var groupPath1 = destGroup.getBindingContext().getPath();
                destGroup.getModel().setProperty(groupPath1, destGroupModelObj);

                var groupPath2 = sourceGroup.getBindingContext().getPath();
                sourceGroup.getModel().setProperty(groupPath2, sourceGroupModelObj);

                var groups = destGroup.getTiles();
                return groups[newIndex];
            }
        },

        moveTile: function (direction, swapTiles) {
            var dashboardView = sap.ui.getCore().byId("dashboard");
            dashboardView.markDisableGroups();
            setTimeout(function () {
                dashboardView.unmarkDisableGroups();
            }.bind(this), 300);

            var nextGroup;
            if (sap.ui.getCore().byId("shell").getModel().getProperty("/personalization")) {
                if (typeof swapTiles === "undefined") {
                    swapTiles = false;
                }
                var info = this.getGroupAndTilesInfo();
                //Tiles of locked groups cannot be reordered
                if (!info || info.group.getProperty('isGroupLocked')) {
                    return;
                }

                var nextTile = this.getNextTile(direction, info);
                if (!nextTile) {
                    return;
                } else {
                    var nextTileGroup = nextTile.getParent();
                }

                if (swapTiles) {
                    this.swapTwoTilesInGroup(info.group, info.curTile, nextTile);
                } else {
                    if (nextTileGroup === info.group) {
                        this.moveTileInGroup(info.group, info.curTile, nextTile);
                    } else {
                        nextTile = this.moveTileToDifferentGroup(info.group, nextTileGroup, info.curTile, direction);
                    }
                }
                if (sap.ushell.Layout && sap.ushell.Layout.isInited) {
                    sap.ushell.Layout.reRenderGroupLayout(info.group);
                }
                setTimeout(function () {//setTimeout because we have to wait until the asynchronous "moveTile" flow ends
                    if (nextTile) {
                        this.setTileFocus($(nextTile.getDomRef()));
                    }
                }.bind(this), 100);
            }
        },

        getNextUpDownTileInCatalog: function (direction, info) {
            var nearTilesArr, nextTile;
            var origTileLeftOffset = parseFloat(info.curTile.getDomRef().offsetLeft);
            if (direction == "down") {
                nearTilesArr = info.tiles.slice(info.curTileIndex + 1, info.curTileIndex + (info.sizeOfLine * 2));
            } else {
                var startIndex = info.curTileIndex - (info.sizeOfLine * 2);
                startIndex = (startIndex > 0) ? startIndex : 0;
                nearTilesArr = info.tiles.slice(startIndex, info.curTileIndex - 1).reverse();
            }
            for (var i = 0, length = nearTilesArr.length; i < length; i++) {
                var tileElement = nearTilesArr[i].getDomRef();
                var leftOffset = parseFloat(tileElement.offsetLeft);
                var width = parseFloat(tileElement.offsetWidth);
                var leftAndWidth = leftOffset + width;
                if (leftOffset <= origTileLeftOffset && leftAndWidth >= origTileLeftOffset) {
                    nextTile = nearTilesArr[i];
                    break;
                }
            }
            return nextTile;
        },

        getNextUpDownTileWithLayout: function (direction, info, bIsActionsModeActive) {
            var nextTile, nextGroup ;
            var tileSize = info.curTile.getTall() ? 2 : 1;
            var nDirection = direction === "down" ? (tileSize) : -1;
            var isEmptyGroup = !info.tiles.length;
            var bIsGroupLocked = info.group.getIsGroupLocked();
            var bIsPlusTile = jQuery(info.curTile.getDomRef()).hasClass('sapUshellPlusTile');

            var layoutMatrix = sap.ushell.Layout.organizeGroup(info.tiles);
            var tPos = sap.ushell.Layout.getTilePositionInMatrix(info.curTile, layoutMatrix);
            var bIsLastLineFull = this.isLastLineFull(layoutMatrix);
            if (!tPos && !isEmptyGroup && !bIsPlusTile) return;
            if (!layoutMatrix[tPos.row + nDirection]) {
                //Handle the case in which the last line within the tileContainer has only Plus Tile
                if (bIsActionsModeActive  && !bIsGroupLocked && !bIsPlusTile && bIsLastLineFull && direction === "down") {
                    return info.group.oPlusTile;
                }
                tPos = isEmptyGroup || bIsPlusTile ? {row: 0, col: 0}: tPos;
                nextGroup = this.getNextGroup(direction, info);
                if (!nextGroup) return;
                isEmptyGroup = !nextGroup.getTiles().length ;
                layoutMatrix = sap.ushell.Layout.organizeGroup(nextGroup.getTiles());
                nDirection = 0;
                tPos.row = direction === "down" ? 0 : layoutMatrix.length - 1;
            }
            if (isEmptyGroup && bIsGroupLocked) return undefined;
            if (isEmptyGroup) return nextGroup.oPlusTile;

            if(typeof layoutMatrix[tPos.row + nDirection][tPos.col] === "object" && !isEmptyGroup) {
                nextTile = layoutMatrix[tPos.row + nDirection][tPos.col];
            }
            else{
                nextTile = this.getNextUpDownTile(layoutMatrix, tPos.row + nDirection, tPos.col ,direction);
            }

            return nextTile;
        },

        isLastLineFull: function (aLayoutMatrix) {
            var iMaxTilesInRow = this.getNumberOfTileInRow(),
                aActualLastRow = aLayoutMatrix[aLayoutMatrix.length-1].filter(Boolean);

            return aActualLastRow.length === iMaxTilesInRow;
        },

        getNextUpDownTile: function(layoutMatrix, row, column, direction){
            var newRow = row,
                len = layoutMatrix.length,
                nextTile,
                nDirection = direction === "up"? -1: 1;

            while((newRow >= 0 && newRow < len) && !nextTile){
                if (typeof layoutMatrix[newRow][column]!== "object") {
                    nextTile =layoutMatrix[newRow][column];
                }
                newRow = newRow + nDirection;
            }
            if (nextTile) return;

            newRow = row;
            while(( typeof layoutMatrix[newRow][column]!== "object") && column >= 0){
                column--;
            }

            return layoutMatrix[newRow][column];
        },

        getNextTile: function (direction, info, bIsActionsModeActive) {
            var nextTile,
                currentTileRow,
                nearTilesArr,
                currentLine,
                nextLine,
                startIndex,
                tileElement,
                leftOffset,
                width,
                leftAndWidth,
                origTileLeftOffset,
                nRTL = sap.ui.getCore().getConfiguration().getRTL()? -1 : 1,
                isEmptyGroup = !info.tiles.length,
                nDirection = direction === "right"? 1: -1,
                bIsPlusTile;

            if(info.pageName === 'catalog') { // In catalog mode
                if(direction == 'right' || direction == 'left'){
                    nextTile = !isEmptyGroup ? info.tiles[info.curTileIndex + ( nRTL * nDirection ) ]: undefined;
                    return nextTile;
                }

                if (info.curTileIndex === '0' && direction === 'up')
                    return undefined;

                currentTileRow = this.whichTileRow(info.curTileIndex, info);
                origTileLeftOffset = parseFloat(info.curTile.getDomRef().offsetLeft);
                if (direction == "down") {
                    nearTilesArr = info.tiles.slice(info.curTileIndex+1, info.curTileIndex+(info.sizeOfLine*2));
                } else {
                    startIndex = (startIndex>0) ? startIndex : 0;
                    nearTilesArr = info.tiles.slice(startIndex, info.curTileIndex).reverse();
                }
                for (var i=0, length=nearTilesArr.length; i<length; i++) {
                     tileElement = nearTilesArr[i].getDomRef();
                     leftOffset = parseFloat(tileElement.offsetLeft);
                     width = parseFloat(tileElement.offsetWidth);
                     leftAndWidth = leftOffset+width;

                    if (leftOffset<=origTileLeftOffset && leftAndWidth>=origTileLeftOffset) {
                         nextTile = nearTilesArr[i];

                        var aCurTiles = $(".sapUshellTile:visible");
                        var iNextTileIndex = 0;
                        for (var j=0, length=aCurTiles.length; j<length; j++) {
                            if (aCurTiles[j].id === nearTilesArr[i].sId){
                                iNextTileIndex = j;
                                break;
                            }
                        }

                        currentLine = this.whichTileRow(info.curTileIndex, info);
                         nextLine = this.whichTileRow(iNextTileIndex, info);

                        if (Math.abs(currentLine - nextLine) > 1)
                            nextTile = this.getNextTileInShorterRow(direction, currentTileRow, info);

                        return nextTile;
                    }
                }

                if (this.nextRowIsShorter(direction, currentTileRow, info)) {
                    nextTile = this.getNextTileInShorterRow(direction, currentTileRow, info);
                    return nextTile;
                }

            } // In dashboard mode
            else {
                bIsPlusTile = jQuery(info.curTile.getDomRef()).hasClass('sapUshellPlusTile');
                if (direction === "left" || direction === "right"){
                    //nDirection is a parameter that influence in which direction we move in array iRTL will change it
                    //to opposite direction if it's RTL
                    nextTile = !isEmptyGroup ? info.tiles[info.curTileIndex + ( nRTL * nDirection ) ]: undefined;
                    if (nextTile){
                        return nextTile;
                    }
                    // if next tile wasn't exist in the current group need to look on next one
                    var nextGroup = this.getNextGroup(direction, info);
                    if  (!nextGroup) {
                        return;
                    }
                    else {
                        var nextGroupTiles = nextGroup.getShowPlaceholder() ? [].concat(nextGroup.getTiles(), nextGroup.oPlusTile) : nextGroup.getTiles();
                        if (!!nextGroupTiles.length){
                            var last = nextGroupTiles.length - 1;
                            if (direction === "right"){
                                nextTile = nextGroupTiles[nRTL === 1 ? 0: last];
                            }
                            else{
                                nextTile = nextGroupTiles[nRTL === 1 ? last: 0];
                            }
                        }
                        else{
                            nextTile = nextGroup.oPlusTile;
                        }
                    }
                }

                if (direction === "down" || direction === "up") {
                    if (info.pageName === "catalog") {
                        nextTile = this.getNextUpDownTileInCatalog(direction, info);
                    } else if (sap.ushell.Layout && sap.ushell.Layout.isInited) {
                        nextTile = this.getNextUpDownTileWithLayout(direction, info, bIsActionsModeActive);
                    }
                }
            }
            return nextTile;
        },

        getNextTileInShorterRow:  function(direction, currentRow, info) {
            var lastTileInRowId = direction === 'down' ? this.getLastTileIdInRow(info, currentRow +1) :  this.getLastTileIdInRow(info, currentRow -1);
            return info.tiles[lastTileInRowId];
        },

        getLastTileIdInRow: function(info, lineNumber) {
            var count = 0;
            for (var i=0; i<info.rowsData.length; i++) {
                count += info.rowsData[i];
                if (i === lineNumber)
                    break;
            }

            return count-1;
        },

        nextRowIsShorter: function(direction, currentRow, info) {
            if (direction === 'down' && currentRow != info.rowsData.length -1)
                return info.rowsData[currentRow] > info.rowsData[currentRow +1]
            if (direction === 'up' && currentRow != 0)
                return info.rowsData[currentRow] > info.rowsData[currentRow -1]
            else
                return false;
        },


        getNextGroup: function (direction, info) {
            var nextGroup,
                groups = info.group.getParent().getGroups(),
                isRTL = sap.ui.getCore().getConfiguration().getRTL(),
                curGroupIndex = groups.indexOf(info.group);

            if (direction === "right" ||direction === "left"){
                if( isRTL ){
                    direction = (direction === "right")? "up" : "down";
                }
                else{
                    direction = (direction === "right")? "down" : "up";
                }
            }

            if (direction === "down" || direction === "up" ) {
                var nDirection = direction === "up"? -1 : 1;
                nextGroup = groups[curGroupIndex + nDirection];
                if (!nextGroup) return;

                while (!nextGroup.getVisible() && (curGroupIndex >=0 && curGroupIndex < groups.length)){
                    curGroupIndex = curGroupIndex + nDirection;
                    nextGroup = groups[curGroupIndex];
                }
            }
            if (!nextGroup.getVisible()) return;
            return nextGroup;
        },

        getGroupAndTilesInfo: function (jqTileContainer, pageName) {
            if (!jqTileContainer) {
                jqTileContainer = this.getFocusOnTile(jQuery(":focus"));
            }
            if (!jqTileContainer.length) return;
            var curTile = sap.ui.getCore().byId(jqTileContainer.attr('id'));
            var group = curTile.getParent();
            var rowsData;
            var tiles;
            if (pageName == "catalog") {
                rowsData = this.getCatalogLayoutData();
                tiles = new Array();
                var jqTiles = $('#catalogTiles').find('.sapUshellTile:visible');
                for (var i = 0; i < jqTiles.length; i++) {
                    tiles.push(sap.ui.getCore().byId(jqTiles[i].id));
                }
            } else {
                tiles = group.getTiles();
                if (group.getShowPlaceholder()) {
                    tiles.push(group.oPlusTile);
                }
            }

            var sizeOfLine = this.getNumberOfTileInRow(pageName);
            return {
                pageName: pageName,
                curTile: curTile,
                curTileIndex: tiles.indexOf(curTile),
                tiles: tiles,
                sizeOfLine: sizeOfLine,
                group: group,
                rowsData:rowsData
            }
        },

        getCatalogLayoutData: function() {
            var jqCatalogContiner = $('#catalogTiles .sapUshellInner').children(':visible'),
                maxTilesInLine = this.getNumberOfTileInRow('catalog'),
                rowsIndex = new Array(),
                countTiles = 0;

            for (var i = 1; i < jqCatalogContiner.length; i++) {

                if (jQuery(jqCatalogContiner[i]).hasClass("sapUshellTile")) {
                    countTiles++;
                }
                if (jQuery(jqCatalogContiner[i]).hasClass("sapUshellHeaderTile")) {
                    rowsIndex.push(countTiles);
                    countTiles = 0;
                }
                if (countTiles >= maxTilesInLine) {
                    rowsIndex.push(countTiles);
                    countTiles = 0;
                }
            }
            if (countTiles > 0) {
                rowsIndex.push(countTiles);
            }

            return rowsIndex;
        },

        whichTileRow: function(id, info) {
              var tilesSum = 0,
                  i;

              for(i = 0; i < info.rowsData.length; i++) {
                  tilesSum += info.rowsData[i];
                  if (id < tilesSum)
                      return i;
              }
        },

        goToSiblingElementInTileContainer: function (direction, jqFocused, pageName) {
          var jqTileContainer = jqFocused.closest('.sapUshellTileContainer'),
              jqTileContainerElement,
              jqFirstTileInTileContainer,
              jqTileContainerHeader;

            //If current focused item is the Before Content of a Tile Container.
            if (jqTileContainerElement = this.getFocusTileContainerBeforeContent(jqFocused)) {
                if (direction === 'up') {
                    this._goToNextTileContainer(jqTileContainerElement, direction);
                } else {
                    jqTileContainerHeader = jqTileContainer.find('.sapUshellTileContainerHeader:first');
                    this.setTabIndexOnTileContainerHeader(jqTileContainerHeader);
                    jqTileContainerHeader.focus();
                }
                return;
            }
            //If current focused item is the Header of a Tile Container.
            if (jqTileContainerElement = this.getFocusTileContainerHeader(jqFocused)) {
                if (direction === 'up') {
                    if (!this._goToTileContainerBeforeContent(jqTileContainer)) {
                        //If the Tile Container doesn't  have a Before Content, go to the Tile Container above.
                        this._goToNextTileContainer(jqTileContainerElement, direction);
                    }
                } else {
                    jqFirstTileInTileContainer = jqTileContainer.find('.sapUshellTile:first');
                    //If this Tile Container doesn't have tiles at all (not even a Plus Tile), it means that the group is empty and locked.
                    //Thus the next arrow down navigation should be to the descending Tile Container.
                    if (jqFirstTileInTileContainer.length) {
                        this.setTileFocus(jqFirstTileInTileContainer);
                    } else {
                        this._goToNextTileContainer(jqTileContainerElement, direction);
                    }
                }
                return;
            }
            //If current focused item is a Tile.
            if (jqTileContainerElement = this.getFocusOnTile(jqFocused)) {
                this.goFromFocusedTile(direction, jqTileContainerElement, pageName, true);
                return;
            }
            //If current focused item is an After Content of a Tile Container.
            if (jqTileContainerElement = this.getFocusOnTileContainerAfterContent(jqFocused)) {
                if (direction === 'up') {
                    this._goToFirstTileInTileContainer(jqTileContainerElement);
                } else {
                    this._goToNextTileContainer(jqTileContainerElement, direction);
                }
            }
        },

        _goToNextTileContainer: function (jqTileContainerElement, direction) {
            var jqCurrentTileContainer = jqTileContainerElement.closest('.sapUshellTileContainer'),
                aAllTileContainers = jQuery('.sapUshellTileContainer:visible'),
                nDirection = (direction === 'down') ? 1 : -1,
                jqNextTileContainer,
                jqNextTileContainerHeader;

            jqNextTileContainer = jQuery(aAllTileContainers[aAllTileContainers.index(jqCurrentTileContainer) + nDirection]);
            if (jqNextTileContainer) {
                jqNextTileContainerHeader = jqNextTileContainer.find('.sapUshellTileContainerHeader');
                if (direction === 'down') {
                    if (!this._goToTileContainerBeforeContent(jqNextTileContainer)) {
                        this.setTabIndexOnTileContainerHeader(jqNextTileContainerHeader);
                        this.setTileContainerSelectiveFocus(jqNextTileContainer);
                    }
                } else {
                    if (this._goToTileContainerAfterContent(jqNextTileContainer)) {
                        return;
                    }
                    if (!this._goToFirstTileInTileContainer(jqNextTileContainer)) {
                        this.setTabIndexOnTileContainerHeader(jqNextTileContainerHeader);
                        jqNextTileContainerHeader.focus()
                    }
                }
            }
        },

        _goToFirstTileInTileContainer: function (jqTileContainerElement) {
            var jqTileContainer = jqTileContainerElement.hasClass('sapUshellTileContainer') ? jqTileContainerElement : jqTileContainerElement.closest('.sapUshellTileContainer'),
                jqFirstTileInTileContainer = jQuery(jqTileContainer.find('.sapUshellTile').get(0));

            if (jqFirstTileInTileContainer.length) {
                this.setTileFocus(jqFirstTileInTileContainer);
                return true;
            } else {
                return false;
            }
        },

        _goToTileContainerBeforeContent: function (jqTileContainerElement) {
            var jqTileContainer = jqTileContainerElement.hasClass('sapUshellTileContainer') ? jqTileContainerElement : jqTileContainerElement.closest('.sapUshellTileContainer'),
                jqTileContainerBeforeContent = jqTileContainer.find('.sapUshellTileContainerBeforeContent button:visible');

            if (jqTileContainerBeforeContent.length) {
                jqTileContainerBeforeContent.focus();
                return true;
            } else {
                return false;
            }
        },

        _goToTileContainerAfterContent: function (jqTileContainerElement) {
            var jqTileContainer = jqTileContainerElement.hasClass('sapUshellTileContainer') ? jqTileContainerElement : jqTileContainerElement.closest('.sapUshellTileContainer'),
                jqTileContainerAfterContent = jqTileContainer.find('.sapUshellTileContainerAfterContent button:visible');

            if (jqTileContainerAfterContent.length) {
                jqTileContainerAfterContent.focus();
                return true;
            } else {
                return false;
            }
        },

        goFromFocusedTile: function (direction, jqTile, pageName, bIsActionsModeActive) {
            var info = this.getGroupAndTilesInfo(jqTile, pageName),
                nextTile,
                jqCurrentTileContainer,
                jqNextTileContainer,
                jqCurrentTileContainerHeader,
                jqTileContainerAfterContent,
                bIsSameTileContainer;

            if (!info) return;
            nextTile = this.getNextTile(direction, info, bIsActionsModeActive);
            if (bIsActionsModeActive) {
                jqCurrentTileContainer =  jQuery(jqTile).closest('.sapUshellTileContainer');
                if (!nextTile) {
                    if (direction === 'down') {
                        jqTileContainerAfterContent = jQuery(jqCurrentTileContainer).find('.sapUshellTileContainerAfterContent button:visible');
                        jqTileContainerAfterContent.focus();
                        return;
                    }
                    if (direction === 'up') {
                        this.setTabIndexOnTileContainerHeader(jqCurrentTileContainer.find('.sapUshellTileContainerHeader'));
                        this.setTileContainerSelectiveFocus(jqCurrentTileContainer);
                        return;
                    }
                } else {
                    if (direction === 'right' || direction === 'left') {
                        this.setTileFocus(jQuery(nextTile.getDomRef()));
                        return;
                    }
                    jqNextTileContainer = jQuery(nextTile.getDomRef()).closest('.sapUshellTileContainer');
                    bIsSameTileContainer = jqCurrentTileContainer.length && jqNextTileContainer.length && (jqCurrentTileContainer.attr('id') === jqNextTileContainer.attr('id'));
                    if (bIsSameTileContainer){
                        this.setTileFocus($(nextTile.getDomRef()));
                    } else {
                        if (direction === 'down') {
                            if (!this._goToTileContainerAfterContent(jqCurrentTileContainer)) {
                                //If the Tile Container doesn't have a visible AfterContent, go to the next Tile Container.
                                this.setTabIndexOnTileContainerHeader(jqNextTileContainer.find('.sapUshellTileContainerHeader'));
                                this.setTileContainerSelectiveFocus(jqNextTileContainer);
                            }
                        } else if (direction === 'up') {
                            jqCurrentTileContainerHeader = jqCurrentTileContainer.find('.sapUshellTileContainerHeader');
                            this.setTabIndexOnTileContainerHeader(jqCurrentTileContainerHeader);
                            jqCurrentTileContainerHeader.focus();
                        }
                    }
                }

            } else if (nextTile) {
                this.setTileFocus($(nextTile.getDomRef()));
            }
        },

        deleteTile: function (jqTile) {
            var tileId = jqTile.attr("id");
            if (!tileId) return;
            var oTile = sap.ui.getCore().byId(tileId);
            var info = this.getGroupAndTilesInfo(jqTile);
            var nextTile = this.getNextTile("right", info);
            if (!nextTile || (nextTile && nextTile.getParent() != info.group)) {
                nextTile = this.getNextTile("left", info);
            }
            if (!nextTile || (nextTile && nextTile.getParent() != info.group)) {
                nextTile=info.group.oPlusTile;
            }
            if (nextTile) {
                setTimeout((function (group, nextTileUuid) {
                    var tiles = group.getTiles();
                    if (!tiles.length) {
                        if (info.group.getProperty('defaultGroup')) {
                            var nextGroup = this.getNextGroup("right", info);
                            nextTile = nextGroup.getTiles()[0] || nextGroup.oPlusTile;
                            this.setTileFocus($(nextTile.getDomRef()));
                        }
                        this.setTileFocus($(group.oPlusTile.getDomRef()));
                        return;
                    }
                    var nextTile;
                    for (var i=0; i<tiles.length; i++) {
                        if (tiles[i].getProperty('uuid') == nextTileUuid) {
                            nextTile=tiles[i];
                            break;
                        }
                    }
                    if (nextTile) {
                        this.setTileFocus($(nextTile.getDomRef()));
                    }
                }).bind(this, info.group, nextTile.getProperty('uuid')), 100);
            }
            var oEventBus = sap.ui.getCore().getEventBus();
            oEventBus.publish("launchpad", "deleteTile", {
                tileId: oTile.getUuid()
            });
        },

        setTabIndexOnTileContainerHeader: function (jqTileContainerHeader) {
            var jqTileConainerHeaderTitle = jqTileContainerHeader.find('.sapUshellContainerTitle:first'),
                jqTileContainerHeaderActions = jqTileContainerHeader.find('.sapUshellContainerHeaderActions:first');

            jqTileContainerHeader.attr('tabindex', 0);
            jqTileConainerHeaderTitle.attr('tabindex', 0);
            jqTileContainerHeaderActions.find('button').attr('tabindex', 0);
        },

        setTileContainerSelectiveFocus: function(jqTileContainer) {
            var jqTileContainerBeforeContent = jqTileContainer.find('.sapUshellTileContainerBeforeContent button'),
                jqTileContainerHeader = jqTileContainer.find('.sapUshellTileContainerHeader:first'),
                bBeforeContentDisplayed = jqTileContainerBeforeContent.length && jqTileContainerBeforeContent.is(":visible");

            if (bBeforeContentDisplayed) {
                jqTileContainerBeforeContent.focus();
            } else if (jqTileContainerHeader.length) {
                //Set tab-index on tileContainerHeader and its' children.
                this.setTabIndexOnTileContainerHeader(jqTileContainerHeader);
                jqTileContainerHeader.focus();
            }
        },

        setTileFocus: function(jqTile) {
            if (!jqTile.hasClass('sapUshellPlusTile')) {
                var oModel = sap.ui.getCore().byId("shell").getModel(),
                    currentPage = oModel.getProperty("/currentState/stateName"),
                    jqFocusables;

                jqFocusables = jqTile.find('[tabindex]');
                if (currentPage === "catalog") {
                    this.setFocusOnCatalogTile(jqFocusables.eq(0));
                }
                if (!jqFocusables.length){
                    jqTile.attr("tabindex", "0");
                    jqFocusables = jqTile.find('[tabindex], a').andSelf().filter('[tabindex], a');
                }
                jqFocusables.filter('[tabindex!="-1"]');
                jqTile = jqFocusables.eq(0).length ? jqFocusables.eq(0).closest('.sapUshellTile') : jqFocusables.eq(0);
            }

            jqTile.focus();
        },

        setFocusOnCatalogTile: function(jqTile){
            var oPrevFirsTile = jQuery(".sapUshellTile[tabindex=0]"),
                aAllTileFocusableElements,
                aVisibleTiles,
                jqParentTile;

            if (oPrevFirsTile.length) {
                //remove tabindex attribute to all tile's elements in TAB cycle if exists
                aAllTileFocusableElements = oPrevFirsTile.find('[tabindex], a').andSelf().filter('[tabindex], a');
                aAllTileFocusableElements.attr("tabindex", -1);
            }

            if (!jqTile){
                aVisibleTiles = jQuery(".sapUshellTile:visible");
                if (aVisibleTiles.length) {
                    jqParentTile = jQuery(aVisibleTiles[0]);
                    jqTile = jqParentTile.find('[tabindex], a').eq(0);
                } else {
                    return;
                }
            }

            //add tabindex attribute to all tile's elements in TAB cycle
            jqTile.closest(".sapUshellTile").attr("tabindex", 0);
            jqTile.attr("tabindex", 0);
            jqTile.closest(".sapUshellTile").find("button").attr("tabindex", 0);
        },

        moveScrollDashboard: function (jqTileSelected) {
            var containerId = jqTileSelected.closest(".sapUshellTileContainer")[0].id,
                iY = -1 * ( document.getElementById('dashboardGroups').getBoundingClientRect().top) + document.getElementById(containerId).getBoundingClientRect().top;
            jQuery('#dashboard').animate({scrollTop: iY}, 500, function () {
                this.setTileFocus(jqTileSelected)
            }.bind(this));
        },

        moveScrollCatalog: function (jqTileSelected) {
            var jqDashboardPageCont = jQuery("#catalogTilesPage-cont");
            var iTopSpacing = jQuery('#shell-hdr').height() + jQuery('.sapMPageHeader').height() + (parseInt(jQuery('.sapMPanelHdr').css('margin-top'), 10) * 2);
            var iY = jqTileSelected.offset().top + jqDashboardPageCont.scrollTop() - iTopSpacing;
            sap.ui.getCore().byId("catalogTilesPage").scrollTo(iY, 500);
        },

        goToNearbySidePanelGroup: function (direction, jqElement) {
            var selector = (direction == "up") ? "prev" : "next";
            var nextGroup = jqElement[selector]();
            // find the first group list item (in the respected order) which is visible (i.e. non empty)
            while (nextGroup.css('display') == "none") {
                nextGroup = nextGroup[selector]();
            }
            if (!nextGroup) return;
            nextGroup.focus();
        },

        deleteSidePanelGroup: function (jqGroup) {
            var core = sap.ui.getCore();
            var oGroup = core.byId(jqGroup.attr('id'));
            var bRemovable = oGroup.getRemovable();
            var oEventBus = core.getEventBus();
            oEventBus.publish("launchpad", bRemovable ? "deleteGroup" : "resetGroup", {
                groupId: oGroup.getGroupId()
            });
        },

        moveSidePanelGroup: function (direction, jqGroup) {
            var core = sap.ui.getCore();
            var oGroup = core.byId(jqGroup.attr('id'));
            var index = oGroup.getIndex();
            var toIndex = direction == "up" ? index - 1 : index + 1;
            if (!index || !toIndex) return;
            var groups = oGroup.getParent().getItems();
            if (toIndex >= (groups.length)) return;
            var oData = {fromIndex: index, toIndex: toIndex};
            var oBus = core.getEventBus();
            oBus.publish("launchpad", "moveGroup", oData);
            this.upDownButtonsHandler(direction);
        },

        goToEdgeSidePanelGroup: function (selector) {
            var jqGroups = jQuery(".sapUshellGroupLI");
            jqGroups[selector]().focus();
        },

        getFocusGroupFromSidePanel: function (jqFocused) {
            var jqFocusedGroup = jqFocused.closest(".sapUshellGroupLI");
            return jqFocusedGroup.length ? jqFocusedGroup : false;
        },

        getFocusGroupFromDashboard: function (jqFocused) {
            var bIsFocusedOnHeaderTitle = jqFocused.closest('.sapUshellTileContainerHeader').length && jqFocused[0].tagName === 'H2';
            return bIsFocusedOnHeaderTitle ? jqFocused : false;
        },

        getFocusTileContainerBeforeContent: function (jqFocusedElement) {
            var jqTileContainerBeforeContent = jqFocusedElement.closest('.sapUshellTileContainerBeforeContent');
            return jqTileContainerBeforeContent.length ? jqTileContainerBeforeContent : false;
        },

        getFocusTileContainerHeader: function (jqFocusedElement) {
            var jqTileContainerHeader = jqFocusedElement.closest('.sapUshellTileContainerHeader');
            return jqTileContainerHeader.length ? jqTileContainerHeader : false;
        },

        getFocusOnTileContainerAfterContent: function (jqFocusedElement) {
            var jqTileContainerAfterContent = jqFocusedElement.closest('.sapUshellTileContainerAfterContent');
            return jqTileContainerAfterContent.length ? jqTileContainerAfterContent : false;
        },

        getFocusOnTile: function (jqFocused) {
            var jqFocusedTile = jqFocused.closest(".sapUshellTile");
            return jqFocusedTile.length ? jqFocusedTile : false;
        },

        getFocusOnCatalogPopover: function (jqFocused) {
            var jqFocusedPopover = jqFocused.closest(".sapMPopover");
            return jqFocusedPopover.length ? jqFocusedPopover : false;
        },

        addGroup: function (jqButton) {
            var core = sap.ui.getCore();
            var oButton = core.byId(jqButton.attr('id'));
            oButton.firePress();
        },

        renameGroup: function () {
            var jqFocused = jQuery(":focus");
            var jqTileContainerTitle = this.getFocusGroupFromDashboard(jqFocused);

            if (jqTileContainerTitle) {
                jqTileContainerTitle.click();
            }
        },

        upDownButtonsHandler: function (direction, pageName) {
            var jqElement,
                jqFocused = jQuery(":focus"),
                oModel = sap.ui.getCore().byId("shell").getModel(),
                bIsActionsModeActive = oModel.getProperty('/tileActionModeActive');


            if (jqElement = this.getFocusGroupFromSidePanel(jqFocused)) {
                this.goToNearbySidePanelGroup(direction, jqElement);
            } else {
                if (bIsActionsModeActive) {
                    this.goToSiblingElementInTileContainer(direction, jqFocused, pageName);
                } else {
                    this.goFromFocusedTile(direction, jqElement, pageName);
                }
            }
        },

        rightLeftButtonsHandler: function (direction, pageName) {
            var jqFocused = jQuery(":focus");
            var oModel = sap.ui.getCore().byId("shell").getModel();
            var bIsActionsModeActive = oModel.getProperty('/tileActionModeActive');
            this.goFromFocusedTile(direction, undefined, pageName, bIsActionsModeActive);

        },

        homeEndButtonsHandler: function (selector) {
            var jqFocused = jQuery(":focus"),
                jqElement = this.getFocusGroupFromSidePanel(jqFocused);
            if (jqFocused.closest("#dashboardGroups").length || jqFocused.closest("#catalogTiles").length) {
                this.goToEdgeTile(selector);
                return;
            }
            if (jqElement && jqElement[0].id == jqFocused[0].id) {
                this.goToEdgeSidePanelGroup(selector);
                return;
            }
        },

        deleteButtonHandler: function () {
        	if (sap.ui.getCore().byId("shell").getModel().getProperty("/personalization")) {
        		var jqElement,
        		jqFocused = jQuery(":focus");
        		if (jqElement = this.getFocusOnTile(jqFocused)) {
        			if(!jqElement.hasClass('sapUshellLockedTile')){
        			    this.deleteTile(jqElement);
        		    }
        			return;
        		}
        		if (jqElement = this.getFocusGroupFromSidePanel(jqFocused)) {        		    
        			//Don't delete the group in case delete was pressed during renaming & in case this is a default group.        		    
        		    if(!jqElement.hasClass('sapUshellEditing') && !jqElement.hasClass("sapUshellDefaultGroupItem") && !jqElement.hasClass("sapUshellTileContainerLocked")){
        				this.deleteSidePanelGroup(jqElement);
        				return;
        			}          	
        		}
        	}
        },

        ctrlUpDownButtonsHandler: function (selector) {
            var jqElement,
                jqFocused = jQuery(":focus");
            if (jqElement = this.getFocusOnTile(jqFocused)) {
                this.moveTile(selector, false, jqElement);
                return;
            }
            if (jqElement = this.getFocusGroupFromSidePanel(jqFocused)) {
                this.moveSidePanelGroup(selector, jqElement);
                return;
            }
            this.moveTile("down");
        },

        spaceButtonHandler: function (e) {
            var jqElement,
                jqFocused = jQuery(":focus");
            if (jqElement = this.getFocusGroupFromSidePanel(jqFocused)) {
                jqElement.click();
                return false;
            }
        },

        mainKeydownHandler: function (e) {
            e = e || window.event;

            switch (e.keyCode) {
                case this.keyCodes.SPACE:
                    this.spaceButtonHandler(e);
                    break;
                case this.keyCodes.HOME: //Home button
                    this.homeEndButtonsHandler("first");
                    break;
                case this.keyCodes.END: //End button
                    this.homeEndButtonsHandler("last");
                    break;
                default:
                    return true;
            }
        },

        catalogKeydownHandler: function (keydown) {
            var handler = sap.ushell.renderers.fiori2.AccessKeysHandler;
            var pageName = "catalog";
            switch (keydown.keyCode) {
                case handler.keyCodes.ARROW_UP: //Up
                    handler.upDownButtonsHandler("up", pageName);
                    break;
                case handler.keyCodes.ARROW_DOWN: //Down
                    handler.upDownButtonsHandler("down", pageName);
                    break;
                case handler.keyCodes.ARROW_RIGHT: // Right ->
                    handler.goFromFocusedTile("right","",pageName);
                    break;
                case handler.keyCodes.ARROW_LEFT: // Left <-
                    handler.goFromFocusedTile("left","",pageName);
                    break;
                case handler.keyCodes.PAGE_UP: //Page Up button
                    handler.goToFirstTileOfSiblingGroupInCatalog('prev', keydown);
                    break;
                case handler.keyCodes.PAGE_DOWN: //Page Down
                    handler.goToFirstTileOfSiblingGroupInCatalog('next', keydown);
                    break;
            }
        },

        dashboardKeydownHandler: function (keydown) {
            var handler = sap.ushell.renderers.fiori2.AccessKeysHandler;
            switch (keydown.keyCode) {
                case handler.keyCodes.F2:
                    handler.renameGroup();
                    break;
                case handler.keyCodes.DELETE: // Delete
                    handler.deleteButtonHandler();
                    break;
                case handler.keyCodes.ARROW_UP: //Up
                    if (keydown.ctrlKey === true) {
                        handler.ctrlUpDownButtonsHandler("up");
                    }
                    else {
                        handler.upDownButtonsHandler("up");
                    }
                    break;
                case handler.keyCodes.ARROW_DOWN: //Down
                    if (keydown.ctrlKey === true) {
                        handler.ctrlUpDownButtonsHandler("down");
                    }
                    else {
                        handler.upDownButtonsHandler("down");
                    }
                    break;
                case handler.keyCodes.ARROW_RIGHT: // Right ->
                    if (keydown.ctrlKey === true) {
                        handler.moveTile("right");
                    } else {
                        handler.rightLeftButtonsHandler('right');
                    }
                    break;
                case handler.keyCodes.ARROW_LEFT: // Left <-
                    if (keydown.ctrlKey === true) {
                        handler.moveTile("left");
                    } else {
                        handler.rightLeftButtonsHandler('left');
                    }
                    break;
                case handler.keyCodes.PAGE_UP: //Page Up button //TODO : check what happen when the tile is  empty
                    handler.goToFirstTileOfSiblingGroup('prev', keydown);
                    break;
                case handler.keyCodes.PAGE_DOWN: //Page Down
                    handler.goToFirstTileOfSiblingGroup('next', keydown);
                    break;
            }
        },

        init: function () {
            jQuery(document).on('keyup.accessKeysHandler', function (keyUpEvent) {
                if (!this.activateFlag) {
                    return;
                }
                if (keyUpEvent.altKey) {
                    switch (String.fromCharCode(keyUpEvent.keyCode)) {
                        case 'C':
                            if (sap.ui.getCore().byId("shell").getModel().getProperty("/personalization")) {
                                this.handleCatalogKey();
                            }
                            break;
                        case 'H':
                            this.handleHomepageKey();
                            break;
                        case 'S':
                            this.handleSearchKey();
                            break;
                        case 'U':
                            this.handleUserMenuKey();
                            break;
                        case '0':
                            this.handleAccessOverviewKey();
                            break;
                    } // End of switch
                } // End of if altKey
            }.bind(this)); // End of event handler

            //listen to keydown event in order to support accessibility for shared keys
            jQuery(document).on('keydown.main', this.mainKeydownHandler.bind(this));
        }
    };

    sap.ushell.renderers.fiori2.AccessKeysHandler = new accessKeysHandler();
}());
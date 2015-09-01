// Copyright (c) 2009-2014 SAP SE, All Rights Reserved

(function () {
    "use strict";
    /*global jQuery, sap, document, $, setTimeout, window */
    /*jslint plusplus: true, nomen: true, bitwise: true */

    jQuery.sap.declare("sap.ushell.renderers.fiori2.launchpad.DashboardManager");
    jQuery.sap.require("sap.ushell.services.Message");

    /**
     * Return translated text. Private function in this module.
     * @param sMsgId
     *      Id of the text that is to be translated.
     * @param aParams
     *      Array of parameters to be included in the resulted string instead of place holders.
     */
    var getLocalizedText = function (sMsgId, aParams) {
        return aParams ? sap.ushell.resources.i18n.getText(sMsgId, aParams)  : sap.ushell.resources.i18n.getText(sMsgId);
    },

       /**
        * This function returns the number of tiles which are supported on the current device in the current catalog.
        * The catalog is identified by its title, so if several catalogs exists with the same title - 
        * the returned value is the number of the intent-supported-tiles in all of them. 
        * @param oCatalogModel
        * @returns {Number}
        * @private
        */
        getNumIntentSupportedTiles = function (oCatalogModel) {
            var aCatalogTiles = this.oModel.getProperty('/catalogTiles'),
                aCurrentCatalogSupportedTiles = aCatalogTiles.filter(function (oTile) {
                    return oTile.catalog === oCatalogModel.title && oTile.isTileIntentSupported === true;
                });

            return aCurrentCatalogSupportedTiles.length;
        };

    sap.ui.base.EventProvider.extend("sap.ushell.renderers.fiori2.launchpad.DashboardManager", {
        metadata : {
            publicMethods : ["getModel", "getDashboardView", "getGroupListView", "isGroupListViewCreated", "loadPersonalizedGroups", "attachEvent", "detachEvent", "attachEventOnce"]
        },

        constructor : function (sId, mSettings) {
            //make this class only available once
            if (sap.ushell.renderers.fiori2.launchpad.getDashboardManager && sap.ushell.renderers.fiori2.launchpad.getDashboardManager()) {
                return sap.ushell.renderers.fiori2.launchpad.getDashboardManager();
            }
            sap.ushell.renderers.fiori2.launchpad.getDashboardManager = jQuery.sap.getter(this.getInterface());
            this.oPageBuilderService = sap.ushell.Container.getService("LaunchPage");
            this.oModel = mSettings.model;
            this.oConfig = mSettings.config;
            this.oDashboardView = sap.ui.view('dashboard', {
                type: sap.ui.core.mvc.ViewType.JS,
                viewName: "sap.ushell.renderers.fiori2.launchpad.dashboard.DashboardContent",
                viewData: {
                    config: this.oConfig
                }
            }).addStyleClass("sapUshellDashboardView");
            this.oDashboardView.setWidth('');
            this.oDashboardView.setDisplayBlock(true);
            this.oSortableDeferred = $.Deferred();
            this.oSortableDeferred.resolve();
            this.aRequestQueue = [];
            this.bRequestRunning = false;
            this.tagsPool = [];
            this.registerEvents();
            this.oTileCatalogToGroupsMap = {};
            this.tileViewUpdateQueue = [];
            this.tileViewUpdateTimeoutID = 0;
            this.oPopover = null;
            this.tileUuid = null;
            this.oGroupNotLockedFilter = new sap.ui.model.Filter("isGroupLocked", sap.ui.model.FilterOperator.EQ, false);

        },

        createMoveActionDialog: function () {
            var oGroupFilter = this.oGroupNotLockedFilter;

            this.moveDialog = new sap.m.SelectDialog("moveDialog", {
                title: sap.ushell.resources.i18n.getText('moveTileDialog_title'),
                rememberSelections: false,
                search: function (oEvent) {
                    var sValue = oEvent.getParameter("value"),
                        oFilter = new sap.ui.model.Filter("title", sap.ui.model.FilterOperator.Contains, sValue),
                        oBinding = oEvent.getSource().getBinding("items");
                    oBinding.filter([oFilter, oGroupFilter]);
                },
                contentWidth: '400px',
                confirm : function (oEvent) {
                    var aContexts = oEvent.getParameter("selectedContexts"),
                        oEventBus = sap.ui.getCore().getEventBus();
                    if (aContexts.length) {
                        oEventBus.publish("launchpad", "moveTile", {
                            sTileId: this.tileUuid,
                            toGroupId:  aContexts[0].getObject().groupId,
                            toIndex: aContexts[0].getObject().tiles.length
                        });

                        oEventBus.publish("launchpad", "scrollToGroup", {
                            groupId : aContexts[0].getObject().groupId,
                            groupChanged : false,
                            focus : false
                        });

                    }
                }.bind(this),
                items : {
                    path : "/groups",
                    filters : [oGroupFilter],
                    template : new sap.m.StandardListItem({
                        title : "{title}"
                    })
                }
            });

            this.moveDialog.setModel(this.oModel);
        },

        registerEvents : function () {
            var oEventBus = sap.ui.getCore().getEventBus(),
                that = this;
            oEventBus.subscribe("launchpad", "addBookmarkTile", this._createBookmark, this);
            oEventBus.subscribe("sap.ushell.services.Bookmark", "bookmarkTileAdded", this._addBookmarkToModel, this);
            oEventBus.subscribe("sap.ushell.services.Bookmark", "bookmarkTileDeleted", this.loadPersonalizedGroups, this);
            oEventBus.subscribe("launchpad", "loadDashboardGroups", this.loadPersonalizedGroups, this);
            oEventBus.subscribe("launchpad", "createGroupAt", this._createGroupAt, this);
            oEventBus.subscribe("launchpad", "createGroup", this._createGroup, this);
            oEventBus.subscribe("launchpad", "deleteGroup", this._deleteGroup, this);
            oEventBus.subscribe("launchpad", "resetGroup", this._resetGroup, this);
            oEventBus.subscribe("launchpad", "changeGroupTitle", this._changeGroupTitle, this);
            oEventBus.subscribe("launchpad", "moveGroup", this._moveGroup, this);
            oEventBus.subscribe("launchpad", "deleteTile", this._deleteTile, this);
            oEventBus.subscribe("launchpad", "moveTile", this._moveTile, this);
            oEventBus.subscribe("launchpad", "sortableStart", this._sortableStart, this);
            oEventBus.subscribe("launchpad", "sortableStop", this._sortableStop, this);
            oEventBus.subscribe("showCatalog", this.loadAllCatalogs, this);

            //add Remove action for all tiles
            this.oPageBuilderService.registerTileActionsProvider(function (oTile) {

//  This check had been removed, as in the ActionMode._openActionsMenu we have a check if the related group is a locked group
//  then we do not show any action. This is the current bahviour as the Action of Tile-Settings is added by the tiles themselves
//  (Dynamin/StaticTile.controller.doInit) and they are not aware of the group being locked, so we do the check in one central place.
//
//                var oModelTile = that.getModelTileById(that.oPageBuilderService.getTileId(oTile));
//                if (oModelTile.isLocked) {
//                    return;
//                }

                jQuery.sap.require("sap.m.MessageBox");
                return [{
                    text: sap.ushell.resources.i18n.getText('removeButtonTItle'),
                    press: function () {
                        //since the TileActionsProvider sends the tile object that is coming from the
                        //adapter, we need to find the tile in the model by the tile id
                        that._deleteTile(null, null, {originalTileId: that.oPageBuilderService.getTileId(oTile)});
                    }
                }, {
                    text: sap.ushell.resources.i18n.getText('moveTileDialog_action'),
                    press: function (oEvent) {
                        that.tileUuid = that.getModelTileById(that.oPageBuilderService.getTileId(oTile)).uuid;
                        if (!that.moveDialog) {
                            that.createMoveActionDialog();
                        }
                        that.moveDialog.getBinding("items").filter([that.oGroupNotLockedFilter]);
                        that.moveDialog.open();
                    }
                }];
            });

            this.oDashboardView.addEventDelegate({
                onBeforeFirstShow: jQuery.proxy(function (evt) {
                    try {
                        this.loadPersonalizedGroups();
                    } catch (err) {
                        window.console.log("DahsboardManager ; oDashboardView.addEventDelegate failed ; exception: " + err);
                    }
                }, this),
                onAfterHide: jQuery.proxy(function (evt) {
                    try {
                        sap.ushell.utils.setTilesNoVisibility();// setting no visibility on all visible tiles
                    } catch (err) {
                        window.console.log("DahsboardManager ; Call to _sap.ushell.utils.setTilesNoVisibility failed ; exception: " + err);
                    }
                }, this)
            });
        },

        destroy : function () {
            var oEventBus = sap.ui.getCore().getEventBus();
            oEventBus.unsubscribe("launchpad", "addBookmarkTile", this._createBookmark, this);
            oEventBus.unsubscribe("launchpad", "loadDashboardGroups", this.loadPersonalizedGroups, this);
            oEventBus.unsubscribe("launchpad", "createGroupAt", this._createGroupAt, this);
            oEventBus.unsubscribe("launchpad", "createGroup", this._createGroup, this);
            oEventBus.unsubscribe("launchpad", "deleteGroup", this._deleteGroup, this);
            oEventBus.unsubscribe("launchpad", "resetGroup", this._resetGroup, this);
            oEventBus.unsubscribe("launchpad", "changeGroupTitle", this._changeGroupTitle, this);
            oEventBus.unsubscribe("launchpad", "moveGroup", this._moveGroup, this);
            oEventBus.unsubscribe("launchpad", "deleteTile", this._deleteTile, this);
            oEventBus.unsubscribe("launchpad", "moveTile", this._moveTile, this);
            oEventBus.unsubscribe("launchpad", "sortableStart", this._sortableStart, this);
            oEventBus.unsubscribe("launchpad", "sortableStop", this._sortableStop, this);
            oEventBus.unsubscribe("showCatalog", this.loadAllCatalogs, this);
            oEventBus.unsubscribe("sap.ushell.services.Bookmark", "bookmarkTileAdded", this._addBookmarkToModel, this);
            oEventBus.unsubscribe("sap.ushell.services.Bookmark", "bookmarkTileDeleted", this.loadPersonalizedGroups, this);

            this.oDashboardView.destroy();

            sap.ushell.renderers.fiori2.launchpad.getDashboardManager = undefined;
        },


        _refreshTiles : function () {
            var that = this,
                aGroups = this.oModel.getProperty("/groups");

            jQuery.each(aGroups, function (nIndex, oGroup) {
                jQuery.each(oGroup.tiles, function (nIndex, oTile) {
                    that.oPageBuilderService.refreshTile(oTile.object);
                });
            });
        },

        _sortableStart : function () {
            this.oSortableDeferred = $.Deferred();
        },

        _createBookmark : function (sChannelId, sEventId, oData) {
            var tileGroup = oData.group ? oData.group.object : "";

            delete oData.group;

            this._addRequest($.proxy(function () {
                var oResultPromise = sap.ushell.Container.getService("Bookmark").addBookmark(oData, tileGroup),
                    oResourceBundle = sap.ushell.resources.i18n;
                oResultPromise.always($.proxy(this._checkRequestQueue, this));
                oResultPromise.done(function () {
                    //the tile is added to our model in "_addBookmarkToModel" here we just show the
                    //success toast.
                    if (sap.ushell.Container) {
                        sap.ushell.Container.getService('Message').info(oResourceBundle.getText('tile_created_msg'));
                    }
                });
                oResultPromise.fail(function (sMsg) {
                    jQuery.sap.log.error(
                        "Failed to add bookmark",
                        sMsg,
                        "sap.ushell.ui.footerbar.AddBookmarkButton"
                    );
                    if (sap.ushell.Container) {
                        sap.ushell.Container.getService('Message').error(oResourceBundle.getText('fail_to_add_tile_msg'));
                    }
                });
            }, this));
        },

        //this function will be called also if an application used the bookmark service directly
        //to add a bookmark. the bookmark service publishes an event so that we will be able to
        //update the model. this method doesn't display a success toast since the application
        //should show success or failure messages
        _addBookmarkToModel : function (sChannelId, sEventId, oData) {
            var oTile = oData.tile,
                oGroup = oData.group;
            if (!oData || !oTile) {
                this.loadPersonalizedGroups();
                return;
            }

            //if the service was called directly, the
            var isGroupLocked = oGroup ? oGroup.isGroupLocked : false, //oData.group is our model group
            //The create bookmark popup should not contain the locked groups anyway,
            //so this call not suppose to happen for a target locked group (we may as well always send false)
                newTile = this._getTileModel(oTile, isGroupLocked),
                indexOfGroup = oGroup ? this._getIndexOfGroupByObject(oGroup) : 0,
                targetGroup = this.oModel.getProperty("/groups/" + indexOfGroup);

            targetGroup.tiles.push(newTile);

            this.oModel.setProperty("/groups/"  + indexOfGroup, targetGroup);
        },

        _sortableStop : function () {
            this.oSortableDeferred.resolve();
        },

        _handleAfterSortable : function (fFunc) {
            return $.proxy(function () {
                var outerArgs = Array.prototype.slice.call(arguments);
                this.oSortableDeferred.done(function () {
                    fFunc.apply(null, outerArgs);
                });
            }, this);
        },

        _addRequest : function (fRequest) {
            this.aRequestQueue.push(fRequest);
            if (!this.bRequestRunning) {
                this.bRequestRunning = true;
                this.aRequestQueue.shift()();
            }
        },

        _checkRequestQueue : function () {
            if (this.aRequestQueue.length === 0) {
                this.bRequestRunning = false;
            } else {
                this.aRequestQueue.shift()();
            }
        },

        _requestFailed : function () {
            this.aRequestQueue = [];
            this.bRequestRunning = false;
        },

        /*
         * oData should have the following parameters:
         * title
         */
        _createGroup : function (sChannelId, sEventId, oData) {
            var oGroup = this._getGroupModel(null),
                aGroups = this.oModel.getProperty("/groups"),
                oModel = this.oModel;

            oModel.setProperty("/groupList-skipScrollToGroup", true);
            window.setTimeout(function () {
                oModel.setProperty("/groups/" + aGroups.length, oGroup);
            }, 500);
            window.setTimeout(function () {
                oModel.setProperty("/groupList-skipScrollToGroup", false);
            }, 1000);

            // We don't call the backend here as the user hasn't had the opportunity to give the group a name yet.
            // The group will be persisted after it got a name, in the changeGroupTitle handler.
            // TODO: This depends on the behaviour of the GroupList, which enters edit-mode immediately after creating a group.
            //       It would be better if this event would be fired after the group has a name.
        },

        /*
         * oData should have the following parameters:
         * title
         * location
         */
        _createGroupAt : function (sChannelId, sEventId, oData) {
            var newGroupIndex = parseInt(oData.location, 10),
                aGroups = this.oModel.getProperty("/groups"),
                oGroup = this._getGroupModel(null, false, newGroupIndex === aGroups.length),
                oModel = this.oModel,
                i;

            oGroup.index = newGroupIndex;
            aGroups.splice(newGroupIndex, 0, oGroup);
            for (i = 0; i < aGroups.length - 1; i++) {
                aGroups[i].isLastGroup = false;
            }

            //set new groups index
            for (i = newGroupIndex + 1; i < aGroups.length; i++) {
                aGroups[i].index++;
            }
            oModel.setProperty("/groups", aGroups);
        },

        _getIndexOfGroup : function (sGroupId) {
            var nGroupIndex = null,
                aGroups = this.oModel.getProperty("/groups");
            jQuery.each(aGroups, function (nIndex, oGroup) {
                if (oGroup.groupId === sGroupId) {
                    nGroupIndex = nIndex;
                    return false;
                }
            });
            return nGroupIndex;
        },

        _getIndexOfGroupByObject : function (oGroup) {
            var nGroupIndex = null,
                aGroups = this.oModel.getProperty("/groups"),
                sGroupId = this.oPageBuilderService.getGroupId(oGroup);
            aGroups.forEach(function (oModelGroup, nIndex) {
                var sCurrentGroupId = this.oPageBuilderService.getGroupId(oModelGroup.object);
                if (sCurrentGroupId === sGroupId) {
                    nGroupIndex = nIndex;
                    return false;
                }
            }.bind(this));
            return nGroupIndex;
        },

        _getPathOfGroup : function (sGroupId) {
            return "/groups/" + this._getIndexOfGroup(sGroupId);
        },

        _getPathOfTile : function (sTileId) {
            var aGroups = this.oModel.getProperty("/groups"),
                nResGroupIndex = null,
                nResTileIndex = null;

            jQuery.each(aGroups, function (nGroupIndex, oGroup) {
                jQuery.each(oGroup.tiles, function (nTileIndex, oTile) {
                    if (oTile.uuid === sTileId) {
                        nResGroupIndex = nGroupIndex;
                        nResTileIndex = nTileIndex;
                        return false;
                    }
                });

                if (nResGroupIndex !== null) {
                    return false;
                }
            });

            return nResGroupIndex !== null ? "/groups/" + nResGroupIndex + "/tiles/" + nResTileIndex : null;
        },

        // see http://stackoverflow.com/questions/5306680/move-an-array-element-from-one-array-position-to-another
        _moveInArray : function (aArray, nFromIndex, nToIndex) {
            if (nToIndex >= aArray.length) {
                var k = nToIndex - aArray.length;
                while ((k--) + 1) {
                    aArray.push(undefined);
                }
            }
            aArray.splice(nToIndex, 0, aArray.splice(nFromIndex, 1)[0]);
        },

        _updateGroupIndices : function (aArray) {
            var k;
            for (k = 0; k < aArray.length; k++) {
                aArray[k].index = k;
            }
        },
        /*
         * oData should have the following parameters
         * groupId
         */
        _deleteGroup : function (sChannelId, sEventId, oData) {
            var that = this,
                sGroupId = oData.groupId,
                aGroups = this.oModel.getProperty("/groups"),
                nGroupIndex = this._getIndexOfGroup(sGroupId),
                bIsLast = aGroups.length - 1 === nGroupIndex,
                oGroup = null,
                oResultPromise,
                oModel,
                nextSelectedItemIndex,
                oBus;

            nextSelectedItemIndex = bIsLast ? nGroupIndex - 1 : nGroupIndex;
            this._destroyGroupModel("/groups/" + nGroupIndex);
            oGroup = aGroups.splice(nGroupIndex, 1)[0].object;
            if (bIsLast) {
                this.oModel.setProperty("/groups/" + nextSelectedItemIndex + "/isLastGroup", bIsLast);
            }
            oModel = this.oModel;
            oModel.setProperty("/groupList-skipScrollToGroup", true);
            oModel.setProperty("/groups", aGroups);
            this._updateGroupIndices(aGroups);

            if (nextSelectedItemIndex >= 0) {
                oBus = sap.ui.getCore().getEventBus();
                window.setTimeout($.proxy(oBus.publish, oBus, "launchpad", "scrollToGroup", { groupId : this.oModel.getProperty("/groups")[nextSelectedItemIndex].groupId }), 200);
            }

            window.setTimeout(function () {
                oModel.setProperty("/groupList-skipScrollToGroup", false);
            }, 1000);

            this._addRequest($.proxy(function () {
                var groupName = sap.ushell.Container.getService("LaunchPage").getGroupTitle(oGroup);
                try {
                    oResultPromise = this.oPageBuilderService.removeGroup(oGroup);
                } catch (err) {
                    this._resetGroupsOnFailure("fail_to_delete_group_msg");
                    return;
                }

                oResultPromise.done($.proxy(this._showLocalizedMessage("group_deleted_msg", [groupName])));
                oResultPromise.fail(this._handleAfterSortable(that._resetGroupsOnFailureHelper("fail_to_delete_group_msg")));
                oResultPromise.always($.proxy(this._checkRequestQueue, this));
            }, this));
        },

        /*
         * oData should have the following parameters
         * groupId
         */
        _resetGroup : function (sChannelId, sEventId, oData) {
            var that = this,
                sGroupId = oData.groupId,
                nGroupIndex = this._getIndexOfGroup(sGroupId),
                oGroup = this.oModel.getProperty("/groups/" + nGroupIndex),
                oResultPromise;

            this.oModel.setProperty("/groups/" + nGroupIndex + "/sortable", false);

            this._addRequest($.proxy(function () {
                try {
                    oResultPromise = this.oPageBuilderService.resetGroup(oGroup.object);
                } catch (err) {
                    this._resetGroupsOnFailure("fail_to_reset_group_msg");
                    return;
                }

                oResultPromise.done(this._handleAfterSortable($.proxy(function (sGroupId, oGroup, oResetedGroup) {
                    var nGroupIndex = that._getIndexOfGroup(sGroupId);

                    this._loadGroup(nGroupIndex, oResetedGroup || oGroup.object);
                    this._showLocalizedMessage("group_reset_msg", [oGroup.title]);
                    this.oModel.setProperty("/groups/" + nGroupIndex + "/sortable", true);

                    var oGroupControl = sap.ui.getCore().byId('dashboardGroups').getGroupControlByGroupId(sGroupId);
                    if (oGroupControl) {
                        oGroupControl.rerender();
                    }

                }, this, sGroupId, oGroup)));

                oResultPromise.fail(this._handleAfterSortable(that._resetGroupsOnFailureHelper("fail_to_reset_group_msg")));
                oResultPromise.always($.proxy(this._checkRequestQueue, this));
            }, this));
        },

        /*
         * oData should have the following parameters
         * fromIndex
         * toIndex
         */
        _moveGroup : function (sChannelId, sEventId, oData) {
            var iFromIndex = oData.fromIndex,
                iToIndex = oData.toIndex,
                aGroups = this.oModel.getProperty("/groups"),
                oModel = this.oModel,
                bActionMode = this.oModel.getProperty("/tileActionModeActive"),
                oResultPromise;

            //Fix the indices to support hidden groups
            if (!bActionMode) {
                iFromIndex = this._adjustFromGroupIndex(iFromIndex, aGroups);
            }

            //Move var definition after fixing the from index.
            var oGroup = aGroups[iFromIndex],
                sGroupId = oGroup.groupId;
            //Fix the to index accordingly
            if (!bActionMode) {
                iToIndex = this._adjustToGroupIndex(iToIndex, aGroups, sGroupId);
            }

            this._moveInArray(aGroups, iFromIndex, iToIndex);
            this._updateGroupIndices(aGroups);
            oModel.setProperty("/groupList-skipScrollToGroup", true);
            for (var i = 0; i < aGroups.length - 1; i++) {
                aGroups[i].isLastGroup = false;
            }
            aGroups[aGroups.length - 1].isLastGroup = true;
            oModel.setProperty("/groups", aGroups);

            window.setTimeout(function () {
                oModel.setProperty("/groupList-skipScrollToGroup", false);
            }, 1000);

            this._addRequest($.proxy(function () {
                var oGroup = this.oModel.getProperty(this._getPathOfGroup(sGroupId));
                try {
                    oResultPromise = this.oPageBuilderService.moveGroup(oGroup.object, iToIndex);
                } catch (err) {
                    this._resetGroupsOnFailure("fail_to_move_group_msg");
                    return;
                }
                oResultPromise.fail(this._handleAfterSortable(this._resetGroupsOnFailureHelper("fail_to_move_group_msg")));
                oResultPromise.always($.proxy(this._checkRequestQueue, this));
            }, this));
        },

        /*
         * toIndex - The index in the UI of the required group new index. (it is not including the group itself)
         * groups - The list of groups in the model (including hidden and visible groups)
         * The function returns the new index to be used in the model - since there might be hidden groups that should be taken in account
         */
        _adjustToGroupIndex : function (toIndex, groups, groupId) {
            var visibleCounter = 0,
                bIsGroupIncluded = false,
                i = 0;
            // In order to get the new index, count all groups (visible+hidden) up to the new index received from the UI.
            for (i = 0; i < groups.length && visibleCounter < toIndex; i++) {
                if (groups[i].isGroupVisible) {
                    if (groups[i].groupId === groupId) {
                        bIsGroupIncluded = true;
                    } else {
                        visibleCounter++;
                    }
                }
            }
            if (bIsGroupIncluded) {
                return i - 1;
            }
            return i;
        },

        _adjustFromGroupIndex : function (index, groups) {
            var visibleGroupsCounter = 0,
                i;
            for (i = 0; i < groups.length; i++) {
                if (groups[i].isGroupVisible) {
                    visibleGroupsCounter++;
                }
                if (visibleGroupsCounter === index + 1) {
                    return i;
                }
            }
            //Not suppose to happen, but if not found return the input index
            return index;
        },
        /*
         * oData should have the following parameters
         * groupId
         * newTitle
         */
        _changeGroupTitle : function (sChannelId, sEventId, oData) {
            var sNewTitle = oData.newTitle,
                aGroups = this.oModel.getProperty("/groups"),
                sGroupId = oData.groupId,
                nGroupIndex = this._getIndexOfGroup(sGroupId),
                oGroup = this.oModel.getProperty("/groups/" + nGroupIndex),
                oResultPromise;

            this.oModel.setProperty("/groups/" + nGroupIndex + "/title", sNewTitle);

            // Check, if the group has already been persisted.
            if (!oGroup.object) {
                // Add the group in the backend.
                this._addRequest($.proxy(function () {
                    try {
                        if (nGroupIndex === aGroups.length - 1) {
                            oResultPromise = this.oPageBuilderService.addGroup(sNewTitle, nGroupIndex);
                        } else {
                            oResultPromise = this.oPageBuilderService.addGroupAt(sNewTitle, nGroupIndex);
                        }
                    } catch (err) {
                        this._resetGroupsOnFailure("fail_to_create_group_msg");
                        return;
                    }

                    oResultPromise.done(this._handleAfterSortable($.proxy(function (sGroupId, oNewGroup) {
                        var nGroupIndex = this._getIndexOfGroup(sGroupId);
                        this._loadGroup(nGroupIndex, oNewGroup);
                    }, this, sGroupId)));

                    oResultPromise.fail( this._handleAfterSortable(this._resetGroupsOnFailureHelper("fail_to_create_group_msg")));
                }, this));
            } else {
                // Rename the group in the backend.
                // model is already changed - it only has to be made persistent in the backend
                this._addRequest($.proxy(function () {
                    try {
                        oResultPromise = this.oPageBuilderService.setGroupTitle(oGroup.object, sNewTitle);
                    } catch (err) {
                        this._resetGroupsOnFailure("fail_to_rename_group_msg");
                        return;
                    }

                    // Revert to the old title.
                    oResultPromise.fail(this._handleAfterSortable($.proxy(function (sGroupId, sOldTitle) {
                        var sGroupPath = this._getPathOfGroup(sGroupId);
                        this._showLocalizedError("fail_to_rename_group_msg");
                        this.oModel.setProperty(sGroupPath + "/title", sOldTitle);
                        this._requestFailed();
                    }, this, sGroupId)));
                }, this));
            }

            oResultPromise.always($.proxy(this._checkRequestQueue, this));
        },

        _createTile : function (oData) {
            var oCatalogTileContext = oData.catalogTileContext,
                oContext = oData.groupContext,
                oGroup = this.oModel.getProperty(oContext.getPath()),
                sGroupId = oGroup.groupId,
                oResultPromise,
                deferred = jQuery.Deferred(),
                oResponseData = {};

            //publish event for UserActivityLog
            var oBus = sap.ui.getCore().getEventBus();
            $.proxy(oBus.publish, oBus, "launchpad", "addTile", {
                catalogTileContext : oCatalogTileContext,
                groupContext: oContext
            });

            if (!oCatalogTileContext) {
                jQuery.sap.log.warning("DashboardManager: Did not receive catalog tile object. Abort.", this);
                return;
            }

            this._addRequest($.proxy(function () {
                try {
                    oResultPromise = this.oPageBuilderService.addTile(oCatalogTileContext.getProperty("src"), oContext.getProperty("object"));
                } catch (err) {
                    this._resetGroupsOnFailure("fail_to_add_tile_msg");
                    return;
                }

                var that = this;
                oResultPromise
                    .done(this._handleAfterSortable($.proxy(function (sGroupId, oTile) {
                        var sGroupPath = this._getPathOfGroup(sGroupId);
                        this._addTileToGroup(sGroupPath, oTile);
                        oResponseData = {group: oGroup, status: 1, action: 'add'}; // 1 - success
                        deferred.resolve(oResponseData);
                    }, this, sGroupId)))
                    .fail(function () {
                        oResponseData = {group: oGroup, status: 0, action: 'add'};  // 0 - failure
                        deferred.resolve(oResponseData);
                    })
                    .always(
                    function () {
                        that._checkRequestQueue();
                    }
                );
            }, this));

            return deferred.promise();
        },

        _createGroupAndSaveTile : function (oData) {
            var oCatalogTileContext = oData.catalogTileContext,
                sNewTitle = oData.newGroupName,
                oResultPromise,
                deferred = jQuery.Deferred(),
                oResponseData = {};

            if (sap.ushell.utils.validHash(sNewTitle) && oCatalogTileContext){

                var oGroup = this._getGroupModel(null, false, true),
                    aGroups = this.oModel.getProperty("/groups"),
                //oBus = sap.ui.getCore().getEventBus(),
                    sGroupId = oGroup.groupId;

                var index = aGroups.length;
                aGroups[index - 1].isLastGroup = false;
                oGroup.title = sNewTitle;
                oGroup.index = index;
                aGroups.push(oGroup);
                this.oModel.setProperty("/groups/", aGroups);

                if (!oCatalogTileContext) {
                    jQuery.sap.log.warning("DashboardManager: Did not receive catalog tile object. Abort.", this);
                    return;
                }

                // Create new group
                this._addRequest($.proxy(function () {
                    try {
                        oResultPromise = this.oPageBuilderService.addGroup(sNewTitle);
                    } catch (err) {
                        this._resetGroupsOnFailure("fail_to_create_group_msg");
                        return;
                    }

                    oResultPromise.done(this._handleAfterSortable($.proxy(function (sGroupId, oNewGroup) {
                        var nGroupIndex = this._getIndexOfGroup(sGroupId);

                        this._loadGroup(nGroupIndex, oNewGroup);

                        var oContext = new sap.ui.model.Context(this.oModel, "/groups/" + nGroupIndex);

                        var promise = this._createTile({
                            catalogTileContext : oCatalogTileContext,
                            groupContext: oContext
                        });

                        promise.done(function(data){
                            oResponseData = {group: data.group, status: 1, action: 'addTileToNewGroup'}; // 1 - success
                            deferred.resolve(oResponseData);
                        }).fail(function(data){
                            oResponseData = {group: data.group, status: 0, action: 'addTileToNewGroup'}; // 0 - failure
                            deferred.resolve(oResponseData);
                        });
                    }, this, sGroupId)));

                    oResultPromise.fail(function (data) {
                        this._handleAfterSortable(this._resetGroupsOnFailureHelper("fail_to_create_group_msg"));
                        oResponseData = {group: data.group, status: 0, action: 'createNewGroup'}; // 0 - failure
                        deferred.resolve(oResponseData); // 0 - failure
                    }.bind(this));

                    oResultPromise.always($.proxy(this._checkRequestQueue, this));
                }, this));
            }
            return deferred.promise();
        },

        /*
         * Dashboard
         * oData should have the following parameters
         * tileId
         * groupId
         */
        _deleteTile : function (sChannelId, sEventId, oData) {
            var that = this,
                sTileId = oData.tileId || oData.originalTileId,
                aGroups = this.oModel.getProperty("/groups");

            jQuery.each(aGroups, function (nGroupIndex, oGroup) {
                var bFoundFlag = false;
                jQuery.each(oGroup.tiles, function (nTileIndex, oTmpTile) {
                    if (oTmpTile.uuid === sTileId || oTmpTile.originalTileId === sTileId) {
                        // Remove tile from group.
                        that._destroyTileModel("/groups/" + nGroupIndex + "/tiles/" + nTileIndex);
                        var oTile = oGroup.tiles.splice(nTileIndex, 1)[0],
                            oResultPromise;

                        that.oModel.setProperty("/groups/" + nGroupIndex + "/tiles", oGroup.tiles);

                        that._addRequest(function () {
                            try {
                                oResultPromise = that.oPageBuilderService.removeTile(oGroup.object, oTile.object);
                            } catch (err) {
                                this._resetGroupsOnFailure("fail_to_remove_tile_msg");
                                return;
                            }

                            oResultPromise.done(that._handleAfterSortable(function () {
                                var sTileName = sap.ushell.Container.getService("LaunchPage").getTileTitle(oTile.object);
                                if (sTileName) {
                                    that._showLocalizedMessage("tile_deleted_msg", [sTileName, oGroup.title]);
                                } else {
                                    that._showLocalizedMessage("tile_deleted_msg", [sTileName, oGroup.title]);
                                }

                            }));
                            oResultPromise.fail(that._handleAfterSortable(that._resetGroupsOnFailureHelper("fail_to_remove_tile_msg")));
                            oResultPromise.always( $.proxy(that._checkRequestQueue, that) );
                        });
                        sap.ushell.utils.handleTilesVisibility();
                        bFoundFlag = true;
                        return false;
                    }
                });
                if (bFoundFlag) {
                    return false;
                }
            });
        },

        _sendDeleteTileRequest : function (oGroup, oTile) {
            var oResultPromise,
                tmpPageBuilderService = sap.ushell.Container.getService('LaunchPage');
            try {
                oResultPromise = tmpPageBuilderService.removeTile(oGroup, oTile.object);
            } catch (err) {
                jQuery.sap.log.error("_deleteCatalogTileFromGroup ; removeTile ; Exception occurred: " + err);
            }

            return oResultPromise;
        },

        /*
         * Delete all instances of a catalog Tile from a Group
         */
        _deleteCatalogTileFromGroup : function (oData) {
            var that = this,
                sDeletedTileCatalogId = decodeURIComponent(oData.tileId),
                iGroupIndex = oData.groupIndex,
                oGroup = this.oModel.getProperty("/groups/" + iGroupIndex),
                serv = sap.ushell.Container.getService("LaunchPage"),
                deferred = jQuery.Deferred(),
                aDeleteTilePromises = [],
                that = this,
                aFilteredTiles;

            aFilteredTiles = oGroup.tiles.filter(
                function (oTile) {
                    var sTmpTileCatalogId = serv.getCatalogTileId(oTile.object);
                    if (sTmpTileCatalogId !== sDeletedTileCatalogId) {
                        return true;
                    } else {
                        // Initialize oPositiveDeferred object that will later be resolved with the status of the delete request
                        var oPositiveDeferred = jQuery.Deferred(),
                        // Send the delete request to the server
                            oDeletePromise = that._sendDeleteTileRequest(oGroup.object, oTile );

                        oDeletePromise.done(
                            (function (deferred) {
                                return function () {
                                    deferred.resolve({status: true});
                                };
                            })(oPositiveDeferred));

                        oDeletePromise.fail(
                            (function (deferred) {
                                return function () {
                                    deferred.resolve({status: false});
                                };
                            })(oPositiveDeferred));

                        aDeleteTilePromises.push(oPositiveDeferred);

                        return false;
                    }
                });

            oGroup.tiles = aFilteredTiles;

            // Wait for all of the delete requests before resolving the deferred
            jQuery.when.apply(jQuery, aDeleteTilePromises).
                done(
                function( result ){
                    var bSuccess = true,
                        index = 0,
                        promisesLength = aDeleteTilePromises.length;
                    // Check if at least one deleteTilePromises has failure status
                    for ( index; index < promisesLength; index++) {
                        if (!result.status) {
                            bSuccess = false;
                            break;
                        }
                    }
                    if (bSuccess){
                        //   that.oModel.setProperty("/groups/" + iGroupIndex + "/tiles/", oGroup.tiles);
                        that.oModel.setProperty("/groups/" + iGroupIndex, oGroup );
                    }

                    deferred.resolve({group: oGroup, status: bSuccess, action: 'remove'});
                });
            return deferred.promise();
        },

        /*
         * oData should have the following parameters:
         * fromGroupId
         * toGroupId
         * fromIndex
         * toIndex can be null => append as last tile in group
         */
        _moveTile : function (sChannelId, sEventId, oData) {
            var that = this,
                nNewIndex = oData.toIndex,
                sNewGroupId = oData.toGroupId,
                sTileId = oData.sTileId,

                oTile,
                nTileIndex,

                oOldGroup,
                nOldGroupIndex,

                oNewGroup,
                nNewGroupIndex,

                aGroups = this.oModel.getProperty("/groups");

            jQuery.each(aGroups, function (nTmpGroupIndex, oTmpGroup) {
                var bFoundFlag = false;
                jQuery.each(oTmpGroup.tiles, function (nTmpTileIndex, oTmpTile) {
                    if (oTmpTile.uuid === sTileId) {
                        oTile = oTmpTile;
                        nTileIndex = nTmpTileIndex;
                        oOldGroup = oTmpGroup;
                        nOldGroupIndex = nTmpGroupIndex;
                        bFoundFlag = true;
                        return false;
                    }
                });
                if (bFoundFlag) {
                    return false;
                }
            });
            jQuery.each(aGroups, function (nTmpGroupIndex, oTmpGroup) {
                if (oTmpGroup.groupId === sNewGroupId) {
                    oNewGroup = oTmpGroup;
                    nNewGroupIndex = nTmpGroupIndex;
                }
            });

            // When a tile is dragged into an empty group, the Plus-Tiles in the empty list cause
            // the new index to be off by one, i.e. 1 instead of 0, which causes an error.
            // This is a generic check which sanitizes the values if necessary.
            if (nNewIndex && nNewIndex > oNewGroup.tiles.length) {
                nNewIndex = oNewGroup.tiles.length;
            }

            if (oOldGroup.groupId === sNewGroupId) {
                if (nNewIndex === null || nNewIndex === undefined) {
                    // moved over group list to same group
                    oOldGroup.tiles.splice(nTileIndex, 1);
                    // Tile is appended. Set index accordingly.
                    nNewIndex = oOldGroup.tiles.length;
                    // append as last item
                    oOldGroup.tiles.push(oTile);
                } else {
                    nNewIndex = this._adjustTileIndex(nNewIndex, oTile, oOldGroup);
                    this._moveInArray(oOldGroup.tiles, nTileIndex, nNewIndex);
                }

                this.oModel.setProperty("/groups/" + nOldGroupIndex + "/tiles", oOldGroup.tiles);
            } else {
                // remove from old group
                oOldGroup.tiles.splice(nTileIndex, 1);
                this.oModel.setProperty("/groups/" + nOldGroupIndex + "/tiles", oOldGroup.tiles);

                // add to new group
                if (nNewIndex === null || nNewIndex === undefined) {
                    // Tile is appended. Set index accordingly.
                    nNewIndex = oNewGroup.tiles.length;
                    // append as last item
                    oNewGroup.tiles.push(oTile);
                } else {
                    nNewIndex = this._adjustTileIndex(nNewIndex, oTile, oNewGroup);
                    oNewGroup.tiles.splice(nNewIndex, 0, oTile);
                }
                this.oModel.setProperty("/groups/" + nNewGroupIndex + "/tiles", oNewGroup.tiles);
            }
            // Re-calculate the visibility of the Tiles
            sap.ushell.utils.handleTilesVisibility();

            // change in backend
            var oSourceGroup = this.oModel.getProperty("/groups/" + nOldGroupIndex).object,
                oTargetGroup = this.oModel.getProperty("/groups/" + nNewGroupIndex).object,
                oResultPromise;

            this._addRequest($.proxy(function () {
                try {
                    oResultPromise = this.oPageBuilderService.moveTile(oTile.object, nTileIndex, nNewIndex, oSourceGroup, oTargetGroup);
                } catch (err) {
                    this._resetGroupsOnFailure("fail_to_move_tile_msg");
                    return;
                }

                // Putting a special flag on the Tile's object
                // this enables us to disable opening the tile's action until it has been updated from the backend
                // (see in DashboardContent.view
                oTile.tileIsBeingMoved = true;
                
                oResultPromise.done(this._handleAfterSortable($.proxy(function (sTileId, oTargetTile) {
                    var sTilePath = this._getPathOfTile(sTileId);

                    // If we cannot find the tile, it might have been deleted -> Check!
                    if (sTilePath) {
                        // Update the model with the new tile object and new Id.
                        this.oModel.setProperty(sTilePath + "/object", oTargetTile);
                        this.oModel.setProperty(sTilePath + "/originalTileId", this.oPageBuilderService.getTileId(oTargetTile));

                        // get the target-tile view and align the Model for consistency
                        this.oPageBuilderService.getTileView(oTargetTile).done(function(oView) {
                        	// get the old view from tile's model
                        	var oldViewContent = this.oModel.getProperty(sTilePath + "/content"); 
                            // first we set new view
                            this.oModel.setProperty(sTilePath + "/content", [oView]);                            
                        	//now we destroy the old view
                            if (oldViewContent && oldViewContent[0]) {
                            	oldViewContent[0].destroy();
                            }
                        	// reset the move-scenario flag
                        	this.oModel.setProperty(sTilePath + "/tileIsBeingMoved", false);
                        }.bind(this));
                    }
                }, this, sTileId)));

                oResultPromise.fail(this._handleAfterSortable(this._resetGroupsOnFailureHelper("fail_to_move_tile_msg")));
                oResultPromise.always($.proxy(this._checkRequestQueue, this));
            }, this));
        },

        // Adjust the moved-tile new index according to the visible+hidden tiles
        _adjustTileIndex : function (newLocationIndex, oTile, newGroup) {
            var visibleCounter = 0,
                bIsTileIncluded = false,
                i = 0;
            // In order to get the new index, count all tiles (visible+hidden) up to the new index received from the UI.
            for (i = 0; i < newGroup.tiles.length && visibleCounter < newLocationIndex; i++) {
                if (newGroup.tiles[i].isTileIntentSupported) {
                    if (newGroup.tiles[i] === oTile) {
                        bIsTileIncluded = true;
                    } else {
                        visibleCounter++;
                    }
                }
            }
            if (bIsTileIncluded) {
                return i - 1;
            }
            return i;
        },

        // temporary - should not be exposed
        getModel : function () {
            return this.oModel;
        },

        getDashboardView : function () {
            if (!sap.ui.getCore().byId('dashboard')) {
                this.oDashboardView = sap.ui.jsview("dashboard", "sap.ushell.renderers.fiori2.launchpad.dashboard.DashboardContent");
            }
            return this.oDashboardView;
        },

        getGroupListView : function () {
            if (!sap.ui.getCore().byId('groupList')) {
                this.oGroupListView = sap.ui.jsview("groupList", "sap.ushell.renderers.fiori2.launchpad.group_list.GroupList");
            }
            return this.oGroupListView;
        },

        isGroupListViewCreated : function () {
            return this.oGroupListView != undefined;
        },

        // CATALOG LOADING

        loadAllCatalogs : function (sChannelId, sEventId, oData) {
            if (!this.oModel.getProperty("/catalogs") ||
                !sap.ushell.Container.getService("LaunchPage").isCatalogsValid()) {
                var that = this;

                // catalog also needs groups
                if (!this.oModel.getProperty("/groups") || this.oModel.getProperty("/groups").length === 0 ) {
                    this.loadPersonalizedGroups();
                }
                this.numOfLoadedCatalogs = 0;
                this._destroyAllGroupModels("/catalogs");
                this._destroyAllTileModels("/catalogTiles");
                // Clear existing Catalog items
                this.oModel.setProperty("/catalogs", []);
                this.oModel.setProperty("/catalogTiles", []);

                // Array of promise objects that are generated inside addCatalogToModel (the "progress" function of getCatalogs)
                this.aPromises = [];

                // Trigger loading of catalogs
                sap.ushell.Container.getService("LaunchPage").getCatalogs()
                    // There's a need to make sure that onDoneLoadingCatalogs is called only after all catalogs are loaded
                    // (i.e. all calls to addCatalogToModel are finished).
                    // For this, all the promise objects that are generated inside addCatalogToModel are generated into this.aPromises,
                    // and jQuery.when calls onDoneLoadingCatalogs only after all the promises are resolved
                    .done(function(catalogs) {
                        jQuery.when.apply(jQuery, this.aPromises).then(this.onDoneLoadingCatalogs(catalogs));
                    }.bind(this))
                    //in case of a severe error, show an error message
                    .fail(that._showLocalizedErrorHelper("fail_to_load_catalog_msg"))
                    //for each loaded catalog, add it to the model
                    .progress(this.addCatalogToModel.bind(this));
            }
            var aGroups = this.getModel().getProperty("/groups");
            if (aGroups && aGroups .length !== 0) {
                this.mapCatalogTilesToGroups();
                // update the catalogTile model after mapCatalogTilesToGroups() was called
                this.updateCatalogTilesToGroupsMap();
            }
        },

        updateCatalogTilesToGroupsMap : function () {
            var catalogTiles = this.getModel().getProperty("/catalogTiles"),
                tile,
                index,
                tileId,
                associatedGrps,
                aGroups;
            var srvc = sap.ushell.Container.getService("LaunchPage");
            var catalogTilesModel = this.getModel().getProperty("/catalogTiles");
            // if the catalogTile model doesn't exist, it will be updated in some time later
            if (catalogTiles) {
                for (index = 0; index < catalogTiles.length; index++) {
                    tile = catalogTiles[index];
                    tileId = encodeURIComponent(srvc.getCatalogTileId(tile.src));
                    associatedGrps = this.getModel().getProperty("/catalogTiles/" + index + "/associatedGroups");
                    aGroups = this.oTileCatalogToGroupsMap[tileId];
                    associatedGrps = aGroups ? aGroups : [];
                    catalogTilesModel[index].associatedGroups = associatedGrps;
                }
            }
            this.getModel().setProperty("/catalogTiles", catalogTilesModel);
        },

        /** 
         * Adds a catalog object to the model including the catalog tiles.
         * The catalog is added to the "/catalogs" array in the model, and the tiles are added to "/catalogTiles".
         * If a catalog with the same title already exists - no new entry is added to the model for the new catalog, 
         *  and the tiles are added to "/catalogTiles" with indexes that place them under the catalog (with the same title) that already exists  
         *   
         *  @param {object} catalog 
         */  
        addCatalogToModel : function (oCatalog) {
                var aCurrentCatalogs = this.oModel.getProperty('/catalogs'),
                    srvc = sap.ushell.Container.getService("LaunchPage"),
                    sCatalogId = srvc.getCatalogId(oCatalog),
                    sCatalogTitle = srvc.getCatalogTitle(oCatalog),
                    bCatalogExist = false;
                
                // Check if the catalog already exist in the model, or catalog with similar title
                aCurrentCatalogs.forEach(function (oCat){
                    if (oCat.id === sCatalogId) {
                        bCatalogExist = true;
                    }
                });

            if (!bCatalogExist) {
                var oCatalogModel = {
                        title: srvc.getCatalogTitle(oCatalog),
                        id: srvc.getCatalogId(oCatalog),
                        "static": false,
                        tiles: [],
                        numberOfTiles: 0
                    },
                    oPromise;

                oPromise = srvc.getCatalogTiles(oCatalog);
                this.aPromises.push(oPromise);

                oPromise.done(function (aTiles) {
                        //if this catalog has no tiles we do not need to add it to the model
                        if (!aTiles.length) {
                            return;
                        }
                        var oCatalogData = {
                            catalog: oCatalogModel.title,
                            id: oCatalogModel.id,
                            index: this.numOfLoadedCatalogs,
                            numberOfExistingTiles: 0
                        };
                        
                        // In order to make sure that only one catalog is updated in the model at a given time - 
                        //  the part of adding a catalog (+ catalog tiles) to the model is synchronized
                        var updateModelSynchronized = function() {
                        	
                    		// Check if another catalog is currently being put in the model
                    		if (!this.oModel.getProperty('/isCatalogInUpdate')) {
                    			
                    			this.oModel.setProperty('/isCatalogInUpdate', true);

                    			// Check if a catalog with the given title already exists in the model.
		                        var oExistingCatalogInModel = this.searchModelCatalogByTitle(oCatalogModel.title);

		                        // If a catalog with similar title already exists in the model:
	                        	//  - Update the object catalogData before it is passed to setCatalogTiles 
		                        //  - Update the relevant catalog in the model with the updated amount of tiles it now has   
		                        if(oExistingCatalogInModel.result) {

		                        	// Update /catalogTiles
		                        	oCatalogData.index = oExistingCatalogInModel.indexOfPreviousInstanceInPage;
		                        	oCatalogData.numberOfExistingTiles = oExistingCatalogInModel.numOfTilesInCatalog;
		                        	this.setCatalogTiles("/catalogTiles", true, oCatalogData, aTiles);
		                        	
		                        	// Update /catalogs
		                        	var aCatalogs = this.oModel.getProperty('/catalogs');
		                        	oCatalog = aCatalogs[oExistingCatalogInModel.indexOfPreviousInstanceInModel];
		                        	oCatalog.numIntentSupportedTiles = getNumIntentSupportedTiles.call(this, oCatalogModel);
	                        	    oCatalog.numberOfTiles = oExistingCatalogInModel.numOfTilesInCatalog + aTiles.length;
	                        	    aCurrentCatalogs[oExistingCatalogInModel.indexOfPreviousInstanceInModel] = oCatalog;

                    			} else {
                    				this.setCatalogTiles("/catalogTiles", true, oCatalogData, aTiles);
                    				oCatalogModel.numIntentSupportedTiles = getNumIntentSupportedTiles.call(this, oCatalogModel);
                    				
                    				oCatalogModel.numberOfTiles = aTiles.length;
                    				aCurrentCatalogs.push(oCatalogModel);
                    				this.numOfLoadedCatalogs++;
                    			}
		                        
		                        this.oModel.setProperty('/catalogs', aCurrentCatalogs);

		                        // Update the model with the catalog - finished 
		                        this.oModel.setProperty('/isCatalogInUpdate', false);
		                        return;
                    		}
	                        setTimeout(updateModelSynchronized, 50);
                        }.bind(this);
                        
                        // Call the synchronized catalog update function 
                        updateModelSynchronized();
	                        
                    }.bind(this)
                ).fail(this._showLocalizedErrorHelper("fail_to_load_catalog_tiles_msg"));
            }
        },
        
        /** 
         * check if a catalog with the given title already exists in the model.
         *  
         *  @param {string} catalogTitle
         * 
         *  @returns {object} - an object that includes:   
         *  - result - a boolean value indicating whether the model already includes a catalog with the same title 
         *  - indexOfPreviousInstanceInModel - the index in the model (in /catalogs) of the existing catalog with the given title 
         *  - indexOfPreviousInstanceInPage - the index in the page of the existing  catalog with the given title, 
         *     this value usually equals (indexOfPreviousInstanceInModel-1) since the model includes the dummy-catalog "All Cataslogs" 
         *     that doesn't appear in the page  
         *  - numOfTilesInCatalog - the number of tiles in the catalog with the given title
         */  
        searchModelCatalogByTitle: function (catalogTitle) {
        	var catalogs = this.oModel.getProperty('/catalogs'),
        	    catalogTitleExists = false,
        		indexOfPreviousInstance,
        		numOfTilesInCatalog = 0,
        		bGeneralCatalogAppeared = false;
          	
        	$.each (catalogs, function (index, tempCatalog) {
        		// If this is the catalogsLoading catalog - remember that it was read since the found index should be reduced by 1    
        		if(tempCatalog.title === sap.ushell.resources.i18n.getText('catalogsLoading')) {
        			bGeneralCatalogAppeared = true;
        		} else if (catalogTitle == tempCatalog.title) {
        	    	indexOfPreviousInstance = index;
        	    	numOfTilesInCatalog = tempCatalog.numberOfTiles;
        	    	catalogTitleExists = true;
        	    	return false;
                }
        	});
        	return {
                result: catalogTitleExists, 
                indexOfPreviousInstanceInModel: indexOfPreviousInstance,
                indexOfPreviousInstanceInPage: bGeneralCatalogAppeared ? indexOfPreviousInstance - 1 : indexOfPreviousInstance, 
                numOfTilesInCatalog: numOfTilesInCatalog
        	};        	
        },
        
        getTagList: function (maxTags) {
            var indexedTags = {},
                ind = 0,
                tempTagsLst = [],
                tag,
                oTag,
                sorted;

            for (ind = 0; ind < this.tagsPool.length; ind++) {
                oTag = this.tagsPool[ind];
                if (indexedTags[oTag]) {
                    indexedTags[oTag]++;
                } else {
                    indexedTags[oTag] = 1;
                }
            }

            //find the place in the sortedTopTiles.
            for (tag in indexedTags) {
                tempTagsLst.push({tag: tag, occ: indexedTags[tag]});
            }

            sorted = tempTagsLst.sort(function (a, b) {
                return b.occ - a.occ;
            });

            if (sorted.length === 0) {
                this.oModel.setProperty("/tagFiltering", false);
            }

            if (maxTags) {
                this.oModel.setProperty("/tagList", sorted.slice(0, maxTags));
            } else {
                this.oModel.setProperty("/tagList", sorted);
            }
        },

        onDoneLoadingCatalogs : function (aCatalogs) {
            var srvc = sap.ushell.Container.getService("LaunchPage");
            var aLoadedCatalogs = aCatalogs.filter(function (oCatalog) {
                return !srvc.getCatalogError(oCatalog);
            });
            //check if some of the catalogs failed to load
            if (aLoadedCatalogs.length !== aCatalogs.length){
                this._showLocalizedError("partialCatalogFail");
            }

            // Check if filtering catalog tiles by tags is enabled
            if (this.oModel.getProperty("/tagFiltering") == true) {
                //create the tags menu
                this.getTagList();
            }

            var aCurrentCatalogs = this.oModel.getProperty('/catalogs');
            //filter out the "Loading Catalogs..." menu item if exists
            if (aCurrentCatalogs[0] && aCurrentCatalogs[0].title === sap.ushell.resources.i18n.getText('catalogsLoading')) {
                aCurrentCatalogs.splice(0, 1);
            }
            //create the "All" static entry for the catalogSelect menu
            aCurrentCatalogs.splice(0, 0, {
                title : getLocalizedText("catalogSelect_initial_selection"),
                "static" : true,
                tiles : [],
                numIntentSupportedTiles : -1//only in order to present this option in the Catalog.view (dropdown menu)since there is a filter there on this property
            });
            this.oModel.setProperty('/catalogs', aCurrentCatalogs);
            sap.ushell.utils.handleTilesVisibility();
        },

        setCatalogTiles : function (sPath, bAppend, oData, aCatalogTiles) {
            var srvc = sap.ushell.Container.getService("LaunchPage"),
                aUpdatedCatalogTiles = $.map(
                    aCatalogTiles,
                    function (oCatalogTile, iTile) {
                        var catalogTileId = encodeURIComponent(srvc.getCatalogTileId(oCatalogTile)),
                            associatedGrps = this.oTileCatalogToGroupsMap[catalogTileId] || [],
                            tileTags = srvc.getCatalogTileTags(oCatalogTile) || [];

                        if (tileTags.length > 0) {
                            this.tagsPool = this.tagsPool.concat(tileTags);
                        }
                        
                        return {
                            associatedGroups : associatedGrps,
                            src : oCatalogTile,
                            catalog : oData.catalog,
                            catalogIndex :  this.calculateCatalogTileIndex(oData.index, oData.numberOfExistingTiles, iTile),
                            catalogId : oData.id,
                            title : srvc.getCatalogTileTitle(oCatalogTile),
                            tags : tileTags,
                            keywords : (srvc.getCatalogTileKeywords(oCatalogTile) || []).join(','),
                            id : catalogTileId,
                            size : srvc.getCatalogTileSize(oCatalogTile),
                            content : [srvc.getCatalogTileView(oCatalogTile)],
                            isTileIntentSupported : srvc.isTileIntentSupported(oCatalogTile)
                        };
                    }.bind(this)
                );
            
            // Fill tile info for current catalog
            this.oModel.setProperty(sPath, $.merge((bAppend && this.oModel.getProperty(sPath)) || [], aUpdatedCatalogTiles));
        },

       /** 
        * Calculate the index of a catalog tile in the catalog page.
        *  @param the index of the catalog
        *  @param the number of catalog tiles that were already loaded for previous catalog/s with the same title 
        *  @param the index of the current catalog tile in the containing catalog    
        */  
        calculateCatalogTileIndex : function (catalogIndex, numberOfExistingTiles, iTile) {
        	var result = parseInt(catalogIndex * 100000);
        	result += (numberOfExistingTiles !== undefined ? numberOfExistingTiles : 0) +  iTile;
        	return result;
        },
        
        mapCatalogTilesToGroups : function () {

            this.oTileCatalogToGroupsMap = {};

            //Calculate the relation between the CatalogTile and the instances.
            var oGroups = this.oModel.getProperty("/groups"),
                srvc = sap.ushell.Container.getService("LaunchPage"),
                indexGrps = 0,
                oGroup,
                tileInd,
                oTiles,
                tileId,
                tileGroups,
                groupId;

            for (indexGrps = 0; indexGrps < oGroups.length; indexGrps++) {
                oGroup = oGroups[indexGrps];
                oTiles = oGroup.tiles;
                if (oTiles) {
                    for (tileInd = 0; tileInd < oTiles.length; ++tileInd) {
                        tileId = encodeURIComponent(srvc.getCatalogTileId(oTiles[tileInd].object));
                        tileGroups = this.oTileCatalogToGroupsMap[tileId] || [];
                        groupId = srvc.getGroupId(oGroup.object);
                        // We make sure the group is visible and not locked, otherwise we should not put it in the map it fills.
                        if (tileGroups.indexOf(groupId) === -1 && (typeof (oGroup.isGroupVisible) === 'undefined' || oGroup.isGroupVisible) && !oGroup.isGroupLocked) {
                            tileGroups.push(groupId);
                        }
                        this.oTileCatalogToGroupsMap[tileId] = tileGroups;
                    }
                }
            }
        },

        /**
         * Shows a localized message in the Message-Toast.
         * @param {string} sMsgId
         *      The localization id of the message
         * @param {object} oParams
         *      Additional parameters for the Message Toast showing the message. Can be undefined.
         * @param {sap.ushell.services.Message.Type} [iType=sap.ushell.services.Message.Type.INFO]
         *      The message type (optional)
         */
        _showLocalizedMessage : function (sMsgId, oParams, iType) {
            sap.ushell.Container.getService("Message").show(iType || sap.ushell.services.Message.Type.INFO, getLocalizedText(sMsgId, oParams), oParams);
        },
        /**
         * Shows a localized error message in the Message-Toast.
         * @param {string} sMsgId
         *      The localization id of the message
         * @param {object} oParams
         *      Additional parameters for the Message Toast showing the message. Can be undefined.
         *
         */
        _showLocalizedError : function (sMsgId, oParams) {
            this._showLocalizedMessage(sMsgId, oParams, sap.ushell.services.Message.Type.ERROR);
        },

        /**
         * A wrapper for _showLocalizedError to reduce boilerplate code in error handling.
         * @param {string} sMsgId
         *      The localization id of the message
         * @param {object} oParams
         *      Additional parameters for the Message Toast showing the message. Can be undefined.
         * @returns {Function}
         *      A function that will call _showLocalizedError with the given parameters.
         */
        _showLocalizedErrorHelper : function (sMsgId, oParams) {
            var that = this;
            return function () {
                that._showLocalizedError(sMsgId, oParams);
            };
        },

        /**
         * Helper function to bind an error message to a reset-function, which reloads all groups
         * from a group array when called.
         * @param {string} sMsgId
         *      The id of the localized string.
         * @returns {Function}
         *      The reset function, which returns the dashboard into an consistent state.
         */
        _resetGroupsOnFailureHelper : function (sMsgId) {
            var that = this;
            return function (aGroups) {
                that._showLocalizedError(sMsgId);
//                that._requestFailed();

                // Give the Toast a chance to be shown before the reload freezes the screen.
                setTimeout(function () {
                    that.loadGroupsFromArray(aGroups);
                });
            };
        },

        /**
         * Helper function to reset groups after a backend failure.
         * @param {string} sMsgId
         *      The id of the localized string.
         */
        _resetGroupsOnFailure : function (sMsgId, aParameters) {
            this._requestFailed();
            this._showLocalizedError(sMsgId, aParameters);
            this.loadPersonalizedGroups();
            this.oModel.updateBindings(true);
        },

        /**
         * Load all groups in the given array. The default group will be loaded first.
         * @param aGroups
         *      The array containing all groups (including the default group).
         */
        loadGroupsFromArray : function (aGroups) {
            var that = this;

            this.oPageBuilderService.getDefaultGroup().done(function (oDefaultGroup) {
                var i = 0,
                    lockedGroups = [],
                    buildSortedGroups,
                    indexOfDefaultGroup = aGroups.indexOf(oDefaultGroup),
                    numOfLockedGroup = jQuery.grep(aGroups, function(group) {
                        return that.oPageBuilderService.isGroupLocked(group);
                    }).length,
                    oNewGroupModel,
                    aNewGroups = [];

                // remove default group from array
                aGroups.splice(indexOfDefaultGroup,1);

                while(i < aGroups.length) {
                    var oGroup = aGroups[i],
                        isLocked = that.oPageBuilderService.isGroupLocked(oGroup);

                    if (isLocked) {
                        lockedGroups.push(oGroup);
                        aGroups.splice(i, 1);
                    } else {
                        i++;
                    }
                }
                // sort only locked groups
                lockedGroups.sort(function(x, y) {
                    var xTitle = that.oPageBuilderService.getGroupTitle(x).toLowerCase(),
                        yTitle = that.oPageBuilderService.getGroupTitle(y).toLowerCase();
                    return xTitle < yTitle ? -1 : 1;
                });

                // bring back default group to array
                buildSortedGroups = lockedGroups;
                buildSortedGroups.push(oDefaultGroup);
                buildSortedGroups.push.apply(buildSortedGroups, aGroups);
                aGroups = buildSortedGroups;
                var groupLength = aGroups.length,
                    modelGroupsLength = that.oModel.getProperty("/groups/length");
                // save default group index
                that.oModel.setProperty("/groups/indexOfDefaultGroup", numOfLockedGroup);

                for (i = groupLength; i < modelGroupsLength; ++i) {
                    that._destroyGroupModel("/groups/" + i);
                }

                for (i = 0; i < groupLength; ++i) {
                    oNewGroupModel = that._getGroupModel(aGroups[i], i === numOfLockedGroup, i === groupLength - 1);
                    oNewGroupModel.index = i;
                    aNewGroups.push(oNewGroupModel);
                }

                that.oModel.setProperty('/groups', aNewGroups);
                //set new length in case there are less new groups
                that.oModel.setProperty("/groups/length", groupLength);

                if (that.oModel.getProperty('/currentState/stateName') === "catalog") {
                    // update the catalogTile's groups mapping, and update the catalogTile
                    // model if nedded only when in the catalog flow
                    that.mapCatalogTilesToGroups();
                    that.updateCatalogTilesToGroupsMap();
                }
            }).fail(that._resetGroupsOnFailureHelper("fail_to_get_default_group_msg"));
        },

        /**
         * Load all tiles in a group and add the group to the internal model.
         * @param nIndex
         *      The index at which the group should be added. 0 is reserved for the default group.
         * @param oGroup
         *      The group as it is returned by the UI2 services.
         */
        _loadGroup : function (nIndex, oGroup) {
            var that = this,
                sGroupPath = "/groups/" + nIndex,
                defaultGroupIndex = that.oModel.getProperty("/groups/indexOfDefaultGroup"),
                bIsLast = that.oModel.getProperty(sGroupPath).isLastGroup;
            this._destroyGroupModel(sGroupPath);
            // Set group on model
            var sOldGroupId = this.oModel.getProperty(sGroupPath + "/groupId"),
                oNewGroupModel = this._getGroupModel(oGroup, nIndex === defaultGroupIndex, bIsLast);

            // If the group already exists, keep the id. The backend-handlers relay on the id staying the same.
            if (sOldGroupId) {
                oNewGroupModel.groupId = sOldGroupId;
            }

            oNewGroupModel.index = nIndex;
            this.oModel.setProperty(sGroupPath, oNewGroupModel);
        },

        _getGroupModel : function (oGroup, bDefault, bLast) {
            var srvc = this.oPageBuilderService,
                aGroupTiles = (oGroup && srvc.getGroupTiles(oGroup)) || [],
                aModelTiles = [],
                i,
                isSortable,
                oShell = sap.ui.getCore().byId("shell"),
                oModel,
                currentState,
                isStateHome;

            if (oShell) {
                oModel = oShell.getModel();
                isSortable = oModel.getProperty("/personalization");
                currentState = oModel.getProperty("/currentState").stateName;
                if (currentState) {
                    isStateHome = currentState === "home";
                }
            }

            // in a new group scenario we create the group as null at first.
            var isGroupLocked = oGroup && srvc.isGroupLocked(oGroup) ? true : false;

            for (i = 0; i < aGroupTiles.length; ++i) {
                aModelTiles.push(this._getTileModel(aGroupTiles[i], isGroupLocked));
            }

            return {
                title           : (bDefault && getLocalizedText("my_group")) ||
                (oGroup && srvc.getGroupTitle(oGroup)) ||
                "",
                object          : oGroup,
                groupId         : jQuery.sap.uid(),
                tiles           : aModelTiles,
                isDefaultGroup  : bDefault || false,
                editMode        : !oGroup && isStateHome,
                isGroupLocked   : isGroupLocked,
                removable       : !oGroup || srvc.isGroupRemovable(oGroup),
                sortable        : isSortable,
                isGroupVisible  : !oGroup || srvc.isGroupVisible(oGroup),
                isEnabled       : !bDefault, //Currently only default groups is considered as locked
                isLastGroup     : bLast || false
            };
        },

        _addTileToGroup : function (sGroupPath, oTile) {
            var sTilePath = sGroupPath + "/tiles",
                iNumTiles = this.oModel.getProperty(sTilePath).length;

            //Locked groups cannot be added with tiles, so the target group will not be locked, however just for safety we will check the target group locking state
            var isGroupLocked = this.oModel.getProperty(sGroupPath + "/isGroupLocked");
            this.oModel.setProperty(sTilePath + "/" + iNumTiles, this._getTileModel(oTile, isGroupLocked));
        },

        _updateModelWithTileView : function(sTileUUID, oTileView){
            var that = this;

            //add the tile view to the update queue
            this.tileViewUpdateQueue.push({uuid: sTileUUID, view: oTileView});

            /*
             in order to avoid many updates to the model we wait to allow
             other tile update to accumulate in the queue.
             therefore we clear the previous call to update the model
             and create a new one
             */
            if (this.tileViewUpdateTimeoutID){
                clearTimeout(this.tileViewUpdateTimeoutID);
            }
            this.tileViewUpdateTimeoutID = setTimeout(function(){
                that.tileViewUpdateTimeoutID = undefined;
                /*
                 we wait with the update till the personalization operation is done
                 to avoid the rendering of the tiles during D&D operation
                 */
                that.oSortableDeferred.done(function(){
                    that._updateModelWithTilesViews();
                });
            }, 50);
        },

        _updateModelWithTilesViews : function(){
            var aGroups = this.oModel.getProperty("/groups"),
                aTiles,
                oTileModel,
                oUpdatedTile,
                sSize,
                bTall,
                bLong,
                oReLayoutGroups = {};

            if (!aGroups) {
                return;
            }

            /*
             go over the tiles in the model and search for tiles to update.
             tiles are identified using uuid
             */
            for (var i = 0; i < aGroups.length; i = i + 1) {
                //group loop - get the groups tiles
                aTiles = aGroups[i].tiles;
                for (var j = 0; j < aTiles.length; j = j + 1) {
                    //group tiles loop - get the tile model
                    oTileModel = aTiles[j];
                    for (var q = 0; q < this.tileViewUpdateQueue.length; q++){
                        //updated tiles view queue loop - check if the current tile was updated
                        oUpdatedTile = this.tileViewUpdateQueue[q];
                        if (oTileModel.uuid == oUpdatedTile.uuid){
                            if (oUpdatedTile.view){
                                /*
                                 if view is provided then we destroy the current content
                                 (TileState control) and set the tile view
                                 */
                                oTileModel.content[0].destroy();
                                oTileModel.content = [oUpdatedTile.view];
                                /*
                                 in some cases tile size can be different then the initial value
                                 therefore we read and set the size again
                                 */
                                sSize = this.oPageBuilderService.getTileSize(oTileModel.object);
                                bLong = ((sSize !== null) && (sSize === "1x2" || sSize === "2x2")) || false;
                                bTall = ((sSize !== null) && (sSize === "2x1" || sSize === "2x2")) || false;
                                //bLong = true;
                                //bTall = true;
                                if (oTileModel['long'] !== bLong || oTileModel.tall !== bTall){
                                    oTileModel['long'] = bLong;
                                    oTileModel.tall = bTall;
                                    oReLayoutGroups[aGroups[i].groupId] = true;
                                }
                            } else {
                                //some error on getTileView, therefore we set the state to 'Failed'
                                oTileModel.content[0].setState("Failed");
                            }
                            break;
                        }
                    }
                }
            }

            //clear the update queue and set the model
            this.tileViewUpdateQueue = [];
            this.oModel.setProperty("/groups", aGroups);
            if (!jQuery.isEmptyObject(oReLayoutGroups)){
                var oDashboardView = this.getDashboardView();
                var aGroupsControl = oDashboardView.oDashboardGroupsBox.getGroups();
                for (var sGroupId in oReLayoutGroups){
                    for (var i = 0; i < aGroupsControl.length; i++){
                        if (aGroupsControl[i].getGroupId() === sGroupId){
                            sap.ushell.Layout.reRenderGroupLayout(aGroupsControl[i]);
                            break;
                        }
                    }
                }
            }
        },

        getModelTileById: function (sId) {
            var aGroups = this.oModel.getProperty('/groups'),
                oModelTile;
            aGroups.forEach(function (oGroup) {
                oGroup.tiles.forEach(function (oTile) {
                    if (oTile.uuid === sId || oTile.originalTileId === sId) {
                        oModelTile = oTile;
                        return;
                    }
                });
            });
            return oModelTile;
        },

        _getTileModel : function (oTile, isGroupLocked) {
            var srvc = this.oPageBuilderService,
                sSize = srvc.getTileSize(oTile),
                sTileUUID = jQuery.sap.uid(),
                oTileView,
                fUpdateModelWithView,
                that = this,
                oDfd;

            // first we set visibility of tile to false
            // before we get the tile's model etc.
            srvc.setTileVisible(oTile, false);

            oDfd = srvc.getTileView(oTile);

            /*
             register done and fail handlers for the getTileView API.
             */
            oDfd.done(function(oView){
                oTileView = oView;
                if (fUpdateModelWithView){
                    //call to the '_updateModelWithTileView' with uuid and view
                    fUpdateModelWithView.apply(that, [sTileUUID, oTileView]);
                }
            });
            oDfd.fail(function(){
                if (fUpdateModelWithView){
                    //call to the '_updateModelWithTileView' with uuid and no view to indicate failure
                    fUpdateModelWithView.apply(that, [sTileUUID]);
                } else {
                    jQuery.sap.require('sap.ushell.ui.launchpad.TileState');
                    // in case call is synchronise we set the view with 'TileState' control with 'Failed' status
                    oTileView = new sap.ushell.ui.launchpad.TileState({state: "Failed"});
                }
            });

            /*
             in case getTileView is asynchronous we set the 'fUpdateModelWithView' to handle the view
             update, and create a 'Loading' TileState control as the tile view
             */
            if (!oTileView){
                fUpdateModelWithView = this._updateModelWithTileView;
                jQuery.sap.require('sap.ushell.ui.launchpad.TileState');
                oTileView = new sap.ushell.ui.launchpad.TileState({state: "Loading"});
            }

            //Tile is locked or not according to the group it belongs to.
            return {
                "object"  : oTile,
                "originalTileId": srvc.getTileId(oTile),
                "uuid"    : sTileUUID,
                "tileCatalogId"  : encodeURIComponent(srvc.getCatalogTileId(oTile)),
                "content" : [oTileView],
                "long"    : ((sSize !== null) && (sSize === "1x2" || sSize === "2x2")) || false,
                "tall"    : ((sSize !== null) && (sSize === "2x1" || sSize === "2x2")) || false,
                "target"  : srvc.getTileTarget(oTile) || "",
                "debugInfo": srvc.getTileDebugInfo(oTile),
                "isTileIntentSupported": srvc.isTileIntentSupported(oTile),
                "rgba"  : "",
                "isLocked" : isGroupLocked,
                "showActionsIcon" : this.oModel.getProperty("/tileActionsIconEnabled") || false
            };
        },

        _destroyAllGroupModels : function (oTarget) {
            var aGroups = (typeof oTarget === "string") ? this.oModel.getProperty(oTarget) : oTarget,
                i;
            if (aGroups) {
                for (i = 0; i < aGroups.length; i = i + 1) {
                    this._destroyGroupModel(aGroups[i]);
                }
            }
        },

        _destroyGroupModel : function (oTarget) {
            var oGroupModel = (typeof oTarget === "string") ? this.oModel.getProperty(oTarget) : oTarget;
            if (oGroupModel) {
                this._destroyAllTileModels(oGroupModel.tiles);
            }
        },

        _destroyAllTileModels : function (oTarget) {
            var aTiles = (typeof oTarget === "string") ? this.oModel.getProperty(oTarget) : oTarget,
                i;
            if (aTiles) {
                for (i = 0; i < aTiles.length; i = i + 1) {
                    this._destroyTileModel(aTiles[i]);
                }
            }
        },

        _destroyTileModel : function (oTarget) {
            var oTileModel = (typeof oTarget === "string") ? this.oModel.getProperty(oTarget) : oTarget,
                i;
            if (oTileModel && oTileModel.content) {
                for (i = 0; i < oTileModel.content.length; i = i + 1) {
                    oTileModel.content[i].destroy();
                }
            }
        },

        /**
         * Load all user groups from the backend. (Triggered on initial page load.)
         */
        loadPersonalizedGroups : function () {
            var that = this,
                oGroupsPromise = this.oPageBuilderService.getGroups();

            oGroupsPromise.done(function (aGroups) {
                that.loadGroupsFromArray(aGroups);
            });

            oGroupsPromise.fail(that._showLocalizedErrorHelper("fail_to_load_groups_msg"));
        }
    });
}());

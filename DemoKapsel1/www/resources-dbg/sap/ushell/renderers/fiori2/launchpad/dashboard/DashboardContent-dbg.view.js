// Copyright (c) 2009-2014 SAP SE, All Rights Reserved

(function () {
    "use strict";
    /*global jQuery, sap, document, self */
    /*jslint plusplus: true, nomen: true, vars: true */

    jQuery.sap.require("sap.ushell.ui.launchpad.TileContainer");
    jQuery.sap.require("sap.ushell.ui.launchpad.Tile");
    jQuery.sap.require("sap.ushell.override");
    jQuery.sap.require("sap.ushell.resources");
    jQuery.sap.require("sap.ushell.Layout");

    sap.ui.jsview("sap.ushell.renderers.fiori2.launchpad.dashboard.DashboardContent", {

        createContent: function (oController) {
            this.bAnimate = false; //@todo alex, sap.ui.Device.system.desktop;
            this.isTouch = !sap.ui.Device.system.desktop;
            this.oDashboardGroupsBox = this._getDashboardGroupsBox(oController);
            this.bTileContainersContentAdded = false;
            //First hidden Dashboard item to support TabIndex
            var firstHiddenDashboardTabFocusHelper = new sap.m.Button('firstHiddenDashboardTabFocusHelper');
            firstHiddenDashboardTabFocusHelper.addEventDelegate({
                onfocusin: function () {
                    try {
                        var shellData = sap.ui.getCore().byId('shell').getModel().getData();
                        if (shellData.currentState.showPane) {
                            var groupListPage = sap.ui.getCore().byId('groupListPage');
                            var footer = groupListPage.getFooter();
                            jQuery(footer.getDomRef()).find("[tabindex=0]").last().focus();
                        } else {
                            sap.ui.getCore().byId('actionsBtn').focus();
                        }
                    } catch (e) {

                    }
                }
            });
            var lastHiddenDashboardTabFocusHelper = new sap.m.Button('lastHiddenDashboardTabFocusHelper');
            lastHiddenDashboardTabFocusHelper.addEventDelegate({
                onfocusin: function () {
                    try {
                        sap.ui.getCore().byId('floatingActionBtn').getDomRef().focus();
                    } catch (e) {

                    }
                }
            });
            sap.ui.getCore().getEventBus().subscribe("launchpad", "enterEditMode", this._addTileContainersContent, this);

            return [firstHiddenDashboardTabFocusHelper, this.oDashboardGroupsBox, lastHiddenDashboardTabFocusHelper];
        },

        _addTileContainersContent : function () {
            if (!this.bTileContainersContentAdded) {
                var aGroups = this.oDashboardGroupsBox.getGroups();

                aGroups.forEach(function (group, groupIndex) {
                    this._addTileContainerContent(groupIndex);
                }.bind(this));
                this.bTileContainersContentAdded = true;
            }
        },

        _addTileContainerContent: function (groupIndex) {
            var oGroup = this.oDashboardGroupsBox.getGroups()[groupIndex];

            if (oGroup) {
                var sBindingCtxPath = oGroup.getBindingContext().getPath() + '/';

                oGroup.addBeforeContent(this._getBeforeContent(this.oController, sBindingCtxPath));
                oGroup.addAfterContent(this._getAfterContent(this.oController, sBindingCtxPath));
                oGroup.addHeaderAction(this._getHeaderAction(this.oController, sBindingCtxPath));
            }
        },

        _getDashboardGroupsBox : function (oController) {
            var that = this;
            var oTilesContainerTemplate = this._getTileContainerTemplate(oController),
                oViewData = this.getViewData(),
                oConfig;
            if (oViewData) {
                oConfig = oViewData.config;
            }

            var fnEnableLockedGroupCompactLayout = function () {
                if (oConfig && oConfig.enableLockedGroupsCompactLayout && !that.getModel().getProperty('/tileActionModeActive')) {
                    return true;
                }
                return false;
            };

            var fAfterRenderingHandler = function () {
                if (!sap.ushell.Layout.isInited) {
                    sap.ushell.Layout.init({getGroups: this.getGroups.bind(this), isLockedGroupsCompactLayoutEnabled: fnEnableLockedGroupCompactLayout});
                    //when media is changed we need to rerender Layout
                    //media could be changed by SAPUI5 without resize, or any other events. look for internal Incident ID: 1580000668
                    sap.ui.Device.media.attachHandler(function () {
                        var sCurrentState = this.getModel().getProperty("/currentState");
                        if (sCurrentState.stateName === "home") {
                            sap.ushell.Layout.reRenderGroupsLayout(null, true);
                        }
                    }, this, sap.ui.Device.media.RANGESETS.SAP_STANDARD);
                }
                if (this.getGroups().length) {
                    if (this.getModel().getProperty("/personalization")) {
                        that._disableUIActions(); //disable the previous instance of UIActions
                        that._disableEditModeUIActions();
                        that.uiActions = new sap.ushell.UIActions({
                            containerSelector: '#dashboardGroups',
                            wrapperSelector: '#dashboard',
                            draggableSelector: ".sapUshellTile[role='link']",
                            draggableSelectorExclude: ".sapUshellPlusTile",
                            rootSelector : "#shell-container",
                            placeHolderClass : "sapUshellTile-placeholder",
                            cloneClass : "sapUshellTile-clone",
                            scrollContainerSelector : that.bAnimate ? "#cloneArea" : undefined,
                            clickCallback :oController._handleClick.bind(that),
                            startCallback : that._handleTileUIStart.bind(that),
                            endCallback : that._handleDrop.bind(that),
                            dragCallback : that._handleStartDrag.bind(that),
                            dragAndScrollCallback : that._handleDragMove.bind(that),
                            moveTolerance : that.isTouch ? 10 : 3,
                            switchModeDelay : 1000,
                            isLayoutEngine: true,
                            isTouch : that.isTouch,
                            debug: false,
                            disabledDraggableSelector : 'sapUshellLockedTile',
                            onDragStartUIHandler : that.markDisableGroups.bind(that),
                            onDragEndUIHandler : that.unmarkDisableGroups.bind(that)
                        }).enable();

                        that.uiEditModeActions = new sap.ushell.UIActions({
                            containerSelector: '#dashboardGroups',
                            wrapperSelector: '#dashboard',
                            draggableSelector: ".sapUshellDashboardGroupsContainerItem:not(.sapUshellDisableDragAndDrop)",
                            draggableSelectorBlocker: ".sapUshellTilesContainer-sortable, .sapUshellTileContainerBeforeContent, .sapUshellTileContainerAfterContent",
                            rootSelector : "#shell-container",
                            placeHolderClass : "sapUshellDashboardGroupsContainerItem-placeholder",
                            cloneClass : "sapUshellDashboardGroupsContainerItem-clone",
                            clickCallback : oController._handleClick.bind(that),
                            startCallback : oController._handleActionModeUIStart.bind(that),
                            endCallback : oController._handleActionModeDrop.bind(that),
                            dragCallback : oController._handleActionModeStartDrag.bind(that),
                            moveTolerance : that.isTouch ? 10 : 0.1,
                            switchModeDelay : 1000,
                            isLayoutEngine: false,
                            isTouch : that.isTouch,
                            isVerticalDragOnly : true,
                            debug: false
                        });
                    }

                    if (this.getModel().getProperty("/tileActionModeActive")) {
                        that.uiEditModeActions.enable();
                    }

                    sap.ui.getCore().getEventBus().publish("launchpad", "contentRendered");
                    sap.ui.getCore().getEventBus().publish("launchpad", "contentRefresh");

                    var oLoadingDialog = sap.ui.getCore().byId("loadingDialog");
                    oLoadingDialog.closeLoadingScreen();
                    oController._addBottomSpace();

                    //Tile opacity is enabled by default, therefore we handle tile opacity in all cases except
                    //case where flag is explicitly set to false
                    if (!oConfig || oConfig.enableTilesOpacity !== false) {
                        sap.ushell.utils.handleTilesOpacity();
                    }
                }
                //Recheck tiles visibility on first load, and make visible tiles active
                try {
                    sap.ushell.utils.handleTilesVisibility();
                } catch (e) {
                    //nothing has to be done
                }

            };

            jQuery.sap.require("sap.ushell.ui.launchpad.DashboardGroupsContainer");
            var oGroupsContainer = new sap.ushell.ui.launchpad.DashboardGroupsContainer("dashboardGroups", {
                accessibilityLabel : sap.ushell.resources.i18n.getText("DashboardGroups_label"),
                groups : {
                    path: "/groups",
                    template : oTilesContainerTemplate
                },
                afterRendering : fAfterRenderingHandler
            });

            oGroupsContainer.addEventDelegate({
                onsapskipback: function (oEvent) {
                    oEvent.preventDefault();
                    //sidePanelFirstGroup
                    var jqElement = jQuery(".sapUshellGroupLI:first:visible");
                    if (!jqElement.length) {
                        jqElement = jQuery('#configBtn');
                    }
                    jqElement.focus();
                },
                onsaptabnext: function (oEvent) {
                    if (!(oEvent.srcControl instanceof sap.ushell.ui.launchpad.TileContainer)) {
                        oEvent.preventDefault();
                        jQuery("#lastHiddenDashboardTabFocusHelper").focus();
                    }
                },
                onsaptabprevious: function (oEvent) {
                    var  oModel = sap.ui.getCore().byId('shell').getModel(),
                        bIsActionsModeActive = oModel.getProperty('/tileActionModeActive');

                    if (!bIsActionsModeActive) {
                        if (!(oEvent.srcControl instanceof sap.ushell.ui.launchpad.TileContainer)) {
                            oEvent.preventDefault();
                            jQuery("#firstHiddenDashboardTabFocusHelper").focus();
                        }
                    }
                }
            });

            return oGroupsContainer;
        },

        //During drag action, locked groups should be mark with a locked icon and group opacity should be changed to grayish
        markDisableGroups : function () {
            this.getModel().setProperty('/isInDrag', true);
        },

        //once d&d ends, restore locked groups appearance and remove locked icons and grayscale
        unmarkDisableGroups : function () {
            this.getModel().setProperty('/isInDrag', false);
        },

        _getBeforeContent: function (oController) {
            var addGrpBtn = new sap.m.Button({
                icon: "sap-icon://add",
                text : "{i18n>add_group_at}",
                visible : {
                    parts: ["/tileActionModeActive"],
                    formatter : function (tileActionModeActive) {
                        return (!this.getParent().getIsGroupLocked() && !this.getParent().getDefaultGroup() && tileActionModeActive);
                    }
                },
                enabled: {
                    parts: ["/editTitle"],
                    formatter : function (isEditTitle) {
                        return !isEditTitle;
                    }
                },
                type: sap.m.ButtonType.Transparent,
                press : [ function (oData) {
                    var path = oData.getSource().getBindingContext().getPath(),
                        parsePath = path.split("/");
                    var index = window.parseInt(parsePath[parsePath.length - 1], 10);
                    this._publishAsync("launchpad", "createGroupAt", {
                        title : sap.ushell.resources.i18n.getText("new_group_name"),
                        location : index
                    });
                    setTimeout(function () {
                        var oView = this.getView(),
                            lastIndex = oView.oDashboardGroupsBox.getGroups().length - 1;

                        oView._addTileContainerContent(lastIndex);
                    }.bind(this), 0);
                }, oController]
            }).addStyleClass("sapUshellAddGroupButton");

            return addGrpBtn;
        },

        _getAfterContent: function (oController) {
            var addGrpBtn = new sap.m.Button({
                icon: "sap-icon://add",
                text : "{i18n>add_group_at}",
                visible : {
                    parts: ["isLastGroup", "/tileActionModeActive", "/isInDrag"],
                    formatter : function (isLast, tileActionModeActive, isInDrag) {

                        // Calculate the result only if isInDrag is false,
                        // meaning - if there was a drag-and-drop action - is it already ended
                        return (!isInDrag && isLast && tileActionModeActive);
                    }
                },
                enabled: {
                    parts: ["/editTitle"],
                    formatter : function (isEditTitle) {
                        return !isEditTitle;
                    }
                },
                type: sap.m.ButtonType.Transparent,
                press : [ function (oData) {
                    var path = oData.getSource().getBindingContext().getPath(),
                        parsePath = path.split("/");
                    var index = window.parseInt(parsePath[parsePath.length - 1], 10);
                    this._publishAsync("launchpad", "createGroupAt", {
                        title : sap.ushell.resources.i18n.getText("new_group_name"),
                        location : index + 1
                    });
                    setTimeout(function () {
                        this.getView()._addTileContainerContent(index + 1);
                    }.bind(this), 0);
                }, oController]
            }).addStyleClass("sapUshellAddGroupButton");

            return addGrpBtn;
        },

        _getHeaderAction: function (oController, sBindingCtxPath) {
            jQuery.sap.require("sap.ushell.ui.launchpad.GroupHeaderActions");

            var groupHeaderActionPanel = new sap.ushell.ui.launchpad.GroupHeaderActions({
                content : this._getHeaderActions(),
                tileActionModeActive: {
                    parts: ['/tileActionModeActive', sBindingCtxPath + 'isDefaultGroup'],
                    formatter: function (bIsActionModeActive, bIsDefaultGroup) {
                        return bIsActionModeActive && !bIsDefaultGroup;
                    }
                },
                isOverflow: '{/isPhoneWidth}'
            }).addStyleClass("sapUshellOverlayGroupActionPanel");

            return groupHeaderActionPanel;
        },

        _getTileContainerTemplate : function () {
            var oFilter = new sap.ui.model.Filter("isTileIntentSupported", sap.ui.model.FilterOperator.EQ, true);

            var oTilesContainerTemplate = new sap.ushell.ui.launchpad.TileContainer({
                headerText : "{title}",
                tooltip: "{title}",
                tileActionModeActive: '{/tileActionModeActive}',
                enableHelp: '{/enableHelp}',
                groupId: "{groupId}",
                defaultGroup: "{isDefaultGroup}",
                isLastGroup: "{isLastGroup}",
                isGroupLocked: "{isGroupLocked}",
                showHeader: true,
                editMode: "{editMode}",
                titleChange: function (oEvent) {
                    sap.ui.getCore().getEventBus().publish("launchpad", "changeGroupTitle", {
                        groupId : oEvent.getSource().getGroupId(),
                        newTitle : oEvent.getParameter("newTitle")
                    });
                },
                showPlaceholder: {
                    parts: ["/tileActionModeActive", "tiles/length"],
                    formatter: function (tileActionModeActive) {
                        return (tileActionModeActive || !this.groupHasVisibleTiles()) && !this.getIsGroupLocked();
                    }
                },
                visible: {
                    parts: ["/tileActionModeActive", "isGroupVisible", "tiles/length"],
                    formatter: function (tileActionModeActive, isGroupVisible) {
                        //Empty groups should not be displayed when personalization is off or if they are locked or default group not in action mode
                        if (!this.groupHasVisibleTiles() && (!this.getModel().getProperty("/personalization") || (this.getIsGroupLocked() && !tileActionModeActive) || (this.getDefaultGroup() && !tileActionModeActive))) {
                            return false;
                        }
                        return isGroupVisible || tileActionModeActive;
                    }
                },
                tiles: {
                    path : "tiles",
                    template : new sap.ushell.ui.launchpad.Tile({
                        draggable : false,
                        "long" : "{long}",
                        "tall" : "{tall}",
                        uuid : "{uuid}",
                        tileCatalogId : "{tileCatalogId}",
                        target : "{target}",
                        isLocked: "{isLocked}",
                        tileActionModeActive: "{/tileActionModeActive}",
                        showActionsIcon : "{showActionsIcon}",
                        rgba : "{rgba}",
                        animationRendered : false,
                        debugInfo : "{debugInfo}",
                        tileViews : {
                            path : "content",
                            factory : function (sId, oContext) {
                                return oContext.getObject();
                            }
                        },
                        coverDivPress : function (oEvent) {
                            // if this tile had just been moved and the move itself did not finish refreshing the tile's view
                            // we do not open the actions menu to avoid inconsistencies
                            if (!oEvent.oSource.getBindingContext().getObject().tileIsBeingMoved) {
                                sap.ushell.renderers.fiori2.ActionMode._openActionsMenu(oEvent);
                            }
                        }
                    }),
                    filters : [oFilter]
                },
                add : function () {
                    sap.ushell.renderers.fiori2.Navigation.openCatalogByHash();
                },
                removable: "{removable}",
                afterRendering: function (oEvent) {
                    if (sap.ushell.Layout.isInited) {
                        sap.ushell.Layout.reRenderGroupLayout(oEvent.getSource());
                    }
                    this.bindProperty("showBackground", "/tileActionModeActive");
                    this.bindProperty("showDragIndicator", {
                        parts: ['/tileActionModeActive', '/enableDragIndicator'],
                        formatter: function (bIsActionModeActive, bDragIndicator) {
                            return bIsActionModeActive && bDragIndicator && !this.getIsGroupLocked() && !this.getDefaultGroup();
                        }
                    });
                    this.bindProperty("showMobileActions", {
                        parts: ['/tileActionModeActive'],
                        formatter: function (bIsActionModeActive) {
                            return bIsActionModeActive && !this.getDefaultGroup();
                        }
                    });
                    this.bindProperty("showIcon", {
                        parts: [ '/isInDrag', '/tileActionModeActive'],
                        formatter: function (bIsInDrag, bIsActionModeActive) {
                            return (this.getIsGroupLocked() && (bIsInDrag || bIsActionModeActive)) || (this.getDefaultGroup() && bIsActionModeActive);
                        }
                    });
                    this.bindProperty("deluminate", {
                        parts: ['/isInDrag'],
                        formatter: function (bIsInDrag) {
                            return this.getIsGroupLocked() && bIsInDrag;
                        }
                    });
                }
            });

            return oTilesContainerTemplate;
        },

        _getHeaderActions: function () {
            return new sap.m.Button({
                text: {
                    path: 'removable',
                    formatter: function (bIsRemovable) {
                        if (sap.ui.Device.system.phone) {
                            if (bIsRemovable) {
                                this.setIcon("sap-icon://delete");
                            } else {
                                this.setIcon("sap-icon://refresh");
                            }
                        }
                        return sap.ushell.resources.i18n.getText(bIsRemovable ? 'DeleteGroupBtn' : 'ResetGroupBtn');
                    }
                },
                type: sap.m.ButtonType.Transparent,
                visible: {
                    parts: ['/tileActionModeActive', 'isDefaultGroup'],
                    formatter: function (bIsActionModeActive, bIsDefaultGroup) {
                        return bIsActionModeActive && !bIsDefaultGroup;
                    }
                },
                press: function (oEvent) {
                    var oSource = oEvent.getSource(),
                        oGroupBindingCtx = oSource.getBindingContext();
                    this.oController._handleGroupDeletion(oGroupBindingCtx);
                }.bind(this)
            }).addStyleClass("sapUshellHeaderActionButton");
        },

        _handleTileUIStart : function (evt, ui) {
            if ((sap.ui.Device.browser.msie) &&
                ((navigator.msMaxTouchPoints > 0) || (navigator.maxTouchPoints > 0))) {
                //Remove title so tooltip will not be displayed while dragging tile (IE10 and above)
                this.titleElement = ui.querySelector("[title]");
                this.titleElement.setAttribute("data-title", this.titleElement.getAttribute("title"));
                this.titleElement.removeAttribute("title");
            }
            //Prevent the browser to mark any elements while dragging
            if (sap.ui.Device.system.desktop) {
                jQuery('body').addClass("sapUshellDisableUserSelect");
            }
        },

        /**
         *
         * @param ui : tile DOM reference
         * @private
         */
        _handleStartDrag : function (evt, tileElement) {
            this._hidePlusTiles();
            sap.ushell.Layout.getLayoutEngine().layoutStartCallback(tileElement);
            //Prevent the tile to be launched after drop
            jQuery(tileElement).find("a").removeAttr('href');
            this.placeHolderElement = jQuery(".sapUshellTile-placeholder");
            sap.ui.getCore().getEventBus().publish("launchpad", "sortableStart");
            if (this.bAnimate) {
                this._startDragNDropAnimate(evt, tileElement);
            }
        },

        /**
         *
         * @param ui : tile DOM reference
         * @private
         */
        _handleDrop : function (evt, tileElement) {
            this._showPlusTiles();
            if ((sap.ui.Device.browser.msie) &&
                ((navigator.msMaxTouchPoints > 0) || (navigator.maxTouchPoints > 0))) {
                this.titleElement.setAttribute("title", this.titleElement.getAttribute("data-title"));
            }
            this.oController._handleDrop.call(this.oController, evt, tileElement);
            if (sap.ui.Device.desktop) {
                jQuery('body').removeClass("sapUshellDisableUserSelect");
            }
        },

        /**
         *
         * @param ui : tile DOM reference
         * @private
         */
        _handleDragMove : function (cfg) {
            if (!cfg.isScrolling) {
                sap.ushell.Layout.getLayoutEngine().moveDraggable(cfg.moveX, cfg.moveY);
            }

            if (!cfg.isScrolling && this.bAnimate) {
                this._changeDragNDropAnimate(cfg.evt, cfg.clone);
            }
        },

        _hidePlusTiles : function () {
            var aPlusTiles = document.querySelectorAll(".sapUshellPlusTile");
            for (var i = 0; i < aPlusTiles.length; i++) {
                aPlusTiles[i].className += " hidePlusTile";
            }
        },

        _showPlusTiles: function () {
            var aPlusTiles = document.querySelectorAll(".sapUshellPlusTile");
            for (var i = 0; i < aPlusTiles.length; i++) {
                aPlusTiles[i].className = aPlusTiles[i].className.split(' ' + 'hidePlusTile').join('');
            }
        },

        _getTileTopOffset : function (oTile, tilePosition, dashboardScrollTop) {
            var iTileTopOffset = 0 + dashboardScrollTop;
            iTileTopOffset += oTile.closest(".sapUshellDashboardGroupsContainerItem").position().top;
            iTileTopOffset += tilePosition.top;
            return iTileTopOffset;
        },

        _startDragNDropAnimate : function (evt, ui) {
            this.dragNDropData = {};
            //Create a clone area and append it to oDashboardGroupsBox element
            this.dragNDropData.jqCloneArea = jQuery("<div id='cloneArea' class='sapUshellCloneArea sapUshellDashboardGroupsContainerItem'></div>");//TODO[Nir]: Check if we need those css classes
            var jqDashboardGroupsBox = jQuery.sap.byId(this.oDashboardGroupsBox.getId());
            var tilesFirstContainer = jqDashboardGroupsBox.find('.sapUshellTileContainer:visible:first');
            this.dragNDropData.jqDashboard = jQuery("#dashboard");
            var dashboardPageScrollTop = this.dragNDropData.jqDashboard.scrollTop();
            this.dragNDropData.containerLeftMargin = parseInt(tilesFirstContainer.css("margin-left"), 10);

            //Refresh the current margin (window scaling and opening the sidebar change the margin)
            var containerOffsetLeft = parseFloat(jQuery("#dashboardPage-scroll").offset().left);
            var dashboardOffsetLeft = jqDashboardGroupsBox.offset().left;

            this.dragNDropData.jqCloneArea.css("left", dashboardOffsetLeft - containerOffsetLeft);

            this.dragNDropData.jqDraggableElements = jQuery(".sapUshellTile[role='link'],.sapUshellPlusTile", jqDashboardGroupsBox);

            this.dragNDropData.jqGroupTitles = jQuery(".sapUshellContainerTitle:visible", jqDashboardGroupsBox);

            var jqTile,
                tile,
                sTileLeftOffset,
                oClonedTile,
                iTileTopOffset,
                i;

            for (i = 0; i < this.dragNDropData.jqDraggableElements.length; i++) {
                jqTile = this.dragNDropData.jqDraggableElements.eq(i);
                tile = jqTile[0];
                //Clone the current tile (including style)
                oClonedTile = jqTile.clone(true);
                tile.tilePosition = jqTile.position();
                tile.tileOffset = jqTile.offset();
                oClonedTile.attr("id", oClonedTile.attr("id") + '-clone');
                oClonedTile.css("font-size", jqTile.css("font-size"));
                oClonedTile.addClass("sapUshellClonedTile");

                //Save the clone and the current group (sapUshellDashboardGroupsContainerItem)
                jqTile.data("clone", oClonedTile);

                //Position the clone inside the cloneArea
                sTileLeftOffset = parseInt(tile.tilePosition.left, 10) + this.dragNDropData.containerLeftMargin + "px";
                iTileTopOffset = this._getTileTopOffset(jqTile, tile.tilePosition, dashboardPageScrollTop);

                //Set the new position
                oClonedTile.css("left", sTileLeftOffset);
                oClonedTile.css("top", iTileTopOffset + "px");

                //Append the clone
                this.dragNDropData.jqCloneArea.append(oClonedTile);

                jqTile.css("visibility", "hidden");
            }

            var jqGroupTitle,
                groupTitle,
                sGroupTitleLeftOffset,
                oClonedGroupTitle,
                iGroupTitleTopOffset;

            for (i = 0; i < this.dragNDropData.jqGroupTitles.length; i++) {
                jqGroupTitle = this.dragNDropData.jqGroupTitles.eq(i);
                groupTitle = jqGroupTitle[0];

                oClonedGroupTitle = jqGroupTitle.clone(true);
                groupTitle.titlePosition = jqGroupTitle.position();
                groupTitle.titleOffset = jqGroupTitle.offset();
                oClonedGroupTitle.attr("id", oClonedGroupTitle.attr("id") + '-clone');
                oClonedGroupTitle.css("font-size", jqGroupTitle.css("font-size"));
                oClonedGroupTitle.addClass("sapUshellClonedTile");

                //Save the clone and the current group (sapUshellDashboardGroupsContainerItem) //TODO[Nir]: do we need it?
                jqGroupTitle.data("clone", oClonedGroupTitle);

                //Position the clone inside the cloneArea
                sGroupTitleLeftOffset = parseInt(groupTitle.titlePosition.left, 10) + this.dragNDropData.containerLeftMargin + "px";
                iGroupTitleTopOffset = this._getTileTopOffset(jqGroupTitle, groupTitle.titlePosition, dashboardPageScrollTop);

                //Set the new position
                oClonedGroupTitle.css("left", sGroupTitleLeftOffset);
                oClonedGroupTitle.css("top", iGroupTitleTopOffset + "px");

                //Append the clone
                this.dragNDropData.jqCloneArea.append(oClonedGroupTitle);

                jqGroupTitle.css("visibility", "hidden");
            }

            this.dragNDropData.jqDashboard.append(this.dragNDropData.jqCloneArea);
        },

        _changeDragNDropAnimate : function (evt, ui) {
            var dashboardPageScrollTop = this.dragNDropData.jqDashboard.scrollTop();
            var jqTile,
                tile,
                currentTilePosition,
                currentTileOffset,
                tileLeftOffset,
                iTileTopOffset,
                i,
                oClonedTile;

            for (i = 0; i < this.dragNDropData.jqDraggableElements.length; i++) {
                jqTile = this.dragNDropData.jqDraggableElements.eq(i);
                tile = jqTile[0];
                //Get the original tile and its clone
                currentTilePosition = jqTile.position();
                currentTileOffset = jqTile.offset();
                if ((currentTileOffset.left === tile.tileOffset.left) && (currentTileOffset.top === tile.tileOffset.top)) {
                    continue;
                }
                tile.tilePosition = currentTilePosition;
                tile.tileOffset = currentTileOffset;
                oClonedTile = jqTile.data("clone");
                if (!oClonedTile) {
                    continue;
                }

                //Get the invisible tile that has snapped to the new
                //location, get its position, and animate the visible
                //clone to it
                tileLeftOffset = tile.tilePosition.left + this.dragNDropData.containerLeftMargin;
                iTileTopOffset = this._getTileTopOffset(jqTile, tile.tilePosition, dashboardPageScrollTop);

                //Stop currently running animations
                //Without this, animations would queue up
                oClonedTile.stop(true, false).animate({left: tileLeftOffset, top: iTileTopOffset}, {duration: 250}, {easing: "swing"});
            }
        },

        _stopDragNDropAnimation : function (evt, ui) {
            if (this.bAnimate) {
                //Show all original tiles and reset everything
                this.dragNDropData.jqDraggableElements.removeData("clone");
                this.dragNDropData.jqDraggableElements.css("visibility", "visible");
                this.dragNDropData.jqGroupTitles.css("visibility", "visible");

                //Delete all clones
                this.dragNDropData.jqCloneArea.empty();
                this.dragNDropData.jqCloneArea.remove();
            }
        },

        _disableUIActions : function () {
            if (this.uiActions) {
                this.uiActions.disable();
                this.uiActions = null;
            }
        },
        _disableEditModeUIActions : function () {
            if (this.uiEditModeActions) {
                this.uiEditModeActions.disable();
                this.uiEditModeActions = null;
            }
        },

        getControllerName: function () {
            return "sap.ushell.renderers.fiori2.launchpad.dashboard.DashboardContent";
        }
    });
}());

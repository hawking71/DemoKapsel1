// Copyright (c) 2009-2014 SAP SE, All Rights Reserved

(function () {
    "use strict";
    /*global jQuery, $, sap, window */
    /*jslint nomen: true */

    sap.ui.controller("sap.ushell.renderers.fiori2.launchpad.catalog.Catalog", {
        oPopover: null,
        onInit: function () {
            sap.ui.getCore().getEventBus().subscribe("showCatalogEvent", this.onShow, this);
            sap.ui.getCore().byId("catalogSelect").addEventDelegate({
                onBeforeRendering : this.onBeforeSelectRendering
            }, this);
        },

        onExit: function () {
            sap.ui.getCore().getEventBus().unsubscribe("showCatalogEvent", this.onShow);
            this.getView().aDanglingControls.forEach(function (oControl) {
                oControl.destroy();
            });
        },

        onAfterRendering: function () {
            // disable swipe gestures -> never show master in Portait mode
            var oModel = sap.ui.getCore().byId("navContainer").getModel(),
                oTileContainer = sap.ui.getCore().byId("catalogTiles"),
                aCurrentCatalogs = oModel.getProperty('/catalogs'),
                that = this;
            //check if the catalogs were already loaded, if so, we don't need the loading message
            if (!aCurrentCatalogs.length) {

                //add the loading message right after the catalog is rendered
                oModel.setProperty('/catalogs', [{
                    title: sap.ushell.resources.i18n.getText('catalogsLoading'),
                    "static": true,
                    tiles: [],
                    numIntentSupportedTiles : -1//only in order to present this option in the Catalog.view (dropdown menu)since there is a filter there on this property
                }]);
                oTileContainer.setNoDataText(sap.ushell.resources.i18n.getText('loadingTiles'));

            } else if (aCurrentCatalogs[0].title != sap.ushell.resources.i18n.getText('catalogsLoading')) {
                oTileContainer.setNoDataText(sap.ushell.resources.i18n.getText('noFilteredItems'));
            }

            if (!this.PagingManager) {
                this.lastCatalogId = 0;
                jQuery.sap.require("sap.ushell.renderers.fiori2.launchpad.PagingManager");
                this.PagingManager = new sap.ushell.renderers.fiori2.launchpad.PagingManager('catalogPaging', {
                    elementClassName: 'sapUshellTile',
                    containerHeight: window.innerHeight,
                    containerWidth: window.innerWidth
                });
            }

            //just the first time
            if (this.PagingManager.currentPageIndex === 0) {
                that.allocateNextPage();
            }

            jQuery("#catalogTilesPage-cont").scroll(function () {
                var oPage = sap.ui.getCore().byId('catalogTilesPage'),
                    scroll = oPage.getScrollDelegate(),
                    currentPos = scroll.getScrollTop(),
                    max = scroll.getMaxScrollTop();

                if (max - currentPos <= 30 + that.PagingManager.getTileHeight()) {
                    that.allocateNextPage();
                }
            });
            jQuery(window).resize(function () {
                var windowWidth = $(window).width(),
                    windowHeight = $(window).height();

                that.PagingManager.setContainerSize(windowWidth, windowHeight);
                that.resetPageFilter();
                that.applyTileFilters();
            });
        },

        onShow: function (sChannelId, sEventId, oData) {
            //if the user goes to the catalog directly (not via the dashboard)
            //we must close the loading dialog
            var oLoadingDialog = sap.ui.getCore().byId('loadingDialog'),
                hashTag;

            oLoadingDialog.close();

            // reset active tiles
            var oModel = sap.ui.getCore().byId("navContainer").getModel(),
                aCatalogTiles = oModel.getProperty("/catalogTiles") || [],
                oDataParam = oData.params,
                i;
            $.extend(this.getView().getViewData(), oData);

            if (this.PagingManager) {
                this.resetPageFilter();
            }
            this.categoryFilter = (oDataParam && oDataParam.catalogSelector && oDataParam.catalogSelector.length && oDataParam.catalogSelector[0]) || null;
            this.searchFilter = (oDataParam && oDataParam.tileFilter && oDataParam.tileFilter.length && oDataParam.tileFilter[0]) || "";
            hashTag = (oDataParam && oDataParam.tagFilter && oDataParam.tagFilter.length && oDataParam.tagFilter[0]) || "";

            if (hashTag) {
                try {
                    this.tagFilter = JSON.parse(hashTag);
                } catch (e) {
                    this.tagFilter = [];
                }
            } else {
                this.tagFilter = [];
            }
            if (this.tagFilter) {
                oModel.setProperty("/selectedTags", this.tagFilter);
            }
            oModel.setProperty("/showCatalogHeaders", true);
            oModel.setProperty("/catalogSearchFilter", this.searchFilter);

            for (i = 0; i < aCatalogTiles.length; i = i + 1) {
                aCatalogTiles[i].active = false;
            }

            if (this.categoryFilter || this.searchFilter) {
                // selected category does not work with data binding
                // we need to rerender it manually and then set the selection
                // see function onBeforeSelectRendering
                sap.ui.getCore().byId("catalogSelect").rerender();
            } else {
                //display all
                sap.ui.getCore().byId("catalogSelect").setSelectedItemId("");
            }

            this.oRenderingFilter = new sap.ui.model.Filter('', 'EQ', 'a');
            this.oRenderingFilter.fnTest = function (val) {
                if (val.catalogIndex <= this.lastCatalogId) {
                    return true;
                }

                if (this.allocateTiles > 0) {
                    this.lastCatalogId = val.catalogIndex;
                    this.allocateTiles--;
                    return true;
                }

                return false;
            }.bind(this);

            if (this.PagingManager) {
                this.applyTileFilters();
            }
        },
        resetPageFilter : function () {
            this.lastCatalogId = 0;
            this.allocateTiles = this.PagingManager.getNumberOfAllocatedElements();
        },
        allocateNextPage : function () {
            if (!this.allocateTiles || this.allocateTiles === 0) {
                //calculate the number of tiles in the page.
                this.PagingManager.moveToNextPage();
                this.allocateTiles = this.PagingManager._calcElementsPerPage();
                this.applyTileFilters();
            }
        },

        onBeforeSelectRendering : function () {
            var oSelect = sap.ui.getCore().byId("catalogSelect"),
                aItems = jQuery.grep(oSelect.getItems(), jQuery.proxy(function (oItem) {
                    return oItem.getBindingContext().getObject().id === this.categoryFilter;
                }, this));

            if (!aItems.length) {
                aItems.push(oSelect.getItemAt(0));
            }

            if (aItems[0] && oSelect.getSelectedItemId() !== aItems[0].getId()) {
                window.setTimeout($.proxy(oSelect.setSelectedItem, oSelect, aItems[0].getId()), 500);
            }
        },

        setTagsFilter : function (aFilter) {
            sap.ushell.renderers.fiori2.Navigation.openCatalogByHash({
                categoryFilter : this.categoryFilter,
                searchFilter : this.searchFilter,
                tagFilter : aFilter
            }, false);
        },

        setCategoryFilter : function (aFilter) {
            sap.ushell.renderers.fiori2.Navigation.openCatalogByHash({
                categoryFilter : aFilter,
                searchFilter : this.searchFilter,
                tagFilter: JSON.stringify(this.tagFilter)
            }, false);
        },

        setSearchFilter : function (aFilter) {
            sap.ushell.renderers.fiori2.Navigation.openCatalogByHash({
                categoryFilter : this.categoryFilter,
                searchFilter : aFilter,
                tagFilter: JSON.stringify(this.tagFilter)
            }, false);
        },

        applyTileFilters : function () {
            var aFilters = [],
                otagFilter,
                oSearchFilter,
                oCategoryFilter,
                sCatalogTitle;
            if (this.tagFilter) {
                otagFilter = new sap.ui.model.Filter('tags', 'EQ', 'v');
                otagFilter.fnTest = function (oTags) {
                    var ind, filterByTag;
                    if (this.tagFilter.length === 0) {
                        return true;
                    }

                    for (ind = 0; ind < this.tagFilter.length; ind++) {
                        filterByTag = this.tagFilter[ind];
                        if (oTags.indexOf(filterByTag) === -1) {
                            return false;
                        }
                    }
                    return true;
                }.bind(this);

                aFilters.push(otagFilter);
            }

            if (this.searchFilter) {
                oSearchFilter = new sap.ui.model.Filter($.map(this.searchFilter.split(/[\s,]+/), function (v) {
                    return (v && new sap.ui.model.Filter("keywords", sap.ui.model.FilterOperator.Contains, v)) ||
                        (v && new sap.ui.model.Filter("title", sap.ui.model.FilterOperator.Contains, v)) || undefined;
                }), true);
                aFilters.push(oSearchFilter);
            }
            if (this.categoryFilter) {
                sCatalogTitle = this.getCatalogTitleById(this.categoryFilter);

                // Filtering the catalog tiles  according to catalog title (and not catalog ID)  
                oCategoryFilter = new sap.ui.model.Filter("catalog", sap.ui.model.FilterOperator.EQ, sCatalogTitle);
                aFilters.push(oCategoryFilter);
            }
            //Anyway we would like to filter out tiles which are not supported on current device
            aFilters.push(new sap.ui.model.Filter("isTileIntentSupported", sap.ui.model.FilterOperator.EQ, true));

            //Adding the page filter.
            if (this.oRenderingFilter) {
                aFilters.push(this.oRenderingFilter);
            }

            sap.ui.getCore().byId("catalogTiles").getBinding("tiles").filter(aFilters);
        },

        getCatalogTitleById : function (catalogId) {
            var catalogs = sap.ui.getCore().byId("shell").getModel().getProperty('/catalogs'),
                catalogTitle;

            $.each(catalogs, function (index, tempCatalog) {
                if (catalogId == tempCatalog.id) {
                    catalogTitle = tempCatalog.title;
                    return false;
                }
            });
            return catalogTitle;
        },

        onLiveFilter : function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");
            if (sQuery) {
                this.setSearchFilter(sQuery);
            } else {
                this.setSearchFilter();
            }
        },

        onTagsFilter : function (oEvent) {
            var selectedItem = oEvent.getParameters("selectedItem").changedItem,
                selected = oEvent.getParameter("selected"),
                selectedTagsList = [],
                selectedTag = selectedItem.getText();

            if (this.tagFilter) {
                selectedTagsList = this.tagFilter;
            }

            if (selected) {
                selectedTagsList.push(selectedTag);
            } else {
                selectedTagsList = selectedTagsList.filter(function (entry) {
                    return entry !== selectedTag;
                });
            }
            this.setTagsFilter(selectedTagsList.length > 0 ? JSON.stringify(selectedTagsList) : "");
        },

        onCategoryFilter : function (oEvent) {
            var oSource = oEvent.getParameter("selectedItem"),
                oSourceContext = oSource.getBindingContext(),
                oModel = oSourceContext.getModel();
            if (oModel.getProperty("static", oSourceContext)) { // show all categories
                oModel.setProperty("/showCatalogHeaders", true);
                this.setCategoryFilter();
                this.selectedCategory = undefined;
            } else { // filter to category
                oModel.setProperty("/showCatalogHeaders", false);
                this.setCategoryFilter(oSource.getBindingContext().getObject().id);
                this.selectedCategory = oSource.getId();
            }
        },

        onTileAfterRendering : function (oEvent) {
            var footItem = oEvent.getSource().getFootItems()[0];
            if (footItem !== undefined) {
                if (footItem.getIcon() === "sap-icon://add") {
                    footItem.addStyleClass("sapUshellCatalogPlusIcon");
                } else {
                    footItem.addStyleClass("sapUshellCatalogVIcon");
                }
            }
        },

        /**
         * Event handler triggered if tile should be added to the default group.
         *
         * @param {sap.ui.base.Event} oEvent
         *     the event object. It is expected that the binding context of the event source points to the tile to add.
         */
        onTileFooterClick : function (oEvent) {
            var oSource = oEvent.getSource(),
                oSourceContext = oSource.getBindingContext(),
                that = this,
                ourModel,
                oModel = sap.ui.getCore().byId("navContainer").getModel(),
                oOkBtn,
                oCancelBtn,
                placement,
                clickedObject = oEvent.oSource,
                clickedObjectDomRef = clickedObject.getDomRef(),
                popoverData = this.createPopoverData(oEvent),
                aUserGroupsFilters = [],
                oList = new sap.m.List({
                    mode : sap.m.ListMode.MultiSelect
                }),
                oListItemTemplate = new sap.m.DisplayListItem({
                    label : "{title}",
                    selected : "{selected}",
                    tooltip: "{title}",
                    type: sap.m.ListType.Active
                });
            
            this.popoverDataSectionHeight = 192;

            // In case the list item (representing a group) is clicked by the user - change the checkbox's state
            oListItemTemplate.attachPress(function (oEvent) {
                var clickedListItemId = oEvent.mParameters.id,
                    clickedListItem = sap.ui.getCore().byId(clickedListItemId);

                if (clickedListItem.isSelected()) {
                    clickedListItem.setSelected(false);
                } else {
                    clickedListItem.setSelected(true);
                }
            });

            aUserGroupsFilters.push(new sap.ui.model.Filter("isGroupLocked", sap.ui.model.FilterOperator.EQ, false));
            if (this.getView().getModel().getProperty('/enableHideGroups')) {
                aUserGroupsFilters.push(new sap.ui.model.Filter("isGroupVisible", sap.ui.model.FilterOperator.EQ, true));
            }
            oList.bindItems("/", oListItemTemplate, null, aUserGroupsFilters);
            ourModel = new sap.ui.model.json.JSONModel(popoverData.userGroupList);
            oList.setModel(ourModel);

            oList.addEventDelegate({
                onsapup: function (oEvent) {
                    try {
                        oEvent.preventDefault();

                        if (sap.ui.getCore().byId('shell').getModel().getData().groups.length) {
                            var currentFocusGroup = jQuery(":focus");
                            if (currentFocusGroup.index() == 0){   //first group in the list
                                var jqNewGroupItem = jQuery("#newGroupItem");
                                jqNewGroupItem.focus();
                                oEvent._bIsStopHandlers = true;
                            }
                        }
                    } catch (e) {
                    }
                }
            });

            var oCreateNewGroupControlResult = this._createNewGroupNameControl(oModel, that);
            this.oPopoverContainer = this._setPopoverContainer(oCreateNewGroupControlResult, oList, this.popoverDataSectionHeight);

            if (document.body.clientHeight - clickedObjectDomRef.getBoundingClientRect().bottom >= 310) {
                placement = "Bottom";
            } else {
                placement = "Auto";
            }

            that.oPopover = new sap.m.ResponsivePopover({
                id : "groupsPopover",
                placement : placement,
                content : [this.oPopoverContainer],
                enableScrolling : true,
                title: sap.ushell.resources.i18n.getText("addTileToGroups_popoverTitle"),
                contentWidth: '20rem',
                afterClose: function () {
                	oCreateNewGroupControlResult.destroy();
                    oOkBtn.destroy();
                    oCancelBtn.destroy();
                    that.oPopoverContainer.destroy();
                    that.oPopover.destroy();
                    that.oPopover = null;
                }
            });

            if (!sap.ui.Device.system.phone) {
                that.oPopover.setContentHeight(this.popoverDataSectionHeight + "px");
            } else {
                that.oPopover.setContentHeight("100%");
            }

            oOkBtn = this.createOkButton(oSourceContext, ourModel, popoverData, that, that.oPopover, oCreateNewGroupControlResult);
            oOkBtn.addEventDelegate({
                onsaptabprevious: function (oEvent) {
                    try {
                        oEvent.preventDefault();
                        oEvent._bIsStopHandlers = true;
                        var jqNewGroupItem = jQuery("#newGroupItem");
                        if (!jqNewGroupItem.length) {
                            jqNewGroupItem = jQuery("#newGroupNameInput input");
                        }
                        jqNewGroupItem.focus();
                    } catch (e) {
                    }
                }
            });

            oCancelBtn = new sap.m.Button({
                id : "cancelButton",
                press : function (oEvent) {
                    oEvent.preventDefault();
                    oEvent._bIsStopHandlers = true;
                    that.oPopover.close();
                },
                text : sap.ushell.resources.i18n.getText("cancelBtn")
            });

            that.oPopover.setBeginButton(oOkBtn);
            that.oPopover.setEndButton(oCancelBtn);
            that.oPopover.setInitialFocus('newGroupItem');
            that.oPopover.openBy(clickedObject);
        },

        _navigateToCreateNewGroupPanel : function (oPopover, oNewGroupNameInput, oHeadBar) {

            oPopover.removeAllContent();
            oPopover.addContent(oNewGroupNameInput.addStyleClass("catalogNewGroupInput"));
            oPopover.setCustomHeader(oHeadBar);
            oPopover.setContentHeight("");
            oNewGroupNameInput.setValueState(sap.ui.core.ValueState.None);
            oNewGroupNameInput.setPlaceholder(sap.ushell.resources.i18n.getText("new_group_name"));
            oNewGroupNameInput.enabled = true;
            setTimeout(function () {
                oNewGroupNameInput.focus();
            }, 0);
        },

        _createNewGroupNameControl : function (oModel, oCallerContext) {
            var result = {
                    created : false,
                    destroy : function () {
                        if (this.created == true) {
                            this.newGroupItemList.destroy();
                            this.newGroupNameInput.destroy();
                        }
                    }
                };

            if (this.getView().getModel().getProperty('/enableCreateGroupInCatalog') == true) {

                // new group Input
                var oNewGroupNameInput = new sap.m.Input({
                        id : "newGroupNameInput",
                        type : "Text",
                        placeholder : sap.ushell.resources.i18n.getText("new_group_name")
                    }),
                    oNewGroupItemList,
                    // new group panel - back button
                    oBackButton = new sap.m.Button({
                        icon: sap.ui.core.IconPool.getIconURI("nav-back"),
                        press : function (oEvent) {
                            oCallerContext.oPopover.removeAllContent();

                            if (!sap.ui.Device.system.phone) {
                                oCallerContext.oPopover.setContentHeight(oCallerContext.popoverDataSectionHeight + "px");
                            } else {
                                oCallerContext.oPopover.setContentHeight("100%");
                            }

                            oCallerContext.oPopover.setVerticalScrolling(true);
                            oCallerContext.oPopover.addContent(oCallerContext.oPopoverContainer);
                            oCallerContext.oPopover.setTitle(sap.ushell.resources.i18n.getText("addTileToGroups_popoverTitle"));
                            oCallerContext.oPopover.setCustomHeader();

                            oNewGroupNameInput.enabled = false;
                            oNewGroupNameInput.setValue('');
                        },
                        tooltip : sap.ushell.resources.i18n.getText("newGroupGoBackBtn_tooltip")
                    });

                oBackButton.addStyleClass("catalogNewGroupBackButton");
                oNewGroupItemList = new sap.m.List({});

                // new group panel's label
                var oNewGroupLabel = new sap.m.Label({
                        text : sap.ushell.resources.i18n.getText("newGroup_popoverTitle")
                    }),
                    // new group panel's header
                    oHeadBar = new sap.m.Bar({
                        contentLeft : [oBackButton],
                        contentMiddle : [oNewGroupLabel]
                    }),
                    // popover container Item - "New Group"
                    oNewGroupItem = new sap.m.StandardListItem({
                        id : "newGroupItem",
                        title : sap.ushell.resources.i18n.getText("newGroup_listItemText"),
                        type : "Navigation",
                        press : function () {
                            oCallerContext._navigateToCreateNewGroupPanel(oCallerContext.oPopover, oNewGroupNameInput, oHeadBar);
                        }
                    });

                // if xRay is enabled
                if (oModel.getProperty("/enableHelp")) {
                    oNewGroupItem.addStyleClass('help-id-newGroupItem');// xRay help ID
                }
                oNewGroupItemList.addItem(oNewGroupItem);
                oNewGroupItemList.addEventDelegate({
                    onsapdown: function (oEvent) {
                        try {
                            oEvent.preventDefault();
                            oEvent._bIsStopHandlers = true;
                            if (sap.ui.getCore().byId('shell').getModel().getData().groups.length) {
                                var jqFirstGroupListItem = jQuery("#popoverContainer .sapMListModeMultiSelect li").first();
                                jqFirstGroupListItem.focus();
                            }
                        } catch (e) {
                        }
                    },
                    onsaptabnext: function (oEvent) {
                        try {
                            oEvent.preventDefault();
                            oEvent._bIsStopHandlers = true;
                            var jqOkButton = jQuery("#okButton");
                            jqOkButton.focus();
                        } catch (e) {
                        }
                    }
                });
                result.created = true;
                result.newGroupItemList = oNewGroupItemList;
                result.newGroupNameInput = oNewGroupNameInput;
                result.newGroupItem = oNewGroupItem;
            }
            return result;
        },
        createOkButton : function (oSourceContext, ourModel, popoverData, generalContext, oPopover, oCreateNewGroupControlResult) {
            var oOkBtn = new sap.m.Button({
                id : "okButton",
                press : function (oEvent) {

                    oEvent.preventDefault();
                    oEvent._bIsStopHandlers = true;

                    var selectedGroupsIDsArray = [],
                        groupsIdTitleMap = {},
                        srvc = sap.ushell.Container.getService("LaunchPage"),
                        detailedMessage,
                        index,
                        tempGroup,
                        groupCtx,
                        realGroupID,
                        numberOfAddedGroups = 0,
                        numberOfRemovedGroups = 0,
                        firstAddedGroupTitle,
                        firstRemovedGroupTitle,
                        tileCataogId = oSourceContext.getModel().getProperty(oSourceContext.getPath()).id,
                        newGroupName,
                        groupNameFromInput,
                        emptyGroupName = sap.ushell.resources.i18n.getText("new_group_name"),
                        promises = [],
                        that = this;

                    for (index = 0; index < popoverData.userGroupList.length; index = index + 1) {
                        tempGroup = this.oData[index];
                        realGroupID = srvc.getGroupId(tempGroup.object);

                        // Add the real group Id and title to the map
                        // in order to support the detailed message that follows the user gourp selection
                        groupsIdTitleMap[realGroupID] = tempGroup.title;

                        if (tempGroup.selected) {
                            selectedGroupsIDsArray.push(realGroupID);
                            //var groupIndex = dashboardMgr.getIndexOfGroup();
                            groupCtx = new sap.ui.model.Context(oSourceContext.getModel(), "/groups/" + index);
                            if (!ourModel.oData[index].initiallySelected) {
                                promises.push(generalContext._addTile(oSourceContext, groupCtx));
                                ourModel.oData[index].initiallySelected = true;
                                numberOfAddedGroups = numberOfAddedGroups + 1;
                                if (numberOfAddedGroups == 1) {
                                    firstAddedGroupTitle = tempGroup.title;
                                }
                            }
                        } else if ( (!tempGroup.selected) && (ourModel.oData[index].initiallySelected) ) {
                            promises.push(generalContext._removeTile(tileCataogId, index));
                            ourModel.oData[index].initiallySelected = false;
                            numberOfRemovedGroups = numberOfRemovedGroups + 1;
                            if (numberOfRemovedGroups == 1) {
                                firstRemovedGroupTitle = tempGroup.title;
                            }
                        }
                    }

                    if (oCreateNewGroupControlResult.created == true) {
                        groupNameFromInput = oCreateNewGroupControlResult.newGroupNameInput.getValue().trim();
                        // we are in the new group creation panel
                        if (oCreateNewGroupControlResult.newGroupNameInput.enabled) {
                            if (groupNameFromInput.length > 0) {
                                newGroupName = groupNameFromInput;
                            } else {
                                newGroupName = emptyGroupName;
                            }

                            promises.push(generalContext._createGroupAndSaveTile(oSourceContext, newGroupName));
                            numberOfAddedGroups++;
                            firstAddedGroupTitle = newGroupName;
                        }
                    }
                    jQuery.when.apply(jQuery, promises).then(
                        function(){
                            if (!(numberOfAddedGroups == 0 && numberOfRemovedGroups == 0)) {

                                var isOperationFailed = false,
                                    isNewGroupAdded = false,
                                    aErrorIndexes = [];

                                for (index = 0; index < arguments.length && (!isOperationFailed || !isNewGroupAdded); index++) {
                                    // check if tile was added to the new group successfully
                                    if (arguments[index].action == "addTileToNewGroup" && arguments[index].status == 1){
                                        var tempGroup = that.oData[that.oData.length - 1],
                                            srvc = sap.ushell.Container.getService("LaunchPage"),
                                            realGroupID = srvc.getGroupId(tempGroup.object);
                                        selectedGroupsIDsArray.push(realGroupID);
                                        isNewGroupAdded = true;
                                    }
                                    // Check if the operation failed
                                    //  The Data (i.e. arguments[index]) for each operation includes:
                                    //   - group: The relevant group object
                                    //   - status: A boolean value stating if the operation succeeded of failed
                                    //   - action: A String with the value 'add' or 'remove' or 'createNewGroup'
                                    if ( !arguments[index].status ) {
                                        isOperationFailed = true;
                                        aErrorIndexes.push(arguments[index]);
                                    }
                                }
                                if (isOperationFailed){
                                    var shellView = sap.ui.getCore().byId("mainShell"),
                                        oErrorMessageObj = generalContext.prepareErrorMessage(aErrorIndexes, popoverData.tileTitle),
                                        dashboardMgr = shellView.oDashboardManager;
                                    dashboardMgr._resetGroupsOnFailure(oErrorMessageObj.messageId, oErrorMessageObj.parameters);

                                } else {
                                    // Update the model with the changes
                                    oSourceContext.getModel().setProperty("/catalogTiles/" + popoverData.tileIndex + "/associatedGroups", selectedGroupsIDsArray);

                                    // Get the detailed message
                                    detailedMessage = generalContext.prepareDetailedMessage(popoverData.tileTitle, numberOfAddedGroups, numberOfRemovedGroups, firstAddedGroupTitle, firstRemovedGroupTitle);

                                    sap.m.MessageToast.show( detailedMessage, {
                                        duration: 3000,// default
                                        width: "15em",
                                        my: "center bottom",
                                        at: "center bottom",
                                        of: window,
                                        offset: "0 -50",
                                        collision: "fit fit"
                                    });
                                }
                            }
                        });


                    oPopover.close();

                }.bind(ourModel),
                text : sap.ushell.resources.i18n.getText("okBtn")
            });
            return oOkBtn;
        },

        prepareErrorMessage : function (aErroneousActions, sTileTitle) {
            var oGroup,
                sAction,
                sFirstErroneousAddGroup,
                sFirstErroneousRemoveGroup,
                iNumberOfFailAddActions = 0,
                iNumberOfFailDeleteActions = 0,
                bCreateNewGroupFailed = false,
                message;

            for (var index in aErroneousActions) {

                // Get the data of the error (i.e. action name and group object)

                oGroup = aErroneousActions[index].group;
                sAction = aErroneousActions[index].action;

                if (sAction == 'add') {
                    iNumberOfFailAddActions++;
                    if (iNumberOfFailAddActions == 1) {
                        sFirstErroneousAddGroup = oGroup.title;
                    }
                } else if (sAction == 'remove') {
                    iNumberOfFailDeleteActions++;
                    if (iNumberOfFailDeleteActions == 1) {
                        sFirstErroneousRemoveGroup = oGroup.title;
                    }
                } else if (sAction == 'addTileToNewGroup') {
                    iNumberOfFailAddActions++;
                    if (iNumberOfFailAddActions == 1) {
                        sFirstErroneousAddGroup = oGroup.title;
                    }
                } else {
                    bCreateNewGroupFailed = true;
                }
            }
            // First - Handle bCreateNewGroupFailed
            if (bCreateNewGroupFailed) {
                if (aErroneousActions.length == 1) {
                    message = sap.ushell.resources.i18n.getText({messageId: "fail_tile_operation_create_new_group"});
                } else {
                    message = sap.ushell.resources.i18n.getText({messageId: "fail_tile_operation_some_actions"});
                }
                // Single error - it can be either one add action or one remove action
            } else if (aErroneousActions.length == 1) {
                if (iNumberOfFailAddActions) {
                    message = sap.ushell.resources.i18n.getText({messageId: "fail_tile_operation_add_to_group", parameters: [sTileTitle, sFirstErroneousAddGroup]});
                } else {
                    message = sap.ushell.resources.i18n.getText({messageId: "fail_tile_operation_remove_from_group", parameters: [sTileTitle, sFirstErroneousRemoveGroup]});
                }
                // 	Many errors (iErrorCount > 1) - it can be several remove actions, or several add actions, or a mix of both
            } else {
                if (iNumberOfFailDeleteActions == 0) {
                    message = sap.ushell.resources.i18n.getText({messageId: "fail_tile_operation_add_to_several_groups", parameters: [sTileTitle]});
                } else if (iNumberOfFailAddActions == 0) {
                    message = sap.ushell.resources.i18n.getText({messageId: "fail_tile_operation_remove_from_several_groups", parameters: [sTileTitle]});
                } else {
                    message = sap.ushell.resources.i18n.getText({messageId: "fail_tile_operation_some_actions"});
                }
            }
            return message;
        },

        prepareDetailedMessage : function (tileTitle, numberOfAddedGroups, numberOfRemovedGroups, firstAddedGroupTitle, firstRemovedGroupTitle) {
            var message;

            if (numberOfAddedGroups == 0) {
                if (numberOfRemovedGroups == 1) {
                    message = sap.ushell.resources.i18n.getText("tileRemovedFromSingleGroup", [tileTitle, firstRemovedGroupTitle]);
                } else if (numberOfRemovedGroups > 1) {
                    message = sap.ushell.resources.i18n.getText("tileRemovedFromSeveralGroups", [tileTitle, numberOfRemovedGroups]);
                }
            } else if (numberOfAddedGroups == 1) {
                if (numberOfRemovedGroups == 0) {
                    message = sap.ushell.resources.i18n.getText("tileAddedToSingleGroup", [tileTitle, firstAddedGroupTitle]);
                } else if (numberOfRemovedGroups == 1) {
                    message = sap.ushell.resources.i18n.getText("tileAddedToSingleGroupAndRemovedFromSingleGroup", [tileTitle, firstAddedGroupTitle, firstRemovedGroupTitle]);
                } else if (numberOfRemovedGroups > 1) {
                    message = sap.ushell.resources.i18n.getText("tileAddedToSingleGroupAndRemovedFromSeveralGroups", [tileTitle, firstAddedGroupTitle, numberOfRemovedGroups]);
                }
            } else if (numberOfAddedGroups > 1) {
                if (numberOfRemovedGroups == 0) {
                    message = sap.ushell.resources.i18n.getText("tileAddedToSeveralGroups", [tileTitle, numberOfAddedGroups]);
                } else if (numberOfRemovedGroups == 1) {
                    message = sap.ushell.resources.i18n.getText("tileAddedToSeveralGroupsAndRemovedFromSingleGroup", [tileTitle, numberOfAddedGroups, firstRemovedGroupTitle]);
                } else if (numberOfRemovedGroups > 1) {
                    message = sap.ushell.resources.i18n.getText("tileAddedToSeveralGroupsAndRemovedFromSeveralGroups", [tileTitle, numberOfAddedGroups, numberOfRemovedGroups]);
                }
            }
            return message;
        },

        /**
         * Returns an object that contains:
         *  - An array of user groups, each one contains a "selected" property
         *  - An array ID's of the groups that contain the relevant Tile
         *
         * @param {sap.ui.base.Event} oEvent
         */
        createPopoverData : function (oEvent) {
            var oSource = oEvent.getSource(),
                oSourceContext = oSource.getBindingContext(),
                srvc = sap.ushell.Container.getService("LaunchPage"),
                index,
                model,
                path,
                tileTitle,
                realGroupID,

            // The popover basically contains an entry for each user group
                userGroupList = oSourceContext.getModel().getProperty("/groups"),

            // the relevant Catalog Tile form the model: e.g. /catalogTiles/5
                catalogTile = this.getCatalogTileDataFromModel(oSourceContext),

            // e.g. /catalogTiles/5/associatedGroups
                tileGroups = catalogTile.tileData.associatedGroups,

            // g.e. 5
                tileIndex = catalogTile.tileIndex;

            // In order to decide which groups (in the popover) will be initially selected:
            for (index = 0; index < userGroupList.length; index = index + 1) {

                // Get the group's real ID
                realGroupID = srvc.getGroupId(userGroupList[index].object);

                // Check if the group (i.e. real group ID) exists in the array of groups that contain the relevant Tile
                // if so - the check box that re[resents this group should be initially selected
                userGroupList[index].selected = !($.inArray(realGroupID, tileGroups) == -1);

                // In order to know if the group was selected before user action
                userGroupList[index].initiallySelected = userGroupList[index].selected;
            }
            path = oSourceContext.getPath(0);
            model = oSourceContext.getModel();
            tileTitle = model.getProperty(path).title;

            return {userGroupList : userGroupList, catalogTile : catalogTile, tileTitle : tileTitle, tileIndex : tileIndex};
        },

        /**
         * Returns the part of the model that contains the IDs of the groups that contain the relevant Tile
         *
         * @param {} oSourceContext
         *     model context
         */
        getCatalogTileDataFromModel : function (oSourceContext) {
            var tilePath = oSourceContext.sPath,
                tilePathPartsArray = tilePath.split("/"),
                tileIndex = tilePathPartsArray[tilePathPartsArray.length - 1];

            // Return an object containing the Tile in the CatalogTiles Array (in the model) and its index
            return {tileData : oSourceContext.getModel().getProperty("/catalogTiles/" + tileIndex), tileIndex : tileIndex};
        },

        /**
         * Event handler triggered if tile should be added to a specified group.
         *
         * @param {sap.ui.base.Event} oEvent
         *     the event object. It is expected that the binding context of the event source points to the group. Also,
         *     the event must contain a "control" parameter whose binding context points to the tile.
         */
        onAddTile : function (oEvent) {
            var oSourceContext = oEvent.getParameter("control").getBindingContext();
            if (!oSourceContext.getProperty("active")) {
                this._addTile(oSourceContext, oEvent.getSource().getBindingContext());
            }
        },

        onNavButtonPress : function (oEvent) {
            var oNavContainer = sap.ui.getCore().byId("navContainer");
            if (location.hash === '' || location.hash === '#') {
                oNavContainer.to("dashboardPage");
            } else {
                location.hash = '';
            }
        },

        /**
         * Send request to add a tile to a group. Request is triggered asynchronously, so UI is not blocked.
         *
         * @param {sap.ui.model.Context} oTileContext
         *     the catalog tile to add
         * @param {sap.ui.model.Context} oGroupContext
         *     the group where the tile should be added
         * @private
         */
        _addTile : function (oTileContext, oGroupContext) {
            var shellView = sap.ui.getCore().byId("mainShell"),
                dashboardMgr = shellView.oDashboardManager,
                deferred = jQuery.Deferred(),
                promise = dashboardMgr._createTile({
                    catalogTileContext : oTileContext,
                    groupContext: oGroupContext
                });

            promise.done(function(data){
                deferred.resolve(data);
            });

            return deferred;
        },

        /**
         * Send request to delete a tile from a group. Request is triggered asynchronously, so UI is not blocked.
         *
         * @param tileCatalogId
         *     the id of the tile
         * @param index
         *     the index of the group in the model
         * @private
         */
        _removeTile : function (tileCatalogId, index) {
            var shellView = sap.ui.getCore().byId("mainShell"),
                dashboardMgr = shellView.oDashboardManager,
                deferred = jQuery.Deferred(),
                promise = dashboardMgr._deleteCatalogTileFromGroup({
                    tileId : tileCatalogId,
                    groupIndex : index
                });

            // The function _deleteCatalogTileFromGroup always results in deferred.resolve
            // and the actual result of the action (success/failure) is contained in the data object
            promise.done(function(data){
                deferred.resolve(data);
            });

            return deferred;
        },

        /**
         * Send request to create a new group and add a tile to this group. Request is triggered asynchronously, so UI is not blocked.
         *
         * @param {sap.ui.model.Context} oTileContext
         *     the catalog tile to add
         * @param newGroupName
         *     the name of the new group where the tile should be added
         * @private
         */
        _createGroupAndSaveTile : function (oTileContext, newGroupName) {
            var shellView = sap.ui.getCore().byId("mainShell"),
                dashboardMgr = shellView.oDashboardManager,
                deferred = jQuery.Deferred(),
                promise = dashboardMgr._createGroupAndSaveTile({
                    catalogTileContext : oTileContext,
                    newGroupName: newGroupName
                });

            promise.done(function(data){
                deferred.resolve(data);
            });

            return deferred;
        },

        _setPopoverContainer : function (oCreateNewGroupControlResult, oList, iPopoverDataSectionHeight) {
            var sPopoverContainerId = "popoverContainer",
                oPopoverContainer = new sap.m.ScrollContainer({
                    id: sPopoverContainerId,
                    horizontal : false,
                    vertical : true
                });

            if (!sap.ui.Device.system.phone) {
                oPopoverContainer.setHeight((iPopoverDataSectionHeight - 2) + "px");
            } else {
                oPopoverContainer.setHeight("100%");
            }

            if (oCreateNewGroupControlResult.created == true) {
                oPopoverContainer.addContent(oCreateNewGroupControlResult.newGroupItemList );
            }
            oPopoverContainer.addContent(oList);

            return oPopoverContainer;
        }
    });
}());

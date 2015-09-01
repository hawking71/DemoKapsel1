// Copyright (c) 2009-2014 SAP SE, All Rights Reserved

(function () {
    "use strict";
    /*global jQuery, sap, setTimeout, clearTimeout */
    /*jslint plusplus: true, nomen: true */
    jQuery.sap.require("sap.ushell.ui.launchpad.TileContainer");

    sap.ui.controller("sap.ushell.renderers.fiori2.launchpad.dashboard.DashboardContent", {

        onInit : function () {
            var oEventBus = sap.ui.getCore().getEventBus();
            oEventBus.subscribe('launchpad', 'actionModeInactive', this._handleExitActionMode, this);
            oEventBus.subscribe('launchpad', 'actionModeActive', this._enableGroupsUIActions, this.oView);

            this.sViewId = "#" + this.oView.getId();
            //On Android 4.x, and Safari mobile in Chrome and Safari browsers sometimes we can see bug with screen rendering
            //so _webkitMobileRenderFix function meant to fix it after  `contentRefresh` event.
            if (sap.ui.Device.browser.mobile) {
                oEventBus.subscribe("launchpad", "contentRefresh", this._webkitMobileRenderFix, this);
            }
            this.isDesktop = (sap.ui.Device.system.desktop && (navigator.userAgent.toLowerCase().indexOf('tablet') < 0));
        },

        onExit: function () {
            sap.ui.getCore().getEventBus().unsubscribe("launchpad", "contentRefresh", this._webkitMobileRenderFix, this);
        },

        onAfterRendering : function () {
            var oEventBus = sap.ui.getCore().getEventBus();

            //Bind launchpad event handlers
            oEventBus.unsubscribe("launchpad", "scrollToGroup", this._scrollToGroup, this);
            oEventBus.subscribe("launchpad", "scrollToGroup", this._scrollToGroup, this);
            oEventBus.unsubscribe("launchpad", "scrollToFirstVisibleGroup", this._scrollToFirstVisibleGroup, this);
            oEventBus.subscribe("launchpad", "scrollToFirstVisibleGroup", this._scrollToFirstVisibleGroup, this);


            //Temporary workaround for Android Chrome rendering problem, after group has been renamed.
            if (sap.ui.Device.os.android) {
                oEventBus.unsubscribe("launchpad", "changeGroupTitle", this._changeGroupTitleHandler, this);
                oEventBus.subscribe("launchpad", "changeGroupTitle", this._changeGroupTitleHandler, this);
            }

            // The delete area is moved out of the scrollable area
            jQuery("#__area0").appendTo("#shellPage");
            var timer;
            jQuery(window).bind("resize", function () {
                clearTimeout(timer);
                timer = setTimeout(this._resizeHandler.bind(this), 300);
            }.bind(this));

            // Register scroll event handler
            jQuery("#dashboard").scroll(sap.ushell.utils.handleTilesVisibility);
        },

        //Change Group Title Handler for temporary workaround for Android Chrome rendering problem, after group has been renamed.
        _changeGroupTitleHandler: function () {
            this._forceBrowserRerenderElement(document.getElementById('groupList'));
        },

        _handleClick : function () {
            //Enable text selection in other scenarios than drag-and-drop
            if (sap.ui.Device.system.desktop) {
                jQuery('body').removeClass("sapUshellDisableUserSelect");
            }

        },
        _handleActionModeStartDrag : function (evt, ui) {
            this.uiActions.disable();
            var titleHeight = jQuery(".sapUshellDashboardGroupsContainerItem-clone .sapUshellContainerTitle").height();

            if (!sap.ui.Device.system.phone) {
                var titleWidth = jQuery(".sapUshellDashboardGroupsContainerItem-clone .sapUshellContainerTitle").width();

                jQuery(".sapUshellDashboardGroupsContainerItem.sapUshellDashboardGroupsContainerItem-clone .tileContainerEditMode").offset({
                    top: this.uiEditModeActions.startY - titleHeight,
                    left: this.uiEditModeActions.startX - (titleWidth / 2) - 16
                });
                jQuery(".sapUshellTileContainerBeforeContent").addClass("sapUshellTileContainerHidden");
                jQuery(".sapUshellDashboardGroupsContainerItem.sapUshellDashboardGroupsContainerItem-clone .sapUshellContainerTitle").css("width", titleWidth + "px");
            } else {
                jQuery(".sapUshellTilesContainer-sortable").addClass("sapUshellTileContainerRemoveContent");
                jQuery(".sapUshellTileContainerBeforeContent").addClass("sapUshellTileContainerRemoveContent");
                jQuery(".sapUshellContainerHeaderActions").addClass("sapUshellTileContainerHidden");
            }

            jQuery(ui).find(".sapUshellContainerHeaderActions").addClass("sapUshellTileContainerHidden");

            sap.ui.getCore().byId("shell").getModel().setProperty('/isInDrag', true);
            jQuery(ui).attr('startPos', jQuery(ui).index());

            window.console.log('startPos - ' + jQuery(ui).index());
            setTimeout(function () {
                sap.ui.getCore().getEventBus().publish("launchpad", "sortableStart");
            }, 0);

            //scroll to group
            var groupsTop = jQuery("#dashboardGroups").offset().top,
                groupPlaceholder = jQuery(".sapUshellDashboardGroupsContainerItem-placeholder").offset().top,
                groupClone = jQuery(".sapUshellDashboardGroupsContainerItem-clone").offset().top,
                scrollY = groupPlaceholder - groupsTop - groupClone;
            jQuery('#dashboard').animate({scrollTop : scrollY}, 0);

        },

        _handleActionModeUIStart : function (evt, ui) {
            jQuery(ui).find(".sapUshellTileContainerContent").css("outline-color", "transparent");
            jQuery('body').addClass("sapUshellDisableUserSelect");
        },

        _handleActionModeDrop : function (evt, ui) {
            if (sap.ui.Device.system.desktop) {
                jQuery('body').removeClass("sapUshellDisableUserSelect");
            }

            var oBus = sap.ui.getCore().getEventBus(),
                jQueryObj = jQuery(ui),
                firstChildId = jQuery(jQueryObj.children()[0]).attr("id"),
                oGroup = sap.ui.getCore().byId(firstChildId),
                oDashboardGroups = sap.ui.getCore().byId("dashboardGroups"),
                oData = {group : oGroup, groupChanged : false, focus : false},
                nNewIndex = jQueryObj.index();

            jQueryObj.startPos = window.parseInt(jQueryObj.attr('startPos'), 10);
            oDashboardGroups.removeAggregation('groups', oGroup, true);
            oDashboardGroups.insertAggregation('groups', oGroup, nNewIndex, true);

            this.oController._handleActionModeGroupMove(evt, {item : jQueryObj});
            jQueryObj.removeAttr('startPos');
            sap.ui.getCore().getEventBus().publish("launchpad", "sortableStop");

            // avoid tile to be clicked after group was dropped
            setTimeout(function () {
                jQuery(".sapUshellContainerHeaderActions").removeClass("sapUshellTileContainerHidden");
                jQuery(".sapUshellTileContainerBeforeContent").removeClass("sapUshellTileContainerHidden");
                jQuery(".sapUshellTileContainerBeforeContent").removeClass("sapUshellTileContainerRemoveContent");
                jQuery(".sapUshellTilesContainer-sortable").removeClass("sapUshellTileContainerRemoveContent");
            }, 0);

            window.setTimeout(jQuery.proxy(oBus.publish, oBus, "launchpad", "scrollToGroup", oData), 1);
            this.uiActions.enable();
        },

        _handleActionModeGroupMove : function (evt, ui) {
            var fromIndex = ui.item.startPos,
                toIndex = ui.item.index();

            if (toIndex !== -1) {
                this._publishAsync("launchpad", "moveGroup", {
                    fromIndex  : fromIndex,
                    toIndex    : toIndex
                });
                setTimeout(function () { sap.ui.getCore().byId("shell").getModel().setProperty('/isInDrag', false); }, 100);
            }
        },

        //Delete or Reset a given group according to the removable state.
        _handleGroupDeletion: function (oGroupBindingCtx) {
            jQuery.sap.require('sap.m.MessageBox');
            var oEventBus = sap.ui.getCore().getEventBus(),
                oGroup = oGroupBindingCtx.getObject(),
                bIsGroupRemovable = oGroup.removable,
                sGroupTitle = oGroup.title,
                sGroupId = oGroup.groupId,
                oResourceBundle = sap.ushell.resources.i18n,
                oMessageSrvc = sap.ushell.Container.getService("Message"),
                mActions = sap.m.MessageBox.Action,
                mCurrentAction = (bIsGroupRemovable ? mActions.DELETE : oResourceBundle.getText('ResetGroupBtn'));

            oMessageSrvc.confirm(oResourceBundle.getText(bIsGroupRemovable ? 'delete_group_msg' : 'reset_group_msg', sGroupTitle), function (oAction) {
                if (oAction === mCurrentAction) {
                    oEventBus.publish("launchpad", bIsGroupRemovable ? 'deleteGroup' : 'resetGroup', {
                        groupId: sGroupId
                    });
                }
            }, oResourceBundle.getText(bIsGroupRemovable ? 'delete_group' : 'reset_group'), [mCurrentAction, mActions.CANCEL]);
        },
        _enableGroupsUIActions: function () {
            this.uiEditModeActions.enable();

        },

        _handleExitActionMode: function (ctx) {
            this.oView.uiEditModeActions.disable();
        },

        //force browser to repaint Body, by setting it `display` property to 'none' and to 'block' again
        _forceBrowserRerenderElement: function (element) {
            var animationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
            if (animationFrame) {
                animationFrame(function () {
                    var display = element.style.display;
                    element.style.display = 'none';
                    element.offsetHeight;
                    element.style.display = display;
                });
            } else {
                window.console.log('unsupported browser for animation frame');
            }
        },

        //function fixes Android 4.x Chrome, and Safari bug with poor rendering
        _webkitMobileRenderFix: function () {
            //force Chrome to repaint Body, by setting it `display` property to 'none' and to 'block' again
            if (sap.ui.Device.browser.chrome || sap.ui.Device.os.android) {
                // this includes almost all browsers and devices
                // if this is the IOS6 (as the previous fix causes double flickering
                // and this one only one flickering)
                this._forceBrowserRerenderElement(document.body);
            }
        },

        _resizeHandler : function () {
            var sCurrentState = this.getView().getModel().getProperty("/currentState");
            this._addBottomSpace();
            sap.ushell.utils.handleTilesVisibility();
            //Layout calculation is relevant only when the dashboard is presented
            if (sap.ushell.Layout && sCurrentState.stateName === "home") {
                sap.ushell.Layout.reRenderGroupsLayout(null, true);
            }
        },

        _addBottomSpace : function () {
            sap.ushell.utils.addBottomSpace();
        },

        _scrollToFirstVisibleGroup : function (sChannelId, sEventId, oData) {
            var sGroupId,
                fromTop = 0,
                that = this;

            if (oData.group) {
                sGroupId = oData.group.getGroupId();
            } else {
                // in case of scroll after deletion, the oData contains only the groupId.
                sGroupId = oData.groupId;
            }

            if (oData.fromTop) {
                fromTop = oData.fromTop - 50;
            }

            jQuery.each(this.oView.oDashboardGroupsBox.getGroups(), function (nIndex, oGroup) {
                if (oGroup.getGroupId() === sGroupId) {
                    var iY;

                    iY =  -1 * (document.getElementById('dashboardGroups').getBoundingClientRect().top) + document.getElementById(oGroup.sId).getBoundingClientRect().top;
                    jQuery('#dashboard').animate({scrollTop : iY - fromTop}, 0, that.fHandleScrollEnd);

                    //on press event we need to set the group in focus
                    if (oData.group && oData.focus) {
                        jQuery.sap.byId(oGroup.sId).focus();
                    }

                    return false;
                }
            });
            sap.ushell.utils.addBottomSpace();
        },

        _scrollToGroup : function (sChannelId, sEventId, oData) {

            var sGroupId,
                that = this;

            if (oData.group) {
                sGroupId = oData.group.getGroupId();
            } else {
                // in case of scroll after deletion, the oData contains only the groupId.
                sGroupId = oData.groupId;
            }

            jQuery.each(this.oView.oDashboardGroupsBox.getGroups(), function (nIndex, oGroup) {
                if (oGroup.getGroupId() === sGroupId) {
                    var iY;

                    iY =  -1 * (document.getElementById('dashboardGroups').getBoundingClientRect().top) + document.getElementById(oGroup.sId).getBoundingClientRect().top;
                    jQuery('#dashboard').animate({scrollTop : iY}, 500, that.fHandleScrollEnd);

                    //on press event we need to set the group in focus
                    if (oData.group && oData.focus) {
                        jQuery.sap.byId(oGroup.sId).focus();
                    //    jQuery.sap.byId(oGroup.sId).addClass('sapUshellSelected');
                    }
                    //fix bottom space, if this a deletion scenario the 'oData.groupId' will return true
                    if (oData.groupId || oData.groupChanged) {
                        that._addBottomSpace();
                    }

                    jQuery('#groupList li')
                        .removeClass('sapUshellSelected')
                        .eq(nIndex).addClass('sapUshellSelected');

                    // Call Tiles visibility scrolling handler
                    //TODO should be triggered by Scroll event - consider removing it
                    sap.ushell.utils.handleTilesVisibility();

                    return false;
                }
            });
        },

        fHandleScrollEnd : function () {

            //Notify groupList
            var oEventBus = sap.ui.getCore().getEventBus();
            oEventBus.publish("grouplist", "ScrollAnimationEnd");
        },

        /**
         *
         * @param event
         * @param ui : tile DOM Reference
         * @private
         */
        _handleDrop : function (event, ui) {
            //remove the disable-user-select class from body in case of desktop
            if (sap.ui.Device.system.desktop) {
                jQuery('body').removeClass("sapUshellDisableUserSelect");
            }
            var tileMoveInfo = sap.ushell.Layout.getLayoutEngine().layoutEndCallback();
            var oEventBus = sap.ui.getCore().getEventBus();

            if (!tileMoveInfo.tileMovedFlag) {
                return; //tile was not moved
            }
            var noRefreshSrc = true, noRefreshDst = true; //Default - suppress re-rendering after drop
            //if src and destination groups differ - refresh src and dest groups
            //else if a tile has moved & dropped in a different position in the same group - only dest should refresh (dest == src)
            //if a tile was picked and dropped - but never moved - the previous if would have returned
            if ((tileMoveInfo.srcGroup !== tileMoveInfo.dstGroup)) {
                noRefreshSrc = noRefreshDst = false;
            } else if (tileMoveInfo.tile !== tileMoveInfo.dstGroup.getTiles()[tileMoveInfo.dstTileIndex]) {
                noRefreshDst = false;
            }
            tileMoveInfo.srcGroup.removeAggregation('tiles', tileMoveInfo.tile, noRefreshSrc);
            tileMoveInfo.dstGroup.insertAggregation('tiles', tileMoveInfo.tile, tileMoveInfo.dstTileIndex, noRefreshDst);

            oEventBus.publish("launchpad", "moveTile", {
                sTileId: tileMoveInfo.tile.getUuid(),
                toGroupId:  tileMoveInfo.dstGroup.getGroupId(),
                toIndex: tileMoveInfo.dstTileIndex
            });

            oEventBus.publish("launchpad", "sortableStop");
        },

        _publishAsync : function (sChannelId, sEventId, oData) {
            var oBus = sap.ui.getCore().getEventBus();
            window.setTimeout(jQuery.proxy(oBus.publish, oBus, sChannelId, sEventId, oData), 1);
        }
    });
}());

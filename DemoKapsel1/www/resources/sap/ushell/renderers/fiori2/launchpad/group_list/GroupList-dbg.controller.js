// Copyright (c) 2009-2014 SAP SE, All Rights Reserved

(function () {
    "use strict";
    /*global jQuery, sap, console, window, $ */
    /*jslint plusplus: true, nomen: true*/

    sap.ui.controller("sap.ushell.renderers.fiori2.launchpad.group_list.GroupList", {
        onInit : function () {
            this.sViewId = "#" + this.getView().getId();
            this.sGroupListId = "#" + this.getView().oGroupList.getId();
            this.handleScroll = this._fHandleScroll.bind(this);
        },
        onAfterRendering : function () {
            this.jqView = jQuery(this.sViewId);
            this.jgGroupList = jQuery(this.sGroupListId);

            var oEventBus = sap.ui.getCore().getEventBus();
            oEventBus.unsubscribe("grouplist", "ScrollAnimationEnd", this._handleScrollAnimationEnd, this);
            oEventBus.subscribe("grouplist", "ScrollAnimationEnd", this._handleScrollAnimationEnd, this);
            oEventBus.unsubscribe("grouplist", "DashboardRerender", this._addScroll, this);
            oEventBus.subscribe("grouplist", "DashboardRerender", this._addScroll, this);

            this._addScroll();
        },

        _addScroll : function () {
            var that = this;

            //setTimeout is required because for some reason the event handler is not called when 'scroll' event is fired
            setTimeout(function () {
                this.dashboardElement = document.getElementById('dashboard');
                if (this.dashboardElement) {
                    this.dashboardElement.removeEventListener('scroll', that.handleScroll);
                    this.dashboardElement.addEventListener('scroll', that.handleScroll);
                }
            }.bind(this), 0);
        },

        _fHandleScroll : function () {
            var jqContainer = jQuery('#dashboardGroups').find('.sapUshellTileContainer'),
                oOffset = jqContainer.not('.sapUshellHidden').first().offset(),
                firstContainerOffset = (oOffset && oOffset.top) || 0,
                contentTop = [],
                oModel = this.getView().getModel(),
                nScrollTop = 0;

            if (document.getElementById('dashboard')) {
                nScrollTop = document.getElementById('dashboard').scrollTop;
            }
            // In some weird corner cases, those may not be defined -> bail out.
            if (!jqContainer || !oOffset) {
                return;
            }

            jqContainer.each(function () {
                if (!jQuery(this).hasClass("sapUshellHidden")) {
                    var nContainerTopPos = jQuery(this).parent().offset().top;
                    contentTop.push([nContainerTopPos, nContainerTopPos + jQuery(this).parent().height()]);
                }
            });

            if (!oModel.getProperty("/groupList-skipScrollToGroup")) {
                var winTop = nScrollTop + firstContainerOffset;
                jQuery.each(contentTop, function (i, currentPos) {
                    if (currentPos[0] <= winTop && winTop <= currentPos[1]) {
                        var groupItems = jQuery('#groupList li.sapUshellGroupLI');
                        var selectedGroupListItem = groupItems.removeClass('sapUshellSelected').eq(i);
                        selectedGroupListItem.addClass('sapUshellSelected');

                        var groupListScrollElement = document.getElementById('groupListPage-cont');

                        var groupListScrollTop = groupListScrollElement.scrollTop;
                        var groupListScrollBottom = groupListScrollTop + groupListScrollElement.offsetHeight;
                        var groupOffsetTop = selectedGroupListItem[0].offsetTop;

                        if (groupOffsetTop < groupListScrollTop || groupOffsetTop + selectedGroupListItem[0].offsetHeight > groupListScrollBottom) {
                            jQuery('#groupListPage section').animate({scrollTop: groupItems[i].offsetTop}, 0);
                        }
                    }
                });
            }
            sap.ushell.utils.handleTilesVisibility();
        },

        _handleGroupListItemPress : function (oEvent) {
            var oSource = oEvent.getSource();
            //to support accessibility tab order we set focus in press in case edit mode is off
            var focus = oEvent.getParameter("action") === "sapenter";
            this._handleScrollToGroup(oSource, false, focus);
        },

        _handleScrollToGroup : function (oGroupItem, groupChanged, focus) {
            if (!oGroupItem) {
                return;
            }
            var that = this;
            document.getElementById('dashboard').removeEventListener('scroll', that.handleScroll);

            this._publishAsync("launchpad", "scrollToGroup", {
                group : oGroupItem,
                groupChanged : groupChanged,
                focus : focus
            });
        },

        _handleScrollAnimationEnd : function () {
            var that = this;
            document.getElementById('dashboard').addEventListener('scroll', that.handleScroll);
        },

        _publishAsync : function (sChannelId, sEventId, oData) {
            var oBus = sap.ui.getCore().getEventBus();
            window.setTimeout($.proxy(oBus.publish, oBus, sChannelId, sEventId, oData), 1);
        }
    });
}());

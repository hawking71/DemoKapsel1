// iteration 0: ok
// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
/* global jQuery, sap, console */

(function() {
    "use strict";


    jQuery.sap.require("sap.ushell.renderers.fiori2.search.SearchModel");

    sap.ui.controller("sap.ushell.renderers.fiori2.search.container.Search", {

        onInit: function() {
            var self = this;
            sap.ui.getCore().getEventBus().subscribe("appSearchFinished", self.getView().onAppSearchFinished, self.getView());
            sap.ui.getCore().getEventBus().subscribe("normalSearchFinished", self.getView().onNormalSearchFinished, self.getView());
            sap.ui.getCore().getEventBus().subscribe("allSearchStarted", self.getView().onAllSearchStarted, self.getView());
            sap.ui.getCore().getEventBus().subscribe("allSearchFinished", self.getView().onAllSearchFinished, self.getView());
        },

        onExit: function() {
            var self = this;
            sap.ui.getCore().getEventBus().unsubscribe("appSearchFinished", self.getView().onAppSearchFinished, self.getView());
            sap.ui.getCore().getEventBus().unsubscribe("normalSearchFinished", self.getView().onNormalSearchFinished, self.getView());
            sap.ui.getCore().getEventBus().unsubscribe("allSearchStarted", self.getView().onAllSearchStarted, self.getView());
            sap.ui.getCore().getEventBus().unsubscribe("allSearchFinished", self.getView().onAllSearchFinished, self.getView());
        }

    });
}());

// iteration 0 ok

// Copyright (c) 2009-2014 SAP SE, All Rights Reserved

/* global jQuery, sap */
jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchHelper');
var SearchHelper = sap.ushell.renderers.fiori2.search.SearchHelper;

/* global sap */
sap.ui.controller("sap.ushell.renderers.fiori2.search.container.App", {

    onInit: function() {
        "use strict";
        this.oShellNavigation = sap.ushell.Container.getService("ShellNavigation");
        this.oShellNavigation.hashChanger.attachEvent("hashChanged", this.hashChanged);
    },

    hashChanged: function(oEvent) {
        "use strict";
        if (!SearchHelper.hasher.hasChanged()) {
            return;
        }
        var oView = sap.ui.getCore().byId("searchContainerApp");
        oView.deserializeURL();
    },

    onExit: function() {
        "use strict";
        this.oShellNavigation.hashChanger.detachEvent("hashChanged", this.hashChanged);
    },

});

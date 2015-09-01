// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
/**
 * @fileOverview The Search adapter for the demo platform.
 *
 * @version 1.28.6
 */
(function () {
    "use strict";
    /*global jQuery, sap, setTimeout, window */
    jQuery.sap.declare("sap.ushell.adapters.local.SearchAdapter");

    window.sap.bc = window.sap.bc || {};
    window.sap.bc = {ina : {api: {sina: {properties: {systemType: "ABAP", startWithSearch : "false", noSapClientFromUrl: true, noDefaultSina: true}}}}};
    jQuery.sap.require("sap.ushell.renderers.fiori2.search.esh.api.release.sina");

    /**
     *
     * @param oSystem
     * @returns {sap.ushell.adapters.abap.SearchAdapter}
     */
    sap.ushell.adapters.local.SearchAdapter = function (oSystem, sParameter, oAdapterConfiguration) {

        this.isSearchAvailable = function () {
            var oDeferred = jQuery.Deferred();

            oDeferred.resolve(true);
            return oDeferred.promise();
        };

        this.getSina = function () {
            var self = this,
                proxyProperties = {},
                proxy,
                sys;

            if (!self.sina) {
                oAdapterConfiguration = jQuery.sap.getObject("config", 0, oAdapterConfiguration);
                if (oAdapterConfiguration.hasOwnProperty("searchResultPath")) {
                    proxyProperties = {
                        demoMode: oAdapterConfiguration.searchResultPath
                    };
                }
                proxy = new window.sap.bc.ina.api.sina.impl.inav2.proxy.Proxy(proxyProperties);
                sys = new window.sap.bc.ina.api.sina.impl.inav2.system.ABAPSystem({'proxy': proxy});
                self.sina = window.sap.bc.ina.api.sina.getSina({system: sys});
                window.sap.bc.ina.api.sina = window.jQuery.extend({}, window.sap.bc.ina.api.sina, self.sina); // without extend the new global sina instance would overwrite every module after sap.bc.ina.sina !!!
            }
            return self.sina;
        };

    };
}());

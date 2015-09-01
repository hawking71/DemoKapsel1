// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
(function () {
    "use strict";
    /*global jQuery, sap, window */
    /*jslint nomen: true */
    jQuery.sap.declare("sap.ushell.renderers.fiori2.Navigation");

    sap.ushell.renderers.fiori2.Navigation = function () {
        this.CATALOG = {
            ID : "ShellCatalog",
            SEMANTICOBJECT : "shell",
            ACTION : "catalog",
            filters: {}
        };
        //OBSOLETE FOR NOW: search is not part of the navigation
        this.SEARCH = {
            ID : "ShellSearch",
            SEMANTICOBJECT : "shell",
            ACTION : "search"
        };
        sap.ushell.Container.getService("NavTargetResolution").registerCustomResolver({
            name : "Shell Internal Navigation",
            isApplicable : jQuery.proxy(this.navTargetIsApplicableForShell, this),
            resolveHashFragment : jQuery.proxy(this.resolveHashFragmentForShell, this)
        });
        sap.ushell.Container.getService("NavTargetResolution").registerCustomResolver({
            name : "Search App Container",
            isApplicable : function (sHashFragment) { 
            	return sHashFragment === "#Action-search";
            },
            resolveHashFragment : function (sHashFragment) {
            	var oDeferred = new jQuery.Deferred(),
	                res = {};
            	if (sHashFragment === "#Action-search") {
	                res = {
	                        "additionalInformation": "SAPUI5.Component=sap.ushell.renderers.fiori2.search.container",
		                    "applicationType": "URL",
//		                    "url": "/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderers/fiori2/search/container"
		                    "url": jQuery.sap.getResourcePath("sap/ushell/renderers/fiori2/search/container")
	                };
	            }
	            oDeferred.resolve(res);
	            return oDeferred.promise();
            }
        });
    };

    sap.ushell.renderers.fiori2.Navigation.prototype.openCatalogByHash = function (oData, bSaveHistory) {
        if (oData) {
            this.CATALOG.filters = oData;
        }
        var sHash = "#" + sap.ushell.Container.getService("URLParsing").constructShellHash({
                target : {
                    semanticObject : this.CATALOG.SEMANTICOBJECT,
                    action : this.CATALOG.ACTION
                },
                params : {
                    catalogSelector : [this.CATALOG.filters.categoryFilter || ""],
                    tileFilter : [this.CATALOG.filters.searchFilter || ""],
                    tagFilter : [this.CATALOG.filters.tagFilter || ""]
                }
            });
        sap.ushell.Container.getService("ShellNavigation").hashChanger.privsetHash(sHash, bSaveHistory === undefined ? true : bSaveHistory);

        //Add access keys
        // reset selections
        jQuery(document).off('keydown.dashboard');
        jQuery(document).off('keydown.catalog');
        // add catalog events
        jQuery(document).on('keydown.catalog', sap.ushell.renderers.fiori2.AccessKeysHandler.catalogKeydownHandler);
    };

    /* Make catalog part of the navigation */
    sap.ushell.renderers.fiori2.Navigation.prototype.navTargetIsApplicableForShell = function (sHashFragment) {
        var oAppInfo = sap.ushell.Container.getService("URLParsing").parseShellHash(sHashFragment.substring(1));

        return oAppInfo &&
            (oAppInfo.semanticObject === this.CATALOG.SEMANTICOBJECT
                    && oAppInfo.action === this.CATALOG.ACTION);
    };

    sap.ushell.renderers.fiori2.Navigation.prototype.resolveHashFragmentForShell = function (sHashFragment) {
        var oAppInfo = sap.ushell.Container.getService("URLParsing").parseShellHash(sHashFragment.substring(1)),
            oDeferred = new jQuery.Deferred(),
            res = {};
        if (oAppInfo.action === this.CATALOG.ACTION) {
            res = {
                applicationType: this.CATALOG.ID,
                catalogSelector : oAppInfo.params.catalogSelector,
                tileFilter : oAppInfo.params.tileFilter,
                targetGroup : oAppInfo.params.targetGroup,
                tagFilter : oAppInfo.params.tagFilter
            };
        }
        oDeferred.resolve(res);
        return oDeferred.promise();
    };

    sap.ushell.renderers.fiori2.Navigation = new sap.ushell.renderers.fiori2.Navigation();
}());

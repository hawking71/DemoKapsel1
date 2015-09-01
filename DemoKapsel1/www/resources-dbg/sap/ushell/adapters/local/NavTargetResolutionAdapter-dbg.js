// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
/**
 * @fileOverview The NavTargetResolution adapter for the demo platform.
 *
 * @version 1.28.6
 */
(function () {
    "use strict";
    /*global jQuery, sap */
    jQuery.sap.declare("sap.ushell.adapters.local.NavTargetResolutionAdapter");

    jQuery.sap.require("sap.ui.thirdparty.datajs");

    /**
     * This demo adapter reads its configuration from the demo config, where the target applications are defined.
     * Note that only a constructed tuple is returned, which returns the platform neutral
     * expected result (cf. adjustResult in the ABAP Platform adapter)
     * @param oSystem
     * @param sParameter 
     * @param oAdapterConfiguration
     * @returns {sap.ushell.adapters.abap.NavTargetResolutionAdapter}
     */
    sap.ushell.adapters.local.NavTargetResolutionAdapter = function (oUnused, sParameter, oAdapterConfiguration) {

        var oApplications = oAdapterConfiguration.config.applications;

        this.resolveHashFragment = function (sHashFragment) {
            var oDeferred = new jQuery.Deferred(),
                iIndex,
                oResult,
                sParameters;

            if (sHashFragment && sHashFragment.charAt(0) !== "#") {
                throw new sap.ushell.utils.Error("Hash fragment expected",
                        "sap.ushell.renderers.minimal.Shell");
            }

            sHashFragment = sHashFragment.substring(1);

            if (!sHashFragment && !oApplications[sHashFragment]) {
                oDeferred.resolve(undefined);
            } else {
                jQuery.sap.log.info("Hash Fragment: " + sHashFragment);

                iIndex = sHashFragment.indexOf("?");
                if (iIndex >= 0) {
                    sParameters = sHashFragment.slice(iIndex + 1);
                    sHashFragment = sHashFragment.slice(0, iIndex);
                }

                oResult = oApplications[sHashFragment];
                // we need a copy (!), as we cannot modify the original data configured
                //
                if (oResult) {
                    oResult = {
                            additionalInformation : oResult.additionalInformation,
                            applicationType : oResult.applicationType,
                            url : oResult.url
                    };
                    // add sParameter to URL
                    if (sParameters) {
                        oResult.url += (oResult.url.indexOf("?") < 0) ? "?" : "&";
                        oResult.url += sParameters;
                    }
                    oDeferred.resolve(oResult);
                } else {
                    oDeferred.reject("Could not resolve link '" + sHashFragment + "'");
                }
            }

            return oDeferred.promise();
        };


        this.getSemanticObjectLinks = function(sSemanticObject) {
            var oDeferred = new jQuery.Deferred();

            if (!sSemanticObject) {
                oDeferred.resolve([]);
            } else {
                jQuery.sap.log.info("getSemanticObjectLinks: " + sSemanticObject);
                var intent,
                    oResult = [],
                    i = 0;
                for(intent in oApplications){
                    if (intent.substring(0, intent.indexOf('-')) === sSemanticObject) {
                        // result must have at least .text and .intent
                        // see documentation of getSemanticObjectLinks in NavTargetResolution.js
                        oResult[i] = oApplications[intent];
                        oResult[i].id = intent;
                        oResult[i].text = oResult[i].text || oResult[i].description || "no text";
                        oResult[i].intent = "#" + intent;
                        i++;
                    }
                }
                if (oResult) {
                    oDeferred.resolve(oResult);
                } else {
                    oDeferred.reject("Could not get links for  '" + sSemanticObject + "'");
                }
            }
            return oDeferred.promise();
        };
    };
}());

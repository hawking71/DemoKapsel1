// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
/**
 * @fileOverview This file contains an annotation parser for factsheets.
 */

(function() {
    "use strict";

 // Exception Object
    function ParameterException(parameter, template, url) {
        this.parameter = parameter;
        this.template = template;
        this.semiConvertedUrl = url;
        this.message = " is a missing key parameter for constructing the entity url";
        this.toString = function() {
           return this.parameter + this.message
        };
    }
    
    jQuery.sap
            .declare("sap.ushell.components.factsheet.tools.ODataUrlTemplating");

    sap.ushell.components.factsheet.tools.ODataUrlTemplating = {
        ParameterException : ParameterException,
        resolve : function(template, data) {
            var sEntityUrl, value, parameter, i,
            businessParameter = template.match(/{\s*[\w\.]+\s*}/g);
            sEntityUrl = template;

            for (i = businessParameter.length - 1; i >= 0; i -= 1) {
                parameter = businessParameter[i];
                value = data[parameter.replace(/[{}]/g, "")];
                if (value !== undefined) {
                    if (typeof value !== "string") {
                        value = value[0];
                    }
                    value = encodeURIComponent(decodeURIComponent(value));
                    sEntityUrl = sEntityUrl.replace(parameter, value);
                }
            }
            // Is there a parameter left
            if (parameter = sEntityUrl.match(/{\s*[\w\.]+\s*}/g)) {
                jQuery.sap.log.error(" "
                        + sEntityUrl);
                // TODO: Raise exception
                throw new this.ParameterException(parameter, template, sEntityUrl);
            }

            return sEntityUrl;
        }
    }
})();

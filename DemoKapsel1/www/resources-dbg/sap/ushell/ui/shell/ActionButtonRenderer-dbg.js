// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
/*global jQuery, sap*/
/**
 * @class GroupListItem renderer.
 * @static
 * 
 * @private
 */

(function () {
    "use strict";
    jQuery.sap.declare("sap.ushell.ui.shell.ActionButtonRenderer");
    jQuery.sap.require("sap.ui.core.Renderer");
    jQuery.sap.require("sap.m.ButtonRenderer");

    /**
     * @class ActionButton renderer.
     * @static
     */
    sap.ushell.ui.shell.ActionButtonRenderer = sap.ui.core.Renderer.extend(sap.m.ButtonRenderer);
}());

// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
/*global jQuery, sap*/
/**
 * @class GroupHeaderButton renderer.
 * @static
 * 
 * @private
 */

(function () {
    "use strict";
    jQuery.sap.declare("sap.ushell.ui.launchpad.GroupHeaderActionsRenderer");

    sap.ushell.ui.launchpad.GroupHeaderActionsRenderer = {};

    /**
     * Renders the HTML for the given control, using the provided
     * {@link sap.ui.core.RenderManager}.
     * 
     * @param {sap.ui.core.RenderManager}
     *            oRm the RenderManager that can be used for writing to the render
     *            output buffer
     * @param {sap.ui.core.Control}
     *            oControl an object representation of the control that should be
     *            rendered
     */
    sap.ushell.ui.launchpad.GroupHeaderActionsRenderer.render = function (oRm, oControl) {
        var isOverflow = oControl.getIsOverflow(),
            overflowCtrl = oControl.getOverflowCtrl(),
            isTileActionModeActive = oControl.getTileActionModeActive();

        oRm.write("<div");
        oRm.writeControlData(oControl);
        oRm.writeClasses();
        oRm.write(">");

        var aContent = oControl.getContent();

        if (isTileActionModeActive) {
            if (isOverflow) {
                jQuery.each(oControl._getActionOverflowControll(), function () {
                    oRm.renderControl(this);
                });
            } else {
                jQuery.each(aContent, function () {
                    oRm.renderControl(this);
                });
            }
        }
        oRm.write("</div>");
    };
}());

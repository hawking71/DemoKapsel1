// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
/*global jQuery, sap*/

(function () {
    "use strict";
    jQuery.sap.require("sap.ushell.resources");
    jQuery.sap.declare("sap.ushell.ui.launchpad.TileRenderer");

    /**
     * @class Tile renderer.
     * @static
     *
     * @private
     */
    sap.ushell.ui.launchpad.TileRenderer = {};
    var translationBundle = sap.ushell.resources.i18n;

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
    sap.ushell.ui.launchpad.TileRenderer.render = function (oRm, oControl) {
        var oTileView = null, oModel = oControl.getModel();
        try {
            oTileView = oControl.getTileViews()[0];
        } catch (ex) {
            jQuery.sap.log.warning("Failed to load tile view: ", ex.message);
            oTileView = new sap.m.Text({ text: "Failed to load. "});
        }

        oRm.write("<div");

        // if xRay is enabled 
        if (oModel && oModel.getProperty("/enableHelp")) {
            // currently only the Tile (and the Tile's footer) has a data attribute in teh xRay integration
            // (as using this value as a class value instead as done in all of the static elements causes parsing errors in the xRay hotspot definition flow)
            oRm.writeAttribute("data-tileCatalogId", oControl.getTileCatalogId());// xRay support
        }
        oRm.writeControlData(oControl);
        oRm.addClass("sapUshellTile");
        if (oControl.getFootItems() && oControl.getFootItems().length > 0) {
            oRm.addClass("sapUshellTileFooter");
        }
        if (oControl.getLong()) {
            oRm.addClass("sapUshellLong");
        }
        if (oControl.getTall()) {
            oRm.addClass("sapUshellTall");
        }
        if (!oControl.getVisible()) {
            oRm.addClass("sapUshellHidden");
        }
        if(oControl.getIsLocked()){
            oRm.addClass("sapUshellLockedTile");
        }
        oRm.writeClasses();
        oRm.writeAttributeEscaped("tabindex", "-1");
        var layoutPosition = oControl.data('layoutPosition');
        if (layoutPosition) {
            var stylePosition = '-webkit-transform:' + layoutPosition.translate3D + ';-ms-transform:' + layoutPosition.translate2D + ';transform:' + layoutPosition.translate3D;
            oRm.writeAttribute("style", stylePosition);
        }
        oRm.writeAccessibilityState(oControl, {role : 'link', label : translationBundle.getText("TileDetails_lable")});
        oRm.write(">");

        // Add the ActioMode cover DIV to the tile
        oRm.write("<div");
        oRm.addClass("tileActionLayerDiv");
        oRm.writeClasses();
        oRm.write(">");
        oRm.write("</div>");

        // Tile Content
        oRm.addClass("sapUshellTileInner");


        if (this.renderTileView) {
            this.renderTileView(oRm, oTileView, oControl.getTarget());
        }

        if (oControl.getShowActionsIcon()) {
            oRm.renderControl(oControl.actionIcon);
        }

        // Tile Footer Items
        oRm.write("<footer");

        // if xRay is enabled 
        if (oModel && oModel.getProperty("/enableHelp")) {
            // currently only the Tile (and the Tile's footer) has a data attribute in teh xRay integration
            // (as using this value as a class value instead as done in all of the static elements causes parsing errors in the xRay hotspot definition flow)
            oRm.writeAttribute("data-tileCatalogId", "addRemoveTile-" + oControl.getTileCatalogId());
        }

        oRm.addClass("sapUshellTileFooterElement");
        oRm.writeClasses();
        oRm.write(">");
        jQuery.each(oControl.getFootItems(), function () {
            oRm.renderControl(this);
        });
        oRm.write("</footer>");

        oRm.write("</div>");
    };

    sap.ushell.ui.launchpad.TileRenderer.renderTileView = function (oRm, oTileView, sTarget) {
        if ((sTarget || "") !== "") {
            oRm.write("<a");
            oRm.writeClasses();
            oRm.writeAttributeEscaped("href", "#" + sTarget);
            oRm.write(">");
            oRm.renderControl(oTileView);
            oRm.write("</a>");
        } else {
            oRm.write("<div");
            oRm.writeClasses();
            oRm.writeAttribute("title", sap.ushell.resources.i18n.getText("launchTile_tooltip"));
            oRm.write(">");
            oRm.renderControl(oTileView);
            oRm.write("</div>");
        }
    };

}());

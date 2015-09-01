// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
/**
 * @fileOverview The SAPUI5 component of SAP's Fiori Wave 2 renderer for the Unified Shell.
 *
 * @version 1.28.6
 */
/**
 * @namespace Namespace for SAP's fiori2 renderer for the Unified Shell. The renderer consists
 * of an SAPUI5 component called <code>sap.ushell.renderers.fiori2.Renderer</code>.
 *
 * @name sap.ushell.renderers.fiori2
 * @see sap.ushell.renderers.fiori2.Renderer
 * @since 1.9.0
 * @private
 */
(function () {
    "use strict";
    /*global jQuery, sap */
    jQuery.sap.declare("sap.ushell.renderers.fiori2.Renderer");

    jQuery.sap.require("sap.ushell.ui.shell.Shell");
    jQuery.sap.require("sap.ui.core.UIComponent");
    jQuery.sap.require("sap.ushell.resources");
    jQuery.sap.require("sap.ushell.renderers.fiori2.RendererExtensions");

    /**
     * This method MUST be called by the Unified Shell's container only, others MUST call
     * <code>sap.ushell.Container.createRenderer("fiori2")</code>.
     *
     * @class The SAPUI5 component of SAP's Fiori Wave 2 renderer for the Unified Shell.
     *
     * @extends sap.ui.core.UIComponent
     * @name sap.ushell.renderers.fiori2.Renderer
     * @see sap.ushell.services.Container#createRenderer
     * @since 1.15.0
     * @public
     */
    sap.ui.core.UIComponent.extend("sap.ushell.renderers.fiori2.Renderer", {
        metadata : {
            version : "1.28.6",
            dependencies : {
                version : "1.28.6",
                libs : [ "sap.ui.core", "sap.m" ],
                components: []
            }
        }
    });

    /**
     * *TODO*
     *
     * @returns *TODO*
     *
     * @methodOf sap.ushell.renderers.fiori2.Renderer#
     * @name createContent
     * @since 1.15.0
     *
     * @private
     */
    sap.ushell.renderers.fiori2.Renderer.prototype.createContent = function () {
        var predefineState = jQuery.sap.getUriParameters().get("appState") || jQuery.sap.getUriParameters().get("sap-ushell-config"),
            viewData = this.getComponentData() || {};

        if(predefineState){
            if(!viewData.config){
                viewData.config = {};
            }
            viewData.config.appState = predefineState;
        }

        if (viewData.config && viewData.config.customViews) {
            Object.keys(viewData.config.customViews).forEach(function (sViewName) {
                var oView = viewData.config.customViews[sViewName];
                sap.ui.view(sViewName, {
                    type: oView.viewType,
                    viewName: oView.viewName,
                    viewData: oView.componentData
                });
            });
        }
        
        var oView = sap.ui.view('mainShell', {
            type: sap.ui.core.mvc.ViewType.JS,
            viewName: "sap.ushell.renderers.fiori2.Shell",
            viewData: viewData
        });

        // initialize the RendererExtensions after the view is create. This also publish an external event that indicates
        // that sap.ushell.renderers.fiori2.RendererExtensions can be use.
        sap.ushell.renderers.fiori2.utils.init();
        return oView;
    };
}());

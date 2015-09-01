/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.ushell.ui.shell.ActionButton.
jQuery.sap.declare("sap.ushell.ui.shell.ActionButton");
jQuery.sap.require("sap.ushell.library");
jQuery.sap.require("sap.m.Button");


/**
 * Constructor for a new ui/shell/ActionButton.
 * 
 * Accepts an object literal <code>mSettings</code> that defines initial 
 * property values, aggregated and associated objects as well as event handlers. 
 * 
 * If the name of a setting is ambiguous (e.g. a property has the same name as an event), 
 * then the framework assumes property, aggregation, association, event in that order. 
 * To override this automatic resolution, one of the prefixes "aggregation:", "association:" 
 * or "event:" can be added to the name of the setting (such a prefixed name must be
 * enclosed in single or double quotes).
 *
 * The supported settings are:
 * <ul>
 * <li>Properties
 * <ul></ul>
 * </li>
 * <li>Aggregations
 * <ul></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul></ul>
 * </li>
 * </ul> 
 *
 * 
 * In addition, all settings applicable to the base type {@link sap.m.Button#constructor sap.m.Button}
 * can be used as well.
 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * Add your documentation for the newui/shell/ActionButton
 * @extends sap.m.Button
 * @version 1.28.6
 *
 * @constructor
 * @public
 * @name sap.ushell.ui.shell.ActionButton
 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
 */
sap.m.Button.extend("sap.ushell.ui.shell.ActionButton", { metadata : {

	library : "sap.ushell"
}});


/**
 * Creates a new subclass of class sap.ushell.ui.shell.ActionButton with name <code>sClassName</code> 
 * and enriches it with the information contained in <code>oClassInfo</code>.
 * 
 * <code>oClassInfo</code> might contain the same kind of informations as described in {@link sap.ui.core.Element.extend Element.extend}.
 *   
 * @param {string} sClassName name of the class to be created
 * @param {object} [oClassInfo] object literal with informations about the class  
 * @param {function} [FNMetaImpl] constructor function for the metadata object. If not given, it defaults to sap.ui.core.ElementMetadata.
 * @return {function} the created class / constructor function
 * @public
 * @static
 * @name sap.ushell.ui.shell.ActionButton.extend
 * @function
 */

// Start of sap/ushell/ui/shell/ActionButton.js
/*global jQuery, sap*/
/**
 * @name sap.ushell.ui.shell.ActionButton
 *
 * @private
 */
(function () {
    "use strict";

    jQuery.sap.declare("sap.ushell.ui.shell.ActionButton");

    sap.ushell.ui.shell.ActionButton.prototype.init = function () {
        this.addStyleClass("sapUshellRoundedActionButton");
        //call the parent sap.m.Button init method
        if (sap.m.Button.prototype.init) {
            sap.m.Button.prototype.init.apply(this, arguments);
        }
    };

    sap.ushell.ui.shell.ActionButton.prototype.exit = function () {
        sap.m.Button.prototype.exit.apply(this, arguments);
    };

    /**
     * Avoid re-rendering of the floating button because SAP UI5 brings the focus to 0,0 if using setVIsible 
     */
    sap.ushell.ui.shell.ActionButton.prototype.setVisible = function (state) {
        var jqActionBtn = jQuery("#" + this.sId),
            sVisibilityState = state ? "visible" : "hidden";

        if (jqActionBtn.length) {
            this.setProperty("visible", state, true);  // Update the visibility of the SAP UI5 button
            jqActionBtn.css("visibility", sVisibilityState);
        } else {
            this.setProperty("visible", state, false);
        }
    };
}());

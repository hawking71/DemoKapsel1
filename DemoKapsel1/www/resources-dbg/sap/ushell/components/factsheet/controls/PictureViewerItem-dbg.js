/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.ushell.components.factsheet.controls.PictureViewerItem.
jQuery.sap.declare("sap.ushell.components.factsheet.controls.PictureViewerItem");
jQuery.sap.require("sap.ushell.library");
jQuery.sap.require("sap.ui.core.Control");


/**
 * Constructor for a new components/factsheet/controls/PictureViewerItem.
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
 * <ul>
 * <li>{@link #getSrc src} : string</li></ul>
 * </li>
 * <li>Aggregations
 * <ul>
 * <li>{@link #getImage image} : sap.m.Image</li></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * Picture viewer control relying on the TileContainer control
 * @extends sap.ui.core.Control
 * @version 1.28.6
 *
 * @constructor
 * @public
 * @name sap.ushell.components.factsheet.controls.PictureViewerItem
 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
 */
sap.ui.core.Control.extend("sap.ushell.components.factsheet.controls.PictureViewerItem", { metadata : {

	library : "sap.ushell",
	properties : {
		"src" : {type : "string", group : "Misc", defaultValue : null}
	},
	aggregations : {
		"image" : {type : "sap.m.Image", multiple : false}
	}
}});


/**
 * Creates a new subclass of class sap.ushell.components.factsheet.controls.PictureViewerItem with name <code>sClassName</code> 
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
 * @name sap.ushell.components.factsheet.controls.PictureViewerItem.extend
 * @function
 */


/**
 * Getter for property <code>src</code>.
 * Image source url.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>src</code>
 * @public
 * @name sap.ushell.components.factsheet.controls.PictureViewerItem#getSrc
 * @function
 */

/**
 * Setter for property <code>src</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sSrc  new value for property <code>src</code>
 * @return {sap.ushell.components.factsheet.controls.PictureViewerItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.components.factsheet.controls.PictureViewerItem#setSrc
 * @function
 */


/**
 * Getter for aggregation <code>image</code>.<br/>
 * Pass in an existing Image control to be used inside the PictureViewer
 * 
 * @return {sap.m.Image}
 * @public
 * @name sap.ushell.components.factsheet.controls.PictureViewerItem#getImage
 * @function
 */


/**
 * Setter for the aggregated <code>image</code>.
 * @param {sap.m.Image} oImage
 * @return {sap.ushell.components.factsheet.controls.PictureViewerItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.components.factsheet.controls.PictureViewerItem#setImage
 * @function
 */
	

/**
 * Destroys the image in the aggregation 
 * named <code>image</code>.
 * @return {sap.ushell.components.factsheet.controls.PictureViewerItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.components.factsheet.controls.PictureViewerItem#destroyImage
 * @function
 */

// Start of sap/ushell/components/factsheet/controls/PictureViewerItem.js
/*!
 * @copyright@
*/

/**
 * Setter for property <code>src</code>.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @param {string} sSrc  new value for property <code>src</code>
 * @return {sap.ushell.components.factsheet.controls.PictureViewerItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.components.factsheet.controls.PictureViewerItem#setSrc
 * @function
 */
sap.ushell.components.factsheet.controls.PictureViewerItem.prototype.setSrc = function(sSrc) {
	this.setProperty("src", sSrc);
	// Also create or update the internal image
	var oImage = this.getImage();
	if (oImage == null) {
		oImage = new sap.m.Image();
	}
	oImage.setSrc(sSrc);
	this.setImage(oImage);
	return this;
};

/**
 * Called when the control is destroyed
 */
sap.ushell.components.factsheet.controls.PictureViewerItem.prototype.exit = function() {
    var oImage = this.getImage();
    if (oImage) {
        oImage.destroy();
    }
};
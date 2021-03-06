/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2015 SAP SE. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.viz.ui5.controls.common.BaseControl.
jQuery.sap.declare("sap.viz.ui5.controls.common.BaseControl");
jQuery.sap.require("sap.viz.library");
jQuery.sap.require("sap.ui.core.Control");


/**
 * Constructor for a new ui5/controls/common/BaseControl.
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
 * <li>{@link #getUiConfig uiConfig} : object</li>
 * <li>{@link #getWidth width} : sap.ui.core.CSSSize (default: '640px')</li>
 * <li>{@link #getHeight height} : sap.ui.core.CSSSize (default: '480px')</li></ul>
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
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * An abstract base class for all VIZ controls
 * @extends sap.ui.core.Control
 * @version 1.28.7
 *
 * @constructor
 * @public
 * @since 1.22.0
 * @name sap.viz.ui5.controls.common.BaseControl
 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
 */
sap.ui.core.Control.extend("sap.viz.ui5.controls.common.BaseControl", { metadata : {

	library : "sap.viz",
	properties : {
		"uiConfig" : {type : "object", group : "Misc", defaultValue : null},
		"width" : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : '640px'},
		"height" : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : '480px'}
	}
}});


/**
 * Creates a new subclass of class sap.viz.ui5.controls.common.BaseControl with name <code>sClassName</code> 
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
 * @name sap.viz.ui5.controls.common.BaseControl.extend
 * @function
 */


/**
 * Getter for property <code>uiConfig</code>.
 * Configuration for initialization to VizControl. This property could only set via settings parameter in Constructor.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {object} the value of property <code>uiConfig</code>
 * @public
 * @name sap.viz.ui5.controls.common.BaseControl#getUiConfig
 * @function
 */

/**
 * Setter for property <code>uiConfig</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {object} oUiConfig  new value for property <code>uiConfig</code>
 * @return {sap.viz.ui5.controls.common.BaseControl} <code>this</code> to allow method chaining
 * @public
 * @name sap.viz.ui5.controls.common.BaseControl#setUiConfig
 * @function
 */


/**
 * Getter for property <code>width</code>.
 * Width of the VizControl as a CSS size.
 *
 * Default value is <code>640px</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>width</code>
 * @public
 * @name sap.viz.ui5.controls.common.BaseControl#getWidth
 * @function
 */

/**
 * Setter for property <code>width</code>.
 *
 * Default value is <code>640px</code> 
 *
 * @param {sap.ui.core.CSSSize} sWidth  new value for property <code>width</code>
 * @return {sap.viz.ui5.controls.common.BaseControl} <code>this</code> to allow method chaining
 * @public
 * @name sap.viz.ui5.controls.common.BaseControl#setWidth
 * @function
 */


/**
 * Getter for property <code>height</code>.
 * Height of the VizControl as a CSS size.
 *
 * Default value is <code>480px</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>height</code>
 * @public
 * @name sap.viz.ui5.controls.common.BaseControl#getHeight
 * @function
 */

/**
 * Setter for property <code>height</code>.
 *
 * Default value is <code>480px</code> 
 *
 * @param {sap.ui.core.CSSSize} sHeight  new value for property <code>height</code>
 * @return {sap.viz.ui5.controls.common.BaseControl} <code>this</code> to allow method chaining
 * @public
 * @name sap.viz.ui5.controls.common.BaseControl#setHeight
 * @function
 */

// Start of sap/viz/ui5/controls/common/BaseControl.js

sap.viz.ui5.controls.common.BaseControl.prototype.init = function() {
	this._app$ = null;
	this._controls = {};

	this._requestedLoad = null;

	this._handlers = {
		'resize' : null
	};

	this._theme = null;
	this._locale = null;

	this._pendingRerendering = false;
	// Load resources.
	this._resourceLoaded = false;
	sap.viz._initializeVIZControls(this instanceof sap.viz.ui5.VizContainer,jQuery.proxy(function(success) {
		this._resourceLoaded = success;

		this.invalidate();
		// Set timeout to assure applySetting done
		setTimeout(function() {
			if (!this.getUIArea()) {
				this._render();
			}
		}.bind(this), 0);
	}, this));
};

sap.viz.ui5.controls.common.BaseControl.prototype.exit = function() {
	this._app$ = null;

	this._deregister();

	for ( var keyword in this._controls) {
		this._controls[keyword].destroy();
	}
};

sap.viz.ui5.controls.common.BaseControl.prototype.onBeforeRendering = function() {
	this._deregister();
};

sap.viz.ui5.controls.common.BaseControl.prototype.onAfterRendering = function() {
	this._render();
};

sap.viz.ui5.controls.common.BaseControl.prototype.onThemeChanged = function() {
	if (this._theme !== sap.ui.getCore().getConfiguration().getTheme()) {
		this._render();
	}
};

sap.viz.ui5.controls.common.BaseControl.prototype.onLocalizationChanged = function() {
	if (this._locale !== sap.ui.getCore().getConfiguration().getLocale()) {
		this._render();
	}
};

sap.viz.ui5.controls.common.BaseControl.prototype.save = function() {
	var json = {};
	for ( var keyword in this._controls) {
		json[keyword] = this._controls[keyword].save();
	}
	return json;
};

sap.viz.ui5.controls.common.BaseControl.prototype.load = function(oJson) {
	for ( var keyword in oJson) {
		if (this._controls[keyword]) {
			this._controls[keyword].load(oJson[keyword]);
		} else {
			this._requestedLoad = oJson;
		}
	}
};

sap.viz.ui5.controls.common.BaseControl.prototype._render = function() {
	if (this._resourceLoaded && this.getDomRef()) {
		this._pendingRerendering = false;

		this._theme = sap.ui.getCore().getConfiguration().getTheme();
		this._locale = sap.ui.getCore().getConfiguration().getLocale();

		if (!this._app$) {
			this._app$ = jQuery(document.createElement('div')).appendTo(
					this.getDomRef()).addClass('ui5-viz-controls-app');
			jQuery(this._app$).attr("data-sap-ui-preserve", true);

			this._validateSize();
			this._createChildren();
		} else {
			this._app$.appendTo(this.getDomRef());
			this._validateSize();
			this._updateChildren();
		}
		this._register();
	}
};

sap.viz.ui5.controls.common.BaseControl.prototype._createChildren = function() {
	// Should override by implementation
};
sap.viz.ui5.controls.common.BaseControl.prototype._updateChildren = function() {
	// Should override by implementation
};

sap.viz.ui5.controls.common.BaseControl.prototype._deregister = function() {
	if (this._handlers.resize) {
		sap.ui.core.ResizeHandler.deregister(this._handlers.resize);
	}
	this._handlers.resize = null;
};

sap.viz.ui5.controls.common.BaseControl.prototype._register = function() {
	this._handlers.resize = sap.ui.core.ResizeHandler.register(
			this.getDomRef(), jQuery.proxy(this._validateSize, this));
};

sap.viz.ui5.controls.common.BaseControl.prototype._validateSize = function() {
	// Should override by implementation
};

sap.viz.ui5.controls.common.BaseControl.prototype._registerControl = function(
		keyword, control) {
	this._controls[keyword] = control;

	if (this._requestedLoad && this._requestedLoad[keyword]) {
		control.load(this._requestedLoad[keyword]);
		delete this._requestedLoad[keyword];
	}
};

sap.viz.ui5.controls.common.BaseControl.prototype.invalidate = function() {
	sap.ui.core.Control.prototype.invalidate.apply(this, arguments);

	if (this.getUIArea()) {
		this._pendingRerendering = true;
	}
};

/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.ushell.ui.footerbar.AddBookmarkButton.
jQuery.sap.declare("sap.ushell.ui.footerbar.AddBookmarkButton");
jQuery.sap.require("sap.ushell.library");
jQuery.sap.require("sap.m.Button");


/**
 * Constructor for a new ui/footerbar/AddBookmarkButton.
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
 * <li>{@link #getBeforePressHandler beforePressHandler} : any</li>
 * <li>{@link #getAfterPressHandler afterPressHandler} : any</li>
 * <li>{@link #getAppData appData} : object</li></ul>
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
 * 
 * A button to be displayed in the foot-bar of the application. Saves the app state, so that you can launch the app in this state directly from the Launchpad.
 * @extends sap.m.Button
 * @version 1.28.6
 *
 * @constructor
 * @public
 * @name sap.ushell.ui.footerbar.AddBookmarkButton
 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
 */
sap.m.Button.extend("sap.ushell.ui.footerbar.AddBookmarkButton", { metadata : {

	library : "sap.ushell",
	properties : {
		"beforePressHandler" : {type : "any", group : "Misc", defaultValue : null},
		"afterPressHandler" : {type : "any", group : "Misc", defaultValue : null},
		"appData" : {type : "object", group : "Misc", defaultValue : null}
	}
}});


/**
 * Creates a new subclass of class sap.ushell.ui.footerbar.AddBookmarkButton with name <code>sClassName</code> 
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
 * @name sap.ushell.ui.footerbar.AddBookmarkButton.extend
 * @function
 */


/**
 * Getter for property <code>beforePressHandler</code>.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {any} the value of property <code>beforePressHandler</code>
 * @public
 * @name sap.ushell.ui.footerbar.AddBookmarkButton#getBeforePressHandler
 * @function
 */

/**
 * Setter for property <code>beforePressHandler</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {any} oBeforePressHandler  new value for property <code>beforePressHandler</code>
 * @return {sap.ushell.ui.footerbar.AddBookmarkButton} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.footerbar.AddBookmarkButton#setBeforePressHandler
 * @function
 */


/**
 * Getter for property <code>afterPressHandler</code>.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {any} the value of property <code>afterPressHandler</code>
 * @public
 * @name sap.ushell.ui.footerbar.AddBookmarkButton#getAfterPressHandler
 * @function
 */

/**
 * Setter for property <code>afterPressHandler</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {any} oAfterPressHandler  new value for property <code>afterPressHandler</code>
 * @return {sap.ushell.ui.footerbar.AddBookmarkButton} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.footerbar.AddBookmarkButton#setAfterPressHandler
 * @function
 */


/**
 * Getter for property <code>appData</code>.
 * 
 * appData is an object which contains the application information for the tile-saving dialog via the following properties:
 * beforePressHandler, afterPressHandler, title, subtitle, info, tileIcon, numberUnit, keywords, customUrl, serviceUrl, serviceRefreshInterval, showGroupSelection.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {object} the value of property <code>appData</code>
 * @public
 * @name sap.ushell.ui.footerbar.AddBookmarkButton#getAppData
 * @function
 */

/**
 * Setter for property <code>appData</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {object} oAppData  new value for property <code>appData</code>
 * @return {sap.ushell.ui.footerbar.AddBookmarkButton} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.footerbar.AddBookmarkButton#setAppData
 * @function
 */

// Start of sap/ushell/ui/footerbar/AddBookmarkButton.js
/*global jQuery, sap*/

(function () {
    "use strict";
    /*global sap, window, location */

    jQuery.sap.require("sap.ui.layout.form.SimpleForm");
    jQuery.sap.require("sap.m.Label");
    jQuery.sap.require("sap.m.Input");
    jQuery.sap.require("sap.m.Dialog");
    jQuery.sap.require("sap.m.Button");
    jQuery.sap.require("sap.ushell.resources");

    jQuery.sap.declare("sap.ushell.ui.footerbar.AddBookmarkButton");

    sap.ushell.ui.footerbar.AddBookmarkButton.prototype.init = function () {

        this.setIcon('sap-icon://add-favorite');
        this.setWidth('100%');
        this.setText(sap.ushell.resources.i18n.getText("addToHomePageBtn"));
        this.setTooltip(sap.ushell.resources.i18n.getText("addToHomePageBtn_tooltip"));
        this.setEnabled();  // disables button if shell not initialized


        var self = this;

        this.attachPress(function () {
            if (self.getBeforePressHandler()) {
                self.getBeforePressHandler()();
            }

            self.showAddBookmarkDialog(function () {
                if (self.getAfterPressHandler()) {
                    self.getAfterPressHandler()();
                }
            });
        });
        //call the parent sap.m.Button init method
        if (sap.m.Button.prototype.init) {
            sap.m.Button.prototype.init.apply(this, arguments);
        }
    };

    sap.ushell.ui.footerbar.AddBookmarkButton.prototype.exit = function () {
        if (this.oDialog) {
            this.oDialog.destroy();
        }
        //call the parent sap.m.Button exit method
        if (sap.m.Button.prototype.exit) {
            sap.m.Button.prototype.exit.apply(this, arguments);
        }
    };

    sap.ushell.ui.footerbar.AddBookmarkButton.prototype.setBookmarkTileView = function (oView) {
        this.bookmarkTileView = oView;
    };
    sap.ushell.ui.footerbar.AddBookmarkButton.prototype.getBookmarkTileView = function () {
        return this.bookmarkTileView;
    }

    sap.ushell.ui.footerbar.AddBookmarkButton.prototype.showAddBookmarkDialog = function (cb) {
        this.oResourceBundle = sap.ushell.resources.i18n;
        this.appData = this.getAppData() || {};
        var addBookmarkButton = this;
        this.cb = cb;
        var bookmarkTileView = sap.ui.view({
            type: sap.ui.core.mvc.ViewType.JS,
            viewName: "sap.ushell.ui.footerbar.SaveAsTile",
            viewData: this.appData
        });
        bookmarkTileView.enableGroupSelection();
        this.setBookmarkTileView(bookmarkTileView);

        this.oSimpleForm = new sap.ui.layout.form.SimpleForm({
            id: 'bookmarkFormId',
            layout:sap.ui.layout.form.SimpleFormLayout.GridLayout,
            content: [bookmarkTileView]
        }).addStyleClass("sapAddBookmarkForm");

        var oDialog = this._openDialog(this.oSimpleForm);

        //on every change in the input verify if there is a text in the input - if so enable ok, otherwise disable
        bookmarkTileView.getTitleInput().attachLiveChange(function () {
            addBookmarkButton._toggleOkButton(this.getValue(), oDialog.getBeginButton());
         });

    };

    sap.ushell.ui.footerbar.AddBookmarkButton.prototype._toggleOkButton = function (sValue, oOkButton) {
        oOkButton.setEnabled(sValue ? true : false);
    };

    sap.ushell.ui.footerbar.AddBookmarkButton.prototype._openDialog = function (oContent) {
        var okButton = new sap.m.Button('bookmarkOkBtn', {
            text: this.oResourceBundle.getText('okBtn'),
            press: this._handleOkButtonPress.bind(this),
            enabled : false
        }),
            cancelButton = new sap.m.Button('bookmarkCancelBtn', {
                text: this.oResourceBundle.getText('cancelBtn'),
                press: function () {
                    this.oDialog.close();
                    this.cb();
                }.bind(this)
            });
        this._toggleOkButton(this.appData.title, okButton); //if primary title is not empty enable the ok button - otherwise disable
        this.oDialog = new sap.m.Dialog({
            id: 'bookmarkDialog',
            title: this.oResourceBundle.getText('addToHomePageBtn'),
            contentWidth: '400px',
            content: oContent,
            beginButton : okButton,
            endButton: cancelButton,
            horizontalScrolling: false,
            afterClose : function () {
                this.oDialog.destroy();
                delete (this.oDialog);
            }.bind(this)
        });
        this.oDialog.open();
        return this.oDialog;
    };

    sap.ushell.ui.footerbar.AddBookmarkButton.prototype._handleOkButtonPress = function () {
        var bookmarkTileView = this.getBookmarkTileView();

        var oEventBus = sap.ui.getCore().getEventBus();
        oEventBus.publish("launchpad", "addBookmarkTile", bookmarkTileView.getBookmarkTileData());

        this.oDialog.close();
        this.cb();

    };

    sap.ushell.ui.footerbar.AddBookmarkButton.prototype.setEnabled = function (bEnabled) {
        var sState = "",
            bPersonalization = true;

        if (sap.ui.getCore().byId("shell")) {
            sState = sap.ui.getCore().byId("shell").getModel().getProperty("/currentState").stateName || "";
            if (sap.ui.getCore().byId("shell").getModel().getProperty("/personalization") !== undefined) {
                bPersonalization = sap.ui.getCore().byId("shell").getModel().getProperty("/personalization");
            }
        }
        if (sState === 'headerless' || sState === 'standalone' || sState === 'embedded' || !bPersonalization) {
            bEnabled = false;
        }
        if (!sap.ushell.Container) {
            if (this.getEnabled()) {
                jQuery.sap.log.warning(
                    "Disabling 'Save as Tile' button: unified shell container not initialized",
                    null,
                    "sap.ushell.ui.footerbar.AddBookmarkButton"
                );
            }
            bEnabled = false;
        }
        sap.m.Button.prototype.setEnabled.call(this, bEnabled);
        if (!bEnabled) {
            this.addStyleClass("sapUshellAddBookmarkButton");
        }
    };

}());

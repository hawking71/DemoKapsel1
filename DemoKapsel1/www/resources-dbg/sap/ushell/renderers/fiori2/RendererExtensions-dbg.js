// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
/**
 * @fileOverview The RendererExtensions class which allows you to extend the ushell fiori2 renderer
 *
 * @version 1.26
 */
(function () {
    "use strict";
    /*global jQuery, sap */
    jQuery.sap.declare("sap.ushell.renderers.fiori2.RendererExtensions");
    var oShellController;
    var bInitialized = false;



    // functions to be uses internally to communicate externally

    function _init(){
        if(!bInitialized){
            oShellController = sap.ui.getCore().byId("mainShell").oController;
            _publishExternalEvent("rendererLoaded");
            bInitialized = true;
        }
    }

    function _publishExternalEvent(sEventName, oData) {
        setTimeout(function () {
            sap.ui.getCore().getEventBus().publish("sap.ushell.renderers.fiori2.Renderer", sEventName, oData);
        }, 0);
    }


    sap.ushell.renderers.fiori2.utils = {};
    /**
     * Publish event externally. The Namespace of the event is "sap.ushell.renderers.fiori2.Renderer"
     * @param {string} sEventName
     *   The event name
     * @param {object} oData
     *   The data of the event
     * */
    sap.ushell.renderers.fiori2.utils.publishExternalEvent = _publishExternalEvent;

    /**
     * initialize the sap.ushell.renderers.fiori2 publish the event "rendererLoaded" externally once.
     * */
    sap.ushell.renderers.fiori2.utils.init = _init;


    //functions to be uses by a public API


    function _addHeaderItem(oItem, sLaunchpadState1, sLaunchpadState2, sLaunchpadState3) {
        oShellController.addHeaderItem.apply(oShellController, arguments);
    }

    function _addHeaderEndItem(oItem, sLaunchpadState1, sLaunchpadState2, sLaunchpadState3) {
        oShellController.addHeaderEndItem.apply(oShellController, arguments);
    }

    function _removeHeaderItem(oItem, sLaunchpadState1, sLaunchpadState2, sLaunchpadState3) {
        oShellController.removeHeaderItem.apply(oShellController, arguments);
    }

    function _removeHeaderEndItem(oItem, sLaunchpadState1, sLaunchpadState2, sLaunchpadState3) {
        oShellController.removeHeaderEndItem.apply(oShellController, arguments);
    }

    function _addOptionsActionSheetButton(oButton,sLaunchpadState1, sLaunchpadState2, sLaunchpadState3) {
        oShellController.addOptionsActionSheetButton.apply(oShellController, arguments);
    }

    function _removeOptionsActionSheetButton(oButton,sLaunchpadState1, sLaunchpadState2, sLaunchpadState3) {
        oShellController.removeOptionsActionSheetButton.apply(oShellController, arguments);
    }

    function _setFooter(oFooter) {
        oShellController.setFooter.apply(oShellController, arguments);
    }

    function _removeFooter() {
        oShellController.removeFooter();
    }

    function _addEndUserFeedbackCustomUI(oCustomUIContent, bShowCustomUIContent) {
        oShellController.addEndUserFeedbackCustomUI.apply(oShellController, arguments);
    }

    function _addUserPreferencesEntry() {
        oShellController.addUserPreferencesEntry.apply(oShellController, arguments);
    }

    function _setHeaderTitle() {
        oShellController._setHeaderTitle.apply(oShellController, arguments);
    }

    // a public API
    function RendererExtensions() {

        /**
         * Adds a ShellHeadItem to the headItems aggregation of the @see sap.ushell.ui.shell.shell, in the given launchpad states
         * (@see sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState).
         * If no launchpad states are provided the item will be added in all states.
         * The item is added to the left side of the header.
         * Currently you can add only one item. If an item already exists, the added item overrides the existing item,
         * and a warning is written to the log.
         *
         * @param {sap.ushell.ui.shell.ShellHeadItem} oItem
         *   The item to be added.
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState1]
         *   A launchpad state in which to add the item.
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState2]
         *   A launchpad state in which to add the item.
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState3]
         *   A launchpad state in which to add the item.

         * @since 1.26
         */
        this.addHeaderItem = _addHeaderItem;

        /**
         * Adds a ShellHeadItem to the headEndItems aggregation of the @see sap.ushell.ui.shell.shell, in the given launchpad states
         * (@see sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState).
         * If no launchpad states are provided the item will be added in all states.
         * The item is added to the right side of the header.
         * Currently you can add only one item. If an item already exists, the added item overrides the existing item,
         * and a warning is written to the log.
         *
         * @param {sap.ushell.ui.shell.ShellHeadItem} oItem
         *   The item to be added.
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState1]
         *   A launchpad state in which to add the item.
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState2]
         *   A launchpad state in which to add the item.
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState3]
         *   A launchpad state in which to add the item.

         * @since 1.26
         */
        this.addHeaderEndItem = _addHeaderEndItem;

        /**
         * Removes the ShellHeadItem from the headItems aggregation of the @see sap.ushell.ui.shell.shell, in the given launchpad states
         * (@see sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState).
         * If no launchpad states are provided the item is removed from all states.
         *
         * @param {sap.ushell.ui.shell.ShellHeadItem} oItem
         *   The item to be removed.
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState1]
         *   A launchpad state from which to remove the item.
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState2]
         *   A launchpad state from which to remove the item.
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState3]
         *   A launchpad state from which to remove the item.

         * @since 1.26
         */
        this.removeHeaderItem = _removeHeaderItem;

        /**
         * Removes the ShellHeadItem from the headEndItems aggregation of the @see sap.ushell.ui.shell.shell, in the given launchpad states
         * (@see sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState).
         * If no launchpad states are provided the item is removed from all states.
         *
         * @param {sap.ushell.ui.shell.ShellHeadItem} oItem
         *   The item to be removed.
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState1]
         *   A launchpad state from which to remove the item.
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState2]
         *   A launchpad state from which to remove the item.
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState3]
         *   A launchpad state from which to remove the item.

         * @since 1.26
         */
        this.removeHeaderEndItem = _removeHeaderEndItem;

        /**
         * Adds a custom control to a dedicated section within the End User Feedback dialog.
         *
         *
         * @param {sap.ui.core.Control}  oCustomUIContent
         *   The custom control to bee added within the End User Feedback dialog.
         * @param {boolean}  bShowCustomUIContent
         * @default true
         *   The visibility state of the added custom control.

         * @since 1.26
         */

        this.addEndUserFeedbackCustomUI = _addEndUserFeedbackCustomUI;

        /**
         * Adds a button to the action sheet which opens when clicking the 'options' button, in the given launchpad states
         * (@see sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState).
         * If no launchpad states are provided the button will be added in all states.
         * The button is added to the action sheet before the Log Out button (if exists).

         * @param {sap.m.Button} oButton
         *   The button to be added. The button should have an icon, text, tooltip and a press callback
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState1]
         *   A launchpad state in which to add the button.
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState2]
         *   A launchpad state in which to add the button.
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState3]
         *   A launchpad state in which to add the button.

         * @since 1.26
         */
        this.addOptionsActionSheetButton = _addOptionsActionSheetButton;

        /**
         * Removes a button from the action sheet which opens when clicking the 'options' button, in the given launchpad states
         * (@see sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState).
         * If no launchpad states are provided the button is removed from all states.
         * You can only remove buttons that were added to the action sheet using @see sap.ushell.renderers.fiori2.RendererExtensions.addOptionsActionSheetButton
         *
         * @param {sap.m.Button} oButton
         *   The button to be removed.
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState1]
         *   A launchpad state from which to remove the button.
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState2]
         *   A launchpad state from which to remove the button.
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState3]
         *   A launchpad state from which to remove the button.

         * @since 1.26
         */
        this.removeOptionsActionSheetButton = _removeOptionsActionSheetButton;

        /**
         * Displays a footer at the bottom of the Fiori launchpad page. The footer is added to all launchpad states.

         * @param {sap.m.IBar} oFooter
         *   The footer to set.

         * @since 1.26
         */
        this.setFooter = _setFooter;

        /**
         * Removes the footer that was set using @see sap.ushell.renderers.fiori2.RendererExtensions.setFooter from the
         * Fiori launchpad page. The footer is removed from all launchpad states.
         * Note that once removed, the footer might be destroyed and will not be available for reuse.

         * @since 1.26
         */
        this.removeFooter = _removeFooter;

        /**
         * Add an entry to the User Preferences dialog box.
         * @param {object} oConfig - defines the configuration settings for the added entry.
         *  [entryHelpID] : {String} - the ID of the object.
         *  title : {String} - the title of the entry to be presented in the list of User Preferences. We recommend to use the string from the translation bundle.
         *  value : {String}/{function} - a string to be presented as the value of the entry OR a function to be called which returns a {jQuery.Deferred.promise} object.
         *  [onSave] : {function} - a function to be called which returns a {jQuery.Deferred.promise} object when clicking Save in the User Preferences dialog box. If an error occurs, pass the error message via the {jQuery.Deferred.promise} object. Errors are displayed in the log.
         *  [onCancel] : {function} - a function to be called that closes the User Preferences dialog box without saving any changes.
         *  content : {function} - a function to be called which returns a {jQuery.Deferred.promise} object which consists of a {sap.ui.core.Control} to be displayed in a follow-on dialog box.
         *
         * @since 1.27
         */
        this.addUserPreferencesEntry = _addUserPreferencesEntry;

        /**
         * Set the title in the Shell Header
         * @param {String} sTitle
         *  The text of the title to set
         *
         * @since 1.27
         */
        this.setHeaderTitle = _setHeaderTitle;

        /**
         * The launchpad states that can be passed as a parameter.
         * Values:
         * App - launchpad state when running a Fiori app
         * Catalog - launchpad state when the tile catalog is open
         * Home - launchpad state when the home page is open
         *
         * @since 1.26
         */
        this.LaunchpadState = {
            App: "app",
            Catalog: "catalog",
            Home: "home"
        };
    }

    /**
     * @class The RendererExtensions class which allows you to extend the fiori2 renderer
     * The following renderer lifecycle events are published:
     * rendererLoaded - is published when the renderer is loaded and indicates that the @see sap.ushell.renderers.fiori2.RendererExtensions
     * APIs are available.
     * appOpened - is published when a Fiori app is opened.
     * appClosed - is published when a Fiori app is closed.
     * All events are published in the following channel: sap.ushell.renderers.fiori2.Renderer
     * @example to subscribe to an event:
     * sap.ui.getCore().getEventBus().subscribe("sap.ushell.renderers.fiori2.Renderer", "rendererLoaded", function() {
     *      var headItem1 = new sap.ushell.ui.shell.ShellHeadItem({id : "button1", icon : sap.ui.core.IconPool.getIconURI("sys-help"), press: function() {alert("the button was pressed");}});
     *      sap.ushell.renderers.fiori2.RendererExtensions.addHeaderItem(headItem1,sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState.Home)
     * });
     * @since 1.26
     */
    sap.ushell.renderers.fiori2.RendererExtensions = new RendererExtensions();

}());

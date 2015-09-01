// Copyright (c) 2009-2014 SAP SE, All Rights Reserved

(function () {
    "use strict";
    /*global jQuery, sap, window */
    jQuery.sap.declare("sap.ushell.services.AppConfiguration");
    /**
     * AppConfiguration service.
     *
     * @private
     */
    function AppConfiguration() {
        var oMetadata = {},
            oCurrentApplication = null;


        /**
         * Returns the current application.
         * 
         * 
         * @returns {object}
         *   a copy of the metadata object
         *
         * @private
         */
        this.getCurrentAppliction = function (oApplication) {
            return oCurrentApplication;
        };
        /**
         * Returns the current metadata.
         * 
         * {
         *      title: {string}
         *      library: {string}
         *      version: {string}
         *      fullWidth: {boolean}
         * }  
         * 
         * @returns {object}
         *   a copy of the metadata object
         *
         * @private
         */
        this.getMetadata = function (oApplication) {
            if (!oApplication) {
                oApplication = oCurrentApplication;
            }

            if (oApplication) {
                var sKey = this.getApplicationUrl(oApplication);
                if (!(oMetadata.hasOwnProperty(sKey))) {
                    this.addMetadata(oApplication);
                }
                return oMetadata[sKey] || {};
            }
            return {};
        };

        /**
         * @private
         */
        this.setCurrentApplication = function (oApplication) {
            oCurrentApplication = oApplication;
        };

        /*
         * This methods adds buttons to the action sheet in the shell header.
         * it is meant to be used by applications that wants to add their own settings button to the shell header.
         * 
         * @param {array} array of sap.m.Button controls
         * */
        this.addApplicationSettingsButtons = function (aButtons) {
            var oModel = sap.ui.getCore().byId('shell') && sap.ui.getCore().byId('shell').getModel(),
                i,
                j,
                oCurrentButton,
                aButtonsInModel,
                aButtonsInModelShellActions;
            if (!oModel) {
                jQuery.sap.log.error("shell does not exist");
                return;
            }
            aButtonsInModelShellActions = oModel.getProperty('/currentState/shellActions');
            aButtonsInModel = oModel.getProperty('/currentState/actions');
            aButtonsInModel.length = 0;

            for (i = 0; i < aButtons.length; i = i + 1) {
                oCurrentButton = aButtons[i];
                oCurrentButton.setIcon(oCurrentButton.getIcon() || sap.ui.core.IconPool.getIconURI('action-settings'));
                aButtonsInModel.push(oCurrentButton.getId());
            }

            for (j = 0; j < aButtonsInModelShellActions.length; j = j + 1) {
                aButtonsInModel.push(aButtonsInModelShellActions[j]);
            }

            oModel.setProperty('/currentState/actions', aButtonsInModel);
        };

        /**
         * Sets the title of the browser tabSets the title of the browser tab.
         *
         * @param {string} sTitle
         */
        this.setWindowTitle = function (sTitle) {
            window.document.title = sTitle;
        };

        /**
         * Sets the icons of the browser.
         *
         * @param oIconsProperties
         * An object holding icon URLs
         */
        this.setIcons = function (oIconsProperties) {
            jQuery.sap.setIcons(oIconsProperties);
        };

        /**
         * Get a settings control to display about dialog and system infos.
         *
         * @returns {sap.ushell.ui.footerbar.SettingsButton}
         *      a settings control which can be embedded where ever its needed
         * @private
         */
        this.getSettingsControl = function () {
            jQuery.sap.require("sap.ushell.ui.footerbar.SettingsButton");
            return new sap.ushell.ui.footerbar.SettingsButton();
        };

        /**
         * @private
         */
        this.getApplicationName = function (oApplication) {
            /*jslint regexp: true */
            var aMatches,
                sAdditionalInformation = (oApplication && oApplication.additionalInformation) || null;

            if (sAdditionalInformation) {
                // SAPUI5.Component=<fully-qualified-component-name>
                aMatches = /^SAPUI5\.Component=(.+)$/i.exec(sAdditionalInformation);
                if (aMatches) {
                    // determine namespace, view name, and view type
                    return aMatches[1];
                }
            }
            return null;
        };
        /**
         * @private
         */
        this.getApplicationUrl = function (oApplication) {
            var sUrl = (oApplication && oApplication.url) || null,
                iIndex;

            if (sUrl) {
                iIndex = sUrl.indexOf("?");
                if (iIndex >= 0) {
                    // pass GET parameters of URL via component data
                    // as member startupParameters  ( to allow blending with other oComponentData usage, e.g.
                    // extensibility use case
                    sUrl = sUrl.slice(0, iIndex);
                }
                if (sUrl.slice(-1) !== '/') {
                    sUrl += '/'; // ensure URL ends with a slash
                }
            }
            return sUrl;
        };
        /**
         * @private
         */
        this.addMetadata = function (oApplication) {
            try {
                var sComponentName = this.getApplicationName(oApplication),
                    sUrl = this.getApplicationUrl(oApplication),
                    sComponentFile,
                    oComponent,
                    oResourceBundle,
                    sResourceUrl,
                    oLocalMetadata,
                    oConfig,
                    iIndex,
                    oProperty,
                    oValue,
                    aProperties = [ "fullWidth",
                                    "title",
                                    "icon",
                                    "favIcon",
                                    "homeScreenIconPhone",
                                    "homeScreenIconPhone@2",
                                    "homeScreenIconTablet",
                                    "homeScreenIconTablet@2",
                                    "startupImage320x460",
                                    "startupImage640x920",
                                    "startupImage640x1096",
                                    "startupImage768x1004",
                                    "startupImage748x1024",
                                    "startupImage1536x2008",
                                    "startupImage1496x2048"
                                ],
                    potentiallyRelativeUrls,
                    sComponentUrl,
                    isUrlRelative;


                if (sUrl && !(oMetadata.hasOwnProperty(sUrl))) {
                    oMetadata[sUrl] = {};
                    oComponent = sap.ui.component.load({ url : sUrl, name : sComponentName });
                    oLocalMetadata = oComponent.getMetadata();
                    if (oLocalMetadata) {
                        oConfig = oLocalMetadata && oLocalMetadata.getConfig();
                        if (oConfig) {
                            sResourceUrl = oConfig.resourceBundle || "";
                            if (sResourceUrl) {
                                if (sResourceUrl.slice(0, 1) !== '/') {
                                    sResourceUrl = sUrl + sResourceUrl;
                                }
                                oResourceBundle = jQuery.sap.resources({
                                    url: sResourceUrl,
                                    locale : sap.ui.getCore().getConfiguration().getLanguage()
                                });
                            }
                        }

                        for (iIndex = 0; iIndex < aProperties.length; iIndex = iIndex + 1) {
                            oValue = undefined;
                            oProperty = aProperties[iIndex];
                            if (oResourceBundle && oConfig.hasOwnProperty(oProperty + "Resource")) {
                                oValue = oResourceBundle.getText(oConfig[oProperty + "Resource"]);
                            } else if (oConfig.hasOwnProperty(oProperty)) {
                                oValue = oConfig[oProperty];
                            }
                            oMetadata[sUrl][oProperty] = oValue;
                        }
                    }
                    oMetadata[sUrl].version = oLocalMetadata.getVersion();
                    oMetadata[sUrl].libraryName = oLocalMetadata.getLibraryName();
                    /*
                     * Special behavior for relative URLs:
                     * Relative URLs are considered relative to the folder containing the Component.js,
                     * which requires adjustments here. Otherwise the browser would interpret them as
                     * relative to the location of the HTML file, which might be different and also
                     * hard to guess for app developers.
                     */
                    potentiallyRelativeUrls = [
                        "favIcon",
                        "homeScreenIconPhone",
                        "homeScreenIconPhone@2",
                        "homeScreenIconTablet",
                        "homeScreenIconTablet@2",
                        "startupImage320x460",
                        "startupImage640x920",
                        "startupImage640x1096",
                        "startupImage768x1004",
                        "startupImage748x1024",
                        "startupImage1536x2008",
                        "startupImage1496x2048"
                    ];

                    sComponentUrl = (sUrl && sUrl[sUrl.length - 1] === '/') ?
                            sUrl.substring(0, sUrl.length - 1) : sUrl;

                    isUrlRelative = function (sUrl) {
                        /*jslint regexp : true*/
                        if (sUrl.match(/^https?:\/\/.*/)) {
                            return false;
                        }
                        return sUrl && sUrl[0] !== '/';
                    };

                    potentiallyRelativeUrls.forEach(function (sPropName) {
                        var sOrigValue = oMetadata[sUrl][sPropName],
                            sFinalValue = null;
                        // Some URL properties might not be defined.
                        if (sOrigValue) {
                            sFinalValue = isUrlRelative(sOrigValue) ?
                                    sComponentUrl + "/" + sOrigValue : sOrigValue;
                        }
                        oMetadata[sUrl][sPropName] = sFinalValue;
                    });
                }
            } catch (err) {
                jQuery.sap.log.warning("Application configuration could not be parsed");
            }
        };

    } // Metadata

    /**
     * The Unified Shell App configuration service as a singleton object. 
     * 
     * @class The unified shell's AppConfiguration service.
     * 
     * @name sap.ushell.services.AppConfiguration
     * @since 1.15.0
     * @private
     */
    sap.ushell.services.AppConfiguration = new AppConfiguration();

}());

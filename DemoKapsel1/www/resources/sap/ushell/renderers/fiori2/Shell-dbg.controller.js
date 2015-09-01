// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
(function () {
    "use strict";
    /*global jQuery, sap, window, f2p, document, setTimeout, hasher*/

    jQuery.sap.require("sap.ui.core.IconPool");
    setTimeout(function () {
        jQuery.sap.require("sap.ushell.renderers.fiori2.launchpad.DashboardManager");
    }, 10);

    /* dont delay these cause they are needed for direct bookmarks */
    jQuery.sap.require("sap.ushell.services.Message");
    jQuery.sap.require("sap.ushell.services.ShellNavigation");
    jQuery.sap.require("sap.ushell.services.AppConfiguration");
    jQuery.sap.require("sap.ushell.renderers.fiori2.History");
    jQuery.sap.require("sap.ushell.ui.launchpad.LoadingDialog");
    jQuery.sap.require("sap.ushell.renderers.fiori2.AccessKeysHandler");
    // create global model and add some demo data
    var enableHashChange = true,
        isDesktop = sap.ui.Device.system.desktop,
        oUserRecentsService,
        bUserImageAlreadyLoaded,
        shellHeaderPublicItems,
        oModel = new sap.ui.model.json.JSONModel({
            groups : [],
            animationRendered : false,
            searchAvailable: false,
            title: "", // no default value for title
            tagFiltering: true,
            catalogSelection: true,
            searchFiltering: true,
            tileActionModeEnabled: false,
            tileActionModeActive: false,
            enableCreateGroupInCatalog: true,
            isInDrag: false,
            rtl: false,
            showEndUserFeedback: false,
            personalization: true,
            editTitle: false,
            searchTerm: "",
            tagList : [],
            selectedTags : [],
            isPhoneWidth: false,
            states : {
                "home" : {
                    "stateName" : "home",
                    "showCurtain" : false,
                    "headerHiding" : false,
                    "headerVisible" : true,
                    "showCatalog" : false,
                    "showPane" : false,
                    "headItems" : ["configBtn"],
                    "headEndItems" : ["sf"],
                    "search" : "",
                    "paneContent" : [],
                    "actions" : ["hideGroupsBtn", "ContactSupportBtn", "EndUserFeedbackBtn", "userPreferencesButton", "logoutBtn"],
                    "floatingActions" : [],
                    "footer" : []
                },
                "app" : {
                    "stateName" : "app",
                    "showCurtain" : false,
                    "headerHiding" : !isDesktop,
                    "headerVisible" : true,
                    "headEndItems" : ["sf"],
                    "showCatalog" : false,
                    "showPane" : false,
                    "search" : "",
                    "headItems" : ["homeBtn"],
                    "actions" : ["ContactSupportBtn", "EndUserFeedbackBtn", "aboutBtn", "userPreferencesButton", "logoutBtn"],
                    "shellActions": ["ContactSupportBtn", "EndUserFeedbackBtn", "aboutBtn", "userPreferencesButton", "logoutBtn"], //when opening an app, take the original actions from here
                    "floatingActions" : [],
                    "footer" : []
                },
                "minimal" : {
                    "stateName" : "minimal",
                    "showCurtain" : false,
                    "headerHiding" : false,
                    "headerVisible" : true,
                    "headEndItems" : [],
                    "showCatalog" : false,
                    "showPane" : false,
                    "headItems" : [],
                    "actions" : ["aboutBtn", "ContactSupportBtn", "EndUserFeedbackBtn", "userPreferencesButton", "logoutBtn"],
                    "shellActions": ["aboutBtn", "ContactSupportBtn", "EndUserFeedbackBtn", "userPreferencesButton", "logoutBtn"], //when opening an app, take the original actions from here
                    "floatingActions" : [],
                    "footer" : []
                },
                "standalone" : {
                    "stateName" : "standalone",
                    "showCurtain" : false,
                    "headerHiding" : !isDesktop,
                    "headerVisible" : true,
                    "headEndItems" : [],
                    "showCatalog" : false,
                    "showPane" : false,
                    "headItems" : [],
                    "actions" : ["aboutBtn", "ContactSupportBtn", "EndUserFeedbackBtn"],
                    "shellActions": ["aboutBtn", "ContactSupportBtn", "EndUserFeedbackBtn"], //when opening an app, take the original actions from here
                    "floatingActions" : [],
                    "footer" : []
                },
                "embedded" : {
                    "stateName" : "embedded",
                    "showCurtain" : false,
                    "headerHiding" : !isDesktop,
                    "headerVisible" : true,
                    "headEndItems" : ["standardActionsBtn"],
                    "showCatalog" : false,
                    "showPane" : false,
                    "headItems" : [],
                    "actions" : ["aboutBtn", "ContactSupportBtn", "EndUserFeedbackBtn"],
                    "shellActions": ["aboutBtn", "ContactSupportBtn", "EndUserFeedbackBtn"], //when opening an app, take the original actions from here
                    "floatingActions" : [],
                    "footer" : []
                },
                "headerless" : {
                    "stateName" : "headerless",
                    "showCurtain" : false,
                    "headerHiding" : !isDesktop,
                    "headerVisible" : false,
                    "headEndItems" : [],
                    "showCatalog" : false,
                    "showPane" : false,
                    "headItems" : [],
                    "actions" : [],
                    "shellActions": [],//when opening an app, take the original actions from here
                    "floatingActions" : [],
                    "footer" : []
                },
                "catalog" : {
                    "stateName" : "catalog",
                    "showCurtain" : false,
                    "headerHiding" : !isDesktop,
                    "headerVisible" : true,
                    "headEndItems" : ["sf"],
                    "showCatalog" : true,
                    "showPane" : false,
                    "search" : "",
                    "headItems" : ["homeBtn"],
                    "actions" : ["ContactSupportBtn", "EndUserFeedbackBtn", "userPreferencesButton", "logoutBtn"],
                    "floatingActions" : [],
                    "footer" : []
                }
            },
            userPreferences : {
                entries : []
            }
        }),

        oConfig = {},
    //allowed application state list that are allowed to be configured by oConfig.appState property
        allowedAppStates = ['minimal', 'app', 'standalone', 'embedded', 'headerless'];
    oModel.setDefaultBindingMode("OneWay");
    oModel.setSizeLimit(10000); // override default of 100 UI elements on list bindings

    /**
     * @name sap.ushell.renderers.fiori2.Shell
     * @extends sap.ui.core.mvc.Controller
     * @public
     */
    sap.ui.controller("sap.ushell.renderers.fiori2.Shell", {

        oCoreExtLoadingDeferred : undefined,
        
        catalogPageId : "catalogPage",

        /**
         * SAPUI5 lifecycle hook.
         * @public
         */
        onInit: function () {
            //structure that is being use to implement the RendererExtensions API
            shellHeaderPublicItems = {
                home: {headItems: [], headEndItems: [], actions: []},
                app: {headItems: [], headEndItems: [], actions: []},
                catalog: {headItems: [], headEndItems: [], actions: []},
                allStates: {footer : null}
            };

            this.oEndUserFeedbackConfiguration = {
                showAnonymous: true,
                showLegalAgreement : true,
                showCustomUIContent: true,
                feedbackDialogTitle: true,
                textAreaPlaceholder: true,
                customUIContent: undefined
            };


            // Add global model to view
            this.getView().setModel(oModel);

            // Bind the translation model to this view
            this.getView().setModel(sap.ushell.resources.i18nModel, "i18n");

            sap.ui.getCore().getEventBus().subscribe("externalSearch", this.externalSearchTriggered, this);
            sap.ui.getCore().getEventBus().subscribe("showCatalog", this.showCatalog, this);
            sap.ui.getCore().getEventBus().subscribe("openApp", this.openApp, this);
            sap.ui.getCore().getEventBus().subscribe("launchpad", "contentRendered", this.loadCoreExt, this);
            sap.ui.getCore().getEventBus().subscribe("launchpad", "contentRendered", this.loadUserImage, this);
            sap.ui.getCore().getEventBus().subscribe("sap.ushell.renderers.fiori2.Renderer", "appOpened", this.loadUserImage, this);

            // handling of configuration should is done before the code block below otherwise the doHashChange is
            // triggered before the personalization flag is disabled (URL may contain hash value which invokes navigation)
            this._setConfigurationToModel();

            oUserRecentsService = sap.ushell.Container.getService("UserRecents");
            this.history = new sap.ushell.renderers.fiori2.History();
            this.oNavContainer = sap.ui.getCore().byId("navContainer");
            this.oLoadingDialog = sap.ui.getCore().byId("loadingDialog");
            this.toggleRtlMode(sap.ui.getCore().getConfiguration().getRTL());
            this.oShellNavigation = sap.ushell.Container.getService("ShellNavigation");
            // must be after event registration (for synchronous navtarget resolver calls)
            this.oShellNavigation.init(jQuery.proxy(this.doHashChange, this));
            this.oShellNavigation.registerNavigationFilter(jQuery.proxy(this.handleDataLoss, this));
            sap.ushell.Container.getService("Message").init(jQuery.proxy(this.doShowMessage, this));
            sap.ushell.Container.setLogonFrameProvider(this._getLogonFrameProvider());
            this.bContactSupportEnabled = sap.ushell.Container.getService("SupportTicket").isEnabled();

            window.onbeforeunload = function () {
                if (sap.ushell.Container && sap.ushell.Container.getDirtyFlag()) {
                    if (!sap.ushell.resources.browserI18n) {
                        sap.ushell.resources.browserI18n = sap.ushell.resources.getTranslationModel(window.navigator.language).getResourceBundle();
                    }
                    return sap.ushell.resources.browserI18n.getText("dataLossExternalMessage");
                }
            };
            try {
                sap.ushell.Container.getService("EndUserFeedback").isEnabled().done(function () {
                    oModel.setProperty('/showEndUserFeedback', true);
                });
            } catch (e) {
                jQuery.sap.log.error("EndUserFeedback adapter is not found", e.message || e);
            }
            if (this.bContactSupportEnabled) {
                sap.ushell.UserActivityLog.activate();
            }

            var mediaQ = window.matchMedia("(min-width: 800px)");
            var handleMedia = function (mq) {
                oModel.setProperty("/isPhoneWidth", !mq.matches);
            };
            if (mediaQ.addListener) {
                mediaQ.addListener(handleMedia);
                handleMedia(mediaQ);
            }
        },

        _setConfigurationToModel : function () {
            var oViewData = this.getView().getViewData(),
                stateEntryKey;
            if (oViewData) {
                oConfig = oViewData.config || {};
            }
            if (oConfig) {
                if (oConfig.states) {
                    var curStates = oModel.getProperty('/states');
                    for (stateEntryKey in oConfig.states) {
                        if (oConfig.states.hasOwnProperty(stateEntryKey)) {
                            curStates[stateEntryKey] = oConfig.states[stateEntryKey];
                        }
                    }
                    oModel.setProperty('/states', curStates);
                }

                if (oConfig.appState === "headerless") {
                    // when appState is headerless we also remove the header in home state and disable the personalization.
                    // this is needed in case headerless mode will be used to navigate to the dashboard and not directly to an application.
                    // As 'home' is the official state for the dash board, we change the header visibility property of this state
                    oModel.setProperty("/personalization", false);
                    oModel.setProperty("/states/home/headerVisible", false);
                } else if (oConfig.enablePersonalization !== undefined) {
                    oModel.setProperty("/personalization", oConfig.enablePersonalization);
                }
                //EU Feedback flexable configuration
                if (oConfig.changeEndUserFeedbackTitle !== undefined) {
                    this.oEndUserFeedbackConfiguration.feedbackDialogTitle = oConfig.changeEndUserFeedbackTitle;
                }

                if (oConfig.changeEndUserFeedbackPlaceholder !== undefined) {
                    this.oEndUserFeedbackConfiguration.textAreaPlaceholder = oConfig.changeEndUserFeedbackPlaceholder;
                }

                if (oConfig.showEndUserFeedbackAnonymousCheckbox !== undefined) {
                    this.oEndUserFeedbackConfiguration.showAnonymous = oConfig.showEndUserFeedbackAnonymousCheckbox;
                }

                if (oConfig.showEndUserFeedbackLegalAgreement !== undefined) {
                    this.oEndUserFeedbackConfiguration.showLegalAgreement = oConfig.showEndUserFeedbackLegalAgreement;
                }
                //EU Feedback configuration end.
                if (oConfig.enableTagFiltering !== undefined) {
                    oModel.setProperty("/tagFiltering", oConfig.enableTagFiltering);
                }
                if (oConfig.enableSetTheme !== undefined) {
                    oModel.setProperty("/setTheme", oConfig.enableSetTheme);
                }
                if (oConfig.enableCatalogSelection !== undefined) {
                    oModel.setProperty("/catalogSelection", oConfig.enableCatalogSelection);
                }
                if (oConfig.enableSearchFiltering !== undefined) {
                    oModel.setProperty("/searchFiltering", oConfig.enableSearchFiltering);
                }
                if (oConfig.enableTilesOpacity !== undefined) {
                    oModel.setProperty("/tilesOpacity", oConfig.enableTilesOpacity);
                }
                if (oConfig.enableCreateGroupInCatalog !== undefined) {
                    oModel.setProperty("/enableCreateGroupInCatalog", oConfig.enableCreateGroupInCatalog);
                }
                if (oConfig.enableDragIndicator !== undefined) {
                    oModel.setProperty("/enableDragIndicator", oConfig.enableDragIndicator);
                }
                var tileActionModeEnabled = false;
                if (oConfig.enableActionModeMenuButton !== undefined) {
                    oModel.setProperty("/actionModeMenuButtonEnabled", oConfig.enableActionModeMenuButton);
                    tileActionModeEnabled = oConfig.enableActionModeMenuButton;
                }
                if (oConfig.enableActionModeFloatingButton !== undefined) {
                    oModel.setProperty("/actionModeFloatingButtonEnabled", oConfig.enableActionModeFloatingButton);
                    tileActionModeEnabled = tileActionModeEnabled || oConfig.enableActionModeFloatingButton;
                }
                oModel.setProperty("/tileActionModeEnabled", tileActionModeEnabled);
                if (oConfig.enableTileActionsIcon !== undefined) {
                    //Available only for desktop
                    oModel.setProperty("/tileActionsIconEnabled", sap.ui.Device.system.desktop ? oConfig.enableTileActionsIcon : false);
                }
                if (oConfig.enableHideGroups !== undefined) {
                    oModel.setProperty("/enableHideGroups", oConfig.enableHideGroups);
                }
                // check for title
                if (oConfig.title) {
                    oModel.setProperty("/title", oConfig.title);
                }

                // xRay enablement configuration 
                oModel.setProperty("/enableHelp", !!oConfig.enableHelp);
            }
        },
        /**
         * This method will be used by the Container service in order to create, show and destroy a Dialog control with an
         * inner iframe. The iframe will be used for rare scenarios in which additional authentication is required. This is
         * mainly related to SAML 2.0 flows.
         * The api sequence will be managed by UI2 services.
         * @returns {{create: Function, show: Function, destroy: Function}}
         * @private
         */
        _getLogonFrameProvider: function () {
            var oView = this.getView();

            return {
                /* @returns a DOM reference to a newly created iFrame. */
                create: function () {
                    return oView.createIFrameDialog();
                },

                /* make the current iFrame visible to user */
                show: function () {
                    oView.showIFrameDialog();
                },

                /* hide, close, and destroy the current iFrame */
                destroy: function () {
                    oView.destroyIFrameDialog();
                }
            };
        },

        onExit: function () {
            sap.ui.getCore().getEventBus().unsubscribe("externalSearch", this.externalSearchTriggered, this);
            sap.ui.getCore().getEventBus().unsubscribe("showCatalog", this.showCatalog, this);
            sap.ui.getCore().getEventBus().unsubscribe("openApp", this.openApp, this);
            this.oShellNavigation.hashChanger.destroy();
            this.getView().aDanglingControls.forEach(function (oControl) {
                if (oControl.destroyContent) {
                    oControl.destroyContent();
                }
                oControl.destroy();
            });
            this.getView().oDashboardManager.destroy();
            sap.ushell.UserActivityLog.deactivate();
        },

        // temporary, should not be exposed
        getModel: function () {
            return oModel;
        },

        showCatalog : function (sChannelId, sEventId, oData) {
            if (!this.isCatalogExist()) {
                var oCatalog = sap.ui.view({
                    id : this.catalogPageId,
                    viewName : "sap.ushell.renderers.fiori2.launchpad.catalog.Catalog",
                    viewData : {},
                    type : sap.ui.core.mvc.ViewType.JS
                });
                this.oNavContainer.addPage(oCatalog);
            }
            this.switchViewState("catalog");
            this.oNavContainer.to(this.catalogPageId, this.getAnimationType());
            this.setAppIcons({title: sap.ushell.resources.i18n.getText("tile_catalog")});
            sap.ushell.services.AppConfiguration.setCurrentApplication(null);
            this.oLoadingDialog.closeLoadingScreen();
            sap.ui.getCore().getEventBus().publish("showCatalogEvent", oData);

            //Add access keys
            // reset selections
            jQuery(document).off('keydown.dashboard');
            jQuery(document).off('keydown.catalog');
            // add catalog events
            jQuery(document).on('keydown.catalog', sap.ushell.renderers.fiori2.AccessKeysHandler.catalogKeydownHandler);
        },

        isCatalogExist : function () {
            return (sap.ui.getCore().byId(this.catalogPageId)) ? true : false;
        },

        getAnimationType : function () {
            return sap.ui.Device.os.android ? "show" : "slide";
        },

        onCurtainClose : function (oEvent) {
            jQuery.sap.log.warning("Closing Curtain", oEvent);


        },

        /**
         * Navigation Filter function registered with ShellNavigation service.
         * Triggered on each navigation.
         * Aborts navigation if there are unsaved data inside app(getDirtyFlag returns true).
         *
         * @private
         */
        handleDataLoss: function (newHash, oldHash) {
            if (sap.ushell.Container.getDirtyFlag()) {
                if (!sap.ushell.resources.browserI18n) {
                    sap.ushell.resources.browserI18n = sap.ushell.resources.getTranslationModel(window.navigator.language).getResourceBundle();
                }
                if (confirm(sap.ushell.resources.browserI18n.getText("dataLossInternalMessage"))) {
                    sap.ushell.Container.setDirtyFlag(false);
                    return this.oShellNavigation.NavigationFilterStatus.Continue;
                } else {
                    return this.oShellNavigation.NavigationFilterStatus.Abandon;
                }
            }

            return this.oShellNavigation.NavigationFilterStatus.Continue;
        },
        /**
         * Callback registered with Message service. Triggered on message show request.
         *
         * @private
         */
        doShowMessage: function (iType, sMessage, oParameters) {
            jQuery.sap.require("sap.m.MessageToast");
            jQuery.sap.require("sap.m.MessageBox");
            if (iType === sap.ushell.services.Message.Type.ERROR) {
                //check that SupportTicket is enabled and verify that we are not in a flow in which Support ticket creation is failing,
                // if this is the case we don't want to show the user the contact support button again
                if (sap.ushell.Container.getService("SupportTicket").isEnabled() && sMessage !== sap.ushell.resources.i18n.getText("supportTicketCreationFailed")) {
                    try {
                        jQuery.sap.require("sap.ushell.ui.launchpad.EmbeddedSupportErrorMessage");
                        var errorMsg = new sap.ushell.ui.launchpad.EmbeddedSupportErrorMessage("EmbeddedSupportErrorMessage", {
                            title: oParameters.title || sap.ushell.resources.i18n.getText("error"),
                            content: new sap.m.Text({
                                text: sMessage
                            })
                        });
                        errorMsg.open();
                    } catch (e) {
                        sap.m.MessageBox.show(sMessage, sap.m.MessageBox.Icon.ERROR,
                            oParameters.title || sap.ushell.resources.i18n.getText("error"));
                    }
                } else {
                    sap.m.MessageBox.show(sMessage, sap.m.MessageBox.Icon.ERROR,
                        oParameters.title || sap.ushell.resources.i18n.getText("error"));
                }
            } else if (iType === sap.ushell.services.Message.Type.CONFIRM) {
                if (oParameters.actions) {
                    sap.m.MessageBox.show(sMessage, sap.m.MessageBox.Icon.QUESTION, oParameters.title, oParameters.actions, oParameters.callback);
                } else {
                    sap.m.MessageBox.confirm(sMessage, oParameters.callback, oParameters.title);
                }
            } else {
                sap.m.MessageToast.show(sMessage, { duration: oParameters.duration || 3000 });
            }
        },

        /**
         * Callback registered with NavService. Triggered on navigation requests
         *
         * Set application container based on information in URL hash.
         * @public
         */
        doHashChange : function (sShellHash, sAppPart, sOldShellHash, sOldAppPart, oParseError) {
            if (!enableHashChange) {
                enableHashChange = true;
                return;
            }

            sShellHash = this.fixShellHash(sShellHash);

            //Need to save this value because next string can change it.
            var originalHistoryLength = this.history.getHistoryLength();

            // check if the hash could be parsed (see CSN 0001102839 2014)
            if (oParseError) {
                this.hashChangeFailure(originalHistoryLength, oParseError.message, null, "sap.ushell.renderers.fiori2.Shell.controller");
                return;
            }

            this.history.hashChange(sShellHash, sOldShellHash);

            var oURLParsing = sap.ushell.Container.getService("URLParsing"),
                oShellHash = oURLParsing.parseShellHash(sShellHash),
                oCurrentState = oModel.getProperty("/currentState"),
                bInCatalog = oCurrentState && oCurrentState.stateName === "catalog",
                bOpenApp = oShellHash && oShellHash.action !== sap.ushell.renderers.fiori2.Navigation.CATALOG.ACTION;
            if (!bInCatalog || bOpenApp) {
                this.oLoadingDialog.setText("");
                this.oLoadingDialog.openLoadingScreen();
            }


            if (oShellHash && oShellHash.contextRaw && oShellHash.contextRaw === "navResCtx") {
                var oApplication = {};
                oApplication.additionalInformation = oShellHash.params.additionalInformation[0];
                oApplication.url = oShellHash.params.url[0];
                oApplication.applicationType = oShellHash.params.applicationType[0];
                this.openSomething(sShellHash, sAppPart, sOldShellHash, sOldAppPart, oApplication);
            } else {
                sap.ushell.Container.getService("NavTargetResolution")
                    .resolveHashFragment(sShellHash)
                    .done(jQuery.proxy(this.openSomething, this, sShellHash, sAppPart, sOldShellHash, sOldAppPart))
                    .fail(jQuery.proxy(function (sMsg) {
                        this.hashChangeFailure(originalHistoryLength, "Failed to resolve navigation target: " + sShellHash, sMsg, "sap.ushell.renderers.fiori2.Shell.controller");
                    }, this));
            }
        },

        hashChangeFailure : function (iHistoryLength, sMessage, sDetails, sComponent) {
            this.reportError(sMessage, sDetails, sComponent);
            this.oLoadingDialog.closeLoadingScreen();
            //use timeout to avoid "MessageService not initialized.: error
            this.delayedMessageError(sap.ushell.resources.i18n.getText("fail_to_start_app_try_later"));

            if (iHistoryLength === 0) {
                // if started with an illegal shell hash (deep link), we just remove the hash
                hasher.setHash("");
            } else {
                //navigate to the previous URL since in this state the hash that has failed to load is in the URL
                this.historyBack();
            }
        },

        reportError : function (sMessage, sDetails, sComponent) {
            jQuery.sap.log.error(sMessage, sDetails, sComponent);
        },

        delayedMessageError : function (sMsg) {
            setTimeout(function () {
                sap.ushell.Container.getService("Message").error(sMsg);
            }, 0);
        },

        fixShellHash : function (sShellHash) {
            if (!sShellHash) {
                sShellHash = '#';
            } else if (sShellHash.charAt(0) !== '#') {
                sShellHash = '#' + sShellHash;
            }
            return sShellHash;
        },

        //navigate to the previous URL since in this state the hash that has failed to load is in the URL
        historyBack : function () {
            window.history.back(1);
        },

        initiateApplication : function (oApplication, oApplicationInformation) {
            oApplicationInformation.oMetadata = sap.ushell.services.AppConfiguration.getMetadata(oApplication);
            sap.ui.getCore().getEventBus().publish("openApp", oApplicationInformation);
        },

        requireCoreExt : function () {
            try {
                jQuery.sap.require('sap.fiori.core-ext');
            } catch (error) {
                jQuery.sap.log.warning("failed to load sap.fiori.core-ext!");
            }
        },

        /**
         *  open either an app or the dashboard
         * @public
         */
        openSomething : function (sShellHash, sAppPart, sOldShellHash, sOldAppPart, oApplication) {
            var oApplicationInformation,
                that = this;

            if (!this.oNavContainer.getParent()) {
                sap.ui.getCore().byId("shell").addContent(this.oNavContainer);
            }

            if (oApplication) {
                // application opened
                try {
                    oApplicationInformation = sap.ushell.Container.getService("URLParsing")
                        .parseShellHash(sShellHash);
                } catch (e) {
                    // this happens when trying to parse hashes from fiori wave one
                    oApplicationInformation = undefined;
                }

                if (oApplicationInformation === undefined) {
                    // This will happen, when a custom app is opened, like Wikipedia
                    jQuery.sap.log.warning("Could not parse shell hash: " + sShellHash);
                    oApplicationInformation = {};
                }
                oApplicationInformation.sShellHash = sShellHash;
                oApplicationInformation.sAppPart = sAppPart;
                oApplicationInformation.sOldShellHash = sOldShellHash;
                oApplicationInformation.sOldAppPart = sOldAppPart;
                oApplicationInformation.oApplication = oApplication;

                if (oApplication.applicationType === sap.ushell.renderers.fiori2.Navigation.CATALOG.ID) {
                    if (oModel.getProperty("/personalization")) {
                        sap.ui.getCore().getEventBus()
                            .publish("showCatalog", oApplicationInformation);
                    } else {
                        hasher.setHash("");
                    }
                } else {
                    // oCoreExtLoadingDeferred is resolved when core-ext finished being loaded by the shell (function loadCoreExt).
                    // If oCoreExtLoadingDeferred is undefined (e.g. when launching a direct URL for an application) 
                    // or if oCoreExtLoadingDeferred is rejected, then core.ext is loaded using jQuery.sap.require using function requireCoreExt
                    if (this.oCoreExtLoadingDeferred !== undefined) {
                        this.oCoreExtLoadingDeferred.promise().fail(function () {
                            jQuery.sap.log.warning("failed to load core-ext by web worker, performing require");
                            that.requireCoreExt();
                        }).always(function () {
                            that.initiateApplication(oApplication, oApplicationInformation);
                        });
                    } else {
                        this.requireCoreExt();
                        that.initiateApplication(oApplication, oApplicationInformation);
                    }
                }
            } else {
                this.openDashboard();
            }
        },

        /**
         *  opens the dashboard
         * @public
         */
        openDashboard : function () {
            var openedFromCatalog = oModel.getProperty("/currentState") && oModel.getProperty("/currentState").stateName === "catalog";
            this.switchViewState("home");
            this.oNavContainer.backToTop();
            sap.ushell.services.AppConfiguration.setCurrentApplication(null);
            this.setAppIcons(null);

            if (openedFromCatalog) {
                // if a new group was created in the catalog - then the bottom space needs to be recalculated
                sap.ushell.utils.addBottomSpace();
            }
            //Recheck tiles visibility on open dashboard. Tiles will be visible on this stage, if user pressed Back from application
            try {
                sap.ushell.utils.handleTilesVisibility();
            } catch (e) {
                //nothing has to be done
            }

            this.oLoadingDialog.closeLoadingScreen();

            //Add access keys
            // reset selections
            jQuery(document).off('keydown.dashboard');
            jQuery(document).off('keydown.catalog');
            // add dashboard events
            jQuery(document).on('keydown.dashboard', sap.ushell.renderers.fiori2.AccessKeysHandler.dashboardKeydownHandler);
            var oUnifiedShell = sap.ui.getCore().byId('shell');
            oUnifiedShell.focusOnConfigBtn();
            if (sap.ushell.Layout) {
                sap.ushell.Layout.reRenderGroupsLayout(null, true);
            }
        },

        /**
         *
         * @param sChannelId
         * @param sEventId
         * @param {Object} oApplication
         * @public
         */
        openApp : function (sChannelId, sEventId, oData) {
            jQuery.sap.log.warning("Triggering navigation to ", oData);
            var oApplication = oData.oApplication,
                oMetadata = oData.oMetadata || {},
                oInnerControl = null,
                appId = oData.sShellHash.replace(/\W/g, "-"),
                sAppTitle = oMetadata.title || "",
                sAppIcon = oMetadata.icon || null;

            if (oConfig && oConfig.enableTilesOpacity) {
                // Triggering the app usage mechanism to log this openApp action.
                // Using setTimeout in order not to delay the openApp action
                setTimeout(function () {
                    if (sap.ushell.Container) {
                        oUserRecentsService.addAppUsage(oData.sShellHash);
                    }
                }, 700);
            }

            if (oApplication) {
                try {
                    // WebGUI Application Integration
                    if (oApplication.applicationType === "NWBC" && !(oData && oData.contextRaw && oData.contextRaw === "navResCtx") &&
                        this.history.getHistoryLength() > 1 && this.history._history[this.history.getHistoryLength() - 2] !== oData.sShellHash) {
                        this.openNWBCApp(oApplication, oData);
                        return;
                    }
                    //standard Fiori application scenario
                    if (!this.oNavContainer.getPage("application" + appId) && !this.oNavContainer.getPage("shellPage" + appId)) {
                        oInnerControl = this.getWrappedApplication(oApplication, oData, oMetadata);
                        this.oNavContainer.addPage(oInnerControl);
                        sap.ushell.services.AppConfiguration.setCurrentApplication(oApplication);
                        this.oLoadingDialog.showAppInfo(sAppTitle, sAppIcon);
                    } else if (this.oNavContainer.getPage("application" + appId) || this.oNavContainer.getPage("shellPage" + appId)) {
                        oInnerControl = this.oNavContainer.getPage("application" + appId) || this.oNavContainer.getPage("shellPage" + appId);
                    }

                    this.setAppIcons(oMetadata);
                    if (oApplication.applicationType[0] === "NWBC" || oApplication.applicationType === "NWBC") {
                        this.switchViewState("minimal");
                        if (oData.contextRaw === "navResCtx") {
                            enableHashChange = false;
                            hasher.replaceHash(oData.params.original_intent[0]);
                        }
                    } else {
                        var appState = "app";
                        if (allowedAppStates.indexOf(oConfig.appState) >= 0) {
                            appState = oConfig.appState;
                        }
                        this.switchViewState(appState);
                    }

                    if (this.history.backwards && this.oNavContainer.getInitialPage() !== this.oNavContainer.getCurrentPage().getId()) {
                        this.oNavContainer.to(oInnerControl, "slideBack");
                    } else {
                        this.oNavContainer.to(oInnerControl, this.oNavContainer.getInitialPage() ? "slide" : "show");
                    }
                    //TODO: this should be done at some other place. we need this here if the user refresh the page while in an application
                    setTimeout(function () {
                        this.oLoadingDialog.closeLoadingScreen();
                    }.bind(this), 300);
                } catch (e) {
                    if (e.stack) {
                        jQuery.sap.log.error("Application initialization failed due to an Exception:\n" + e.stack);
                    }
                    this.restoreNavContainerAfterFailure();
                    this.hashChangeFailure(this.history.getHistoryLength(), e.name, e.message, sAppTitle);
                }
            }
            // close if we are on first position (no app has be launched before)
            if (this.history.getHistoryLength() < 1) {
                this.oLoadingDialog.closeLoadingScreen();
            }
        },

        restoreNavContainerAfterFailure: function () {
            // create a new navContainer because old one is in a irreparable state
            // save all other pages besides the page which causes the error
            this.oNavContainer.removePage(this.oNavContainer.getCurrentPage()).destroy();
            var aOldPages = this.oNavContainer.removeAllPages();

            this.oNavContainer.destroy();
            this.oNavContainer = this.getView().initNavContainer(this);

            jQuery.each(aOldPages, jQuery.proxy(function (i, v) {
                if (!this.oNavContainer.getPage(v.getId())) {
                    this.oNavContainer.addPage(v);
                }
                if (v.getId() === this.oNavContainer.getInitialPage()) {
                    v.removeStyleClass("sapMNavItemHidden"); // still there because of old navContainer
                }
            }, this));
        },

        getWrappedApplication: function (oApplication, oData, oMetadata) {
            var oAppContainer,
                oInnerControl,
                sAppTitle = oMetadata.title || "",
                appId = oData.sShellHash.replace(/\W/g, "-");
            jQuery.sap.require('sap.ushell.components.container.ApplicationContainer');
            oAppContainer = new sap.ushell.components.container.ApplicationContainer("application" + appId, oApplication);
            this.publishNavigationStateEvents(oAppContainer, oData);
            if (!oMetadata.fullWidth && oApplication.applicationType !== "NWBC") {
                jQuery.sap.require("sap.m.Shell");
                oInnerControl = new sap.m.Shell("shellPage" + appId, {
                    logo: sap.ui.resource('sap.ui.core', 'themes/base/img/1x1.gif'),
                    title : sAppTitle,
                    showLogout : false,
                    app : oAppContainer
                }).addStyleClass("sapUshellApplicationPage");
                if (!sAppTitle) {
                    oInnerControl.addStyleClass("sapUshellApplicationPageNoHdr");
                }
            } else {
                //temporary solution for setting the light background for applications
                oAppContainer.addStyleClass('sapMShellGlobalInnerBackground');
                oInnerControl = oAppContainer;
            }
            return oInnerControl;
        },

        openNWBCApp : function (oApplication, oData) {
            enableHashChange = false;
            window.history.back(1);
            //open the new FLP html with the resolved tiny url
            var tarShellHash = oData;
            var oShellHash = oData;
            var strShellH;
            oShellHash.params.additionalInformation = oApplication.additionalInformation;
            oShellHash.params.url = oApplication.url;
            oShellHash.params.applicationType = oApplication.applicationType;
            oShellHash.params.original_intent = oData.sShellHash;
            oShellHash.target = tarShellHash;
            tarShellHash.contextRaw = oShellHash.contextRaw = "navResCtx";
            var oShellH = sap.ushell.Container.getService("ShellNavigation").hrefForExternal(oShellHash, true);

            if (oShellH.skippedParams) {
                strShellH = oShellH.params.original_intent[0];
            } else {
                strShellH = oShellH.hash;
            }
            this.openAppNewWindow(strShellH);
            this.oLoadingDialog.closeLoadingScreen();
        },

        publishNavigationStateEvents : function (oAppContainer, oData) {
            //after the app container is rendered, publish an event to notify
            //that an app was opened
            var origAfterRendering = oAppContainer.onAfterRendering;
            oAppContainer.onAfterRendering = function () {
                if (origAfterRendering) {
                    origAfterRendering.apply(this, arguments);
                }
                //publish the event externally
                sap.ushell.renderers.fiori2.utils.publishExternalEvent("appOpened", oData);
            };
            //after the app container exit, publish an event to notify
            //that an app was closed
            var origExit = oAppContainer.exit;
            oAppContainer.exit = function () {
                if (origExit) {
                    origExit.apply(this, arguments);
                }
                //publish the event externally
                sap.ushell.renderers.fiori2.utils.publishExternalEvent("appClosed", oData.oApplication);
            };
        },

        openAppNewWindow : function (sUrl) {
            window.open(sUrl);
        },

        setAppIcons: function (oMetadataConfig) {
            // TODO Implement adjustment of relative paths:
            // Should be relative to Component.js, not to HTML file!
            var sModulePath = jQuery.sap.getModulePath("sap.ushell");
            var oLaunchIconPhone = (oMetadataConfig && oMetadataConfig.homeScreenIconPhone) ||
                    (sModulePath + '/themes/base/img/launchicons/57_iPhone_Desktop_Launch.png'),
                oLaunchIconPhone2 = (oMetadataConfig && oMetadataConfig["homeScreenIconPhone@2"]) ||
                    (sModulePath + '/themes/base/img/launchicons/114_iPhone-Retina_Web_Clip.png'),
                oLaunchIconTablet = (oMetadataConfig && oMetadataConfig.homeScreenIconTablet) ||
                    (sModulePath + '/themes/base/img/launchicons/72_iPad_Desktop_Launch.png'),
                oLaunchIconTablet2 = (oMetadataConfig && oMetadataConfig["homeScreenIconTablet@2"]) ||
                    (sModulePath + '/themes/base/img/launchicons/144_iPad_Retina_Web_Clip.png'),
                oFavIcon = (oMetadataConfig && oMetadataConfig.favIcon) ||
                    (sModulePath + '/themes/base/img/launchpad_favicon.ico'),
                sTitle = (oMetadataConfig && oMetadataConfig.title) ||
                        //TODO define proper localization tag for default window title
                    sap.ushell.resources.i18n.getText("homeBtn_tooltip"),
                sCurrentFavIconHref = this.getFavIconHref();
            if (sap.ui.Device.os.ios) {
                jQuery.sap.setIcons({
                    'phone': oLaunchIconPhone,
                    'phone@2': oLaunchIconPhone2,
                    'tablet': oLaunchIconTablet,
                    'tablet@2': oLaunchIconTablet2,
                    'favicon': oFavIcon,
                    'precomposed': true
                });
            } else if (sCurrentFavIconHref !== oFavIcon) {
                jQuery.sap.setIcons({
                    'phone': '',
                    'phone@2': '',
                    'tablet': '',
                    'tablet@2': '',
                    'favicon': oFavIcon,
                    'precomposed': true
                });
            }

            window.document.title = sTitle;
        },

        getFavIconHref: function () {
            return jQuery('link').filter('[rel="shortcut icon"]').attr('href') || '';
        },

        externalSearchTriggered: function (sChannelId, sEventId, oData) {
            oModel.setProperty("/searchTerm", oData.searchTerm);
            oData.query = oData.searchTerm;
        },

        onAfterNavigate: function (oEvent) {
            var sHome = this.oNavContainer.getInitialPage(), //DashboardPage
                sFrom = oEvent.getParameter("fromId");

            if (sFrom !== sHome && sFrom !== this.catalogPageId) {
                this.oNavContainer.removeAggregation("pages", sFrom, true);
                sap.ui.getCore().byId(sFrom).destroy();
            }
            this.oLoadingDialog.closeLoadingScreen();
        },

        onAfterRendering: function () {
            if (window.f2p) {
                f2p.add(f2p.m.endHomePage);
            }
        },

        navigateToHome: function (oEvent) {
            if (!oEvent || (oEvent && oEvent.getParameter("id") === 'homeBtn')){
                hasher.setHash("");
            } else {
                sap.ushell.renderers.fiori2.Navigation.openCatalogByHash();
            }
        },

        toggleSearch : function (bIsAvailable) {
            oModel.setProperty("/searchAvailable", bIsAvailable);
        },

        toggleRtlMode : function (bRtl) {
            oModel.setProperty("/rtl", bRtl);
        },

        togglePane : function (oEvent) {
            var oSource = oEvent.getSource(),
                bState = oSource.getSelected();

            // This is a hack for now untill we will be able to create the group as a standalone view.
            if (!sap.ui.getCore().byId('groupList') && (!this.getModel().getProperty || this.getModel().getProperty('/states/home/paneContent').length === 0)) {
                var oGroupListPage = this.getView().oDashboardManager.getGroupListView();

                // desktop and IOS7 both use the browser's scroller thus both should be checked
                if (sap.ui.Device.system.desktop) {
                    oGroupListPage.addStyleClass("sapUshellGroupListDesktopScrollbar");
                }
                this.getModel().setProperty('/states/home/paneContent', [oGroupListPage.getId()]);
                this.getModel().setProperty('/currentState/paneContent', [oGroupListPage.getId()]);
            }
            if (oEvent.getParameter("id") === "categoriesBtn") {
                oSource.getModel().setProperty("/currentState/showCurtainPane", !bState);
            } else {
                oSource.getModel().setProperty("/currentState/showPane", !bState);
                if (oSource.getModel().getProperty && oSource.getModel().getProperty('/currentState/paneContent').indexOf('groupList') !== -1) {
                    setTimeout(function () {
                        var oShell = sap.ui.getCore().byId("shell");
                        if (oShell) {
                            oShell.setFocusOnFirstGroupInList();
                        }
                    }, 1500);
                }
            }
        },

        getActiveViews: function () {
            var aCurtainContent = this.getModel().getProperty("/currentState/curtainContent"),
                oPage = sap.ui.getCore().byId(aCurtainContent[0]),
                aActiveViews = [];

            // the two search suggestion controller need to know
            // which is currently active to not trigger request twice
            jQuery.each(oPage.getContent(), function (i, v) {
                aActiveViews.push(v.getId());
            });

            return aActiveViews;
        },

        getLastSearchScreen: function () {
            return oModel.getProperty("/lastSearchScreen");
        },

        saveSearchScreen: function (sState) {
            if (sState === 'historyScreen' || sState === 'searchResults' || sState === 'suggestions') {
                oModel.setProperty("/lastSearchScreen", sState);
            }
        },

        switchViewState: function (sState, bSaveLastState) {
            if (oModel.getProperty("/personalization")) {
                jQuery.sap.require("sap.ushell.renderers.fiori2.ActionMode");
            }
            var sPath = sState[0] === "/" ? sState : "/states/" + sState,
                oState = oModel.getProperty(sPath),
                /** @type sap.ushell.ui.Shell */
                oCurrentState = oModel.getProperty("/currentState") || {};

            // in case settings buttons were added to the application action sheet in the shell header
            // there is a need to update the action sheet with the original buttons = > take it from the
            // shellActions property
            var oCurrentStateName = oModel.getProperty("/currentState/stateName");
            if (oCurrentStateName) {
                if ((oCurrentStateName !== "home") && (oCurrentStateName !== "catalog")) {
                    var currentShellActions = oModel.getProperty("/currentState/shellActions");
                    if (currentShellActions) {
                        var appActions = oModel.getProperty("/states/" + oCurrentStateName + "/actions");
                        appActions.length = 0;
                        for (var i = 0; i < currentShellActions.length; i++) {
                            appActions.push(currentShellActions[i]);
                        }
                        oModel.setProperty("/states/" + oCurrentStateName + "/actions", appActions);
                    }
                }
            }

            this.saveSearchScreen(sState);

            if (!!bSaveLastState) {
                oModel.setProperty("/lastState", oCurrentState);
            }

            oState = jQuery.extend({}, oCurrentState, oState);

            // get floating actions of old state 
            var aCurrentFloatingButtons = oCurrentState.floatingActions;
            var aNewFloatingButtons = oState.floatingActions;

            if (aCurrentFloatingButtons){
                aCurrentFloatingButtons.forEach(function(sFloatingAction){
                    if (!aNewFloatingButtons || aNewFloatingButtons.indexOf(sFloatingAction) == -1){
                        sap.ui.getCore().byId(sFloatingAction).setVisible(false);
                    }
                });
            }

            if (aNewFloatingButtons){
                aNewFloatingButtons.forEach(function(sFloatingButtonId, iIndex, aActions){
                    var oFloatingButton = sap.ui.getCore().byId(sFloatingButtonId),
                        aFooter = oState.footer;

                    if (aActions.length == 1) { //single floating button - show
                        oFloatingButton.setVisible(true);
                    } else { //multiple floating buttons
                        oFloatingButton.setVisible(false); //initially - set all actions to be hidden
                    }

                    if (aFooter.length > 0) { //adjust with footer
                        oFloatingButton.addStyleClass("sapUshellRoundedActionButtonWithFooter");
                    }
                }, this);
            }

            if (aNewFloatingButtons && (aNewFloatingButtons.length > 1)) { //multiple action buttons
                this.addMultipleActionsButton(aNewFloatingButtons);
            } else { //hide multiple actions button if visible
                this.toggleFloatingMultipleActionsButton(false);
            }

            // Change "currentState" property in the model to the new state 
            oModel.setProperty("/currentState", oState);

            if (sState === "searchResults") {
                oModel.setProperty("/lastSearchScreen", '');
                if (!hasher.getHash().indexOf("Action-search") === 0) {
                    var searchModel = sap.ui.getCore().getModel("searchModel");
                    hasher.setHash("Action-search&/searchTerm=" + searchModel.getProperty("/searchBoxTerm") + "&dataSource=" + JSON.stringify(searchModel.getDataSourceJson()));
                }
            }
        },

        toggleFloatingMultipleActionsButton : function(bVisible) {
            var oButton = sap.ui.getCore().byId("floatingMultipleActionsButton");
            if (oButton) {
                oButton.setVisible(bVisible);
            }
        },

        addMultipleActionsButton : function(aFloatingButtons) {
            if (!sap.ui.getCore().byId("floatingMultipleActionsButton")) {
                var oFloatingMultipleActionsButton = new sap.ushell.ui.shell.ActionButton({
                    id: "floatingMultipleActionsButton",
                    icon: 'sap-icon://add',
                    visible: true,
                    press: function (oEvent) {
                        var oParent = sap.ui.getCore().byId('floatingMultipleActionsButton').$();
                        var oIcon = this.$().find('span');
                        oIcon.addClass('sapUshellShellActionButtonTransition');
                        if (!oIcon.hasClass('sapUshellShellActionButtonRotate')) {
                            oIcon.addClass('sapUshellShellActionButtonRotate');
                            var iTranslate = parseInt(oParent.outerHeight(), 10) + parseInt(oParent.css('bottom'), 10);
                            aFloatingButtons.forEach(function (oFloatingButton, iIndex) {
                                var oButton = sap.ui.getCore().byId(oFloatingButton);
                                oButton.setVisible(true);
                                oButton.addStyleClass('sapUshellShellActionButtonTransition');
                                setTimeout(function(){
                                    oButton.$().css('transform', "translateY(-" + (iTranslate * (iIndex + 1)) + "px)");
                                },0);
                            });
                        } else {
                            oIcon.removeClass('sapUshellShellActionButtonRotate');
                            aFloatingButtons.forEach(function (oFloatingButton) {
                                var oButton = sap.ui.getCore().byId(oFloatingButton);
                                var iTranslate = parseInt(oParent.css('bottom'), 10);
                                oButton.$().css('transform', "translateY(-" + iTranslate + "px)");
                                setTimeout(function() {
                                    oButton.setVisible(false);
                                }, 150);
                            });
                        }
                    },
                    tooltip: sap.ushell.resources.i18n.getText("XXX")
                });
                //add or remove to oShellPage
                this.getView().insertContent(oFloatingMultipleActionsButton, 1);
            } else {
                this.toggleFloatingMultipleActionsButton(true);
            }
        },

        pressActionBtn: function (oEvent) {
            // don't hide the shell header when the action sheet is open on mobile devices only
            if (!sap.ui.Device.system.desktop) {
                //keep original header hiding value for reset after action sheet close
                var origHeaderHiding = this.getModel().getProperty("/currentState").headerHiding;
                this.getModel().setProperty("/currentState/headerHiding", false);
            }
            var oActionSheet = sap.ui.getCore().byId('headActions');
            if (!oActionSheet) {
                var oUserPrefButton = new sap.ushell.ui.footerbar.UserPreferencesButton("userPreferencesButton"),
                    oLogoutButton = new sap.ushell.ui.footerbar.LogoutButton("logoutBtn"),
                    oAboutButton = new sap.ushell.ui.footerbar.AboutButton("aboutBtn");
                this._setUserPrefModel(); // set the "/userPreference" property in the model

                jQuery.sap.require("sap.ushell.ui.footerbar.HideGroupsButton");
                var oHideGroupsButton = new sap.ushell.ui.footerbar.HideGroupsButton("hideGroupsBtn");
                if (!this.getModel().getProperty('/enableHideGroups')){ //Decided to always add the button but in case the hideGroups feature is off- hide it.
                    oHideGroupsButton.setVisible(false);
                }

                jQuery.sap.require('sap.ushell.ui.footerbar.ContactSupportButton');
                jQuery.sap.require('sap.ushell.ui.footerbar.EndUserFeedback');
                var oContactSupport = new sap.ushell.ui.footerbar.ContactSupportButton("ContactSupportBtn", {
                        visible: this.bContactSupportEnabled
                    }),
                    oEndUserFeedback = new sap.ushell.ui.footerbar.EndUserFeedback("EndUserFeedbackBtn", {
                        visible: '{/showEndUserFeedback}',
                        showAnonymous: this.oEndUserFeedbackConfiguration.showAnonymous,
                        showLegalAgreement: this.oEndUserFeedbackConfiguration.showLegalAgreement,
                        showCustomUIContent: this.oEndUserFeedbackConfiguration.showCustomUIContent,
                        feedbackDialogTitle: this.oEndUserFeedbackConfiguration.feedbackDialogTitle,
                        textAreaPlaceholder: this.oEndUserFeedbackConfiguration.textAreaPlaceholder,
                        customUIContent: this.oEndUserFeedbackConfiguration.customUIContent
                    });
                
                // if xRay is enabled
                if (this.getModel().getProperty("/enableHelp")) {
                    oUserPrefButton.addStyleClass('help-id-loginDetails');// xRay help ID
                    oLogoutButton.addStyleClass('help-id-logoutBtn');// xRay help ID
                    oAboutButton.addStyleClass('help-id-aboutBtn');// xRay help ID
                    oHideGroupsButton.addStyleClass('help-id-hideGroupsBtn');// xRay help ID
                    oEndUserFeedback.addStyleClass('help-id-EndUserFeedbackBtn'); // xRay help ID
                    oContactSupport.addStyleClass('help-id-contactSupportBtn');// xRay help ID
                }

                oActionSheet = new sap.m.ActionSheet("headActions", {
                    placement: sap.m.PlacementType.Bottom,
                    buttons: {path: "/currentState/actions", factory: function (sId, oContext) {
                        return sap.ui.getCore().byId(oContext.getObject());
                    }}
                });
                oActionSheet.updateAggregation = this.getView().updateShellAggregation;
                oActionSheet.setModel(this.getModel());
                this.getView().aDanglingControls.push(oActionSheet, oUserPrefButton, oLogoutButton, oAboutButton, oContactSupport, oEndUserFeedback, oHideGroupsButton/*, oTileActionsButton*/);

                oActionSheet.attachAfterClose(oActionSheet, function() {
                    // reset header hiding according to the current state (on mobile devices only)
                    if (!sap.ui.Device.system.desktop) {
                        this.getModel().setProperty("/currentState/headerHiding", origHeaderHiding);
                    }
                });
            }
            oActionSheet.openBy(oEvent.getSource());
        },

        loadUserImage: function() {
            if (!bUserImageAlreadyLoaded) {
                this.getView().loadUserImage();
                bUserImageAlreadyLoaded = true;
            }
        },

        loadCoreExt: function () {
            //if sap.fiori.core or sap.fiori.core-ext are loaded, we do not need to load core-ext
            var bAlreadyLoaded =   jQuery.sap.isDeclared('sap.fiori.core', true) ||
                    jQuery.sap.isDeclared('sap.fiori.core-ext', true),
                oLoaderWorker,
                sPathToWorker = '',
                that = this;

            if (bAlreadyLoaded) {
                return;
            }
            this.oCoreExtLoadingDeferred = jQuery.Deferred();
            //if HTML5 Web Workers are supported use it to load core-ext
            if (window.Worker) {
                sPathToWorker = jQuery.sap.getModulePath('sap.ushell.loader', '.js');
                //initiate the Worker
                oLoaderWorker = new window.Worker(sPathToWorker);
                //add a listener for messages from the worker
                oLoaderWorker.onmessage = function (oEvent) {
                    if (oEvent.data && !oEvent.data.error) {
                        try {
                            window.eval(oEvent.data);
                            jQuery.sap.declare('sap.fiori.core-ext' + '');
                            that.oCoreExtLoadingDeferred.resolve();
                            setTimeout(function() {
                                sap.ui.getCore().getEventBus().publish("launchpad", "coreExtLoaded");
                            }, 0);
                        } catch (e) {
                            that.oCoreExtLoadingDeferred.reject();
                            jQuery.sap.log.warning('failed to load sap.fiori.core-ext');
                        }
                    } else {
                        jQuery.sap.log.warning('failed to load sap.fiori.core-ext');
                        that.oCoreExtLoadingDeferred.reject();
                    }
                    //terminate the worker, if the worker will be extended the terminate call should be modified
                    oLoaderWorker.terminate();
                };
                //ask the loader to load core-ext
                oLoaderWorker.postMessage({
                    action: 'loadResource',
                    url: window['sap-ui-debug'] ? '../fiori/core-ext-dbg.js' : '../fiori/core-ext.js'
                });
            } else {
                //if WebWorker isn't supported, use a require statement in a setTimeout so that this call will not
                //disrupt other code flow
                setTimeout(function () {
                    try {
                        jQuery.sap.require('sap.fiori.core-ext');
                        this.oCoreExtLoadingDeferred.resolve();
                        setTimeout(function() {
                            sap.ui.getCore().getEventBus().publish("launchpad", "coreExtLoaded");
                        }, 0);
                    } catch (error) {
                    	this.oCoreExtLoadingDeferred.reject();
                        jQuery.sap.log.warning("failed to load sap.fiori.core-ext");
                    }
                }, 0);
            }
        },

        _setUserPrefModel: function () {
            var userPreferencesEntryArray = oModel.getProperty("/userPreferences/entries");
            var oDefaultUserPrefModel =  this._getUserPrefDefaultModel();
            oDefaultUserPrefModel.entries = oDefaultUserPrefModel.entries.concat(userPreferencesEntryArray);

            oModel.setProperty("/userPreferences", oDefaultUserPrefModel);
        },

        _getUserPrefDefaultModel: function () {
            jQuery.sap.require("sap.ushell.ui.footerbar.UserPrefThemeSelector");
            var oUser = sap.ushell.Container.getUser();
            var language = oUser.getLanguage();
            var server = window.location.host;
            var languageTitle = sap.ushell.resources.i18n.getText("languageFld");
            var serverTitle = sap.ushell.resources.i18n.getText("serverFld");
            var oThemeSelector = new sap.ushell.ui.footerbar.UserPrefThemeSelector();

            return {
                dialogTitle: sap.ushell.resources.i18n.getText("userPreferences"),
                isDetailedEntryMode: false,
                activeEntryPath: null, //the entry that is currently modified
                entries: [
                    {entryHelpID: "serverName", title: serverTitle, editable: false,
                        valueArgument: server, valueResult: null},
                    {entryHelpID: "language", title: languageTitle, editable: false,
                        valueArgument: language, valueResult: null},
                    //Old theme is initialized to be the current theme
                    {
                        entryHelpID: "themes",
                        title: oThemeSelector.getTitle(),
                        editable: oThemeSelector.getIsChangeThemePermitted(),
                        valueArgument: oThemeSelector.getValue.bind(oThemeSelector),// the function which will be called to get the entry value
                        valueResult: null,
                        onSave: oThemeSelector.getOnSave.bind(oThemeSelector),// the function which will be called when saving the entry changes
                        onCancel: oThemeSelector.getOnCancel.bind(oThemeSelector),// the function which will be called when canceling entry changes
                        contentFunc: oThemeSelector.getContent.bind(oThemeSelector),// the function which will be called to get the content of the detailed entry
                        contentResult: null
                    }
                ]
            };
        },

        //functions that implements the RendererExtensions API

        addHeaderItem: function (oItem, sState1, sState2, sState3) {
            var newArguments = Array.prototype.slice.call(arguments);
            newArguments.splice(0, 0, "headItems");
            this._addHeaderItem.apply(this, newArguments);
        },

        addHeaderEndItem: function (oItem, sState1, sState2, sState3) {
            var newArguments = Array.prototype.slice.call(arguments);
            newArguments.splice(0, 0, "headEndItems");
            this._addHeaderItem.apply(this, newArguments);
        },

        _addHeaderItem: function (sPropertyString, oItem, sState1, sState2, sState3) {
            if (typeof oItem !== "object" || !oItem.getId) {
                throw new Error("oItem value is invalid");
            }

            var newArguments = Array.prototype.slice.call(arguments);
            newArguments.splice(0, 1);
            var aPassStates = this._getPassStates.apply(this, newArguments);
            for (var i = 0; i < aPassStates.length; i++) {
                var aHeadItemsPublic = shellHeaderPublicItems[aPassStates[i]][sPropertyString];
                var oldItemId;
                if (aHeadItemsPublic.length === 1) {
                    var sErrorMessageString = sPropertyString.substring(0, sPropertyString.length - 1);
                    jQuery.sap.log.warning("You can only add one " + sErrorMessageString + ". Replacing existing headItem: " + aHeadItemsPublic[0] + " in state: " + aPassStates[i] + ", with the new headItem: " + oItem.getId() + ".");
                    oldItemId = aHeadItemsPublic[aHeadItemsPublic.length - 1];
                    aHeadItemsPublic.splice(aHeadItemsPublic.length - 1, 1);
                }

                aHeadItemsPublic.push(oItem.getId());

                var aModelStates = this._getModelStates(aPassStates[i]);
                for (var j = 0; j < aModelStates.length; j++) {
                    this._addHeaderItemToModel(oItem, sPropertyString, aModelStates[j], oldItemId);
                }
            }
        },

        _addHeaderItemToModel: function (oItem, sPropertyString, sState, oldItemId) {
            var modelPropertyString = "/states/" + sState + "/" + sPropertyString;
            var aHeadItems = oModel.getProperty(modelPropertyString);

            if (oldItemId) {
                var oldItemIndex = aHeadItems.indexOf(oldItemId);
                aHeadItems.splice(oldItemIndex,1);
            }

            //if the state is embedded need to add the item in the left size => before the standardActionsBtn button
            if ((sState == "embedded") && (sPropertyString == "headEndItems")) {
                var actionBtnIndex = aHeadItems.indexOf("standardActionsBtn");
                aHeadItems.splice(actionBtnIndex, 0, oItem.getId());
            } else {
                aHeadItems.push(oItem.getId());
            }

            oModel.setProperty(modelPropertyString, aHeadItems);
        },

        removeHeaderItem: function (oItem, sState1, sState2, sState3) {
            var newArguments = Array.prototype.slice.call(arguments);
            newArguments.splice(0,0,"headItems");
            this._removeHeaderItem.apply(this,newArguments);
        },

        removeHeaderEndItem: function (oItem, sState1, sState2, sState3) {
            var newArguments = Array.prototype.slice.call(arguments);
            newArguments.splice(0,0,"headEndItems");
            this._removeHeaderItem.apply(this,newArguments);
        },

        addEndUserFeedbackCustomUI: function (oCustomUIContent, bShowCustomUIContent) {
            if (oCustomUIContent){
                this.oEndUserFeedbackConfiguration.customUIContent = oCustomUIContent;
            }
            if (bShowCustomUIContent === false){
                this.oEndUserFeedbackConfiguration.showCustomUIContent = bShowCustomUIContent;
            }
        },

        _removeHeaderItem: function (sPropertyString, oItem, sState1, sState2, sState3) {
            if (typeof oItem !== "object" || !oItem.getId) {
                throw new Error("oItem value is invalid");
            }

            var newArguments = Array.prototype.slice.call(arguments);
            newArguments.splice(0,1);
            var aPassStates = this._getPassStates.apply(this,newArguments);

            for (var i = 0; i < aPassStates.length; i++) {
                var aHeadItemsPublic = shellHeaderPublicItems[aPassStates[i]][sPropertyString];
                var index = aHeadItemsPublic.indexOf(oItem.getId());
                if (index > -1) {
                    aHeadItemsPublic.splice(index, 1);
                } else {
                    jQuery.sap.log.warning("You cannot remove headItem: " + oItem.getId() + ", the headItem does not exists.");
                    return;
                }

                var aModelStates = this._getModelStates(aPassStates[i]);
                for (var j = 0; j < aModelStates.length; j++) {
                    this._removeHeaderItemFromModel(oItem, sPropertyString, aModelStates[j]);
                }
            }
        },

        _removeHeaderItemFromModel : function (oItem, sPropertyString, sState) {
            var modelPropertyString = "/states/" + sState + "/" + sPropertyString;
            var aHeadItems = oModel.getProperty(modelPropertyString);
            var index = aHeadItems.indexOf(oItem.getId());
            if (index > -1) {
                aHeadItems.splice(index, 1);
            }

            oModel.setProperty(modelPropertyString, aHeadItems);
        },

        addOptionsActionSheetButton: function (oButton, sState1, sState2, sState3) {
        	// by default 'isFirst' is false.
        	// this is to keep compatability with the PublicAPI (via RendererExtentions) which invokes this method
        	Array.prototype.unshift.call(arguments, false)
        	return this._addOptionsActionSheetButton.apply(this, arguments);
        },
        
        _addOptionsActionSheetButton: function (isFirst, oButton, sState1, sState2, sState3) {
            if (typeof oButton !== "object" || !oButton.getId) {
                throw new Error("oButton value is invalid");
            }

            var aPassStates = this._getPassStates.apply(this, Array.prototype.splice.call(arguments, 1));

            for (var i = 0; i < aPassStates.length; i++) {
                var aPublicActions = shellHeaderPublicItems[aPassStates[i]]["actions"];
                aPublicActions.push(oButton.getId());

                var aModelStates = this._getModelStates(aPassStates[i]);
                for (var j = 0; j < aModelStates.length; j++) {
                    if (aModelStates[j] == "home" || aModelStates[j] == "catalog") {
                        this._addOptionsActionSheetButtonToModel(oButton, isFirst, aModelStates[j], "actions");
                    } else {
                        //in case the state is an app state, we need to update the actions property and the shellActions property
                        this._addOptionsActionSheetButtonToModel(oButton, isFirst, aModelStates[j], "actions");
                        this._addOptionsActionSheetButtonToModel(oButton, isFirst, aModelStates[j], "shellActions");
                    }
                }
            }
        },
        _addOptionsActionSheetButtonToModel: function (oButton, isFirst, sState, sProperty) {
            var modelPropertyString = "/states/" + sState + "/" + sProperty;
            var aActions = oModel.getProperty(modelPropertyString);

            // add the button in first place
            if (isFirst) {
            	aActions.unshift(oButton.getId());
            }
            // add the button in the end before the logout button, if exists 
            else {
            	var iLogoutButtonIndex = aActions.indexOf("logoutBtn");
	            if (iLogoutButtonIndex > -1) {
	                aActions.splice(iLogoutButtonIndex,0,oButton.getId());
	            } else {
	                aActions.push(oButton.getId());
	            }            	
            }
            
            oModel.setProperty(modelPropertyString, aActions);
        },
        
        removeOptionsActionSheetButton: function (oButton, sState1, sState2, sState3) {
            if (typeof oButton !== "object" || !oButton.getId) {
                throw new Error("oButton value is invalid");
            }

            var aPassStates = this._getPassStates.apply(this,arguments);

            for (var i = 0; i < aPassStates.length; i++) {
                var aPublicActions = shellHeaderPublicItems [aPassStates[i]]["actions"];
                var index = aPublicActions.indexOf(oButton.getId());
                if (index > -1) {
                    aPublicActions.splice(index, 1);
                } else {
                    jQuery.sap.log.warning("You cannot remove button: " + oButton.getId() + " from the launchpad state: " + aPassStates[i] + ", the button was not added using 'sap.ushell.renderers.fiori2.RendererExtensions.addOptionsActionSheetButton'.");
                    continue;
                }

                var aModelStates = this._getModelStates(aPassStates[i]);
                for (var j = 0; j < aModelStates.length; j++) {
                    if (aModelStates[j] == "home" || aModelStates[j] == "catalog") {
                        this._removeOptionsActionSheetButtonFromModel(oButton, aModelStates[j], "actions");
                    } else {
                        //in case the state is an app state, we need to update the actions property and the shellActions property
                        this._removeOptionsActionSheetButtonFromModel(oButton, aModelStates[j], "actions");
                        this._removeOptionsActionSheetButtonFromModel(oButton, aModelStates[j], "shellActions");
                    }
                }
            }
        },

        _removeOptionsActionSheetButtonFromModel: function (oButton, sState, sProperty) {
            var modelPropertyString = "/states/" + sState + "/" + sProperty;
            var aActions = oModel.getProperty(modelPropertyString);
            var index = aActions.indexOf(oButton.getId());
            if (index > -1) {
                aActions.splice(index, 1);
            }
            oModel.setProperty(modelPropertyString, aActions);
        },

        setFooter: function (oFooter) {
            if (typeof oFooter !== "object" || !oFooter.getId) {
                throw new Error("oFooter value is invalid");
            }

            var iPublicFooter = shellHeaderPublicItems["allStates"]["footer"];
            if (iPublicFooter != null) { //there can be only 1 footer
                jQuery.sap.log.warning("You can only set one footer. Replacing existing footer: " + iPublicFooter + ", with the new footer: " + oFooter.getId() + ".");
            }
            shellHeaderPublicItems["allStates"]["footer"] = oFooter.getId();

            var aModelStates = ["home", "catalog", "app", "minimal", "standalone", "embedded"];
            for (var j = 0; j < aModelStates.length; j++) {
                var modelPropertyString = "/states/" + aModelStates[j] + "/footer";
                var aFooter = oModel.getProperty(modelPropertyString);
                if (aFooter.length > 0) {
                    aFooter.pop(); //there can be only 1 footer
                }
                aFooter.push(oFooter.getId());
                oModel.setProperty(modelPropertyString,aFooter);
            }
        },

        removeFooter: function () {
            var iPublicFooter = shellHeaderPublicItems["allStates"]["footer"];
            if (iPublicFooter == null) {
                jQuery.sap.log.warning("There is no footer to remove.");
                return;
            }
            shellHeaderPublicItems["allStates"]["footer"] = null;

            var aModelStates = ["home", "catalog", "app", "minimal", "standalone", "embedded"];
            for (var j = 0; j < aModelStates.length; j++) {
                var modelPropertyString = "/states/" + aModelStates[j] + "/footer";
                var aFooter = oModel.getProperty(modelPropertyString);
                if (aFooter.length > 0) {
                    aFooter.pop(); //there can be only 1 footer
                }
                oModel.setProperty(modelPropertyString,aFooter);
            }
        },

        //gets the array of the valid states that need to be update according to the arguments that were passed
        _getPassStates: function (oItem, sState1, sState2, sState3) {
            //an array with the relevant states that were pass as argument
            var aPassStates = [];

            if (arguments.length == 1) {
                aPassStates = ["app", "catalog", "home"];
            } else {
                aPassStates = Array.prototype.slice.call(arguments, 1, arguments.length);
            }

            for (var i = 0; i < aPassStates.length; i++) {
                if (aPassStates[i] != "home" && aPassStates[i] != "app" && aPassStates[i] != "catalog") {
                    throw new Error("sLaunchpadState value is invalid");
                }
            }
            return aPassStates;
        },

        //gets all the models states that need to be update according to the state that was pass as argument
        _getModelStates: function (sStates) {

            //an array with the relevant states that need to updated in the model
            var aModelStates = [];

            //in case we need to update to the "app" state, need to update all app states
            if (sStates == "app") {
                var appStates = ["app", "minimal", "standalone", "embedded"];
                aModelStates = aModelStates.concat(appStates);
            } else {
                aModelStates.push(sStates);
            }
            return aModelStates;
        },

        setFloatingAction: function (oButton, sStateName, press, icon) {
            if (typeof oButton !== "object" || !oButton.getId) {
                throw new Error("oFooter type is invalid");
            }

            var modelPropertyString = "/states/" + sStateName + "/floatingActions";
            var aFloatingButtons = oModel.getProperty(modelPropertyString);

            aFloatingButtons.push(oButton.getId());

            //add or remove to model
            oModel.setProperty(modelPropertyString, aFloatingButtons);
        },

        addUserPreferencesEntry: function(entryObject) {
            this._validateUserPrefEntryConfiguration(entryObject);
            this._updateUserPrefModel(entryObject);
        },

        _validateUserPrefEntryConfiguration: function(entryObject) {
            if ((!entryObject) || (typeof entryObject !== "object")) {
                throw new Error("object oConfig was not provided");
            }
            if (!entryObject.title) {
                throw new Error("title was not provided");
            }

            if (!entryObject.value) {
                throw new Error("value was not provided");
            }

            if (typeof entryObject.entryHelpID !== "undefined") {
                if (typeof entryObject.entryHelpID !== "string") {
                    throw new Error("entryHelpID type is invalid");
                } else {
                    if (entryObject.entryHelpID === "") {
                        throw new Error("entryHelpID type is invalid");
                    }
                }
            }

            if (entryObject.title && typeof entryObject.title !== "string") {
                throw new Error("title type is invalid");
            }

            if (typeof entryObject.value !== "function" && typeof entryObject.value !== "string" && typeof entryObject.value !== "number") {
                throw new Error("value type is invalid");
            }

            if (entryObject.onSave && typeof entryObject.onSave !== "function") {
                throw new Error("onSave type is invalid");
            }

            if (entryObject.content && typeof entryObject.content !== "function") {
                throw new Error("content type is invalid");
            }

            if (entryObject.onCancel && typeof entryObject.onCancel !== "function") {
                throw new Error("onCancel type is invalid");
            }
        },

        _updateUserPrefModel: function(entryObject) {
            var newEntry = {
                "entryHelpID": entryObject.entryHelpID,
                "title": entryObject.title,
                "editable": entryObject.content ? true : false,
                "valueArgument" : entryObject.value,
                "valueResult" : null,
                "onSave": entryObject.onSave,
                "onCancel": entryObject.onCancel,
                "contentFunc": entryObject.content,
                "contentResult": null
            };
            var userPreferencesEntryArray = oModel.getProperty("/userPreferences/entries");
            userPreferencesEntryArray.push(newEntry);
            oModel.setProperty("/userPreferences/entries", userPreferencesEntryArray);
        },

        _setHeaderTitle: function(sTitle) {
            if (typeof sTitle !== "string") {
                throw new Error("sTitle type is invalid");
            }
            oModel.setProperty("/title", sTitle);
        }
    });

}());

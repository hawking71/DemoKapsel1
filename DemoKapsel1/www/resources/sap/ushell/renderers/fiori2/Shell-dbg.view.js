// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
(function () {
    "use strict";
    /*global jQuery, sap, location, window, clearTimeout, setTimeout */

    jQuery.sap.require("sap.ushell.renderers.fiori2.Navigation");
    jQuery.sap.require("sap.ushell.renderers.fiori2.launchpad.DashboardManager");
    jQuery.sap.require("sap.ushell.ui.shell.Shell");

    //add touch support for mobile devices
    jQuery.sap.require("sap.ushell.UIActions");
    jQuery.sap.require("sap.ushell.UserActivityLog");
    sap.ui.jsview("sap.ushell.renderers.fiori2.Shell", {

		/**
		 * Most of the following code acts just as placeholder for new Unified Shell Control.
		 *
		 * @param oController
		 * @returns {sap.ushell.ui.Shell}
		 * @public
		 */
		createContent: function (oController) {
			var self = this;
			var oViewData = this.getViewData() || {},
			oConfig = oViewData.config || {},
			bStateEmbedded = (oConfig.appState === "embedded") ? true : false,
					bStateHeaderless = (oConfig.appState === "headerless") ? true : false,
							fnPaneButtonTooltip = function (bState, sShowTooltip, sHideTooltip) {
						return bState ? sHideTooltip : sShowTooltip;
					},
					fnShellUpdateAggItem = function (sId, oContext) {
						return sap.ui.getCore().byId(oContext.getObject());
					},
					oLoadingDialog = new sap.ushell.ui.launchpad.LoadingDialog({
						id: "loadingDialog",
						title: null,
						text: "",   // in order to calculate dimension before first call
						showCancelButton: false
					}),
					oConfigButton = new sap.ushell.ui.shell.ShellHeadItem({
						id: "configBtn",
						tooltip: "{i18n>showGrpsBtn_tooltip}",
						icon: sap.ui.core.IconPool.getIconURI("menu2"),
						selected: {path: "/currentState/showPane"},
						press: [oController.togglePane, oController]
					}),
					oHomeButton = new sap.ushell.ui.shell.ShellHeadItem({
						id: "homeBtn",
						title: "{i18n>homeBtn_tooltip}",
						tooltip: "{i18n>homeBtn_tooltip}",
						icon: sap.ui.core.IconPool.getIconURI("home"),
                        target: "#"
					}),
					oBackButton = new sap.ushell.ui.shell.ShellHeadItem({
						id: "backBtn",
						title: "{i18n>backBtn_tooltip}",
						tooltip: "{i18n>backBtn_tooltip}",
						icon: {
							parts : ["/rtl"],
							formatter : function (bRtl) {
								return bRtl ? sap.ui.core.IconPool.getIconURI("feeder-arrow") : sap.ui.core.IconPool.getIconURI("nav-back");
							}
						},
						press: [oController.navigateToHome, oController]
					});

            oHomeButton.addEventDelegate({
                onsapskipback: function (oEvent) {
                    try {
                        oEvent.preventDefault();
                        oEvent.stopPropagation();
                        var firstTile = jQuery('#catalogTiles .sapUshellTile:visible:first');
                        sap.ushell.renderers.fiori2.AccessKeysHandler.setTileFocus(firstTile);
                    } catch (e) {
                    }
                },
                onsapskipforward: function (oEvent) {
                    try {
                        oEvent.preventDefault();
                        var nextElement = jQuery("#catalogTilesPage header button")[0];
                        nextElement.focus();
                    } catch (e) {
                    }
                }
            });

            oConfigButton.addEventDelegate({
                onsapdown: function (oEvent) {
                    if (oController.getModel().getProperty("/currentState/showPane")) {
                        var oShell = sap.ui.getCore().byId("shell");
                        if (oShell) {
                            oEvent.stopImmediatePropagation();
                            oEvent.stopPropagation();
                            oShell.setFocusOnFirstGroupInList();
                        }
                    } else {
                        oConfigButton.firePress();
                    }
                },
                onsapup: function (oEvent) {
                    if (oController.getModel().getProperty("/currentState/showPane")) {
                        oConfigButton.firePress();
                    }
                },
                onsapskipforward: function (oEvent) {
                    try {
                        oEvent.preventDefault();
                        //sidePanelFirstGroup
                        var jqElement = jQuery(".sapUshellGroupLI:first:visible");
                        if (!jqElement.length) {
                            sap.ushell.renderers.fiori2.AccessKeysHandler.goToTileContainer();
                        } else {
                            jqElement.focus();
                        }
                    } catch (e) {
                    }
                }
            });

            var oActionsUserButton,
                oActionsButton;
            if (bStateEmbedded) {
                oActionsButton = new sap.ushell.ui.shell.ShellHeadItem({
                    id: "standardActionsBtn",
                    tooltip: "{i18n>headerActionsTooltip}",
                    icon: sap.ui.core.IconPool.getIconURI("account"),
                    press: [oController.pressActionBtn, oController]
                });
            }
            else if (!bStateHeaderless) {
                oActionsUserButton = new sap.ushell.ui.shell.ShellHeadUserItem({
                    id: "actionsBtn",
                    username: sap.ushell.Container.getUser().getFullName(),
                    tooltip: "{i18n>headerActionsTooltip}",
                    image: sap.ui.core.IconPool.getIconURI("account"),
                    press: [oController.pressActionBtn, oController]
                });
                oActionsUserButton.addEventDelegate({
                    onsaptabnext: function (oEvent) {
                        try {
                            var oShell = sap.ui.getCore().byId('shell'),
                                oData = oShell.getModel().getData();

                            if (oData.currentState.stateName === "home") {
                                if (oData.currentState.showPane) {
                                    var groupListPage = sap.ui.getCore().byId('groupListPage');
                                    var items = groupListPage.getContent()[1].getItems();
                                    var item;
                                    //find the first visible item
                                    for(var i = 0; i < items.length && !item; i++){
                                        if(items[i].getDomRef() && jQuery.sap.getObject("style.display", null, items[i].getDomRef()) !== 'none'){
                                            item = items[i];
                                        }
                                    }
                                    if (item) {
                                        item.focus();
                                    } else {
                                        sap.ui.getCore().byId('openCatalogActionItem').focus();
                                    }
                                }
                                else {
                                    oEvent.preventDefault();
                                    if (!sap.ushell.renderers.fiori2.AccessKeysHandler.goToTileContainer()){
                                        sap.ui.getCore().byId('configBtn').focus();
                                    }
                                }
                            }
                        } catch (e) {
                        }
                    }
                });
            }
					var oUnifiedShell = new sap.ushell.ui.shell.Shell({
						id: "shell",
						fullHeightContent: true,
						showPane: {path: "/currentState/showPane"},
						headItems: {path: "/currentState/headItems", factory: fnShellUpdateAggItem},
						headEndItems: {path: "/currentState/headEndItems", factory: fnShellUpdateAggItem},
						floatingButtons: {path: "/currentState/floatingActions", factory: fnShellUpdateAggItem}, //TODO factory
						user: oActionsUserButton,
						paneContent: {path: "/currentState/paneContent", factory: fnShellUpdateAggItem},
						headerHiding: {path: "/currentState/headerHiding"},
						headerVisible : {path: "/currentState/headerVisible"},
                        title: {path: "/title"}
					});
					oUnifiedShell._setStrongBackground(true);

					// modifying the header on after rendering so it will add the relevant identifiers 
					// to the Elements which are related to the xRay help scenarios
					var shellHeader = oUnifiedShell.getHeader();
					if (shellHeader) {
						var origHeadAfterRender = shellHeader.onAfterRendering;
						shellHeader.onAfterRendering = function () {
							if (origHeadAfterRender) {
								origHeadAfterRender.apply(this,arguments);
							}
							// if xRay is enabled
							if (this.getModel().getProperty("/enableHelp")) {
				            	jQuery('#actionsBtn').addClass('help-id-actionsBtn');// xRay help ID
				            	jQuery('#configBtn').addClass('help-id-configBtn');// xRay help ID
				            	jQuery('#homeBtn').addClass('help-id-homeBtn');// xRay help ID
				            }
							// remove tabindex for keyboard navigation
							jQuery(".sapUshellHeadTitle").removeAttr("tabindex", 0);
						};
					}
					// fixing double events which occur on Android. Two events are caught by the UI -
					// (touchend & click event) and thrown from the open/close pane button (oConfigButton)
					// e.g. sap.ushell.ui.shell.ShellHeadItem.onclick method
					// which causes the pane to remain in its state when trying to open / close the pane.
					// this is a temporary fix until we will do it on the ShellHeadItem class level.
					if (sap.ui.Device.os.android) {
						oConfigButton.addEventDelegate({
							onclick : function (e) {
								e.preventDefault();
							}
						});
					}

					oUnifiedShell.focusOnConfigBtn = function () {
						jQuery.sap.delayedCall(500, this, function () {
							if (!bStateHeaderless) {
								var oConfig = sap.ui.getCore().byId('configBtn');
								if( oConfig ){
									oConfig.focus();
								}
							}
						});
					};

					oUnifiedShell.oldInvalidate = oUnifiedShell.invalidate;
					oUnifiedShell.invalidate = function () {
						this.oldInvalidate.apply(this, arguments);
					};

					oUnifiedShell.setFocusOnFirstGroupOnPage = function(){
						var oDashboardGroupsNode = sap.ui.getCore().byId('dashboardGroups'),
						oNode = jQuery( oDashboardGroupsNode.getDomRef() ).find(".sapUshellTileContainer:first");
						if( oNode[0] ){
							oNode.focus();
						}else{
							sap.ui.getCore().byId('openCatalogActionItem').focus();
						}
					};

					oUnifiedShell.setFocusOnFirstGroupInList = function(){
						var groupsNode = sap.ui.getCore().byId('groupList'),
						oNode = jQuery( groupsNode.getDomRef() ).find("li:first");
						if( oNode[0] ){
							oNode.focus();
						}
					};


					this.oDashboardManager = new sap.ushell.renderers.fiori2.launchpad.DashboardManager("dashboardMgr", {
						model : oController.getModel(),
						config : oConfig
					});

					var oDashboardPage = this.pageFactory("dashboardPage", this.oDashboardManager.getDashboardView(), !sap.ui.Device.system.desktop),
					oShellPage = this.pageFactory("shellPage", oUnifiedShell, true);

                    //in case a footer is added to the shellPage using the RendererExtensions.setFooter API
                      oShellPage.bindAggregation("footer",{path: "/currentState/footer",factory: fnShellUpdateAggItem});

                    //after the dashboard is rendered, publish an event to notify
                    //the groupList (for the case that an exception was raised on the open app)
                    var origAfterRendering = oDashboardPage.onAfterRendering;
                    oDashboardPage.onAfterRendering = function () {
                        if (origAfterRendering) {
                            origAfterRendering.apply(this, arguments);
                        }
                        //wrapped in setTimeout since "pubilsh" is not async
                        setTimeout(function () {
                            sap.ui.getCore().getEventBus().publish("grouplist", "DashboardRerender");
                        }, 0);
                    };
					this.initNavContainer(oController);
					
					if (bStateEmbedded) {
						oUnifiedShell.setIcon(sap.ui.resource('sap.ui.core', 'themes/base/img/1x1.gif'));
					}
					else {
						this.initShellBarLogo(oUnifiedShell);
					}

					this.setDisplayBlock(true);

					this.aDanglingControls = [sap.ui.getCore().byId('navContainer'), oShellPage, oDashboardPage, oBackButton, oLoadingDialog, oHomeButton, oConfigButton];
					oUnifiedShell.updateAggregation = this.updateShellAggregation;

					var bSearchEnable = (oConfig.enableSearch !== false);
					oController.getModel().setProperty("/searchAvailable", bSearchEnable);

					if (bSearchEnable) {
						//Search Icon
						self.oSearchField = new sap.ushell.ui.shell.ShellHeadItem({
							id: "sf",
							tooltip: "{i18n>searchbox_tooltip}",
							icon: sap.ui.core.IconPool.getIconURI("search"),
							visible: {path: "/searchAvailable"},
                            showSeparator: false,
							press: function (event) {
                                //if the search field is opened, the title is hidden
                                var isSearchOpen;
								if (!self.searchShellHelper) {
									jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchShellHelper');
									self.searchShellHelper = sap.ushell.renderers.fiori2.search.SearchShellHelper;
									self.searchShellHelper.init(self);
									// at the first time the user clicks on the magnifier button the search is closed.
									isSearchOpen = false;
								} else {
									// this is added as after a search is performed the searchbox closes automatically
									// so the member of 'isSearchOpen' is inconsistent as it relies the fact that
									// the searchbox is opened/closed only by the magnifier button (which is not always true as in this case)
									isSearchOpen = self.searchShellHelper.oHeadSearchBox.getVisible();
								}
								
								// setting the opposite value - this is the future value
								isSearchOpen = !isSearchOpen;
								self.searchShellHelper.handleClickMagnifier();								
								oUnifiedShell.setSearchVisible(isSearchOpen);
							}
						});

						self.aDanglingControls.push(self.oSearchField);
					}

					//This property is needed for a special scenario when a remote Authentication is required.
					//IFrame src is set by UI2 Services
					this.logonIFrameReference = null;

					return new sap.m.App({
						pages: oShellPage
					});
		},

        loadUserImage: function () {
            /*
             in case user image URI is set we try to get it,
             only if request was successful, we set it on the
             oActionsButton icon.
             In case of success, 2 get requests will be executed
             (one here and the second by the control) however
             the second one will be taken from the cache
             */
            var imageURI = sap.ushell.Container.getUser().getImage();

            if (imageURI) {
                //Using jQuery.ajax instead of jQuery.get in-order to be able to control the caching.
                jQuery.ajax({
                    url: imageURI,
                    //"cache: false" didn't work as expected hence, turning off the cache vie explicit headers.
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    },
                    success: function () {
                        var oActionsUserButton = sap.ui.getCore().byId('actionsBtn');
                        if (oActionsUserButton) {
                            oActionsUserButton.setImage(imageURI);
                        }
                    },
                    error: function () {
                        jQuery.sap.log.error("Could not load user image from: " + imageURI, "", "sap.ushell.renderers.fiori2.Shell.view");
                    }
                });
            }
        },

		_getIconURI: function (ico) {
			var result = null;
			if (ico) {
				var match = /url[\s]*\('?"?([^\'")]*)'?"?\)/.exec(ico);
				if (match) {
					result = match[1];
				}
			}
			return result;
		},

		initShellBarLogo: function (oUnifiedShell) {
			jQuery.sap.require("sap.ui.core.theming.Parameters");
			var ico = sap.ui.core.theming.Parameters.get("sapUiGlobalLogo");
			if (ico) {
				ico = this._getIconURI(ico);
				if(!ico){
					oUnifiedShell.setIcon(sap.ui.resource("sap.ui.core", "mimes/logo/sap_50x26.png")); //sets the logo manually on the sap.ushell.ui.shell.Shell instance
				}
			}

			//Change the Theme icon once it is changed (in the theme designer) 
			var that=this;
            sap.ui.getCore().attachThemeChanged( function(){
                if (oUnifiedShell.bIsDestroyed) {
                    return;
                }
                var newIco = sap.ui.core.theming.Parameters.get("sapUiGlobalLogo");
                if(newIco) {
                    newIco= that._getIconURI(newIco);
                    if(newIco) {
                        oUnifiedShell.setIcon(newIco);
                    } else {
                        oUnifiedShell.setIcon(sap.ui.resource("sap.ui.core", "mimes/logo/sap_50x26.png")); //sets the logo manually on the sap.ushell.ui.shell.Shell instance
                    }
                } else {
                    oUnifiedShell.setIcon(sap.ui.resource("sap.ui.core", "mimes/logo/sap_50x26.png")); //sets the logo manually on the sap.ushell.ui.shell.Shell instance
                }
            });
		},

		initNavContainer: function (oController) {
			var oDashboardPage = sap.ui.getCore().byId("dashboardPage"),
			oNavContainer = new sap.m.NavContainer({
				id: "navContainer",
				pages: [oDashboardPage],
				initialPage: oDashboardPage,
				afterNavigate: jQuery.proxy(oController.onAfterNavigate, oController)
			});

			oNavContainer.addCustomTransition(
					"slideBack",
					sap.m.NavContainer.transitions.slide.back,
					sap.m.NavContainer.transitions.slide.back
			);

			return oNavContainer;
		},


		updateShellAggregation: function (sName) {
			/*jslint nomen: true */
			var oBindingInfo = this.mBindingInfos[sName],
			oAggregationInfo = this.getMetadata().getJSONKeys()[sName],
			oClone;

			jQuery.each(this[oAggregationInfo._sGetter](), jQuery.proxy(function (i, v) {
				this[oAggregationInfo._sRemoveMutator](v);
			}, this));
			jQuery.each(oBindingInfo.binding.getContexts(), jQuery.proxy(function (i, v) {
				oClone = oBindingInfo.factory(this.getId() + "-" + i, v) ? oBindingInfo.factory(this.getId() + "-" + i, v).setBindingContext(v, oBindingInfo.model) : "";
				this[oAggregationInfo._sMutator](oClone);
			}, this));
		},


		// Disable bouncing outside of the boundaries
		disableBouncing: function (oPage) {
			/*jslint nomen: true */
			oPage.onBeforeRendering = function () {
				sap.m.Page.prototype.onBeforeRendering.apply(oPage);

				var oScroller = this._oScroller,
				oOriginalAfterRendering = oScroller.onAfterRendering;

				oScroller.onAfterRendering = function () {
					oOriginalAfterRendering.apply(oScroller);

					if (oScroller._scroller) {
						oScroller._scroller.options.bounce = false;
					}
				};
			};

			return oPage;
		},


		getControllerName: function () {
			return "sap.ushell.renderers.fiori2.Shell";
		},


		pageFactory: function (sId, oControl, bDisableBouncing) {
			var oPage = new sap.m.Page({
				id: sId,
				showHeader: false,
				content: oControl,
				enableScrolling: !!sap.ui.Device.system.desktop
			}),
			aEvents = ["onAfterHide", "onAfterShow", "onBeforeFirstShow", "onBeforeHide", "onBeforeShow"],
			oDelegates = {};

			// Pass navigation container events to children.
			jQuery.each(aEvents, function (iIndex, sEvent) {
				oDelegates[sEvent] = jQuery.proxy(function (evt) {
					jQuery.each(this.getContent(), function (iIndex, oControl) {
						/*jslint nomen: true */
						oControl._handleEvent(evt);
					});
				}, oPage);
			});

			oPage.addEventDelegate(oDelegates);
			if (bDisableBouncing && sap.ui.Device.system.desktop) {
				this.disableBouncing(oPage);
			}

			return oPage;
		},

		onAfterRendering: function () {
			if (window.f2p) {//If performance is enabled we initialize the monitor UI so that CTRL + ALT +  L will open it.
				jQuery.sap.require("sap.ushell.components.perf.monitor");
				window.f2pMonitor.init(sap.ui.getCore().byId("navContainer"));
			}
		},

		createIFrameDialog: function () {
			var oDialog = null,
			    oLogonIframe = this.logonIFrameReference,
			    bContactSupportEnabled;

			var _getIFrame = function() {
				//In order to assure the same iframe for SAML authentication is not reused, we will first remove it from the DOM if exists.
				if(oLogonIframe){
					oLogonIframe.remove();
				}
				//The src property is empty by default. the caller will set it as required.
				return $('<iframe id="SAMLDialogFrame" src="" frameborder="0"></iframe>');
			};

			var _hideDialog = function () {
				oDialog.addStyleClass('samlDialogHidden');
				$('#sap-ui-blocklayer-popup').addClass('samlDialogHidden');
			};

			//A new dialog wrapper with a new inner iframe will be created each time.
			this.destroyIFrameDialog();

			var closeBtn = new sap.m.Button({
				text: sap.ushell.resources.i18n.getText("samlCloseBtn"),
				press: function () {
					sap.ushell.Container.cancelLogon(); // Note: calls back destroyIFrameDialog()!
				}
			});

			var oHTMLCtrl = new sap.ui.core.HTML("SAMLDialogFrame");
			//create new iframe and add it to the Dialog HTML control
			this.logonIFrameReference = _getIFrame();
			oHTMLCtrl.setContent(this.logonIFrameReference.prop('outerHTML'));

			oDialog = new sap.m.Dialog({
				id: "SAMLDialog",
				title: sap.ushell.resources.i18n.getText("samlDialogTitle"),
				contentWidth: "50%",
				contentHeight: "50%",
				rightButton: closeBtn
			});

			bContactSupportEnabled = sap.ushell.Container.getService("SupportTicket").isEnabled();
			if (bContactSupportEnabled) {
				jQuery.sap.require("sap.ushell.ui.footerbar.ContactSupportButton");
				var oContactSupportBtn = new sap.ushell.ui.footerbar.ContactSupportButton();
				oContactSupportBtn.setWidth('150px');
				oContactSupportBtn.setIcon('');
				oDialog.setLeftButton(oContactSupportBtn);
			}
			
			oDialog.addContent(oHTMLCtrl);
			oDialog.open();
			//Make sure to manipulate css properties after the dialog is rendered.
			_hideDialog();

			this.logonIFrameReference = $('#SAMLDialogFrame');
			return this.logonIFrameReference[0];
		},

		destroyIFrameDialog : function () {
			var dialog = sap.ui.getCore().byId('SAMLDialog');
			if(dialog){
				dialog.destroy();
			}
			this.logonIFrameReference = null;
		},

		showIFrameDialog : function () {
			//remove css class of dialog
			var oDialog = sap.ui.getCore().byId('SAMLDialog');
			if (oDialog) {
				oDialog.removeStyleClass('samlDialogHidden');
				$('#sap-ui-blocklayer-popup').removeClass('samlDialogHidden');
			}
		}


	});
}());

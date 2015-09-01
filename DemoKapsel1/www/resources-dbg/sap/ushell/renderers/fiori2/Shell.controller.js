// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
(function(){"use strict";jQuery.sap.require("sap.ui.core.IconPool");setTimeout(function(){jQuery.sap.require("sap.ushell.renderers.fiori2.launchpad.DashboardManager");},10);jQuery.sap.require("sap.ushell.services.Message");jQuery.sap.require("sap.ushell.services.ShellNavigation");jQuery.sap.require("sap.ushell.services.AppConfiguration");jQuery.sap.require("sap.ushell.renderers.fiori2.History");jQuery.sap.require("sap.ushell.ui.launchpad.LoadingDialog");jQuery.sap.require("sap.ushell.renderers.fiori2.AccessKeysHandler");var a=true,b=sap.ui.Device.system.desktop,u,U,s,m=new sap.ui.model.json.JSONModel({groups:[],animationRendered:false,searchAvailable:false,title:"",tagFiltering:true,catalogSelection:true,searchFiltering:true,tileActionModeEnabled:false,tileActionModeActive:false,enableCreateGroupInCatalog:true,isInDrag:false,rtl:false,showEndUserFeedback:false,personalization:true,editTitle:false,searchTerm:"",tagList:[],selectedTags:[],isPhoneWidth:false,states:{"home":{"stateName":"home","showCurtain":false,"headerHiding":false,"headerVisible":true,"showCatalog":false,"showPane":false,"headItems":["configBtn"],"headEndItems":["sf"],"search":"","paneContent":[],"actions":["hideGroupsBtn","ContactSupportBtn","EndUserFeedbackBtn","userPreferencesButton","logoutBtn"],"floatingActions":[],"footer":[]},"app":{"stateName":"app","showCurtain":false,"headerHiding":!b,"headerVisible":true,"headEndItems":["sf"],"showCatalog":false,"showPane":false,"search":"","headItems":["homeBtn"],"actions":["ContactSupportBtn","EndUserFeedbackBtn","aboutBtn","userPreferencesButton","logoutBtn"],"shellActions":["ContactSupportBtn","EndUserFeedbackBtn","aboutBtn","userPreferencesButton","logoutBtn"],"floatingActions":[],"footer":[]},"minimal":{"stateName":"minimal","showCurtain":false,"headerHiding":false,"headerVisible":true,"headEndItems":[],"showCatalog":false,"showPane":false,"headItems":[],"actions":["aboutBtn","ContactSupportBtn","EndUserFeedbackBtn","userPreferencesButton","logoutBtn"],"shellActions":["aboutBtn","ContactSupportBtn","EndUserFeedbackBtn","userPreferencesButton","logoutBtn"],"floatingActions":[],"footer":[]},"standalone":{"stateName":"standalone","showCurtain":false,"headerHiding":!b,"headerVisible":true,"headEndItems":[],"showCatalog":false,"showPane":false,"headItems":[],"actions":["aboutBtn","ContactSupportBtn","EndUserFeedbackBtn"],"shellActions":["aboutBtn","ContactSupportBtn","EndUserFeedbackBtn"],"floatingActions":[],"footer":[]},"embedded":{"stateName":"embedded","showCurtain":false,"headerHiding":!b,"headerVisible":true,"headEndItems":["standardActionsBtn"],"showCatalog":false,"showPane":false,"headItems":[],"actions":["aboutBtn","ContactSupportBtn","EndUserFeedbackBtn"],"shellActions":["aboutBtn","ContactSupportBtn","EndUserFeedbackBtn"],"floatingActions":[],"footer":[]},"headerless":{"stateName":"headerless","showCurtain":false,"headerHiding":!b,"headerVisible":false,"headEndItems":[],"showCatalog":false,"showPane":false,"headItems":[],"actions":[],"shellActions":[],"floatingActions":[],"footer":[]},"catalog":{"stateName":"catalog","showCurtain":false,"headerHiding":!b,"headerVisible":true,"headEndItems":["sf"],"showCatalog":true,"showPane":false,"search":"","headItems":["homeBtn"],"actions":["ContactSupportBtn","EndUserFeedbackBtn","userPreferencesButton","logoutBtn"],"floatingActions":[],"footer":[]}},userPreferences:{entries:[]}}),c={},d=['minimal','app','standalone','embedded','headerless'];m.setDefaultBindingMode("OneWay");m.setSizeLimit(10000);sap.ui.controller("sap.ushell.renderers.fiori2.Shell",{oCoreExtLoadingDeferred:undefined,catalogPageId:"catalogPage",onInit:function(){s={home:{headItems:[],headEndItems:[],actions:[]},app:{headItems:[],headEndItems:[],actions:[]},catalog:{headItems:[],headEndItems:[],actions:[]},allStates:{footer:null}};this.oEndUserFeedbackConfiguration={showAnonymous:true,showLegalAgreement:true,showCustomUIContent:true,feedbackDialogTitle:true,textAreaPlaceholder:true,customUIContent:undefined};this.getView().setModel(m);this.getView().setModel(sap.ushell.resources.i18nModel,"i18n");sap.ui.getCore().getEventBus().subscribe("externalSearch",this.externalSearchTriggered,this);sap.ui.getCore().getEventBus().subscribe("showCatalog",this.showCatalog,this);sap.ui.getCore().getEventBus().subscribe("openApp",this.openApp,this);sap.ui.getCore().getEventBus().subscribe("launchpad","contentRendered",this.loadCoreExt,this);sap.ui.getCore().getEventBus().subscribe("launchpad","contentRendered",this.loadUserImage,this);sap.ui.getCore().getEventBus().subscribe("sap.ushell.renderers.fiori2.Renderer","appOpened",this.loadUserImage,this);this._setConfigurationToModel();u=sap.ushell.Container.getService("UserRecents");this.history=new sap.ushell.renderers.fiori2.History();this.oNavContainer=sap.ui.getCore().byId("navContainer");this.oLoadingDialog=sap.ui.getCore().byId("loadingDialog");this.toggleRtlMode(sap.ui.getCore().getConfiguration().getRTL());this.oShellNavigation=sap.ushell.Container.getService("ShellNavigation");this.oShellNavigation.init(jQuery.proxy(this.doHashChange,this));this.oShellNavigation.registerNavigationFilter(jQuery.proxy(this.handleDataLoss,this));sap.ushell.Container.getService("Message").init(jQuery.proxy(this.doShowMessage,this));sap.ushell.Container.setLogonFrameProvider(this._getLogonFrameProvider());this.bContactSupportEnabled=sap.ushell.Container.getService("SupportTicket").isEnabled();window.onbeforeunload=function(){if(sap.ushell.Container&&sap.ushell.Container.getDirtyFlag()){if(!sap.ushell.resources.browserI18n){sap.ushell.resources.browserI18n=sap.ushell.resources.getTranslationModel(window.navigator.language).getResourceBundle();}return sap.ushell.resources.browserI18n.getText("dataLossExternalMessage");}};try{sap.ushell.Container.getService("EndUserFeedback").isEnabled().done(function(){m.setProperty('/showEndUserFeedback',true);});}catch(e){jQuery.sap.log.error("EndUserFeedback adapter is not found",e.message||e);}if(this.bContactSupportEnabled){sap.ushell.UserActivityLog.activate();}var f=window.matchMedia("(min-width: 800px)");var h=function(g){m.setProperty("/isPhoneWidth",!g.matches);};if(f.addListener){f.addListener(h);h(f);}},_setConfigurationToModel:function(){var v=this.getView().getViewData(),e;if(v){c=v.config||{};}if(c){if(c.states){var f=m.getProperty('/states');for(e in c.states){if(c.states.hasOwnProperty(e)){f[e]=c.states[e];}}m.setProperty('/states',f);}if(c.appState==="headerless"){m.setProperty("/personalization",false);m.setProperty("/states/home/headerVisible",false);}else if(c.enablePersonalization!==undefined){m.setProperty("/personalization",c.enablePersonalization);}if(c.changeEndUserFeedbackTitle!==undefined){this.oEndUserFeedbackConfiguration.feedbackDialogTitle=c.changeEndUserFeedbackTitle;}if(c.changeEndUserFeedbackPlaceholder!==undefined){this.oEndUserFeedbackConfiguration.textAreaPlaceholder=c.changeEndUserFeedbackPlaceholder;}if(c.showEndUserFeedbackAnonymousCheckbox!==undefined){this.oEndUserFeedbackConfiguration.showAnonymous=c.showEndUserFeedbackAnonymousCheckbox;}if(c.showEndUserFeedbackLegalAgreement!==undefined){this.oEndUserFeedbackConfiguration.showLegalAgreement=c.showEndUserFeedbackLegalAgreement;}if(c.enableTagFiltering!==undefined){m.setProperty("/tagFiltering",c.enableTagFiltering);}if(c.enableSetTheme!==undefined){m.setProperty("/setTheme",c.enableSetTheme);}if(c.enableCatalogSelection!==undefined){m.setProperty("/catalogSelection",c.enableCatalogSelection);}if(c.enableSearchFiltering!==undefined){m.setProperty("/searchFiltering",c.enableSearchFiltering);}if(c.enableTilesOpacity!==undefined){m.setProperty("/tilesOpacity",c.enableTilesOpacity);}if(c.enableCreateGroupInCatalog!==undefined){m.setProperty("/enableCreateGroupInCatalog",c.enableCreateGroupInCatalog);}if(c.enableDragIndicator!==undefined){m.setProperty("/enableDragIndicator",c.enableDragIndicator);}var t=false;if(c.enableActionModeMenuButton!==undefined){m.setProperty("/actionModeMenuButtonEnabled",c.enableActionModeMenuButton);t=c.enableActionModeMenuButton;}if(c.enableActionModeFloatingButton!==undefined){m.setProperty("/actionModeFloatingButtonEnabled",c.enableActionModeFloatingButton);t=t||c.enableActionModeFloatingButton;}m.setProperty("/tileActionModeEnabled",t);if(c.enableTileActionsIcon!==undefined){m.setProperty("/tileActionsIconEnabled",sap.ui.Device.system.desktop?c.enableTileActionsIcon:false);}if(c.enableHideGroups!==undefined){m.setProperty("/enableHideGroups",c.enableHideGroups);}if(c.title){m.setProperty("/title",c.title);}m.setProperty("/enableHelp",!!c.enableHelp);}},_getLogonFrameProvider:function(){var v=this.getView();return{create:function(){return v.createIFrameDialog();},show:function(){v.showIFrameDialog();},destroy:function(){v.destroyIFrameDialog();}};},onExit:function(){sap.ui.getCore().getEventBus().unsubscribe("externalSearch",this.externalSearchTriggered,this);sap.ui.getCore().getEventBus().unsubscribe("showCatalog",this.showCatalog,this);sap.ui.getCore().getEventBus().unsubscribe("openApp",this.openApp,this);this.oShellNavigation.hashChanger.destroy();this.getView().aDanglingControls.forEach(function(C){if(C.destroyContent){C.destroyContent();}C.destroy();});this.getView().oDashboardManager.destroy();sap.ushell.UserActivityLog.deactivate();},getModel:function(){return m;},showCatalog:function(C,e,D){if(!this.isCatalogExist()){var o=sap.ui.view({id:this.catalogPageId,viewName:"sap.ushell.renderers.fiori2.launchpad.catalog.Catalog",viewData:{},type:sap.ui.core.mvc.ViewType.JS});this.oNavContainer.addPage(o);}this.switchViewState("catalog");this.oNavContainer.to(this.catalogPageId,this.getAnimationType());this.setAppIcons({title:sap.ushell.resources.i18n.getText("tile_catalog")});sap.ushell.services.AppConfiguration.setCurrentApplication(null);this.oLoadingDialog.closeLoadingScreen();sap.ui.getCore().getEventBus().publish("showCatalogEvent",D);jQuery(document).off('keydown.dashboard');jQuery(document).off('keydown.catalog');jQuery(document).on('keydown.catalog',sap.ushell.renderers.fiori2.AccessKeysHandler.catalogKeydownHandler);},isCatalogExist:function(){return(sap.ui.getCore().byId(this.catalogPageId))?true:false;},getAnimationType:function(){return sap.ui.Device.os.android?"show":"slide";},onCurtainClose:function(e){jQuery.sap.log.warning("Closing Curtain",e);},handleDataLoss:function(n,o){if(sap.ushell.Container.getDirtyFlag()){if(!sap.ushell.resources.browserI18n){sap.ushell.resources.browserI18n=sap.ushell.resources.getTranslationModel(window.navigator.language).getResourceBundle();}if(confirm(sap.ushell.resources.browserI18n.getText("dataLossInternalMessage"))){sap.ushell.Container.setDirtyFlag(false);return this.oShellNavigation.NavigationFilterStatus.Continue;}else{return this.oShellNavigation.NavigationFilterStatus.Abandon;}}return this.oShellNavigation.NavigationFilterStatus.Continue;},doShowMessage:function(t,M,p){jQuery.sap.require("sap.m.MessageToast");jQuery.sap.require("sap.m.MessageBox");if(t===sap.ushell.services.Message.Type.ERROR){if(sap.ushell.Container.getService("SupportTicket").isEnabled()&&M!==sap.ushell.resources.i18n.getText("supportTicketCreationFailed")){try{jQuery.sap.require("sap.ushell.ui.launchpad.EmbeddedSupportErrorMessage");var f=new sap.ushell.ui.launchpad.EmbeddedSupportErrorMessage("EmbeddedSupportErrorMessage",{title:p.title||sap.ushell.resources.i18n.getText("error"),content:new sap.m.Text({text:M})});f.open();}catch(e){sap.m.MessageBox.show(M,sap.m.MessageBox.Icon.ERROR,p.title||sap.ushell.resources.i18n.getText("error"));}}else{sap.m.MessageBox.show(M,sap.m.MessageBox.Icon.ERROR,p.title||sap.ushell.resources.i18n.getText("error"));}}else if(t===sap.ushell.services.Message.Type.CONFIRM){if(p.actions){sap.m.MessageBox.show(M,sap.m.MessageBox.Icon.QUESTION,p.title,p.actions,p.callback);}else{sap.m.MessageBox.confirm(M,p.callback,p.title);}}else{sap.m.MessageToast.show(M,{duration:p.duration||3000});}},doHashChange:function(S,A,o,O,p){if(!a){a=true;return;}S=this.fixShellHash(S);var e=this.history.getHistoryLength();if(p){this.hashChangeFailure(e,p.message,null,"sap.ushell.renderers.fiori2.Shell.controller");return;}this.history.hashChange(S,o);var f=sap.ushell.Container.getService("URLParsing"),g=f.parseShellHash(S),C=m.getProperty("/currentState"),i=C&&C.stateName==="catalog",h=g&&g.action!==sap.ushell.renderers.fiori2.Navigation.CATALOG.ACTION;if(!i||h){this.oLoadingDialog.setText("");this.oLoadingDialog.openLoadingScreen();}if(g&&g.contextRaw&&g.contextRaw==="navResCtx"){var j={};j.additionalInformation=g.params.additionalInformation[0];j.url=g.params.url[0];j.applicationType=g.params.applicationType[0];this.openSomething(S,A,o,O,j);}else{sap.ushell.Container.getService("NavTargetResolution").resolveHashFragment(S).done(jQuery.proxy(this.openSomething,this,S,A,o,O)).fail(jQuery.proxy(function(M){this.hashChangeFailure(e,"Failed to resolve navigation target: "+S,M,"sap.ushell.renderers.fiori2.Shell.controller");},this));}},hashChangeFailure:function(h,M,D,C){this.reportError(M,D,C);this.oLoadingDialog.closeLoadingScreen();this.delayedMessageError(sap.ushell.resources.i18n.getText("fail_to_start_app_try_later"));if(h===0){hasher.setHash("");}else{this.historyBack();}},reportError:function(M,D,C){jQuery.sap.log.error(M,D,C);},delayedMessageError:function(M){setTimeout(function(){sap.ushell.Container.getService("Message").error(M);},0);},fixShellHash:function(S){if(!S){S='#';}else if(S.charAt(0)!=='#'){S='#'+S;}return S;},historyBack:function(){window.history.back(1);},initiateApplication:function(A,o){o.oMetadata=sap.ushell.services.AppConfiguration.getMetadata(A);sap.ui.getCore().getEventBus().publish("openApp",o);},requireCoreExt:function(){try{jQuery.sap.require('sap.fiori.core-ext');}catch(e){jQuery.sap.log.warning("failed to load sap.fiori.core-ext!");}},openSomething:function(S,A,o,O,f){var g,t=this;if(!this.oNavContainer.getParent()){sap.ui.getCore().byId("shell").addContent(this.oNavContainer);}if(f){try{g=sap.ushell.Container.getService("URLParsing").parseShellHash(S);}catch(e){g=undefined;}if(g===undefined){jQuery.sap.log.warning("Could not parse shell hash: "+S);g={};}g.sShellHash=S;g.sAppPart=A;g.sOldShellHash=o;g.sOldAppPart=O;g.oApplication=f;if(f.applicationType===sap.ushell.renderers.fiori2.Navigation.CATALOG.ID){if(m.getProperty("/personalization")){sap.ui.getCore().getEventBus().publish("showCatalog",g);}else{hasher.setHash("");}}else{if(this.oCoreExtLoadingDeferred!==undefined){this.oCoreExtLoadingDeferred.promise().fail(function(){jQuery.sap.log.warning("failed to load core-ext by web worker, performing require");t.requireCoreExt();}).always(function(){t.initiateApplication(f,g);});}else{this.requireCoreExt();t.initiateApplication(f,g);}}}else{this.openDashboard();}},openDashboard:function(){var o=m.getProperty("/currentState")&&m.getProperty("/currentState").stateName==="catalog";this.switchViewState("home");this.oNavContainer.backToTop();sap.ushell.services.AppConfiguration.setCurrentApplication(null);this.setAppIcons(null);if(o){sap.ushell.utils.addBottomSpace();}try{sap.ushell.utils.handleTilesVisibility();}catch(e){}this.oLoadingDialog.closeLoadingScreen();jQuery(document).off('keydown.dashboard');jQuery(document).off('keydown.catalog');jQuery(document).on('keydown.dashboard',sap.ushell.renderers.fiori2.AccessKeysHandler.dashboardKeydownHandler);var f=sap.ui.getCore().byId('shell');f.focusOnConfigBtn();if(sap.ushell.Layout){sap.ushell.Layout.reRenderGroupsLayout(null,true);}},openApp:function(C,E,D){jQuery.sap.log.warning("Triggering navigation to ",D);var A=D.oApplication,M=D.oMetadata||{},i=null,f=D.sShellHash.replace(/\W/g,"-"),g=M.title||"",h=M.icon||null;if(c&&c.enableTilesOpacity){setTimeout(function(){if(sap.ushell.Container){u.addAppUsage(D.sShellHash);}},700);}if(A){try{if(A.applicationType==="NWBC"&&!(D&&D.contextRaw&&D.contextRaw==="navResCtx")&&this.history.getHistoryLength()>1&&this.history._history[this.history.getHistoryLength()-2]!==D.sShellHash){this.openNWBCApp(A,D);return;}if(!this.oNavContainer.getPage("application"+f)&&!this.oNavContainer.getPage("shellPage"+f)){i=this.getWrappedApplication(A,D,M);this.oNavContainer.addPage(i);sap.ushell.services.AppConfiguration.setCurrentApplication(A);this.oLoadingDialog.showAppInfo(g,h);}else if(this.oNavContainer.getPage("application"+f)||this.oNavContainer.getPage("shellPage"+f)){i=this.oNavContainer.getPage("application"+f)||this.oNavContainer.getPage("shellPage"+f);}this.setAppIcons(M);if(A.applicationType[0]==="NWBC"||A.applicationType==="NWBC"){this.switchViewState("minimal");if(D.contextRaw==="navResCtx"){a=false;hasher.replaceHash(D.params.original_intent[0]);}}else{var j="app";if(d.indexOf(c.appState)>=0){j=c.appState;}this.switchViewState(j);}if(this.history.backwards&&this.oNavContainer.getInitialPage()!==this.oNavContainer.getCurrentPage().getId()){this.oNavContainer.to(i,"slideBack");}else{this.oNavContainer.to(i,this.oNavContainer.getInitialPage()?"slide":"show");}setTimeout(function(){this.oLoadingDialog.closeLoadingScreen();}.bind(this),300);}catch(e){if(e.stack){jQuery.sap.log.error("Application initialization failed due to an Exception:\n"+e.stack);}this.restoreNavContainerAfterFailure();this.hashChangeFailure(this.history.getHistoryLength(),e.name,e.message,g);}}if(this.history.getHistoryLength()<1){this.oLoadingDialog.closeLoadingScreen();}},restoreNavContainerAfterFailure:function(){this.oNavContainer.removePage(this.oNavContainer.getCurrentPage()).destroy();var o=this.oNavContainer.removeAllPages();this.oNavContainer.destroy();this.oNavContainer=this.getView().initNavContainer(this);jQuery.each(o,jQuery.proxy(function(i,v){if(!this.oNavContainer.getPage(v.getId())){this.oNavContainer.addPage(v);}if(v.getId()===this.oNavContainer.getInitialPage()){v.removeStyleClass("sapMNavItemHidden");}},this));},getWrappedApplication:function(A,D,M){var o,i,e=M.title||"",f=D.sShellHash.replace(/\W/g,"-");jQuery.sap.require('sap.ushell.components.container.ApplicationContainer');o=new sap.ushell.components.container.ApplicationContainer("application"+f,A);this.publishNavigationStateEvents(o,D);if(!M.fullWidth&&A.applicationType!=="NWBC"){jQuery.sap.require("sap.m.Shell");i=new sap.m.Shell("shellPage"+f,{logo:sap.ui.resource('sap.ui.core','themes/base/img/1x1.gif'),title:e,showLogout:false,app:o}).addStyleClass("sapUshellApplicationPage");if(!e){i.addStyleClass("sapUshellApplicationPageNoHdr");}}else{o.addStyleClass('sapMShellGlobalInnerBackground');i=o;}return i;},openNWBCApp:function(A,D){a=false;window.history.back(1);var t=D;var S=D;var e;S.params.additionalInformation=A.additionalInformation;S.params.url=A.url;S.params.applicationType=A.applicationType;S.params.original_intent=D.sShellHash;S.target=t;t.contextRaw=S.contextRaw="navResCtx";var o=sap.ushell.Container.getService("ShellNavigation").hrefForExternal(S,true);if(o.skippedParams){e=o.params.original_intent[0];}else{e=o.hash;}this.openAppNewWindow(e);this.oLoadingDialog.closeLoadingScreen();},publishNavigationStateEvents:function(A,D){var o=A.onAfterRendering;A.onAfterRendering=function(){if(o){o.apply(this,arguments);}sap.ushell.renderers.fiori2.utils.publishExternalEvent("appOpened",D);};var e=A.exit;A.exit=function(){if(e){e.apply(this,arguments);}sap.ushell.renderers.fiori2.utils.publishExternalEvent("appClosed",D.oApplication);};},openAppNewWindow:function(e){window.open(e);},setAppIcons:function(M){var e=jQuery.sap.getModulePath("sap.ushell");var l=(M&&M.homeScreenIconPhone)||(e+'/themes/base/img/launchicons/57_iPhone_Desktop_Launch.png'),L=(M&&M["homeScreenIconPhone@2"])||(e+'/themes/base/img/launchicons/114_iPhone-Retina_Web_Clip.png'),o=(M&&M.homeScreenIconTablet)||(e+'/themes/base/img/launchicons/72_iPad_Desktop_Launch.png'),f=(M&&M["homeScreenIconTablet@2"])||(e+'/themes/base/img/launchicons/144_iPad_Retina_Web_Clip.png'),F=(M&&M.favIcon)||(e+'/themes/base/img/launchpad_favicon.ico'),t=(M&&M.title)||sap.ushell.resources.i18n.getText("homeBtn_tooltip"),C=this.getFavIconHref();if(sap.ui.Device.os.ios){jQuery.sap.setIcons({'phone':l,'phone@2':L,'tablet':o,'tablet@2':f,'favicon':F,'precomposed':true});}else if(C!==F){jQuery.sap.setIcons({'phone':'','phone@2':'','tablet':'','tablet@2':'','favicon':F,'precomposed':true});}window.document.title=t;},getFavIconHref:function(){return jQuery('link').filter('[rel="shortcut icon"]').attr('href')||'';},externalSearchTriggered:function(C,e,D){m.setProperty("/searchTerm",D.searchTerm);D.query=D.searchTerm;},onAfterNavigate:function(e){var h=this.oNavContainer.getInitialPage(),f=e.getParameter("fromId");if(f!==h&&f!==this.catalogPageId){this.oNavContainer.removeAggregation("pages",f,true);sap.ui.getCore().byId(f).destroy();}this.oLoadingDialog.closeLoadingScreen();},onAfterRendering:function(){if(window.f2p){f2p.add(f2p.m.endHomePage);}},navigateToHome:function(e){if(!e||(e&&e.getParameter("id")==='homeBtn')){hasher.setHash("");}else{sap.ushell.renderers.fiori2.Navigation.openCatalogByHash();}},toggleSearch:function(i){m.setProperty("/searchAvailable",i);},toggleRtlMode:function(r){m.setProperty("/rtl",r);},togglePane:function(e){var S=e.getSource(),f=S.getSelected();if(!sap.ui.getCore().byId('groupList')&&(!this.getModel().getProperty||this.getModel().getProperty('/states/home/paneContent').length===0)){var g=this.getView().oDashboardManager.getGroupListView();if(sap.ui.Device.system.desktop){g.addStyleClass("sapUshellGroupListDesktopScrollbar");}this.getModel().setProperty('/states/home/paneContent',[g.getId()]);this.getModel().setProperty('/currentState/paneContent',[g.getId()]);}if(e.getParameter("id")==="categoriesBtn"){S.getModel().setProperty("/currentState/showCurtainPane",!f);}else{S.getModel().setProperty("/currentState/showPane",!f);if(S.getModel().getProperty&&S.getModel().getProperty('/currentState/paneContent').indexOf('groupList')!==-1){setTimeout(function(){var o=sap.ui.getCore().byId("shell");if(o){o.setFocusOnFirstGroupInList();}},1500);}}},getActiveViews:function(){var C=this.getModel().getProperty("/currentState/curtainContent"),p=sap.ui.getCore().byId(C[0]),A=[];jQuery.each(p.getContent(),function(i,v){A.push(v.getId());});return A;},getLastSearchScreen:function(){return m.getProperty("/lastSearchScreen");},saveSearchScreen:function(S){if(S==='historyScreen'||S==='searchResults'||S==='suggestions'){m.setProperty("/lastSearchScreen",S);}},switchViewState:function(S,e){if(m.getProperty("/personalization")){jQuery.sap.require("sap.ushell.renderers.fiori2.ActionMode");}var p=S[0]==="/"?S:"/states/"+S,o=m.getProperty(p),C=m.getProperty("/currentState")||{};var f=m.getProperty("/currentState/stateName");if(f){if((f!=="home")&&(f!=="catalog")){var g=m.getProperty("/currentState/shellActions");if(g){var h=m.getProperty("/states/"+f+"/actions");h.length=0;for(var i=0;i<g.length;i++){h.push(g[i]);}m.setProperty("/states/"+f+"/actions",h);}}}this.saveSearchScreen(S);if(!!e){m.setProperty("/lastState",C);}o=jQuery.extend({},C,o);var j=C.floatingActions;var n=o.floatingActions;if(j){j.forEach(function(F){if(!n||n.indexOf(F)==-1){sap.ui.getCore().byId(F).setVisible(false);}});}if(n){n.forEach(function(F,I,A){var l=sap.ui.getCore().byId(F),q=o.footer;if(A.length==1){l.setVisible(true);}else{l.setVisible(false);}if(q.length>0){l.addStyleClass("sapUshellRoundedActionButtonWithFooter");}},this);}if(n&&(n.length>1)){this.addMultipleActionsButton(n);}else{this.toggleFloatingMultipleActionsButton(false);}m.setProperty("/currentState",o);if(S==="searchResults"){m.setProperty("/lastSearchScreen",'');if(!hasher.getHash().indexOf("Action-search")===0){var k=sap.ui.getCore().getModel("searchModel");hasher.setHash("Action-search&/searchTerm="+k.getProperty("/searchBoxTerm")+"&dataSource="+JSON.stringify(k.getDataSourceJson()));}}},toggleFloatingMultipleActionsButton:function(v){var B=sap.ui.getCore().byId("floatingMultipleActionsButton");if(B){B.setVisible(v);}},addMultipleActionsButton:function(f){if(!sap.ui.getCore().byId("floatingMultipleActionsButton")){var F=new sap.ushell.ui.shell.ActionButton({id:"floatingMultipleActionsButton",icon:'sap-icon://add',visible:true,press:function(e){var p=sap.ui.getCore().byId('floatingMultipleActionsButton').$();var i=this.$().find('span');i.addClass('sapUshellShellActionButtonTransition');if(!i.hasClass('sapUshellShellActionButtonRotate')){i.addClass('sapUshellShellActionButtonRotate');var t=parseInt(p.outerHeight(),10)+parseInt(p.css('bottom'),10);f.forEach(function(o,I){var B=sap.ui.getCore().byId(o);B.setVisible(true);B.addStyleClass('sapUshellShellActionButtonTransition');setTimeout(function(){B.$().css('transform',"translateY(-"+(t*(I+1))+"px)");},0);});}else{i.removeClass('sapUshellShellActionButtonRotate');f.forEach(function(o){var B=sap.ui.getCore().byId(o);var t=parseInt(p.css('bottom'),10);B.$().css('transform',"translateY(-"+t+"px)");setTimeout(function(){B.setVisible(false);},150);});}},tooltip:sap.ushell.resources.i18n.getText("XXX")});this.getView().insertContent(F,1);}else{this.toggleFloatingMultipleActionsButton(true);}},pressActionBtn:function(e){if(!sap.ui.Device.system.desktop){var o=this.getModel().getProperty("/currentState").headerHiding;this.getModel().setProperty("/currentState/headerHiding",false);}var A=sap.ui.getCore().byId('headActions');if(!A){var f=new sap.ushell.ui.footerbar.UserPreferencesButton("userPreferencesButton"),l=new sap.ushell.ui.footerbar.LogoutButton("logoutBtn"),g=new sap.ushell.ui.footerbar.AboutButton("aboutBtn");this._setUserPrefModel();jQuery.sap.require("sap.ushell.ui.footerbar.HideGroupsButton");var h=new sap.ushell.ui.footerbar.HideGroupsButton("hideGroupsBtn");if(!this.getModel().getProperty('/enableHideGroups')){h.setVisible(false);}jQuery.sap.require('sap.ushell.ui.footerbar.ContactSupportButton');jQuery.sap.require('sap.ushell.ui.footerbar.EndUserFeedback');var C=new sap.ushell.ui.footerbar.ContactSupportButton("ContactSupportBtn",{visible:this.bContactSupportEnabled}),E=new sap.ushell.ui.footerbar.EndUserFeedback("EndUserFeedbackBtn",{visible:'{/showEndUserFeedback}',showAnonymous:this.oEndUserFeedbackConfiguration.showAnonymous,showLegalAgreement:this.oEndUserFeedbackConfiguration.showLegalAgreement,showCustomUIContent:this.oEndUserFeedbackConfiguration.showCustomUIContent,feedbackDialogTitle:this.oEndUserFeedbackConfiguration.feedbackDialogTitle,textAreaPlaceholder:this.oEndUserFeedbackConfiguration.textAreaPlaceholder,customUIContent:this.oEndUserFeedbackConfiguration.customUIContent});if(this.getModel().getProperty("/enableHelp")){f.addStyleClass('help-id-loginDetails');l.addStyleClass('help-id-logoutBtn');g.addStyleClass('help-id-aboutBtn');h.addStyleClass('help-id-hideGroupsBtn');E.addStyleClass('help-id-EndUserFeedbackBtn');C.addStyleClass('help-id-contactSupportBtn');}A=new sap.m.ActionSheet("headActions",{placement:sap.m.PlacementType.Bottom,buttons:{path:"/currentState/actions",factory:function(i,j){return sap.ui.getCore().byId(j.getObject());}}});A.updateAggregation=this.getView().updateShellAggregation;A.setModel(this.getModel());this.getView().aDanglingControls.push(A,f,l,g,C,E,h);A.attachAfterClose(A,function(){if(!sap.ui.Device.system.desktop){this.getModel().setProperty("/currentState/headerHiding",o);}});}A.openBy(e.getSource());},loadUserImage:function(){if(!U){this.getView().loadUserImage();U=true;}},loadCoreExt:function(){var A=jQuery.sap.isDeclared('sap.fiori.core',true)||jQuery.sap.isDeclared('sap.fiori.core-ext',true),l,p='',t=this;if(A){return;}this.oCoreExtLoadingDeferred=jQuery.Deferred();if(window.Worker){p=jQuery.sap.getModulePath('sap.ushell.loader','.js');l=new window.Worker(p);l.onmessage=function(E){if(E.data&&!E.data.error){try{window.eval(E.data);jQuery.sap.declare('sap.fiori.core-ext'+'');t.oCoreExtLoadingDeferred.resolve();setTimeout(function(){sap.ui.getCore().getEventBus().publish("launchpad","coreExtLoaded");},0);}catch(e){t.oCoreExtLoadingDeferred.reject();jQuery.sap.log.warning('failed to load sap.fiori.core-ext');}}else{jQuery.sap.log.warning('failed to load sap.fiori.core-ext');t.oCoreExtLoadingDeferred.reject();}l.terminate();};l.postMessage({action:'loadResource',url:window['sap-ui-debug']?'../fiori/core-ext-dbg.js':'../fiori/core-ext.js'});}else{setTimeout(function(){try{jQuery.sap.require('sap.fiori.core-ext');this.oCoreExtLoadingDeferred.resolve();setTimeout(function(){sap.ui.getCore().getEventBus().publish("launchpad","coreExtLoaded");},0);}catch(e){this.oCoreExtLoadingDeferred.reject();jQuery.sap.log.warning("failed to load sap.fiori.core-ext");}},0);}},_setUserPrefModel:function(){var e=m.getProperty("/userPreferences/entries");var D=this._getUserPrefDefaultModel();D.entries=D.entries.concat(e);m.setProperty("/userPreferences",D);},_getUserPrefDefaultModel:function(){jQuery.sap.require("sap.ushell.ui.footerbar.UserPrefThemeSelector");var o=sap.ushell.Container.getUser();var l=o.getLanguage();var e=window.location.host;var f=sap.ushell.resources.i18n.getText("languageFld");var g=sap.ushell.resources.i18n.getText("serverFld");var t=new sap.ushell.ui.footerbar.UserPrefThemeSelector();return{dialogTitle:sap.ushell.resources.i18n.getText("userPreferences"),isDetailedEntryMode:false,activeEntryPath:null,entries:[{entryHelpID:"serverName",title:g,editable:false,valueArgument:e,valueResult:null},{entryHelpID:"language",title:f,editable:false,valueArgument:l,valueResult:null},{entryHelpID:"themes",title:t.getTitle(),editable:t.getIsChangeThemePermitted(),valueArgument:t.getValue.bind(t),valueResult:null,onSave:t.getOnSave.bind(t),onCancel:t.getOnCancel.bind(t),contentFunc:t.getContent.bind(t),contentResult:null}]};},addHeaderItem:function(i,S,e,f){var n=Array.prototype.slice.call(arguments);n.splice(0,0,"headItems");this._addHeaderItem.apply(this,n);},addHeaderEndItem:function(i,S,e,f){var n=Array.prototype.slice.call(arguments);n.splice(0,0,"headEndItems");this._addHeaderItem.apply(this,n);},_addHeaderItem:function(p,I,S,e,f){if(typeof I!=="object"||!I.getId){throw new Error("oItem value is invalid");}var n=Array.prototype.slice.call(arguments);n.splice(0,1);var P=this._getPassStates.apply(this,n);for(var i=0;i<P.length;i++){var h=s[P[i]][p];var o;if(h.length===1){var E=p.substring(0,p.length-1);jQuery.sap.log.warning("You can only add one "+E+". Replacing existing headItem: "+h[0]+" in state: "+P[i]+", with the new headItem: "+I.getId()+".");o=h[h.length-1];h.splice(h.length-1,1);}h.push(I.getId());var M=this._getModelStates(P[i]);for(var j=0;j<M.length;j++){this._addHeaderItemToModel(I,p,M[j],o);}}},_addHeaderItemToModel:function(i,p,S,o){var e="/states/"+S+"/"+p;var h=m.getProperty(e);if(o){var f=h.indexOf(o);h.splice(f,1);}if((S=="embedded")&&(p=="headEndItems")){var g=h.indexOf("standardActionsBtn");h.splice(g,0,i.getId());}else{h.push(i.getId());}m.setProperty(e,h);},removeHeaderItem:function(i,S,e,f){var n=Array.prototype.slice.call(arguments);n.splice(0,0,"headItems");this._removeHeaderItem.apply(this,n);},removeHeaderEndItem:function(i,S,e,f){var n=Array.prototype.slice.call(arguments);n.splice(0,0,"headEndItems");this._removeHeaderItem.apply(this,n);},addEndUserFeedbackCustomUI:function(C,S){if(C){this.oEndUserFeedbackConfiguration.customUIContent=C;}if(S===false){this.oEndUserFeedbackConfiguration.showCustomUIContent=S;}},_removeHeaderItem:function(p,I,S,e,f){if(typeof I!=="object"||!I.getId){throw new Error("oItem value is invalid");}var n=Array.prototype.slice.call(arguments);n.splice(0,1);var P=this._getPassStates.apply(this,n);for(var i=0;i<P.length;i++){var h=s[P[i]][p];var g=h.indexOf(I.getId());if(g>-1){h.splice(g,1);}else{jQuery.sap.log.warning("You cannot remove headItem: "+I.getId()+", the headItem does not exists.");return;}var M=this._getModelStates(P[i]);for(var j=0;j<M.length;j++){this._removeHeaderItemFromModel(I,p,M[j]);}}},_removeHeaderItemFromModel:function(i,p,S){var e="/states/"+S+"/"+p;var h=m.getProperty(e);var f=h.indexOf(i.getId());if(f>-1){h.splice(f,1);}m.setProperty(e,h);},addOptionsActionSheetButton:function(B,S,e,f){Array.prototype.unshift.call(arguments,false);return this._addOptionsActionSheetButton.apply(this,arguments);},_addOptionsActionSheetButton:function(e,B,S,f,g){if(typeof B!=="object"||!B.getId){throw new Error("oButton value is invalid");}var p=this._getPassStates.apply(this,Array.prototype.splice.call(arguments,1));for(var i=0;i<p.length;i++){var P=s[p[i]]["actions"];P.push(B.getId());var M=this._getModelStates(p[i]);for(var j=0;j<M.length;j++){if(M[j]=="home"||M[j]=="catalog"){this._addOptionsActionSheetButtonToModel(B,e,M[j],"actions");}else{this._addOptionsActionSheetButtonToModel(B,e,M[j],"actions");this._addOptionsActionSheetButtonToModel(B,e,M[j],"shellActions");}}}},_addOptionsActionSheetButtonToModel:function(B,i,S,p){var e="/states/"+S+"/"+p;var A=m.getProperty(e);if(i){A.unshift(B.getId());}else{var l=A.indexOf("logoutBtn");if(l>-1){A.splice(l,0,B.getId());}else{A.push(B.getId());}}m.setProperty(e,A);},removeOptionsActionSheetButton:function(B,S,e,f){if(typeof B!=="object"||!B.getId){throw new Error("oButton value is invalid");}var p=this._getPassStates.apply(this,arguments);for(var i=0;i<p.length;i++){var P=s[p[i]]["actions"];var g=P.indexOf(B.getId());if(g>-1){P.splice(g,1);}else{jQuery.sap.log.warning("You cannot remove button: "+B.getId()+" from the launchpad state: "+p[i]+", the button was not added using 'sap.ushell.renderers.fiori2.RendererExtensions.addOptionsActionSheetButton'.");continue;}var M=this._getModelStates(p[i]);for(var j=0;j<M.length;j++){if(M[j]=="home"||M[j]=="catalog"){this._removeOptionsActionSheetButtonFromModel(B,M[j],"actions");}else{this._removeOptionsActionSheetButtonFromModel(B,M[j],"actions");this._removeOptionsActionSheetButtonFromModel(B,M[j],"shellActions");}}}},_removeOptionsActionSheetButtonFromModel:function(B,S,p){var e="/states/"+S+"/"+p;var A=m.getProperty(e);var i=A.indexOf(B.getId());if(i>-1){A.splice(i,1);}m.setProperty(e,A);},setFooter:function(f){if(typeof f!=="object"||!f.getId){throw new Error("oFooter value is invalid");}var p=s["allStates"]["footer"];if(p!=null){jQuery.sap.log.warning("You can only set one footer. Replacing existing footer: "+p+", with the new footer: "+f.getId()+".");}s["allStates"]["footer"]=f.getId();var M=["home","catalog","app","minimal","standalone","embedded"];for(var j=0;j<M.length;j++){var e="/states/"+M[j]+"/footer";var F=m.getProperty(e);if(F.length>0){F.pop();}F.push(f.getId());m.setProperty(e,F);}},removeFooter:function(){var p=s["allStates"]["footer"];if(p==null){jQuery.sap.log.warning("There is no footer to remove.");return;}s["allStates"]["footer"]=null;var M=["home","catalog","app","minimal","standalone","embedded"];for(var j=0;j<M.length;j++){var e="/states/"+M[j]+"/footer";var f=m.getProperty(e);if(f.length>0){f.pop();}m.setProperty(e,f);}},_getPassStates:function(I,S,e,f){var p=[];if(arguments.length==1){p=["app","catalog","home"];}else{p=Array.prototype.slice.call(arguments,1,arguments.length);}for(var i=0;i<p.length;i++){if(p[i]!="home"&&p[i]!="app"&&p[i]!="catalog"){throw new Error("sLaunchpadState value is invalid");}}return p;},_getModelStates:function(S){var M=[];if(S=="app"){var e=["app","minimal","standalone","embedded"];M=M.concat(e);}else{M.push(S);}return M;},setFloatingAction:function(B,S,p,i){if(typeof B!=="object"||!B.getId){throw new Error("oFooter type is invalid");}var e="/states/"+S+"/floatingActions";var f=m.getProperty(e);f.push(B.getId());m.setProperty(e,f);},addUserPreferencesEntry:function(e){this._validateUserPrefEntryConfiguration(e);this._updateUserPrefModel(e);},_validateUserPrefEntryConfiguration:function(e){if((!e)||(typeof e!=="object")){throw new Error("object oConfig was not provided");}if(!e.title){throw new Error("title was not provided");}if(!e.value){throw new Error("value was not provided");}if(typeof e.entryHelpID!=="undefined"){if(typeof e.entryHelpID!=="string"){throw new Error("entryHelpID type is invalid");}else{if(e.entryHelpID===""){throw new Error("entryHelpID type is invalid");}}}if(e.title&&typeof e.title!=="string"){throw new Error("title type is invalid");}if(typeof e.value!=="function"&&typeof e.value!=="string"&&typeof e.value!=="number"){throw new Error("value type is invalid");}if(e.onSave&&typeof e.onSave!=="function"){throw new Error("onSave type is invalid");}if(e.content&&typeof e.content!=="function"){throw new Error("content type is invalid");}if(e.onCancel&&typeof e.onCancel!=="function"){throw new Error("onCancel type is invalid");}},_updateUserPrefModel:function(e){var n={"entryHelpID":e.entryHelpID,"title":e.title,"editable":e.content?true:false,"valueArgument":e.value,"valueResult":null,"onSave":e.onSave,"onCancel":e.onCancel,"contentFunc":e.content,"contentResult":null};var f=m.getProperty("/userPreferences/entries");f.push(n);m.setProperty("/userPreferences/entries",f);},_setHeaderTitle:function(t){if(typeof t!=="string"){throw new Error("sTitle type is invalid");}m.setProperty("/title",t);}});}());

// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
(function(){"use strict";jQuery.sap.declare("sap.ushell.renderers.fiori2.ActionMode");var A=function(){var m=sap.ui.getCore().byId("shell").getModel(),S=sap.ui.getCore().byId("mainShell").getController();this.oEventBus=sap.ui.getCore().getEventBus();this.oEventBus.subscribe('launchpad','actionModeInactive',this.scrollToViewPoint,this);this.oEventBus.subscribe('launchpad','actionModeActive',this.scrollToViewPoint,this);this.viewPoint=undefined;c(m,S);},c=function(m,S){if(m.getProperty("/actionModeMenuButtonEnabled")){a(S,m);}if(m.getProperty("/actionModeFloatingButtonEnabled")){b(S,m);}},a=function(S,m){var t=new sap.m.Button("ActionModeBtn",{text:sap.ushell.resources.i18n.getText("activateActionMode"),icon:'sap-icon://edit',tooltip:sap.ushell.resources.i18n.getText("activateActionMode"),press:function(){sap.ushell.renderers.fiori2.ActionMode.toggleActionMode();}});S._addOptionsActionSheetButton(true,t,"home");if(m.getProperty("/enableHelp")){t.addStyleClass('help-id-ActionModeBtn');}},b=function(S,m){var f=new sap.ushell.ui.shell.ActionButton({id:"floatingActionBtn",icon:'sap-icon://edit',visible:false,press:function(e){sap.ushell.renderers.fiori2.ActionMode.toggleActionMode();},tooltip:sap.ushell.resources.i18n.getText("activateActionMode")});f.data("sap-ui-fastnavgroup","true",true);f.addEventDelegate({onsapskipback:function(e){e.preventDefault();sap.ushell.renderers.fiori2.AccessKeysHandler.goToTileContainer();},onsaptabprevious:function(e){e.preventDefault();if(!sap.ushell.renderers.fiori2.AccessKeysHandler.goToTileContainer()){sap.ui.getCore().byId('actionsBtn').focus();}}});if(m.getProperty("/enableHelp")){f.addStyleClass('help-id-floatingActionBtn');}S.setFloatingAction(f,"home");},s=function(e){var d=e.target;if(!$(d).hasClass("tileActionLayerDiv")){setTimeout($.proxy(sap.ushell.renderers.fiori2.ActionMode.deactivate(),sap.ushell.renderers.fiori2.ActionMode),0);}};A.prototype.activate=function(){var t=$(".sapUshellTile"),S=sap.ui.getCore().byId("shellPage"),f,T,d=this;this.eventDelegateObj={ontap:s,ontouchstart:s,onmousedown:s};jQuery.sap.require("sap.m.MessageToast");sap.m.MessageToast.show(sap.ushell.resources.i18n.getText("actionModeActivated"),{duration:4000});this.calcViewPosition();sap.ui.getCore().byId('shell').getModel().setProperty('/tileActionModeActive',true);this.aOrigHiddenGroupsIds=sap.ushell.utils.getCurrentHiddenGroupIds();f=sap.ui.getCore().byId("floatingActionBtn");if(f){f.addStyleClass("Active");f.setTooltip(sap.ushell.resources.i18n.getText("deactivateActionMode"));}T=sap.ui.getCore().byId("ActionModeBtn");if(T){T.setTooltip(sap.ushell.resources.i18n.getText("deactivateActionMode"));}this.oEventBus.publish('launchpad','actionModeActive');};A.prototype.calcViewPosition=function(){var j=jQuery('#dashboardGroups').find('.sapUshellTileContainer').not('.sapUshellHidden'),i;if(j){for(i=0;i<j.length;i++){var u=j[i],f=jQuery(u).parent().offset().top;if(f>0){var d=jQuery(u).attr("id"),g=sap.ui.getCore().byId(d),D={group:g,fromTop:f};this.viewPoint=D;return;}}}};A.prototype.scrollToViewPoint=function(){window.setTimeout(jQuery.proxy(this.oEventBus.publish,this.oEventBus,"launchpad","scrollToFirstVisibleGroup",this.viewPoint),0);};A.prototype.deactivate=function(){var S=sap.ui.getCore().byId("shellPage"),t=sap.ui.getCore().byId("TileActions"),T,f;this.calcViewPosition();sap.ui.getCore().byId('shell').getModel().setProperty('/tileActionModeActive',false);this.oEventBus.publish("launchpad",'actionModeInactive',this.aOrigHiddenGroupsIds);if(t!==undefined){t.destroy();}f=sap.ui.getCore().byId("floatingActionBtn");if(f){f.removeStyleClass("Active");f.setTooltip(sap.ushell.resources.i18n.getText("activateActionMode"));}T=sap.ui.getCore().byId("ActionModeBtn");if(T){T.setTooltip(sap.ushell.resources.i18n.getText("activateActionMode"));}};A.prototype.toggleActionMode=function(){var t=sap.ui.getCore().byId('shell').getModel().getProperty('/tileActionModeActive');if(t){this.deactivate();}else{this.activate();sap.ui.getCore().getEventBus().publish("launchpad","enterEditMode");}};A.prototype.activateGroupEditMode=function(g){var j=jQuery(g.getDomRef()).find('.sapUshellTileContainerContent'),t=j.find(".sapUshellTile"),d=this;j.addClass("tileContainerEditMode");};A.prototype._openActionsMenu=function(e,t){var d=this,T=t||e.getSource(),l=sap.ushell.Container.getService("LaunchPage"),f=[],o=sap.ui.getCore().byId("TileActions"),i,n,B,g,h,H;if(T){h=T.getBindingContext().getObject().object;f=l.getTileActions(h);}d.oTileControl=T;$(".tileActionLayerDivSelected").removeClass("tileActionLayerDivSelected");var j=$(e.getSource().getDomRef()).find(".tileActionLayerDiv");j.addClass("tileActionLayerDivSelected");if(o==undefined){o=new sap.m.ActionSheet("TileActions",{placement:sap.m.PlacementType.Auto,afterClose:function(){$(".tileActionLayerDivSelected").removeClass("tileActionLayerDivSelected");var E=sap.ui.getCore().getEventBus();E.publish("dashboard","actionSheetClose",d.oTileControl);}});}else{o.destroyButtons();}if(f.length==0||T.oParent.getProperty("isGroupLocked")){n=new sap.m.Button({text:sap.ushell.resources.i18n.getText("tileHasNoActions"),enabled:false});o.addButton(n);}else{for(i=0;i<f.length;i++){g=f[i];H=function(g){return function(){d._handleActionPress(g);};}(g);B=new sap.m.Button({text:g.text,icon:g.icon,press:H});o.addButton(B);}}o.openBy(e.getSource());};A.prototype._setUiActionsState=function(e){var d=this._getDashboardPage();if(e){d.uiActions.enable();}else{d.uiActions.disable();}};A.prototype._getDashboardPage=function(){var d=sap.ui.getCore().byId("mainShell"),e=d.oDashboardManager;return e.getDashboardView();};A.prototype._handleActionPress=function(o){if(o.press){o.press.call();}else if(o.targetURL){if(o.targetURL.indexOf("#")==0){hasher.setHash(o.targetURL);}else{window.open(o.targetURL,'_blank');}}else{sap.m.MessageToast.show("No Action");}};sap.ushell.renderers.fiori2.ActionMode=new A();}());

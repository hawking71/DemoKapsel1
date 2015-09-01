/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
jQuery.sap.declare("sap.ushell.ui.launchpad.GroupHeaderActions");jQuery.sap.require("sap.ushell.library");jQuery.sap.require("sap.ui.core.Control");sap.ui.core.Control.extend("sap.ushell.ui.launchpad.GroupHeaderActions",{metadata:{library:"sap.ushell",properties:{"isOverflow":{type:"boolean",group:"Misc",defaultValue:false},"tileActionModeActive":{type:"boolean",group:"Misc",defaultValue:false}},aggregations:{"content":{type:"sap.ui.core.Control",multiple:true,singularName:"content"},"overflowCtrl":{type:"sap.ui.core.Control",multiple:true,singularName:"overflowCtrl"}},events:{"afterRendering":{}}}});sap.ushell.ui.launchpad.GroupHeaderActions.M_EVENTS={'afterRendering':'afterRendering'};(function(){"use strict";sap.ushell.ui.launchpad.GroupHeaderActions.prototype.onAfterRendering=function(){this.fireAfterRendering();};sap.ushell.ui.launchpad.GroupHeaderActions.prototype._getActionOverflowControll=function(){var c=this;return[new sap.m.Button({icon:'sap-icon://overflow',type:'Transparent',press:function(e){var C=this,t=this;var a=new sap.m.ActionSheet({placement:sap.m.PlacementType.Auto});c.getContent().forEach(function(b){var d=b.clone();d.setModel(b.getModel());d.setBindingContext(b.getBindingContext());a.addButton(d);});a.openBy(e.getSource());}}).addStyleClass('sapUshellHeaderActionButton')];};}());
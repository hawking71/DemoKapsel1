/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','./library','sap/ui/core/Item'],function(q,l,I){"use strict";var S=I.extend("sap.m.SegmentedButtonItem",{metadata:{library:"sap.m",properties:{icon:{type:"string",group:"Appearance",defaultValue:null},width:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:null}},events:{press:{}}}});S.prototype.setProperty=function(p,v,s){var P=this.getParent();if(P&&P instanceof sap.m.SegmentedButton&&P.getButtons().length!==0){P.updateItems();}sap.ui.core.Control.prototype.setProperty.apply(this,arguments);};return S;},true);

/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.declare("sap.ca.scfld.md.ComponentBase");jQuery.sap.require("sap.ui.core.UIComponent");jQuery.sap.require("sap.ca.scfld.md.ConfigurationBase");jQuery.sap.require("sap.ui.core.routing.Router");jQuery.sap.require("sap.ui.core.routing.History");jQuery.sap.require("sap.m.routing.RouteMatchedHandler");sap.ui.core.UIComponent.extend("sap.ca.scfld.md.ComponentBase",{constructor:function(i,s){this._aQueue=[];this._bRouterCloseDialogs=true;var b=jQuery.proxy(function(){sap.ui.core.UIComponent.prototype.init.apply(this,arguments);this._routeMatchedHandler=new sap.m.routing.RouteMatchedHandler(this.getRouter(),this._bRouterCloseDialogs);},this);var a=jQuery.proxy(this.init,this);this.init=function(){b();a();var r=this.getRouter();r.initialize();};var B=jQuery.proxy(function(){this._routeMatchedHandler.destroy();},this);var A=jQuery.proxy(this.exit,this);this.exit=function(){A();B();};sap.ui.core.UIComponent.prototype.constructor.apply(this,arguments);},init:function(){},exit:function(){},setRouterSetCloseDialogs:function(c){this._bRouterCloseDialogs=c;if(this._routeMatchedHandler){this._routeMatchedHandler.setCloseDialogs(c);}}});
sap.ca.scfld.md.ComponentBase.createMetaData=function(a,A){var s=function(D,r){for(var R in r){if(!r[R].targetControl&&D.targetControl){r[R].targetControl=D.targetControl;}if(!r[R].targetAggregation&&D.targetAggregation){r[R].targetAggregation=D.targetAggregation;}if(!r[R].viewPath&&D.viewPath){r[R].viewPath=D.viewPath;}if(!r[R].viewLevel&&D.viewLevel){r[R].viewLevel=D.viewLevel;}}return r;};var m={};for(var p in A){if(p!=="viewPath"&&p!=="masterPageRoutes"&&p!=="detailPageRoutes"&&p!=="fullScreenPageRoutes"){m[p]=A[p];}}if(a==="MD"){m.routing={"config":{"viewType":"XML","viewPath":A.viewPath,"targetAggregation":"detailPages","viewLevel":undefined,"clearTarget":false},"routes":{"masterDetail":{"view":"MainSplitContainer","name":"masterDetail","viewPath":"sap.ca.scfld.md.view","targetControl":"fioriContent","targetAggregation":"pages","subroutes":{"master":{"pattern":"","view":"S2","targetControl":"MainSplitContainer","targetAggregation":"masterPages","viewLevel":0,"subroutes":{"detail":{"pattern":"detail/{contextPath}","view":"S3","viewLevel":1},"noData":{"pattern":"noData/{viewTitle}/{languageKey}","viewPath":"sap.ca.scfld.md.view","view":"empty","viewLevel":1}}},}},"fullScreen":{"view":"App","viewPath":"sap.ca.scfld.md.view","targetControl":"fioriContent","targetAggregation":"pages","subroutes":{}}}};}else{m.routing={"config":{"viewType":"XML","viewPath":A.viewPath,"targetAggregation":"pages","viewLevel":undefined,"clearTarget":false},"routes":{"fullScreen":{"view":"App","viewPath":"sap.ca.scfld.md.view","targetControl":"fioriContent","targetAggregation":"pages","subroutes":{"noData":{"pattern":"noData/{viewTitle}/{languageKey}","viewPath":"sap.ca.scfld.md.view","view":"empty","viewLevel":2}}}}};}var d;var M;var f;try{d=m.routing.routes.masterDetail.subroutes.master.subroutes;}catch(e){}try{M=m.routing.routes.masterDetail.subroutes;}catch(e){}try{f=m.routing.routes.fullScreen.subroutes;}catch(e){}if(d){jQuery.extend(true,d,A.detailPageRoutes);}if(M){jQuery.extend(true,M,A.masterPageRoutes);}if(f){jQuery.extend(true,f,A.fullScreenPageRoutes);}s({targetControl:"MainSplitContainer",targetAggregation:"masterPages",viewPath:A.viewPath,viewLevel:0},M);s({targetAggregation:"detailPages",viewPath:A.viewPath,viewLevel:1},d);s({targetControl:"app",targetAggregation:"pages",viewPath:A.viewPath,viewLevel:2},f);if(jQuery('#scfld-hiddenList-class').length===0){var i=jQuery('<style id="scfld-hiddenList-class" type="text/css">.hiddenList{display:none;}</style>');document.getElementsByTagName('head')[0].appendChild(i[0]);}return m;};

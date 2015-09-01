/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2015 SAP SE. All rights reserved
 */
jQuery.sap.declare("sap.viz.ui5.VizContainer");jQuery.sap.require("sap.viz.library");jQuery.sap.require("sap.viz.ui5.controls.common.BaseControl");sap.viz.ui5.controls.common.BaseControl.extend("sap.viz.ui5.VizContainer",{metadata:{publicMethods:["vizUpdate","vizSelection"],library:"sap.viz",properties:{"vizType":{type:"string",group:"Misc",defaultValue:null},"vizCss":{type:"string",group:"Misc",defaultValue:null},"vizProperties":{type:"object",group:"Misc",defaultValue:null},"enableMorphing":{type:"boolean",group:"Misc",defaultValue:null}},aggregations:{"vizData":{type:"sap.viz.ui5.data.Dataset",multiple:false},"analysisObjectsForPicker":{type:"sap.viz.ui5.controls.common.feeds.AnalysisObject",multiple:true,singularName:"analysisObjectsForPicker"},"feeds":{type:"sap.viz.ui5.controls.common.feeds.FeedItem",multiple:true,singularName:"feed"}},events:{"feedsChanged":{},"vizTypeChanged":{},"vizDefinitionChanged":{},"selectData":{},"deselectData":{},"showTooltip":{},"hideTooltip":{},"initialized":{}}}});sap.viz.ui5.VizContainer.M_EVENTS={'feedsChanged':'feedsChanged','vizTypeChanged':'vizTypeChanged','vizDefinitionChanged':'vizDefinitionChanged','selectData':'selectData','deselectData':'deselectData','showTooltip':'showTooltip','hideTooltip':'hideTooltip','initialized':'initialized'};jQuery.sap.require("sap.viz.libs.sap-viz");jQuery.sap.require("sap.viz.ui5.container.libs.common.libs.rgbcolor.rgbcolor_static");jQuery.sap.require("sap.viz.ui5.container.libs.sap-viz-controls-vizcontainer");jQuery.sap.require("sap.viz.ui5.controls.common.feeds.AnalysisObject");jQuery.sap.require("sap.viz.ui5.controls.common.feeds.FeedItem");jQuery.sap.require("sap.viz.ui5.controls.common.helpers.VizControlsHelper");jQuery.sap.includeStyleSheet(jQuery.sap.getModulePath("sap.viz.ui5.container.libs.css","/sap.viz.controls.css"));
sap.viz.ui5.VizContainer.prototype.init=function(){sap.viz.ui5.controls.common.BaseControl.prototype.init.apply(this,arguments);this._uiConfig={'layout':'horizontal','enableMorphing':true};this._vizFrame=null;this._vizBuilder=null;this._switchBar=null;this._vSplitter$=null;this._clearVariables();};
sap.viz.ui5.VizContainer.prototype.exit=function(){sap.viz.ui5.controls.common.BaseControl.prototype.exit.apply(this,arguments);this._clearVariables();this.setVizData(null);};
sap.viz.ui5.VizContainer.prototype._clearVariables=function(){this._vizFrame$=null;this._vizBuilder$=null;this._switchBar$=null;this._clearRequestedProperties();};
sap.viz.ui5.VizContainer.prototype._clearRequestedProperties=function(){this._requestedVizType='viz/column';this._requestedVizCss=null;this._requestedVizProperties=null;this._requestedOptions=null;};
sap.viz.ui5.VizContainer.prototype.setUiConfig=function(u){this._mergeConfig(u);};
sap.viz.ui5.VizContainer.prototype._mergeConfig=function(u){u=u||{};if(u.layout==='vertical'||u.layout==='horizontal'){this._uiConfig.layout=u.layout;}this._uiConfig.enableMorphing=u.enableMorphing!==false;};
sap.viz.ui5.VizContainer.prototype.getFeeds=function(){var f=[];if(this._vizFrame&&this._vizFrame.feeds()){f=sap.viz.ui5.controls.common.feeds.FeedItem.toFeeds(this._vizFrame.feeds());}else{f=this.getAggregation('feeds');}return f;};
sap.viz.ui5.VizContainer.prototype.getVizType=function(){if(this._vizFrame){return this._vizFrame.vizType();}else{return this._requestedVizType;}};
sap.viz.ui5.VizContainer.prototype.setVizType=function(v){if(this._vizFrame){this._vizFrame.vizType(v);}else{this._requestedVizType=v;}return this;};
sap.viz.ui5.VizContainer.prototype.getVizCss=function(){if(this._vizFrame){return this._vizFrame.vizCss();}else{return this._requestedVizCss;}};
sap.viz.ui5.VizContainer.prototype.setVizCss=function(v){if(this._vizFrame){this._vizFrame.vizCss(v);}else{this._requestedVizCss=v;}return this;};
sap.viz.ui5.VizContainer.prototype.getVizProperties=function(){if(this._vizFrame){return this._vizFrame.vizProperties();}else{return this._requestedVizProperties;}};
sap.viz.ui5.VizContainer.prototype.setVizProperties=function(v){if(this._vizFrame){this._vizFrame.vizProperties(v);}else{this._requestedVizProperties=v;}return this;};
sap.viz.ui5.VizContainer.prototype.getEnableMorphing=function(){if(this._vizFrame){return this._vizFrame.enableMorphing();}else{return this._uiConfig.enableMorphing;}};
sap.viz.ui5.VizContainer.prototype.setEnableMorphing=function(e){if(this._vizFrame){this._vizFrame.enableMorphing(e);}else{this._uiConfig.enableMorphing=e;}return this;};
sap.viz.ui5.VizContainer.prototype.vizSelection=function(p,a){if(this._vizFrame){var r=this._vizFrame.vizSelection.apply(this._vizFrame,arguments);if(r===this._vizFrame){r=this;}return r;}else{return null;}};
sap.viz.ui5.VizContainer.prototype.vizUpdate=function(o){if(this._vizFrame){if(o.data||o.feeds){this._requestedOptions=this._requestedOptions||{};}if(this._requestedOptions){var r=this._requestedOptions;r.css=r.css||o.css;r.properties=r.properties||o.properties;if(o.data){this.setVizData(o.data);}if(o.feeds){this._resetFeeds(o.feeds);}}else{this._vizFrame.vizUpdate(o);}}};
sap.viz.ui5.VizContainer.prototype._resetFeeds=function(f){this.destroyFeeds();sap.viz.ui5.controls.common.helpers.VizControlsHelper.updateFeedsByAAIndex(this.getVizType(),f);if(f&&f.length){for(var i=0;i<f.length;i++){this.addFeed(f[i]);}}return this;};
sap.viz.ui5.VizContainer.prototype._setAnalysisObjectsForPicker=function(a){this.destroyAnalysisObjectsForPicker();if(a&&a.length){for(var i=0;i<a.length;i++){this.addAnalysisObjectsForPicker(a[i]);}}return this;};
sap.viz.ui5.VizContainer.prototype._createVizFrame=function(d){var V=sap.viz.controls.frame.VizFrame;var G=sap.viz.controls.common.config.GlobalConfig;var v=G.defaultUIConfig(G.DEFAULT_UICONFIG_TYPE_FRAME);v.enableFilterMenu=false;v.enableFilterBar=false;v.enableSettingButton=false;v.enableFullScreenButton=false;v.controls.chart.enableMorphing=this._uiConfig.enableMorphing;v.controls.chart.enableTrellis=false;v.controls.contextMenu.menu=[["direction","stacking"],["legend","datalabels"]];var a=new V(d,v);a.addEventListener('feedsChanged',jQuery.proxy(function(e){this._resetFeeds(this.getFeeds());this.fireEvent("feedsChanged",{'feeds':this.getFeeds()});},this));a.addEventListener('vizTypeChanged',jQuery.proxy(function(e){this.fireEvent("vizTypeChanged");},this));a.addEventListener('vizDefinitionChanged',jQuery.proxy(function(e){this.fireEvent("vizDefinitionChanged");},this));a.vizOn('selectData',jQuery.proxy(function(e){this.fireEvent("selectData",e);},this));a.vizOn('deselectData',jQuery.proxy(function(e){this.fireEvent("deselectData",e);},this));a.vizOn('showTooltip',jQuery.proxy(function(e){this.fireEvent("showTooltip",e);},this));a.vizOn('hideTooltip',jQuery.proxy(function(e){this.fireEvent("hideTooltip",e);},this));a.vizOn('initialized',jQuery.proxy(function(e){this.fireEvent("initialized",e);},this));var o=a.getDefaultIncompleteOptions(this.getVizType());var f=this.getAggregation('feeds');if(f){o.feeds=sap.viz.ui5.controls.common.helpers.VizControlsHelper.getFeedInstances(f);}var b=sap.viz.ui5.controls.common.helpers.VizControlsHelper.getFakedDataInstance(this.getVizType(),this.getVizData(),f);if(b){o.data=b;}if(this.getVizCss()){o.css=this.getVizCss();}if(this.getVizProperties()){o.properties=this.getVizProperties();}this._clearRequestedProperties();a.createViz(o);return a;};
sap.viz.ui5.VizContainer.prototype._createChildren=function(){var a=this._app$;var c='ui5-viz-controls';var G=sap.viz.controls.common.config.GlobalConfig;this._vizFrame$=jQuery(document.createElement('div')).appendTo(a).addClass(c+'-viz-frame');this._vizFrame=this._createVizFrame(this._vizFrame$[0]);if(this._uiConfig.layout==='horizontal'){var v=G.defaultUIConfig(G.DEFAULT_UICONFIG_TYPE_BUILDER);v.controls.feedingPanel.enableTrellis=false;v.controls.switchBar.groups=sap.viz.ui5.controls.common.helpers.VizControlsHelper.getSwitchBarGroups();this._vizBuilder$=jQuery(document.createElement('div')).appendTo(a).addClass(c+'-viz-builder');this._vizBuilder=new sap.viz.controls.builder.VizBuilder(this._vizBuilder$[0],v);this._vizBuilder.connect(this._vizFrame.vizUid());this._vSplitter$=jQuery(document.createElement('div')).appendTo(a).addClass(c+'-vertical-splitter');}else if(this._uiConfig.layout==='vertical'){var s=G.defaultUIConfig(G.DEFAULT_UICONFIG_TYPE_SWITCHBAR);s.groups=sap.viz.ui5.controls.common.helpers.VizControlsHelper.getSwitchBarGroups();this._switchBar$=jQuery(document.createElement('div')).appendTo(a);this._switchBar=new sap.viz.controls.switchbar.SwitchBar(this._switchBar$[0],s);this._switchBar.connect(this._vizFrame.vizUid());}this._registerControl('sap.viz.controls.frame.VizFrame',this._vizFrame);if(this._vizBuilder){this._registerControl('sap.viz.controls.builder.VizBuilder',this._vizBuilder);}if(this._switchBar){this._registerControl('sap.viz.controls.switchbar.SwitchBar',this._switchBar);}this._validateAOs();this._validateSize();};
sap.viz.ui5.VizContainer.prototype._updateChildren=function(){var o={};if(this._requestedOptions){if(this._requestedOptions.css){o.css=this._requestedOptions.css;}if(this._requestedOptions.properties){o.properties=this._requestedOptions.properties;}this._requestedOptions=null;}o.data=sap.viz.ui5.controls.common.helpers.VizControlsHelper.getFakedDataInstance(this.getVizType(),this.getVizData(),this.getAggregation('feeds'));o.feeds=sap.viz.ui5.controls.common.helpers.VizControlsHelper.getFeedInstances(this.getAggregation('feeds'));this._vizFrame.vizUpdate(o);this._validateAOs();};
sap.viz.ui5.VizContainer.prototype._validateAOs=function(){if(this._vizBuilder){var a=sap.viz.ui5.controls.common.feeds.AnalysisObject.toInstances(this.getAnalysisObjectsForPicker());this._vizBuilder.analysisObjectsForPicker(a);}};
sap.viz.ui5.VizContainer.prototype._validateSize=function(){var s={'width':this.$().width(),'height':this.$().height()};if(this._uiConfig.layout==='horizontal'){this._app$.css({'min-width':'560px','min-height':'601px'});}else if(this._uiConfig.layout==='vertical'){this._app$.css({'min-width':'300px','min-height':'654px'});}this.$().css({'overflow':'hidden'});var a={'width':this._app$.width(),'height':this._app$.height()};if(this._uiConfig.layout==='horizontal'&&this._vizFrame){var b=this._vizBuilder$.width();this._vizFrame.size({'width':a.width-b,'height':a.height});this._vizBuilder.size({'width':b,'height':a.height-1});this._vizFrame$.css({'left':'0px','top':'0px'});this._vizBuilder$.css({'left':a.width-b+'px','top':'0px'});this._vSplitter$.css({'left':a.width-b+'px','top':'0px','height':a.height+'px'});}else if(this._uiConfig.layout==='vertical'&&this._vizFrame){var c=388;var d=54;this._vizFrame.size({'width':a.width,'height':a.height-d});this._switchBar.size({'width':c,'height':d});this._vizFrame$.css({'left':'0px','top':d+'px'});this._switchBar$.css({'left':(a.width-c)/2+'px','top':(d-36)/2+'px'});}this.$().css({'overflow':'auto'});};

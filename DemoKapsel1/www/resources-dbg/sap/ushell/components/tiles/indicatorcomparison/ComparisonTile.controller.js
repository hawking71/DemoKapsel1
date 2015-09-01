jQuery.sap.require("sap.ushell.components.tiles.generic");(function(){"use strict";sap.ushell.components.tiles.generic.extend("tiles.indicatorcomparison.ComparisonTile",{onInit:function(){this.KPI_VALUE_REQUIRED=false;},doProcess:function(){var t=this;this.setTextInTile();this.fetchChartData(function(k){this.CALCULATED_KPI_VALUE=k;this._updateTileModel({data:this.CALCULATED_KPI_VALUE});if(t.oConfig.TILE_PROPERTIES.frameType==sap.suite.ui.commons.FrameType.TwoByOne){t.oKpiTileView.oGenericTile.setFrameType(sap.suite.ui.commons.FrameType.TwoByOne);t.oKpiTileView.oGenericTile.removeAllTileContent();t.oKpiTileView.oGenericTile.addTileContent(t.oKpiTileView.oComparisonTile);var c={};c.data=this.CALCULATED_KPI_VALUE;t.getView().getViewData().parentController._updateTileModel(c);t.getView().getViewData().deferredObj.resolve();}else{t.oKpiTileView.oGenericTile.setFrameType(sap.suite.ui.commons.FrameType.OneByOne);t.oKpiTileView.oGenericTile.removeAllTileContent();t.oKpiTileView.oGenericTile.addTileContent(t.oKpiTileView.oComparisonTile);var n=sap.ushell.components.tiles.indicatorTileUtils.util.getNavigationTarget(t.oConfig,t.system);t.oKpiTileView.oGenericTile.$().wrap("<a href ='"+n+"'/>");this.oKpiTileView.oGenericTile.setState(sap.suite.ui.commons.LoadState.Loaded);}this.setToolTip(null,this.CALCULATED_KPI_VALUE,"COMP");},this.logError);},fetchChartData:function(s,E){function c(d,h){var k=false;if(d&&d.results&&d.results.length){for(var i=0,l=h.length;i<l&&!k;i++){k=d.results[0][h[i].COLUMN_NAME]!==null;}}return k;}var t=this;try{var u=this.oConfig.EVALUATION.ODATA_URL;var a=this.oConfig.EVALUATION.ODATA_ENTITYSET;var m=this.oConfig.EVALUATION.COLUMN_NAME;var b=m;if(this.oConfig.TILE_PROPERTIES.COLUMN_NAMES){for(var j=0;j<this.oConfig.TILE_PROPERTIES.COLUMN_NAMES.length;j++){if(this.oConfig.TILE_PROPERTIES.COLUMN_NAMES[j].COLUMN_NAME!=this.oConfig.EVALUATION.COLUMN_NAME){b=b+","+this.oConfig.TILE_PROPERTIES.COLUMN_NAMES[j].COLUMN_NAME;}}}else{for(var j=0;j<this.oConfig.EVALUATION.COLUMN_NAMES.length;j++){if(this.oConfig.EVALUATION.COLUMN_NAMES[j].COLUMN_NAME!=this.oConfig.EVALUATION.COLUMN_NAME){b=b+","+this.oConfig.EVALUATION.COLUMN_NAMES[j].COLUMN_NAME;}}}var d=this.oConfig.EVALUATION_VALUES;var f=sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(t.oConfig.TILE_PROPERTIES.id);if(!f){var v=sap.ushell.components.tiles.indicatorTileUtils.util.prepareFilterStructure(this.oConfig.EVALUATION_FILTERS,this.oConfig.ADDITIONAL_FILTERS);var g=sap.ushell.components.tiles.indicatorTileUtils.util.prepareQueryServiceUri(t.oTileApi.url.addSystemToServiceUrl(u),a,b,null,v,3);this.comparisionChartODataRef=g.model.read(g.uri,null,null,true,function(d){var w={};if(g.unit){w.unit=g.unit;}if(c(d,t.oConfig.TILE_PROPERTIES.COLUMN_NAMES||t.oConfig.EVALUATION.COLUMN_NAMES)){t.oConfig.TILE_PROPERTIES.FINALVALUE=d;t.oConfig.TILE_PROPERTIES.FINALVALUE=t._processDataForComparisonChart(t.oConfig.TILE_PROPERTIES.FINALVALUE,b.split(",")[0],g.unit);if(sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(t.oConfig.TILE_PROPERTIES.id)){w=sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(t.oConfig.TILE_PROPERTIES.id);w.data=d;}else{w.data=d;}sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(t.oConfig.TILE_PROPERTIES.id,w);s.call(t,t.oConfig.TILE_PROPERTIES.FINALVALUE);}else if(d.results.length==0){t.oConfig.TILE_PROPERTIES.FINALVALUE=d;if(sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(t.oConfig.TILE_PROPERTIES.id)){w=sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(t.oConfig.TILE_PROPERTIES.id);w.data=d;}else{w.data=d;}sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(t.oConfig.TILE_PROPERTIES.id,w);s.call(t,t.oConfig.TILE_PROPERTIES.FINALVALUE);t.setNoData();}else{t.setNoData();}},function(h){if(h&&h.response){jQuery.sap.log.error(h.message+" : "+h.request.requestUri);E.call(t,h);}});}else{if(f.data&&c(f.data,t.oConfig.TILE_PROPERTIES.COLUMN_NAMES||t.oConfig.EVALUATION.COLUMN_NAMES)){t.oConfig.TILE_PROPERTIES.FINALVALUE=f.data;t.oConfig.TILE_PROPERTIES.FINALVALUE=t._processDataForComparisonChart(t.oConfig.TILE_PROPERTIES.FINALVALUE,b,f.unit);s.call(t,t.oConfig.TILE_PROPERTIES.FINALVALUE);}else{t.oConfig.TILE_PROPERTIES.FINALVALUE=f.data;s.call(t,t.oConfig.TILE_PROPERTIES.FINALVALUE);t.setNoData();}}}catch(e){E.call(t,e);}},_processDataForComparisonChart:function(d,m,u){var f=[],L={},i,t,l;var a;var T=[];var b=this;var e=null;for(i=0;i<d.results.length;i++){var g=d.results[i];}T=sap.ushell.components.tiles.indicatorTileUtils.util.getAllMeasuresWithLabelText(this.oConfig.EVALUATION.ODATA_URL,this.oConfig.EVALUATION.ODATA_ENTITYSET);for(i=0,l=T.length;i<l;i++){t=T[i];L[t.key]=t.value;}var h=b.oConfig.TILE_PROPERTIES.COLUMN_NAMES||b.oConfig.EVALUATION.COLUMN_NAMES;for(i=0;i<h.length;i++){var j={};var k=h[i];j.value=Number(g[k.COLUMN_NAME]);var n=Number(g[k.COLUMN_NAME]);var o=false;var s=0;var p=b._getEvaluationThresholdMeasures();var I=jQuery.inArray(k.COLUMN_NAME,p);if(I>-1){o=true;s=b.oConfig.EVALUATION.SCALING;}if(b.oConfig.EVALUATION.SCALING==-2&&o){n*=100;}var c=b.isACurrencyMeasure(k.COLUMN_NAME);if(u&&u[i]&&g[u[i].name]){e=g[u[i].name];}a=sap.ushell.components.tiles.indicatorTileUtils.util.getLocaleFormattedValue(n,s,b.oConfig.EVALUATION.DECIMAL_PRECISION,c,e);if(b.oConfig.EVALUATION.SCALING==-2&&o){a+=" %";}j.displayValue=a.toString();if(u){if(u[i]&&g[u[i].name]){j.displayValue+=" "+g[u[i].name];}}j.color=k.semanticColor;j.title=L[k.COLUMN_NAME]||k.COLUMN_NAME;f.push(j);}return f;},doDummyProcess:function(){var t=this;this.setTextInTile();t._updateTileModel({value:8888,size:sap.suite.ui.commons.InfoTileSize.Auto,frameType:sap.suite.ui.commons.FrameType.OneByOne,state:sap.suite.ui.commons.LoadState.Loading,valueColor:sap.suite.ui.commons.InfoTileValueColor.Error,indicator:sap.suite.ui.commons.DeviationIndicator.None,title:"Liquidity Structure",footer:"Current Quarter",description:"Apr 1st 2013 (B$)",data:[{title:"Measure 1",value:1.2,color:"Good"},{title:"Measure 2",value:0.78,color:"Good"},{title:"Measure 3",value:1.4,color:"Error"}]});this.oKpiTileView.oGenericTile.setState(sap.suite.ui.commons.LoadState.Loaded);}});}());

(function(){"use strict";sap.ui.controller("tiles.indicatorDual.DualTile",{onAfterRendering:function(){var t=this;this.oKpiTileView=this.getView();this.oResourceBundle=sap.ushell.components.tiles.utils.getResourceBundleModel().getResourceBundle();this.viewData={};t.viewData=this.oKpiTileView.getViewData();this.deferred_left=new jQuery.Deferred();this.deferred_right=new jQuery.Deferred();$.when(this.deferred_left,this.deferred_right).done(function(){t.setTextInTile();t.oKpiTileView.oGenericTile.setState(sap.suite.ui.commons.LoadState.Loaded);var n=sap.ushell.components.tiles.indicatorTileUtils.util.getNavigationTarget(t.oKpiTileView.oConfig,t.system);t.oKpiTileView.oGenericTile.$().wrap("<a href ='"+n+"'/>");}).fail(function(){t.oKpiTileView.oGenericTile.setState(sap.suite.ui.commons.LoadState.Failed);});t.tileType=t.oKpiTileView.oConfig.TILE_PROPERTIES.tileType;this.oTileApi=t.viewData.chip;if(this.oTileApi.preview.isEnabled()){this.doDummyProcess();}else{this.doProcess();}},setNoData:function(){try{this._updateTileModel({value:"",scale:"",unit:"",footerNum:"No data available",footerComp:"No data available"});this.oKpiTileView.oGenericTile.setState(sap.suite.ui.commons.LoadState.Loaded);}catch(e){}},doProcess:function(){var t=this;var s=sap.ui.getCore().getUIArea(sap.ui.getCore().getStaticAreaRef());var l,r;this.system=this.oTileApi.url.getApplicationSystem();this.oKpiTileView.oGenericTile.setState(sap.suite.ui.commons.LoadState.Loading);var a=t.tileType.split("-")[1];try{var v;v="tiles.indicatornumeric.NumericTile";l=t._getView(v,this.deferred_left);s.addContent(l);switch(a){case"CM":v="tiles.indicatorcomparison.ComparisonTile";r=t._getView(v,this.deferred_right);s.addContent(r);break;case"CT":v="tiles.indicatorcontribution.ContributionTile";r=t._getView(v,this.deferred_right);s.addContent(r);break;case"AT":v="tiles.indicatordeviation.DeviationTile";r=t._getView(v,this.deferred_right);s.addContent(r);break;case"TT":v="tiles.indicatorArea.AreaChartTile";r=t._getView(v,this.deferred_right);s.addContent(r);break;}}catch(e){this.logError(e);}},setTextInTile:function(){var t=this;var a=sap.ushell.components.tiles.indicatorTileUtils.util.getTileTitleSubtitle(this.oTileApi);this._updateTileModel({header:a.title||sap.ushell.components.tiles.indicatorTileUtils.util.getChipTitle(t.oConfig),subheader:a.subTitle||sap.ushell.components.tiles.indicatorTileUtils.util.getChipSubTitle(t.oConfig)});},_updateTileModel:function(n){var m=this.getTile().getModel().getData();jQuery.extend(m,n);this.getTile().getModel().setData(m);},getTile:function(){return this.oKpiTileView.oGenericTile;},_getView:function(v,d){var a=this.oKpiTileView.getViewData();var b=sap.ui.view({type:sap.ui.core.mvc.ViewType.JS,viewName:v,viewData:jQuery.extend(true,{},a,{parentController:this},{deferredObj:d})});return b;},logError:function(e){this._updateTileModel({value:"",scale:"",unit:""});if(this.getView().getViewData().deferredObj){this.getView().getViewData().deferredObj.reject();}},doDummyProcess:function(){var t=this;try{t.setTextInTile();switch(t.tileType){case"DT-CM":t._updateTileModel({value:1,size:sap.suite.ui.commons.InfoTileSize.Auto,frameType:sap.suite.ui.commons.FrameType.TwoByOne,state:sap.suite.ui.commons.LoadState.Loading,valueColor:sap.suite.ui.commons.InfoTileValueColor.Good,indicator:sap.suite.ui.commons.DeviationIndicator.None,title:"Liquidity Structure",footer:"Current Quarter",description:"Apr 1st 2013 (B$)",data:[{title:"Measure 1",value:1,color:"Good"},{title:"Measure 2",value:2,color:"Good"},{title:"Measure 3",value:3,color:"Good"}]});break;case"DT-AT":t._updateTileModel({valueColor:"Good",value:100,frameType:sap.suite.ui.commons.FrameType.TwoByOne,unit:"USD",actual:{value:120,color:sap.suite.ui.commons.InfoTileValueColor.Good},targetValue:100,thresholds:[{value:0,color:sap.suite.ui.commons.InfoTileValueColor.Error},{value:50,color:sap.suite.ui.commons.InfoTileValueColor.Critical},{value:150,color:sap.suite.ui.commons.InfoTileValueColor.Critical},{value:200,color:sap.suite.ui.commons.InfoTileValueColor.Error}],showActualValue:true,showTargetValue:true});break;case"DT-CT":t._updateTileModel({value:8888,size:sap.suite.ui.commons.InfoTileSize.Auto,frameType:sap.suite.ui.commons.FrameType.TwoByOne,state:sap.suite.ui.commons.LoadState.Loading,valueColor:sap.suite.ui.commons.InfoTileValueColor.Error,indicator:sap.suite.ui.commons.DeviationIndicator.None,title:"US Profit Margin",footer:"Current Quarter",description:"Maximum deviation",data:[{title:"Americas",value:10,color:"Neutral",displayValue:""},{title:"EMEA",value:50,color:"Neutral",displayValue:""},{title:"APAC",value:-20,color:"Neutral",displayValue:""}]});break;case"DT-TT":this._updateTileModel({value:8888,size:sap.suite.ui.commons.InfoTileSize.Auto,frameType:sap.suite.ui.commons.FrameType.TwoByOne,state:sap.suite.ui.commons.LoadState.Loading,valueColor:sap.suite.ui.commons.InfoTileValueColor.Error,indicator:sap.suite.ui.commons.DeviationIndicator.None,title:"Liquidity Structure",footer:"Current Quarter",description:"Apr 1st 2013 (B$)",width:"100%",height:"100%",chart:{color:"Good",data:[{day:0,balance:0},{day:30,balance:20},{day:60,balance:20},{day:100,balance:80}]},target:{color:"Error",data:[{day:0,balance:0},{day:30,balance:30},{day:60,balance:40},{day:100,balance:90}]},maxThreshold:{color:"Good",data:[{day:0,balance:0},{day:30,balance:40},{day:60,balance:50},{day:100,balance:100}]},innerMaxThreshold:{color:"Error",data:[]},innerMinThreshold:{color:"Neutral",data:[]},minThreshold:{color:"Error",data:[{day:0,balance:0},{day:30,balance:20},{day:60,balance:30},{day:100,balance:70}]},minXValue:0,maxXValue:100,minYValue:0,maxYValue:100,firstXLabel:{label:"June 123",color:"Error"},lastXLabel:{label:"June 30",color:"Error"},firstYLabel:{label:"0M",color:"Good"},lastYLabel:{label:"80M",color:"Critical"},minLabel:{},maxLabel:{}});break;}}catch(e){}}});}());
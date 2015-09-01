// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
(function(){"use strict";jQuery.sap.require("sap.ushell.components.tiles.indicatorTileUtils.smartBusinessUtil");jQuery.sap.require("sap.ui.model.analytics.odata4analytics");sap.ui.getCore().loadLibrary("sap.suite.ui.commons");sap.ui.jsview("tiles.indicatorArea.AreaChartTile",{getControllerName:function(){return"tiles.indicatorArea.AreaChartTile";},createContent:function(c){this.setHeight('100%');this.setWidth('100%');var h="Lorem ipsum";var s="Lorem ipsum";var t=sap.ushell.components.tiles.indicatorTileUtils.util.getTileTitleSubtitle(this.getViewData().chip);if(t.title&&t.subTitle){h=t.title;s=t.subTitle;}var b=function(d){return new sap.suite.ui.commons.MicroAreaChartItem({color:"Good",points:{path:"/"+d+"/data",template:new sap.suite.ui.commons.MicroAreaChartPoint({x:"{day}",y:"{balance}"})}});};var a=function(d){return new sap.suite.ui.commons.MicroAreaChartLabel({label:"{/"+d+"/label}",color:"{/"+d+"/color}"});};var g={subheader:s,header:h,footerNum:"",footerComp:"",scale:"",unit:"",value:8888,size:"Auto",frameType:"OneByOne",state:sap.suite.ui.commons.LoadState.Loading};var n=new sap.suite.ui.commons.MicroAreaChart({width:"{/width}",height:"{/height}",size:"{/size}",target:b("target"),innerMinThreshold:b("innerMinThreshold"),innerMaxThreshold:b("innerMaxThreshold"),minThreshold:b("minThreshold"),maxThreshold:b("maxThreshold"),chart:b("chart"),minXValue:"{/minXValue}",maxXValue:"{/maxXValue}",minYValue:"{/minYValue}",maxYValue:"{/maxYValue}",firstXLabel:a("firstXLabel"),lastXLabel:a("lastXLabel"),firstYLabel:a("firstYLabel"),lastYLabel:a("lastYLabel"),minLabel:a("minLabel"),maxLabel:a("maxLabel")});var N=new sap.suite.ui.commons.TileContent({unit:"{/unit}",size:"{/size}",footer:"{/footerNum}",content:n});this.oGenericTile=new sap.suite.ui.commons.GenericTile({subheader:"{/subheader}",frameType:"{/frameType}",size:"{/size}",header:"{/header}",tileContent:[N]});var G=new sap.ui.model.json.JSONModel();G.setData(g);this.oGenericTile.setModel(G);return this.oGenericTile;}});}());
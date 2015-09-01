// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
(function(){"use strict";jQuery.sap.require("sap.ushell.components.tiles.indicatorTileUtils.smartBusinessUtil");jQuery.sap.require("sap.ui.model.analytics.odata4analytics");sap.ui.getCore().loadLibrary("sap.suite.ui.commons");sap.ui.jsview("tiles.indicatorcomparison.ComparisonTile",{getControllerName:function(){return"tiles.indicatorcomparison.ComparisonTile";},createContent:function(c){this.setHeight('100%');this.setWidth('100%');var t=this;t.tileData;t.oGenericTileData={};t.oCmprsDataTmpl=new sap.suite.ui.commons.ComparisonData({title:"{title}",value:"{value}",color:"{color}",displayValue:"{displayValue}"});t.oCmprsChrtTmpl=new sap.suite.ui.commons.ComparisonChart({size:"{/size}",scale:"{/scale}",data:{template:t.oCmprsDataTmpl,path:"/data"}});t.oComparisonTile=new sap.suite.ui.commons.TileContent({unit:"{/unit}",size:"{/size}",footer:"{/footerComp}",content:t.oCmprsChrtTmpl});t.oGenericTile=new sap.suite.ui.commons.GenericTile({subheader:"{/subheader}",frameType:"{/frameType}",size:"{/size}",header:"{/header}",tileContent:[t.oComparisonTile]});t.oGenericTileModel=new sap.ui.model.json.JSONModel();t.oGenericTileModel.setData(t.oGenericTileData);t.oGenericTile.setModel(t.oGenericTileModel);return t.oGenericTile;}});}());

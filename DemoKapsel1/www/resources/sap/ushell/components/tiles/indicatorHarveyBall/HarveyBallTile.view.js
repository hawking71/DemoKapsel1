(function(){"use strict";jQuery.sap.require("sap.ushell.components.tiles.indicatorTileUtils.smartBusinessUtil");jQuery.sap.require("sap.ui.model.analytics.odata4analytics");sap.ui.getCore().loadLibrary("sap.suite.ui.commons");sap.ui.jsview("tiles.indicatorHarveyBall.HarveyBallTile",{getControllerName:function(){},createContent:function(c){var m=new sap.suite.ui.commons.HarveyBallMicroChart({total:"{/value}",size:"{/size}",totalLabel:"{/totalLabel}",items:[new sap.suite.ui.commons.HarveyBallMicroChartItem({fraction:"{/fractionValue}",fractionLabel:"{/fractionLabel}",color:"{/color}"})]});var t=new sap.suite.ui.commons.TileContent({size:"{/size}",content:m});this.oTile=new sap.suite.ui.commons.GenericTile({subheader:"{/subheader}",frameType:"{/frameType}",size:"{/size}",header:"{/header}",tileContent:[t]});}});}());

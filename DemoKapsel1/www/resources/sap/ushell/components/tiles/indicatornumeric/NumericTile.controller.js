(function(){"use strict";jQuery.sap.require("sap.ushell.components.tiles.generic");sap.ushell.components.tiles.generic.extend("tiles.indicatornumeric.NumericTile",{onInit:function(){this.KPI_VALUE_REQUIRED=true;},doProcess:function(k,t){var a=this;this.CALCULATED_KPI_VALUE=k;var e=this.DEFINITION_DATA.EVALUATION_VALUES;var b=this.getTrendColor(t);var d=this.getTrendIndicator(t.trendValue);var s="";var f=this.CALCULATED_KPI_VALUE;if(this.oConfig.EVALUATION.SCALING==-2){f*=100;this.getView().oNVConfContS.setFormatterValue(false);}var c=this.isACurrencyMeasure(this.oConfig.EVALUATION.COLUMN_NAME);s=sap.ushell.components.tiles.indicatorTileUtils.util.getLocaleFormattedValue(Number(f),this.oConfig.EVALUATION.SCALING,this.oConfig.EVALUATION.DECIMAL_PRECISION,c,this.CURRENCY_CODE);if(this.oConfig.EVALUATION.SCALING==-2){this._updateTileModel({scale:"%"});}this._updateTileModel({value:s.toString(),valueColor:b,indicator:d});if(a.oConfig.TILE_PROPERTIES.frameType==sap.suite.ui.commons.FrameType.OneByOne){var n=sap.ushell.components.tiles.indicatorTileUtils.util.getNavigationTarget(a.oConfig,a.system);a.oKpiTileView.oGenericTile.$().wrap("<a href ='"+n+"'/>");this.oKpiTileView.oGenericTile.setState(sap.suite.ui.commons.LoadState.Loaded);this.setToolTip(b,f,"NT");}else{a.getView().getViewData().parentController._updateTileModel(this.getTile().getModel().getData());a.getView().getViewData().deferredObj.resolve();}this.setToolTip(b,f,"NT");},doDummyProcess:function(){var t=this;this.setTextInTile();t._updateTileModel({value:"10.34",scale:"M",valueColor:sap.suite.ui.commons.InfoTileValueColor.Neutral,indicator:sap.suite.ui.commons.DeviationIndicator.None});this.oKpiTileView.oGenericTile.setState(sap.suite.ui.commons.LoadState.Loaded);}});}());
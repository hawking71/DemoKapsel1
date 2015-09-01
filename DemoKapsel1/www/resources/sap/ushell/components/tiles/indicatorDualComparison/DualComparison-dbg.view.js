// Copyright (c) 2009-2014 SAP SE, All Rights Reserved

//Comparison Tile
(function () {
    "use strict";
    /*global jQuery, sap */
    /*jslint nomen: true */

    jQuery.sap.require("sap.ushell.components.tiles.indicatorTileUtils.smartBusinessUtil");
    jQuery.sap.require("sap.ui.model.analytics.odata4analytics");
    sap.ui.getCore().loadLibrary("sap.suite.ui.commons");

    sap.ui.jsview("tiles.indicatorDualComparison.DualComparison", {
        getControllerName: function () {
            return "tiles.indicatorDualComparison.DualComparison";
        },
        createContent: function (oController) {
            this.setHeight('100%');
            this.setWidth('100%');

            var that = this;
            that.tileData;

            that.oGenericTileData = {

            };

            that.oNumericContent = new sap.suite.ui.commons.NumericContent({
                value: "{/value}",
                scale: "{/scale}",
                unit: "{/unit}",
                indicator: "{/indicator}",
                size: "{/size}",
                formatterValue: true,
                truncateValueTo: 6,
                valueColor: "{/valueColor}"
            });

            that.oNumericTile = new sap.suite.ui.commons.TileContent({
                unit: "{/unit}",
                size: "{/size}",
                footer: "{/footerNum}",
                content: that.oNumericContent
            });

            that.oCmprsDataTmpl = new sap.suite.ui.commons.ComparisonData({
                title : "{title}",
                value : "{value}",
                color : "{color}",
                displayValue : "{displayValue}"
            });

            that.oCmprsChrtTmpl = new sap.suite.ui.commons.ComparisonChart({
                size : "{/size}",
                scale : "{/scale}",
                data : {
                    template : that.oCmprsDataTmpl,
                    path : "/data"
                }
            });

            that.oComparisonTile = new sap.suite.ui.commons.TileContent({
                unit : "{/unit}",
                size : "{/size}",
                footer : "{/footerComp}",
                content : that.oCmprsChrtTmpl
            });


            that.oGenericTile = new sap.suite.ui.commons.GenericTile({
                subheader : "{/subheader}",
                frameType : "{/frameType}",
                size : "{/size}",
                header : "{/header}",
                tileContent : [that.oNumericTile,that.oComparisonTile]//that.oComparisonTile]
            });


            that.oGenericTileModel = new sap.ui.model.json.JSONModel();
            that.oGenericTileModel.setData(that.oGenericTileData);
            that.oGenericTile.setModel(that.oGenericTileModel);

            return that.oGenericTile;


        }
    });
}());

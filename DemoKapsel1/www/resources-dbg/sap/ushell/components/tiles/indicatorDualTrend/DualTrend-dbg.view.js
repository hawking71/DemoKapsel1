// Copyright (c) 2009-2014 SAP SE, All Rights Reserved

(function () {
    "use strict";
    /*global jQuery, sap */
    /*jslint nomen: true */

    jQuery.sap.require("sap.ushell.components.tiles.indicatorTileUtils.smartBusinessUtil");
    jQuery.sap.require("sap.ui.model.analytics.odata4analytics");
    sap.ui.getCore().loadLibrary("sap.suite.ui.commons");

    sap.ui.jsview("tiles.indicatorDualTrend.DualTrend", {
        getControllerName: function () {
            return "tiles.indicatorDualTrend.DualTrend";
        },
        createContent: function (oController) {
            this.setHeight('100%');
            this.setWidth('100%');
            var preview = this.getViewData().chip.preview;
            var header = "Lorem ipsum";
            var subheader =  "Lorem ipsum";
            if (preview && preview.getTitle()){
                header = preview.getTitle();
                subheader = preview.getDescription();
            }
            var buildChartItem = function(sName) {
                return new sap.suite.ui.commons.MicroAreaChartItem({
                    color: "Good",
                    points: {
                        path: "/" + sName + "/data",
                        template: new sap.suite.ui.commons.MicroAreaChartPoint({
                            x: "{day}",
                            y: "{balance}"

                        })
                    }
                });
            };




            var buildMACLabel = function(sName) {
                return new sap.suite.ui.commons.MicroAreaChartLabel({
                    label: "{/" + sName + "/label}",
                    color: "{/" + sName + "/color}"
                });
            };

            var oGenericTileData = {

                    footer : "",
                    header : "",
                    subheader : ""
//                    footerNum : "",
//                    footerComp : "",
//                    scale: "",
//                    unit: "",
//                    value: 8888,
//                    size:"Auto",
//                    frameType:"OneByOne",
//                    state: sap.suite.ui.commons.LoadState.Loading,
                    /* valueColor:sap.suite.ui.commons.InfoTileValueColor.Error,
                    indicator: sap.suite.ui.commons.DeviationIndicator.None,*/
//                    title : "US Profit Margin",
//                    footer : "",
//                    description: "",
//
//                    width: "100%",
//                    height: "100%",
//                    chart: {
//                        color:"Good",
//                        data: [
//                               {day: 0, balance: 0},
//                               {day: 30, balance: 20},
//                               {day: 60, balance: 20},
//                               {day: 100, balance: 80}
//                               ]
//                    },
//                    target: {
//                        color:"Error",
//                        data: [
//                               {day: 0, balance: 0},
//                               {day: 30, balance: 30},
//                               {day: 60, balance: 40},
//                               {day: 100, balance: 90}
//                               ]
//                    },
//                    maxThreshold: {
//                        color: "Good",
//                        data: [
//                               {day: 0, balance: 0},
//                               {day: 30, balance: 40},
//                               {day: 60, balance: 50},
//                               {day: 100, balance: 100}
//                               ]
//                    },
//                    innerMaxThreshold: {
//                        color: "Error",
//                        data: [
//                               ]
//                    },
//                    innerMinThreshold: {
//                        color: "Neutral",
//                        data: [
//                               ]
//                    },
//                    minThreshold: {
//                        color: "Error",
//                        data: [
//                               {day: 0, balance: 0},
//                               {day: 30, balance: 20},
//                               {day: 60, balance: 30},
//                               {day: 100, balance: 70},
//                               ]
//                    },
//                    minXValue: 0,
//                    maxXValue: 100,
//                    minYValue: 0,
//                    maxYValue: 100,
//                    firstXLabel: { label: "June 123", color: "Error"   },
//                    lastXLabel: { label: "June 30", color: "Error" },
//                    firstYLabel: { label: "0M", color: "Good" },
//                    lastYLabel: { label: "80M", color: "Critical" },
//                    minLabel: { },
//                    maxLabel: { }
            };





            var oNVConfContS = new sap.suite.ui.commons.MicroAreaChart({
                width: "{/width}",
                height: "{/height}",
                size : "{/size}",
                target: buildChartItem("target"),
                innerMinThreshold: buildChartItem("innerMinThreshold"),
                innerMaxThreshold: buildChartItem("innerMaxThreshold"),
                minThreshold: buildChartItem("minThreshold"),
                maxThreshold: buildChartItem("maxThreshold"),
                chart: buildChartItem("chart"),
                minXValue: "{/minXValue}",
                maxXValue: "{/maxXValue}",
                minYValue: "{/minYValue}",
                maxYValue: "{/maxYValue}",
                firstXLabel: buildMACLabel("firstXLabel"),
                lastXLabel: buildMACLabel("lastXLabel"),
                firstYLabel: buildMACLabel("firstYLabel"),
                lastYLabel: buildMACLabel("lastYLabel"),
                minLabel: buildMACLabel("minLabel"),
                maxLabel: buildMACLabel("maxLabel")
            });

            var oNVConfS = new sap.suite.ui.commons.TileContent({
                unit : "{/unit}",
                size : "{/size}",

                content: oNVConfContS
            });
            var oNumericContent = new sap.suite.ui.commons.NumericContent({


                value: "{/value}",
                scale: "{/scale}",
                unit: "{/unit}",
                indicator: "{/indicator}",
                size: "{/size}",
                formatterValue: true,
                truncateValueTo: 6,
                valueColor: "{/valueColor}"
            });

            var oNumericTile = new sap.suite.ui.commons.TileContent({
                unit: "{/unit}",
                size: "{/size}",
                content: oNumericContent
            });

            this.oGenericTile = new sap.suite.ui.commons.GenericTile({
                subheader : "{/subheader}",
                frameType : "TwoByOne",
                size : "{/size}",
                header : "{/header}",
                tileContent : [oNumericTile,oNVConfS]
            });

            var oGenericTileModel = new sap.ui.model.json.JSONModel();
            oGenericTileModel.setData(oGenericTileData);
            this.oGenericTile.setModel(oGenericTileModel);
            /* new tiles.indicatorArea.areaChartTileService({
                tile : oNVConfContS,
                kpiCode :'sap.hba.ecc.mm.pur.NonManagedSpend',// 'com.sap.PS.KPI10',
                variantId : 'sap.hba.ecc.mm.pur.NonManagedSpendLast7Days',//'com.sap.var2~I077920~2013-12-03 07:26:14.4960000',
            });
             */

            return this.oGenericTile;
        }
    });
}());

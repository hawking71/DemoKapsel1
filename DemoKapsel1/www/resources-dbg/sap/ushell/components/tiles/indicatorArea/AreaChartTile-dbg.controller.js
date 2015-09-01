(function () {
    "use strict";
    jQuery.sap.require("sap.ushell.components.tiles.generic");
    sap.ushell.components.tiles.generic.extend("tiles.indicatorArea.AreaChartTile", {
        onInit :  function(){
            this.KPI_VALUE_REQUIRED = false;
        },

        doProcess : function () {
            this.onAfterFinalEvaluation();
        },

        onAfterFinalEvaluation: function () {
            var that = this;
            var sUri = this.DEFINITION_DATA.EVALUATION.ODATA_URL;
            var sEntitySet = this.DEFINITION_DATA.EVALUATION.ODATA_ENTITYSET;
            var sMeasure = this.DEFINITION_DATA.EVALUATION.COLUMN_NAME;
            var variantData = sap.ushell.components.tiles.indicatorTileUtils.util.prepareFilterStructure(this.DEFINITION_DATA.EVALUATION_FILTERS,this.DEFINITION_DATA.ADDITIONAL_FILTERS);
            var dimensionName = this.DEFINITION_DATA.TILE_PROPERTIES.dimension;
            if (dimensionName == undefined) {
                this.logError();
                return;
            }
            var goaltype = this.DEFINITION_DATA.EVALUATION.GOAL_TYPE;
            var evaluationValues = this.DEFINITION_DATA.EVALUATION_VALUES;
            if (this.DEFINITION_DATA.EVALUATION.VALUES_SOURCE == "MEASURE") {
                var fullyFormedMeasure = sMeasure;
                switch (goaltype) {
                case "MI" :
                    that.sWarningHigh =  sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "WH", "MEASURE");
                    that.sCriticalHigh =  sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "CH", "MEASURE");
                    that.sTarget =  sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TA", "MEASURE");
                    that.sTrend =  sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TC", "MEASURE");
                    if (that.sWarningHigh && that.sCriticalHigh && that.sTarget) {
                        fullyFormedMeasure += "," + that.sWarningHigh + "," + that.sCriticalHigh + "," + that.sTarget;
                    }
                    break;
                case "MA" :
                    that.sWarningLow =  sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "WL", "MEASURE");
                    that.sCriticalLow =  sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "CL", "MEASURE");
                    that.sTarget =  sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TA", "MEASURE");
                    that.sTrend =  sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TC", "MEASURE");
                    if (that.sWarningLow && that.sCriticalLow && that.sTarget) {
                        fullyFormedMeasure += "," + that.sWarningLow + "," + that.sCriticalLow + "," + that.sTarget;
                    }
                    break;
                case "RA" :
                    that.sWarningHigh =  sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "WH", "MEASURE");
                    that.sCriticalHigh =  sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "CH", "MEASURE");
                    that.sTarget =  sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TA", "MEASURE");
                    that.sTrend =  sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TC", "MEASURE");
                    that.sWarningLow =  sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "WL", "MEASURE");
                    that.sCriticalLow =  sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "CL", "MEASURE");
                    if (that.sWarningLow && that.sCriticalLow && that.sTarget && that.sWarningHigh && that.sCriticalHigh) {
                        fullyFormedMeasure += "," + that.sWarningLow + "," + that.sCriticalLow + "," + that.sTarget + "," + that.sWarningHigh + "," + that.sCriticalHigh;
                    }
                    break;
                }
                var oQuery = sap.ushell.components.tiles.indicatorTileUtils.util.prepareQueryServiceUri(that.oTileApi.url.addSystemToServiceUrl(sUri), sEntitySet, fullyFormedMeasure, dimensionName, variantData);
            } else {
                var oQuery = sap.ushell.components.tiles.indicatorTileUtils.util.prepareQueryServiceUri(that.oTileApi.url.addSystemToServiceUrl(sUri), sEntitySet, sMeasure, dimensionName, variantData);
            }
            var cachedValue = sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(that.oConfig.TILE_PROPERTIES.id);
            if (!cachedValue) {
                if (oQuery) {
                    this.queryUriForTrendChart = oQuery.uri;
                    var writeData = {};
                    try {
                        this.trendChartODataReadRef = oQuery.model.read(oQuery.uri, null, null, true, function (data) {
                            if (data && data.results && data.results.length){
                                if (oQuery.unit[0]){
                                    that.unit = data.results[0][oQuery.unit[0].name];
                                    that.CURRENCY_CODE = that.unit;
                                    writeData.unit = oQuery.unit[0];
                                    writeData.unit.name = oQuery.unit[0].name;
                                }
                                that.queryUriResponseForTrendChart = data;
                                dimensionName = sap.ushell.components.tiles.indicatorTileUtils.util.findTextPropertyForDimension(that.oTileApi.url.addSystemToServiceUrl(sUri), sEntitySet, dimensionName);
                                data.firstXlabel = data.results[0][dimensionName];
                                data.lastXlabel = data.results[data.results.length - 1][dimensionName];

                                if (that.oConfig.TILE_PROPERTIES.frameType == sap.suite.ui.commons.FrameType.TwoByOne){
                                    if (sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(that.oConfig.TILE_PROPERTIES.id)){
                                        writeData = sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(that.oConfig.TILE_PROPERTIES.id);
                                    }
                                    writeData.data = data;
                                } else {
                                    writeData.data = data;
                                }
                                writeData.dimensionName = dimensionName;
                                sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(that.oConfig.TILE_PROPERTIES.id, writeData);
                                _applyData(data,that.DEFINITION_DATA.EVALUATION.VALUES_SOURCE);
                                if (that.DEFINITION_DATA.TILE_PROPERTIES.frameType == sap.suite.ui.commons.FrameType.TwoByOne) {
                                    that.getView().getViewData().deferredObj.resolve();
                                } else {
                                    var navTarget = sap.ushell.components.tiles.indicatorTileUtils.util.getNavigationTarget(that.oConfig,that.system);
                                    that.oKpiTileView.oGenericTile.$().wrap("<a href ='" + navTarget + "'/>");
                                    that.oKpiTileView.oGenericTile.setState(sap.suite.ui.commons.LoadState.Loaded);
                                }
                            } else {
                                that.setNoData();
                            }
                        },function(eObject) {
                            if (eObject && eObject.response) {
                                that.logError("Data call failed");
                            }
                        });
                    } catch(e) {
                        that.logError(e);
                    }
                } else {
                    that.logError();
                }
            } else {
                try {
                    if (cachedValue.unit){
                        that.unit = cachedValue.data.results[0][cachedValue.unit.name];
                        that.CURRENCY_CODE = that.unit;
                    }
                    that.queryUriResponseForTrendChart = cachedValue.data;
                    dimensionName = cachedValue.dimensionName;
                    _applyData(cachedValue.data,that.DEFINITION_DATA.EVALUATION.VALUES_SOURCE);
                    if (that.oConfig.TILE_PROPERTIES.frameType == sap.suite.ui.commons.FrameType.OneByOne){
                        that.oKpiTileView.oGenericTile.setState(sap.suite.ui.commons.LoadState.Loaded);
                    } else {
                        that.getView().getViewData().deferredObj.resolve();

                    }
                } catch(e) {
                    that.logError(e);
                }
            }
            function _applyData(data,type) {

                var dimensionArray = [];
                var measureArray = [];
                var wHArray = [];
                var cHArray = [];
                var cLArray = [];
                var wLArray = [];
                var firstXlabel = data.firstXlabel;
                var minThresholdMeasure, maxThresholdMeasure, innerMinThresholdMeasure, innerMaxThresholdMeasure, targetMeasure;
                var lastXlabel = data.lastXlabel;
                var firstYLabelValue = Number(data.results[0][sMeasure]);
                var lastYLabelValue = Number(data.results[data.results.length - 1][sMeasure]);
                var i;

                for (i in data.results) {
                    data.results[i][dimensionName] = Number(i);
                    data.results[i][sMeasure] = Number(data.results[i][sMeasure]);
                    that.sWarningHigh ? data.results[i][that.sWarningHigh] = Number(data.results[i][that.sWarningHigh]) : "";
                    that.sCriticalHigh ? data.results[i][that.sCriticalHigh] = Number(data.results[i][that.sCriticalHigh]) : "";
                    that.sCriticalLow ? data.results[i][that.sCriticalLow] = Number(data.results[i][that.sCriticalLow]) : "";
                    that.sWarningLow ? data.results[i][that.sWarningLow] = Number(data.results[i][that.sWarningLow]) : "";
                    that.sTarget ? data.results[i][that.sTarget] = Number(data.results[i][that.sTarget]) : "";
                    that.sWarningHigh ? wHArray.push(data.results[i][that.sWarningHigh]) : "";
                    that.sCriticalHigh ? cHArray.push(data.results[i][that.sCriticalHigh]) : "";
                    that.sCriticalLow ? cLArray.push(data.results[i][that.sCriticalLow]) : "";
                    that.sWarningLow ?  wLArray.push(data.results[i][that.sWarningLow]) : "";
                    dimensionArray.push(data.results[i][dimensionName]);
                    measureArray.push(data.results[i][sMeasure]);
                } try {
                    firstXlabel = sap.ushell.components.tiles.indicatorTileUtils.util.formatOdataObjectToString(firstXlabel);
                    lastXlabel = sap.ushell.components.tiles.indicatorTileUtils.util.formatOdataObjectToString(lastXlabel);
                } catch (e) {
                    that.logError(e);
                }
                var firstCalculatedValueForScaling = Number(firstYLabelValue);
                if (that.oConfig.EVALUATION.SCALING == -2) {
                    firstCalculatedValueForScaling *= 100;
                }
                var minMeasure = Math.min.apply(Math, measureArray); //to obtain the starting value
                var c = that.isACurrencyMeasure(that.oConfig.EVALUATION.COLUMN_NAME);
                var formattedFirstYLabel = sap.ushell.components.tiles.indicatorTileUtils.util.getLocaleFormattedValue(firstCalculatedValueForScaling, that.oConfig.EVALUATION.SCALING,that.oConfig.EVALUATION.DECIMAL_PRECISION, c, that.CURRENCY_CODE);
                if (that.oConfig.EVALUATION.SCALING == -2) {
                    formattedFirstYLabel += " %";
                }
                var firstYLabel = formattedFirstYLabel.toString();

                var lastCalculatedValueForScaling = Number(lastYLabelValue);
                if (that.oConfig.EVALUATION.SCALING == -2) {
                    lastCalculatedValueForScaling *= 100;
                }
                var maxMeasure = Math.max.apply(Math, measureArray); //to obtain the last value
                c = that.isACurrencyMeasure(that.oConfig.EVALUATION.COLUMN_NAME);
                var formattedLastYLabel = sap.ushell.components.tiles.indicatorTileUtils.util.getLocaleFormattedValue(lastCalculatedValueForScaling, that.oConfig.EVALUATION.SCALING,that.oConfig.EVALUATION.DECIMAL_PRECISION, c, that.CURRENCY_CODE);
                if (that.oConfig.EVALUATION.SCALING == -2) {
                    formattedLastYLabel += " %";
                }
                var lastYLabel = formattedLastYLabel.toString();

                try {
                    var minDimension = sap.ushell.components.tiles.indicatorTileUtils.util.formatOdataObjectToString(Math.min.apply(Math, dimensionArray)); //to obtain the starting value
                    var maxDimension = sap.ushell.components.tiles.indicatorTileUtils.util.formatOdataObjectToString(Math.max.apply(Math, dimensionArray)); //to obtain the last value
                } catch (e) {
                    that.logError(e);
                }
                if (type == "MEASURE"){
                    (wHArray.length != 0) ? (that.firstwH = wHArray[minDimension]) &&  (that.lastwH = wHArray[maxDimension]) : "";
                    (cHArray.length != 0) ? (that.firstcH = cHArray[minDimension]) && (that.lastcH = cHArray[maxDimension]) : "";
                    (cLArray.length != 0) ? (that.firstcL = cLArray[minDimension]) && (that.lastcL = cLArray[maxDimension]) : "";
                    (wLArray.length != 0) ? ( that.firstwL = wLArray[minDimension]) && (that.lastwL = wLArray[maxDimension]) : "";
                }
                var updatedModel = {
                        width: "100%",
                        height: "100%",
                        unit: that.unit || "",
                        chart: {
                            color: "Neutral",
                            data: data.results
                        },
                        size: "Auto",
                        minXValue: minDimension,
                        maxXValue: maxDimension,
                        minYValue: minMeasure,
                        maxYValue: maxMeasure,
                        firstXLabel: {
                            label: firstXlabel + "",
                            color: "Neutral"
                        },
                        lastXLabel: {
                            label: lastXlabel + "",
                            color: "Neutral"
                        },
                        firstYLabel: {
                            label: firstYLabel + "",
                            color: "Neutral"
                        },
                        lastYLabel: {
                            label: lastYLabel + "",
                            color: "Neutral"
                        },
                        minLabel: {},
                        maxLabel: {}
                };

                switch (goaltype) {
                case "MA":
                    for (i in evaluationValues) {
                        if (evaluationValues[i].TYPE == "CL") {
                            updatedModel.minThreshold = {
                                    color: "Error"
                            };
                            var newObj = {};
                            newObj[dimensionName] = "";
                            newObj[sMeasure] = Number(evaluationValues[i].FIXED);
                            that.cl = Number(evaluationValues[i].FIXED);
                            updatedModel.minThreshold.data = (type  == "MEASURE") ? data.results : [newObj];
                            minThresholdMeasure = (type  == "MEASURE") ? that.sCriticalLow : sMeasure;

                        } else if (evaluationValues[i].TYPE == "WL") {
                            updatedModel.maxThreshold = {
                                    color: "Good"
                            };
                            var newObj = {};
                            newObj[dimensionName] = "";
                            newObj[sMeasure] = Number(evaluationValues[i].FIXED);
                            updatedModel.maxThreshold.data = (type  == "MEASURE") ? data.results : [newObj];
                            maxThresholdMeasure = (type  == "MEASURE") ?  that.sWarningLow : sMeasure;
                            that.wl = Number(evaluationValues[i].FIXED);

                        } else if (evaluationValues[i].TYPE == "TA") {
                            var newObj = {};
                            newObj[dimensionName] = "";
                            newObj[sMeasure] = Number(evaluationValues[i].FIXED);
                            updatedModel.target = {
                                    color: "Neutral"
                            };
                            updatedModel.target.data = (type  == "MEASURE") ? data.results : [newObj];
                            targetMeasure = (type  == "MEASURE") ? that.sTarget : sMeasure;
                        }
                    }
                    updatedModel.innerMinThreshold = {
                            data: [

                                   ]
                    };
                    updatedModel.innerMaxThreshold = {
                            data: [

                                   ]
                    };
                    if (type  == "FIXED") {
                        updatedModel.firstYLabel.color =  firstYLabelValue < that.cl ? "Error" : ((that.cl <= firstYLabelValue) && (firstYLabelValue <= that.wl)) ? "Critical" : (firstYLabelValue > that.wl) ? "Good" : "Neutral";
                        updatedModel.lastYLabel.color = lastYLabelValue < that.cl ? "Error" : ((that.cl <= lastYLabelValue) && (lastYLabelValue <= that.wl)) ? "Critical" : (lastYLabelValue > that.wl) ? "Good" : "Neutral";
                    } else if (type == "MEASURE" && that.firstwL && that.lastwL && that.firstcL && that.lastcL) {
                        updatedModel.firstYLabel.color = firstYLabelValue < that.firstcL ? "Error" : ((that.firstcL <= firstYLabelValue) && (firstYLabelValue <= that.firstwL)) ? "Critical" : (firstYLabelValue > that.firstwL) ? "Good" : "Neutral";
                        updatedModel.lastYLabel.color = lastYLabelValue < that.lastcL ? "Error" : ((that.lastcL <= lastYLabelValue) && (lastYLabelValue <= that.lastwL)) ? "Critical" : (lastYLabelValue > that.lastwL) ? "Good" : "Neutral";
                    }
                    break;
                case "MI":
                    for (i in evaluationValues) {

                        if (evaluationValues[i].TYPE == "CH") {
                            var newObj = {};
                            newObj[dimensionName] = "";
                            newObj[sMeasure] = Number(evaluationValues[i].FIXED);
                            that.ch =  Number(evaluationValues[i].FIXED);
                            updatedModel.maxThreshold = {
                                    color: "Error"
                            };
                            updatedModel.maxThreshold.data = (type  == "MEASURE") ? data.results : [newObj];
                            maxThresholdMeasure = (type  == "MEASURE") ? that.sCriticalHigh : sMeasure;
                        } else if (evaluationValues[i].TYPE == "WH") {
                            var newObj = {};
                            newObj[dimensionName] = "";
                            newObj[sMeasure] = Number(evaluationValues[i].FIXED);
                            that.wh = Number(evaluationValues[i].FIXED);
                            updatedModel.minThreshold = {
                                    color: "Good"
                            };
                            updatedModel.minThreshold.data = (type  == "MEASURE") ? data.results : [newObj];
                            minThresholdMeasure = (type  == "MEASURE") ? that.sWarningHigh : sMeasure;

                        } else if (evaluationValues[i].TYPE == "TA") {
                            var newObj = {};
                            newObj[dimensionName] = "";
                            newObj[sMeasure] = Number(evaluationValues[i].FIXED);
                            updatedModel.target = {
                                    color: "Neutral"
                            };
                            updatedModel.target.data = (type  == "MEASURE") ? data.results : [newObj];
                            targetMeasure = (type  == "MEASURE") ? that.sTarget : sMeasure;
                        }


                    }
                    if (type  == "FIXED"){
                        updatedModel.firstYLabel.color = firstYLabelValue > that.ch ? "Error" : ((that.wh <= firstYLabelValue) && (firstYLabelValue <= that.ch)) ? "Critical" : (firstYLabelValue < that.wh) ? "Good" : "Neutral";
                        updatedModel.lastYLabel.color = lastYLabelValue > that.ch ? "Error" : ((that.wh <= lastYLabelValue) && (lastYLabelValue <= that.ch)) ? "Critical" : (lastYLabelValue < that.wh) ? "Good" : "Neutral";
                    } else if (type == "MEASURE" && that.firstwH && that.lastwH && that.firstcH && that.lastcH) {
                        updatedModel.firstYLabel.color = firstYLabelValue > that.firstcH ? "Error" : ((that.firstwH <= firstYLabelValue) && (firstYLabelValue <= that.firstcH)) ? "Critical" : (firstYLabelValue < that.firstwH) ? "Good" : "Neutral";
                        updatedModel.lastYLabel.color = lastYLabelValue > that.lastcH ? "Error" : ((that.lastwH <= lastYLabelValue) && (lastYLabelValue <= that.lastcH)) ? "Critical" : (lastYLabelValue < that.lastwH) ? "Good" : "Neutral";

                    }
                    updatedModel.innerMaxThreshold = {
                        data: []
                    };
                    updatedModel.innerMinThreshold = {
                        data: []
                    };
                    break;
                case "RA":
                    for (i in evaluationValues) {

                        if (evaluationValues[i].TYPE == "CH") {
                            var newObj = {};
                            newObj[dimensionName] = "";
                            newObj[sMeasure] = Number(evaluationValues[i].FIXED);
                            that.ch = Number(evaluationValues[i].FIXED);
                            updatedModel.maxThreshold = {
                                    color: "Error"
                            };
                            updatedModel.maxThreshold.data = (type  == "MEASURE") ?  data.results : [newObj];
                            maxThresholdMeasure = (type  == "MEASURE") ? that.sCriticalHigh : sMeasure;
                        } else if (evaluationValues[i].TYPE == "WH") {
                            var newObj = {};
                            newObj[dimensionName] = "";
                            newObj[sMeasure] = Number(evaluationValues[i].FIXED);
                            that.wh = Number(evaluationValues[i].FIXED);
                            updatedModel.innerMaxThreshold = {
                                    color: "Good"
                            };
                            updatedModel.innerMaxThreshold.data = (type  == "MEASURE") ? data.results : [newObj];
                            innerMaxThresholdMeasure = (type  == "MEASURE") ? that.sWarningHigh : sMeasure;
                        } else if (evaluationValues[i].TYPE == "WL") {
                            var newObj = {};
                            newObj[dimensionName] = "";
                            newObj[sMeasure] = Number(evaluationValues[i].FIXED);
                            that.wl = Number(evaluationValues[i].FIXED);
                            updatedModel.innerMinThreshold = {
                                    color: "Good"
                            };
                            updatedModel.innerMinThreshold.data = (type  == "MEASURE") ?  data.results : [newObj];
                            innerMinThresholdMeasure = (type  == "MEASURE") ? that.sWarningLow : sMeasure;
                        } else if (evaluationValues[i].TYPE == "CL") {
                            var newObj = {};
                            newObj[dimensionName] = "";
                            newObj[sMeasure] = Number(evaluationValues[i].FIXED);
                            that.cl = Number(evaluationValues[i].FIXED);
                            updatedModel.minThreshold = {
                                    color: "Error"
                            };
                            updatedModel.minThreshold.data = (type  == "MEASURE") ? data.results : [newObj];
                            minThresholdMeasure = (type  == "MEASURE") ? that.sCriticalLow : sMeasure;
                        } else if (evaluationValues[i].TYPE == "TA") {
                            var newObj = {};
                            newObj[dimensionName] = "";
                            newObj[sMeasure] = Number(evaluationValues[i].FIXED);
                            updatedModel.target = {
                                    color: "Neutral"
                            };
                            updatedModel.target.data = (type  == "MEASURE") ? data.results : [newObj];
                            targetMeasure = (type  == "MEASURE") ? that.sTarget : sMeasure;
                        }
                    }
                    if (type  == "FIXED"){
                        updatedModel.firstYLabel.color = (firstYLabelValue > that.ch || firstYLabelValue < that.cl ) ? "Error" : ((that.wh <= firstYLabelValue) && (firstYLabelValue <= that.ch)) || ((that.cl <= firstYLabelValue) && (firstYLabelValue <= that.wl))  ? "Critical" : ((firstYLabelValue >= that.wl) && (firstYLabelValue <= that.wh)) ? "Good" : "Neutral";
                        updatedModel.lastYLabel.color = (lastYLabelValue > that.ch || lastYLabelValue < that.cl ) ? "Error" : ((that.wh <= lastYLabelValue) && (lastYLabelValue <= that.ch)) || ((that.cl <= lastYLabelValue) && (lastYLabelValue <= that.wl))  ? "Critical" : ((lastYLabelValue >= that.wl) && (lastYLabelValue <= that.wh)) ? "Good"  : "Neutral";
                    } else if (type == "MEASURE" && that.firstwL && that.lastwL && that.firstcL && that.lastcL && that.firstwH && that.lastwH && that.firstcH && that.lastcH){
                        updatedModel.firstYLabel.color = (firstYLabelValue > that.firstcH || firstYLabelValue < that.firstcL ) ? "Error" : ((that.firstwH <= firstYLabelValue) && (firstYLabelValue <= that.firstcH)) || ((that.firstcL <= firstYLabelValue) && (firstYLabelValue <= that.firstwL))  ? "Critical" : ((firstYLabelValue >= that.firstwL) && (firstYLabelValue <= that.firstwH)) ? "Good" : "Neutral";
                        updatedModel.lastYLabel.color = (lastYLabelValue > that.lastcH || lastYLabelValue < that.lastcL ) ? "Error" : ((that.lastwH <= lastYLabelValue) && (lastYLabelValue <= that.lastcH)) || ((that.lastcL <= lastYLabelValue) && (lastYLabelValue <= that.lastwL))  ? "Critical" : ((lastYLabelValue >= that.lastwL) && (lastYLabelValue <= that.lastwH)) ? "Good" : "Neutral";
                    }
                    break;

                }

                var buildChartItem = function (sName, a, b, type) {
                    return new sap.suite.ui.commons.MicroAreaChartItem({
                        color: "{/" + sName + "/color}",
                        points: {
                            path: "/" + sName + "/data",
                            template: new sap.suite.ui.commons.MicroAreaChartPoint({
                                x: "{" + a + "}",
                                y: "{" + b + "}"

                            })
                        }
                    });
                };
                var TileRef = that.getTile().getTileContent()[0].getContent();
                TileRef.setTarget(buildChartItem("target", dimensionName, targetMeasure));
                TileRef.setInnerMinThreshold(buildChartItem("innerMinThreshold", dimensionName, innerMinThresholdMeasure));
                TileRef.setInnerMaxThreshold(buildChartItem("innerMaxThreshold", dimensionName, innerMaxThresholdMeasure));
                TileRef.setMinThreshold(buildChartItem("minThreshold", dimensionName, minThresholdMeasure));
                TileRef.setMaxThreshold(buildChartItem("maxThreshold", dimensionName, maxThresholdMeasure));
                TileRef.setChart(buildChartItem("chart", dimensionName, sMeasure));


                that.setTextInTile();
                if (that.getView().getViewData().parentController){
                    that.getView().getViewData().parentController._updateTileModel(updatedModel);
                } else {
                    that._updateTileModel(updatedModel);
                }

            }
        },

        doDummyProcess : function(){
            var that = this;
            this.setTextInTile();
            that._updateTileModel({
                footer : "",
                description: "",

                width: "100%",
                height: "100%",
                chart: {
                    color:"Good",
                    data: [
                           {day: 0, balance: 0},
                           {day: 30, balance: 20},
                           {day: 60, balance: 20},
                           {day: 100, balance: 80}
                           ]
                },
                target: {
                    color:"Error",
                    data: [
                           {day: 0, balance: 0},
                           {day: 30, balance: 30},
                           {day: 60, balance: 40},
                           {day: 100, balance: 90}
                           ]
                },
                maxThreshold: {
                    color: "Good",
                    data: [
                           {day: 0, balance: 0},
                           {day: 30, balance: 40},
                           {day: 60, balance: 50},
                           {day: 100, balance: 100}
                           ]
                },
                innerMaxThreshold: {
                    color: "Error",
                    data: []
                },
                innerMinThreshold: {
                    color: "Neutral",
                    data: []
                },
                minThreshold: {
                    color: "Error",
                    data: [
                       {day: 0, balance: 0},
                       {day: 30, balance: 20},
                       {day: 60, balance: 30},
                       {day: 100, balance: 70}
                   ]
                },
                minXValue: 0,
                maxXValue: 100,
                minYValue: 0,
                maxYValue: 100,
                firstXLabel: { label: "June 123", color: "Error"   },
                lastXLabel: { label: "June 30", color: "Error" },
                firstYLabel: { label: "0M", color: "Good" },
                lastYLabel: { label: "80M", color: "Critical" },
                minLabel: { },
                maxLabel: { }
            });
            this.oKpiTileView.oGenericTile.setState(sap.suite.ui.commons.LoadState.Loaded);
        }

    });
}());

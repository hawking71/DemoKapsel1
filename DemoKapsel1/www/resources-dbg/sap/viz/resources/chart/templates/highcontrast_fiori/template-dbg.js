(function() {
    var toString = Object.prototype.toString;

    function isArray(it){
        return toString.call(it) === '[object Array]';
    }
    function isObject(it){
        return toString.call(it) === '[object Object]';
    }
    function _merge(a, b){
        for(var key in b){
            if(isArray(b[key])){
                a[key] = b[key].slice();
            }else if(isObject(b[key])){
                a[key] = a[key] || {};
                _merge(a[key], b[key]);
            }else{
                a[key] = b[key];
            }
        }
        return a;
    }
    function merge(){
        var res = {};
        for(var i = 0; i < arguments.length; ++i){
            _merge(res, arguments[i]);
        }
        return res;
    }

    var axisColor = "#AAAAAA";
    var axisGridlineColor = "#333333";
    var plotColorPalette = ["#5cbae6", "#b6d957", "#fac364", "#8cd3ff", "#d998cb", "#fade64", "#93b9c6", "#d9d6c7", "#52bacc", "#dce65c", "#98aafb"];

    var rangeSlider = {
        rangeSlider: {
            sliderStyle: {
                borderColor: "#4e4e4e",
                highlightBorderColor: "#ffffff"
            },
            tooltipStyle: {
                fontColor: "#ffffff",
                borderColor: "#4e4e4e",
                highlightBorderColor: "#009de0",
                backgroundColor: "#333333"
            },
            thumbStyle: {
                indicatorStartColor: "#555555",
                indicatorEndColor: "#0c0c0c",
                indicatorPressStartColor: "#555555",
                indicatorPressEndColor: "#0c0c0c",
                indicatorBorderStartColor: "#ffffff",
                indicatorBorderEndColor: "#ffffff",
                indicatorPressBorderStartColor: "#8b8b8b",
                indicatorPressBorderEndColor: "#8b8b8b",
                indicatorInternalLineColor: "#ffffff",
                subRectBorderColor: "#ffffff",
                subRectColor: "#ffffff",
                rectOpacity: 0.3,
                rectColor: '#009de0',
                rectPressOpacity: 0.3,
                rectPressColor: "#ffffff"
            }
        }
    };

    var title = {
        title: {
            style: {
                color: '#D8D8D8'
            }
        }
    };

    var background = {
        background: {
            color: "#1B1B1B",
            border: {
                top: {
                    visible: false
                },
                bottom: {
                    visible: false
                },
                left: {
                    visible: false
                },
                right: {
                    visible: false
                }
            },
            drawingEffect: "normal"
        }
    };

    var scrollbar = {
        thumb: {
            fill: "#a6a6a6",
            hoverFill: "#888888"
        },
        track: {
            fill: '#333333'
        }
    };

    var legend = {
        legend: {
            drawingEffect: "normal",
            title: {
                visible: true,
                style: {
                    color: "#D8D8D8"
                }
            },
            label: {
                style: {
                    color: "#D8D8D8"
                }
            },
            hoverShadow: {
                color: "#606060"
            },
            mouseDownShadow: {
                color: "#cccccc"
            },
            scrollbar: scrollbar
        },
        sizeLegend: {
            drawingEffect: "normal",
            title: {
                visible: true,
                style: {
                    color: "#D8D8D8"
                }
            },
            label: {
                style: {
                    color: "#D8D8D8"
                }
            }
        }
    };

    var tooltip = {
        tooltip: {
            background: {
                color: "#000000",
                borderColor: "#ffffff"
            },
            drawingEffect: "normal",
            footerLabel: {
                color: "#ffffff"
            },
            separationLine: {
                // borderBottomColor: "#ffffff"
                color: "#ffffff"
            },
            bodyDimensionLabel: {
                color: "#c0c0c0"
            },
            bodyDimensionValue: {
                color: "#c0c0c0"
            },
            bodyMeasureLabel: {
                color: "#c0c0c0"
            },
            bodyMeasureValue: {
                color: "#ffffff"
            },
            closeButton: {
                backgroundColor: "#000000",
                borderColor: "#ffffff"
            }
        }
    };

    var plotArea = {
        plotArea: {
            defaultOthersStyle: {
                color: "#ffffff"
            },
            drawingEffect: "normal",
            colorPalette: plotColorPalette,
            referenceLine: {
                defaultStyle: {                
                    color: "#ffffff",
                    label: {
                        background: "#1B1B1B",
                        color: "#ffffff"
                    }
                }
            },
            dataPoint : {
                stroke : {
                    visible : true,
                    color : '#000000'
                },
                opacity : 0.9
            }                
        }
    };

    var plotAreaDual = merge(plotArea, {
        plotArea: {
            drawingEffect: "normal",
            primaryValuesColorPalette: ["#5cbae5", "#27a3dd", "#1b7eac"],
            secondaryValuesColorPalette: ["#b6d957", "#9dc62d", "#759422"]
        }    
    });

    var interaction = {
            interaction : {
                hover : {
                    stroke : {
                        color : '#ffffff'
                    }
                },
                selected : {
                    stroke : {
                        color : '#ffffff',
                        width : '2px'
                    }
                },
                deselected : {
                    opacity : 0.5,
                    stroke : {
                        visible: true,
                        color : '#000000'
                    }
                }
            }
    };

    var dataLabel = {
        plotArea: {
            dataLabel: {
                style: {
                    color: "#D8D8D8"
                }
            }
        }
    };

    var zAxis = {
        zAxis: {
            title: {
                visible: true,
                style: {
                    color: axisColor
                }
            },

            label: {
                style: {
                    color: axisColor
                }
            },
            color: axisColor
        }
    };


    // Axis----------------------------
    var axis = {
        title: {
            visible: true,
            style: {
                color: axisColor
            }
        },

        gridline: {
            color: axisGridlineColor
        },
        hoverShadow: {
            color: "#606060"
        },
        mouseDownShadow: {
            color: "#cccccc"
        },
        label: {
            style: {
                color: axisColor
            }
        },
        color: axisColor
    };

    var showAxisLine = {
        axisline: {
            visible: true
        }
    };

    var showInfoAxisLine = {
        axisLine: {
            visible: true
        }
    };

    var hideAxisLine = {
        axisline: {
            visible: false
        }
    };

    var hideInfoAxisLine = {
        axisLine: {
            visible: false
        }
    };

    var gridline = {
        gridline: {
            type: "line",
            color: axisGridlineColor,
            showLastLine: true
        }
    };

    var dual = {
        title: {
            applyAxislineColor: true
        }
    };

    var base = merge(title, background, legend, tooltip, interaction);

    var horizontalEffect = {
        xAxis: merge(axis, hideAxisLine, gridline),
        yAxis: axis,
        xAxis2: merge(axis, hideAxisLine)
    };

    var horizontalDualEffect = merge(horizontalEffect, {
        xAxis: dual,
        xAxis2: dual
    });

    var verticalEffect = {
        yAxis: merge(axis, hideAxisLine, gridline),
        xAxis: axis,
        yAxis2: merge(axis, hideAxisLine)
    };

    var verticalDualEffect = merge(verticalEffect, {
        yAxis: dual,
        yAxis2: dual
    });
    
    //------------------------------------------------
    var barEffect = merge(base, plotArea, dataLabel, horizontalEffect);

    var bar3dEffect = merge(base, plotArea, zAxis, horizontalEffect);

    var dualbarEffect = merge(base, plotAreaDual, dataLabel, horizontalDualEffect);

    var verticalbarEffect = merge(base, plotArea, dataLabel, rangeSlider, verticalEffect);

    var vertical3dbarEffect = merge(base, plotArea, zAxis, verticalEffect);

    var dualverticalbarEffect = merge(base, plotAreaDual, dataLabel, verticalDualEffect);

    var stackedbarEffect = merge(base, plotArea, horizontalEffect);

    var dualstackedbarEffect = merge(base, plotAreaDual, horizontalDualEffect);

    var stackedverticalbarEffect = merge(base, plotArea, {
        yAxis: merge(axis, hideAxisLine, dual),
        xAxis: axis,
        yAxis2: merge(axis, hideAxisLine)
    });

    var dualstackedverticalbarEffect = merge(base, plotAreaDual, verticalDualEffect);

    var lineEffect = merge(base, plotArea, dataLabel, rangeSlider, verticalEffect);

    var duallineEffect = merge(base, plotAreaDual, dataLabel, verticalDualEffect);

    var horizontallineEffect = merge(base, plotArea, dataLabel, horizontalEffect);

    var dualhorizontallineEffect = merge(base, plotAreaDual, dataLabel, horizontalDualEffect);

    var combinationEffect = merge(base, plotArea, dataLabel, rangeSlider, verticalEffect);

    var dualcombinationEffect = merge(base, plotAreaDual, dataLabel, verticalDualEffect);

    var horizontalcombinationEffect = merge(base, plotArea, dataLabel, horizontalEffect);

    var dualhorizontalcombinationEffect = merge(base, plotAreaDual, dataLabel, horizontalDualEffect);

    var bubbleEffect = merge(base, plotArea, dataLabel, {
        yAxis: merge(axis, hideAxisLine, gridline),
        xAxis: axis
    });

    var pieEffect = merge(title, legend, plotArea, dataLabel, tooltip, interaction);

    var pieWithDepthEffect = pieEffect;

    var radarEffect = merge(legend, tooltip, plotArea, {
        background: {
            visible: false
        },
        plotArea: {
            valueAxis: {
                title: {
                    visible: true
                },
                gridline: {
                    color: axisGridlineColor
                }
            },
            dataline: {
                fill: {
                    transparency: 0
                }
            },
            polarGrid: {
                color: axisGridlineColor
            }
        }
    });

    var mekkoEffect = merge(base, plotArea, {
        yAxis: merge(axis, hideAxisLine, {
            gridline: {
                type: "line"
            }
        }),
        xAxis: merge(axis, showAxisLine),
        xAxis2: merge(axis, showAxisLine)
    });
    var horizontalmekkoEffect = merge(base, plotArea, {
        xAxis: merge(axis, hideAxisLine, {
            gridline: {
                type: "line"
            }
        }),
        yAxis: merge(axis, showAxisLine),
        yAxis2: merge(axis, showAxisLine)
    });

    var bulletEffect = merge(legend, background, tooltip, plotArea, interaction, {
        plotArea: {
            target:{
               valueColor: "#FFFFFF",
               shadowColor: "#000000"
            },
            gridline:{
                visible: true
            }
        },
        categoryAxis:{
            title:{
                visible: true
            }
        },
        title:{
            style:{
                color:"#d8d8d8"
            }
        },
        categoryAxis2: {
            label: {
                style: {
                    color: "#FFFFFF"
                }
            }
        }
    });
    
    var trellisBulletEffect = merge(bulletEffect, {plotArea:{gridline:{visible: false}}});

    var treemapEffect = merge(legend, tooltip, interaction);

    sap.viz.extapi.env.Template.register({
        id: "highcontrast_fiori",
        name: "HighContrast Fiori",
        version: "4.0.0",
        properties: {
            'viz/bar': barEffect,
            'viz/3d_bar': bar3dEffect,
            'viz/image_bar': barEffect,
            'viz/multi_bar': barEffect,
            'viz/dual_bar': dualbarEffect,
            'viz/multi_dual_bar': dualbarEffect,
            'viz/column': verticalbarEffect,
            'viz/3d_column': vertical3dbarEffect,
            'viz/multi_column': verticalbarEffect,
            'viz/dual_column': dualverticalbarEffect,
            'viz/multi_dual_column': dualverticalbarEffect,
            'viz/stacked_bar': stackedbarEffect,
            'viz/multi_stacked_bar': stackedbarEffect,
            'viz/dual_stacked_bar': dualstackedbarEffect,
            'viz/multi_dual_stacked_bar': dualstackedbarEffect,
            'viz/100_stacked_bar': stackedbarEffect,
            'viz/multi_100_stacked_bar': stackedbarEffect,
            'viz/100_dual_stacked_bar': dualstackedbarEffect,
            'viz/multi_100_dual_stacked_bar': dualstackedbarEffect,
            'viz/stacked_column': stackedverticalbarEffect,
            'viz/multi_stacked_column': stackedverticalbarEffect,
            'viz/dual_stacked_column': dualstackedverticalbarEffect,
            'viz/multi_dual_stacked_column': dualstackedverticalbarEffect,
            'viz/100_stacked_column': stackedverticalbarEffect,
            'viz/multi_100_stacked_column': stackedverticalbarEffect,
            'viz/100_dual_stacked_column': dualstackedverticalbarEffect,
            'viz/multi_100_dual_stacked_column': dualstackedverticalbarEffect,
            'riv/cbar': merge(legend, tooltip, plotArea, {
                background: {
                    drawingEffect: "normal"
                },
                yAxis: axis
            }),
            'viz/combination': combinationEffect,
            'viz/horizontal_combination': horizontalcombinationEffect,
            'viz/dual_combination': dualcombinationEffect,
            'viz/dual_horizontal_combination': dualhorizontalcombinationEffect,
            'viz/boxplot': merge(base, plotArea, {
                yAxis: merge(axis, hideAxisLine, gridline),
                xAxis: axis
            }),
            'viz/horizontal_boxplot': merge(base, plotArea, {
                xAxis: merge(axis, hideAxisLine, gridline),
                yAxis: axis
            }),
            'viz/waterfall': merge(base, plotArea, {
                yAxis: merge(axis, hideAxisLine, gridline),
                xAxis: axis
            }),
            'viz/horizontal_waterfall': merge(base, plotArea, {
                xAxis: merge(axis, hideAxisLine, gridline),
                yAxis: axis
            }),

            'viz/stacked_waterfall': stackedverticalbarEffect,
            'viz/horizontal_stacked_waterfall': stackedbarEffect,

            'viz/line': lineEffect,
            'viz/multi_line': lineEffect,
            'viz/dual_line': duallineEffect,
            'viz/multi_dual_line': duallineEffect,
            'viz/horizontal_line': horizontallineEffect,
            'viz/multi_horizontal_line': horizontallineEffect,
            'viz/dual_horizontal_line': dualhorizontallineEffect,
            'viz/multi_dual_horizontal_line': dualhorizontallineEffect,

            'viz/area': lineEffect,
            'viz/multi_area': lineEffect,
            'viz/100_area': lineEffect,
            'viz/multi_100_area': lineEffect,
            'viz/horizontal_area': horizontallineEffect,
            'viz/multi_horizontal_area': horizontallineEffect,
            'viz/100_horizontal_area': horizontallineEffect,
            'viz/multi_100_horizontal_area': horizontallineEffect,
            'viz/pie': pieEffect,
            'viz/multi_pie': pieEffect,
            'viz/donut': pieEffect,
            'viz/multi_donut': pieEffect,
            'viz/pie_with_depth': pieWithDepthEffect,
            'viz/donut_with_depth': pieWithDepthEffect,
            'viz/multi_pie_with_depth': pieWithDepthEffect,
            'viz/multi_donut_with_depth': pieWithDepthEffect,
            'viz/bubble': bubbleEffect,
            'viz/multi_bubble': bubbleEffect,
            'viz/scatter': bubbleEffect,
            'viz/multi_scatter': bubbleEffect,
            'viz/scatter_matrix': bubbleEffect,
            'viz/radar': radarEffect,
            'viz/multi_radar': radarEffect,
            'viz/tagcloud': merge(legend, tooltip),
            'viz/heatmap': merge(legend, tooltip, {
                xAxis: axis,
                yAxis: axis
            }),
            'viz/treemap': treemapEffect,
            'viz/mekko': mekkoEffect,
            'viz/100_mekko': mekkoEffect,
            'viz/horizontal_mekko': horizontalmekkoEffect,
            'viz/100_horizontal_mekko': horizontalmekkoEffect,
            'viz/number': merge(tooltip, {
                plotArea: {
                    valuePoint: {
                        label: {
                            fontColor: '#D8D8D8'
                        }
                    }
                }
            }),

            'info/column': info(verticalbarEffect),
            'info/bar': info(barEffect),
            'info/line': info(lineEffect),
            'info/pie': info(pieEffect),
            'info/donut': info(pieEffect),
            'info/scatter': infoBubble(bubbleEffect),
            'info/bubble': infoBubble(bubbleEffect),
            'info/stacked_column': info(stackedverticalbarEffect),
            'info/stacked_bar': info(stackedbarEffect),
            'info/combination': info(combinationEffect),
            'info/stacked_combination': info(combinationEffect),
            'info/dual_stacked_combination': infoDual(dualcombinationEffect),
            'info/dual_column': infoDual(dualverticalbarEffect),
            'info/dual_bar': infoDual(dualbarEffect),
            'info/dual_line': infoDual(duallineEffect),
            'info/100_stacked_column': info(stackedverticalbarEffect),
            'info/100_stacked_bar': info(stackedbarEffect),
            'info/horizontal_line': info(horizontallineEffect),
            'info/dual_horizontal_line': infoDual(dualhorizontallineEffect),
            'info/horizontal_combination': info(horizontalcombinationEffect),
            'info/horizontal_stacked_combination': info(horizontalcombinationEffect),
            'info/dual_horizontal_stacked_combination': infoDual(dualhorizontalcombinationEffect),
            'info/treemap': infoTreemap(treemapEffect),

            'info/trellis_column': trellis(info(verticalbarEffect)),
            'info/trellis_bar': trellis(info(barEffect)),
            'info/trellis_line': trellis(info(lineEffect)),
            'info/trellis_pie': trellis(info(pieEffect)),
            'info/trellis_donut': trellis(info(pieEffect)),
            'info/trellis_scatter': trellis(infoBubble(bubbleEffect)),
            'info/trellis_bubble': trellis(infoBubble(bubbleEffect)),
            'info/trellis_stacked_column': trellis(info(stackedverticalbarEffect)),
            'info/trellis_stacked_bar': trellis(info(stackedbarEffect)),
            'info/trellis_combination': trellis(info(combinationEffect)),
            'info/trellis_dual_column': trellis(infoDual(dualverticalbarEffect)),
            'info/trellis_dual_bar': trellis(infoDual(dualbarEffect)),
            'info/trellis_dual_stacked_bar': trellis(infoDual(dualbarEffect)),
            'info/trellis_dual_stacked_column': trellis(infoDual(dualverticalbarEffect)),
            'info/trellis_dual_line': trellis(infoDual(duallineEffect)),
            'info/trellis_100_stacked_column': trellis(info(stackedverticalbarEffect)),
            'info/trellis_100_stacked_bar': trellis(info(stackedbarEffect)),
            'info/trellis_horizontal_line': trellis(info(horizontallineEffect)),
            'info/trellis_dual_horizontal_line': trellis(infoDual(dualhorizontallineEffect)),
            'info/trellis_horizontal_combination': trellis(info(horizontalcombinationEffect)),

            'info/dual_stacked_bar': infoDual(dualstackedbarEffect),
            'info/100_dual_stacked_bar': infoDual(dualstackedbarEffect),
            'info/dual_stacked_column': infoDual(dualstackedverticalbarEffect),
            'info/100_dual_stacked_column': infoDual(dualstackedverticalbarEffect),
            'info/time_bubble': infoBubble(bubbleEffect),
            'info/bullet': info(bulletEffect),
            'info/vertical_bullet': info(bulletEffect),
            'info/trellis_bullet': trellis(info(trellisBulletEffect)),
            'info/trellis_vertical_bullet': trellis(info(trellisBulletEffect))

        },
        
        // css property not apply for info chart flag
        isBuiltIn : true,
        //v-hidden-title must be set after v-title
        //v-longtick must be set after v-categoryaxisline
        css: "\
  .v-m-title .v-title{fill:#D8D8D8;}\
  .v-subtitle{fill:#D8D8D8;}\
  .v-longtick{stroke:#5e5e5e;}\
  .v-title{fill:#D8D8D8;}\
  .v-hidden-title{fill:#737373;}\
  .v-label{fill:#D8D8D8;}\
  .v-background-body{fill:#1B1B1B;}\
  .v-pie .v-donut-title{fill:#D8D8D8;}\
  .v-polar-axis-label{fill:#D8D8D8;}\
  .v-datalabel{fill:#D8D8D8;}\
  .v-hoverline{stroke:#606060;}\
  .v-hovershadow{fill:#606060;}\
  .v-hovershadow-mousedown{fill:#cccccc;}\
  .v-m-tooltip .v-background{background-color:#000000; border-color:#ffffff; fill:#1B1B1B;stroke:#FFFFFF;}\
  .v-m-tooltip .v-footer-label{color:#ffffff; fill:#D8D8D8;}\
  .v-m-tooltip .v-body-dimension-label{color:#c0c0c0;}\
  .v-m-tooltip .v-body-dimension-value{color:#c0c0c0;}\
  .v-m-tooltip .v-body-measure-label{color:#c0c0c0;}\
  .v-m-tooltip .v-body-measure-value{color:#ffffff;}\
  .v-m-tooltip .v-separationline{border-bottom-color:#ffffff;}\
  .v-m-tooltip .v-closeButton{background-color:#000000;border-color:#ffffff;}\
  .v-datapoint-default{stroke:#000000}\
  .v-datapoint-hover{stroke:#999999}\
  .v-datapoint-selected{stroke:#999999}\
  .v-datapoint .v-boxplotmidline{stroke:#ffffff}\
  .v-scrollbarThumb{fill:#c0c0c0}\
  "
    });

  
    
    function trellis(obj){
        obj.rowAxis = {
            color : axisColor,
            label : {
                style : {
                    color : axisColor
                }
            },
            hoverShadow: {
                color: "#606060"
            },
            mouseDownShadow: {
                color: "#cccccc"
            },
            title : {
                style : {
                    color : axisColor
                }
            }
        };
        obj.columnAxis = {
            color : axisColor,
            label : {
                style : {
                    color : axisColor
                }
            },
            hoverShadow: {
                color: "#606060"
            },
            mouseDownShadow: {
                color: "#cccccc"
            },
            title : {
                style : {
                    color : axisColor
                }
            }
        };
        obj.plotArea = obj.plotArea || {};
        obj.plotArea.cellGrid = {
            color: axisGridlineColor
        };
        return obj;
    }

    function info(obj) {
        var ret = {};
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                ret[i] = obj[i];
            }
        }

        ret.valueAxis = merge(axis, hideInfoAxisLine, gridline, {
        });

        ret.categoryAxis = merge(axis, {
            hoverShadow: {
                color: "#606060"
            },
            mouseDownShadow: {
                color: "#cccccc"
            }
        });

        ret.plotArea.scrollbar = scrollbar;
        general(ret);
        return ret;
    }

    function infoDual(obj) {
        var ret = {};
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                ret[i] = obj[i];
            }
        }
        ret.valueAxis = merge(axis, hideInfoAxisLine, gridline, dual);
        delete ret.valueAxis.color;

        ret.categoryAxis = merge(axis, {
            hoverShadow: {
                color: "#606060"
            },
            mouseDownShadow: {
                color: "#cccccc"
            }
        });

        ret.valueAxis2 = merge(axis, hideInfoAxisLine, dual);
        delete ret.valueAxis2.color;

        ret.plotArea.scrollbar = scrollbar;
        general(ret);
        return ret;
    }

    function infoBubble(obj) {
        var ret = {};
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                ret[i] = obj[i];
            }
        }

        ret.valueAxis = merge(axis, gridline, showInfoAxisLine);

        ret.valueAxis2 = merge(axis, hideInfoAxisLine);

        ret.plotArea.scrollbar = scrollbar;


        general(ret);
        return ret;
    }

    function infoTreemap(obj) {
        var ret = {};
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                ret[i] = obj[i];
            }
        }

        ret.plotArea = {};
        ret.plotArea.background = {}; 
        ret.plotArea.dataPoint = {stroke:{visible:true}};

        ret = merge(background, ret, title);
      
        general(ret);

        return ret;
    }

    function general(obj) {
        obj.plotArea = obj.plotArea || {};
        obj.plotArea.background = obj.background;
        delete obj.background;

        delete obj.xAxis;
        delete obj.xAxis2;
        delete obj.yAxis;
        delete obj.yAxis2;

        var gen = obj.general = obj.general || {};
        gen.background = {
            color: "#1B1B1B"
        };

        if (!obj.plotArea.gridline) {
            obj.plotArea.gridline = {};
        }

        obj.plotArea.gridline.color = axisGridlineColor;

        obj.legend = obj.legend || {};
        obj.legend.hoverShadow = {
            color: "#606060"
        };

        obj.legend.mouseDownShadow = {
            color: "#cccccc"
        };
        
    }

})();

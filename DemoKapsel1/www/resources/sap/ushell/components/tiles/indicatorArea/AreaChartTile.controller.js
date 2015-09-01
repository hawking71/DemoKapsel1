(function(){"use strict";jQuery.sap.require("sap.ushell.components.tiles.generic");sap.ushell.components.tiles.generic.extend("tiles.indicatorArea.AreaChartTile",{onInit:function(){this.KPI_VALUE_REQUIRED=false;},doProcess:function(){this.onAfterFinalEvaluation();},onAfterFinalEvaluation:function(){var t=this;var u=this.DEFINITION_DATA.EVALUATION.ODATA_URL;var E=this.DEFINITION_DATA.EVALUATION.ODATA_ENTITYSET;var m=this.DEFINITION_DATA.EVALUATION.COLUMN_NAME;var v=sap.ushell.components.tiles.indicatorTileUtils.util.prepareFilterStructure(this.DEFINITION_DATA.EVALUATION_FILTERS,this.DEFINITION_DATA.ADDITIONAL_FILTERS);var d=this.DEFINITION_DATA.TILE_PROPERTIES.dimension;if(d==undefined){this.logError();return;}var g=this.DEFINITION_DATA.EVALUATION.GOAL_TYPE;var f=this.DEFINITION_DATA.EVALUATION_VALUES;if(this.DEFINITION_DATA.EVALUATION.VALUES_SOURCE=="MEASURE"){var h=m;switch(g){case"MI":t.sWarningHigh=sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(t.oConfig,"WH","MEASURE");t.sCriticalHigh=sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(t.oConfig,"CH","MEASURE");t.sTarget=sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(t.oConfig,"TA","MEASURE");t.sTrend=sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(t.oConfig,"TC","MEASURE");if(t.sWarningHigh&&t.sCriticalHigh&&t.sTarget){h+=","+t.sWarningHigh+","+t.sCriticalHigh+","+t.sTarget;}break;case"MA":t.sWarningLow=sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(t.oConfig,"WL","MEASURE");t.sCriticalLow=sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(t.oConfig,"CL","MEASURE");t.sTarget=sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(t.oConfig,"TA","MEASURE");t.sTrend=sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(t.oConfig,"TC","MEASURE");if(t.sWarningLow&&t.sCriticalLow&&t.sTarget){h+=","+t.sWarningLow+","+t.sCriticalLow+","+t.sTarget;}break;case"RA":t.sWarningHigh=sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(t.oConfig,"WH","MEASURE");t.sCriticalHigh=sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(t.oConfig,"CH","MEASURE");t.sTarget=sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(t.oConfig,"TA","MEASURE");t.sTrend=sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(t.oConfig,"TC","MEASURE");t.sWarningLow=sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(t.oConfig,"WL","MEASURE");t.sCriticalLow=sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(t.oConfig,"CL","MEASURE");if(t.sWarningLow&&t.sCriticalLow&&t.sTarget&&t.sWarningHigh&&t.sCriticalHigh){h+=","+t.sWarningLow+","+t.sCriticalLow+","+t.sTarget+","+t.sWarningHigh+","+t.sCriticalHigh;}break;}var q=sap.ushell.components.tiles.indicatorTileUtils.util.prepareQueryServiceUri(t.oTileApi.url.addSystemToServiceUrl(u),E,h,d,v);}else{var q=sap.ushell.components.tiles.indicatorTileUtils.util.prepareQueryServiceUri(t.oTileApi.url.addSystemToServiceUrl(u),E,m,d,v);}var j=sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(t.oConfig.TILE_PROPERTIES.id);if(!j){if(q){this.queryUriForTrendChart=q.uri;var w={};try{this.trendChartODataReadRef=q.model.read(q.uri,null,null,true,function(a){if(a&&a.results&&a.results.length){if(q.unit[0]){t.unit=a.results[0][q.unit[0].name];t.CURRENCY_CODE=t.unit;w.unit=q.unit[0];w.unit.name=q.unit[0].name;}t.queryUriResponseForTrendChart=a;d=sap.ushell.components.tiles.indicatorTileUtils.util.findTextPropertyForDimension(t.oTileApi.url.addSystemToServiceUrl(u),E,d);a.firstXlabel=a.results[0][d];a.lastXlabel=a.results[a.results.length-1][d];if(t.oConfig.TILE_PROPERTIES.frameType==sap.suite.ui.commons.FrameType.TwoByOne){if(sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(t.oConfig.TILE_PROPERTIES.id)){w=sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(t.oConfig.TILE_PROPERTIES.id);}w.data=a;}else{w.data=a;}w.dimensionName=d;sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(t.oConfig.TILE_PROPERTIES.id,w);_(a,t.DEFINITION_DATA.EVALUATION.VALUES_SOURCE);if(t.DEFINITION_DATA.TILE_PROPERTIES.frameType==sap.suite.ui.commons.FrameType.TwoByOne){t.getView().getViewData().deferredObj.resolve();}else{var n=sap.ushell.components.tiles.indicatorTileUtils.util.getNavigationTarget(t.oConfig,t.system);t.oKpiTileView.oGenericTile.$().wrap("<a href ='"+n+"'/>");t.oKpiTileView.oGenericTile.setState(sap.suite.ui.commons.LoadState.Loaded);}}else{t.setNoData();}},function(a){if(a&&a.response){t.logError("Data call failed");}});}catch(e){t.logError(e);}}else{t.logError();}}else{try{if(j.unit){t.unit=j.data.results[0][j.unit.name];t.CURRENCY_CODE=t.unit;}t.queryUriResponseForTrendChart=j.data;d=j.dimensionName;_(j.data,t.DEFINITION_DATA.EVALUATION.VALUES_SOURCE);if(t.oConfig.TILE_PROPERTIES.frameType==sap.suite.ui.commons.FrameType.OneByOne){t.oKpiTileView.oGenericTile.setState(sap.suite.ui.commons.LoadState.Loaded);}else{t.getView().getViewData().deferredObj.resolve();}}catch(e){t.logError(e);}}function _(k,l){var n=[];var o=[];var p=[];var r=[];var s=[];var x=[];var y=k.firstXlabel;var z,A,B,C,D;var F=k.lastXlabel;var G=Number(k.results[0][m]);var H=Number(k.results[k.results.length-1][m]);var i;for(i in k.results){k.results[i][d]=Number(i);k.results[i][m]=Number(k.results[i][m]);t.sWarningHigh?k.results[i][t.sWarningHigh]=Number(k.results[i][t.sWarningHigh]):"";t.sCriticalHigh?k.results[i][t.sCriticalHigh]=Number(k.results[i][t.sCriticalHigh]):"";t.sCriticalLow?k.results[i][t.sCriticalLow]=Number(k.results[i][t.sCriticalLow]):"";t.sWarningLow?k.results[i][t.sWarningLow]=Number(k.results[i][t.sWarningLow]):"";t.sTarget?k.results[i][t.sTarget]=Number(k.results[i][t.sTarget]):"";t.sWarningHigh?p.push(k.results[i][t.sWarningHigh]):"";t.sCriticalHigh?r.push(k.results[i][t.sCriticalHigh]):"";t.sCriticalLow?s.push(k.results[i][t.sCriticalLow]):"";t.sWarningLow?x.push(k.results[i][t.sWarningLow]):"";n.push(k.results[i][d]);o.push(k.results[i][m]);}try{y=sap.ushell.components.tiles.indicatorTileUtils.util.formatOdataObjectToString(y);F=sap.ushell.components.tiles.indicatorTileUtils.util.formatOdataObjectToString(F);}catch(e){t.logError(e);}var I=Number(G);if(t.oConfig.EVALUATION.SCALING==-2){I*=100;}var J=Math.min.apply(Math,o);var c=t.isACurrencyMeasure(t.oConfig.EVALUATION.COLUMN_NAME);var K=sap.ushell.components.tiles.indicatorTileUtils.util.getLocaleFormattedValue(I,t.oConfig.EVALUATION.SCALING,t.oConfig.EVALUATION.DECIMAL_PRECISION,c,t.CURRENCY_CODE);if(t.oConfig.EVALUATION.SCALING==-2){K+=" %";}var L=K.toString();var M=Number(H);if(t.oConfig.EVALUATION.SCALING==-2){M*=100;}var N=Math.max.apply(Math,o);c=t.isACurrencyMeasure(t.oConfig.EVALUATION.COLUMN_NAME);var O=sap.ushell.components.tiles.indicatorTileUtils.util.getLocaleFormattedValue(M,t.oConfig.EVALUATION.SCALING,t.oConfig.EVALUATION.DECIMAL_PRECISION,c,t.CURRENCY_CODE);if(t.oConfig.EVALUATION.SCALING==-2){O+=" %";}var P=O.toString();try{var Q=sap.ushell.components.tiles.indicatorTileUtils.util.formatOdataObjectToString(Math.min.apply(Math,n));var R=sap.ushell.components.tiles.indicatorTileUtils.util.formatOdataObjectToString(Math.max.apply(Math,n));}catch(e){t.logError(e);}if(l=="MEASURE"){(p.length!=0)?(t.firstwH=p[Q])&&(t.lastwH=p[R]):"";(r.length!=0)?(t.firstcH=r[Q])&&(t.lastcH=r[R]):"";(s.length!=0)?(t.firstcL=s[Q])&&(t.lastcL=s[R]):"";(x.length!=0)?(t.firstwL=x[Q])&&(t.lastwL=x[R]):"";}var S={width:"100%",height:"100%",unit:t.unit||"",chart:{color:"Neutral",data:k.results},size:"Auto",minXValue:Q,maxXValue:R,minYValue:J,maxYValue:N,firstXLabel:{label:y+"",color:"Neutral"},lastXLabel:{label:F+"",color:"Neutral"},firstYLabel:{label:L+"",color:"Neutral"},lastYLabel:{label:P+"",color:"Neutral"},minLabel:{},maxLabel:{}};switch(g){case"MA":for(i in f){if(f[i].TYPE=="CL"){S.minThreshold={color:"Error"};var T={};T[d]="";T[m]=Number(f[i].FIXED);t.cl=Number(f[i].FIXED);S.minThreshold.data=(l=="MEASURE")?k.results:[T];z=(l=="MEASURE")?t.sCriticalLow:m;}else if(f[i].TYPE=="WL"){S.maxThreshold={color:"Good"};var T={};T[d]="";T[m]=Number(f[i].FIXED);S.maxThreshold.data=(l=="MEASURE")?k.results:[T];A=(l=="MEASURE")?t.sWarningLow:m;t.wl=Number(f[i].FIXED);}else if(f[i].TYPE=="TA"){var T={};T[d]="";T[m]=Number(f[i].FIXED);S.target={color:"Neutral"};S.target.data=(l=="MEASURE")?k.results:[T];D=(l=="MEASURE")?t.sTarget:m;}}S.innerMinThreshold={data:[]};S.innerMaxThreshold={data:[]};if(l=="FIXED"){S.firstYLabel.color=G<t.cl?"Error":((t.cl<=G)&&(G<=t.wl))?"Critical":(G>t.wl)?"Good":"Neutral";S.lastYLabel.color=H<t.cl?"Error":((t.cl<=H)&&(H<=t.wl))?"Critical":(H>t.wl)?"Good":"Neutral";}else if(l=="MEASURE"&&t.firstwL&&t.lastwL&&t.firstcL&&t.lastcL){S.firstYLabel.color=G<t.firstcL?"Error":((t.firstcL<=G)&&(G<=t.firstwL))?"Critical":(G>t.firstwL)?"Good":"Neutral";S.lastYLabel.color=H<t.lastcL?"Error":((t.lastcL<=H)&&(H<=t.lastwL))?"Critical":(H>t.lastwL)?"Good":"Neutral";}break;case"MI":for(i in f){if(f[i].TYPE=="CH"){var T={};T[d]="";T[m]=Number(f[i].FIXED);t.ch=Number(f[i].FIXED);S.maxThreshold={color:"Error"};S.maxThreshold.data=(l=="MEASURE")?k.results:[T];A=(l=="MEASURE")?t.sCriticalHigh:m;}else if(f[i].TYPE=="WH"){var T={};T[d]="";T[m]=Number(f[i].FIXED);t.wh=Number(f[i].FIXED);S.minThreshold={color:"Good"};S.minThreshold.data=(l=="MEASURE")?k.results:[T];z=(l=="MEASURE")?t.sWarningHigh:m;}else if(f[i].TYPE=="TA"){var T={};T[d]="";T[m]=Number(f[i].FIXED);S.target={color:"Neutral"};S.target.data=(l=="MEASURE")?k.results:[T];D=(l=="MEASURE")?t.sTarget:m;}}if(l=="FIXED"){S.firstYLabel.color=G>t.ch?"Error":((t.wh<=G)&&(G<=t.ch))?"Critical":(G<t.wh)?"Good":"Neutral";S.lastYLabel.color=H>t.ch?"Error":((t.wh<=H)&&(H<=t.ch))?"Critical":(H<t.wh)?"Good":"Neutral";}else if(l=="MEASURE"&&t.firstwH&&t.lastwH&&t.firstcH&&t.lastcH){S.firstYLabel.color=G>t.firstcH?"Error":((t.firstwH<=G)&&(G<=t.firstcH))?"Critical":(G<t.firstwH)?"Good":"Neutral";S.lastYLabel.color=H>t.lastcH?"Error":((t.lastwH<=H)&&(H<=t.lastcH))?"Critical":(H<t.lastwH)?"Good":"Neutral";}S.innerMaxThreshold={data:[]};S.innerMinThreshold={data:[]};break;case"RA":for(i in f){if(f[i].TYPE=="CH"){var T={};T[d]="";T[m]=Number(f[i].FIXED);t.ch=Number(f[i].FIXED);S.maxThreshold={color:"Error"};S.maxThreshold.data=(l=="MEASURE")?k.results:[T];A=(l=="MEASURE")?t.sCriticalHigh:m;}else if(f[i].TYPE=="WH"){var T={};T[d]="";T[m]=Number(f[i].FIXED);t.wh=Number(f[i].FIXED);S.innerMaxThreshold={color:"Good"};S.innerMaxThreshold.data=(l=="MEASURE")?k.results:[T];C=(l=="MEASURE")?t.sWarningHigh:m;}else if(f[i].TYPE=="WL"){var T={};T[d]="";T[m]=Number(f[i].FIXED);t.wl=Number(f[i].FIXED);S.innerMinThreshold={color:"Good"};S.innerMinThreshold.data=(l=="MEASURE")?k.results:[T];B=(l=="MEASURE")?t.sWarningLow:m;}else if(f[i].TYPE=="CL"){var T={};T[d]="";T[m]=Number(f[i].FIXED);t.cl=Number(f[i].FIXED);S.minThreshold={color:"Error"};S.minThreshold.data=(l=="MEASURE")?k.results:[T];z=(l=="MEASURE")?t.sCriticalLow:m;}else if(f[i].TYPE=="TA"){var T={};T[d]="";T[m]=Number(f[i].FIXED);S.target={color:"Neutral"};S.target.data=(l=="MEASURE")?k.results:[T];D=(l=="MEASURE")?t.sTarget:m;}}if(l=="FIXED"){S.firstYLabel.color=(G>t.ch||G<t.cl)?"Error":((t.wh<=G)&&(G<=t.ch))||((t.cl<=G)&&(G<=t.wl))?"Critical":((G>=t.wl)&&(G<=t.wh))?"Good":"Neutral";S.lastYLabel.color=(H>t.ch||H<t.cl)?"Error":((t.wh<=H)&&(H<=t.ch))||((t.cl<=H)&&(H<=t.wl))?"Critical":((H>=t.wl)&&(H<=t.wh))?"Good":"Neutral";}else if(l=="MEASURE"&&t.firstwL&&t.lastwL&&t.firstcL&&t.lastcL&&t.firstwH&&t.lastwH&&t.firstcH&&t.lastcH){S.firstYLabel.color=(G>t.firstcH||G<t.firstcL)?"Error":((t.firstwH<=G)&&(G<=t.firstcH))||((t.firstcL<=G)&&(G<=t.firstwL))?"Critical":((G>=t.firstwL)&&(G<=t.firstwH))?"Good":"Neutral";S.lastYLabel.color=(H>t.lastcH||H<t.lastcL)?"Error":((t.lastwH<=H)&&(H<=t.lastcH))||((t.lastcL<=H)&&(H<=t.lastwL))?"Critical":((H>=t.lastwL)&&(H<=t.lastwH))?"Good":"Neutral";}break;}var U=function(W,a,b,l){return new sap.suite.ui.commons.MicroAreaChartItem({color:"{/"+W+"/color}",points:{path:"/"+W+"/data",template:new sap.suite.ui.commons.MicroAreaChartPoint({x:"{"+a+"}",y:"{"+b+"}"})}});};var V=t.getTile().getTileContent()[0].getContent();V.setTarget(U("target",d,D));V.setInnerMinThreshold(U("innerMinThreshold",d,B));V.setInnerMaxThreshold(U("innerMaxThreshold",d,C));V.setMinThreshold(U("minThreshold",d,z));V.setMaxThreshold(U("maxThreshold",d,A));V.setChart(U("chart",d,m));t.setTextInTile();if(t.getView().getViewData().parentController){t.getView().getViewData().parentController._updateTileModel(S);}else{t._updateTileModel(S);}}},doDummyProcess:function(){var t=this;this.setTextInTile();t._updateTileModel({footer:"",description:"",width:"100%",height:"100%",chart:{color:"Good",data:[{day:0,balance:0},{day:30,balance:20},{day:60,balance:20},{day:100,balance:80}]},target:{color:"Error",data:[{day:0,balance:0},{day:30,balance:30},{day:60,balance:40},{day:100,balance:90}]},maxThreshold:{color:"Good",data:[{day:0,balance:0},{day:30,balance:40},{day:60,balance:50},{day:100,balance:100}]},innerMaxThreshold:{color:"Error",data:[]},innerMinThreshold:{color:"Neutral",data:[]},minThreshold:{color:"Error",data:[{day:0,balance:0},{day:30,balance:20},{day:60,balance:30},{day:100,balance:70}]},minXValue:0,maxXValue:100,minYValue:0,maxYValue:100,firstXLabel:{label:"June 123",color:"Error"},lastXLabel:{label:"June 30",color:"Error"},firstYLabel:{label:"0M",color:"Good"},lastYLabel:{label:"80M",color:"Critical"},minLabel:{},maxLabel:{}});this.oKpiTileView.oGenericTile.setState(sap.suite.ui.commons.LoadState.Loaded);}});}());
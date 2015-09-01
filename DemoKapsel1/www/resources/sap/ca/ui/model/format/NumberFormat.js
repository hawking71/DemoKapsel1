/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.declare("sap.ca.ui.model.format.NumberFormat");jQuery.sap.require("sap.ui.core.LocaleData");jQuery.sap.require("sap.ca.ui.model.format.FormatHelper");jQuery.sap.require("sap.ca.ui.utils.resourcebundle");
sap.ca.ui.model.format.NumberFormat=function(){throw new Error();};
sap.ca.ui.model.format.NumberFormat.oValueInfo={oDefaultFormatOptions:{style:"standard"}};
sap.ca.ui.model.format.NumberFormat.getInstance=function(f,l){return this.createInstance(f,l,this.oValueInfo);};
sap.ca.ui.model.format.NumberFormat.createInstance=function(f,l,i){var F=jQuery.sap.newObject(this.prototype);if(f instanceof sap.ui.core.Locale){l=f;f=undefined;}if(!l){l=sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();}F.oLocale=l;F.oLocaleData=sap.ui.core.LocaleData.getInstance(l);F.oFormatOptions=jQuery.extend(false,{},i.oDefaultFormatOptions,f);F.oFormatOptions.formatStyle="standard";F.init();return F;};
sap.ca.ui.model.format.NumberFormat.prototype.init=function(){};
sap.ca.ui.model.format.NumberFormat.prototype.format=function(v){var r="";var f="format_"+this.oFormatOptions.style;if(this[f]){r=this[f](v);}else{r=this.format_standard(v);}return r;};
sap.ca.ui.model.format.NumberFormat.prototype.format_standard=function(v){var f=sap.ca.ui.model.format.FormatHelper.getFormatOptions(this.oFormatOptions,this.oLocale);return sap.ca.ui.model.format.FormatHelper.formatNumber(v,f);};
sap.ca.ui.model.format.NumberFormat.prototype.format_short=function(v){var f;var s;var a;function g(d){var a;if(!s){s=sap.ui.core.LocaleData.getInstance(f.locale)._get("decimalFormat-short");if(!s){var e=new sap.ui.core.Locale("en");s=sap.ui.core.LocaleData.getInstance(e)._get("decimalFormat-short");}}if(s){var k=1;while(Math.abs(d)>=k*10&&k<1e14){k=k*10;}var h=s[k.toString()+"-other"];a={};if(!h||h=="0"){a.magnitude=1;}else{a.formatString=h;var m=h.match(/0+\.*0*/);if(m){a.valueSubString=m[0];var i=a.valueSubString.indexOf(".");if(i==-1){a.decimals=0;a.magnitude=k*Math.pow(10,1-a.valueSubString.length);}else{a.decimals=a.valueSubString.length-i-1;a.magnitude=k*Math.pow(10,1-i);}}else{a.magnitude=1;}}}return a;}var n=sap.ca.ui.model.format.FormatHelper.toNumeric(v);if(!isFinite(n)){return"";}var r="";f=sap.ca.ui.model.format.FormatHelper.getFormatOptions(this.oFormatOptions,this.oLocale);a=g(n);if(!a){return this.format_standard(v);}var b=n/a.magnitude;var c={};c.shortRounding=f.shortRounding;c.rounding=f.rounding;if(a.magnitude==1){c.formatStyle="standard";c.decimals=f.decimals;}else if(f.shortDecimals){c.formatStyle="short";c.shortDecimals=f.shortDecimals;}else{c.formatStyle="short";c.shortDecimals=a.decimals;}b=sap.ca.ui.model.format.FormatHelper.roundNumber(b,c);a=g(b*a.magnitude);if(!a||a.magnitude==1){r=this.format_standard(v);}else{b=sap.ca.ui.model.format.FormatHelper.roundNumber(n/a.magnitude,c);if(!f.shortDecimals){f.shortDecimals=a.decimals;}f.formatStyle="short";r=sap.ca.ui.model.format.FormatHelper.formatNumber(b,f);r=a.formatString.replace(a.valueSubString,r);r=r.replace(/'.'/g,".");}return r;};
sap.ca.ui.model.format.NumberFormat.prototype.parse=function(v){var f=sap.ui.core.format.NumberFormat.getInstance(this.oFormatOptions,this.oLocale);if(f.oFormatOptions.groupingSeparator=="\u00a0"){v=v.replace(/ /g,f.oFormatOptions.groupingSeparator);}return f.parse(v);};
sap.ca.ui.model.format.NumberFormat.prototype.format_percentage=function(v){var r,s;if(this.oFormatOptions.decimals===undefined){this.oFormatOptions.decimals=0;}var n=sap.ca.ui.model.format.FormatHelper.toNumeric(v);n=n*100.;var f=this.format_standard(n);var p=sap.ui.core.LocaleData.getInstance(this.oLocale)._get("percentFormat");if(!p){s=new sap.ui.core.Locale("en");p=sap.ui.core.LocaleData.getInstance(s)._get("percentFormat");}var a=p["standard"];if(a===undefined||a==""){r=f;jQuery.sap.log.error("no percent format available for the current locale");}else{var b=/[\.0,#]+/;var t=a.replace(b,f);var c=sap.ui.core.LocaleData.getInstance(this.oLocale)._get("symbols-latn-percentSign");if(!c){s=new sap.ui.core.Locale("en");c=sap.ui.core.LocaleData.getInstance(s)._get("symbols-latn-percentSign");}r=t.replace(/\u0025/,c);}return r;};

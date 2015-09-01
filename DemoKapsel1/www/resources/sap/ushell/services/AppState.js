// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
(function(){"use strict";jQuery.sap.declare("sap.ushell.services.AppState");jQuery.sap.require("sap.ushell.utils");jQuery.sap.require("sap.ushell.services.Container");var S,a,W=50;sap.ushell.services.AppState=function(A,c,p,C){this._oConfig=C;this._sSessionKey="";this._oAdapter=new sap.ushell.services.AppState.SequentializingAdapter(A);this._oAdapter=new sap.ushell.services.AppState.WindowAdapter(this,this._oAdapter);};sap.ushell.services.AppState.prototype._getSessionKey=function(){if(!this._sSessionKey){this._sSessionKey=this._getGeneratedKey();}return this._sSessionKey;};sap.ushell.services.AppState.prototype.getAppState=function(k){var d=new jQuery.Deferred(),t=this,A;this._loadAppState(k).done(function(k,D){A=new sap.ushell.services.AppState.AppState(t,k,false,D);d.resolve(A);}).fail(function(m){A=new sap.ushell.services.AppState.AppState(t,k);d.resolve(A);});return d.promise();};sap.ushell.services.AppState.prototype._getGeneratedKey=function(){var s=sap.ushell.Container.getService("Personalization").getGeneratedKey();s=("AS"+s).substring(0,40);return s;};sap.ushell.services.AppState.prototype.createEmptyAppState=function(c){var k=this._getGeneratedKey(),A,s="",b="";if(c){if(!(c instanceof sap.ui.core.UIComponent)){throw new Error("oComponent passed must be a UI5 Component");}if(c.getMetadata&&c.getMetadata().getLibraryName){s=c.getMetadata().getLibraryName();}}A=new sap.ushell.services.AppState.AppState(this,k,true,undefined,s,b);return A;};sap.ushell.services.AppState.prototype.createEmptyUnmodifiableAppState=function(c){var k=this._getGeneratedKey(),A;A=new sap.ushell.services.AppState.AppState(this,k,false);return A;};a=function(){var d=new jQuery.Deferred();this._oServiceInstance._saveAppState(this._sKey,this._sData,this._sAppName,this._sACHComponent).done(function(){d.resolve();}).fail(function(m){d.reject(m);});return d.promise();};sap.ushell.services.AppState.AppState=function(s,k,m,d,A,b){this._oServiceInstance=s;this._sKey=k;this._sData=d;this._sAppName=A;this._sACHComponent=b;if(m){this.setData=function(D){try{this._sData=JSON.stringify(D);}catch(e){jQuery.sap.log.error("Data can not be serialized","sap.ushell.services.AppState.AppState");this._sData=undefined;}};this.save=a.bind(this);}};sap.ushell.services.AppState.AppState.prototype.getData=function(){var o;if(this._sData===undefined||this._sData===""){return undefined;}try{o=JSON.parse(this._sData);}catch(e){jQuery.sap.log.error("Could not parse ["+this._sData+"]"+e);}return o;};sap.ushell.services.AppState.AppState.prototype.getKey=function(){return this._sKey;};sap.ushell.services.AppState.prototype._saveAppState=function(k,d,A,c){var s=this._getSessionKey();return this._oAdapter.saveAppState(k,s,d,A,c);};sap.ushell.services.AppState.prototype._loadAppState=function(k){return this._oAdapter.loadAppState(k);};function L(c){this.index=-1;this.capacity=c;this.array=[];}L.prototype._clear=function(){this.array=[];this.index=-1;};L.prototype.addAsHead=function(k,v){this.index=(this.index+1)%this.capacity;this.array[this.index]={key:k,value:v};};L.prototype.getByKey=function(k){var i,e;for(i=0;i<=this.capacity-1;i=i+1){e=(this.capacity+this.index-i)%this.capacity;if(this.array[e]&&this.array[e].key===k){return this.array[e];}}return undefined;};sap.ushell.services.AppState.WindowAdapter=function(s,b){this._oServiceInstance=s;this._oBackendAdapter=b;if(!sap.ushell.services.AppState.WindowAdapter.prototype.data){sap.ushell.services.AppState.WindowAdapter.prototype.data=new L(W);}};sap.ushell.services.AppState.WindowAdapter.prototype.saveAppState=function(k,s,d,A,c){this.sComponent=c;var D=new jQuery.Deferred();sap.ushell.services.AppState.WindowAdapter.prototype.data.addAsHead(k,d);if(this._oBackendAdapter){return this._oBackendAdapter.saveAppState(k,s,d,A,c);}D.resolve();return D.promise();};sap.ushell.services.AppState.WindowAdapter.prototype.loadAppState=function(k){var d=new jQuery.Deferred(),b=sap.ushell.services.AppState.WindowAdapter.prototype.data.getByKey(k);if(b){setTimeout(function(){d.resolve(k,b.value);},0);return d.promise();}if(this._oBackendAdapter){return this._oBackendAdapter.loadAppState(k);}d.reject("AppState.js loadAppState: Application State could not be loaded");return d.promise();};S=function(){this.oLastPromise=new jQuery.Deferred();this.oLastPromise.resolve();};S.prototype.addToQueue=function(f){var n=new jQuery.Deferred();this.oLastPromise.always(function(){var r=f();r.done(function(){n.resolve.apply(n,arguments);}).fail(function(){n.reject.apply(n,arguments);});});this.oLastPromise=n;return n.promise();};sap.ushell.services.AppState._getSequentializer=function(){return new S();};sap.ushell.services.AppState.SequentializingAdapter=function(u){this._oSequentializer=new S();this._oUnderlyingAdapter=u;};sap.ushell.services.AppState.SequentializingAdapter.prototype.saveAppState=function(k,s,d,A,c){var f;f=this._oUnderlyingAdapter.saveAppState.bind(this._oUnderlyingAdapter,k,s,d,A,c);return this._oSequentializer.addToQueue(f);};sap.ushell.services.AppState.SequentializingAdapter.prototype.loadAppState=function(k){return this._oUnderlyingAdapter.loadAppState(k);};}());
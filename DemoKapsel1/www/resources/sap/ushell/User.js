// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
(function(){"use strict";jQuery.sap.declare("sap.ushell.User");jQuery.sap.require("sap.ushell.utils");function d(t,s){if(t.indexOf("sap_")===0){return"";}return s;}function c(o){if(o===undefined){return undefined;}try{return JSON.parse(JSON.stringify(o));}catch(e){return undefined;}}sap.ushell.User=function(C){var a=[],s=C.themeRoot||"",o=C.bootTheme||{theme:"",root:""},n=o;this.getEmail=function(){return C.email;};this.getFirstName=function(){return C.firstName;};this.getFullName=function(){return C.fullName;};this.getId=function(){return C.id;};this.getLanguage=function(){return C.language;};this.getLanguageBcp47=function(){return C.languageBcp47;};this.getLastName=function(){return C.lastName;};this.getImage=function(){return C.image;};this.isJamActive=function(){return C.isJamActive===true;};this.getTheme=function(){return o.theme;};this.setTheme=function(N){if(this.isSetThemePermitted()===false){throw new Error("setTheme not permitted");}if(N!==n.theme){this.setChangedProperties("THEME",n.theme,N);n.theme=N;}o.theme=N;o.root=d(N,s);if(o.root){sap.ui.getCore().applyTheme(o.theme,o.root+"/UI5/");}else{sap.ui.getCore().applyTheme(o.theme);}};this.getAccessibilityMode=function(){return C.accessibility;};this.setAccessibilityMode=function(b){if(this.isSetAccessibilityPermitted()===false){jQuery.sap.log.error("setAccessibilityMode not permitted");throw true;}C.accessibility=b;};this.isSetAccessibilityPermitted=function(){return C.setAccessibilityPermitted;};this.isSetThemePermitted=function(){return C.setThemePermitted;};this.getChangedProperties=function(){return c(a);};this.setChangedProperties=function(p,b,e){a.push({name:p,oldValue:b,newValue:e});};this.resetChangedProperties=function(){a=[];};};}());

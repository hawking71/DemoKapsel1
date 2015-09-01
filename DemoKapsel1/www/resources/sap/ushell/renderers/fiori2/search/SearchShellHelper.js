(function(){"use strict";jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchHelper');var S=sap.ushell.renderers.fiori2.search.SearchHelper;jQuery.sap.require('sap.ushell.renderers.fiori2.search.controls.SearchInput');jQuery.sap.require('sap.ushell.renderers.fiori2.search.controls.SearchSelect');jQuery.sap.require("sap.ushell.renderers.fiori2.search.SearchModel");jQuery.sap.declare('sap.ushell.renderers.fiori2.search.SearchShellHelper');var m=sap.ushell.renderers.fiori2.search.SearchShellHelper={};jQuery.sap.require('sap.ushell.renderers.fiori2.search.SemanticObjectsHandler');var a=sap.ushell.renderers.fiori2.search.SemanticObjectsHandler;jQuery.extend(m,{init:function(s){var b=this;this.oShellView=s;this.oShell=sap.ui.getCore().byId('shell');this.oModel=new sap.ushell.renderers.fiori2.search.SearchModel({updateUrl:false});this.oShellView.setModel(sap.ushell.resources.i18nModel,"i18n");this.oSearchInput=new sap.ushell.renderers.fiori2.search.controls.SearchInput("searchInputShell",{location:"shellHeader"});this.oSearchInput.setModel(this.oModel);this.oSearchInput.addEventDelegate({onsapenter:function(e){if(b.oModel.getSearchBoxTerm()===""){return;}b.closeHeadSearchBox();}},this.oSearchInput);this.oSearchInput.attachChange(function(){if(sap.ui.Device.system.phone){b.closeHeadSearchBox();}});this.oSearchInput.attachSuggestionItemSelected(function(e){var M=this.getModel();var c=e.getParameter('selectedRow');var d=c.getBindingContext().getObject();if(d.type!==M.SUGGESTION_TYPE_DATASOURCE){b.closeHeadSearchBox();}});if(!sap.ui.Device.system.phone){this.oSearchSelect=new sap.ushell.renderers.fiori2.search.controls.SearchSelect();this.oSearchSelect.attachChange(function(){b.oSearchInput.focus();b.oSearchInput.destroySuggestionRows();});this.oSearchSelect.setModel(this.oModel);if($(window).width()<=1150){b.oSearchSelect.setType(sap.m.SelectType.IconOnly);b.oSearchSelect.setIcon('sap-icon://filter');}}this.oHeadSearchBox=new sap.m.Toolbar({id:"headSearchBox",}).addStyleClass('sapUshellHeadSearchBox');this.oHeadSearchBox.setVisible(false);this.oShell.setSearch(this.oHeadSearchBox);if(!sap.ui.Device.system.phone){this.oHeadSearchBox.addContent(this.oSearchSelect);this.oSearchSelect.setMaxWidth("40%");}this.oHeadSearchBox.addContent(this.oSearchInput);this.oHeadSearchBox.addEventDelegate({onAfterRendering:function(e){jQuery('#headSearchBox').parent().parent().parent().addClass('headSearchDivContainer');jQuery('#headSearchBox').parent().parent().addClass('headSearchDiv');}},b.oHeadSearchBox);},openHeadSearchBox:function(){var s=this;this.firstOpen=true;this.oModel.resetDataSource(false);sap.ushell.Container.getService("Search")._getCatalogTiles();a.getSemanticObjectsMetadata();this.oModel.setProperty("/searchBoxTerm","");this.oSearchInput.setValue("");this.oHeadSearchBox.setVisible(true);this.oHeadSearchBox.addEventDelegate({onAfterRendering:function(e){if(s.firstOpen){s.firstOpen=false;jQuery('.headSearchDiv').css("maxWidth","38rem");if(!sap.ui.Device.system.phone){setTimeout(function(){s.oSearchInput.focus();},350);}}}},s.oHeadSearchBox);},closeHeadSearchBox:function(){var s=this;jQuery('.headSearchDiv').animate({'maxWidth':'0'},{duration:100,complete:function(){s.oHeadSearchBox.setVisible(false);}});},handleClickMagnifier:function(){if(!this.oHeadSearchBox.getVisible()){this.openHeadSearchBox();}else{if(this.oSearchInput.getValue()!==""){this.oModel.navigateToSearchApp();this.oSearchInput.destroySuggestionRows();}this.closeHeadSearchBox();}}});})();

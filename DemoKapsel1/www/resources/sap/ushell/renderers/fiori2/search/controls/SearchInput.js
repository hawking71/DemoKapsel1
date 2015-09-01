(function(){"use strict";jQuery.sap.require('sap.m.Input');jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchHelper');var s=sap.ushell.renderers.fiori2.search.SearchHelper;sap.m.Input.extend('sap.ushell.renderers.fiori2.search.controls.SearchInput',{constructor:function(i,o){var a=this;o=jQuery.extend({},{showValueStateMessage:false,showTableSuggestionValueHelp:false,showSuggestion:true,filterSuggests:false,suggestionColumns:[new sap.m.Column({})],placeholder:{path:'/searchTermPlaceholder',mode:sap.ui.model.BindingMode.OneWay}},o);sap.m.Input.prototype.constructor.apply(this,[i,o]);this.addEventDelegate({onsapenter:function(e){a.triggerSearch(e);}});this.bindAggregation("suggestionRows","/suggestions",function(i,c){return a.suggestionItemFactory(i,c);});this.addStyleClass('searchInput');},renderer:'sap.m.InputRenderer',fireChange:function(e){sap.m.Input.prototype.fireChange.apply(this,arguments);if(sap.ui.Device.system.phone){this.triggerSearch(e);}},triggerSearch:function(e){var a=this;this.changeTimer=window.setTimeout(function(){a.changeTimer=null;if(a.getId()==="searchInputShell"){a.getModel().setSearchBoxTerm(a.getValue(),false);a.getModel().navigateToSearchApp();}else{a.getModel().setSearchBoxTerm(a.getValue());}a.destroySuggestionRows();a.getModel().abortSuggestions();},100);},fireLiveChange:function(){sap.m.Input.prototype.fireLiveChange.apply(this,arguments);var a=this.getValue();var m=this.getModel();m.setSearchBoxTerm(a,false);if(m.getSearchBoxTerm().length>0){m.doSuggestion();}else{this.destroySuggestionRows();m.abortSuggestions();}},fireSuggestionItemSelected:function(e){sap.m.Input.prototype.fireSuggestionItemSelected.apply(this,arguments);if(this.changeTimer){window.clearTimeout(this.changeTimer);this.changeTimer=null;}this.doHandleSuggestionItemSelected(e);},doHandleSuggestionItemSelected:function(e){var m=this.getModel();var a=e.selectedRow.getBindingContext().getObject();var b=a.labelRaw;var d=a.dataSource;var t=a.url;var c=a.type;switch(c){case m.SUGGESTION_TYPE_APPS:if(t[0]==='#'){window.location.href=t;}else{window.open(t,'_blank');}break;case m.SUGGESTION_TYPE_DATASOURCE:m.setDataSource(d,false);m.setSearchBoxTerm('',false);this.focus();break;case m.SUGGESTION_TYPE_BO:m.setDataSource(d,false);if(e.id==="searchInputShell"){m.setSearchBoxTerm(b,false);m.navigateToSearchApp();}else{m.setSearchBoxTerm(b);}this.setValue(b);break;}},suggestionItemFactory:function(i,c){if(!this.getValue()){return null;}var a=new sap.m.Label({text:{path:"icon",formatter:function(v){if(v){return"<i>"+sap.ushell.resources.i18n.getText("label_app")+"</i>";}return"";}}}).addStyleClass('suggestText').addStyleClass('suggestNavItem');a.addEventDelegate({onAfterRendering:function(){s.boldTagUnescaper(this.getDomRef());}},a);var b=new sap.ui.core.Icon({src:"{icon}"}).addStyleClass('suggestIcon').addStyleClass('suggestAppIcon');var l=new sap.m.Label({text:"{label}"}).addStyleClass('suggestText').addStyleClass('suggestNavItem');l.addEventDelegate({onAfterRendering:function(){s.boldTagUnescaper(this.getDomRef());}},l);var d=new sap.m.CustomListItem({type:sap.m.ListType.Active,content:[a,b,l]});var e=c.oModel.getProperty(c.sPath);d.getText=function(){return e.labelRaw?e.labelRaw:'';};return new sap.m.ColumnListItem({cells:[d],type:"Active"});}});})();

(function(){"use strict";sap.ui.core.Control.extend("sap.ushell.renderers.fiori2.search.controls.SearchResultListItemFooter",{metadata:{properties:{showSpinner:{type:"boolean",defaultValue:false},text:"string"},aggregations:{content:{singularName:"content"}},events:{showMore:{}}},renderer:function(r,c){var f=new sap.m.Link({text:c.getText(),tooltip:c.getText()});f.addStyleClass('resultListMoreFooter');var d=new sap.ui.core.Icon({src:sap.ui.core.IconPool.getIconURI("sys-overflow")});this.busy=new sap.m.BusyIndicator({size:"22px"});this.busy.addStyleClass('resultListBusyFooter');if(c.getShowSpinner()===false){this.busy.addStyleClass('hidden');}r.write("<div");r.writeAttribute("tabindex","-1");r.writeControlData(c);r.addClass("resultListFooterContainer");r.writeClasses();r.write(">");r.write("<div class='resultListFooterContent'>");r.renderControl(d);r.renderControl(f);r.renderControl(this.busy);r.write("</div>");r.write("</div>");},onAfterRendering:function(r,c){var s=this;var a=$(this.getDomRef());a.click(function(){s.fireShowMore();a.off('click');});}});})();

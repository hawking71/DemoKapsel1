(function(){"use strict";jQuery.sap.require('sap.m.Toolbar');sap.m.Toolbar.extend("sap.ushell.renderers.fiori2.search.controls.SearchFilterBar",{constructor:function(o){var s=this;o=jQuery.extend({},{design:sap.m.ToolbarDesign.Info,},o);sap.m.Toolbar.prototype.constructor.apply(this,[o]);this.addStyleClass('searchFilterContextualBar');this.bindAggregation("content","/filterConditions",function(i,c){return s.contentFactory(i,c);});},contentFactory:function(i,c){var l=new sap.m.Label({text:"{label}"+", "});l.addStyleClass('filterLabel');return l;},hasContent:function(){if(this.getContent().length>0&&this.getModel().isFacetSearchEnabled()){return true;}else{return false;}},renderer:'sap.m.ToolbarRenderer',onAfterRendering:function(){var l=sap.ushell.resources.i18n.getText("filtered_by");var a=$('.searchFilterContextualBar').children('label');var b=a.first();var c=a.last();$('.searchFilterContextualBar').prepend('<label class="filterTitle">'+l+':</label>');a.attr('aria-label',l);c.text(c.text().substring(0,c.text().length-2));}});}());
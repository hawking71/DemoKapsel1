(function(){"use strict";jQuery.sap.require('sap.m.StandardListItem');sap.m.StandardListItem.extend('sap.ushell.renderers.fiori2.search.controls.SearchFacetItem',{constructor:function(i,o){var s=this;s.options=jQuery.extend({},{title:"{label}",tooltip:"{label}",key:"{id}",counter:"{value}",selected:"{selected}",level:"{level}"},o);sap.m.StandardListItem.prototype.constructor.apply(this,[i,s.options]);this.addStyleClass('searchFacetItem');this.addEventDelegate({onAfterRendering:function(){if(s.getBindingContext()&&s.getBindingContext().getObject()){var l=s.getBindingContext().getObject().level;if(jQuery("html").attr("dir")==='rtl'){jQuery(s.getDomRef()).children(".sapMLIBContent").css("padding-right",l+"rem");}else{jQuery(s.getDomRef()).children(".sapMLIBContent").css("padding-left",l+"rem");}}}});},renderer:'sap.m.StandardListItemRenderer'});})();
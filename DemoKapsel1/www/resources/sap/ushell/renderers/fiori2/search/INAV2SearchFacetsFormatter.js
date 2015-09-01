(function(){"use strict";jQuery.sap.declare('sap.ushell.renderers.fiori2.search.INAV2SearchFacetsFormatter');var a=sap.ushell.renderers.fiori2.search.INAV2SearchFacetsFormatter=function(){this.init.apply(this,arguments);};a.prototype={init:function(){this.level=0;},enhanceDataSource:function(d){if(!d){return;}if(!d.label){d.label=d.objectName.label;}d.key=d.objectName.value;return d;},getAllDataSourceFacetItem:function(s){var c=s.allDataSource;var f=new b({label:c.label,filterCondition:c,selected:s.getProperty("/dataSource").equals(c),level:0});if(f.selected){f.value=s.getProperty("/boCount")+s.getProperty("/appCount");}return f;},getAppsDataSourceFacetItem:function(s){var c=s.appDataSource;var f=new b({label:c.label,filterCondition:c,selected:s.getProperty("/dataSource").equals(c),value:s.getProperty("/appCount"),level:1});return f;},_getRecentDataSourcesTree:function(s){var c=this;var r=[];for(var i=0,l=s.getProperty('/recentDataSources').length;i<l;i++){var d=s.getProperty('/recentDataSources')[i];if(!d){continue;}this.level++;d=this.enhanceDataSource(d);var e=new b({label:d.label,filterCondition:d,selected:false,level:c.level});r.push(e);}return r;},_getDataSourceFacet:function(s){var d=new F({facetType:"datasource",title:"Search In"});var c=this;this.level=0;if(!s.getProperty("/dataSource").equals(s.allDataSource)){d.items.push(this.getAllDataSourceFacetItem(s));}if(s.getProperty("/dataSource").equals(s.allDataSource)||s.getProperty("/dataSource").equals(s.appDataSource)){d.items.push(this.getAppsDataSourceFacetItem(s));if(s.getProperty("/dataSource").equals(s.appDataSource)){return d;}}d.items.push.apply(d.items,this._getRecentDataSourcesTree(s));var e=this.enhanceDataSource(s.getDataSource());this.level++;var f=new b({label:e.label,value:s.getProperty("/boCount"),filterCondition:e,selected:true,level:c.level});d.items.push(f);if(s.getProperty("/dataSource").equals(s.allDataSource)){f.level=0;if(s.getProperty("/appCount")===0){d.items.splice(0,1);}else{var g=d.items[0];d.items[0]=d.items[1];d.items[1]=g;f.value=s.getProperty("/boCount")+s.getProperty("/appCount");}}return d;},getDataSourceFacetFromPerspective:function(I,s){var f=[],A=I.getChartFacets().filter(function(h){return h.facetType==="datasource";}),d=this._getDataSourceFacet(s),c=this;if(A.length===0||s.getProperty("/dataSource").equals(s.appDataSource)){return d;}A=A[0].query.resultSet.elements;this.level++;for(var i=0,l=A.length;i<l;i++){var e=this.enhanceDataSource(A[i].dataSource);var g=new b({label:e.label,value:A[i].valueRaw,filterCondition:e,selected:s.getProperty("/dataSource").equals(e),level:c.level});if(s.getProperty("/dataSource").equals(s.allDataSource)){g.level=1;}d.items.push(g);}return d;},getAttributeFacetsFromPerspective:function(r,s){var c=this;var S=r.getChartFacets().filter(function(w){return w.facetType==="attribute";});var C=[];var d={};var e=s.getProperty("/filterConditions");for(var i=0,l=S.length;i<l;i++){var o=S[i];var f=new F({title:o.title,facetType:o.facetType,dimension:o.dimension});if(!o.query.resultSet||!o.query.resultSet.elements||o.query.resultSet.elements.length===0){continue;}for(var j=0;j<o.query.resultSet.elements.length;j++){var g=o.query.resultSet.elements[j];var h=new b({value:g.valueRaw,filterCondition:g.dataSource||g.labelRaw,facetTitle:o.title,label:g.label,selected:s.hasFilterCondition(g.labelRaw),level:0});if(h.selected===true){if(f.hasFilterCondition(h.filterCondition)){f.removeItem(h);}}if(h.selected===false){if(!f.hasFilterCondition(h.filterCondition)){f.items.push(h);}}}d[o.title]=f;C.push(f);}for(var k=0,n=e.length;k<n;k++){var p=e[k];var q=d[p.facetTitle];p.selected=true;if(!q){q=new F({title:p.facetTitle,facetType:"attribute",items:[p]});d[p.facetTitle]=q;C.splice(k,0,q);}else{var t=false;for(var m=0,u=q.items.length;m<u;m++){var v=q.items[m];if(p.filterCondition.equals(v.filterCondition)){v.selected=true;t=true;}}if(!t){q.items.splice(0,0,p);}}}return C;},getFacets:function(d,i,s){if(!i){return;}var f=[this.getDataSourceFacetFromPerspective(i,s)];if(!s.isFacetSearchEnabled()){return f;}if(!d.equals(s.appDataSource)){var A=this.getAttributeFacetsFromPerspective(i,s);if(A.length>0){f.push.apply(f,A);}}return f;}};jQuery.sap.declare('sap.ushell.renderers.fiori2.search.Facet');var F=sap.ushell.renderers.fiori2.search.Facet=function(){this.init.apply(this,arguments);};F.prototype={init:function(p){this.title=p.title;this.facetType=p.facetType;this.dimension=p.dimension;this.items=p.items||[];},hasFilterCondition:function(f){for(var i=0,l=this.items.length;i<l;i++){var c=this.items[i].filterCondition||this.items[i];if(c.equals&&c.equals(f)){return true;}}return false;},removeItem:function(f){for(var i=0,l=this.items.length;i<l;i++){var c=this.items[i].filterCondition||this.items[i];if(c.equals&&f.filterCondition&&c.equals(f.filterCondition)){return this.items.splice(i,1);}}}};jQuery.sap.declare('sap.ushell.renderers.fiori2.search.FacetItem');var b=sap.ushell.renderers.fiori2.search.FacetItem=function(){this.init.apply(this,arguments);};b.prototype={init:function(p){var s=sap.ushell.Container.getService("Search").getSina();this.id=p.id;this.label=p.label;this.value=p.value;this.facetTitle=p.facetTitle||"";if(p.filterCondition.attribute){var c=this.createSinaFilterCondition(p.filterCondition);this.filterCondition=c;}else if(p.filterCondition.conditions){var d=s.createFilterConditionGroup(p.filterCondition);for(var i=0,l=d.conditions.length;i<l;i++){d.conditions[i]=this.createSinaFilterCondition(d.conditions[i]);}this.filterCondition=d;}else{this.filterCondition=p.filterCondition;}this.selected=p.selected;this.level=p.level||0;},equals:function(o){return(this.id===o.id&&this.label===o.label&&this.value===o.value&&this.filterCondition.equals(o.filterCondition));},createSinaFilterCondition:function(p){var s=sap.ushell.Container.getService("Search").getSina();if(p.inaV2_extended_properties){var n=$.extend({},p);delete n.inaV2_extended_properties;var i=$.extend({},p.inaV2_extended_properties);delete i.attribute;delete i.operator;delete i.value;n=$.extend(n,i);return s.createFilterCondition(n);}else{return s.createFilterCondition(p);}}};})();
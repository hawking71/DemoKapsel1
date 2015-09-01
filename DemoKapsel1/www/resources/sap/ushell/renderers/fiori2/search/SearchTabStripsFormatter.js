(function(){"use strict";jQuery.sap.declare('sap.ushell.renderers.fiori2.search.SearchTabStripsFormatter');var m=sap.ushell.renderers.fiori2.search.SearchTabStripsFormatter={};m.Node=function(){this.init.apply(this,arguments);};m.Node.prototype={init:function(d,c){this.dataSource=d;this.children=[];this.parent=null;this.count=c;this.flgSorted=true;},isSorted:function(){return this.flgSorted;},markNotSorted:function(){this.flgSorted=false;for(var i=0;i<this.children.length;++i){var c=this.children[i];c.markNotSorted();}},setCount:function(c){if(this.parent){this.parent.flgSorted=false;}this.count=c;},clearChildren:function(){this.flgSorted=true;this.children=[];},sortChildren:function(){this.children.sort(function(c,a){return a.count-c.count;});this.flgSorted=true;},appendNode:function(n){n.parent=this;this.flgSorted=false;this.children.push(n);},removeChildNode:function(n){var i=this.children.indexOf(n);if(i<0){return;}this.children.splice(i,1);},findNode:function(d,r){if(this.dataSource.equals(d)){r.push(this);return;}for(var i=0;i<this.children.length;++i){var c=this.children[i];c.findNode(d,r);if(r.length>0){return;}}},hasChild:function(n){for(var i=0;i<this.children.length;++i){var c=this.children[i];if(c===n){return true;}}return false;},getLevel1Node:function(){if(!this.parent){return null;}if(this.parent.dataSource.objectName&&this.parent.dataSource.objectName.value==='$$ALL$$'){return this;}return this.parent.getLevel1Node();}};m.Tree=function(){this.init.apply(this,arguments);};m.Tree.prototype={init:function(){this.rootNode=null;},findNode:function(d){if(!this.rootNode){return null;}var r=[];this.rootNode.findNode(d,r);return r.length>0?r[0]:null;},hasChild:function(d,a){if(a&&a.objectName&&a.objectName.value==='$$ALL$$'){return false;}var n=this.findNode(d);if(!n){return false;}var b=this.findNode(a);if(!b){return false;}return n.hasChild(b);},updateFromPerspective:function(d,p,a){if(!this.rootNode){this.rootNode=new m.Node(d,0);}var c=this.findNode(d);if(!c){this.rootNode=new m.Node(d,0);c=this.rootNode;}this.updateFromPerspectiveChildDataSources(c,p);this.updateAppTreeNode(d,a);},updateAppTreeNode:function(d,a){if(!this.rootNode.dataSource.equals(a.allDataSource)){return;}if(!d.equals(a.allDataSource)&&!d.equals(a.appDataSource)){return;}var b=a.getProperty('/appCount');var c=this.findNode(a.appDataSource);if(c){this.rootNode.removeChildNode(c);}if(b===0){return;}c=new m.Node(a.appDataSource,b);if(!this.rootNode.isSorted()){this.rootNode.clearChildren();}this.rootNode.appendNode(c);this.rootNode.sortChildren();},updateFromPerspectiveChildDataSources:function(c,p){if(!p){return;}var f=p.getChartFacets();if(f.length===0){return;}var d=f[0];if(d.facetType!=='datasource'){return;}var a=d.getQuery().getResultSetSync().getElements();c.clearChildren();for(var i=0;i<a.length;++i){var b=a[i];c.appendNode(new m.Node(b.dataSource,b.valueRaw));}c.sortChildren();}};m.Formatter=function(){this.init.apply(this,arguments);};m.Formatter.prototype={init:function(){this.tree=new m.Tree();},format:function(d,p,a){this.tree.updateFromPerspective(d,p,a);var t=this.generateTabStrips(d,a);return t;},markNotSorted:function(){if(!this.tree.rootNode){return;}this.tree.rootNode.markNotSorted();},generateTabStrips:function(d,a){var t=9999;var i,c;var b={strips:[],selected:null};var n=this.tree.findNode(d);if(!n){if(!d.equals(a.allDataSource)){b.strips.push(a.allDataSource);}b.strips.push(d);b.selected=d;return b;}if(n.dataSource.equals(a.allDataSource)){b.strips.push(a.allDataSource);if(n.isSorted()){for(i=0;i<n.children.length&&b.strips.length<t;++i){c=n.children[i];b.strips.push(c.dataSource);}}b.selected=a.allDataSource;return b;}if(n.parent&&n.parent.dataSource.equals(a.allDataSource)){b.strips.push(a.allDataSource);if(n.parent.isSorted()){var e=false;for(i=0;i<n.parent.children.length;++i){c=n.parent.children[i];if(e){if(b.strips.length>=t){break;}b.strips.push(c.dataSource);}else{if(b.strips.length<t-1||n===c){b.strips.push(c.dataSource);if(n===c){e=true;}}}}}else{b.strips.push(n.dataSource);}b.selected=n.dataSource;return b;}b.strips.push(a.allDataSource);b.strips.push(n.dataSource);b.selected=n.dataSource;return b;}};})();
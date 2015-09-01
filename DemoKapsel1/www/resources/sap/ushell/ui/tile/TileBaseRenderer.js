// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
(function(){"use strict";jQuery.sap.require("sap.ushell.resources");jQuery.sap.declare("sap.ushell.ui.tile.TileBaseRenderer");sap.ushell.ui.tile.TileBaseRenderer={};var t=sap.ushell.resources.i18n;sap.ushell.ui.tile.TileBaseRenderer.highlight=function(h,T){var i,r,e=jQuery.sap.encodeHTML(T).replace(/&#xa;/g,"<br/>");if(h&&h.length&&h.length>0){for(i=0;i<h.length;i=i+1){r=new RegExp("("+jQuery.sap.encodeHTML(h[i]).replace(/([.*+?\^=!:${}()|\[\]\/\\])/g,"\\$1")+")","gi");e=e.replace(r,"<b>$1</b>");}}return e;};sap.ushell.ui.tile.TileBaseRenderer.render=function(r,c){var T=t.getText('launchTileTitle_tooltip',[c.getTitle()]),i,I;r.write("<div");r.writeControlData(c);if(c.getTargetURL()){r.writeAttributeEscaped("data-targeturl",c.getTargetURL());}r.writeAttributeEscaped("tabindex","-1");r.writeAttributeEscaped('title',T);r.addClass("sapUshellTileBase");r.writeClasses();r.write(">");r.write("<div");r.addClass("sapUshellTileBaseHeader");r.writeClasses();r.write(">");r.write("<h3");r.addClass("sapUshellTileBaseTitle");r.writeClasses();r.writeAccessibilityState(c,{label:t.getText("TileTitle_lable")+c.getTitle()});r.write(">");r.write(this.highlight(c.getHighlightTerms(),c.getTitle()||""));r.write("</h3>");if(c.getSubtitle()){r.write("<h4");r.addClass("sapUshellTileBaseSubtitle");r.writeClasses();r.writeAccessibilityState(c,{label:t.getText("TileSubTitle_lable")+c.getSubtitle()});r.write(">");r.write(this.highlight(c.getHighlightTerms(),c.getSubtitle()));r.write("</h4>");}r.write("</div>");if(typeof(this.renderPart)==='function'){this.renderPart(r,c);}if(c.getIcon()){I=new sap.ui.core.Icon({src:c.getIcon()});I.addStyleClass("sapUshellTileBaseIcon");r.renderControl(I);}if(c.getInfo()||((typeof(this.getInfoPrefix)==='function'))&&this.getInfoPrefix(c)){r.write("<div");r.addClass("sapUshellTileBaseInfo");r.addClass(c.getInfoState()?"sapUshellTileBase"+c.getInfoState():"sapUshellTileBase"+sap.ushell.ui.tile.State.Neutral);r.writeClasses();r.writeAccessibilityState(c,{label:t.getText("TileInfo_lable")+c.getInfo()});r.write(">");if(typeof(this.getInfoPrefix)==='function'){i=this.getInfoPrefix(c);r.writeEscaped(i);}if(c.getInfo()){if(i){r.write(", ");}r.write(this.highlight(c.getHighlightTerms(),c.getInfo()));}r.write("</div>");}r.write("</div>");};}());
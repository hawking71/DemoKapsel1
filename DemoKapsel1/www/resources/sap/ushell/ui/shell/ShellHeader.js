/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global','sap/ushell/library'],function(q,l){"use strict";var S=sap.ui.core.Control.extend("sap.ushell.ui.shell.ShellHeader",{metadata:{properties:{logo:{type:"sap.ui.core.URI",defaultValue:""},searchVisible:{type:"boolean",defaultValue:true},title:{type:"string"}},aggregations:{headItems:{type:"sap.ushell.ui.shell.ShellHeadItem",multiple:true},headEndItems:{type:"sap.ushell.ui.shell.ShellHeadItem",multiple:true},search:{type:"sap.ui.core.Control",multiple:false},user:{type:"sap.ushell.ui.shell.ShellHeadUserItem",multiple:false}}},renderer:{render:function(r,h){var i=h.getId();r.write("<div");r.writeControlData(h);r.writeAttribute("class","sapUshellShellHeader");r.write(">");r.write("<div id='",i,"-hdr-begin' class='sapUshellShellHeadBegin'>");this.renderHeaderItems(r,h,true);r.write("</div>");r.write("<div id='",i,"-hdr-center' class='sapUshellShellHeadCenter'>");this.rendererTitle(r,h);this.renderSearch(r,h);r.write("</div>");r.write("<div id='",i,"-hdr-end' class='sapUshellShellHeadEnd'>");this.renderHeaderItems(r,h,false);r.write("</div>");r.write("</div>");},renderSearch:function(r,h){var s=h.getSearch();r.write("<div id='",h.getId(),"-hdr-search'");r.writeAttribute("class","sapUshellShellSearch"+(h.getSearchVisible()?"":" sapUshellShellHidden"));r.write("><div>");if(s){r.renderControl(s);}r.write("</div></div>");},rendererTitle:function(r,h){r.write("<div id='",h.getId(),"-hdr-title' class='sapUshellShellHeadTitle'>");r.write("<span tabindex='0'");r.writeAttribute("class","sapUshellHeadTitle");r.write(">");if(!!h.getTitle()){r.writeEscaped(h.getTitle());}r.write("</span>");r.write("</div>");},renderHeaderItems:function(r,h,b){r.write("<div class='sapUshellShellHeadContainer'>");var I=b?h.getHeadItems():h.getHeadEndItems();for(var i=0;i<I.length;i++){if((I[i].getTarget()||"")!==""){r.write("<a tabindex='0' href='");r.writeEscaped(I[i].getTarget());r.write("'");}else{r.write("<a tabindex='0'");}r.writeElementData(I[i]);r.addClass("sapUshellShellHeadItm");if(I[i].getStartsSection()){r.addClass("sapUshellShellHeadItmDelim");}if(I[i].getShowSeparator()){r.addClass("sapUshellShellHeadItmSep");}if(!I[i].getVisible()){r.addClass("sapUshellShellHidden");}if(I[i].getSelected()){r.addClass("sapUshellShellHeadItmSel");}if(I[i].getShowMarker()){r.addClass("sapUshellShellHeadItmMark");}r.writeClasses();var t=I[i].getTooltip_AsString();if(t){r.writeAttributeEscaped("title",t);}r.write("><span></span><div class='sapUshellShellHeadItmMarker'><div></div></div></a>");}var u=h.getUser();if(!b&&u){r.write("<a tabindex='0' href='javascript:void(0);'");r.writeElementData(u);r.addClass("sapUshellShellHeadUsrItm");r.writeClasses();var t=u.getTooltip_AsString();if(t){r.writeAttributeEscaped("title",t);}r.write("><span id='",u.getId(),"-img' class='sapUshellShellHeadUsrItmImg'></span>");r.write("<span id='"+u.getId()+"-name' class='sapUshellShellHeadUsrItmName'");var U=u.getUsername()||"";r.writeAttributeEscaped("title",U);r.write(">");r.writeEscaped(U);r.write("</span><span class='sapUshellShellHeadUsrItmExp'></span></a>");}r.write("</div>");if(b){this._renderLogo(r,h);}},_renderLogo:function(r,h){var L=sap.ushell.resources.i18n.getText("SHELL_LOGO_TOOLTIP"),i=h._getLogo();r.write("<div class='sapUshellShellIco'>");r.write("<img id='",h.getId(),"-icon'");r.writeAttributeEscaped("title",L);r.writeAttributeEscaped("alt",L);r.write("src='");r.writeEscaped(i);r.write("' style='",i?"":"display:none;","'></img>");r.write("</div>");}}});S.prototype.init=function(){var t=this;this._rtl=sap.ui.getCore().getConfiguration().getRTL();this._handleMediaChange=function(p){if(!t.getDomRef()){return;}t._refresh();};sap.ui.Device.media.attachHandler(this._handleMediaChange,this,sap.ui.Device.media.RANGESETS.SAP_STANDARD);this._handleResizeChange=function(p){if(!t.getDomRef()||!t.getUser()){return;}var u=this.getUser();var c=u._checkAndAdaptWidth(!t.$("hdr-search").hasClass("sapUshellShellHidden")&&!!t.getSearch());if(c){t._refresh();}};sap.ui.Device.resize.attachHandler(this._handleResizeChange,this);this.data("sap-ui-fastnavgroup","true",true);};S.prototype.exit=function(){sap.ui.Device.media.detachHandler(this._handleMediaChange,this,sap.ui.Device.media.RANGESETS.SAP_STANDARD);delete this._handleMediaChange;sap.ui.Device.resize.detachHandler(this._handleResizeChange,this);delete this._handleResizeChange;};S.prototype.onAfterRendering=function(){this._refresh();this.$("hdr-center").toggleClass("sapUshellShellAnim",!this._noHeadCenterAnim);};S.prototype.onThemeChanged=function(){if(this.getDomRef()){this.invalidate();}};S.prototype._getLogo=function(){var i=this.getLogo();if(!i){q.sap.require("sap.ui.core.theming.Parameters");i=sap.ui.core.theming.Parameters._getThemeImage(null,true);}return i;};S.prototype._refresh=function(){function u(I){for(var i=0;i<I.length;i++){I[i]._refreshIcon();}}u(this.getHeadItems());u(this.getHeadEndItems());var U=this.getUser(),a=q("html").hasClass("sapUiMedia-Std-Phone"),s=!this.$("hdr-search").hasClass("sapUshellShellHidden"),$=this.$("icon");if(U){U._refreshImage();U._checkAndAdaptWidth(s&&!!this.getSearch());}$.parent().toggleClass("sapUshellShellHidden",a&&s&&!!this.getSearch());var w=this.$("hdr-end").outerWidth(),b=this.$("hdr-begin").outerWidth(),c=Math.max(w,b),d=(a&&s?b:c)+"px",e=(a&&s?w:c)+"px";this.$("hdr-center").css({"left":this._rtl?e:d,"right":this._rtl?d:e});this.$("hdr-title").css({"left":this._rtl?e:d,"right":this._rtl?d:e});};return S;},true);
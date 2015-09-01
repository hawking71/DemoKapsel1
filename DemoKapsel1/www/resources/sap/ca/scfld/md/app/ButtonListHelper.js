/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.declare("sap.ca.scfld.md.app.ButtonListHelper");jQuery.sap.require("sap.ca.ui.dialog.Dialog");jQuery.sap.require("sap.ca.scfld.md.app.BarOverflow");jQuery.sap.require("sap.ca.scfld.md.app.BarOverflowLayoutData");jQuery.sap.require("sap.m.ButtonType");(function(){function f(c,C){var i,o;for(i=c.length-1;i>=0;i-=1){o=c[i];if(o.oButton===C||o.oSelect===C){return o;}}return null;}function g(c){var i,b,l;for(i=c.length-1;i>=0;i-=1){b=c[i];l=b.getLayoutData();if(l instanceof sap.ca.scfld.md.app.BarOverflowLayoutData&&l.getOverflowButton()){return i;}}}function a(b,A){var t;if(b.sI18nBtnTxt){var B=A.AppI18nModel.getResourceBundle();t=B.getText(b.sI18nBtnTxt)}else{t=b.sBtnTxt}return t;}function r(c){var b=this.oBar,A=false,o=this.oOverflowList.oActionSheet,B,i,C,I,d;if(c===undefined){B=o.getButtons();I=g(this.oBar.getContentRight());for(i=0;i<B.length;i+=1){C=f(this.aButtons,B[i]);if(C.oSelect){d=C.oSelect;d.setVisible(true);if(C.oButton){C.oButton.setVisible(false);}o.removeButton(B[i]);}else{d=C.oButton;if(d._sTextInBar!==undefined){d.setText(d._sTextInBar);}if(d._sTypeInBar!==undefined){d.setType(d._sTypeInBar);}if(d._sTooltip!==undefined){d.setTooltip(d._sTooltip);}}b.insertContentRight(d,I);I++;}b.getContentRight()[I].setVisible(false);if(o.isOpen()){o.attachEventOnce("afterClose",function(){o.$().remove();});}else{o.$().remove();}}else{c.forEach(function(d){C=f(this.aButtons,d);if(!C){jQuery.sap.log.error("Unsupported control - "+d.toString());}if(C.oSelect){b.removeContentRight(C.oSelect);}if(C.oButton){d=C.oButton;if(d._sTextInActionSheet!==undefined){d.setText(d._sTextInActionSheet);if(d._sTextInActionSheet===d._sTooltip){d.setTooltip("");}}if(d._sTypeInActionSheet!==undefined){d.setType(d._sTypeInActionSheet);}d.setVisible(true);if(C.oSelect){C.oSelect.setVisible(false);}o.addButton(d);A=true;}else{jQuery.sap.log.error("No button representation for control - "+d.toString());}},this);if(A){b.getContentRight()[g(this.oBar.getContentRight())].setVisible(true);}}}sap.ui.base.Object.extend("sap.ca.scfld.md.app.ButtonListHelper",{constructor:function(A,m,b,c,o){this.oApplicationImplementation=A;this.bAutomaticOverflow=c;this.sOverflowId=o;this.iMode=m;if(this.iMode==20){this.oBar=new sap.m.Bar();}else if(this.iMode>=10){this.oActionSheet=new sap.m.ActionSheet();this.oActionSheet.setPlacement(sap.m.PlacementType.Top);this.oActionSheet.setShowCancelButton(true);}this.aButtons=[];this.bAllDisabled=b;this.startBuild();if(this.iMode==25){this.sDirection="Left";}else{this.sDirection="Right"}this.mSelections={};},addButtonListHelper:function(b){if(this.oChild){this.oChild.addButtonListHelper(b);}else{this.oChild=b;b.bAllDisabled=this.bAllDisabled;delete b.oModifications;}},startBuild:function(k){this.mButtons={};this.aCallBacks=[];this.oPositions={iActive:0,iControlPosition:0};this.bHasOverflow=false;if(this.oChild){this.oChild.startBuild(true);}if(this.oOverflowList){this.oOverflowList.startBuild(true);}if(!k){this.oModifications={mChangedEnablements:{},mChangedTexts:{}};}this.aButtons=[];if(this.oActionSheet){this.oActionSheet.destroyButtons();}if(this.oBar){this.oBar.destroyContentRight();this.oBar.destroyContentLeft();}if(this.oBarOverflow){this.oBarOverflow.destroy();delete this.oBarOverflow;}if(this.oOverflowList){this.oOverflowList.destroy();delete this.oOverflowList;}},endBuild:function(){for(var i=this.oPositions.iActive;i<this.aButtons.length;i++){var c=this.aButtons[i];if(c.oButton){c.oButton.setVisible(false);}if(c.oSelect){c.oSelect.setVisible(false);}}if(this.oChild){this.oChild.endBuild();}if(this.oOverflowList){this.oOverflowList.endBuild();}this.bIsOverflowReplaced=false;if(this.oModifications){for(var I in this.oModifications.mChangedEnablements){this.setBtnEnabled(I,this.oModifications.mChangedEnablements[I],true);}for(var I in this.oModifications.mChangedTexts){this.setBtnText(I,this.oModifications.mChangedTexts[I],true);}}if(this.oBarOverflow){this.oBarOverflow.buttonTextChanged();}},destroy:function(){for(var i=0;i<this.aButtons.length;i++){var c=this.aButtons[i];if(c.oButton){c.oButton.destroy(true);}if(c.oSelect){c.oSelect.destroy(true);}}if(this.oBar){this.oBar.destroy();delete this.oBar;}if(this.oActionSheet){this.oActionSheet.destroy();delete this.oActionSheet;}if(this.oChild){this.oChild.destroy();delete this.oChild;}if(this.oBarOverflow){this.oBarOverflow.destroy();delete this.oBarOverflow;}if(this.oOverflowList){this.oOverflowList.destroy();delete this.oOverflowList;}},addOverflowButton:function(){var A,o,t=this;if(!this.oOverflowList){this.oOverflowList=new sap.ca.scfld.md.app.ButtonListHelper(this.oApplicationImplementation,10);this.oOverflowList.bAllDisabled=this.bAllDisabled;this.oOverflowList.oBarList=this;}this.iOverflowPosition=this.oPositions.iActive;o=this.ensureButton(sap.ca.scfld.md.app.ButtonListHelper.getOverflowMeta(this),"b");o.setEnabled(true);o.setLayoutData(new sap.ca.scfld.md.app.BarOverflowLayoutData({moveToOverflow:false,stayInOverflow:false,overflowButton:true}));A=this.oOverflowList.oActionSheet;if(this.bAutomaticOverflow&&!this.oBarOverflow){o.setVisible(false);this.oBarOverflow=new sap.ca.scfld.md.app.BarOverflow(this.oBar,A,r.bind(t));}return A;},ensureButton:function(b,t,m){var c;if(m&&this.oPositions.iActive>=m){if(!this.bHasOverflow){this.addOverflowButton();this.bHasOverflow=true;}return this.oOverflowList.ensureButton(b,t);}else{var B=this.oPositions.iActive;if(B==this.aButtons.length){this.aButtons.push({});}}c=this.ensureControlAtPosition(b,t,B,this.oPositions);if(this.bAutomaticOverflow){c.setLayoutData(new sap.ca.scfld.md.app.BarOverflowLayoutData());if(!m){c.getLayoutData().setMoveToOverflow(false);}}return c;},setBtnEnabled:function(i,e,n){if(this.bAllDisabled){return;}var b=this.mButtons[i],c;if(b){b.setEnabled(e);if(b.getMetadata().getName()==="sap.m.Select"){c=f(this.aButtons,b);b=c.oButton;if(b){b.setEnabled(e);}}}else{if(this.oChild){this.oChild.setBtnEnabled(i,e,true);}if(this.oOverflowList){this.oOverflowList.setBtnEnabled(i,e,true);}}if(!n){this.oModifications.mChangedEnablements[i]=e;}},ensureControlAtPosition:function(b,t,B,p){var c=this.aButtons[B],T,s;if(t=="b"||this.iMode<20){if(c.oSelect){p.iControlPosition=this.oBar["indexOfContent"+this.sDirection](c.oSelect);c.oSelect.setVisible(false);}if(c.oButton){c.oButton.setVisible(true);if(this.oBar){var C=this.oBar["indexOfContent"+this.sDirection](c.oButton);if(C>p.iControlPosition){p.iControlPosition=C;}}}else{c.oButton=new sap.m.Button({id:b.sControlId});c.oButton.attachPress(jQuery.proxy(function(e){if(this.aCallBacks[B]){this.aCallBacks[B](e);}},this));p.iControlPosition++;if(this.iMode>=20){this.oBar["insertContent"+this.sDirection](c.oButton,p.iControlPosition);}else if(this.iMode>=10){this.oActionSheet.addButton(c.oButton);}else if(this.iMode==5){this.oBar.insertContentLeft(c.oButton,p.iControlPosition);}}T=a(b,this.oApplicationImplementation);s=T;if(!(this.iMode<20||!b.sIcon)){c.oButton._sTooltip=b.sTooltip||T;c.oButton.setTooltip(c.oButton._sTooltip);T="";}else if(b.sTooltip&&b.sTooltip!==T){c.oButton._sTooltip=b.sTooltip;c.oButton.setTooltip(c.oButton._sTooltip);}c.oButton._sTextInActionSheet=s;c.oButton._sTextInBar=T;if(T!=c.oButton.getText()){c.oButton.setText(T);}c.oButton._sTypeInActionSheet=sap.m.ButtonType.Default;if(this.iMode==20){if(c.oButton.getType()!=b.style){c.oButton.setType(b.style);c.oButton._sTypeInBar=b.style;}}if(t=="b"){this.aCallBacks[B]=b.onBtnPressed;}else{this.aCallBacks[B]=this.getSelectReplacement(b);}var R=c.oButton;}else{if(c.oButton){p.iControlPosition=this.oBar["indexOfContent"+this.sDirection](c.oButton);c.oButton.setVisible(false);}if(c.oSelect){c.oSelect.setVisible(true);var C=this.oBar["indexOfContent"+this.sDirection](c.oSelect);if(C>p.iControlPosition){p.iControlPosition=C;}var d=c.oSelect.getSelectedKey();c.oSelect.destroyItems();c.oSelect.setSelectedKey(d);}else{c.oSelect=new sap.m.Select({id:b.sControlId?b.sControlId+"_SELECT":undefined});c.oSelect.setType(sap.m.SelectType.IconOnly);c.oSelect.setAutoAdjustWidth(true);c.oSelect.setTooltip(b.sTooltip);p.iControlPosition++;this.oBar["insertContent"+this.sDirection](c.oSelect,p.iControlPosition);c.oSelect.attachChange(jQuery.proxy(function(e){var k=e.getSource().getSelectedKey();if(this.aCallBacks[B]){this.aCallBacks[B](k);}},this));if(this.bAutomaticOverflow&&!c.oButton){c.oButton=new sap.m.Button();c.oButton.setText(a(b,this.oApplicationImplementation));if(b.sIcon){c.oButton.setIcon(b.sIcon);}c.oButton.attachPress(jQuery.proxy(function(e){var h=this.getSelectReplacement(b);if(h){h(e);}},this));c.oButton.setEnabled(!b.bDisabled&&!this.bAllDisabled);}}if(b.sSelectedItemKey){c.oSelect.setSelectedItem(b.sSelectedItemKey);}for(var i=0;i<b.aItems.length;i++){var S=b.aItems[i],I;if(!S.id&&b.sControlId){S.id=c.oSelect.getId()+"_"+i;}var I=new sap.ui.core.Item(S);c.oSelect.addItem(I);}if(b.sSelectedItemKey){c.oSelect.setSelectedKey(b.sSelectedItemKey);}this.aCallBacks[B]=b.onChange;R=c.oSelect;}if(b.sIcon!=R.getIcon()){R.setIcon(b.sIcon);}if(b.sId){this.mButtons[b.sId]=R;}R.setEnabled(!b.bDisabled&&!this.bAllDisabled);p.iActive++;return R;},getSelectReplacement:function(b){var s=b.sSelectedItemKey;var c=function(R){if(R.selectedIndex>=0){var S=b.aItems[R.selectedIndex].key;if(S!=s){s=S;b.sSelectedItemKey=s;b.onChange(s);}}};return function(e){var I=[];var S=0;for(var i=0;i<b.aItems.length;i++){I.push({itemContent:b.aItems[i].text});if(b.aItems[i].key==s){S=i;}}s=b.aItems[S].key;sap.ca.ui.dialog.selectItem.open({title:e.getSource().getText(),items:I,defaultIndex:S},c);};},revertOverflowReplacement:function(){if(this.bIsOverflowReplaced){this.ensureControlAtPosition(sap.ca.scfld.md.app.ButtonListHelper.getOverflowMeta(this),"b",this.iOverflowPosition,{});this.bIsOverflowReplaced=false;}},setBtnText:function(i,t,n){var b=this.mButtons[i],c;if(b){if(b.getMetadata().getName()==="sap.m.Select"){b.setTooltip(t);b._sTooltip=t;c=f(this.aButtons,b);b=c.oButton;}if(b){b.setText(t);b.setTooltip("");b._sTooltip="";if(b._sTextInBar){b._sTextInBar=t;}if(b._sTextInActionSheet){b._sTextInActionSheet=t;}if(this.oBarOverflow){this.oBarOverflow.buttonTextChanged();}}}else{if(this.oChild){this.oChild.setBtnText(i,t,true);}if(this.oOverflowList){this.oOverflowList.setBtnText(i,t,true);}}if(!n){this.oModifications.mChangedTexts[i]=t;}},_getCurrentSelection:function(t,d){if(!this.mSelections[t]){this.mSelections[t]=d;}return this.mSelections[t];},_updateCurrentSelection:function(t,c){this.mSelections[t]=c;}});sap.ca.scfld.md.app.ButtonListHelper.getOverflowMeta=function(o){return{sIcon:"sap-icon://overflow",sControlId:o.sOverflowId,sTooltip:o.oApplicationImplementation.UilibI18nModel.getResourceBundle().getText("MORE"),onBtnPressed:function(e){o.oOverflowList.oActionSheet.openBy(e.getSource());}};};})();

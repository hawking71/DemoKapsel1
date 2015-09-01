// Copyright (c) 2009-2014 SAP SE, All Rights Reserved

(function () {
    "use strict";
    /*global jQuery, sap, $, document */
    /*jslint plusplus: true, nomen: true */

    sap.ui.jsview("sap.ushell.ui.footerbar.SaveAsTile", {
        getControllerName : function () {
            return "sap.ushell.ui.footerbar.SaveAsTile";
        },
        createContent: function (oController) {
            this.oResourceBundle = sap.ushell.resources.i18n;
            this.appData = this.getViewData() || {};
            this.oTitleInput = new sap.m.Input('bookmarkTitleInput', {
                value: {
                    path: "/title",
                    mode: sap.ui.model.BindingMode.TwoWay
                }
            });
            this.oSubTitleInput = new sap.m.Input('bookmarkSubTitleInput', {
                value: {
                    path: "/subtitle",
                    mode: sap.ui.model.BindingMode.TwoWay
                }
            });
            this.oInfoInput = new sap.m.Input('bookmarkInfoInput', {
                value: {
                    path: "/info",
                    mode: sap.ui.model.BindingMode.TwoWay
                }
            });


            var appMetaData = sap.ushell.services.AppConfiguration.getMetadata();

            var modelData = {
                title : this.appData.title || '',
                subtitle: this.appData.subtitle || '',
                numberValue : '',
                info: this.appData.info || '',
                icon: this.appData.icon || appMetaData.icon,
                numberUnit : this.appData.numberUnit,
                keywords: this.appData.keywords || ''
            };

            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData(modelData);
            this.setMainModel(oModel);

        var tileInitSettings = {
            numberValue: "{/numberValue}",
            title : "{/title}",
            subtitle: "{/subtitle}",
            info: "{/info}",
            icon: "{/icon}",
            infoState: "{/infoState}",
            numberFactor: "{/numberFactor}",
            numberUnit: "{/numberUnit}",
            numberDigits: "{/numberDigits}",
            numberState: "{/numberState}",
            stateArrow: "{/stateArrow}",
            targetURL: "{/targetURL}",
            keywords: "{/keywords}"
        };

        var oTile, serviceUrl;
        if (this.appData.serviceUrl) {
            oTile = new sap.ushell.ui.tile.DynamicTile("previewTile", tileInitSettings);
            serviceUrl = (typeof (this.appData.serviceUrl) === "function") ? this.appData.serviceUrl() : this.appData.serviceUrl;
            this.calcTileDataFromServiceUrl(serviceUrl, oModel);
        } else {
            oTile = new sap.ushell.ui.tile.StaticTile("previewTile", tileInitSettings);
        }
        this.setTileView(oTile);
        oTile.setModel(oModel);

        var tileWrapper = new sap.ushell.ui.launchpad.Tile({
            draggable : false,
            "long" : false,
            "tall" : false,
            tileViews : [oTile]}).addStyleClass("sapBookmarkFormPreviewTileMargin");

            var oPreview = new sap.m.Label({text: " " +  this.oResourceBundle.getText('previewFld')}),
                oTitle = new sap.m.Label({required: true, text: " " +  this.oResourceBundle.getText('titleFld')}),
                oSubTitle = new sap.m.Label({text: this.oResourceBundle.getText('subtitleFld')}),
                oInfo = new sap.m.Label({text: this.oResourceBundle.getText('infoMsg')});
            var hbox = new sap.m.HBox("saveAsTileHBox",{
                items: [tileWrapper],
                alignItems : sap.m.FlexAlignItems.Center,
                justifyContent: sap.m.FlexJustifyContent.Center
            }).addStyleClass("sapMGlobalBackgroundColorStrong").addStyleClass("sapBookmarkFormPreviewBoxBottomMargin");

            var content = [
             oPreview,
             hbox,
             oTitle,
             this.oTitleInput,
             oSubTitle,
             this.oSubTitleInput,
             oInfo,
             this.oInfoInput
             ];

            var oResources = sap.ushell.resources.i18n;

            this.oTitleInput.setTooltip(oResources.getText("bookmarkDialogoTitle_tooltip"));
            this.oTitleInput.setModel(oModel);
            this.oSubTitleInput.setTooltip(oResources.getText("bookmarkDialogoSubTitle_tooltip"));
            this.oSubTitleInput.setModel(oModel);
            this.oInfoInput.setTooltip(oResources.getText("bookmarkDialogoInfo_tooltip"));
            this.oInfoInput.setModel(oModel);
            return content;
        },
        getTitleInput: function () {
            return this.oTitleInput;
        },
        getMainModel: function () {
            return this.mainModel;
        },
        setMainModel: function (mainModel) {
            this.mainModel = mainModel;
        },
        getTileView: function () {
            return this.tileView;
        },
        setTileView: function (oTileView) {
            this.tileView = oTileView;
        },
        calcTileDataFromServiceUrl: function (serviceUrl, oModel) {
            OData.read({requestUri: serviceUrl},
                // sucess handler
                function (oResult) {
                    if (typeof oResult === "string") {
                        oResult = {number: oResult};
                    }
                    var modelData = oModel.getData();
                    modelData.numberValue = oResult.number;
                    var aKeys = ["infoState", "stateArrow", "numberState", "numberDigits", "numberFactor"];
                    for (var i=0; i<aKeys.length; i++) {
                        var key = aKeys[i];
                        if (oResult[key]) {
                            modelData[key] = oResult[key];
                        }
                    }
                    oModel.setData(modelData);
                }, function (err) {
                    console.log(err);
                }, {
                    read: function (response, context) {
                        response.data = JSON.parse(response.body).d;
                    }
                }
            );
        },
        enableGroupSelection: function () {
            var groupsFilter = [];
            var currentModel = sap.ui.getCore().byId("shell").getModel();
            groupsFilter.push(new sap.ui.model.Filter("isGroupLocked", sap.ui.model.FilterOperator.NE, true));

            if (currentModel && currentModel.oData.enableHideGroups) { //Add filter only if the feature is enabled
                groupsFilter.push(new sap.ui.model.Filter("isGroupVisible", sap.ui.model.FilterOperator.EQ, true));
            }

            this.oGroupsSelect = new sap.m.Select("groupsSelect", {
                tooltip: "{i18n>bookmarkDialogoInfo_tooltip}",
                items : {
                    path : "/groups",
                    template : new sap.ui.core.ListItem({
                        text : "{title}"
                    }),
                    filters : groupsFilter
                },
                width:"100%"
            });

            // check if group were loaded in the model. If not - reload them
            if (!currentModel.oData.groups.length) {
                var oEventBus = sap.ui.getCore().getEventBus();
                oEventBus.publish("launchpad", "loadDashboardGroups");
            }
            this.oGroupsSelect.setModel(currentModel);

            if (currentModel.oData.groups.length) {
                this.oGroupsSelect.setSelectedIndex(0);
            }

            this.oGroupsSelect.setTooltip(sap.ushell.resources.i18n.getText("bookmarkDialogoGroup_tooltip"));
            var oGroupsLabel = new sap.m.Label({text: this.oResourceBundle.getText('GroupListItem_label')});
            this.addContent(oGroupsLabel);
            this.addContent(this.oGroupsSelect);

            return this;
        },
        getBookmarkTileData: function () {
            var selectedGroupData;
            if (this.oGroupsSelect && this.oGroupsSelect.getSelectedItem()) {
                selectedGroupData = this.oGroupsSelect.getSelectedItem().getBindingContext().getObject();
            }

            // customUrl - Will be used to navigate from the new tile.
            var sURL;
            // in case customUrl is supplied
            if (this.appData.customUrl) {
            	// check if a function was passed as customUrl 
            	if (typeof (this.appData.customUrl) === "function") {
            		// resolve the function to get the value for the customUrl
            		sURL = this.appData.customUrl(); 
            	} else {
            		// Provided as a string
                    // In case customURL will be provided (as a string) containing an hash part, it must be supplied non-encoded, 
            		// or it will be resolved with duplicate encoding and can cause nav errors.
            		sURL = this.appData.customUrl;
            	}
            }
            else {
            	// In case an hash exists, hasher.setHash() is used for navigation. It also adds encoding.
            	// Otherwise use window.location.href
            	sURL = hasher.getHash() ? ('#' + hasher.getHash()) : window.location.href;
        	}
            
            
            var oModel = this.getMainModel();
            var oData = {
                title : this.oTitleInput.getValue(),
                subtitle : this.oSubTitleInput.getValue(),
                url : sURL,
                icon : oModel.getProperty('/icon') ,
                info : this.oInfoInput.getValue(),
                numberUnit : this.appData.numberUnit,
                serviceUrl : typeof (this.appData.serviceUrl) === "function" ? this.appData.serviceUrl() : this.appData.serviceUrl,
                serviceRefreshInterval : this.appData.serviceRefreshInterval,
                group : selectedGroupData,
                keywords :  this.appData.keywords
            }
            return oData;
        }
    });
}());

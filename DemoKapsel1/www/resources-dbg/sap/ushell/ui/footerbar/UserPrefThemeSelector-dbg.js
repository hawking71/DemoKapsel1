// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
/*global jQuery, sap*/

(function () {
    "use strict";
    /*global jQuery, sap, window*/
    jQuery.sap.require("sap.ushell.resources");
    jQuery.sap.require("sap.ushell.services.Container");
    jQuery.sap.declare("sap.ushell.ui.footerbar.UserPrefThemeSelector");

    /**
     * UserPrefThemeSelector
     *
     * @name sap.ushell.ui.footerbar.UserPrefThemeSelector
     * @private
     * @since 1.27.0
     */
    sap.ushell.ui.footerbar.UserPrefThemeSelector = function () {
        try {
            this.userInfoService = sap.ushell.Container.getService("UserInfo");
            this.oUser = this.userInfoService.getUser();
        } catch(e) {
            jQuery.sap.log.error("Getting UserInfo service failed.");
            this.oUser = sap.ushell.Container.getUser();
        }

        this.translationBundle = sap.ushell.resources.i18n;
        this.currentThemeId = this.oUser.getTheme();
        this.aThemeList = null;
    };

    sap.ushell.ui.footerbar.UserPrefThemeSelector.prototype.getTitle = function () {
        return this.translationBundle.getText("theme");
    };

    sap.ushell.ui.footerbar.UserPrefThemeSelector.prototype.getIsChangeThemePermitted = function () {
        return this.oUser.isSetThemePermitted();
    };

    sap.ushell.ui.footerbar.UserPrefThemeSelector.prototype.getValue = function () {
        var deferred = jQuery.Deferred();
        var themeListPromise = this._getThemeList();
        var that = this;
        var themeName;

        themeListPromise.done(function (aThemeList) {
            that.aThemeList = aThemeList;
            themeName = that._getThemeNameById(that.currentThemeId);
            deferred.resolve(themeName);
        });

        themeListPromise.fail(function(sErrorMessage) {
            deferred.reject(sErrorMessage); //TODO error massage
        });

        return deferred.promise();
    };

    sap.ushell.ui.footerbar.UserPrefThemeSelector.prototype.getOnCancel = function () {
        this.currentThemeId = this.oUser.getTheme();
    };

    sap.ushell.ui.footerbar.UserPrefThemeSelector.prototype.getOnSave = function () {
        var deferred = jQuery.Deferred();
        var oUserPreferencesPromise;
        var oModel = sap.ui.getCore().byId("shell").getModel();

        if (this.oUser.getTheme() != this.currentThemeId) {//only if there was a change we would like to save it
            // Apply the selected theme
            if (this.currentThemeId) {
                this.oUser.setTheme(this.currentThemeId);

                oUserPreferencesPromise = this.userInfoService.updateUserPreferences(this.oUser);

                oUserPreferencesPromise.done(function () {
                    this.oUser.resetChangedProperties();

                    // re-calculate tiles background color according to the selected theme
                    if (oModel.getProperty("/tilesOpacity") === true) {
                        sap.ushell.utils.handleTilesOpacity();
                    }
                    deferred.resolve();
                }.bind(this));

                oUserPreferencesPromise.fail(function (sErrorMessage) {
                    this._restoreUserPreferencesProperties(sErrorMessage);
                    deferred.reject(sErrorMessage);//TODO: how to handle error message?
                }.bind(this));
            } else {
                deferred.reject("Could not find theme: " + this.currentThemeId);
            }
        } else {
            deferred.resolve();//No theme change, do nothing
        }

        return deferred.promise();
    };

    sap.ushell.ui.footerbar.UserPrefThemeSelector.prototype._restoreUserPreferencesProperties = function (sErrorMessage) {
        //currently THEME is the only user preferences editable property
        var messageSrvc,
            oldTheme = this.oUser.getChangedProperties().filter(function (ChangedProperty) {
                return ChangedProperty.name === "THEME";
            })[0].oldValue;

        // Apply the previous theme to the user
        this.oUser.setTheme(oldTheme);
        messageSrvc = sap.ushell.Container.getService("Message");
        messageSrvc.error(this.translationBundle.getText("changeThemeFailed"));
        jQuery.sap.log.error(sErrorMessage);
    };

    sap.ushell.ui.footerbar.UserPrefThemeSelector.prototype.getContent = function () {
        var deferred = jQuery.Deferred();
        var oListExists =  sap.ui.getCore().byId('themeSelectorList');
        if (oListExists) {
            deferred.resolve(oListExists);
        } else {
            if (this.aThemeList.length > 0) {
                // Sort the array of themes according to theme name
                this.aThemeList.sort(function (theme1, theme2) {
                    var theme1Name = theme1.name,
                        theme2Name = theme2.name;
                    if (theme1Name < theme2Name) { //sort string ascending
                        return -1;
                    }
                    if (theme1Name > theme2Name) {
                        return 1;
                    }
                    return 0; //default return value (no sorting)
                });
                //set theme selection
                for (var i = 0; i < this.aThemeList.length; i++) {
                    if (this.aThemeList[i].id == this.currentThemeId) {
                        this.aThemeList[i].isSelected = true;
                    } else {
                        this.aThemeList[i].isSelected = false;
                    }
                }

                this.oModel = new sap.ui.model.json.JSONModel({options: this.aThemeList});
                var oThemeListItem = this._getThemeListItemTemplate();
                var oList = new sap.m.List('themeSelectorList', {
                    includeItemInSelection: true,
                    mode: "SingleSelectLeft",
                    items: {
                        path: "/options",
                        template: oThemeListItem
                    }
                });

                oList.setModel(this.oModel);
                deferred.resolve(oList);
            } else {
                deferred.reject();
            }
        }

        return deferred.promise();
    };

    sap.ushell.ui.footerbar.UserPrefThemeSelector.prototype._getThemeList = function() {
        var deferred = jQuery.Deferred();

        if (this.aThemeList == null) {
            if (this.getIsChangeThemePermitted() == true) {
                var getThemesPromise = this.userInfoService.getThemeList();

                getThemesPromise.done(function (oData) {
                    deferred.resolve(oData.options);
                });

                getThemesPromise.fail(function () {
                    deferred.reject("Failed to load theme list.");
                });
            } else {
                deferred.resolve([this.currentThemeId]);
            }
        } else {
            deferred.resolve(this.aThemeList);
        }

        return deferred.promise();
    };

    sap.ushell.ui.footerbar.UserPrefThemeSelector.prototype._getThemeListItemTemplate = function () {
        var that = this;
        var onSelectHandler = function (e) {
            var item = e.srcControl;
            that.currentThemeId = item.getBindingContext().getProperty("id");
        };

        var item = new sap.m.StandardListItem({
            title: "{name}",
            selected: "{isSelected}"
        });
        item.addEventDelegate({
            onclick: onSelectHandler
        });
        return item;
    };

    sap.ushell.ui.footerbar.UserPrefThemeSelector.prototype._getThemeNameById = function (themeId) {
        if (this.aThemeList) {
            for (var i = 0; i < this.aThemeList.length; i++) {
                if (this.aThemeList[i].id == themeId) {
                    return this.aThemeList[i].name;
                }
            }
        }
        //fallback in case relevant theme not found
        return themeId;
    };

}());

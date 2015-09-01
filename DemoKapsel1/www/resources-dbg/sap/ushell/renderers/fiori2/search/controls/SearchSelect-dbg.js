/* global jQuery, sap, window */
(function() {
    "use strict";

    jQuery.sap.require('sap.m.Select');

    sap.m.Select.extend('sap.ushell.renderers.fiori2.search.controls.SearchSelect', {

        constructor: function(options) {
            var self = this;
            options = jQuery.extend({}, {
                visible: "{/businessObjSearchEnabled}",
                autoAdjustWidth: true,
                maxWidth: "16rem",
                items: {
                    path: "/dataSources",
                    template: new sap.ui.core.Item({
                        key: "{objectName/value}",
                        text: "{label}"
                    })
                },
                selectedKey: {
                    path: '/dataSource/objectName/value',
                    mode: sap.ui.model.BindingMode.OneWay
                },
                change: function(event) {
                    var item = this.getSelectedItem();
                    var context = item.getBindingContext();
                    var dataSource = context.getObject();
                    this.getModel().setDataSource(dataSource, false);
                    this.getModel().abortSuggestions();
                }
            }, options);
            sap.m.Select.prototype.constructor.apply(this, [options]);
            this.addStyleClass('searchSelect');
        },

        renderer: 'sap.m.SelectRenderer'

        //        ,
        //        fireChange: function(oEvent) {
        //            sap.m.Select.prototype.fireChange.apply(this, arguments);
        //            var item = this.getSelectedItem();
        //            var context = item.getBindingContext();
        //            var selectedDataSource = context.getObject();
        //            this.getModel().setDataSource(selectedDataSource, false);
        //            this.getModel().abortSuggestions();
        //        }

    });

})();

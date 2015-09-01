// iteration 0 : naja
/* global sap */
/* global $ */
/* global window */
/* global setTimeout */

(function() {
    "use strict";

    sap.ui.core.Control.extend("sap.ushell.renderers.fiori2.search.controls.SearchResultListContainer", {


        metadata: {
            properties: {

            },
            aggregations: {
                "resultList": {
                    type: "sap.ui.core.Control",
                    multiple: false
                },
                "preview": {
                    type: "sap.ui.core.Control",
                    multiple: false
                }
            }
        },


        renderer: function(oRm, oControl) {

            /// outer div
            oRm.write("<div");
            oRm.writeControlData(oControl);
            oRm.addClass("searchResultListWithDetail");
            oRm.writeClasses();
            oRm.write('>');

            // left = result list
            oRm.write('<div class="searchLayout-left">');
            if (oControl.getResultList()) {
                oRm.renderControl(oControl.getResultList());
            }
            oRm.write('</div>');

            /// close outer div
            oRm.write("</div>");
        },


        // TODO: is this really necessary (there's no detail area anymore)
        onAfterRendering: function() {

            var self = this;
            var preview = $(this.getDomRef()).find('.searchResultListItemDetail');
            var headerSize = $("#searchPage-cont") ? $("#searchPage-cont").offset().top : $("#searchResultPage-cont").offset().top;

            var updatePos = function() {

                //searchPage-scroll
                if ($("#searchResultPage-scroll").length > 0 || $("#searchPage-scroll").length > 0) {

                    var resultList = $('.searchResultListWithDetail');
                    if (resultList.length > 0) {
                        if (resultList.offset().top - headerSize < 0) //resultlist scrolled outside, fix detail to top
                        {
                            preview.css('margin-top', -resultList.offset().top + headerSize);
                        } else {
                            preview.css('margin-top', 0);
                        }
                    }
                }

            };

            // register to events
            $("#searchResultPage-cont").on("scroll", updatePos);
            $("#searchResultPage-cont").bind('touchmove', function(e) {
                updatePos();
            });
            $("#searchPage-cont").on("scroll", updatePos);
            $("#searchPage-cont").bind('touchmove', function(e) {
                updatePos();
            });

            // initial call
            updatePos();



            // trigger re-rendering of result list for different devices
            self.formerWindowWidth = $(window).width();
            $(window).resize(function(event) {
                if (self.resizeTimeoutID) {
                    window.clearTimeout(self.resizeTimeoutID);
                }
                self.resizeTimeoutID = window.setTimeout(function() {
                    var phoneSize = 767;
                    var tabletSize = 1150;
                    var windowWidth = $(window).width();
                    if (windowWidth <= phoneSize && self.formerWindowWidth > phoneSize || windowWidth <= tabletSize && (self.formerWindowWidth <= phoneSize || self.formerWindowWidth > tabletSize) || windowWidth > tabletSize && self.formerWindowWidth <= tabletSize) {
                        self.rerender();
                    }
                    self.formerWindowWidth = windowWidth;
                }, 250);
            });

        }

    });

})();

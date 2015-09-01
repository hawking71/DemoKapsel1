// iteration 0 : Holger
/* global sap,window,$, jQuery */

(function() {
    "use strict";

    jQuery.sap.require('sap.ushell.renderers.fiori2.search.controls.SearchResultListItemButton');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.SemanticObjectsHandler');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.controls.SearchText');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.controls.SearchLink');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchHelper');

    var SearchResultListItemButton = sap.ushell.renderers.fiori2.search.controls.SearchResultListItemButton;
    var SemanticObjectsHandler = sap.ushell.renderers.fiori2.search.SemanticObjectsHandler;
    var SearchText = sap.ushell.renderers.fiori2.search.controls.SearchText;
    var SearchLink = sap.ushell.renderers.fiori2.search.controls.SearchLink;
    var searchHelper = sap.ushell.renderers.fiori2.search.SearchHelper;

    sap.m.ListItemBase.extend("sap.ushell.renderers.fiori2.search.controls.SearchResultListItem", {
        // the control API:
        metadata: {
            properties: {
                title: "string",
                titleUrl: "string",
                type: "string",
                imageUrl: "string",
                //                 status: "string", // closed (default) or open
                previewButton: "string", // true (default) or false, implemented for tablet only acc. to. visual design
                data: "object",
                visibleAttributes: "int",
                firstDetailAttribute: {
                    type: "int",
                    defaultValue: 4
                },
                maxDetailAttributes: {
                    type: "int",
                    defaultValue: 8
                }
            },
            events: {
                navigate: {}
            }
        },



        // the part creating the HTML:
        renderer: function(oRm, oControl) { // static function, so use the given "oControl" instance instead of "this" in the renderer function
            var self = oControl;

            self.resetPrecalculatedValues();

            self.showExpandButton = false;

            self.renderOuterContainer(oRm);
        },



        // render Outer Container
        // ===================================================================
        renderOuterContainer: function(oRm) {
            var self = this;

            /// outer div
            oRm.write("<div");
            //             oRm.writeAttribute("tabindex", "-1");
            oRm.writeControlData(self); // writes the Control ID
            if (self.status === "open" || self.getData().selected === true) {
                oRm.addClass("searchResultListItem-open");
            }
            //             oRm.addClass("searchResultListItem");
            oRm.writeClasses(); // this call writes the above class plus enables support for Square.addStyleClass(...)
            oRm.write(">");


            self.renderIntermediateContainer(oRm);


            var showExpandButton = (self.showExpandButton && self.getPreviewButton() !== "false");
            self.renderExpandButton(oRm, showExpandButton);


            /// close outer div
            oRm.write("</div>"); // end of the complete control
        },



        // render Intermediate Container
        // ===================================================================
        renderIntermediateContainer: function(oRm) {
            var self = this;

            oRm.write('<div class="searchResultListItem-main"><div>');

            self.renderInnerContainer(oRm);

            self.renderRelatedObjectsForPhone(oRm);

            oRm.write("</div></div>"); // close main
        },



        // render InnerContainer
        // ===================================================================
        renderInnerContainer: function(oRm) {
            var self = this;

            oRm.write('<div class="searchResultListItem-left">');

            oRm.write('<div class="searchResultListItem-titleContainer">');

            /// Image for Phone
            self.renderImageForPhone(oRm);

            /// Main Title and Object Type
            self.renderTitle(oRm);

            /// Related Objects for Desktop and Tablet
            self.renderRelatedObjects(oRm);

            oRm.write('</div>');

            /// Attributes (Summary, Detail and WhyFound)
            var pos = 0;
            var itemAttributes = self.getData().itemattributes;
            self.renderAttributes(oRm, itemAttributes, pos);

            oRm.write("</div>");
        },



        // render Title and Object Type
        // ===================================================================
        renderTitle: function(oRm) {
            var self = this;

            if (!self.titleUrl) {
                self.titleUrl = self.getTitleUrl();
            }


            var titleURL = encodeURI(self.titleUrl);
            self.title = new SearchLink({
                text: self.getTitle(),
                href: titleURL
            });
            self.title.setTooltip((sap.ushell.resources.i18n.getText('linkTo_tooltip') + ' ' + self.getTitle()).replace(/<b>/gi, '').replace(/<\/b>/gi, ''));
            self.title.addStyleClass("searchResultListItem-title");
            oRm.renderControl(self.title);
            //self._setSaveText(title.getDomRef(), self.getTitle());


            /// /// type 2 (table)
            var type2 = new SearchText({
                text: self.getType()
            });
            type2.setTooltip(('' + self.getType()).replace(/<b>/gi, '').replace(/<\/b>/gi, ''));
            type2.addStyleClass("searchResultListItem-type");
            oRm.renderControl(type2);
        },



        // render Image for Desktop and Tablet
        // ===================================================================
        renderImage: function(oRm) {
            var self = this;
            if (self.getImageUrl()) {
                oRm.write('<div class="searchResultListItem-attribute searchResultListItem-imageDesktop-outerContainer">');
                oRm.write('<div class="searchResultListItem-imageDesktop-innerContainer">');
                oRm.write('<div class="searchResultListItem-imageDesktop-alignmentHelper">');
                oRm.write('</div>');
                oRm.write('<img class="searchResultListItem-imageDesktop" src="');
                oRm.write(self.getImageUrl());
                oRm.write('">');
                oRm.write('</div>');
                oRm.write('</div>');
            }
        },



        // render Image for Phone
        // ===================================================================
        renderImageForPhone: function(oRm) {
            var self = this;
            if (self.getImageUrl()) {
                oRm.write('<div class="searchResultListItem-imagePhone" style="background-image:url(\'');
                oRm.write(self.getImageUrl());
                oRm.write('\')"></div>');
            }
        },



        // render Related Objects for Desktop and Tablet
        // ===================================================================
        renderRelatedObjects: function(oRm) {
            var self = this;

            var text = "";
            var tooltip = "";
            var link = "";

            oRm.write('<div class="searchResultListItem-relatedObjectsContainer-desktop">');
            oRm.write('<div class="searchResultListItem-relatedObjectsContainer"');
            if (!self.relatedObjects) {
                oRm.write('style="display:none"');
            } else {
                text = self.relatedObjects.text;
                tooltip = self.relatedObjects.text;
                link = "#" + self.relatedObjects.link;
            }
            oRm.write('>');

            /// /// related objects
            var relatedObjectsSeparator = new sap.m.Text({
                text: "|"
            });
            relatedObjectsSeparator.addStyleClass("searchResultListItem-type");
            relatedObjectsSeparator.addStyleClass("searchResultListItem-relatedObjectsSeparator");
            oRm.renderControl(relatedObjectsSeparator);

            self.relatedObjectsLink = new SearchLink({
                text: text,
                href: link
            });
            self.relatedObjectsLink.setTooltip(tooltip);
            self.relatedObjectsLink.addStyleClass("searchResultListItem-type");
            self.relatedObjectsLink.addStyleClass("searchResultListItem-relatedObjects");
            oRm.renderControl(self.relatedObjectsLink);

            oRm.write('</div>');
            oRm.write('</div>');
        },



        // render related objects for phone
        // ===================================================================
        renderRelatedObjectsForPhone: function(oRm) {
            var self = this;

            var text = "";
            var tooltip = "";
            var link = "";

            oRm.write('<div class="searchResultListItem-relatedObjectsContainer-phone">');
            oRm.write('<div class="searchResultListItem-relatedObjectsContainer"');
            if (!self.relatedObjects) {
                oRm.write('style="display:none"');
            } else {
                text = self.relatedObjects.text;
                tooltip = self.relatedObjects.text;
                link = "#" + self.relatedObjects.link;
            }
            oRm.write('>');

            self.relatedObjectsLink2 = new SearchLink({
                text: text,
                href: link
            });
            self.relatedObjectsLink2.setTooltip(tooltip);
            //             self.relatedObjectsLink2.addStyleClass("searchResultListItem-type");
            oRm.renderControl(self.relatedObjectsLink2);

            oRm.write('</div>');
            oRm.write('</div>');
        },



        // render Attributes
        // ===================================================================
        renderAttributes: function(oRm, itemAttributes, pos) {
            var self = this;

            /// Summary Attributes
            oRm.write('<div class="searchResultListItem-attributes">');

            oRm.write('<div class="searchResultListItem-visibleAttributes">');

            pos = self.renderSummaryAttributes(oRm, itemAttributes, pos);

            /// Image for Phone and Desktop
            self.renderImage(oRm);

            oRm.write("</div>");

            /// Detail Attributes
            pos = self.renderDetailAttributes(oRm, itemAttributes, pos);

            // attributes close
            oRm.write("</div>");

            return pos;
        },



        // render Summary Attributes
        // ===================================================================
        renderSummaryAttributes: function(oRm, itemAttributes, pos) {
            var self = this;

            var visibleAttributes = self.getNumberOfVisibleAttributes();
            for (; pos < itemAttributes.length && pos < visibleAttributes; pos++) {
                var itemAttribute = itemAttributes[pos];
                var labelText = itemAttribute.name;
                var valueText = itemAttribute.value;
                if (labelText === undefined || valueText === undefined) {
                    continue;
                }
                if (!valueText || valueText === "") {
                    valueText = "&nbsp;";
                }
                oRm.write('<div class="searchResultListItem-attribute">');
                var label = new sap.m.Label({
                    text: labelText
                });
                label.setTooltip(('' + labelText).replace(/<b>/gi, '').replace(/<\/b>/gi, ''));
                label.addStyleClass("searchResultListItem-attribute-label");
                oRm.renderControl(label);
                var value = new SearchText({
                    text: valueText
                });
                value.setTooltip(('' + valueText).replace(/<b>/gi, '').replace(/<\/b>/gi, ''));
                value.addStyleClass("searchResultListItem-attribute-value");
                oRm.renderControl(value);
                oRm.write("</div>");
            }

            return pos;
        },



        // render Detail Attributes
        // ===================================================================
        renderDetailAttributes: function(oRm, itemAttributes, pos) {
            var self = this;

            if (self.isPhoneSize()) {
                return pos;
            }

            var labelText, valueText;

            var detailAttributes = self.getMaxDetailAttributes();
            if (detailAttributes > 8) {
                detailAttributes = 8;
            }

            var details = [];

            var end = pos + detailAttributes;
            for (; pos < end && pos < itemAttributes.length; pos++) {
                var itemAttribute = itemAttributes[pos];
                labelText = itemAttribute.name;
                valueText = itemAttribute.value;
                if (labelText === undefined || valueText === undefined) {
                    continue;
                }
                if (!valueText || valueText === "") {
                    valueText = "&nbsp;";
                }

                var detailAttribute = {
                    labelText: labelText,
                    valueText: valueText
                };

                details.push(detailAttribute);
            }

            if (details.length > 0) {
                self.showExpandButton = true;
            }

            oRm.write('<div class="searchResultListItemDetails2"');
            if (self.status !== "open") {
                oRm.write(' style="display:none"');
            }
            oRm.write('>');

            oRm.write('<div class="searchResultListItem-detailsAttributes">');

            for (var i = 0; i < details.length; i++) {
                var detail = details[i];
                labelText = detail.labelText;
                valueText = detail.valueText;
                if (labelText === undefined || valueText === undefined) {
                    continue;
                }
                if (!valueText || valueText === "") {
                    valueText = "&nbsp;";
                }
                oRm.write('<div class="searchResultListItem-attribute">');
                var label = new sap.m.Label({
                    text: labelText
                });
                label.setTooltip(('' + labelText).replace(/<b>/gi, '').replace(/<\/b>/gi, ''));
                label.addStyleClass("searchResultListItem-attribute-label");
                oRm.renderControl(label);
                var value = new SearchText({
                    text: valueText
                });
                value.setTooltip(('' + valueText).replace(/<b>/gi, '').replace(/<\/b>/gi, ''));
                value.addStyleClass("searchResultListItem-attribute-value");
                oRm.renderControl(value);
                oRm.write("</div>");
            }

            oRm.write('</div>');

            pos = self.renderWhyFoundAttributes(oRm, itemAttributes, pos);

            //             self.renderRelatedObjectsToolbar(oRm);

            oRm.write('</div>');

            return pos;
        },




        // render why found attributes
        // ===================================================================
        renderWhyFoundAttributes: function(oRm, itemAttributes, pos) {
            var self = this;

            var labelText, valueText;

            //////////////////////////////////////////////////////////////////////////
            /// Prepare WhyFound Attributes
            var whyFoundAttributes = [];
            var whyFoundAttribute;
            for (; pos < itemAttributes.length; pos++) {
                var itemAttribute = itemAttributes[pos];

                if (!itemAttribute.whyfound) {
                    continue;
                }

                labelText = itemAttribute.name;
                valueText = itemAttribute.value;
                if (labelText === undefined || valueText === undefined) {
                    continue;
                }
                if (!valueText || valueText === "") {
                    valueText = "&nbsp;";
                }

                whyFoundAttribute = {
                    labelText: labelText,
                    valueText: valueText
                };

                whyFoundAttributes.push(whyFoundAttribute);
            }

            if (whyFoundAttributes.length > 0) {

                self.showExpandButton = true;

                oRm.write('<div class="searchResultListItem-whyFoundContainer">');
                for (var i = 0; i < whyFoundAttributes.length; i++) {
                    whyFoundAttribute = whyFoundAttributes[i];
                    labelText = whyFoundAttribute.labelText;
                    valueText = whyFoundAttribute.valueText;
                    if (labelText === undefined || valueText === undefined) {
                        continue;
                    }
                    if (!valueText || valueText === "") {
                        valueText = "&nbsp;";
                    }
                    oRm.write('<div class="searchResultListItem-attribute">');
                    var label = new sap.m.Label({
                        text: labelText
                    });
                    label.setTooltip(('' + labelText).replace(/<b>/gi, '').replace(/<\/b>/gi, ''));
                    label.addStyleClass("searchResultListItem-attribute-label");
                    oRm.renderControl(label);
                    var value = new SearchText({
                        text: valueText
                    });
                    value.setTooltip(('' + valueText).replace(/<b>/gi, '').replace(/<\/b>/gi, ''));
                    value.addStyleClass("searchResultListItem-attribute-value");
                    oRm.renderControl(value);
                    oRm.write("</div>");
                }
                oRm.write("</div>");
            }

            return pos;
        },



        // render Related Objects Toolbar
        // ===================================================================
        renderRelatedObjectsToolbar: function(oRm) {
            var self = this;

            var maxVisibleRelatedObjects = 5;

            var someRandomWords = [
                "Corporealness",
                "Crownbeard",
                "Admired",
                "Fulvid",
                "Granatite",
                "Slighting",
                "Presbyterial",
                "Deceit",
                "Sarcasmous",
                "Huloist",
                "Photo etching",
                "Resemblingly",
                "Corporealness"
            ];
            var relatedObjectActions = [];
            for (var xyz = 0; xyz < someRandomWords.length; xyz++) {
                relatedObjectActions.push(new sap.m.Link({
                    text: someRandomWords[xyz],
                    //                             layoutData:new sap.m.ToolbarLayoutData({
                    //                                 shrinkable: false
                    //                             })
                }));
            }
            if (relatedObjectActions.length > 0) {

                //                 self.showExpandButton = true;

                var toolbarContent = [
                    new sap.m.ToolbarSpacer(),
                    new sap.m.ToolbarSpacer({
                        width: "1rem"
                    })
                ];

                var k;
                for (k = 0; k < maxVisibleRelatedObjects && k < relatedObjectActions.length; k++) {
                    toolbarContent.push(relatedObjectActions[k]);
                    toolbarContent.push(new sap.m.ToolbarSpacer({
                        width: "1rem"
                    }));
                    if (k >= 3) {
                        relatedObjectActions[k].addStyleClass("sapUIDesktopOnly");
                    }
                }

                if (k < relatedObjectActions.length) {

                    var overFlowContent = [];

                    for (; k < relatedObjectActions.length; k++) {
                        overFlowContent.push(
                            new sap.m.Button({
                                text: relatedObjectActions[k].getText()
                            })
                        );
                    }

                    var overFlowButton = new sap.m.Button({
                        icon: sap.ui.core.IconPool.getIconURI("overflow")
                    });

                    var overFlowSheet = new sap.m.ActionSheet({
                        placement: sap.m.PlacementType.Top,
                        buttons: overFlowContent
                    });

                    overFlowButton.attachPress(function() {
                        overFlowSheet.openBy(overFlowButton);
                    });

                    toolbarContent.push(
                        overFlowButton
                    );
                }

                self.relatedObjectActionsToolbar = new sap.m.Toolbar({
                    design: sap.m.ToolbarDesign.Solid,
                    content: toolbarContent,
                });

                self.relatedObjectActionsToolbar.addStyleClass("searchResultListItem-relatedObjectsToolbar");

                oRm.renderControl(self.relatedObjectActionsToolbar);
            }
        },



        // render expand button
        // ===================================================================
        renderExpandButton: function(oRm, showExpandButton) {
            var self = this;

            oRm.write('<div class="searchResultListItemButton">'); //background-color:red">');
            oRm.write('<div class="searchResultListItemButtonContainer');
            if (!showExpandButton) {
                oRm.write(' searchResultListItemButtonContainer-hidden');
            }
            oRm.write('">');

            var iconArrowUp = sap.ui.core.IconPool.getIconURI("slim-arrow-up");
            var iconArrowDown = sap.ui.core.IconPool.getIconURI("slim-arrow-down");
            self.button = new sap.m.Button({
                icon: iconArrowDown,
                type: sap.m.ButtonType.Transparent,
                tooltip: sap.ushell.resources.i18n.getText("showDetailBtn_tooltip"),
                press: function() {
                    // Toggle Details Area
                    var detailsArea = $(self.getDomRef()).find('.searchResultListItemDetails2');
                    if (detailsArea && detailsArea.length === 1) {

                        var isOpen = detailsArea.css('display') !== "none";

                        if (isOpen) {
                            detailsArea.slideUp("fast", function() {
                                self.button.setTooltip(sap.ushell.resources.i18n.getText("showDetailBtn_tooltip"));
                                self.button.setIcon(iconArrowDown);
                                self.button.rerender();
                            });
                        } else {
                            detailsArea.slideDown("fast", function() {
                                self.button.setTooltip(sap.ushell.resources.i18n.getText("hideDetailBtn_tooltip"));
                                self.button.setIcon(iconArrowUp);
                                self.button.rerender();
                                // before opening, the value text control has width of 0
                                self.forwardEllipsis(detailsArea.find(".searchResultListItem-attribute-value"));
                            });
                        }

                    }
                }
            });
            oRm.renderControl(self.button);

            oRm.write('</div>');
            oRm.write('</div>');
        },



        // after rendering
        // ===================================================================
        onAfterRendering: function() {
            var self = this;
            var titleUrl;

            if (!self.loadingRelatedObjects) {
                self.loadingRelatedObjects = true;
                titleUrl = self.titleUrl;
                if (titleUrl && titleUrl.length > 0) {
                    titleUrl = encodeURI(titleUrl);
                    try {
                        if (titleUrl.charAt(0) === '#') {
                            titleUrl = titleUrl.substring(1);
                        }
                        var semanticObject = SemanticObjectsHandler.linkDetermination(titleUrl).done(function(links) {
                            if (!links) {
                                return;
                            }
                            if (!links.mainLink) {
                                self.title.setHref("#");
                                return;
                            } else {
                                var newTitleUrl = "#" + links.mainLink;
                                self.titleUrl = newTitleUrl;
                                self.title.setHref(newTitleUrl);
                            }
                            var relatedLink = links.relatedLink;
                            if (relatedLink) {
                                self.relatedObjects = relatedLink;
                                var relatedObjectsContainer = $(self.getDomRef()).find('.searchResultListItem-relatedObjectsContainer');
                                if (relatedObjectsContainer) {
                                    var displayFactSheetLink = encodeURI(relatedLink.link);
                                    self.relatedObjectsLink.setTooltip(relatedLink.text);
                                    self.relatedObjectsLink.setText(relatedLink.text);
                                    self.relatedObjectsLink.setHref("#" + displayFactSheetLink);
                                    self.relatedObjectsLink2.setTooltip(relatedLink.text);
                                    self.relatedObjectsLink2.setText(relatedLink.text);
                                    self.relatedObjectsLink2.setHref("#" + displayFactSheetLink);
                                    relatedObjectsContainer.css("display", "inline-block");
                                } else {
                                    self.rerender();
                                }
                            }
                        });
                    } catch (e) { /* Semantic Objects Handler cannot handle this URL */ }
                }
            }


            // re-render is triggered by event listener in SearchResultList
            var phoneSize = 767;
            var tabletSize = 1150;
            var windowWidth = $(window).width();
            if (windowWidth <= phoneSize) {
                titleUrl = self.titleUrl;
                if (titleUrl && titleUrl.length > 0) {
                    titleUrl = encodeURI(titleUrl);
                    $(self.getDomRef()).find(".searchResultListItem-left").bind('click', self.fireNavigate(titleUrl));
                }
            }

            //$('.searchResultListItemButton .searchResultListItemButtonContainer').attr('role', 'button');
            var $attributeValue = $('.searchResultListItem-attribute-value');
            $attributeValue.each(function() {
                if ($(this).prev().hasClass('searchResultListItem-attribute-label')) {
                    $(this).attr('aria-label', $(this).prev().text());
                }
            });

            // TODO use boldtagunescape like in highlighting for suggestions
            // allow <b> in title and attributes
            //            self.setSafeText(
            //                $(self.getDomRef())
            //                .find(".searchResultListItem-title, .searchResultListItem-attribute-value, .searchResultListItem-type"));
        },





        // ===================================================================
        // Some Helper Functions
        // ===================================================================

        isDesktopSize: function() {
            var windowWidth = $(window).width();
            if (!(this.isTabletSize() || this.isPhoneSize())) {
                return true;
            }
            return false;
        },

        isTabletSize: function() {
            var windowWidth = $(window).width();
            if (windowWidth <= 1150 && !this.isPhoneSize()) { // @searchTabletSize
                return true;
            }
            return false;
        },

        isPhoneSize: function() {
            var windowWidth = $(window).width();
            if (windowWidth <= 767) { // @searchPhoneSize
                return true;
            }
            return false;
        },

        getNumberOfVisibleAttributes: function() {
            var self = this;
            if (!self._visibleAttributes) {
                var visibleAttributes = self.getVisibleAttributes();

                if (!self.isDesktopSize()) {
                    visibleAttributes = 3;
                }

                if (!self.isPhoneSize() && self.getImageUrl()) {
                    visibleAttributes--;
                }
                self._visibleAttributes = visibleAttributes;
            }
            return self._visibleAttributes;
        },

        resetPrecalculatedValues: function() {
            this._visibleAttributes = undefined;
        },






        // handler of  result list item left and image column
        // ===================================================================        
        fireNavigate: function(uri) {
            return function() {
                if (uri) {
                    //                	sap.ui.getCore().byId("shellOverlay").close();
                    window.location.href = uri;
                }
                //                else {
                //                	window.location.href = "/sap/bc/ui5_ui5/ui2/ushell/shells/abap/FioriLaunchpad.html?sap-client=111#SalesOrder-DisplayFactSheet?SalesOrder=27"
                //                }      		
            };

        },

        // allow <b> in title and attributes
        //        onAfterRendering: function() {
        //            var self = this;
        //            $(this.getDomRef()).find(".searchResultListItem-main").bind('click', self.fireNavigate(self.getTitleUrl()));
        //            this._setSafeText(
        //                $(this.getDomRef()).find(".searchResultListItem-title, .searchResultListItem-attribute-value, .searchResultListItem-type"));
        //        },


        forwardEllipsis: function(objs) {
            objs.each(function(i, d) {
                // recover bold tag with the help of text() in a safe way
                searchHelper.forwardEllipsis4Whyfound(d);
            });
        }

    });


})();

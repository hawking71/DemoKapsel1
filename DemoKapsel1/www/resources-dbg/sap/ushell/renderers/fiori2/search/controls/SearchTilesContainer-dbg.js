/* global jQuery, sap, console, my, window  */
(function() {
    "use strict";

    // =======================================================================
    // Import packages
    // =======================================================================
    jQuery.sap.require('sap.m.Button');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.controls.SearchTilesContainerKeyHandler');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.controls.SearchTileHighlighter');
    var KeyHandler = sap.ushell.renderers.fiori2.search.controls.SearchTilesContainerKeyHandler;
    var TileHighlighter = sap.ushell.renderers.fiori2.search.controls.SearchTileHighlighter;

    // =======================================================================
    // Tiles Container
    // =======================================================================
    sap.ui.core.Control.extend('sap.ushell.renderers.fiori2.search.controls.SearchTilesContainer', {

        // metadata
        // ===================================================================
        metadata: {
            properties: {
                'tiles': {
                    type: 'object',
                    multiple: true
                },
                'totalLength': {
                    type: 'int',
                    defaultValue: 0
                },
                'maxRows': {
                    type: 'int',
                    defaultValue: 1
                },
                'highlightTerms': {
                    type: 'string',
                    defaultValue: ''
                },
                'enableKeyHandler': {
                    type: 'boolean',
                    defaultValue: true
                },
                'tilesPerRow': { // read only
                    type: 'int',
                    defaultValue: 0
                },
                'numberTiles': { // read only
                    type: 'int',
                    defaultValue: 0
                },
                'renderStep': { // internal property 
                    type: "int",
                    defaultValue: 0
                }
            },
            events: {
                showMore: {}
            }
        },

        // constructor
        // ===================================================================                
        constructor: function() {
            sap.ui.core.Control.prototype.constructor.apply(this, arguments);
            this.oLpdService = sap.ushell.Container.getService("LaunchPage");
            if (this.getEnableKeyHandler()) {
                this.addEventDelegate(new KeyHandler(this));
            }
            this.tileHighlighter = new TileHighlighter();
        },

        // delayed rerender
        // ===================================================================        
        delayedRerender: function() {
            var self = this;
            setTimeout(function() {
                self.rerender();
            }, 0);
        },

        // renderer
        // ===================================================================        
        renderer: function(oRm, oControl) {

            var tiles = oControl.getTiles();
            if (!tiles || tiles.length === 0) {
                return;
            }

            oRm.write('<div');
            oRm.writeControlData(oControl);
            oRm.addClass('searchTileContainer');
            oRm.writeClasses();
            oRm.write('>');

            oControl.renderMatrix(oRm, oControl);

            oRm.write('</div>');
        },

        // render matrix
        // ===================================================================        
        renderMatrix: function(oRm, oControl) {
            if (oControl.getRenderStep() === 0) {
                // step 0: render single tile for calculation of tile width
                oControl.renderPlusTile(oRm, oControl);
            } else {
                // step 1: fill complete line with tiles
                oControl.renderTiles(oRm, oControl);
            }
        },

        // render plus tile
        // ===================================================================        
        renderPlusTile: function(oRm, oControl) {

            oRm.write('<div');
            oRm.addClass('searchTileWrapper');
            oRm.addClass('searchShowMoreTile');
            oRm.writeClasses();
            oRm.write('>');

            var button = new sap.m.Button({
                text: sap.ushell.resources.i18n.getText('showMoreApps'),
                //  styled: false,
                //  lite: true,
                tooltip: sap.ushell.resources.i18n.getText('showMoreApps'),
                press: function() {
                    oControl.fireShowMore();
                }
            });
            oRm.renderControl(button);

            oRm.write('</div>');

        },

        // render tiles
        // ===================================================================        
        renderTiles: function(oRm, oControl) {

            var tiles = oControl.getTiles();
            var showMore = false;
            var counter = 0;

            // calculate output length
            var outputLength = Math.min(tiles.length, oControl.getMaxRows() * oControl.getTilesPerRow());
            if (oControl.getTotalLength() > outputLength) {
                showMore = true;
                outputLength = Math.floor((outputLength + 1) / oControl.getTilesPerRow()) * oControl.getTilesPerRow();
            }

            // render tiles
            for (var i = 0; i < outputLength; i++) {
                counter++;
                if (i === outputLength - 1 && showMore) {
                    oControl.renderPlusTile(oRm, oControl);
                    break;
                }
                var tile = tiles[i];
                var tileView = oControl.oLpdService.getCatalogTileView(tile.tile);
                oControl.registerAfterRenderingForTile(tileView);
                oRm.write('<div');
                oRm.addClass('searchTileWrapper');
                oRm.writeClasses();
                oRm.writeAttribute("title", sap.ushell.resources.i18n.getText("launchTile_tooltip"));
                oRm.write('>');
                oRm.renderControl(tileView);
                oRm.write('</div>');
            }

            oControl.setNumberTiles(counter);

            oControl.tileHighlighter.setHighlightTerms(oControl.getHighlightTerms());

        },

        // after rendering for tiles
        // ===================================================================        
        registerAfterRenderingForTile: function(tileView) {
            var self = this;
            tileView.addEventDelegate({
                onAfterRendering: function() {
                    self.tileHighlighter.highlight(tileView);
                    tileView.getDomRef().children.item(0).setAttribute('tabindex', 0);
                }
            });
        },

        // after rendering
        // ===================================================================        
        onAfterRendering: function(oEvent) {
            var self = this;
            var tilesPerRow;
            if (this.getRenderStep() === 0) {
                // 1. after render step 0: calculate tiles per row
                tilesPerRow = self.calculateTilesPerRow();
                this.setProperty('tilesPerRow', tilesPerRow, true); // true = supress rerender
                this.setProperty('renderStep', 1); // triggers rerender
            } else {
                // 2. after render step 1             
                tilesPerRow = self.calculateTilesPerRow();
                if (tilesPerRow === this.getTilesPerRow() || tilesPerRow < 0) {
                    // 2.1 tiles per row not changed: stop further rendering iteration
                    // (tilesPerRow<0 -> error in calculation -> stop rendering in order to avoid endless loop)
                    this.setProperty('renderStep', 0, true); // true = supress rerender    
                } else {
                    // 2.2 tiles per row changed: trigger new rendering iteration
                    this.setProperty('renderStep', 0); // triggers rerender
                }
            }
            $('.searchTileWrapper .sapUshellTileBase').attr('role', 'button'); // app tile
            //$('.searchTileWrapper button').attr('role', 'button'); // plus tile
        },

        // highlight tile
        // ===================================================================        
        highlightTile: function(tileView) {
            this.tileHighlighter.highlight(tileView);
        },

        // get css property
        // ===================================================================        
        getCssProperty: function(jElement, property) {
            return parseInt(jElement.css(property), 10);
        },

        // calculate tile width
        // ===================================================================        
        calculateTilesPerRow: function() {

            var self = this;

            // calculate container content width
            var container = jQuery(this.getDomRef());
            var containerWidth = container.width();

            // calculate margin
            if (container.children.length === 0) {
                return -1;
            }
            var tileWrapper = jQuery(container.children().get(0));
            var marginLeft = self.getCssProperty(tileWrapper, 'margin-left');
            var marginRight = self.getCssProperty(tileWrapper, 'margin-right');
            var margin = marginLeft + marginRight;

            // calculate tile width
            var tileWidth = tileWrapper.outerWidth() + margin;

            // some space for focus border,...
            var someSpace = 4;

            // calculate number of tiles
            var tilesPerRow = Math.floor((containerWidth - someSpace) / tileWidth);
            return tilesPerRow;
        },

        // get number tiles per lines (dynamically from dom)
        // ===================================================================        
        getDynamicNumberTilesPerRow: function() {
            var container = this.getDomRef();
            var x = -1;
            var counter = 0;
            for (var i = 0; i < container.children.length; ++i) {
                var tileWrapper = container.children.item(i);
                if (tileWrapper.offsetLeft <= x) {
                    return counter;
                } {
                    counter++;
                    x = tileWrapper.offsetLeft;
                }
            }
            return counter;
        }

    });




})();

// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
(function(){"use strict";jQuery.sap.declare("sap.ushell.ui.tile.StaticTileRenderer");jQuery.sap.require("sap.ushell.ui.tile.TileBaseRenderer");sap.ushell.ui.tile.StaticTileRenderer=sap.ui.core.Renderer.extend(sap.ushell.ui.tile.TileBaseRenderer);sap.ushell.ui.tile.StaticTileRenderer.renderPart=function(r,c){r.write("<span");r.addClass("sapUshellStaticTile");r.writeClasses();r.write(">");r.write("</span>");};}());

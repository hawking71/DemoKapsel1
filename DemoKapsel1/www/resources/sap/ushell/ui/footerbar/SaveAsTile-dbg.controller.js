/**
 * Created by I305848 on 28/12/2014.
 */
sap.ui.controller("sap.ushell.ui.footerbar.SaveAsTile", {
	onExit: function() {
        var oView = this.getView();
        var oTileView = oView.getTileView();
        oTileView.destroy();
	}
});
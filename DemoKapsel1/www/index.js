var devapp = {
	smpInfo : {},
	
    //Application Constructor
    initialize : function() {
        this.bindEvents();
    },

	//========================================================================
	// Bind Event Listeners
	//========================================================================
     bindEvents : function() {
        //add an event listener for the Cordova deviceReady event.
        document.addEventListener("deviceready", this.onDeviceReady, false);
    },

	
    //========================================================================
    //Cordova Device Ready
    //========================================================================
     onDeviceReady: function () {
         //this is a comment, just to test git commit
         startApp();
         //devapp.smpInfo.server = "hcpms-i063065trial.hanatrial.ondemand.com";
         //devapp.smpInfo.port = 443;
         //devapp.smpInfo.appID = "com.sap.kapseldemo1";
         //var context = {
         //    "serverHost": devapp.smpInfo.server,
         //    "https": "true",
         //    "serverPort": devapp.smpInfo.port
         //};
         //doLogonInit(context, devapp.smpInfo.appID);

/*     	$.getJSON(".project.json", function(data) {
			if (data && data.hybrid && data.hybrid.plugins.kapsel.logon.selected) {
				devapp.smpInfo.server = data.hybrid.msType === 0 ? data.hybrid.hcpmsServer : data.hybrid.server;
				devapp.smpInfo.port = data.hybrid.msType === 0 ? "443" : data.hybrid.port;
				devapp.smpInfo.appID = data.hybrid.appid;
			}
    		
			if (devapp.smpInfo.server && devapp.smpInfo.server.length > 0) {
				var context = {
					"serverHost" : devapp.smpInfo.server,
					"https" : data.hybrid.msType === 0 ? "true" : "false",
					"serverPort" : devapp.smpInfo.port
				};
				doLogonInit(context, devapp.smpInfo.appID);
			} else {
				startApp();
			}
    	});
*/
    }
};
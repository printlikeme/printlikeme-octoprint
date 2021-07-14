/*
 * View model for OctoPrint-PrintLike.me
 *
 * Author: PrintLike.me
 * License: Apache-2.0
 */
$(function() {
    function PrintlikemeViewModel(parameters) {
        var self = this;

		self.settingsViewModel = parameters[0];
		self.isLoggedIn = ko.observable(false);
		self.requestResult = ko.observable(false);
		self.requestResultMessage = ko.observable();


		self.login = function(formElement) {
			self.requestResult(false);
			
			$.ajax({
				url: self.settingsViewModel.settings.plugins.printlikeme.api_url() + "/user/me/sessions",
				type: "post",
				dataType: "json",
				headers: {
					"X-App-Key": self.settingsViewModel.settings.plugins.printlikeme.api_token()
				},
				data: JSON.stringify({email: $("#email").val(), password: $("#password").val() }),
				contentType: "application/json",
				success: function(response) {
					console.log(response.token);
					self.settingsViewModel.settings.plugins.printlikeme.user_key(response.token);
					self.settingsViewModel.settings.plugins.printlikeme.user_email($("#email").val());
					self.settingsViewModel.saveData();
					self.isLoggedIn(true);
					
					$("#email").val("");
					$("#password").val("");
				},
				error: function(response) {
					self.requestResult(true);
					try {
						var res = $.parseJSON(response.responseText);
						if (res['message'])
							self.requestResultMessage(res["message"]);
						else
							self.requestResultMessage("Unknown error happened");
					} catch (e) {
						self.requestResultMessage("Unable to send request to the PrintLike.me server");
					}
				}
			});
		};
		
		self.logout = function(formElement) {
			self.requestResult(false);
			self.settingsViewModel.settings.plugins.printlikeme.user_key(null);
			self.settingsViewModel.settings.plugins.printlikeme.user_email(null);
			self.settingsViewModel.saveData();
			self.isLoggedIn(false);
		};
		
		self.onBeforeBinding = function() {
			if (self.settingsViewModel.settings.plugins.printlikeme.user_key() !== null){
				self.isLoggedIn(true);
			}
        };
    }


    OCTOPRINT_VIEWMODELS.push({
        construct: PrintlikemeViewModel,
        dependencies: [ "settingsViewModel" ],
        elements: [ "#settings_plugin_printlikeme" ]
    });
});

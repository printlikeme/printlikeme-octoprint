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
		
		self.userName = ko.observable();
		self.userLimits = ko.observable();

		self.errorHandler = function(response) {
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
	

		self.login = function(formElement) {
			self.requestResult(false);
			
			$.ajax({
				url: self.data.api_url() + "/user/me/sessions",
				type: "post",
				dataType: "json",
				headers: {
					"X-App-Key": self.data.api_token()
				},
				data: JSON.stringify({email: $("#email").val(), password: $("#password").val() }),
				contentType: "application/json",
				success: function(response) {
					console.log(response.token);
					self.data.user_key(response.token);
					self.settingsViewModel.saveData();
					self.isLoggedIn(true);
					self.onSettingsShown();
					
					$("#email").val("");
					$("#password").val("");
				},
				error: self.errorHandler
			});
		};
		
		self.logout = function(formElement) {
			$.ajax({
				url: self.data.api_url() + "/user/me/sessions",
				type: "delete",
				dataType: "json",
				headers: {
					"X-App-Key": self.data.api_token(),
					"Authorization": "Bearer " + self.data.user_key()
				},
				contentType: "application/json",
				complete: function(response) {
					// Resetting account information regardless of the request result. If it fails - so be it.
					self.requestResult(false);
					self.data.user_key(null);
					self.settingsViewModel.saveData();
					self.isLoggedIn(false);
					self.userName("");
					self.userLimits("");
				},
			});
		};
		
		
		self.onSettingsShown = function() {
			if (self.isLoggedIn()) {
				$.ajax({
					url: self.data.api_url() + "/user/me",
					type: "get",
					dataType: "json",
					headers: {
						"X-App-Key": self.data.api_token(),
						"Authorization": "Bearer " + self.data.user_key()
					},
					success: function(user) {
						self.userName(' as <a href="https://printlike.me/u/' + user["user_name"] + '/projects" target="_blank">' + user["user_name"] + '</a>');
					},
					error: self.errorHandler
				});
				
				$.ajax({
					url: self.data.api_url() + "/user/me/limits",
					type: "get",
					dataType: "json",
					headers: {
						"X-App-Key": self.data.api_token(),
						"Authorization": "Bearer " + self.data.user_key()
					},
					success: function(limits) {
						self.userLimits('Prints created: <b>' + limits['used_prints'] + '</b> (of <b>' + limits['prints'] + '</b> available)');
					},
					error: self.errorHandler
				});
			}
		}
		
		self.onBeforeBinding = function() {
			self.data = self.settingsViewModel.settings.plugins.printlikeme;
			if (self.data.user_key() !== null){
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

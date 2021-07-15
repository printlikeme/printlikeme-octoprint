# coding=utf-8
from __future__ import absolute_import

import octoprint.plugin
from octoprint.events import Events

class PrintlikemePlugin(octoprint.plugin.SettingsPlugin,
    octoprint.plugin.AssetPlugin,
    octoprint.plugin.TemplatePlugin,
):

    ##~~ SettingsPlugin mixin


    def get_settings_defaults(self):
        return dict(
            api_url="http://127.0.0.1:8000/api/v1",
            # this identifies octoprint plugin client, don't reuse the token for different purposes as it might
            # be disabled with new plugin version release
            api_token="Q5Vjqs5f.CTiVVB5xBuosqkt3Rfx8Zt3xzp51zIIZ",
            user_key=None,
        )

    def get_settings_restricted_paths(self):
        return dict(admin=[["api_url"], ["api_token"], ["user_key"], ],
                    user=[[], ],
                    never=[[], ])

    ##~~ AssetPlugin mixin

    def get_assets(self):
        return {
            "js": ["js/printlikeme.js"],
            "css": ["css/printlikeme.css"],
            "less": ["less/printlikeme.less"]
        }

    ##~~ Softwareupdate hook

    def get_update_information(self):
        return {
            "printlikeme": {
                "displayName": "Printlikeme Plugin",
                "displayVersion": self._plugin_version,

                # version check: github repository
                "type": "github_release",
                "user": "printlikeme",
                "repo": "printlikeme-octoprint",
                "current": self._plugin_version,

                # update method: pip
                "pip": "https://github.com/printlikeme/printlikeme-octoprint/archive/{target_version}.zip",
            }
        }

    ##~~ TemplatePlugin mixin

    def get_template_configs(self):
        return [
            dict(type="settings", name='PrintLike.me', custom_bindings=True)
        ]

    ##~~ EventHandler Plugin

    def on_event(self, event, payload):
        if event == Events.PRINT_STARTED:
            self._logger.info("print started")


__plugin_name__ = "PrintLike.me Plugin"

__plugin_pythoncompat__ = ">=3,<4" # only python 3

def __plugin_load__():
    global __plugin_implementation__
    __plugin_implementation__ = PrintlikemePlugin()

    global __plugin_hooks__
    __plugin_hooks__ = {
        "octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information
    }

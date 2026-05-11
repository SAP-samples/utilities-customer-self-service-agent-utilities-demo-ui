/* eslint-disable guard-for-in */
/* eslint-disable quotes */
sap.ui.define(["com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/Formatter"],
    function (Formatter) {
        "use strict";
        class Device extends Formatter {
            static toUI5Card(message) {
                const device = Device.parse(message.content);
                return [{
                    "sap.card": {
                        type: "Object",
                        extension: "controller/UI5CardExtension",
                        header: {
                            icon: {
                                src: "sap-icon://it-instance"
                            },
                            title: Device.I18n.label("DeviceNumber"),
                            subTitle: device.deviceID || Device.I18n.label("NA"),
                            actions: [
                                {
                                    type: "Custom",
                                    parameters: {
                                        method: "postMessage",
                                        text: device.deviceID
                                    }
                                }
                            ]
                        }
                    }
                }]
            }
        }
        return Device;
    }
);
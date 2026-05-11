/* eslint-disable guard-for-in */
/* eslint-disable quotes */
sap.ui.define(["com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/Formatter"],
    function (Formatter) {
        "use strict";
        class GenericalCard extends Formatter {
            static toUI5Card(message) {
                const genericalData = GenericalCard.parse(message.content);
                let aGenericalData = [];
                if (Array.isArray(genericalData)) {
                    aGenericalData = genericalData;
                } else {
                    aGenericalData.push(genericalData);
                }
                return aGenericalData.map((p, index) => {
                    const icon = "sap-icon://ai"
                    return {
                        "sap.card": {
                            type: "Object",
                            extension: "controller/UI5CardExtension",
                            header: {
                                icon: {
                                    src: icon
                                },
                                title: p.value || GenericalCard.I18n.label('NA'),
                                actions: [
                                    {
                                        type: "Custom",
                                        parameters: {
                                            method: "postMessage",
                                            text: p.value
                                        }
                                    }
                                ]
                            }
                        }
                    }
                });
            }
        }
        return GenericalCard;
    }
);
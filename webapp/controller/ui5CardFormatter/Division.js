/* eslint-disable guard-for-in */
/* eslint-disable quotes */
sap.ui.define(["com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/Formatter"],
    function (Formatter) {
        "use strict";
        class Division extends Formatter {
            static toUI5Card(message) {
                const division = Division.parse(message.content);
                return [{
                    "sap.card": {
                        type: "Object",
                        extension: "controller/UI5CardExtension",
                        header: {
                            icon: {
                                src: Division.determineContractTypeIcon(division.division)
                            },
                            title: Division.I18n.label("ServiceType"),
                            subTitle: division.divisionText || Division.I18n.label("NA"),
                            actions: [
                                {
                                    type: "Custom",
                                    parameters: {
                                        method: "postMessage",
                                        text: division.divisionText
                                    }
                                }
                            ]
                        }
                    }
                }]
            }
        }
        return Division;
    }
);
/* eslint-disable guard-for-in */
/* eslint-disable quotes */
sap.ui.define(["com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/Formatter"],
    function (Formatter) {
        "use strict";
        class ServiceRequest extends Formatter {
            static toUI5Card(message) {
                console.log(message.content);
                const icon = 'sap-icon://multiselect-all'
                return [{
                    "sap.card": {
                        type: "Object",
                        extension: "controller/UI5CardExtension",
                        header: {
                            icon: {
                                src: icon
                            },
                            title: ServiceRequest.I18n.label('ServiceRequest')
                        },
                        content: {
                            groups: [
                                {
                                    items: [
                                        {
                                            label: ServiceRequest.I18n.label('ReferenceNo'),
                                            value: JSON.parse(message.content).referenceNo || ServiceRequest.I18n.label('NA') 
                                        },
                                        {
                                            label: ServiceRequest.I18n.label('premiseNo'),
                                            value: JSON.parse(message.content).premiseNo || ServiceRequest.I18n.label('NA') 
                                        },
                                        {
                                            label: ServiceRequest.I18n.label('totalAmount'),
                                            value: JSON.parse(message.content).totalAmount || ServiceRequest.I18n.label('NA') 
                                        }
                                    ]
                                }
                            ]
                        },
                    }
                }]
            }
        }
        return ServiceRequest;
    }
);
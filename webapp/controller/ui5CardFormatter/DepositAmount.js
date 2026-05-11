/* eslint-disable guard-for-in */
/* eslint-disable quotes */
sap.ui.define(["com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/Formatter"],
    function (Formatter) {
        "use strict";
        class DepositAmount extends Formatter {
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
                            title: DepositAmount.I18n.label('PaymentDetails')
                        },
                        content: {
                            groups: [
                                {
                                    title: DepositAmount.I18n.label('DataDetails'),
                                    items: [
                                        {
                                            label: DepositAmount.I18n.label('BusinessPartnerID'),
                                            value: JSON.parse(message.content).BusinessPartnerID || DepositAmount.I18n.label('NA') + JSON.parse(message.content).currency || DepositAmount.I18n.label('NA')
                                        },
                                        {
                                            label: DepositAmount.I18n.label('customerName'),
                                            value: JSON.parse(message.content).customerName || DepositAmount.I18n.label('NA') + JSON.parse(message.content).currency || DepositAmount.I18n.label('NA')
                                        },
                                        {
                                            label: DepositAmount.I18n.label('securityDeposit'),
                                            value: JSON.parse(message.content).securityDeposit || DepositAmount.I18n.label('NA') + JSON.parse(message.content).currency || DepositAmount.I18n.label('NA')
                                        },
                                        {
                                            label: DepositAmount.I18n.label('reconnection'),
                                            value: JSON.parse(message.content).reconnection || DepositAmount.I18n.label('NA') + JSON.parse(message.content).currency || DepositAmount.I18n.label('NA')
                                        },
                                        {
                                            label: DepositAmount.I18n.label('addressRegistration'),
                                            value: JSON.parse(message.content).addressRegistration || DepositAmount.I18n.label('NA') + JSON.parse(message.content).currency || DepositAmount.I18n.label('NA')
                                        },
                                        {
                                            label: DepositAmount.I18n.label('knowledgeAndInnovationFee'),
                                            value: JSON.parse(message.content).knowledgeAndInnovationFee || DepositAmount.I18n.label('NA') + JSON.parse(message.content).currency || DepositAmount.I18n.label('NA')
                                        }
                                    ],
                                    // items: Object.entries(JSON.parse(message.content)).map(([key, value]) => ({
                                    //     label: key,
                                    //     value: value || DepositAmount.I18n.label('NA')
                                    // })),
                                }
                            ]
                        },
                    },
                    "dssa.card.buttons": [
                        {
                            label: DepositAmount.I18n.label("PayDirectly"),
                            press: {
                                message: DepositAmount.I18n.label("PayDirectly")
                            }
                        },
                        {
                            label: DepositAmount.I18n.label("PayUsingOtherChannels"),
                            press: {
                                message: DepositAmount.I18n.label("PayUsingOtherChannels")
                            }
                        }
                    ]
                }]
            }
        }
        return DepositAmount;
    }
);
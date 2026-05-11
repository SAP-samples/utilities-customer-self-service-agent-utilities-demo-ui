/* eslint-disable guard-for-in */
/* eslint-disable quotes */
sap.ui.define(["com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/Formatter"],
    function (Formatter) {
        "use strict";
        class DataReviewForSalesOrder extends Formatter {
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
                            title: DataReviewForSalesOrder.I18n.label('DataReview')
                        },
                        content: {
                            groups: [
                                {
                                    title: DataReviewForSalesOrder.I18n.label('DataDetails'),
                                    items: Object.entries(JSON.parse(message.content)).map(([key, value]) => ({
                                        label: key,
                                        value: value || DataReviewForSalesOrder.I18n.label('NA')
                                    })),
                                }
                            ]
                        },
                    },
                    "dssa.card.buttons": [
                        {
                            label: DataReviewForSalesOrder.I18n.label("Confirm"),
                            press: {
                                message: DataReviewForSalesOrder.I18n.label("AllCorrect")
                            }
                        },
                        {
                            label: DataReviewForSalesOrder.I18n.label("SomethingIsIncorrect"),
                            press: {
                                message: DataReviewForSalesOrder.I18n.label("SomethingIsIncorrectMessage")
                            }
                        }
                    ]
                }]
            }
        }
        return DataReviewForSalesOrder;
    }
);
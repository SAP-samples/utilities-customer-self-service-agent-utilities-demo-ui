/* eslint-disable guard-for-in */
/* eslint-disable quotes */
sap.ui.define(["com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/Formatter"],
    function (Formatter) {
        "use strict";
        class SwitchSupplierInfoReview extends Formatter {
            static toUI5Card(message) {
                const switchSupplierInfoReview = SwitchSupplierInfoReview.parse(message.content);
                let aSwitchSupplierInfoReviews = [];
                if (Array.isArray(switchSupplierInfoReview)) {
                    aSwitchSupplierInfoReviews = switchSupplierInfoReview;
                } else {
                    aSwitchSupplierInfoReviews.push(switchSupplierInfoReview);
                }
                return aSwitchSupplierInfoReviews.map(s => {
                    const icon = 'sap-icon://multiselect-all'
                    return {
                        "sap.card": {
                            type: "Object",
                            extension: "controller/UI5CardExtension",
                            header: {
                                icon: {
                                    src: icon
                                },
                                title: SwitchSupplierInfoReview.I18n.label('DataReview')
                            },
                            content: {
                                groups: [
                                    {
                                        title: SwitchSupplierInfoReview.I18n.label('DataDetails'),
                                        items: [
                                            {
                                                label: 'Product',
                                                value: s.productDescription || SwitchSupplierInfoReview.I18n.label('NA')
                                            },
                                            {
                                                label: 'Premise Address',
                                                value: s.premiseAddress || SwitchSupplierInfoReview.I18n.label('NA')
                                            },
                                            {
                                                label: 'Meter ID',
                                                value: s.meterID || SwitchSupplierInfoReview.I18n.label('NA')
                                            },
                                            {
                                                label: 'Start of Supply Date',
                                                value: s.startDate || SwitchSupplierInfoReview.I18n.label('NA')
                                            }
                                        ]
                                    }
                                ]
                            },
                        },
                        "dssa.card.buttons": [
                            {
                                label: SwitchSupplierInfoReview.I18n.label("Confirm"),
                                press: {
                                    message: SwitchSupplierInfoReview.I18n.label("AllCorrect")
                                }
                            },
                            {
                                label: SwitchSupplierInfoReview.I18n.label("SomethingIsIncorrect"),
                                press: {
                                    message: SwitchSupplierInfoReview.I18n.label("SomethingIsIncorrectMessage")
                                }
                            }
                        ]
                    }
                });
            }
        }
        return SwitchSupplierInfoReview;
    }
);
/* eslint-disable guard-for-in */
/* eslint-disable quotes */
sap.ui.define(["com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/Formatter"],
    function (Formatter) {
        "use strict";
        class Premises4SWT extends Formatter {
            static toUI5Card(message) {
                const premise = Premises4SWT.parse(message.content);
                let aPremises = [];
                if (Array.isArray(premise)) {
                    aPremises = premise;
                } else {
                    aPremises.push(premise);
                }
                return aPremises.map((p, idx) => {
                    const icon = Premises4SWT.determinePremiseTypeIcon(p.premiseTypeDescription)
                    return {
                        "sap.card": {
                            type: "Object",
                            extension: "controller/UI5CardExtension",
                            header: {
                                icon: {
                                    src: icon
                                },
                                title: p.premiseTypeDescription || Premises4SWT.I18n.label('NA'),
                                subTitle: `${p.shortForm}`,
                                actions: [
                                    {
                                        type: "Custom",
                                        parameters: {
                                            method: "postMessage",
                                            text: Premises4SWT.I18n.label('ZipCodeAndPremise', [p.postalCode, p.shortForm])
                                        }
                                    }
                                ]
                            },
                            content: {
                                groups: [
                                    {
                                        title: Premises4SWT.I18n.label('PremiseDetails'),
                                        items: [
                                            {
                                                label: Premises4SWT.I18n.label('City'),
                                                value: p.city || Premises4SWT.I18n.label('NA')
                                            },
                                            {
                                                label: Premises4SWT.I18n.label('Address'),
                                                value: p.shortForm || Premises4SWT.I18n.label('NA')
                                            }
                                        ]
                                    }
                                ]
                            }
                        },
                        // when there is only one premise, we show buttons to confirm or reject it
                        // when there are multiple premises, users either click on the card header to select one premise
                        // or click on the button to reject all premises
                        "dssa.card.buttons":
                            aPremises.length === 1 ? [
                                {
                                    label: Premises4SWT.I18n.label("YesThisPremise"),
                                    press: {
                                        message: Premises4SWT.I18n.label("YesThisPremise2")
                                    }
                                }
                            ] : idx + 1 === aPremises.length ? [
                            ] : []

                    }
                });
            }
        }
        return Premises4SWT;
    }
);
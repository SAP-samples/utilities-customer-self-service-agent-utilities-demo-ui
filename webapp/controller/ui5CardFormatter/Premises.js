/* eslint-disable guard-for-in */
/* eslint-disable quotes */
sap.ui.define(["com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/Formatter"],
    function (Formatter) {
        "use strict";
        class Premises extends Formatter {
            static toUI5Card(message) {
                const premise = Premises.parse(message.content);
                let aPremises = [];
                if (Array.isArray(premise)) {
                    aPremises = premise;
                } else {
                    aPremises.push(premise);
                }
                return aPremises.map((p, index) => {
                    const icon = Premises.determinePremiseTypeIcon(p.premiseTypeDescription)
                    return {
                        "sap.card": {
                            type: "Object",
                            extension: "controller/UI5CardExtension",
                            header: {
                                icon: {
                                    src: icon
                                },
                                title: p.premiseTypeDescription || Premises.I18n.label('NA'),
                                subTitle: `${p.shortForm}`,
                                actions: [
                                    {
                                        type: "Custom",
                                        parameters: {
                                            method: "postMessage",
                                            text: Premises.#determinePostMessage(aPremises, index)
                                        }
                                    }
                                ]
                            }
                        }
                    }
                });
            }

            /**
             * For given premises, determine the text to be posted to the chat
             * For the given premise with index, if there is any same shortForm value in the array(except itself),
             * return the corresponding post message as shortForm + premiseID
             * otherwise return the shortForm only
             * @param {*} aPremises given premises
             * @param {*} index index of the premise in the array
             */
            static #determinePostMessage(aPremises, index) {
                const premise = aPremises[index];
                const sameShortForm = aPremises.find((p, idx) => p.shortForm === premise.shortForm && idx !== index);
                if (sameShortForm) {
                    return `${premise.shortForm} (ID: ${premise.premiseID})`;
                }
                return premise.shortForm;
            }

        }
        return Premises;
    }
);
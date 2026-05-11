/* eslint-disable guard-for-in */
/* eslint-disable quotes */
sap.ui.define(["com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/Formatter"],
    function (Formatter) {
        "use strict";
        class ContractAccount extends Formatter {
            static toUI5Card(message) {
                const account = ContractAccount.parse(message.content);
                return [{
                    "sap.card": {
                        type: "Object",
                        extension: "controller/UI5CardExtension",
                        header: {
                            title: `${ContractAccount.I18n.label("ContractAccount")} #${account.contractAccountID}`,
                            subTitle: account.description || ContractAccount.I18n.label("NA"),
                            actions: [
                                {
                                    type: "Custom",
                                    parameters: {
                                        method: "postMessage",
                                        text: account.contractAccountID
                                    }
                                }
                            ]
                        }
                    },
                    "dssa.style.class": "dssaUI5CardContractAccount"  // to apply dedicated CSS styles for contract account cards
                }]
            }
        }
        return ContractAccount;
    }
);
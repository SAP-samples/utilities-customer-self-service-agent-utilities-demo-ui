/* eslint-disable no-param-reassign */
/* eslint-disable guard-for-in */
/* eslint-disable quotes */
sap.ui.define(["com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/Formatter", "sap/base/i18n/Localization"],
    function (Formatter, Localization) {
        "use strict";
        class PaymentInformation extends Formatter {
            static toUI5Card(message) {
                let content = message.content;
                if (typeof content === "string") {
                    try {
                        content = JSON.parse(content);
                    } catch (e) {
                        throw new Error("PaymentInformation: message.content is not valid JSON");
                    }
                }
                // Support both array and {data: array} structure
                let paymentInformation;
                if (Array.isArray(content)) {
                    paymentInformation = content[0];
                } else if (content && Array.isArray(content.data)) {
                    paymentInformation = content.data[0];
                } else {
                    throw new Error("PaymentInformation: content is not an array or does not have a data array");
                }
                return PaymentInformation.#getCard(paymentInformation, paymentInformation.contractAccountID);
            }

            static displayProperties = [
                // payment card properies
                "cardholder", "cardNumber", "paymentCardType", "issuer",
                // bank account properties
                 "accountHolder",  "iBAN", "bank", 
            ]
            // Returns a cards with multiple groups
            static #getCard(info, contractAccountID) {
                // sort info (OutgoingBankAccount, IncomingBankAccount, OutgoingPaymentCard, IncomingPaymentCard, AlternativePayer, AlternativePayee)
                let card = {
                    'sap.card': {
                        type: 'Object',
                        header: {
                            title: PaymentInformation.I18n.label("PaymentInformation"),
                            subTitle: `${PaymentInformation.I18n.label("ContractAccount")}: ${contractAccountID || PaymentInformation.I18n.label("NA")}`
                        },
                        content: {
                            groups: []
                        }
                    }
                };
                if (info && typeof info === 'object') {
                    const groupOrder = [
                        "incomingBankAccount","incomingPaymentCard",
                        "outgoingBankAccount","outgoingPaymentCard", 
                        "incomingAlternativePayerBankAccount","incomingAlternativePayerPaymentCard",
                        "outgoingAlternativePayeeBankAccount","outgoingAlternativePayeePaymentCard"
                    ];
                    const keys = Object.keys(info);
                    const sortedKeys = groupOrder.filter(k => keys.includes(k)).concat(
                        keys.filter(k => !groupOrder.includes(k))
                    );
                    for (const key of sortedKeys) {
                        if (Object.prototype.hasOwnProperty.call(info, key)) {
                            if (info[key] && typeof info[key] === 'object') {
                                const items = this.#getItems(info[key])
                                card["sap.card"].content.groups.push({ 
                                    title: PaymentInformation.I18n.label(this.#toUpperFirstChar(key)),
                                    subtitle: PaymentInformation.I18n.label(this.#toUpperFirstChar(key)),
                                    titleMaxLines: 2,
                                    items: items
                                })
                            }
                        }
                    }
                }
                return [ card ];
            }

            static #toUpperFirstChar(str) {
                if (!str || typeof str !== 'string') return str;
                return str.charAt(0).toUpperCase() + str.slice(1);
            }

            // Returns an icon URI or name based on the group key
            static #getIconForKey(keyUC) {
                // Example mapping, adjust as needed for your icons
                const iconMap = {
                    Cardholder: "sap-icon://account",
                    AccountHolder: "sap-icon://account",
                    PaymentCardType: "sap-icon://credit-card",
                    Issuer: "sap-icon://official-service",
                    Bank: "sap-icon://official-service",
                    Iban: "sap-icon://number-sign",
                    CardNumber: "sap-icon://number-sign"
                };
                return iconMap[keyUC] || "sap-icon://hint";
            }

            static #getItems(info) {
                const items = [];
                // Only process keys in the order given in displayProperties
                for (const prop of PaymentInformation.displayProperties) {
                    // Find the actual key in info (case-insensitive match)
                    const key = Object.keys(info).find(k => k.toLowerCase() === prop.toLowerCase());
                    if (key) {
                        let value;
                        if (key === "bank" && typeof info[key] === 'object') {
                            value = info[key].name || PaymentInformation.I18n.label("NA");
                        } else {
                            value = info[key] || PaymentInformation.I18n.label("NA");
                        }
                        const icon = PaymentInformation.#getIconForKey(this.#toUpperFirstChar(key));
                        items.push({
                            label: `${PaymentInformation.I18n.label(this.#toUpperFirstChar(key))}`,
                            value: value,
                            icon: { src: icon },
                            wrap: false
                        });
                    }                      
                }
                return items;
            }
        }
        return PaymentInformation;
    }
);

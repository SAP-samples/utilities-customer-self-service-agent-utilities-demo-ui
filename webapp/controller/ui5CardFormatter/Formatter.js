/* eslint-disable guard-for-in */
sap.ui.define(["sap/base/i18n/Localization", "com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/FormatterNameMapping"],
    function (Localization, FormatterNameMapping) {
        "use strict";
        class Formatter {
            static I18n = null;
            static init(oResourceBundle) {
                Formatter.I18n = {
                    label: function () {
                        return oResourceBundle.getText.apply(oResourceBundle, arguments);
                    }
                };
            }
            static premiseTypePatterns = {
                home: { regex: /\b(home|house|residence|villa|cottage|bungalow)\b/i, icon: "sap-icon://home" },
                apartment: { regex: /\b(apartment|flat|condo|unit)\b/i, icon: "sap-icon://building" },
                office: { regex: /\b(office|workspace|workplace)\b/i, icon: "sap-icon://building" },
                store: { regex: /\b(store|shop|market|retail)\b/i, icon: "sap-icon://retail-store" },
                factory: { regex: /\b(factory|plant|manufacturing|mill)\b/i, icon: "sap-icon://factory" }
            }
            static determinePremiseTypeIcon(premiseTypeDescription) {
                if (!premiseTypeDescription) {
                    return "sap-icon://building"
                }
                const normalizedDescription = premiseTypeDescription.toLowerCase()
                for (const premiseType in Formatter.premiseTypePatterns) {
                    const { regex, icon } = Formatter.premiseTypePatterns[premiseType]
                    if (regex.test(normalizedDescription)) {
                        return icon
                    }
                }
                return "sap-icon://building"
            }
            static ServiceType = {
                ELECTRICITY: "01",
                GAS: "02",
                WATER: "03"
            }
            static mapDivisionToService(division) {
                switch (division) {
                    case Formatter.ServiceType.ELECTRICITY:
                        return Formatter.I18n.label("Electricity")
                    case Formatter.ServiceType.GAS:
                        return Formatter.I18n.label("Gas")
                    case Formatter.ServiceType.WATER:
                        return Formatter.I18n.label("Water")
                    default:
                        throw new Error(`Division ${division} not found`)
                }
            }
            static determineContractTypeIcon(divisionID) {
                switch (divisionID) {
                    case Formatter.ServiceType.ELECTRICITY:
                        return 'sap-icon://crossed-line-chart';
                    case Formatter.ServiceType.GAS:
                        return 'sap-icon://mileage';
                    case Formatter.ServiceType.WATER:
                        return 'sap-icon://horizontal-waterfall-chart';
                    default:
                        return '';
                }
            }
            static formatUnit(unit) {
                const unitLower = unit?.toLowerCase()
                switch (unitLower) {
                    case "kwh":
                        return "kWh"
                    case "m3":
                        return "m³"
                    default:
                        return unit
                }
            }
            static #formatters = {}
            static async getFormatter(sType) {
                let sFormatterName = "Formatter";
                if (sType) {
                    sFormatterName = FormatterNameMapping.get(sType) || `${sType[0].toUpperCase()}${sType.slice(1)}`;
                }

                if (Formatter.#formatters[sFormatterName]) {
                    return Formatter.#formatters[sFormatterName];
                }
                return new Promise((resolve, reject) => {
                    sap.ui.require([`com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/${sFormatterName}`], function (oFormatter) {
                        if (oFormatter) {
                            Formatter.#formatters[sFormatterName] = oFormatter;
                            resolve(oFormatter);
                        } else {
                            reject(new Error(`Formatter for type ${sType} not found.`));
                        }
                    }, function (error) {
                        reject(error);
                    });
                });
            }
            static async generateManifest(oMessage) {
                const oFormatter = await this.getFormatter(oMessage.type);
                if (oFormatter) {
                    return oFormatter.toUI5Card(oMessage);
                } else {
                    console.error(`Formatter for type ${oMessage.type} not found.`);
                    return null;
                }
            }
            static parse(oMessage) {
                if (typeof oMessage === "string") {
                    try {
                        return JSON.parse(oMessage);
                    } catch (e) {
                        console.error(`Failed to parse message content: ${e.message}`);
                        return null;
                    }
                } else if (typeof oMessage === "object") {
                    return oMessage;
                } else {
                    console.warn(`Unsupported content type: ${typeof oMessage}`);
                    return null;
                }
            }
            /**
             * Basic method that return card manifest. Just returns the message content, which is expected to be a valid UI5 card manifest.
             * This method should be overridden by specific formatters.
             * @param {Object} oMessage - The message object.
             * @returns {Object} - The UI5 card manifest.
             */
            static toUI5Card(oMessage) {
                const content = Formatter.parse(oMessage.content);
                return [
                    content
                ]
            }
            static formatAmount(value, digit = 2) {
                const options = {
                    minimumFractionDigits: digit,
                    maximumFractionDigits: digit,
                    style: "decimal"
                };
                if (value === undefined || value === null) {
                    return "";
                }
                const numericValue = parseFloat(value);
                if (isNaN(numericValue)) {
                    return value; // return original value if it's not a number
                }
                return numericValue.toLocaleString(Localization.getLanguage() || "en-US", options);
            }
        }
        return Formatter;
    }
);

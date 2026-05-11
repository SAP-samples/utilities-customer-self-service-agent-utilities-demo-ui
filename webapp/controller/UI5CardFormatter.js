sap.ui.define(["com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/Formatter"],
    function (Formatter) {
        "use strict";
        const formatters = {};
        return {
            init: function (oResourceBundle) {
                Formatter.init(oResourceBundle);
            },
            getFormatter: async function (sType) {
                const sFormatterName = `${sType[0].toUpperCase()}${sType.slice(1)}`;
                if (formatters[sFormatterName]) {
                    return formatters[sFormatterName];
                }
                return new Promise((resolve, reject) => {
                    sap.ui.require([`com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/${sFormatterName}`], function (oFormatter) {
                        if (oFormatter) {
                            formatters[sFormatterName] = oFormatter;
                            resolve(oFormatter);
                        } else {
                            reject(new Error(`Formatter for type ${sType} not found.`));
                        }
                    }, function (error) {
                        reject(error);
                    });
                });
            },
            generateManifest: async function (oMessage) {
                const oFormatter = await this.getFormatter(oMessage.type);
                if (oFormatter) {
                    return oFormatter.toUI5Card(oMessage);
                } else {
                    console.error(`Formatter for type ${oMessage.type} not found.`);
                    return null;
                }
            }
        }
    }
);
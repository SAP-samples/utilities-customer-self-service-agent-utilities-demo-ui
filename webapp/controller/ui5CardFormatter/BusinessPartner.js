/* eslint-disable guard-for-in */
/* eslint-disable quotes */
sap.ui.define(["com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/Formatter"],
    function (Formatter) {
        "use strict";
        class BusinessPartners extends Formatter {
            static toUI5Card(message) {
                const bps = BusinessPartners.parse(message.content);
                let bpsArray = [];
                if(Array.isArray(bps)) {
                    bpsArray = bps;
                } else {
                    bpsArray.push(bps);
                }
                return bpsArray.map((bp) => {
                    return BusinessPartners.singleBusinessPartnerCard(bp);
                });
            }

            static singleBusinessPartnerCard(bp) {
                return {
                    "sap.card": {
                        type: "Object",
                        extension: 'controller/UI5CardExtension',
                        header: {
                            icon: {
                                src: "sap-icon://account"
                            },  
                            title: `${bp.BusinessPartnerID} - ${bp.FullName}`,
                            actions: [
                                {
                                    type: "Custom",
                                    parameters: {
                                        method: "postMessage",
                                        text: BusinessPartners.I18n.label('BusinessPartnerWithID', bp.BusinessPartnerID)
                                    }
                                }
                            ]
                        },
                    }
                };
            }
        }
        return BusinessPartners;
    }
);
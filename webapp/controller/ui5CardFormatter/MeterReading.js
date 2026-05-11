/* eslint-disable guard-for-in */
/* eslint-disable quotes */
sap.ui.define(["com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/Formatter"],
    function (Formatter) {
        "use strict";
        class MeterReadings extends Formatter {
            static #generateCardGroups(meterReadings) {
                const sMeterId = meterReadings[0]?.deviceId;
                const firstReadingDateTime = meterReadings[0]?.meterReading[0]?.readingDateTime ?? MeterReadings.I18n.label("NA");
                const sTakenOn = `${MeterReadings.I18n.label("TakenOn")} ${firstReadingDateTime}`;
                const aGroups = meterReadings.map((meterReading, index) => {
                    return {
                        title: "\u00A0", // Non-breaking space to prevent layout issues
                        items:[
                            {
                                type: "NumericData",
                                mainIndicator: {
                                    number: `${meterReading.meterReading[0]?.readingResult} ${MeterReadings.formatUnit(meterReading.meterReading[0]?.readingUnit ?? MeterReadings.I18n.label("NA"))}`,
                                    unit: "",
                                    state: "Neutral",
                                    size: "L"
                                },
                                details: `${(meterReading.meterReading[0]?.registerCode ?? "").split("").join(".")}`
                            }
                        ]
                    }
                });
                aGroups[0].title = `${MeterReadings.I18n.label("MeterId")} #${sMeterId}`;
                aGroups.push({
                    title: sTakenOn,
                    items: []
                });
                return aGroups;
            }
            static toUI5Card(message) {
                const meterReadings = MeterReadings.parse(message.content);
                return [{
                    "sap.card": {
                        type: "Object",
                        header: {
                            icon: { src: MeterReadings.determinePremiseTypeIcon(meterReadings[0]?.premise?.premiseTypeDescription) || "sap-icon://error" },
                            title: meterReadings[0]?.premise?.premiseTypeDescription || MeterReadings.I18n.label("NA"),
                            subTitle: meterReadings[0]?.premise?.shortForm || ""
                        },
                        content: {
                            groups: MeterReadings.#generateCardGroups(meterReadings)
                        }
                    },
                    "dssa.card.buttons":[
                        {
                            label: MeterReadings.I18n.label("Confirm"),
                            press: {
                                message: MeterReadings.I18n.label("ConfirmMessage")
                            }
                        },
                        {
                            label: MeterReadings.I18n.label("Cancel"),
                            press: {
                                message: MeterReadings.I18n.label("CancelMessage")
                            }
                        }
                    ],
                    "dssa.style.class": "dssaUI5CardSingleGroup"
                }]
            }
        }
        return MeterReadings;
    }
);
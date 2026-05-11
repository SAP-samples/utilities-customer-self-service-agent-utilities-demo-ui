/* eslint-disable no-param-reassign */
/* eslint-disable guard-for-in */
/* eslint-disable quotes */
sap.ui.define(["com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/Formatter"],
    function (Formatter) {
        "use strict";
        class YearlyConsumption extends Formatter {
            static #singleServiceType = "";
            static toUI5Card(message) {
                YearlyConsumption.#singleServiceType = ""
                const yearlyConsumption = YearlyConsumption.parse(message.content);
                const items = YearlyConsumption.#getItems(yearlyConsumption)

                let aGroups = []
                let bOneService = false
                if (items.length === 1) {
                    // single service
                    bOneService = true;
                    const number = yearlyConsumption[0].values[0].consumption;
                    const unit = yearlyConsumption[0].values[0].unit;
                    const period = yearlyConsumption[0].period;
                    aGroups.push({
                        title: "",
                        items: [{
                            type: "NumericData",
                            mainIndicator: {
                                number: YearlyConsumption.formatAmount(number),
                                unit: YearlyConsumption.formatUnit(unit),
                                state: "Neutral",
                                size: "L"
                            },
                            details: `${YearlyConsumption.I18n.label("Consumption")} ${period}`
                        }]
                    });
                } else if (items.length > 1) {
                    aGroups = [{
                        title: YearlyConsumption.I18n.label('Services'),
                        labelWrapping: true,
                        items: items
                    }]
                }
                return [{
                    'sap.card': {
                        type: 'Object',
                        header: {
                            icon: {
                                src: YearlyConsumption.determinePremiseTypeIcon(yearlyConsumption[0].premise?.premiseTypeDescription)
                            },
                            title: `${yearlyConsumption[0].premise?.premiseTypeDescription || YearlyConsumption.I18n.label('NA')}`,
                            subTitle: `${yearlyConsumption[0].premise?.shortForm}`
                        },
                        content: {
                            groups: aGroups
                        }
                    },
                    "dssa.style.class": bOneService ? "dssaSingleMonthConsumptionServiceTypeIndicator" : "",
                    "dssa.card.delegate": {
                        onAfterRendering: YearlyConsumption.onAfterRenderingSingleService
                    },
                    "dssa.card.formatter.name": "YearlyConsumption"
                }]
            }

            static #getItems(consumptions) {
                const items = []
                const divisionMap = {
                    "Electricity": "ElectricityContracts",
                    "Gas": "GasContracts",
                    "Water": "WaterContracts"
                };
                for (const item of consumptions) {
                    const division = divisionMap[item.division]
                    // const consumptionAsString = YearlyConsumption.#getStringNumber(item.values[0].consumption)
                    items.push({
                        label: `${YearlyConsumption.I18n.label(division)} (${item.period}) - ${item.contractDescription}`,
                        value: `${YearlyConsumption.formatAmount(item.values[0].consumption)} ${YearlyConsumption.formatUnit(item.values[0].unit)}`
                    })
                    // Single service
                    if (consumptions.length === 1 && consumptions[0].values.length === 1) {
                        YearlyConsumption.#singleServiceType = YearlyConsumption.I18n.label(item.division);
                    }
                }
                return items
            }
            static #getStringNumber(number) {
                if (typeof number === 'string') {
                    number = parseFloat(number).toFixed(2)
                } else {
                    number = number.toFixed(2)
                }
                const numericValue = parseFloat(number)
                if (isNaN(numericValue)) {
                    return number.toString(); // return original value if it's not a number
                }
                return numericValue.toLocaleString();
            }

            static onAfterRenderingSingleService(oEvent) {
                const oCardDom = oEvent.srcControl.getDomRef();
                if (oCardDom) {
                    oCardDom.setAttribute("dssa-consumption-service-type", YearlyConsumption.#singleServiceType);
                }
            }
        }
        return YearlyConsumption;
    }
);
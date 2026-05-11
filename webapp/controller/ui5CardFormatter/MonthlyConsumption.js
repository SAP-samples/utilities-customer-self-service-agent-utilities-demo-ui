/* eslint-disable no-param-reassign */
/* eslint-disable guard-for-in */
/* eslint-disable quotes */
sap.ui.define(["com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/Formatter", "sap/base/i18n/Localization"],
    function (Formatter, Localization) {
        "use strict";
        class MonthlyConsumption extends Formatter {
            static #SingleMonthConsumptionServiceType = "";
            static toUI5Card(message) {
                MonthlyConsumption.#SingleMonthConsumptionServiceType = "";
                const consumptions = MonthlyConsumption.parse(message.content);

                // consumptions is an array of objects, contains contract, premise and consumption value information
                const isMultiple = consumptions.length > 0 && consumptions.some(item => item.values.length > 1);
                const isSingle = consumptions.length > 0 && consumptions.every(item => item.values.length === 1);

                if (isMultiple) {
                    const charts = consumptions
                        .filter(item => item.values && item.values.length > 1)
                        .map(item => {
                            const category = `${MonthlyConsumption.I18n.label(item.division) || item.division} ${item.contractDescription || ''}`.trim();
                            const measureUnit = item.values[0]?.unit || '';
                            return MonthlyConsumption.#multipleMonthsChart(
                                item.values,
                                category,
                                measureUnit,
                                item.premise
                            );
                        })
                        .filter(Boolean);

                    if (charts.length > 0) {
                        return charts;
                    }
                } else if (isSingle) {
                    const { bOneService } = MonthlyConsumption.#determineServiceRegiser(consumptions);
                    return MonthlyConsumption.#singleMonth(consumptions, bOneService);
                }
            }
            static #determineServiceRegiser(consumptions) {
                // only 1 contract 1 division is one service case.
                if (Array.isArray(consumptions) && consumptions.length === 1 && consumptions[0].division) {
                    MonthlyConsumption.#SingleMonthConsumptionServiceType = consumptions[0].division;
                    return { bOneService: true };
                } else {
                    MonthlyConsumption.#SingleMonthConsumptionServiceType = "";
                    return { bOneService: false };
                }
            }
            static #singleMonth(consumptions, bOneService) {
                const serviceData = consumptions[0]?.values?.[0];
                const premise = consumptions[0]?.premise;
                const premiseTypeDescription = premise?.premiseTypeDescription;
                const shortForm = premise?.shortForm;
                const consumption = serviceData?.consumption;
                const unit = serviceData?.unit;
                const billingYear = serviceData?.billingPeriodYear;
                const billingMonth = serviceData?.billingPeriodMonth;
                const billingDate = new Date(billingYear, billingMonth - 1);
                const billingDateFormatted = billingDate.toLocaleString(Localization.getLanguage() || "en-US", {
                    month: 'long',
                    year: 'numeric'
                });
                let aGroups = [];
                if (bOneService) {
                    aGroups.push({
                        title: "",
                        items: [{
                            type: "NumericData",
                            mainIndicator: {
                                number: MonthlyConsumption.formatAmount(consumption),
                                unit: MonthlyConsumption.formatUnit(unit),
                                state: "Neutral",
                                size: "L"
                            },
                            details: `${MonthlyConsumption.I18n.label("Consumption")} ${billingDateFormatted}`
                        }]
                    });
                } else {
                    aGroups.push({
                        title: `${MonthlyConsumption.I18n.label('Services')}`,
                        labelWrapping: true,
                        items: []
                    });
                    consumptions.forEach((item) => {
                        const value = item.values?.[0];
                        if (value) {
                            aGroups[0].items.push({
                                label: `${MonthlyConsumption.I18n.label(item.division) || item.division} - ${item.contractDescription || ''}`.trim(),
                                value: `${MonthlyConsumption.formatAmount(value.consumption)} ${MonthlyConsumption.formatUnit(value.unit)}`
                            });
                        }
                    });
                }
                return [{
                    'sap.card': {
                        type: 'Object',
                        header: {
                            icon: {
                                src: MonthlyConsumption.determinePremiseTypeIcon(premiseTypeDescription)
                            },
                            title: `${premiseTypeDescription || MonthlyConsumption.I18n.label('NA')}\n${consumptions[0]?.contractDescription}`,
                            subTitle: `${shortForm}`
                        },
                        content: {
                            groups: aGroups
                        }
                    },
                    "dssa.style.class": bOneService ? "dssaSingleMonthConsumptionServiceTypeIndicator" : "",
                    "dssa.card.delegate": bOneService ? {
                        onAfterRendering: MonthlyConsumption.onAfterRenderingSingleMonth
                    } : null,
                    "dssa.card.formatter.name": "MonthlyConsumption"
                }]
            }
            static #multipleMonthsChart(consumptionValues, category, measureUnit, premise) {
                const items = MonthlyConsumption.#getItems(consumptionValues, category, measureUnit, premise);
                return category === "" ? null : {
                    'sap.card': {
                        type: 'Analytical',
                        header: {
                            title: `${category} ${MonthlyConsumption.I18n.label('Consumption')} ${items.billingPeriodYear} - ${items.premise}`
                        },
                        content: {
                            data: {
                                json: items.consumption
                            },
                            chartType: 'column',
                            chartProperties: {
                                plotArea: {
                                    dataLabel: {
                                        visible: true
                                    }
                                },
                                title: {
                                    visible: false
                                },
                                categoryAxis: {
                                    title: {
                                        visible: false
                                    }
                                },
                                legend: {
                                    visible: false
                                }
                            },
                            dimensions: [
                                {
                                    name: 'billingPeriodMonth',
                                    value: '{billingPeriodMonth}'
                                }
                            ],
                            measures: [
                                {
                                    name: `${measureUnit}`,
                                    value: '{unit}'
                                }
                            ],
                            feeds: [
                                {
                                    uid: 'valueAxis',
                                    type: 'measure',
                                    values: [`${measureUnit}`]
                                },
                                {
                                    uid: 'categoryAxis',
                                    type: 'Dimension',
                                    values: ['billingPeriodMonth']
                                }
                            ]
                        }
                    }
                };
            }

            static #getItems(info, category, measureUnit, premise) {
                const consumptionData = info
                if (consumptionData.length > 0) {
                    const map = new Map();
                    consumptionData.forEach((item) => {
                        const billingPeriodMonth = item.billingPeriodYear + '-' + item.billingPeriodMonth
                        const unit = MonthlyConsumption.#getNumber(item.consumption)
                        if (map.has(billingPeriodMonth)) {
                            map.set(billingPeriodMonth, (map.get(billingPeriodMonth) ?? 0) + unit)
                        } else {
                            map.set(billingPeriodMonth, unit)
                        }
                    })

                    const summedConsumption = Array.from(map, ([billingPeriodMonth, unit]) => ({ billingPeriodMonth, unit }))

                    return {
                        category,
                        measureUnit,
                        billingPeriodYear: consumptionData[0].billingPeriodYear,
                        premise: [premise?.premiseTypeDescription, premise?.roomNo, premise?.floor, premise?.houseNo + " " + premise?.street, premise?.district, premise?.city, premise?.countryName].filter(Boolean).join(', '),
                        consumption: summedConsumption
                    }
                } else {
                    return {
                        category: '',
                        billingPeriodYear: '',
                        measureUnit: '',
                        premise: '',
                        consumption: []
                    }
                }
            }
            static #getNumber(number) {
                if (typeof number === 'string') {
                    number = parseFloat(number).toFixed(2)
                } else {
                    number = number.toFixed(2)
                }
                const numericValue = parseFloat(number)
                if (isNaN(numericValue)) {
                    return number; // return original value if it's not a number
                }
                return numericValue.toLocaleString();
            }
            static onAfterRenderingSingleMonth(oEvent) {
                const oCardDom = oEvent.srcControl.getDomRef();
                if (oCardDom) {
                    // add a class to the card header DOM element
                    oCardDom.setAttribute("dssa-consumption-service-type", MonthlyConsumption.#SingleMonthConsumptionServiceType);
                }
            }
        }
        return MonthlyConsumption;
    }
);
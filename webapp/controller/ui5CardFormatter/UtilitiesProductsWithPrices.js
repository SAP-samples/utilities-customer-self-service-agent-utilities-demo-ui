/* eslint-disable guard-for-in */
/* eslint-disable quotes */
sap.ui.define(["com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/Formatter"],
    function (Formatter) {
        "use strict";
        class UtilitiesProductsWithPrices extends Formatter {
            static toUI5Card(message) {
                const content = UtilitiesProductsWithPrices.parse(message.content);
                // Handle both single objects and arrays
                const contentArray = Array.isArray(content) ? content : [content];
                return contentArray.map(content => {
                    return {
                        "sap.card": {
                            type: "Object",
                            extension: "controller/UI5CardExtension",
                            header: {
                                title: content.product.productDescription,
                                actions: [
                                    {
                                        type: "Custom",
                                        parameters: {
                                            method: "postMessage",
                                            text: UtilitiesProductsWithPrices.I18n.label("ISelect", [
                                                content.product.productDescription
                                            ]),
                                        },
                                    },
                                ]
                            },
                            content: {
                                groups: UtilitiesProductsWithPrices.#createGroups(content)
                            }
                        },
                        "dssa.style.class": "dssaUI5CardNewProductsWithPrices",
                        "dssa.card.delegate": {
                            onAfterRendering: UtilitiesProductsWithPrices.onAfterRendering,
                        },
                        "dssa.card.formatter.name": "UtilitiesProductsWithPrices"
                    };
                });
            }
            static #createGroups(content) {
                const aGroups = []
                if (content.recurringCharge && content.recurringCharge.length > 0) {
                    // Management Cost
                    aGroups.push({
                        title: UtilitiesProductsWithPrices.I18n.label("ManagementCost"),
                        items: [{
                            value: `Cost@${UtilitiesProductsWithPrices.I18n.label("Cost")}`,
                            icon: {
                                src: "sap-icon://color-fill"
                            }
                        }]
                    })
                    aGroups.push({
                        title: " ",
                        items: [{
                            value: UtilitiesProductsWithPrices.#formatValue(content.recurringCharge[0]),
                        }]
                    })
                }
                if (content.usageCharge && content.usageCharge.length > 0) {
                    const oGroupEnergy = {}, oGroupEnergyValue = {}, oGroupPower = {}, oGroupPowerValue = {};
                    for (const usage of content.usageCharge) {
                        switch (usage.characteristic) {
                            // Energy and Power
                            case "ISU_UIL_CHARGE_MARKETPRICE":
                                aGroups.push({
                                    title: UtilitiesProductsWithPrices.I18n.label("EnergyPower"),
                                    items: [{
                                        value: `MarketPrice@${UtilitiesProductsWithPrices.I18n.label("MarketPrice")}`,
                                        icon: {
                                            src: "sap-icon://color-fill"
                                        }
                                    }]
                                })
                                // place holder
                                aGroups.push({
                                    title: " ",
                                    items: [{
                                        value: " "
                                    }]
                                })
                                break;
                            case "ISU_UIL_CHARGE_OFFPEAK":
                            case "ISU_UIL_CHARGE_PEAK":
                            case "ISU_UIL_CHARGE_MIDPEAK":
                            case "ISU_UIL_CHARGE_24H":
                                // Energy
                                if (Object.keys(oGroupEnergy).length === 0) {
                                    oGroupEnergy.title = UtilitiesProductsWithPrices.I18n.label("Energy");
                                    oGroupEnergy.items = [];
                                    oGroupEnergyValue.title = " ";
                                    oGroupEnergyValue.items = [];
                                    aGroups.push(oGroupEnergy);
                                    aGroups.push(oGroupEnergyValue);
                                }
                                let sEnergyType = ""
                                switch (usage.characteristic) {
                                    case "ISU_UIL_CHARGE_OFFPEAK":
                                        sEnergyType = `Valley@${UtilitiesProductsWithPrices.I18n.label("Valley")}`
                                        break;
                                    case "ISU_UIL_CHARGE_PEAK":
                                        sEnergyType = `Tip@${UtilitiesProductsWithPrices.I18n.label("Tip")}`
                                        break;
                                    case "ISU_UIL_CHARGE_MIDPEAK":
                                        sEnergyType = `Flat@${UtilitiesProductsWithPrices.I18n.label("Flat")}`
                                        break;
                                    case "ISU_UIL_CHARGE_24H":
                                        sEnergyType = `24HPrice@${UtilitiesProductsWithPrices.I18n.label("24HPrice")}`
                                        break;
                                    default:
                                        break;
                                }
                                oGroupEnergy.items.push({
                                    value: sEnergyType,
                                    icon: {
                                        src: "sap-icon://color-fill"
                                    }
                                });
                                oGroupEnergyValue.items.push({
                                    value: UtilitiesProductsWithPrices.#formatValue(usage)
                                });
                                break;

                            case "ISU_UIL_POWER_OFFPEAK":
                            case "ISU_UIL_POWER_PEAK":
                                // Power
                                if (Object.keys(oGroupPower).length === 0) {
                                    oGroupPower.title = UtilitiesProductsWithPrices.I18n.label("Power");
                                    oGroupPower.items = [];
                                    oGroupPowerValue.title = " ";
                                    oGroupPowerValue.items = [];
                                    aGroups.push(oGroupPower);
                                    aGroups.push(oGroupPowerValue);
                                }
                                let sPowerType = ""
                                switch (usage.characteristic) {
                                    case "ISU_UIL_POWER_OFFPEAK":
                                        sPowerType = `Valley@${UtilitiesProductsWithPrices.I18n.label("Valley")}`
                                        break;
                                    case "ISU_UIL_POWER_PEAK":
                                        sPowerType = `Tip@${UtilitiesProductsWithPrices.I18n.label("Tip")}`
                                        break;
                                    default:
                                        break;
                                }
                                oGroupPower.items.push({
                                    value: sPowerType,
                                    icon: {
                                        src: "sap-icon://color-fill"
                                    }
                                });
                                oGroupPowerValue.items.push({
                                    value: UtilitiesProductsWithPrices.#formatValue(usage)
                                });
                                break;
                            default:
                                break;
                        }
                    }
                }
                return aGroups
            }

            static #formatValue(charge) {
                const utilsPriceAmount = charge.utilsPriceItemHistory[0]?.utilsPriceAmount || 0;
                const utilsPriceCurrency = charge.utilsPriceItemHistory[0]?.utilsPriceCurrency || "";
                switch (charge.utilsSemanticsName1) {
                    case "BASE":
                        // Management Cost
                        return `${UtilitiesProductsWithPrices.formatAmount(utilsPriceAmount, 3)} ${utilsPriceCurrency}/month`;
                    case "USAGE":
                        // Energy
                        return `${UtilitiesProductsWithPrices.formatAmount(utilsPriceAmount, 3)} ${utilsPriceCurrency}/kWh`;
                    case "POWER":
                        // Power
                        return `${UtilitiesProductsWithPrices.formatAmount(utilsPriceAmount, 3)} ${utilsPriceCurrency}/kW day`;
                    default:
                        break;
                }
            }

            static onAfterRendering(oEvent) {
                const oCardContentDomRef = oEvent.srcControl?.getCardContent()?.getDomRef();
                if (oCardContentDomRef) {
                    //get div elements with class sapUiAFLayoutItem
                    const oDivs = oCardContentDomRef.querySelectorAll(`div[class="sapUiAFLayoutItem"]`);
                    const resizeObserver = new ResizeObserver(entries => {
                        for (let entry of entries) {
                            UtilitiesProductsWithPrices.#adjustCardContent(oDivs);
                        }
                    });
                    resizeObserver.observe(oCardContentDomRef);
                }
            }

            static #adjustCardContent(oDivs) {
                const colorScheme = {
                    "24HPrice": "dssaUI5CardNewProductsWithPricesColorSchemeNeutral",
                    "Cost": "dssaUI5CardNewProductsWithPricesColorSchemeInformative",
                    "MarketPrice": "dssaUI5CardNewProductsWithPricesColorSchemeInformative",
                    "Flat": "dssaUI5CardNewProductsWithPricesColorSchemeFlat",
                    "Valley": "dssaUI5CardNewProductsWithPricesColorSchemeValley",
                    "Tip": "dssaUI5CardNewProductsWithPricesColorSchemeTip"
                };
                for (let i = 0; i < oDivs.length; i += 2) {
                    let oLeftCells = oDivs[i].firstChild.childNodes;
                    let oRightCells = oDivs[i + 1].firstChild.childNodes;
                    for (let i = 0; i < oLeftCells.length; i++) {
                        oRightCells[i].style.height = `${oLeftCells[i].clientHeight}px`;
                        if (i !== 0) {
                            const parts = oLeftCells[i]?.lastChild?.firstChild?.innerText?.split("@");
                            if (parts?.length === 2) {
                                oLeftCells[i].lastChild.firstChild.innerText = parts[1];
                                oLeftCells[i].firstChild.firstChild.classList.add(colorScheme[parts[0]]);
                                oLeftCells[i].firstChild.firstChild.classList.add("dssaUI5CardNewProductsWithPricesColorSchemeBright");
                            }
                            oRightCells[i].classList.add("dssaUI5CardNewProductsWithPricesRightItemCell");
                        }
                    }
                }
            }

        }
        return UtilitiesProductsWithPrices;
    }
);
/* eslint-disable fiori-custom/sap-timeout-usage */
/* eslint-disable guard-for-in */
/* eslint-disable quotes */
sap.ui.define(["com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/Formatter"],
    function (Formatter) {
        "use strict";
        class DatePicker extends Formatter {

            static #generateBodyContent(dates) {
                const today = new Intl.DateTimeFormat("en-US", {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric'
                }).format(new Date());
                return dates.map((d, index) => ({
                    type: "ColumnSet",
                    columns: [
                        {
                            type: "Column",
                            items: [
                                {
                                    type: "TextBlock",
                                    text: `${d.text}:`,
                                    horizontalAlignment: "Left",
                                    weight: "Bolder",
                                    wrap: true
                                }
                            ],
                            width: "auto"
                        },
                        {
                            type: "Column",
                            items: [
                                {
                                    type: "Input.Date",
                                    isRequired: true,
                                    errorMessage: DatePicker.I18n.label("InvalidDateErrorMessage"),
                                    value: index === 0 ? today : ""
                                }
                            ],
                            width: "stretch"
                        }
                    ]
                }));
            }
            static generateManifest(title, dates, formatMessage) {
                const cardButtonLinkage = new Date().toISOString();
                return [{
                    "sap.card": {
                        type: "AdaptiveCard",
                        header: {
                            title: title,
                            icon: {
                                src: "sap-icon://select-appointments"
                            }
                        },
                        content: {
                            type: "AdaptiveCard",
                            body: DatePicker.#generateBodyContent(dates)
                        }
                    },
                    "dssa.card.button.linkage": cardButtonLinkage,
                    "dssa.card.buttons": [
                        {
                            label: DatePicker.I18n.label("Submit"),
                            press: {
                                "dssa.card.button.linkage": cardButtonLinkage,
                                "dssa.card.buildMessage": DatePicker.buildMessage,
                                "dssa.card.formatMessage": formatMessage
                            }
                        }
                    ],
                    "dssa.style.class": "dssaUI5CardDate",
                    "dssa.card.delegate": {
                        onAfterRendering: DatePicker.onAfterRendering
                    },
                    "dssa.card.formatter.name": "DatePicker"
                }];
            }

            static validateDateInput(dateInput) {
                // validate the input value, whether a correct date is entered
                if (!dateInput || dateInput === "") {
                    return false;
                }
                // check if the value is a valid date
                const date = new Date(dateInput);
                if (isNaN(date.getDate())) {
                    return false;
                }
                return true;
            }
            static buildMessage(oCard) {
                // get input values from the card
                const allInputs = oCard.getCardContent()?.adaptiveCardInstance?.getAllInputs();
                let bInvalid = false;
                const aInvalidInputs = [];
                const formatMessage = this["dssa.card.formatMessage"];

                const message = allInputs.reduce((acc, item, index) => {
                    if (!DatePicker.validateDateInput(item.value)) {
                        bInvalid = true;
                        aInvalidInputs.push(item);
                        item.showValidationErrorMessage();
                        return "";
                    }
                    return formatMessage(item, index, acc);
                }, "");
                // if it a date range picker, end date should be after start date
                if (allInputs.length === 2) {
                    const startDate = new Date(allInputs[0].value);
                    const endDate = new Date(allInputs[1].value);
                    if (startDate > endDate) {
                        bInvalid = true;
                        aInvalidInputs.push(allInputs[1]);
                        allInputs[1].showValidationErrorMessage();
                    }
                }
                if (bInvalid) {
                    setTimeout(() => {
                        aInvalidInputs[0].focus();
                    }, 250);
                    return "";
                } else {
                    return message
                }
            }
            /**
             * This function is called after the card is rendered.
             * It sets the width of the text blocks to the max width of all text blocks.
             * This is needed to ensure that the text blocks are aligned properly.
             * @param {sap.ui.base.Event} oEvent - The event object
             */
            static onAfterRendering(oEvent) {
                const oCardContent = oEvent.srcControl.getCardContent();
                if (oCardContent) {
                    oCardContent.attachEvent("_adaptiveCardElementsReady", function (e) {
                        let textBlockWidth = 0;
                        const oAdaptiveCard = e.getSource();
                        const textBlocks = oAdaptiveCard.adaptiveCardInstance.renderedElement.getElementsByClassName("ac-textBlock");
                        for (let i = 0; i < textBlocks.length; i++) {
                            const oTextBlock = textBlocks[i];
                            const w = oTextBlock.getBoundingClientRect().width;
                            if (w === 0) { continue; } // skip if width is 0
                            textBlockWidth = Math.max(textBlockWidth, w);
                        }
                        if (textBlockWidth > 0) {
                            // set the width of the text blocks to the max width
                            for (let i = 0; i < textBlocks.length; i++) {
                                const oTextBlock = textBlocks[i];
                                oTextBlock.style.width = `${textBlockWidth}px`;
                            }
                        }
                    });
                }
            }
        }
        return DatePicker;
    }
);
/* eslint-disable fiori-custom/sap-timeout-usage */
/* eslint-disable guard-for-in */
/* eslint-disable quotes */
sap.ui.define(["com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/Formatter"],
    function (Formatter) {
        "use strict";
        class RegisterInput extends Formatter {
            static toUI5Card(message) {
                const registers = RegisterInput.parse(message.content);
                const bodyContent = registers.map((register) => ({
                    type: "ColumnSet",
                    columns: [
                        {
                            type: "Column",
                            items: [
                                {
                                    type: "TextBlock",
                                    text: `${register.registerCode}\u00A0:`,  //\u00A0: a non-breaking space character
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
                                    type: "Input.Text",
                                    isRequired: true,
                                    errorMessage: RegisterInput.I18n.label("InvalidInputErrorMessage"),
                                    id: register.registerID
                                }
                            ],
                            width: "stretch"
                        }
                    ]
                }))
                const cardButtonLinkage = new Date().toISOString();
                return [{
                    "sap.card": {
                        type: "AdaptiveCard",
                        header: {
                            title: RegisterInput.I18n.label("EnterMeterReadings"),
                            subTitle: RegisterInput.I18n.label("EnterMeterReadingsSubtitle"),
                            icon: {
                                src: "sap-icon://group-2"
                            }
                        },
                        content: {
                            type: "AdaptiveCard",
                            body: bodyContent
                        }
                    },
                    "dssa.card.button.linkage": cardButtonLinkage,
                    "dssa.card.buttons": [
                        {
                            label: RegisterInput.I18n.label("Submit"),
                            press: {
                                "dssa.card.button.linkage": cardButtonLinkage,
                                "dssa.card.buildMessage": RegisterInput.buildMessage
                            }
                        }
                    ],
                    "dssa.style.class": "dssaUI5CardRegisterInput",
                    "dssa.card.delegate": {
                        onAfterRendering: RegisterInput.onAfterRendering
                    },
                    "dssa.card.formatter.name": "RegisterInput"
                }]
            }
            static buildMessage(oCard) {
                // get input values from the card
                const allInputs = oCard.getCardContent()?.adaptiveCardInstance?.getAllInputs();
                let bInvalid = false;
                const aInvalidInputs = [];
                const message = allInputs.reduce((acc, item, index) => {
                    const value = Number(item.value);
                    if (isNaN(value) || item.value === "" || value < 0) {
                        bInvalid = true;
                        aInvalidInputs.push(item);
                        item.showValidationErrorMessage();
                        return "";
                    }
                    return acc + (index > 0 ? "; " : "") + `${item.id}:${item.value}`;
                }, "");
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
        return RegisterInput;
    }
);
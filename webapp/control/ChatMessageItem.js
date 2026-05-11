/* eslint-disable fiori-custom/sap-timeout-usage */
sap.ui.define(["sap/m/Button",
    "sap/m/ListItemBase",
    "sap/ui/integration/widgets/Card",
    "sap/ui/integration/thirdparty/markdown-it",
    "sap/m/BusyIndicator",
    "com/sap/utl/ai/ui/dssa/control/FileUploader",
    "com/sap/utl/ai/ui/dssa/controller/ApiDataDialog"], function (Button, ListItemBase, Card, markdownit, BusyIndicator, FileUploader, ApiDataDialog) {

        // keep track of card button linkage for those cards followed by action buttons
        const cardButtonLinkage = new Map();
        // create a busy indicator to show when the bot is thinking
        const _loading = new BusyIndicator("dssaLoading", {
            size: "0.8rem"
        });
        let _isApiDemo = false;
        const ChatMessageItem = ListItemBase.extend("com.sap.utl.ai.ui.dssa.ChatMessageItem", {
            metadata: {
                properties: {
                    message: { type: "string", defaultValue: "" },
                    type: { type: "string", defaultValue: "" },
                    from: { type: "string", defaultValue: "" },
                    cardManifest: { type: "object", defaultValue: null },
                    buttons: { type: "object", defaultValue: null },
                    apiDataKey: { type: "int", defaultValue: 0 }
                },
                aggregations: {
                    _card: { type: "sap.ui.integration.widgets.Card", multiple: false },
                    _buttons: { type: "sap.m.Button", multiple: true }
                }
            },
            renderer: {
                apiVersion: 2,
                _md: new markdownit({
                    html: true,
                    linkify: true,
                    typographer: true,
                    break: true
                }),
                render: function (oRm, oControl) {
                    const sFrom = oControl.getFrom();
                    const sType = oControl.getType();
                    let oTopDiv = oRm.openStart("div", oControl.getId()).class("sapUiTinyMarginTop")
                    oTopDiv.attr("data-sap-ui", oControl.getId());
                    switch (sType) {
                        case "ui5Card":
                        case "fileUploader":
                            oTopDiv.class("dssaMessageListItemUi5Card");
                            break;
                        case "buttons":
                            oTopDiv.class("dssaMessageListItemButtons").class(`dssaMessageListItemButtonsFor${oControl.getButtons()?.parent}`);
                            break;
                        case "text":
                            oTopDiv.class(`dssaMessageListItem${sFrom}`);
                            break;
                        case "stopSession":
                            oTopDiv.class("dssaSessionStoppedMessage");
                            break;
                        default:
                            break;
                    }
                    oTopDiv.openEnd();
                    switch (sFrom) {
                        case "User":
                            this._renderUserMessage(oRm, oControl);
                            break;
                        case "Bot":
                            this._renderBot(oRm, oControl, sType);
                            break;
                        default:
                            break;
                    }
                    oRm.close("div");
                },
                _renderUserMessage: function (oRm, oControl) {
                    oRm.openStart("span").openEnd();
                    oRm.text(oControl.getMessage());
                    oRm.close("span");
                },
                _renderBot: function (oRm, oControl, sType) {
                    switch (sType) {
                        case "text": {
                            const sMessage = oControl.getMessage();
                            if (sMessage) {
                                const oSpan = oRm.openStart("span").class("sapMText").class("dssaShowdownText").class("dssaApiData").openEnd();
                                oRm.unsafeHtml(this._mdToHtml(oControl.getMessage()));
                                oRm.close("span");
                            } else {
                                oRm.renderControl(_loading);
                            }
                            break;
                        }
                        case "ui5Card":
                            oControl._oCard.addStyleClass("dssaMessageListItemUi5Card");
                            oRm.renderControl(oControl._oCard);
                            break;
                        case "fileUploader":
                            oRm.renderControl(oControl._oFileUploader);
                            break;
                        case "buttons": {
                            this._renderButtons(oRm, oControl);
                            break;
                        }
                        case "stopSession": {
                            oRm.openStart("span").openEnd();
                            oRm.text(oControl.getMessage());
                            oRm.close("span");
                            break;
                        }
                        default:
                            break;
                    }
                },
                _mdToHtml: function (sText) {
                    let sHtml = this._md.render(sText);
                    // Remove newline characters and trim whitespace between tags
                    // eslint-disable-next-line no-useless-escape
                    sHtml = sHtml.replace(/\>\s+\</g, '><').trimEnd();
                    return sHtml;
                },
                _renderButtons: function (oRm, oControl) {
                    for (let i = 0; i < oControl._aButtons.length; i++) {
                        oRm.renderControl(oControl._aButtons[i]);
                    }
                }
            }
        });

        ChatMessageItem.getApiDemo = function () {
            return _isApiDemo;
        }

        ChatMessageItem.switchApiDemo = function () {
            if (_isApiDemo === true) {
                _isApiDemo = false;
            } else {
                _isApiDemo = true;
            }
        }

        ChatMessageItem.prototype.ontap = function (oEvent) {
            if (this.getApiDataKey() === 0 || _isApiDemo === false) {
                return;
            }
            oEvent.preventDefault();
            oEvent.stopPropagation();
            ApiDataDialog.show(this.getApiDataKey());
        }

        ChatMessageItem.prototype.setType = function (sType) {
            const sFrom = this.getFrom();
            this.setProperty("type", sType);
            switch (sType) {
                case "text":
                    if (sFrom === "Bot" && !this.bPreview) {
                        this._bBusy = true;
                    }
                    break;
                default:
                    break;
            }
        }

        ChatMessageItem.prototype.setCardManifest = function (oManifest) {
            if (oManifest) {
                if (oManifest["sap.card"].type === "FileUploader") {
                    this.setProperty("type", "fileUploader");
                    this._oFileUploader = new FileUploader({
                        id: this.getId() + "--fileUploader",
                        semanticName: oManifest.semanticName || ""
                    });
                    this._oFileUploader.addStyleClass("dssaMessageListItemUi5Card");
                    this.addDependent(this._oFileUploader);
                } else {
                    this.setProperty("cardManifest", oManifest);
                    this._oCard = new Card(`${this.getId()}-card`, { manifest: oManifest, dataMode: "Active" });
                    this._oCard.addStyleClass("dssaMessageListItemUi5Card");
                    if (oManifest["dssa.style.class"]) {
                        this._oCard.addStyleClass(oManifest["dssa.style.class"]);
                    }
                    // if the card has follow up action buttons, keep this card with given linkage as the key
                    if (oManifest["dssa.card.button.linkage"]) {
                        cardButtonLinkage.set(oManifest["dssa.card.button.linkage"], this._oCard);
                    }
                    this.setAggregation("_card", this._oCard);
                    if (oManifest["dssa.card.delegate"]) {
                        this._oCard.addEventDelegate(oManifest["dssa.card.delegate"]);
                    }
                }
            }
        }

        ChatMessageItem.prototype.setButtons = function (oButtons) {
            if (oButtons) {
                this.setProperty("buttons", oButtons);
                const sId = this.getId();
                this._aButtons = oButtons.buttons.map((oButton, index) => {
                    const button = new Button(`${sId}--bot-btn-${index}`, { text: oButton.label });
                    if (oButton.press) {
                        button.attachPress(oButton.press, this._onButtonPress);
                    }
                    button.addStyleClass("dssaActionUI5Button sapUiTinyMarginEnd");
                    this.addAggregation("_buttons", button);
                    return button;
                });
            }
        }

        ChatMessageItem.prototype._onButtonPress = function (oEvent, oData) {
            const oChatMessageItem = oEvent.getSource().getParent();
            if (oData.message) {
                oChatMessageItem.postMessage(oData.message);
            } else if (oData["dssa.card.button.linkage"] && oData["dssa.card.buildMessage"]) {
                // if message is not provided, need to find the card button linkage
                // and call the givin buildMessage function by the given card
                // the given function is from formatter of the card
                const oCard = cardButtonLinkage.get(oData["dssa.card.button.linkage"]);
                if (oCard && oData["dssa.card.buildMessage"] && oData["dssa.card.buildMessage"] instanceof Function) {
                    const message = oData["dssa.card.buildMessage"](oCard);
                    if (message) {
                        oChatMessageItem.postMessage(message);
                    }
                }
            } else if (oData["dssa.card.growing"] && oData["dssa.card.growing"] instanceof Function) {
                // if the button has dssa.card.growing, it means we need to load more cards
                oData["dssa.card.growing"](oEvent);
            }
        }


        return ChatMessageItem
    });
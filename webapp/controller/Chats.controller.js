sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "com/sap/utl/ai/ui/dssa/controller/UI5CardExtension",
    "com/sap/utl/ai/ui/dssa/controller/MessageInput",
    "com/sap/utl/ai/ui/dssa/controller/MoreOptions",
    "com/sap/utl/ai/ui/dssa/control/ChatMessageItem",
    "com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/Formatter",
    "com/sap/utl/ai/ui/dssa/controller/UserList",
    "com/sap/utl/ai/ui/dssa/controller/Session",
    "sap/base/util/deepClone"
],
    function (Controller, MessageBox, UI5CardExtension, MessageInput, MoreOptions, ChatMessageItem, UI5CardFormatter, UserList, Session, deepClone) {
        "use strict";

        const _language = sap.ui.getCore().getConfiguration().getLanguage();
        const oMessageInput = new MessageInput();
        const CHAT_MESSAGE_FROM_USER = "User";
        const CHAT_MESSAGE_FROM_BOT = "Bot";
        const CHAT_MESSAGE_TYPE_TEXT = "text";
        const CHAT_MESSAGE_TYPE_CARD = "ui5Card";
        const CHAT_MESSAGE_TYPE_BUTTONS = "buttons";
        let _bStopAutoScroll = false;
        let _oSectionDom = null;
        let _lastScrollTop = 0;
        window.dssa = new Map();

        const _onScroll = function () {
            if (_lastScrollTop > _oSectionDom.scrollTop) {
                _bStopAutoScroll = true;
            } else {
                // if scroll to the end manually, enable auto scroll
                if (_oSectionDom.scrollTop + _oSectionDom.clientHeight >= _oSectionDom.scrollHeight - 5) {
                    _bStopAutoScroll = false;
                }
            }
            _lastScrollTop = _oSectionDom.scrollTop;
        }
        /**
         * Scroll to the end of the chat list
         */
        const _scrollToEnd = function () {
            if (_bStopAutoScroll) { return; }
            _oSectionDom.scrollTop = _oSectionDom.scrollHeight;
            oMessageInput.focusInput();
        }

        function getFunctionByName(nameString) {
            const parts = nameString.split('.');
            const func = parts.reduce((currentObject, part) => {
                return currentObject && currentObject[part] ? currentObject[part] : undefined;
            }, Session);

            if (typeof func === 'function') {
                return func;
            } else {
                console.error(`"${nameString}" is not a function or does not exist.`);
                return null;
            }
        }

        const chats = Controller.extend("com.sap.utl.ai.ui.dssa.controller.Chats", {
            onBeforeShow: function (oEvent) {
                if (oEvent.data && oEvent.data.restoredSession === true) {
                    // restore session
                    for (let message of window.dssaSessionData.messages) {
                        if (message.type === CHAT_MESSAGE_TYPE_CARD && message.manifest["dssa.card.delegate"] && message.manifest["dssa.card.delegate"].onAfterRendering) {
                            message.manifest["dssa.card.delegate"].onAfterRendering = getFunctionByName(message.manifest["dssa.card.delegate"].onAfterRendering);
                        }
                    }
                    this._oModel.setData(window.dssaSessionData.messages);
                    this._sSessionId = this.getOwnerComponent()._sAgentSessionId || "";
                    window.dssa = window.dssaSessionData.apiData;
                    // try 3 times to determine this._bConnectedToCAP when restore a session
                    const tryInt = setInterval(() => {
                        this._bConnectedToCAP = false;
                        const oMetaModel = this._oCAPModel.getMetaModel();
                        if (oMetaModel && oMetaModel.oMetadataPromise && oMetaModel.oMetadataPromise.isFulfilled()) {
                            this._bConnectedToCAP = true;
                            clearInterval(tryInt);
                        } else {
                            this._bConnectedToCAP = false;
                        }
                    }, 100);
                } else {
                    this._sInitialQuestion = oEvent.data;
                    // TEMP
                    // TEMPORARY: per the OData's metadata loading status to determine which service is available, Kyma CAP or local Mock
                    this._bConnectedToCAP = false;
                    const oMetaModel = this._oCAPModel.getMetaModel();
                    if (oMetaModel && oMetaModel.oMetadataPromise && oMetaModel.oMetadataPromise.isFulfilled()) {
                        this._bConnectedToCAP = true;
                    }
                }
            },
            onInit: function () {
                this._oMessageInput = oMessageInput;
                this._oMessageInput.init(this);
                this.onMessageInputLiveChange = this._oMessageInput.onMessageInputLiveChange.bind(this._oMessageInput);

                this.getView().addDelegate({
                    onBeforeShow: this.onBeforeShow
                }, true, this);

                this._oList = this.byId("list");
                this._oModel = this.getOwnerComponent().getModel("chatMessages");
                this._oCAPModel = this.getOwnerComponent().getModel();
                UI5CardExtension.prototype.setActionHandler(this.postMessage.bind(this));

                UI5CardFormatter.init(this.getOwnerComponent().getModel("i18n").getResourceBundle());
                ChatMessageItem.prototype.postMessage = this.postMessage.bind(this);
            },
            onAfterRendering: function () {
                _oSectionDom = this.byId("page").getDomRef("cont");
                if (this._sInitialQuestion && !this.getOwnerComponent().bPreview) {
                    this._sSessionId = this.getOwnerComponent()._sAgentSessionId || "";
                    this.postMessage(this._sInitialQuestion);
                }
                if (window.dssaSessionData) {
                    setTimeout(() => {
                        _scrollToEnd();
                    }, 300)
                }
            },

            /**
             * Trigger a request to backend to get the response for the question asked by user
             * @param {string} sPassedQuestion question asked by user
            */
            postMessage: async function (sPassedQuestion) {
                const sQuestion = sPassedQuestion || this._oMessageInput.getMessageInputValue();
                const oMessageData = this._oModel.getData();
                // Add user message to chat messages model
                if (sQuestion.trim() !== "") {
                    this._addChatMessage(oMessageData, {
                        from: CHAT_MESSAGE_FROM_USER,
                        type: CHAT_MESSAGE_TYPE_TEXT,
                        text: sQuestion
                    });
                    setTimeout(() => {
                        _scrollToEnd();
                        this._oMessageInput.clearMessageInput();
                        this._oMessageInput.blockInput(true);
                    }, 10);
                }
                // Add an empty message to chat messages model
                this._addChatMessage(oMessageData, {
                    from: CHAT_MESSAGE_FROM_BOT,
                    type: CHAT_MESSAGE_TYPE_TEXT,
                    text: "",
                    apiDataKey: window.dssa.size + 1
                });
                _bStopAutoScroll = false;
                // Get newly added message item for bot typing
                const aItems = this._oList.getItems();
                const oLastItem = aItems[aItems.length - 1];
                // register scroll event handler
                _oSectionDom.onscrollend = _onScroll;

                // Call backend to get response
                let sLanguage = null;
                try {
                    let res = null;
                    if (!this._bConnectedToCAP) {
                        res = await askWithStream();
                    } else {
                        res = await this._askAgent(sQuestion, oLastItem);
                    }
                    let { ui5CardManifest, buttons, sSessionLanguage } = res;
                    sLanguage = sSessionLanguage;
                    if (ui5CardManifest) {
                        let aUi5CardManifest = [];
                        if (!Array.isArray(ui5CardManifest)) {
                            aUi5CardManifest.push(ui5CardManifest);
                        } else {
                            aUi5CardManifest = ui5CardManifest;
                        }
                        for (let card of aUi5CardManifest) {
                            this._addChatMessage(oMessageData, {
                                from: CHAT_MESSAGE_FROM_BOT,
                                type: CHAT_MESSAGE_TYPE_CARD,
                                manifest: {
                                    "sap.app": { id: "com.sap.utl.ai.ui.dssa.ui5IC" },
                                    ...card
                                }
                            });
                        }
                        setTimeout(() => {
                            _bStopAutoScroll = false;
                            _scrollToEnd();
                        }, 10)
                    }
                    if (buttons && buttons?.buttons.length > 0) {
                        this._addChatMessage(oMessageData, {
                            from: CHAT_MESSAGE_FROM_BOT,
                            type: CHAT_MESSAGE_TYPE_BUTTONS,
                            buttons: buttons
                        });
                        setTimeout(() => {
                            _bStopAutoScroll = false;
                            _scrollToEnd();
                        }, 10)
                    }
                } catch (error) {
                    oLastItem.setMessage(`${oLastItem.getMessage()}${error.message}`);
                    MessageBox.error(error.message);
                    console.error(error.stack)
                } finally {
                    _oSectionDom.onscrollend = null;
                    this._oMessageInput.blockInput(false);
                    if (sLanguage && sLanguage !== _language) {
                        this._suspendSession(sLanguage);
                    }
                }

                async function askWithStream() {
                    const res = await fetch("/dssa/ask/", {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            q: sQuestion
                        })
                    });
                    let ui5CardManifest = [];
                    let buttons = null;
                    let uiCardContentChunkBuffer = "";
                    const stream = res.body.pipeThrough(new TextDecoderStream());
                    for await (const chunk of stream) {
                        let preText = "";
                        let index = chunk.indexOf("|ui5Card|");
                        if (index > -1 || uiCardContentChunkBuffer) {
                            uiCardContentChunkBuffer += chunk;
                            // extract the ui5 card manifest
                            const parts = uiCardContentChunkBuffer.split("\n---");
                            if (Array.isArray(parts)) {
                                if (parts.length < 3) {
                                    // not enough parts, wait for more data
                                    continue;
                                }
                                let cardContent = JSON.parse(parts[1]);
                                const aManifest = await UI5CardFormatter.generateManifest({
                                    content: cardContent.data || cardContent,
                                    type: cardContent.type || ""
                                });
                                buttons = aManifest.map(manifest => {
                                    return manifest["dssa.card.buttons"] ? manifest["dssa.card.buttons"] : null;
                                }).filter(b => b);
                                ui5CardManifest.push(...aManifest);
                            }
                            // check if any more text before |ui5Card|
                            if (index === 1) { // actually backend sends `\n|ui5Card|` so index is 1
                                continue;
                            } else {
                                preText = chunk.substring(0, index - 1);
                            }
                        }
                        index = chunk.indexOf("|ui5Buttons|");
                        if (index > -1) {
                            // extract the buttons
                            const parts = chunk.split("\n---");
                            if (Array.isArray(parts) && parts.length > 1) {
                                buttons = JSON.parse(parts[1]);
                            }
                            // check if any more text before |ui5Card|
                            if (index === 1) { // actually backend sends `\n|ui5Card|` so index is 1
                                continue;
                            } else {
                                preText = chunk.substring(0, index - 1);
                            }
                        }
                        if (!uiCardContentChunkBuffer) {
                            // general text, just typing
                            oLastItem.setMessage(`${oLastItem.getMessage()}${preText || chunk}`);
                            _scrollToEnd();
                        }
                    }
                    return {
                        ui5CardManifest, buttons: {
                            buttons: buttons ? buttons.flatMap(b => b) : [],
                            parent: "Card"  // if there are follow up buttons for Bot text bubble, then parent is "Text", otherwise "Card"
                        }
                    };
                }
            },
            /**
             * Add a new message to chat messages model
             * @param {Array} oMessageData chat messages
             * @param {Object} oNewMessage 
             */
            _addChatMessage: function (oMessageData, oNewMessage) {
                oMessageData.push(oNewMessage);
                this._oModel.setData(oMessageData);
                this._oMessageInput.setUserMessageHistoryIndex(oMessageData.length - 1);
            },

            _askAgent: async function (sQuestion, oLastItem) {
                const oAskAgentContext = this._oCAPModel.bindContext("/Conversation.askAgent(...)");
                oAskAgentContext.setParameter("sessionId", this._sSessionId);
                oAskAgentContext.setParameter("input", sQuestion);
                const req = {
                    sessionId: this._sSessionId,
                    input: sQuestion,
                    timestamp: new Date().toISOString()
                };
                const oSessionLanguageContext = this._oCAPModel.bindContext("/Conversation.getSessionLanguage(...)");
                oSessionLanguageContext.setParameter("sessionId", this._sSessionId);
                oSessionLanguageContext.invoke("$auto");
                await oAskAgentContext.invoke("$auto");
                const oSessionLanguage = oSessionLanguageContext.getBoundContext().getObject();
                const res = oAskAgentContext.getBoundContext().getObject();
                this._keepCallingData({
                    req: req,
                    res: {
                        ...res,
                        timestamp: new Date().toISOString()
                    }
                });
                let ui5CardManifest = [];
                let buttons = [];
                let bHasTextForLastItem = false;
                for (let m of res.message) {
                    if (m.type === "text") {
                        oLastItem.setMessage(`${oLastItem.getMessage()}${m.content}`);
                        bHasTextForLastItem = true;
                    } else if (m.type === "ui5Card") {
                        ui5CardManifest.push(m.content);
                    } else {
                        const aManifest = await UI5CardFormatter.generateManifest(m);
                        buttons = aManifest.map(manifest => {
                            return manifest["dssa.card.buttons"] ? manifest["dssa.card.buttons"] : null;
                        }).filter(b => b);
                        ui5CardManifest.push(...aManifest);
                    }
                }
                if (!bHasTextForLastItem && ui5CardManifest.length > 0) {
                    oLastItem.setType(CHAT_MESSAGE_TYPE_CARD);
                    oLastItem.setCardManifest({
                        "sap.app": { id: "com.sap.utl.ai.ui.dssa.ui5IC" },
                        ...ui5CardManifest.shift()
                    });
                }
                this._sSessionId = res.sessionId;
                return {
                    ui5CardManifest: ui5CardManifest, buttons: {
                        buttons: buttons.flatMap(b => b),
                        parent: "Card"  // if there are follow up buttons for Bot text bubble, then parent is "Text", otherwise "Card"
                    },
                    sSessionLanguage: oSessionLanguage.value || _language
                };
            },

            /**
             * To keep calling askAgent's parameters and response data
             * @param {Object} data data to be kept
             */
            _keepCallingData: function (data) {
                window.dssa.set(window.dssa.size + 1, data);
            },

            confirmChangeUser: function () {
                UserList.confirmChangeUser();
            },

            _suspendSession: function (sLangCode) {
                const aMessages = deepClone(this._oModel.getData());
                const sSessionId = this._sSessionId;
                for (let message of aMessages) {
                    if (message.type === CHAT_MESSAGE_TYPE_CARD && message.manifest["dssa.card.delegate"] && message.manifest["dssa.card.delegate"].onAfterRendering) {
                        message.manifest["dssa.card.delegate"].onAfterRendering = `${message.manifest["dssa.card.formatter.name"]}.${message.manifest["dssa.card.delegate"].onAfterRendering.name}`;
                    }
                }
                const oSessionData = {
                    sessionId: sSessionId,
                    messages: aMessages,
                    httpHeaders: this._oCAPModel.getHttpHeaders(),
                    apiData: window.dssa,
                    timestamp: new Date().toISOString()
                };
                // Save oSessionData to IndexedDB
                Session.ready.then(() => {
                    Session.addSession(oSessionData).onsuccess = event => {
                        // Restart app with new language
                        this._restartAppWithNewLanguage(sLangCode);
                    };
                });
            },

            _restartAppWithNewLanguage: function (sLangCode) {
                const sNewUrl = `${window.location.origin}${window.location.pathname}?sap-ui-language=${sLangCode}`;
                // refresh current tab with new URL
                window.location.replace(sNewUrl);
            },

            stopSession: function () {
                MessageBox.confirm("Are you sure you want to stop the session? This action cannot be undone.", {
                    title: "Stop Session",
                    onClose: oAction => {
                        if (oAction === MessageBox.Action.OK) {
                            this._confirmStopSession();
                        }
                    }
                });
            },

            _confirmStopSession: async function () {
                try {
                    const oStopSessionContext = this._oCAPModel.bindContext("/Conversation.stopSession(...)");
                    oStopSessionContext.setParameter("sessionId", this._sSessionId);
                    this.getView().setBusy(true);
                    await oStopSessionContext.invoke("$auto");
                    const res = oStopSessionContext.getBoundContext().getObject();
                    if (res.success) {
                        MessageBox.success(res.message, {
                            title: "Stop Session"
                        });
                        this._addSessionStoppedMessage(res);
                        oMessageInput.blockInput(true);
                        _scrollToEnd();
                    } else {
                        MessageBox.error(res.message, {
                            title: "Stop Session"
                        });
                    }
                } catch (error) {
                    MessageBox.error(error.message, {
                        title: "Stop Session"
                    });
                } finally {
                    this.getView().setBusy(false);
                }
            },

            _addSessionStoppedMessage: function (res) {
                const oMessageData = this._oModel.getData();
                oMessageData.push({
                    from: CHAT_MESSAGE_FROM_BOT,
                    type: "stopSession",
                    text: `Session stopped at: ${new Date(res.stoppedAt).toLocaleString()}`,
                });
                this._oModel.setData(oMessageData);
            }

        });

        chats.prototype.onMessageInputLiveChange = oMessageInput.onMessageInputLiveChange.bind(oMessageInput);
        chats.prototype.clearMessageInput = oMessageInput.clearMessageInput.bind(oMessageInput);
        chats.prototype.openMoreOptionsMenu = MoreOptions.openMenu.bind(MoreOptions);

        return chats;
    });

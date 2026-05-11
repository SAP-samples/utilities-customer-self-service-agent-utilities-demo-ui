sap.ui.define(["sap/ui/base/Object", "sap/m/TextArea"
],
    function (BaseObject, TextArea) {
        "use strict";
        return BaseObject.extend("com.sap.utl.ai.ui.dssa.MessageInput", {
            init: function (oViewController) {
                this._oViewController = oViewController;
                this._oInput = this.byId("message-input");
                this._oInput.onAfterRendering = this.onAfterRendering.bind(this);
                this._oSend = this.byId("message-send");
                this._oClear = this.byId("message-clear");
                this._oFlexBox = this.byId("message-flexbox");

                this._oInput.focus();

                this._iUserMessageHistoryIndex = -1;
            },
            onAfterRendering: function () {
                TextArea.prototype.onAfterRendering.apply(this._oInput, arguments);
                this._oInput.onfocusin = null;
                const oInputContentDom = this._oInput.getDomRef("content");
                oInputContentDom.classList?.remove("sapMInputBaseContentWrapper");
                oInputContentDom.onkeydown = this._onKeyDown.bind(this);
                this._oInput.focus();
            },
            byId: function (sId) {
                return this._oViewController.byId(sId);
            },
            onMessageInputLiveChange: function (sNewValue) {
                if (sNewValue.getParameter("newValue").trim() === "") {
                    this._oClear.getDomRef().style.visibility = "hidden";
                    this._oSend.setEnabled(false);
                } else {
                    this._oClear.getDomRef().style.visibility = "visible";
                    this._oSend.setEnabled(true);
                }
            },
            clearMessageInput: function () {
                setTimeout(() => {
                    this._oInput.setValue("");
                    this._oClear.getDomRef().style.visibility = "hidden";
                    this._oSend.setEnabled(false);
                }, 1);
            },
            _onKeyDown: function (oEvent) {
                if (oEvent.key === "ArrowUp") {
                    // check if cursor position is at the beginning of the input
                    const oTextAreaDom = this._oInput.getFocusDomRef();
                    if (oTextAreaDom.selectionStart === 0 && oTextAreaDom.selectionEnd === 0) {
                        this._reuseUserMessageHistory(true);
                    }
                }
                if (oEvent.key === "ArrowDown") {
                    // check if cursor position is at the end of the input
                    const oTextAreaDom = this._oInput.getFocusDomRef();
                    if (oTextAreaDom.selectionStart === oTextAreaDom.value.length && oTextAreaDom.selectionEnd === oTextAreaDom.value.length) {
                        this._reuseUserMessageHistory(false);
                    }
                }
                if (oEvent.key === "Enter" && !oEvent.shiftKey && this.getMessageInputValue().trim() !== "") {
                    this._oViewController.postMessage(this.getMessageInputValue());
                    this.clearMessageInput();
                }
            },
            blockInput: function (bBlock) {
                this._oInput.setBlocked(bBlock);
            },
            getMessageInputValue: function () {
                return this._oInput.getValue();
            },

            focusInput: function () {
                return this._oInput.focus();
            },

            setUserMessageHistoryIndex: function (iIndex) {
                this._iUserMessageHistoryIndex = iIndex;
            },

            _reuseUserMessageHistory: function (bUp) {
                if(!bUp && this._iUserMessageHistoryIndex === -1) {
                    this._iUserMessageHistoryIndex = 1;
                }
                const chatMessages = this._oInput.getModel("chatMessages").getData();
                for (let i = this._iUserMessageHistoryIndex; bUp ? i > -1 : i < chatMessages.length; bUp ? i-- : i++) {
                    if (chatMessages[i].from === "User" && chatMessages[i].text !== this._oInput.getValue()) {
                        this._oInput.setValue(chatMessages[i].text);
                        this._iUserMessageHistoryIndex = bUp ? i - 1 : i + 1;
                        return;
                    }
                    if(!bUp && i === chatMessages.length - 1) {
                        //the end, just give empty
                        this._oInput.setValue("");
                    }
                }
            }
        });
    }
);
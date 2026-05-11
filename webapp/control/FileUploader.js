sap.ui.define(["sap/ui/core/Control", "sap/f/Card", "sap/f/cards/Header", "sap/ui/unified/FileUploader", "sap/m/HBox", "sap/m/Button", "sap/tnt/InfoLabel", "sap/m/MessageBox"], function (Control, Card, Header, UnifiedFileUploader, HBox, Button, InfoLabel, MessageBox) {
    "use strict";
    const FileUploader = Control.extend("com.sap.utl.ai.ui.dssa.FileUploader", {
        metadata: {
            properties: {
                status: { type: "string", defaultValue: "" },
                semanticName: { type: "string", defaultValue: "" }
            },
            aggregations: {
                "_card": { type: "sap.f.Card", multiple: false }
            }
        },
        renderer: {
            apiVersion: 2,
            render: function (oRm, oControl) {
                oRm.renderControl(oControl._oCard);
            }
        }
    });

    FileUploader.prototype.init = function () {
        this._oCard = new Card({});
        this._oCard.setHeader(new Header({
            title: "{i18n>FileUploaderTitle}",
            iconSrc: "sap-icon://upload"
        }));
        this._oCardContent = new HBox({
            justifyContent: "Start",
            alignItems: "Center",
            width: "100%"
        });
        this._oCardContent.addStyleClass("sapUiSmallMarginBottom");
        this._oCardContent.addStyleClass("sapUiSmallMarginBegin");

        this._oFileUploader = new UnifiedFileUploader({
            id: this.getId() + "--fileUploader",
            name: "myFileUploader"
        });
        this._oCardContent.addItem(this._oFileUploader);


        this._oUploadButton = new Button({
            text: "{i18n>FileUploaderUploadButton}",
            type: "Emphasized",
            press: this._uploadFile.bind(this)
        });
        this._oUploadButton.addStyleClass("sapUiTinyMarginBegin");
        this._oCardContent.addItem(this._oUploadButton);

        this._oInfoLabel = new InfoLabel({
            text: "",
            colorScheme: 8,
            icon: "sap-icon://status-positive",
            visible: false
        });
        this._oInfoLabel.addStyleClass("sapUiTinyMarginBegin");
        this._oCardContent.addItem(this._oInfoLabel);

        this._oCard.setContent(this._oCardContent);

        this.setAggregation("_card", this._oCard);

    }

    FileUploader.prototype._uploadFile = async function (oEvent, iRetryCount = 0) {
        const oUploadedFile = this._oFileUploader.oFileUpload.files[0];
        if (!oUploadedFile) {
            MessageBox.error(this.getModel("i18n").getResourceBundle().getText("FileUploaderSelectFileError"));
            return;
        }
        let oViewController = sap.ui.getCore().byId("container-com.sap.utl.ai.ui.dssa---App--chats").getController();
        let oActionContext;
        let message, failed = false;
        this._processFile(this._oFileUploader.oFileUpload.files[0])
            .then(fileContent => {
                const sessionId = oViewController._sSessionId;
                const oModel = this.getModel();
                oActionContext = oModel.bindContext("/Conversation.uploadFile(...)");
                oActionContext.setParameter("sessionId", sessionId);
                oActionContext.setParameter("file", fileContent);
                oActionContext.setParameter("fileName", oUploadedFile.name);
                oActionContext.setParameter("mimeType", oUploadedFile.type);
                return oActionContext.invoke("$auto");
            }).then(() => {
                const res = oActionContext.getBoundContext().getObject();
                message = res.message;
                failed = res.success !== true;
                if (res.success === true) {
                    this.setStatus("S");
                    oViewController.postMessage(this.getModel("i18n").getResourceBundle().getText("FileUploaderUploadSuccessAndContinue", [this.getSemanticName(), res.fileId]));
                }
            }).catch((error) => {
                message = error.message;
                failed = true;
            }).finally(() => {
                if (failed === true) {
                    if (iRetryCount < 5) {
                        // retry upload
                        setTimeout(() => {
                            this._uploadFile(null, (iRetryCount || 0) + 1);
                        }, 1000);
                        message = `${message}. Retrying ${(iRetryCount || 0) + 1}...`;
                    } else if (iRetryCount >= 5) {
                        this.setStatus("E");
                    }
                    const oModelChatMessages = oViewController.getView().getModel("chatMessages");
                    const oMessageData = oModelChatMessages.getData();
                    oViewController._addChatMessage(oMessageData, {
                        from: "Bot",
                        type: "text",
                        text: message
                    });
                }
            });
    }

    FileUploader.prototype._processFile = function (file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = loadEvent => resolve(loadEvent.target.result.match(/,(.*)$/)[1]);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
        });
    }

    FileUploader.prototype.setStatus = function (sStatus) {
        this.setProperty("status", sStatus);
        const oCard = this.getAggregation("_card");
        this._oFileUploader.setEnabled(false);
        this._oUploadButton.setVisible(false);
        this._oInfoLabel.setVisible(true);
        if (sStatus !== "S") {
            this._oInfoLabel.setColorScheme(2).setIcon("sap-icon://status-error");
        }
    }

    return FileUploader;
});
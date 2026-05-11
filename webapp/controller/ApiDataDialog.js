sap.ui.define(["sap/ui/core/Fragment", "sap/m/MessageBox", "sap/m/BusyDialog", "sap/m/MessageToast"],
    function (Fragment, MessageBox, BusyDialog, MessageToast) {
        "use strict";
        return {
            show: async function (sKey) {
                if (!this._oApiDataDialog) {
                    this._oApiDataDialog = await Fragment.load({
                        id: "dssa-api-data-dialog",
                        name: "com.sap.utl.ai.ui.dssa.view.ApiDataDialog",
                        controller: this
                    });
                    this._oCodeEditor = this._oApiDataDialog.getContent()[0];
                    this._oApp = sap.ui.getCore().byId("container-com.sap.utl.ai.ui.dssa---App");
                    this._oApp.addDependent(this._oApiDataDialog);
                }
                this._oCodeEditor.setValue(JSON.stringify(this._getApiDataByKey(sKey), null, 4));
                this._oApiDataDialog.open();

            },

            close: function () {
                this._oApiDataDialog.close();
            },

            _getApiDataByKey: function (sKey) {
                const aApiMessages = dssa.get(sKey)?.res?.message;
                for (let oMsg of aApiMessages) {
                    if (oMsg.type !== "text" && typeof oMsg.content === "string") {
                        try {
                            oMsg.content = JSON.parse(oMsg.content);
                        } catch (error) {
                            // in case content is not a valid JSON string, do nothing
                        }
                    }
                }
                return { message: aApiMessages };
            }
        }
    }
);
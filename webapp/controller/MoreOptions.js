sap.ui.define(["sap/ui/core/Fragment", "sap/m/MessageBox", "sap/m/BusyDialog", "sap/m/MessageToast", "com/sap/utl/ai/ui/dssa/control/ChatMessageItem"],
    function (Fragment, MessageBox, BusyDialog, MessageToast, ChatMessageItem) {
        "use strict";
        return {
            openMenu: async function (oEvent) {
                if (!this._oMenu) {
                    this._oMenu = await Fragment.load({
                        id: "dssa-more-options-menu",
                        name: "com.sap.utl.ai.ui.dssa.view.MoreOptionsMenu",
                        controller: this
                    });
                    this._oApp = sap.ui.getCore().byId("container-com.sap.utl.ai.ui.dssa---App");
                    this._oMessageModel = this._oApp.getModel("chatMessages");
                    this._oCreateTCMenu = this._oMenu.getItems()[1];
                    this._oTestCaseMetaModel = this._oApp.getModel("testCase")?.getMetaModel();
                    this._oCAPModel = this._oApp.getModel();
                    this._sSessionId = this._oApp.getController().getOwnerComponent()._sAgentSessionId;

                }
                const bCreateTCEnabled = !!(this._oMessageModel.getData().length > 0 && this._oTestCaseMetaModel && this._oTestCaseMetaModel.oMetadataPromise && this._oTestCaseMetaModel.oMetadataPromise.isFulfilled());
                if (this._oCreateTCMenu) {
                    this._oCreateTCMenu.setEnabled(bCreateTCEnabled);
                    this._oCreateTCMenu.setTooltip(bCreateTCEnabled ? "" : "Create Test Case is disabled. Make sure there are chat messages and the Test Case service is accessible.");
                }
                this._oMenu.openBy(oEvent.getSource());
            },
            openConfigPage: function () {
                window.open("/config.html", "_blank");
            },

            createTestCase: async function () {
                let dirHandle;
                try {
                    dirHandle = await window.showDirectoryPicker({ mode: "readwrite" });
                } catch (e) {
                    return;
                }

                if (!this._oTestCaseModel) {
                    this._oTestCaseModel = this._oApp.getModel("testCase");
                }
                if (!this._oBusyDialog) {
                    this._oBusyDialog = new BusyDialog();
                }
                this._oBusyDialog.setTitle("Generating Test Case");
                this._oBusyDialog.open();
                let messages = [];
                const oActionContext = this._oTestCaseModel.bindContext("/generateTestCase(...)");
                const sSessionId = this._oApp.getController().getOwnerComponent()._sAgentSessionId || "";
                messages.push(`Session ID: ${sSessionId}`);
                const sLandscape = this._getLandscape();
                messages.push(`Landscape: ${sLandscape}`);
                oActionContext.setParameter("sessionId", sSessionId);
                oActionContext.setParameter("landscape", sLandscape);
                try {
                    await oActionContext.invoke("$auto");
                    this._oBusyDialog.setTitle("Saving Test Case Files");
                    const res = oActionContext.getBoundContext().getObject();
                    this._validate(res);
                    // Save test case file
                    const testCaseFileHandle = await dirHandle.getFileHandle(res.testCaseName, { create: true });
                    const testCaseWritable = await testCaseFileHandle.createWritable();
                    await testCaseWritable.write(res.testCase);
                    await testCaseWritable.close();
                    messages.push(`Test case file "${res.testCaseName}"`);

                    // Save each test data file
                    for (const tc of res.testData) {
                        const dataFileHandle = await dirHandle.getFileHandle(tc.dataFileName, { create: true });
                        const dataWritable = await dataFileHandle.createWritable();
                        await dataWritable.write(JSON.stringify(tc.data, null, 2));
                        await dataWritable.close();
                        messages.push(`Test data file "${tc.dataFileName}"`);
                    }
                    this._oBusyDialog.close();
                    MessageBox.success(messages.join("\n"), {
                        title: `${res.testData.length + 1} files saved to "${dirHandle.name}"`
                    });
                } catch (error) {
                    this._oBusyDialog.close();
                    MessageBox.error(error.message, {
                        title: "Create Test Case Error"
                    });
                    console.error(error);
                }
            },

            _getLandscape: function () {
                const regex = /ucssa-dev-dssa-ui-approuter-([^.]+)\.c/;
                const match = window.location.host.match(regex);
                return match ? match[1] : "";
            },

            _getTestCaseName: function (testCaseContent) {
                const match = testCaseContent.match(/^@([^\n]+)/);
                return match ? `${match[1]}.feature` : "";
            },

            _validate: function (res) {
                let errorMessages = [];
                // validate response structure
                if (!res.testCase) {
                    errorMessages.push("Invalid data received from backend. Missing 'testCase' property.");
                } else {
                    // validate file names
                    const testCaseName = this._getTestCaseName(res.testCase);
                    if (!testCaseName) {
                        errorMessages.push("Failed to extract test case name from test case content.");
                    } else {
                        res.testCaseName = testCaseName;
                    }
                }
                if (!Array.isArray(res.testData)) {
                    errorMessages.push("Invalid data received from backend. 'testData' should be an array.");
                } else {
                    for (const tc of res.testData) {
                        const dataFileName = tc.filePath.split("/").pop();
                        if (!dataFileName) {
                            errorMessages.push(`Failed to extract data file name from file path "${tc.filePath}".`);
                        }
                        tc.dataFileName = dataFileName;
                    }
                }
                if (errorMessages.length > 0) {
                    throw new Error(errorMessages.join("\n"));
                }
            },

            switchApiDemo: function () {
                if (ChatMessageItem.getApiDemo() === true) {
                    MessageToast.show("API Demo mode disabled.", {
                        at: "center center",
                        duration: 1000
                    });
                    document.documentElement.style.setProperty("--dssa-api-data-cursor", "inherit")
                } else {
                    MessageToast.show("API Demo mode enabled.", {
                        at: "center center",
                        duration: 1000
                    });
                    document.documentElement.style.setProperty("--dssa-api-data-cursor", "pointer")
                }
                ChatMessageItem.switchApiDemo();
            }
        }
    }
);
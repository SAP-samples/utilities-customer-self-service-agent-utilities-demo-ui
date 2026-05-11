sap.ui.define(["sap/ui/core/Fragment", "sap/m/MessageBox", "sap/m/BusyDialog"],
    function (Fragment, MessageBox, BusyDialog) {
        "use strict";
        return {
            openDialog: async function () {
                if (!this._oDialog) {
                    this._oDialog = await Fragment.load({
                        id: "dssa-user-list-dialog",
                        name: "com.sap.utl.ai.ui.dssa.view.UserListDialog",
                        controller: this
                    });
                    this._oApp = sap.ui.getCore().byId("container-com.sap.utl.ai.ui.dssa---App");
                    this._oApp.addDependent(this._oDialog);
                    // get the ComboBox
                    this._oComboBox = this._oDialog.getContent()[0];
                }
                this._oDialog.open();
                this._pUserSelection = new Promise((resolve, reject) => {
                    this._fnResolveUserSelection = resolve;
                    this._fnRejectUserSelection = reject;
                });
                return this._pUserSelection;
            },
            onUserSelectionChange: function () {
                this._oComboBox.setValueState("None");
            },
            confirmUserSelection: function () {
                // if no user is selected, make the ComboBox in error state
                if (!this._oComboBox.getSelectedKey()) {
                    this._oComboBox.setValueState("Error");
                    this._oComboBox.setValueStateText("Please select a user.");
                    this._oComboBox.focus();
                } else {
                    this._oComboBox.setValueState("None");
                    // get selected user
                    const oSelectedItem = this._oComboBox.getSelectedItem();
                    if (oSelectedItem) {
                        const sUserId = oSelectedItem.getKey();
                        const sUserName = oSelectedItem.getText().match(/^(.*) \((\d+)\)$/)[1];
                        const sBusinessPartner = oSelectedItem.getAdditionalText();
                        this._oSelectedUser = { userId: sUserId, userName: sUserName, businessPartner: sBusinessPartner };
                        this._fnResolveUserSelection(this._oSelectedUser);
                    }
                    // close the dialog
                    this._oDialog.close();
                }
            },
            confirmChangeUser: function () {
                MessageBox.confirm(`Current user is ${this._oSelectedUser ? this._oSelectedUser.userName : "unknown"}. \nAre you sure you want to change the user?\nPage will be refreshed and history will be lost.`, {
                    title: "Confirm",
                    onClose: function(oAction){
                        if(oAction === sap.m.MessageBox.Action.OK){
                            location.reload();
                        }
                    },
                    styleClass: "",
                    actions: [sap.m.MessageBox.Action.OK,
                    sap.m.MessageBox.Action.CANCEL],
                    emphasizedAction: sap.m.MessageBox.Action.OK,
                    initialFocus: null,
                    textDirection: sap.ui.core.TextDirection.Inherit,
                    dependentOn: null
                });
            },
            setSelectedUser: function (oUser) {
                this._oSelectedUser = oUser;
            },
            formatItemText: function (oUser) {
                return oUser["ucssa-username"] + " (" + oUser.businessPartners[0] + ")";
            }
        }
    }
);
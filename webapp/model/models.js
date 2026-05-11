sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
    // "com/sap/utl/ai/ui/dssa/config/PersistenceIdb"
],
    function (JSONModel, Device, PersistenceIdb) {
        "use strict";

        return {
            /**
             * Provides runtime info for the device the UI5 app is running on as JSONModel
             */
            createDeviceModel: function () {
                var oModel = new JSONModel(Device);
                oModel.setDefaultBindingMode("OneWay");
                return oModel;
            }
        };

    });
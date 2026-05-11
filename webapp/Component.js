/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "com/sap/utl/ai/ui/dssa/model/models",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/IconPool",
    "com/sap/utl/ai/ui/dssa/control/ChatMessageItem",
    "com/sap/utl/ai/ui/dssa/controller/Session",
    "sap/base/Log"
],
    function (UIComponent, Device, models, JSONModel, IconPool, ChatMessageItem, Session, Log) {
        "use strict";

        let fnSessionDataCheckedResolve;
        window.dssaSessionDataChecked = new Promise((resolve) => {
            fnSessionDataCheckedResolve = resolve;
        });
        const logger = Log.getLogger("com.sap.utl.ai.ui.dssa.Component");
        Session.ready.then(function() {
            Session.getSession().then((data) => {
                if(data && data.length > 0){
                    logger.info("Session data loaded:", data);
                    window.dssaSessionData = data[0];
                    // clear session data from IndexedDB after loading
                    Session.clearSession();
                }else{
                    logger.info("No session data found.");
                }
                fnSessionDataCheckedResolve();
            });
        });

        return UIComponent.extend("com.sap.utl.ai.ui.dssa.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // get component data
                const oComponentData = this.getComponentData();
                if (oComponentData && oComponentData.configPreview && oComponentData.configPreview === true) {
                    // set the device model
                    ChatMessageItem.prototype.bPreview = true;
                    this.bPreview = true;
                }else{
                    ChatMessageItem.prototype.bPreview = false;
                    this.bPreview = false;
                }
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // set the device model
                this.setModel(models.createDeviceModel(), "device");

                // JSON model for message list
                this.setModel(new JSONModel([]), "chatMessages");

                // register SAP-icons-TNT font
                IconPool.registerFont({
                    collectionName: "SAP-icons-TNT",
                    fontFamily: "SAP-icons-TNT",
                    fontURI: sap.ui.require.toUrl("sap/tnt/themes/base/fonts/")
                });
            }
        });
    }
);
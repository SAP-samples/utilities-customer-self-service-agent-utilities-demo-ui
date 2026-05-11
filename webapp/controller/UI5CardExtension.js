sap.ui.define([
	"sap/ui/integration/Extension"
], function (Extension) {
	"use strict";
	let _ask = null;
	return Extension.extend("com.sap.utl.ai.ui.dssa.controller.UI5CardExtension", {
		init: function () {
			Extension.prototype.init.apply(this, arguments);
			this.attachAction(this._handleAction.bind(this));
		},

		_handleAction: function (oEvent) {
			const oActionParameters = oEvent.getParameter("parameters");
			if (oActionParameters && oActionParameters.method && this[oActionParameters.method]) {
				this[oActionParameters.method](oEvent);
			} else {
				const q = oEvent.getParameter("actionSource")?.getBindingContext()?.getObject();
				if (q) {
					_ask(q.Name);
				}
			}
		},

		setActionHandler: function (oAction) {
			_ask = oAction;
		},

		postMessage: function (oEvent) {
			const oActionParameters = oEvent.getParameter("parameters");
			let sQuestion = "";
			if (oActionParameters.text) {
				sQuestion = oActionParameters.text;
			} else {
				const oManifest = oEvent.getParameter("card").getManifest();
				sQuestion = oManifest["sap.card"].header.subTitle;
			}
			const oChatPageController = sap.ui.getCore().byId("container-com.sap.utl.ai.ui.dssa---App--chats").getController();
			oChatPageController.postMessage(sQuestion);
			this._closeShowMoreDialog(oEvent);
		},

		/**
		 * 
		 * @param {sap.ui.base.Event} oEvent SAPUI5 event
		 * @description Closes the show more dialog if it is open.
		 * @private
		 * @returns {void}
		 */
		_closeShowMoreDialog: function (oEvent) {
			// first need to check if the dialog is open
			const oCard = oEvent.getParameter("card");
			// if the card's parent is a dialog, close it
			const oParent = oCard.getParent();
			if (oParent && oParent.isA("sap.m.Dialog")) {
				oParent.close();
			}
		}
	});
});
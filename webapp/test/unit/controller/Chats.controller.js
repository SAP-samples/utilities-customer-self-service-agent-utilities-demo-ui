/*global QUnit*/

sap.ui.define([
	"comsaputlaiui/dssa/controller/Chats.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Chats Controller");

	QUnit.test("I should test the Chats controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});

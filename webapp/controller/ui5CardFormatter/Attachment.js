/* eslint-disable guard-for-in */
/* eslint-disable quotes */
sap.ui.define(['com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/Formatter'], function (Formatter) {
	'use strict';
	class FileUploader extends Formatter {
		static toUI5Card(message) {
			const attachment = FileUploader.parse(message.content);
			return [{
				'sap.card': {
					type: 'FileUploader'
				},
				"dssa.style.class": "dssaUI5CardFileUploader",
				"semanticName": attachment.semanticName
			}];
		}
	}
	return FileUploader;
});

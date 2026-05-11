/* eslint-disable guard-for-in */
/* eslint-disable quotes */
sap.ui.define(['com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/Formatter'], function (Formatter) {
	'use strict';
	class Contract extends Formatter {
		static singleContractCard(contract) {
			const status =
				contract.isContractInactive === false
					? Contract.I18n.label('ActiveContract')
					: contract.isContractInactive === true
					? Contract.I18n.label('InactiveContract')
					: Contract.I18n.label('NA');
			const title = `${contract.contractID}: ${contract.description || Contract.I18n.label('NA')}`;
			let subTitle = `${contract.productDescription || Contract.I18n.label('NA')}`;
			subTitle += ` - ${status} - `;
			subTitle += `${contract.shortForm || Contract.I18n.label('NA')}`;

			return {
				'sap.card': {
					type: 'Object',
					extension: 'controller/UI5CardExtension',
					header: {
						icon: {
							src: Contract.determineContractTypeIcon(contract.divisionID),
						},
						title: title,
						subTitle: subTitle,
						actions: [
							{
								type: 'Custom',
								parameters: {
									method: 'postMessage',
									text: Contract.I18n.label('ContractDetails', [contract.contractID]),
								},
							},
						],
					},
				},
			};
		}

		static toUI5Card(message) {
			const contracts = Contract.parse(message.content);
			let contractsArray = [];

			if (Array.isArray(contracts)) {
				contractsArray = contracts;
			} else {
				contractsArray.push(contracts);
			}

			if (!contractsArray || contractsArray.length === 0) {
				return `Contracts not found: ${message.metadata.additionalData}`;
			}
			return contractsArray.map((contract) => {
				return Contract.singleContractCard(contract);
			});
		}
	}
	return Contract;
});

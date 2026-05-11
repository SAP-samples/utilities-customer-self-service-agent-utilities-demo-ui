/* eslint-disable guard-for-in */
/* eslint-disable quotes */
sap.ui.define(['com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/Formatter'], function (Formatter) {
	'use strict';
	class ContractDetails extends Formatter {
		static buildValidity(contract) {
			const moveInDateFormatted = contract.moveInDate ? `{= format.date('${contract.moveInDate}')}` : ContractDetails.I18n.label('NA');
			let moveOutDateFormatted = contract.moveOutDate
				? new Date(parseInt(contract.moveOutDate.match(/\/Date\((\d+)\)\//)[1], 10)).toISOString().substring(0, 10)
				: ContractDetails.I18n.label('NA');
			if (moveOutDateFormatted === '9999-12-31') {
				moveOutDateFormatted = ContractDetails.I18n.label('Indefinite');
			} else if (moveOutDateFormatted === ContractDetails.I18n.label('NA')) {
				moveOutDateFormatted = ContractDetails.I18n.label('NA');
			} else {
				moveOutDateFormatted = `{= format.date('${contract.moveOutDate}')}`;
			}
			return { moveInDate: moveInDateFormatted, moveOutDate: moveOutDateFormatted };
		}

		static singleContractCard(contract) {
			const { moveInDate, moveOutDate } = ContractDetails.buildValidity(contract);
			const status =
				contract.isContractInactive === false
					? ContractDetails.I18n.label('ActiveContract')
					: contract.isContractInactive === true
					? ContractDetails.I18n.label('InactiveContract')
					: ContractDetails.I18n.label('NA');
			const title = ContractDetails.mapDivisionToService(contract.divisionID) || ContractDetails.I18n.label('NA');
			const subTitle = `${contract.contractID} - ${contract.description || ContractDetails.I18n.label('NA')} - ${status}`;

			return {
				'sap.card': {
					type: 'Object',
					extension: 'controller/UI5CardExtension',
					header: {
						icon: {
							src: ContractDetails.determineContractTypeIcon(contract.divisionID),
						},
						title: title,
						subTitle: subTitle,
						actions: [
							{
								type: 'Custom',
								parameters: {
									method: 'postMessage',
									text: ContractDetails.I18n.label('ContractDetails', [contract.contractID]),
								},
							},
						],
					},
					content: {
						groups: [
							{
								items: [
									{
										type: 'Status',
										state: contract.isContractInactive === false ? 'Success' : contract.isContractInactive === true ? 'Error' : 'None',
										value:
											contract.isContractInactive === false
												? ContractDetails.I18n.label('Active')
												: contract.isContractInactive === true
												? ContractDetails.I18n.label('Inactive')
												: ContractDetails.I18n.label('NA'),
									},
								],
							},
							{
								items: [
									{
										label: ContractDetails.I18n.label('Product'),
										value: `${contract.productDescription || ContractDetails.I18n.label('NA')}`,
									},
									{
										label: ContractDetails.I18n.label('Description'),
										value: contract.description || ContractDetails.I18n.label('NA'),
									},
									{
										label: ContractDetails.I18n.label('Validity'),
										value: `${moveInDate} - ${moveOutDate}`,
									},
									{
										label: ContractDetails.I18n.label('ContractAccount'),
										value: contract.contractAccountID || ContractDetails.I18n.label('NA'),
									},
									{
										label: ContractDetails.I18n.label('Premise'),
										value: `${contract.premiseID} - ${contract.shortForm || ContractDetails.I18n.label('NA')}`,
									},
								],
							},
						],
					},
				},
				'dssa.style.class': 'dssaUI5CardContract', // to apply dedicated CSS styles for contract cards
			};
		}

		static toUI5Card(message) {
			const contracts = ContractDetails.parse(message.content);
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
				return ContractDetails.singleContractCard(contract);
			});
		}
	}
	return ContractDetails;
});

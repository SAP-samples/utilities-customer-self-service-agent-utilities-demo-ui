/* eslint-disable guard-for-in */
/* eslint-disable quotes */
sap.ui.define(['com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/Formatter'], function (Formatter) {
	'use strict';
	class ProductByContract extends Formatter {
		static singleProductByContractCard(contract) {
			const status =
				contract.isContractInactive === false
					? ProductByContract.I18n.label('ActiveContract')
					: contract.isContractInactive === true
					? ProductByContract.I18n.label('InactiveContract')
					: ProductByContract.I18n.label('NA');
			const title = contract.productDescription ? contract.productDescription : ProductByContract.mapDivisionToService(contract.divisionID);
			let subTitle = ProductByContract.mapDivisionToService(contract.divisionID);
			subTitle += ' - ';
			subTitle += `${contract.contractID}`;
			subTitle += `: ${contract.description || ProductByContract.I18n.label('NA')}`;
			subTitle += ` (${status})`;
			subTitle += ' - ';
			subTitle += contract.shortForm || ProductByContract.I18n.label('NA');

			return {
				'sap.card': {
					type: 'Object',
					extension: 'controller/UI5CardExtension',
					header: {
						icon: {
							src: ProductByContract.determineContractTypeIcon(contract.divisionID),
						},
						title: title,
						subTitle: subTitle,
					},
				},
			};
		}

		static toUI5Card(message) {
			const contracts = ProductByContract.parse(message.content);
			let contractsArray = [];

			if (Array.isArray(contracts)) {
				contractsArray = contracts;
			} else {
				contractsArray.push(contracts);
			}

			if (!contractsArray || contractsArray.length === 0) {
				return `Products not found: ${message.metadata.additionalData}`;
			}
			return contractsArray.map((contract) => {
				return ProductByContract.singleProductByContractCard(contract);
			});
		}
	}
	return ProductByContract;
});

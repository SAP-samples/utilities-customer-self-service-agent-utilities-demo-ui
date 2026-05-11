/* eslint-disable guard-for-in */
/* eslint-disable quotes */
sap.ui.define(['com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/Formatter'], function (Formatter) {
	'use strict';
	class BudgetBillingPlanDetails extends Formatter {
		static singleBudgetBillingPlanCard(budgetBillingPlan) {
			const status =
				budgetBillingPlan.contract.isContractInactive === false
					? BudgetBillingPlanDetails.I18n.label('ActiveContract')
					: budgetBillingPlan.contract.isContractInactive === true
					? BudgetBillingPlanDetails.I18n.label('InactiveContract')
					: BudgetBillingPlanDetails.I18n.label('NA');

			return {
				'sap.card': {
					type: 'Object',
					extension: 'controller/UI5CardExtension',
					header: {
						icon: {
							src: 'sap-icon://batch-payments',
						},
						title: BudgetBillingPlanDetails.I18n.label('BudgetBillingPlan'),
						subTitle: `${budgetBillingPlan.budgetBillingPlanID}`,
						actions: [
							{
								type: 'Custom',
								parameters: {
									method: 'postMessage',
									text: BudgetBillingPlanDetails.I18n.label('BudgetBillingPlanDetails', [budgetBillingPlan.budgetBillingPlanID]),
								},
							},
						],
					},
					content: {
						groups: [
							{
								items: [
									{
										label:
											BudgetBillingPlanDetails.mapDivisionToService(budgetBillingPlan.contract.divisionID) ||
											BudgetBillingPlanDetails.I18n.label('Contract'),
										value: `${budgetBillingPlan.contractID} - ${budgetBillingPlan.contract.description || status}`,
									},
									{
										label: BudgetBillingPlanDetails.I18n.label('Product'),
										value: `${budgetBillingPlan.contract.productDescription || BudgetBillingPlanDetails.I18n.label('NA')}`,
									},
									{
										label: BudgetBillingPlanDetails.I18n.label('Premise'),
										value: `${budgetBillingPlan.premise.shortForm}`,
									},
									{
										label: BudgetBillingPlanDetails.I18n.label('BudgetBillingPlanPeriod'),
										value: `{= format.date('${budgetBillingPlan.startDate}')} - {= format.date('${budgetBillingPlan.endDate}')}`,
									},
									{
										label: BudgetBillingPlanDetails.I18n.label('BudgetBillingPlanCycle'),
										value: `${budgetBillingPlan.budgetBillingCycle.description}`,
									},
									{
										label: BudgetBillingPlanDetails.I18n.label('BudgetBillingPlanAmount'),
										value: `{= format.currency(${budgetBillingPlan.amount}, '${budgetBillingPlan.currency}', {currencyCode:true})}`,
									},
								],
							},
						],
					},
				},
				'dssa.style.class': 'dssaUI5CardBudgetBillingPlan', // to apply dedicated CSS styles for budget billing plan cards
			};
		}

		static toUI5Card(message) {
			const budgetBillingPlans = BudgetBillingPlanDetails.parse(message.content);
			let budgetBillingPlansArray = [];

			if (Array.isArray(budgetBillingPlans)) {
				budgetBillingPlansArray = budgetBillingPlans;
			} else {
				budgetBillingPlansArray.push(budgetBillingPlans);
			}

			if (!budgetBillingPlansArray || budgetBillingPlansArray.length === 0) {
				return `Budget billing plans not found: ${message.metadata.additionalData}`;
			}
			return budgetBillingPlansArray.map((budgetBillingPlan) => {
				return BudgetBillingPlanDetails.singleBudgetBillingPlanCard(budgetBillingPlan);
			});
		}
	}
	return BudgetBillingPlanDetails;
});

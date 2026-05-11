/* eslint-disable guard-for-in */
/* eslint-disable quotes */
sap.ui.define(['com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/Formatter'], function (Formatter) {
	'use strict';
	class BudgetBillingPlan extends Formatter {
		static singleBudgetBillingPlanCard(budgetBillingPlan) {
			const status =
				budgetBillingPlan.contract.isContractInactive === false
					? BudgetBillingPlan.I18n.label('ActiveContract')
					: budgetBillingPlan.contract.isContractInactive === true
					? BudgetBillingPlan.I18n.label('InactiveContract')
					: BudgetBillingPlan.I18n.label('NA');
			const title = `${budgetBillingPlan.contract.productDescription || BudgetBillingPlan.I18n.label('NA')}: {= format.currency(${
				budgetBillingPlan.amount
			}, '${budgetBillingPlan.currency}', {currencyCode:true})} / ${budgetBillingPlan.budgetBillingCycle.description}`;
			const subTitle = `${BudgetBillingPlan.I18n.label('ContractDetails', [budgetBillingPlan.contract.contractID])} ${
				budgetBillingPlan.contract.description
			} - ${budgetBillingPlan.premise.shortForm}`;

			return {
				'sap.card': {
					type: 'Object',
					extension: 'controller/UI5CardExtension',
					header: {
						icon: {
							src: 'sap-icon://batch-payments',
						},
						title: title,
						subTitle: subTitle,
						actions: [
							{
								type: 'Custom',
								parameters: {
									method: 'postMessage',
									text: BudgetBillingPlan.I18n.label('BudgetBillingPlanDetails', [budgetBillingPlan.budgetBillingPlanID]),
								},
							},
						],
					},
					// footer: {
					// 	actionsStrip: [
					// 		{
					// 			text: BudgetBillingPlan.I18n.label('ShowDetails'),
					// 			buttonType: 'Transparent',
					// 			actions: [
					// 				{
					// 					type: 'ShowCard',
					// 					parameters: {
					// 						method: 'postMessage',
					// 						text: BudgetBillingPlan.I18n.label('BudgetBillingPlanDetails', [budgetBillingPlan.budgetBillingPlanID]),
					// 					},
					// 				},
					// 			],
					// 		},
					// 	],
					// },
				},
				'dssa.style.class': 'dssaUI5CardBudgetBillingPlan', // to apply dedicated CSS styles for budget billing plan cards
			};
		}

		static toUI5Card(message) {
			const budgetBillingPlans = BudgetBillingPlan.parse(message.content);
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
				return BudgetBillingPlan.singleBudgetBillingPlanCard(budgetBillingPlan);
			});
		}
	}
	return BudgetBillingPlan;
});

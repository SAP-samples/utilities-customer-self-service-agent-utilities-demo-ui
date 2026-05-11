/* eslint-disable guard-for-in */
/* eslint-disable quotes */
sap.ui.define([], function () {
	'use strict';

    const nameMapping = new Map();
    // Mapping: new MessageType value -> existing formatter JS file name (without .js extension)
    nameMapping.set("premiseSelection", "Premises");
    nameMapping.set("contractSelection", "Contract");
    nameMapping.set("invoices", "Invoice");
    nameMapping.set("contractAccountSelection", "ContractAccount");
    nameMapping.set("divisionSelection", "Division");
    nameMapping.set("utilitiesProductWithPricesDetails", "UtilitiesProductWithPrices");
    nameMapping.set("utilitiesProductWithPricesSelection", "UtilitiesProductsWithPrices");
    nameMapping.set("budgetBillingPlanSelection", "BudgetBillingPlan");
    nameMapping.set("productByContractSelection", "ProductByContract");
    nameMapping.set("deviceSelection", "Device");
    nameMapping.set("compareConsumptions", "CompareConsumption");
    nameMapping.set("attachments", "Attachment");
    nameMapping.set("depositAmounts", "DepositAmount");
    nameMapping.set("serviceRequests", "ServiceRequest");
    nameMapping.set("businessPartnerSelection", "BusinessPartner");
	return nameMapping;
});

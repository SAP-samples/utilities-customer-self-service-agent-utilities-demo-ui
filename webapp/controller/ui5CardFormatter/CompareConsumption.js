/* eslint-disable guard-for-in */
/* eslint-disable quotes */
sap.ui.define(
	['com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/Formatter', 'sap/base/i18n/Localization'],
	function (Formatter, Localization) {
		'use strict';
		class CompareConsumption extends Formatter {
			static retrieveContractDescription(consumptionData) {
				const contractID = consumptionData.contractID;
				const firstPeriod = consumptionData.values[0]?.period;
				const lastPeriod = consumptionData.values[consumptionData.values.length - 1]?.period;
				const overAllPeriod = `${firstPeriod.slice(0, 10)} - ${lastPeriod.slice(13)}`;
				return `${contractID} - ${consumptionData.contractDescription} - ${overAllPeriod}`;
			}

			static formatPeriod(period) {
				// Expect the period in the format "DD-MM-YYYY"
				// Return the period in the format "YYYY-MM-DD"
				const parts = period.split('-');

				if (parts.length !== 3 || parts[0].length !== 2 || parts[1].length !== 2 || parts[2].length !== 4) {
					return period; // return as is if format is unexpected
				}

				const formattedPeriod = `${parts[2]}-${parts[1]}-${parts[0]}`;

				return formattedPeriod;
			}

			static convertConsumptionDataToChartDataWithinContract(consumptionData) {
				if (consumptionData[0].intervalType === 'Yearly') {
					const overAllPeriod = `${consumptionData[0].values[0]?.period} vs. ${consumptionData[1].values[0]?.period}`;
					const chartData = consumptionData.map((year) => {
						const contractID = year.contractID;
						const contractDescription = `${contractID} - ${year.contractDescription}  - ${year.values[0]?.period}`;

						return {
							contractID: contractID,
							contractDescription: contractDescription,
							division: year.division,
							consumption: year.values[0]?.consumption,
							unit: year.values[0]?.unit,
							period: overAllPeriod, // year.values[0]?.period,
						};
					});

					return {
						unit: CompareConsumption.formatUnit(chartData[0].unit),
						chartData: chartData,
					};
				} else if (consumptionData[0].intervalType === 'Quarterly') {
					let chartData = [];
					const consumptionData1 = consumptionData[0];
					const consumptionData2 = consumptionData[1];
					const contractID = consumptionData1.contractID;
					const contractDescription1 = CompareConsumption.retrieveContractDescription(consumptionData1);
					const contractDescription2 = CompareConsumption.retrieveContractDescription(consumptionData2);
					const division = consumptionData1.division;

					consumptionData1.values.map((value, index) => {
						const overAllPeriod = `${value.period} vs. ${consumptionData2.values[index]?.period}`;
						chartData.push({
							contractID: contractID,
							contractDescription: contractDescription1,
							division: division,
							consumption: value.consumption,
							unit: value.unit,
							period: overAllPeriod, // value.period,
						});
						chartData.push({
							contractID: contractID,
							contractDescription: contractDescription2,
							division: division,
							consumption: consumptionData2.values[index]?.consumption,
							unit: consumptionData2.values[index]?.unit,
							period: overAllPeriod, // consumptionData2.values[index]?.period,
						});
					});
				} else if (consumptionData[0].intervalType === 'Monthly') {
					let chartData = [];
					const consumptionData1 = consumptionData[0];
					const consumptionData2 = consumptionData[1];
					const contractID = consumptionData1.contractID;
					const contractDescription1 = CompareConsumption.retrieveContractDescription(consumptionData1);
					const contractDescription2 = CompareConsumption.retrieveContractDescription(consumptionData2);
					const division = consumptionData1.division;

					consumptionData1.values.map((value, index) => {
						// const overAllPeriod = `${value.period} vs. ${consumptionData2.values[index]?.period}`;
						const period1 = CompareConsumption.formatPeriod(value.period.split(' - ')[0]);
						const datePeriod1 = new Date(period1).toLocaleString(Localization.getLanguage() || 'en-US', {
							month: 'long',
						});
						const period2 = CompareConsumption.formatPeriod(consumptionData2.values[index]?.period.split(' - ')[0]);
						const datePeriod2 = new Date(period2).toLocaleString(Localization.getLanguage() || 'en-US', {
							month: 'long',
						});

						chartData.push({
							contractID: contractID,
							contractDescription: contractDescription1,
							division: division,
							consumption: value.consumption,
							unit: value.unit,
							period: datePeriod1, // overAllPeriod, // value.period,
						});
						chartData.push({
							contractID: contractID,
							contractDescription: contractDescription2,
							division: division,
							consumption: consumptionData2.values[index]?.consumption,
							unit: consumptionData2.values[index]?.unit,
							period: datePeriod2, // overAllPeriod, // consumptionData2.values[index]?.period,
						});
					});

					return {
						unit: CompareConsumption.formatUnit(chartData[0].unit),
						chartData: chartData,
					};
				} else {
					return null;
				}
			}

			static convertConsumptionDataToChartDataProfile(consumptionData) {
				if (consumptionData[0].intervalType === 'Yearly') {
					const chartData = consumptionData.map((year) => {
						const contractID = year.contractID;
						const contractDescription = `${contractID} - ${year.contractDescription}`;

						return {
							contractID: contractID,
							contractDescription: contractDescription,
							division: year.division,
							consumption: year.values[0]?.consumption,
							unit: year.values[0]?.unit,
							period: year.values[0]?.period,
						};
					});

					return {
						unit: CompareConsumption.formatUnit(chartData[0].unit),
						chartData: chartData,
					};
				} else if (consumptionData[0].intervalType === 'Quarterly') {
					let chartData = [];
					const consumptionData1 = consumptionData[0];
					const consumptionData2 = consumptionData[1];
					const contractID1 = consumptionData1.contractID;
					const contractDescription1 = `${contractID1} - ${consumptionData1.contractDescription}`;
					const division1 = consumptionData1.division;
					const contractID2 = consumptionData2.contractID;
					const contractDescription2 = `${contractID2} - ${consumptionData2.contractDescription}`;
					const division2 = consumptionData2.division;

					consumptionData1.values.map((value, index) => {
						chartData.push({
							contractID: contractID1,
							contractDescription: contractDescription1,
							division: division1,
							consumption: value.consumption,
							unit: value.unit,
							period: value.period,
						});
						chartData.push({
							contractID: contractID2,
							contractDescription: contractDescription2,
							division: division2,
							consumption: consumptionData2.values[index]?.consumption,
							unit: consumptionData2.values[index]?.unit,
							period: consumptionData2.values[index]?.period,
						});
					});

					return {
						unit: CompareConsumption.formatUnit(chartData[0].unit),
						chartData: chartData,
					};
				} else if (consumptionData[0].intervalType === 'Monthly') {
					let chartData = [];
					const consumptionData1 = consumptionData[0];
					const consumptionData2 = consumptionData[1];
					const contractID1 = consumptionData1.contractID;
					const contractDescription1 = `${contractID1} - ${consumptionData1.contractDescription}`;
					const division1 = consumptionData1.division;
					const contractID2 = consumptionData2.contractID;
					const contractDescription2 = `${contractID2} - ${consumptionData2.contractDescription}`;
					const division2 = consumptionData2.division;

					consumptionData1.values.map((value, index) => {
						const period1 = CompareConsumption.formatPeriod(value.period.split(' - ')[0]);
						const datePeriod1 = new Date(period1).toLocaleString(Localization.getLanguage() || 'en-US', {
							month: 'short',
							year: 'numeric',
						});
						const period2 = CompareConsumption.formatPeriod(consumptionData2.values[index]?.period.split(' - ')[0]);
						const datePeriod2 = new Date(period2).toLocaleString(Localization.getLanguage() || 'en-US', {
							month: 'short',
							year: 'numeric',
						});

						chartData.push({
							contractID: contractID1,
							contractDescription: contractDescription1,
							division: division1,
							consumption: value.consumption,
							unit: value.unit,
							period: datePeriod1, // value.period,
						});
						chartData.push({
							contractID: contractID2,
							contractDescription: contractDescription2,
							division: division2,
							consumption: consumptionData2.values[index]?.consumption,
							unit: consumptionData2.values[index]?.unit,
							period: datePeriod2, // consumptionData2.values[index]?.period,
						});
					});

					return {
						unit: CompareConsumption.formatUnit(chartData[0].unit),
						chartData: chartData,
					};
				} else {
					return null;
				}
			}

			static convertConsumptionDataToChartDataAcrossContracts(consumptionData) {
				return CompareConsumption.convertConsumptionDataToChartDataProfile(consumptionData);
			}

			static toUI5Card(message) {
				const consumptionData = CompareConsumption.parse(message.content);

				if (!consumptionData) {
					console.error('Invalid consumption data format.');
					return null;
				}

				// Convert consumption data to chart data
				let chartData;
				if (consumptionData[0].comparisonType === 'WithinContract') {
					chartData = CompareConsumption.convertConsumptionDataToChartDataWithinContract(consumptionData);
				} else if (consumptionData[0].comparisonType === 'Profile') {
					chartData = CompareConsumption.convertConsumptionDataToChartDataProfile(consumptionData);
				} else if (consumptionData[0].comparisonType === 'AcrossContracts') {
					chartData = CompareConsumption.convertConsumptionDataToChartDataAcrossContracts(consumptionData);
				}

				// Determine title based on interval type
				let title = 'Compare Consumption Data';
				if (consumptionData[0].intervalType === 'Monthly') {
					title = CompareConsumption.I18n
						? CompareConsumption.I18n.label('CompareConsumptionDataMonthly')
						: 'Compare Consumption Data On A Monthly Basis';
				} else if (consumptionData[0].intervalType === 'Quarterly') {
					title = CompareConsumption.I18n
						? CompareConsumption.I18n.label('CompareConsumptionDataQuarterly')
						: 'Compare Consumption Data On A Quarterly Basis';
				} else if (consumptionData[0].intervalType === 'Yearly') {
					title = CompareConsumption.I18n
						? CompareConsumption.I18n.label('CompareConsumptionDataYearly')
						: 'Compare Consumption Data On A Yearly Basis';
				}

				return [
					{
						'sap.card': {
							type: 'Analytical',
							header: {
								title: title,
								icon: {
									src: 'sap-icon://bar-chart',
								},
							},
							content: {
								data: {
									json: chartData.chartData,
								},
								chartType: 'column',
								chartProperties: {
									legend: {
										visible: true,
									},
									legendGroup: {
										layout: {
											position: 'bottom',
											alignment: 'topLeft',
										},
									},
									plotArea: {
										dataLabel: {
											visible: true,
										},
										categoryAxisText: {
											visible: true,
										},
										valueAxisText: {
											visible: true,
										},
									},
									title: {
										visible: false,
									},
									categoryAxis: {
										title: {
											text: CompareConsumption.I18n ? CompareConsumption.I18n.label('ConsumptionData') : 'Consumption Data',
										},
										labels: {
											rotation: -45,
										},
									},
									valueAxis: {
										title: {
											text: chartData.unit,
										},
									},
								},
								measures: [
									{
										value: '{consumption}',
										name: 'consumption',
									},
								],
								dimensions: [
									{
										value: '{period}',
										dataType: 'string',
										name: 'period',
									},
									{
										value: '{contractDescription}',
										dataType: 'string',
										name: 'contractDescription',
									},
								],
								feeds: [
									{
										uid: 'valueAxis',
										type: 'Measure',
										values: ['consumption'],
									},
									{
										uid: 'categoryAxis',
										type: 'Dimension',
										values: ['period'],
									},
									{
										uid: 'color',
										type: 'Dimension',
										values: ['contractDescription'],
									},
								],
							},
						},
					},
				];
			}
		}

		return CompareConsumption;
	}
);

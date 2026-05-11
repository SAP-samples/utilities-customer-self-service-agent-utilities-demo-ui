/* eslint-disable guard-for-in */
/* eslint-disable quotes */
sap.ui.define(["com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/Formatter"],
    function (Formatter) {
        "use strict";
        class SalesOrder extends Formatter {
            static toUI5Card(message) {
                const order = SalesOrder.parse(message.content);
                let aOrders = [];
                if (Array.isArray(order)) {
                    aOrders = order;
                } else {
                    aOrders.push(order);
                }
                return aOrders.map(o => {
                    const icon = 'sap-icon://sales-order'
                    return {
                        "sap.card": {
                            type: "Object",
                            data: {
                                json: {
                                  orderNumber: `${o.salesOrder}`,
                                  soldToParty: `${o.soldToParty}`,
                                  product: `${o.product}`,
                                  startData: `${o.requestedDeliveryDate}`,
                                  totalNetAmount: `${o.totalNetAmount}`,
                                  transactionCurrency: `${o.transactionCurrency}`
                                }
                              },
                            extension: "controller/UI5CardExtension",
                            header: {
                                icon: {
                                    src: icon
                                },
                                title: "Order Number: " + o.salesOrder || SalesOrder.I18n.label('NA')
                            },
                            content:{
                                groups: [
                                    {
                                        title: SalesOrder.I18n.label('OrderDetails'),
                                        items: [
                                            {
                                                label: 'User',
                                                value: o.soldToParty || SalesOrder.I18n.label('NA')
                                            },
                                            {
                                                label: 'Product',
                                                value: o.product || SalesOrder.I18n.label('NA')
                                            },
                                            {
                                                label: SalesOrder.I18n.label('RequestedStartofSupplyDate'),
                                                value: o.requestedDeliveryDate || I18n.label('NA')
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                });
            }
        }
        return SalesOrder;
    }
);
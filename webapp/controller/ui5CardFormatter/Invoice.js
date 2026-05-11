/* eslint-disable guard-for-in */
/* eslint-disable quotes */
sap.ui.define(["com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/Formatter", "sap/base/i18n/Localization"],
    function (Formatter, Localization) {
        "use strict";
        class Invoice extends Formatter {
            static #DateTimeFormat = new Intl.DateTimeFormat(Localization.getLanguage() || "en-US", {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
            static #formatDate(dateStr) {
                const date = new Date(dateStr);
                return this.#DateTimeFormat.format(date);
            }
            static #singleInvoiceCard(invoice) {
                return {
                    "sap.card": {
                        type: "Object",
                        extension: "controller/UI5CardExtension",
                        header: {
                            title: `${Invoice.I18n.label("Invoice")} (${Invoice.#formatDate(invoice.invoiceDate)})`,
                            subTitle: `#${invoice.invoiceID} - ${invoice.invoiceDescription}`
                        },
                        content: {
                            groups: [
                                {
                                    items: [
                                        {
                                            type: "NumericData",
                                            mainIndicator:{
                                                number: parseFloat(invoice.amountDue).toFixed(2),
                                                unit: invoice.currency,
                                                state: "Neutral",
                                                size: "L"
                                            },
                                            details: `${Invoice.I18n.label("DueDate")}: ${Invoice.#formatDate(invoice.dueDate)}`
                                        }
                                    ]
                                },
                                {
                                    items: [
                                        {
                                            label: Invoice.I18n.label("AmountRemaining"),
                                            value: `${parseFloat(invoice.amountRemaining).toFixed(2)} ${invoice.currency}`
                                        }
                                    ]
                                }
                            ]
                        }
                    },
                    "dssa.style.class": "dssaUI5CardInvoice"  // to apply dedicated CSS styles for invoice cards
                }
            }
            static #getStatusText(visible, total) {
                const adjustedVisible = Math.min(visible, total)
                return `${adjustedVisible} of ${total}`
            }
            static toUI5Card(message) {
                const invoices = Invoice.parse(message.content);
                if (!invoices || invoices.length === 0) {
                    return `Invoice not found. ${message.metadata.additionalData}`;
                }
                return invoices.map((invoice) => {
                    return Invoice.#singleInvoiceCard(invoice);
                });
            }
        }
        return Invoice;
    }
);
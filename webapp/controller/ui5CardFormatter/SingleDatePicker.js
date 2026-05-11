/* eslint-disable fiori-custom/sap-timeout-usage */
/* eslint-disable guard-for-in */
/* eslint-disable quotes */
sap.ui.define(["com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/DatePicker",],
    function (DatePicker) {
        "use strict";
        class SingleDatePicker extends DatePicker {
            static toUI5Card(message) {
                const dates = [{
                    text: SingleDatePicker.I18n.label("Date"),
                }];
                return SingleDatePicker.generateManifest(SingleDatePicker.I18n.label("SelectADate"), dates, SingleDatePicker.#formatMessage);
            }
            static #formatMessage(inputItem){
                return inputItem.value;
            }
        }
        return SingleDatePicker;
    }
);
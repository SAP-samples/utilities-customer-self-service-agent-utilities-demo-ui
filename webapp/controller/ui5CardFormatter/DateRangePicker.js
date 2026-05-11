/* eslint-disable fiori-custom/sap-timeout-usage */
/* eslint-disable guard-for-in */
/* eslint-disable quotes */
sap.ui.define(["com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/DatePicker",],
    function (DatePicker) {
        "use strict";
        class DateRangePicker extends DatePicker {
            static toUI5Card(message) {
                const dates = [{
                    text: DateRangePicker.I18n.label("StartDate")
                }, {
                    text: DateRangePicker.I18n.label("EndDate")
                }];
                return DateRangePicker.generateManifest(DateRangePicker.I18n.label("SelectADateRange"), dates, DateRangePicker.#formatMessage);
            }
            static #formatMessage(item, index, acc) {
                return index === 0 ? `${DateRangePicker.I18n.label("DateFrom", [item.value])}` : `${acc} ${DateRangePicker.I18n.label("DateTo", [item.value])}`;
            }
        }
        return DateRangePicker;
    }
);
sap.ui.define([
    "com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/UserAccount",
    "com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/DatePicker",
    "com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/MonthlyConsumption",
    "com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/RegisterInput",
    "com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/UtilitiesProductsWithPrices",
    "com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/YearlyConsumption"
],
    function (UserAccount, DatePicker, MonthlyConsumption, RegisterInput, UtilitiesProductsWithPrices, YearlyConsumption) {
        "use strict";
        let db = null;
        const request = indexedDB.open('dssa-ui-session', 1);

        const ready = new Promise((resolve) => {
            request.onsuccess = (event) => {
                db = event.target.result;
                resolve();
            };
        });

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            if (!db.objectStoreNames.contains('session')) {
                db.createObjectStore('session', { keyPath: 'id', autoIncrement: true });
            }
        };
        request.onerror = (event) => {
            console.error('Database error: ' + event.target.errorCode);
            db = null;
        };

        const addData = (sStore, oData) => {
            const tx = db.transaction(sStore, 'readwrite');
            const store = tx.objectStore(sStore);
            return store.add(oData);
        }

        const updateData = (sStore, oData) => {
            const tx = db.transaction(sStore, 'readwrite');
            const store = tx.objectStore(sStore);
            return store.put(oData);
        }

        return {
            ready: ready,
            addSession: function (oData) {
                return addData('session', oData);
            },
            updateSession: function (oData) {
                return updateData('session', oData);
            },
            getSession: function () {
                const tx = db.transaction('session', 'readonly');
                const store = tx.objectStore('session');
                return new Promise((resolve) => {
                    const data = [];
                    store.openCursor().onsuccess = (event) => {
                        const cursor = event.target.result;
                        if (cursor) {
                            data.push(cursor.value);
                            cursor.continue();
                        } else {
                            resolve(data);
                        }
                    }
                });
            },
            clearSession: function () {
                const tx = db.transaction('session', 'readwrite');
                const store = tx.objectStore('session');
                return store.clear();
            },

            // formatters
            UserAccount: UserAccount,
            DatePicker: DatePicker,
            MonthlyConsumption: MonthlyConsumption,
            RegisterInput: RegisterInput,
            UtilitiesProductsWithPrices: UtilitiesProductsWithPrices,
            YearlyConsumption: YearlyConsumption
        }
    });

/* eslint-disable guard-for-in */
/* eslint-disable quotes */
sap.ui.define(
  ["com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/Formatter"],
  function (Formatter) {
    "use strict";
    class UtilitiesProductWithPrices extends Formatter {
      static #top = 3;
      static #skip = 0;
      static #aCards = [];
      static formatPrice(utilitiesProduct) {
        const oneTimeCharge = utilitiesProduct.oneTimeCharge;
        const recurringCharge = parseFloat(
          utilitiesProduct.recurringCharge[0]
            ? utilitiesProduct.recurringCharge[0].utilsPriceAmount
            : "0"
        );
        const usageCharge = parseFloat(
          utilitiesProduct.usageCharge[0]
            ? utilitiesProduct.usageCharge[0].utilsPriceAmount
            : "0"
        );
        
        // Handle both object format {activationFee: {utilsPriceAmount: ...}} and array format [{utilsPriceAmount: ...}, ...]
        let activationFeeAmount, terminationFeeAmount;
        if (Array.isArray(oneTimeCharge)) {
          // Array format: [activationFee, terminationFee]
          activationFeeAmount = oneTimeCharge[0]?.utilsPriceAmount || "0.00";
          terminationFeeAmount = oneTimeCharge[1]?.utilsPriceAmount || "0.00";
        } else if (oneTimeCharge && typeof oneTimeCharge === 'object') {
          // Object format: {activationFee: {utilsPriceAmount: ...}, terminationFee: {utilsPriceAmount: ...}}
          activationFeeAmount = oneTimeCharge.activationFee?.utilsPriceAmount || "0.00";
          terminationFeeAmount = oneTimeCharge.terminationFee?.utilsPriceAmount || "0.00";
        } else {
          // Fallback
          activationFeeAmount = "0.00";
          terminationFeeAmount = "0.00";
        }
        
        const formattedOneTimeChargeActivationFee =
          activationFeeAmount +
          " " +
          UtilitiesProductWithPrices.I18n.label("EUR");
        const formattedOneTimeChargeTerminationFee =
          terminationFeeAmount +
          " " +
          UtilitiesProductWithPrices.I18n.label("EUR");
        const formattedUsageCharge =
          usageCharge.toFixed(2) +
          " " +
          UtilitiesProductWithPrices.I18n.label("EUR") +
          "/" +
          (utilitiesProduct.usageCharge[0]?.utilsMeasurementUnit || "KWH") +
          "   (Consumption From " +
          ( utilitiesProduct.usageCharge[0]?.utilsPriceFromBlock || "0" ) + (utilitiesProduct.usageCharge[0]?.utilsMeasurementUnit || "KWH") +
          " To " +
          ( utilitiesProduct.usageCharge[0]?.utilsPriceToBlock || "0" )  + (utilitiesProduct.usageCharge[0]?.utilsMeasurementUnit || "KWH") +
          ") ";
        const formattedPricing = `${UtilitiesProductWithPrices.I18n.label(
          "ActivationFee"
        )}: ${formattedOneTimeChargeActivationFee}\n${UtilitiesProductWithPrices.I18n.label(
          "TerminationFee"
        )}: ${formattedOneTimeChargeTerminationFee}\n${UtilitiesProductWithPrices.I18n.label(
          "UsageCharge"
        )}: ${formattedUsageCharge}`;

        return {
          utilitiesProduct: utilitiesProduct.product.utilitiesProduct,
          usageCharge: formattedUsageCharge,
          oneTimeChargeActivationFee: formattedOneTimeChargeActivationFee,
          oneTimeChargeTerminationFee: formattedOneTimeChargeTerminationFee,
          formattedPricing: formattedPricing,
        };
      }
      static toUI5Card(message) {
        UtilitiesProductWithPrices.#top = 3;
        UtilitiesProductWithPrices.#skip = 0;
        UtilitiesProductWithPrices.#aCards = [];
        const utilitiesProducts = UtilitiesProductWithPrices.parse(
          message.content
        );
        let aProducts = [];
        if (Array.isArray(utilitiesProducts)) {
          aProducts = utilitiesProducts;
        } else {
          aProducts.push(utilitiesProducts);
        }
        UtilitiesProductWithPrices.#aCards = aProducts.map(
          (utilitiesProduct) => {
            const formatted = this.formatPrice(utilitiesProduct);
            return {
              "sap.card": {
                type: "Object",
                extension: "controller/UI5CardExtension",
                header: {
                  icon: {
                    src: "sap-icon://customer-order-entry",
                  },
                  title: utilitiesProduct.product.productDescription,
                  subTitle: formatted.formattedPricing,
                  actions: [
                    {
                      type: "Custom",
                      parameters: {
                        method: "postMessage",
                        text: UtilitiesProductWithPrices.I18n.label("ISelect", [
                          utilitiesProduct.product.productDescription,
                          formatted.utilitiesProduct,
                        ]),
                      },
                    },
                  ],
                },
              },
              "dssa.style.class": "dssaUtilitiesProductWithPrices",
            };
          }
        );
        const { cards, hasMore } = UtilitiesProductWithPrices.#executePaging(
          UtilitiesProductWithPrices.#aCards
        );
        if (hasMore && cards.length > 0) {
          cards[cards.length - 1]["dssa.card.buttons"] = [
            {
              label: UtilitiesProductWithPrices.I18n.label("ShowMoreProducts"),
              press: {
                "dssa.card.growing": UtilitiesProductWithPrices.growing,
              },
            },
          ];
        }
        return cards;
      }
      /**
       * Execute paging for the given cards per the top and skip values. Same concept as OData paging.
       * @param {*} aCards
       */
      static #executePaging(aCards) {
        const iFrom = UtilitiesProductWithPrices.#skip;
        if (
          aCards.length >
          UtilitiesProductWithPrices.#top + UtilitiesProductWithPrices.#skip
        ) {
          UtilitiesProductWithPrices.#skip += UtilitiesProductWithPrices.#top;
          return {
            cards: aCards.slice(iFrom, UtilitiesProductWithPrices.#top + iFrom),
            hasMore: true,
          };
        }
        return {
          cards: aCards.slice(iFrom, UtilitiesProductWithPrices.#top + iFrom),
          hasMore: false,
        };
      }

      static growing(oEvent) {
        const { cards, hasMore } = UtilitiesProductWithPrices.#executePaging(
          UtilitiesProductWithPrices.#aCards
        );
        const oChatMessagesModel = oEvent.getSource().getModel("chatMessages");
        const aChatMessages = oChatMessagesModel.getData();
        // remove current show more button
        aChatMessages.pop();
        // add new cards
        cards.forEach((card) => {
          aChatMessages.push({
            from: "Bot",
            type: "ui5Card",
            manifest: {
              "sap.app": { id: "com.sap.utl.ai.ui.dssa.ui5IC" },
              ...card,
            },
          });
        });
        if (hasMore) {
          // add a new show more button
          aChatMessages.push({
            from: "Bot",
            type: "buttons",
            buttons: {
              parent: "Card",
              buttons: [
                {
                  label:
                    UtilitiesProductWithPrices.I18n.label("ShowMoreProducts"),
                  press: {
                    "dssa.card.growing": UtilitiesProductWithPrices.growing,
                  },
                },
              ],
            },
          });
        }
        oChatMessagesModel.setData(aChatMessages);
        setTimeout(() => {
          // scroll to the bottom of the chat
          const oList = oEvent.getSource().getParent().getParent();
          oList.scrollToIndex(aChatMessages.length - 1);
        });
      }
    }
    return UtilitiesProductWithPrices;
  }
);

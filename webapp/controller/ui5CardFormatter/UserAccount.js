/* eslint-disable guard-for-in */
/* eslint-disable quotes */
sap.ui.define(
  ["com/sap/utl/ai/ui/dssa/controller/ui5CardFormatter/Formatter"],
  function (Formatter) {
    "use strict";
    class AccountBalance extends Formatter {
      static #aServices = []
      static toUI5Card(message) {
        const balance = AccountBalance.parse(message.content);
        if (balance.userDataType === "AllAccountsBalance") {
          return AccountBalance.#getAllAccountsBalance(balance);
        } else if (balance.userDataType === "ContractAccountBillDetails") {
          return AccountBalance.#getContractAccountBillDetails(balance);
        } else if (balance.userDataType === "ContractInformation") {
          AccountBalance.#aServices = balance.serviceDetails.map(service => service.serviceName);
          return AccountBalance.#getContractInformation(balance);
        }
      }

      static #getContractInformation(balance) {
        const aGroups = [
          {
            "title": AccountBalance.I18n.label("Premises"),
            "items": []
          },
          {
            "title": " ",
            "items": []
          },
          {
            "title": AccountBalance.I18n.label("Contracts"),
            "items": []
          },
          {
            "title": " ",
            "items": []
          }
        ];
        for (let i = 0; i < balance.premises.length; i++) {
          // premise ID
          const premise = balance.premises[i];
          aGroups[0].items.push({
            "label": "",
            "value": premise.premiseID
          });
          // premise short form
          aGroups[1].items.push({
            "label": "",
            "value": premise.shortForm
          });
        }
        for (let i = 0; i < balance.contracts.length; i++) {
          // contract ID
          const contract = balance.contracts[i];
          aGroups[2].items.push({
            "label": "",
            "value": contract.contractID
          });
          // contract description
          aGroups[3].items.push({
            "label": "",
            "value": contract.description
          });
        }
        return [
          {
            "sap.card": {
              type: "Object",
              extension: "controller/UI5CardExtension",
              header: {
                icon: { src: "sap-icon://customer-order-entry", shape: "Square" },
                title: AccountBalance.I18n.label("DetailsOfContractAccount"),
                subTitle: `${balance.contractAccountID || ""}`
              },
              content: {
                groups: aGroups
              }
            },
            "dssa.style.class": "dssaUI5CardContractInformation",
            "dssa.card.delegate": {
              onAfterRendering: AccountBalance.onCustomerDetailsAfterRendering,
            },
            "dssa.card.formatter.name": "UserAccount"
          }
        ];
      }

      static #getContractAccountBillDetails(balance) {
        const contractAccount = balance.userContractAccountBalances[0];
        return [
          {
            "sap.card": {
              type: "Object",
              extension: "controller/UI5CardExtension",
              header: {
                title: AccountBalance.I18n.label("ContractAccountID", [contractAccount.contractAccountID]),
                subTitle: `${AccountBalance.#formatAmount((contractAccount.currentBalance))} ${contractAccount.currency}**${AccountBalance.#getDateTimeString()}`
              },
              content: {
                groups: [
                  {
                    items: [
                      {
                        label: AccountBalance.I18n.label("CurrentBalance"),
                        value: AccountBalance.#formatAmount((contractAccount.currentBalance)) + " " + contractAccount.currency,
                        showColon: false
                      },
                      {
                        label: AccountBalance.I18n.label("NetAmount"),
                        value: AccountBalance.#formatAmount(contractAccount.netAmount) + " " + contractAccount.currency,
                        showColon: false
                      },
                      {
                        label: AccountBalance.I18n.label("OpenDebits"),
                        value: AccountBalance.#formatAmount(contractAccount.openDebits) + " " + contractAccount.currency,
                        showColon: false
                      }
                    ]
                  },
                  {
                    items: [
                      {
                        label: AccountBalance.I18n.label("TotalAmount"),
                        value: AccountBalance.#formatAmount(contractAccount.totalAmount) + " " + contractAccount.currency,
                        showColon: false
                      },
                      {
                        label: AccountBalance.I18n.label("OpenCollectables"),
                        value: AccountBalance.#formatAmount(contractAccount.openCollectable) + " " + contractAccount.currency,
                        showColon: false
                      },
                      {
                        label: AccountBalance.I18n.label("OpenCredits"),
                        value: AccountBalance.#formatAmount(contractAccount.openCredits) + " " + contractAccount.currency,
                        showColon: false
                      }
                    ]
                  }
                ],
              },
            },
            "dssa.style.class": "dssaUI5CardAccountBalance", // to apply dedicated CSS styles for account balance cards
            "dssa.card.delegate": {
              onAfterRendering: AccountBalance.onDetailsAfterRendering,
            },
            "dssa.card.formatter.name": "UserAccount"
          },
        ];
      }

      static #getDateTimeString() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `(${year}-${month}-${day} ${hours}:${minutes})`;
      }
      static #getAllAccountsBalance(balance) {
        return [
          {
            "sap.card": {
              type: "Object",
              extension: "controller/UI5CardExtension",
              header: {
                title: AccountBalance.I18n.label("AccountBalance"),
                subTitle: `${AccountBalance.#formatAmount((balance.totalBalance))} ${balance.currency}**${AccountBalance.#getDateTimeString()}`
              },
              content: {
                groups: AccountBalance.#buildAllABGroups(balance)
              }
            },
            "dssa.style.class": "dssaUI5CardAccountBalance", // to apply dedicated CSS styles for account balance cards
            "dssa.card.delegate": {
              onAfterRendering: AccountBalance.onAllABAfterRendering,
            },
            "dssa.card.formatter.name": "UserAccount"
          },
        ];
      }
      static #buildAllABGroups(balance) {
        // there are total 4 groups
        const groupContractAccount = {
          items: [
            {
              label: AccountBalance.I18n.label("ContractAccount"),
              showColon: false
            }
          ]
        };
        const groupCurrentBalance = {
          items: [
            {
              label: AccountBalance.I18n.label("CurrentBalance"),
              showColon: false
            }
          ]
        };
        for (let i = 0; i < balance.contractAccounts.length; i++) {
          const item = balance.contractAccounts[i];
          groupContractAccount.items.push({
            value: item.contractAccountID + (item.description ? ` ${item.description}` : "")
          });
          groupCurrentBalance.items.push({
            value: AccountBalance.#formatAmount((item.contractAccountBalance)) + " " + balance.currency
          });
        }
        const groupTotalDebit = {
          title: balance.totalBalance > 0 ? AccountBalance.I18n.label("TotalCredit") : AccountBalance.I18n.label("TotalDebit"),
          items: []
        };
        const groupTotalSum = {
          title: AccountBalance.#formatAmount((balance.totalBalance)) + " " + balance.currency,
          items: []
        };
        return [
          groupContractAccount,
          groupCurrentBalance,
          groupTotalDebit,
          groupTotalSum
        ];
      }

      static adjustCellHeight(oDivs) {
        for (let i = 0; i < oDivs.length; i += 2) {
          let oLeftCells = oDivs[i].querySelectorAll("span");
          let oRightCells = oDivs[i + 1].querySelectorAll("span");
          for (let i = 0; i < oLeftCells.length; i++) {
            if (i === 0) {
              oRightCells[i].style.height = `${oLeftCells[i].clientHeight}px`;
            } else {
              oLeftCells[i].style.height = `${oRightCells[i].clientHeight}px`;
              oRightCells[i].style.height = `fit-content`;
            }
            oLeftCells[i].style["align-content"] = `center`;
          }
        }
      }

      static onCustomerDetailsAfterRendering(oEvent) {
        const oCardDomRef = oEvent.srcControl.getDomRef();
        const oCardHeaderDomRef = oEvent.srcControl?.getCardHeader()?.getDomRef();
        if (oCardHeaderDomRef) {
          const aDom = [oCardDomRef, oCardHeaderDomRef, oCardHeaderDomRef.firstChild];
          for (let i = 0; i < AccountBalance.#aServices.length; i++) {
            aDom[i]?.classList.add(`dssaUI5CardContractInformationServiceTypeIndicator${i}`);
            aDom[i]?.setAttribute("dssa-service-type", AccountBalance.#aServices[i]);
          }
        }
        const oCardContentDomRef = oEvent.srcControl?.getCardContent()?.getDomRef();
        if (oCardContentDomRef) {
          //get four div elements with class sapUiAFLayoutItem
          const oDivs = oCardContentDomRef.querySelectorAll(`div[class="sapUiAFLayoutItem"]`);
          const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
              AccountBalance.adjustCellHeight(oDivs);
            }
          });
          resizeObserver.observe(oCardContentDomRef);
        }
      }

      static onDetailsAfterRendering(oEvent) {
        AccountBalance.#adjustSubTitle(oEvent);
        const oCardContentDomRef = oEvent.srcControl?.getCardContent()?.getDomRef();
        if (oCardContentDomRef) {
          const aValueSpan = oCardContentDomRef.querySelectorAll(".sapMText");
          for (let i = 0; i < aValueSpan.length; i++) {
            const oSpan = aValueSpan[i];
            if (oSpan.innerText.substring(0, 1) === "-") {
              oSpan.classList.add("dssaUI5CardAccountBalanceAmountNegative");
            } else {
              oSpan.classList.add("dssaUI5CardAccountBalanceAmountPositive");
            }
          }
        }
      }

      static onAllABAfterRendering(oEvent) {
        AccountBalance.#adjustSubTitle(oEvent);

        const oCardContentDomRef = oEvent.srcControl?.getCardContent()?.getDomRef();
        if (oCardContentDomRef) {
          //get four div elements with class sapUiAFLayoutItem
          const oDivs = oCardContentDomRef.querySelectorAll(`div[class="sapUiAFLayoutItem"]`);
          oDivs[1].style["padding-left"] = "1.5rem";
          const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
              AccountBalance.#adjustAmountCellHeight(oDivs);
            }
          });
          resizeObserver.observe(oCardContentDomRef);
          // give addtional class to the third div element
          if (oDivs.length > 2) {
            oDivs[2].classList.add("dssaUI5CardAccountBalanceTotalDebitCell");
          }
          // give addtional class to the fourth div element
          if (oDivs.length > 3) {
            oDivs[3].classList.add("dssaUI5CardAccountBalanceSumCell");
            const oSpan = oDivs[3].querySelector("span");
            if (oSpan?.innerText.substring(0, 1) === "-") {
              oSpan.classList.add("dssaUI5CardAccountBalanceAmountNegative");
            }
            else {
              oSpan.classList.add("dssaUI5CardAccountBalanceAmountPositive");
            }
          }
        }
      }

      static #adjustSubTitle(oEvent) {
        const oCardHeaderDomRef = oEvent.srcControl?.getCardHeader()?.getDomRef();
        if (oCardHeaderDomRef) {
          // get span element with class sapMTextMaxLine sapMTextLineClamp, the span is under a div with class sapFCardHeaderTextSecondLine
          const oSpan = oCardHeaderDomRef.querySelector(".sapFCardHeaderTextSecondLine .sapMTextMaxLine.sapMTextLineClamp");

          // remove these two classes
          if (oSpan) {
            oSpan.classList.remove("sapMTextMaxLine", "sapMTextLineClamp");
          }
          const parts = oSpan?.innerText?.split("**");
          oSpan.innerText = parts?.[0] || ""; // set the first part as the text of the span

          // give class dssaUI5CardAccountBalanceSubtitleAmount to the span
          oSpan.classList.add("dssaUI5CardAccountBalanceSubtitleAmount");
          if (oSpan.innerText.substring(0, 1) === "-") {
            oSpan.classList.add("dssaUI5CardAccountBalanceAmountNegative");
          } else {
            oSpan.classList.add("dssaUI5CardAccountBalanceAmountPositive");
          }
          // create a new span element with class dssaUI5CardAccountBalanceSubtitleDateTime
          const oDateTimeSpan = document.createElement("span");
          oDateTimeSpan.classList.add("dssaUI5CardAccountBalanceSubtitleDateTime");
          oDateTimeSpan.innerText = ` ${parts?.[1] || ""}`; // set the second part as the text of the new span

          // add the new span as the direct sibling to oSpan
          oSpan.parentNode.insertBefore(oDateTimeSpan, oSpan.nextSibling);
        }
      }

      static #adjustAmountCellHeight(oDivAFLayoutItem) {
        // get concerned cells
        const oLeftCells = oDivAFLayoutItem[0]?.firstChild?.childNodes;
        const oRightCells = oDivAFLayoutItem[1]?.firstChild?.childNodes;
        if (!oLeftCells || !oRightCells || oLeftCells.length < 2 || oRightCells.length < 2) {
          return; // no cells found
        }

        for (let i = 1; i < oLeftCells.length; i++) {
          if (oLeftCells[i] && oRightCells[i]) {
            // set the height of the right cell to the height of the left cell
            oRightCells[i].style.height = `${oLeftCells[i].clientHeight}px`;
            oRightCells[i].style["align-content"] = `center`;
            if (oRightCells[i].innerText.substring(0, 1) === "-") {
              oRightCells[i].classList.add("dssaUI5CardAccountBalanceAmountNegative");
            }
            else {
              oRightCells[i].classList.add("dssaUI5CardAccountBalanceAmountPositive");
            }
          }
        }
      }

      static #formatAmount(value) {
        if (value === undefined || value === null) {
          return "";
        }
        const numericValue = parseFloat(value);
        if (isNaN(numericValue)) {
          return value; // return original value if it's not a number
        }
        return numericValue.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          style: "decimal"
        });
      }
    }
    return AccountBalance;
  }
);

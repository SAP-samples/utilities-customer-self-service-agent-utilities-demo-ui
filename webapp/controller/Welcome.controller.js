sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "com/sap/utl/ai/ui/dssa/controller/MessageInput",
    "com/sap/utl/ai/ui/dssa/controller/MoreOptions",
    "sap/m/MessageBox",
    "com/sap/utl/ai/ui/dssa/controller/UserList"
  ],
  function (
    BaseController,
    MessageInput,
    MoreOptions,
    MessageBox,
    UserList
  ) {
    "use strict";
    const oMessageInput = new MessageInput();
    const welcome = BaseController.extend(
      "com.sap.utl.ai.ui.dssa.controller.Welcome",
      {
        onInit: function () {
          const oComponent = this.getOwnerComponent();
          this._oCAPModel = oComponent.getModel();
          this._fnResolveSessionId = null;
          this._fnRejectSessionId = null;
          this._sessionIdReady = new Promise((resolve, reject) => {
            this._fnResolveSessionId = resolve;
            this._fnRejectSessionId = reject;
          });
          this._bInMockMode = this.getOwnerComponent()?.getComponentData()?.dssaMock || false;
          if (this._bInMockMode) {
            // session ID is not needed in mock mode
            this._fnResolveSessionId();
          }

          this._oMessageInput = oMessageInput;
          this._oMessageInput.init(this);
          this.onMessageInputLiveChange =
            this._oMessageInput.onMessageInputLiveChange.bind(
              this._oMessageInput
            );
          // TEMPORARY: Fetch the entity container to determine which services are available, Kyma CAP or local Mock
          this.getOwnerComponent()
            .getModel()
            .getMetaModel()
            .fetchEntityContainer();
          this.getOwnerComponent()
            .getModel("testCase")
            .getMetaModel()
            .fetchEntityContainer();

          // if any files are passed to the component, set them in the configText model
          // this is used to display the files in the welcome screen
          const oConfigTextModel = this.getOwnerComponent().getModel("configText");
          const dssaSourceFiles = this.getOwnerComponent().dssaSourceFiles || {};
          for (const key of Object.keys(dssaSourceFiles)) {
            const sFilePath = URL.createObjectURL(dssaSourceFiles[key]);
            oConfigTextModel.setProperty(key, `${sFilePath}??${dssaSourceFiles[key].type}`);
          }
          window.dssaSessionDataChecked.then(() => {
            if (!window.dssaSessionData) {
              this._pUserInfoLoaded = new Promise((resolve) => {
                const oUserModel = this.getOwnerComponent().getModel("user");
                const oUserData = oUserModel.getData();
                if (oUserData) {
                  // User data is already loaded
                  resolve(oUserData);
                } else {
                  oUserModel.attachEventOnce("requestCompleted", () => {
                    resolve(oUserModel.getData());
                  });
                }
              });
            }
          });
        },
        postMessage: function (sPassedQuestion) {
          this.byId("message-flexbox")?.setBusyIndicatorDelay(0);
          this.byId("message-flexbox")?.setBusy(true);
          this._sessionIdReady.then(() => {
            // get the session ID from backend successfully, allow to navigate to the chat page
            this.byId("message-flexbox")?.setBusy(false);
            const oNavContainer = this.getView().getParent();
            const sQuestion = sPassedQuestion ? sPassedQuestion : this._oMessageInput.getMessageInputValue();
            oNavContainer.to(
              oNavContainer.getPages()[1],
              "fade",
              sQuestion
            );
          }, error => {
            // if session ID is not available, show an error message
            this.byId("message-flexbox")?.setBusy(false);
            MessageBox.error(error.message || "Failed to fetch session ID. Please refresh and try again.");
          });

        },
        onBeforeRendering: function () {
          const oComponent = this.getOwnerComponent();
          if (oComponent.bPreview) {
            return;
          }
          window.dssaSessionDataChecked.then(() => {
            if (window.dssaSessionData && !this._sessionRestored) {
              const oSelectedUser = {
                userId: window.dssaSessionData.httpHeaders["ucssa-userid"],
                userName: window.dssaSessionData.httpHeaders["ucssa-username"],
                businessPartner: window.dssaSessionData.httpHeaders["ucssa-bps"]
              };
              UserList.setSelectedUser(oSelectedUser);
              const oUserModel = this.getOwnerComponent().getModel("user");
              oUserModel.setProperty("/firstname", oSelectedUser.userName);
              const oNavContainer = this.getView().getParent();
              oComponent._sAgentSessionId = window.dssaSessionData.sessionId;
              this._setHttpHeaders(oSelectedUser)
              this._sessionRestored = true;
              oNavContainer.to(
                oNavContainer.getPages()[1],
                "fade",
                {
                  restoredSession: true
                }
              );
              return;
            }
          });
        },
        onAfterRendering: function () {
          if (window.dssaSessionData) {
            return;
          }
          const oComponent = this.getOwnerComponent();
          if (oComponent.bPreview) {
            return;
          }
          window.dssaSessionDataChecked.then(() => {
            if(this._pUserInfoLoaded === undefined){
              return;
            }
            this._pUserInfoLoaded.then(oUserInfo => {
              return UserList.openDialog();
            }).then(oSelectedUser => {
              const oUserModel = this.getOwnerComponent().getModel("user");
              oUserModel.setProperty("/firstname", oSelectedUser.userName);
              const oMetaModel = this._oCAPModel.getMetaModel();
              if (oMetaModel && oMetaModel.oMetadataPromise && !oComponent._sAgentSessionId) {
                // Metadata is already loaded
                this._setHttpHeaders(oSelectedUser);
                // call v4 OData action createSession to fetch a backend sessionId for currert user session
                oMetaModel.oMetadataPromise.then(async () => {
                  const oContext = this._oCAPModel.bindContext("/Conversation.createSession(...)");
                  try {
                    await oContext.invoke("$auto");
                    const res = oContext.getBoundContext().getObject();
                    oComponent._sAgentSessionId = res.sessionId;
                    // Resolve the session ID promise with the sessionId
                    this._fnResolveSessionId(res.sessionId);
                    // check if any message is returned by createSession action, if yes, display it
                    const aMessages = this._oCAPModel.getMessagesByPath("");
                    if (aMessages && aMessages.length > 0) {
                      MessageBox.warning(aMessages[0].message);
                    }
                  } catch (error) {
                    this._fnRejectSessionId(error);
                  }
                }, error => {
                  // If metadata loading fails, reject the session ID promise
                  this._fnRejectSessionId(error);
                });
              }
              const oInput = this.byId("message-input");
              setTimeout(() => {
                oInput.focus();
              }, 10);
            });

          });

        },
        getHeadImageSrc: function (sSrc) {
          if (!sSrc) {
            return "";
          }
          return sSrc.split("??")[0];
        },

        getUserName: function (sConfig, sUserName, sI18n) {
          if (sConfig) {
            return sConfig.replace("@UserName", sUserName);
          } else {
            return `${sI18n} ${sUserName}`;
          }
        },

        _setHttpHeaders: function (oSelectedUser) {
          const oHttpHeaders = this._oCAPModel.getHttpHeaders();
          oHttpHeaders["UCSSA-Timezone"] = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (oSelectedUser) {
            oHttpHeaders["ucssa-userid"] = oSelectedUser.userId;
            oHttpHeaders["ucssa-username"] = oSelectedUser.userName;
            oHttpHeaders["ucssa-bps"] = oSelectedUser.businessPartner;
          }
          this._oCAPModel.changeHttpHeaders(oHttpHeaders);
        },

        confirmChangeUser: function () {
          UserList.confirmChangeUser();
        }
      }
    );

    welcome.prototype.onMessageInputLiveChange = oMessageInput.onMessageInputLiveChange.bind(oMessageInput);
    welcome.prototype.clearMessageInput = oMessageInput.clearMessageInput.bind(oMessageInput);
    welcome.prototype.openMoreOptionsMenu = MoreOptions.openMenu.bind(MoreOptions);

    return welcome;
  }
);

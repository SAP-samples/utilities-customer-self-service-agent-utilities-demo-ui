sap.ui.define(["sap/ui/core/Control"], function (Control) {
    var WelcomeBackground = Control.extend("com.sap.utl.ai.ui.dssa.WelcomeGreeting", {
        metadata: {
            properties: {
                greetingUser: { type: "string", defaultValue: "" },
                greetingWelcome: { type: "string", defaultValue: "" },
                greetingText: { type: "string", defaultValue: "" },
                greetingTextQuestion: { type: "string", defaultValue: "" }
            }
        },
        renderer: {
            apiVersion: 2,
            render: function (oRm, oControl) {
                // put a div with class dssaWelcomeGreeting
                oRm.openStart("div", oControl.getId()).class("dssaWelcomeGreeting").class("sapUiSmallMarginBegin").class("sapUiSmallMarginEnd").attr("data-sap-ui", oControl.getId()).openEnd();
                 // put a <h1> tag with the user name
                oRm.openStart("h3", "dssa-ctl-greun").class("dssaWelcomeGreetingUserName").class("sapUiLargeMarginTop").openEnd();
                oRm.text(oControl.getGreetingUser() + "!");
                oRm.close("h3");
                // put 'Welcome' text with large font size
                oRm.openStart("p", "dssa-ctl-grewt").class("dssaWelcomeGreetingWelcomeTitle").class("sapUiSmallMarginTop").class("sapUiTinyMarginBottom").openEnd();
                oRm.text(oControl.getGreetingWelcome());
                oRm.close("p");
                // put formal greeting with the company name
                oRm.openStart("h2", "dssa-ctl-gret").class("dssaWelcomeGreetingText").class("sapUiSmallMarginTop").openEnd();
                oRm.text(oControl.getGreetingText());
                oRm.close("h2");
                // put welcome question
                oRm.openStart("h2", "dssa-ctl-que").class("dssaWelcomeGreetingTextQuestion").class("sapUiSmallMarginTop").openEnd();
                oRm.text(oControl.getGreetingTextQuestion());
                oRm.close("h2");

                oRm.close("div");
            }
        }
    });


    return WelcomeBackground
});
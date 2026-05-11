sap.ui.define(["sap/ui/core/Control"], function (Control) {
    "use strict";
    return Control.extend("com.sap.utl.ai.ui.dssa.WelcomeBackground", {
        metadata: {
            properties: {
                src: { type: "string", defaultValue: "" }
            }
        },
        renderer: {
            apiVersion: 2,
            render: function (oRm, oControl) {
                // put a div with class dssaWelcomeBackground
                oRm.openStart("div", oControl.getId()).class("dssaWelcomeBackground").attr("data-sap-ui", oControl.getId()).openEnd();
                const aSrc = oControl.getSrc().split("??");
                if (aSrc.length === 1 || (aSrc.length === 2 && aSrc[1].startsWith("video"))) {
                    oRm.unsafeHtml(`<video id="background-video" muted autoplay loop playsinline><source src="${aSrc[0]}"></video>`);
                } else if (aSrc.length === 2 && aSrc[1].startsWith("image")) {
                    oRm.unsafeHtml(`<img src="${aSrc[0]}" class="dssaWelcomeBackgroundImage"></img>`);
                }
                oRm.close("div");
            }
        }
    });
});
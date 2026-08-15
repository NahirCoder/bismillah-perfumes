/* =========================================================
   STORE INFORMATION
   BISMILLAH PERFUMES
   ========================================================= */

import {
    requireLogin
} from "./auth.js";

import { supabase } from "./supabase.js";


let storeSettings = null;


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   LOAD STORE SETTINGS
   ========================================================= */

async function fetchStoreSettings() {

    const {
        data,
        error
    } =
        await supabase
            .from("store_settings")
            .select("*")
            .limit(1)
            .maybeSingle();


    if (error)
        throw error;


    return data;

}


/* =========================================================
   STAFF LOAD
   ========================================================= */

async function loadStaffStore() {

    const form =
        document.getElementById(
            "storeForm"
        );


    if (!form) return;


    try {

        storeSettings =
            await fetchStoreSettings();


        if (!storeSettings)
            return;


        setValue(
            "storeBusinessName",
            storeSettings.business_name
        );


        setValue(
            "storePhone",
            storeSettings.phone
        );


        setValue(
            "storeWhatsApp",
            storeSettings.whatsapp
        );


        setValue(
            "storeEmail",
            storeSettings.email
        );


        setValue(
            "storeTikTok",
            storeSettings.tiktok
        );


        setValue(
            "storeAbout",
            storeSettings.description
        );


        setValue(
            "storeAddress",
            storeSettings.address
        );


        const logoPreview =
            document.getElementById(
                "storeLogoPreview"
            );


        if (
            logoPreview &&
            storeSettings.logo_url
        ) {

            logoPreview.src =
                storeSettings.logo_url;

            logoPreview.hidden =
                false;

        }

    }

    catch (error) {

        console.error(
            "Store loading error:",
            error
        );

    }

}


/* =========================================================
   SET VALUE
   ========================================================= */

function setValue(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.value =
            value || "";

    }

}


/* =========================================================
   SAVE STORE SETTINGS
   ========================================================= */

async function saveStore(event) {

    event.preventDefault();


    if (
        !(await requireLogin())
    )
        return;


    try {

        const payload = {

            business_name:
                document.getElementById(
                    "storeBusinessName"
                ).value.trim(),


            phone:
                document.getElementById(
                    "storePhone"
                ).value.trim(),


            whatsapp:
                document.getElementById(
                    "storeWhatsApp"
                ).value.trim(),


            email:
                document.getElementById(
                    "storeEmail"
                ).value.trim(),


            tiktok:
                document.getElementById(
                    "storeTikTok"
                ).value.trim(),


            description:
                document.getElementById(
                    "storeAbout"
                ).value.trim(),


            address:
                document.getElementById(
                    "storeAddress"
                ).value.trim()

        };


        const file =
            document.getElementById(
                "storeLogo"
            )
            ?.files?.[0];


        if (file) {

            payload.logo_url =
                await window.uploadImage(
                    file,
                    "store-images"
                );

        }


        if (storeSettings?.id) {

            const {
                error
            } =
                await supabase
                    .from("store_settings")
                    .update(payload)
                    .eq(
                        "id",
                        storeSettings.id
                    );


            if (error)
                throw error;

        }

        else {

            const {
                data,
                error
            } =
                await supabase
                    .from("store_settings")
                    .insert([
                        payload
                    ])
                    .select()
                    .single();


            if (error)
                throw error;


            storeSettings =
                data;

        }


        alert(
            "Store information updated successfully."
        );


        await loadStaffStore();

    }

    catch (error) {

        console.error(error);


        alert(
            error.message ||
            "Could not save store information."
        );

    }

}


/* =========================================================
   PUBLIC STORE INFORMATION
   ========================================================= */

async function loadPublicStore() {

    try {

        const settings =
            await fetchStoreSettings();


        if (!settings)
            return;


        storeSettings =
            settings;


        /*
           Business name
        */

        document
            .querySelectorAll(
                "[data-store-name]"
            )
            .forEach(
                element => {

                    element.textContent =
                        settings.business_name ||
                        "Bismillah Perfumes";

                }
            );


        /*
           Description
        */

        document
            .querySelectorAll(
                "[data-store-description]"
            )
            .forEach(
                element => {

                    element.textContent =
                        settings.description ||
                        "";

                }
            );


        /*
           Phone
        */

        document
            .querySelectorAll(
                "[data-store-phone]"
            )
            .forEach(
                element => {

                    element.textContent =
                        settings.phone ||
                        "";

                }
            );


        /*
           Email
        */

        document
            .querySelectorAll(
                "[data-store-email]"
            )
            .forEach(
                element => {

                    element.textContent =
                        settings.email ||
                        "";

                }
            );


        /*
           Address
        */

        document
            .querySelectorAll(
                "[data-store-address]"
            )
            .forEach(
                element => {

                    element.textContent =
                        settings.address ||
                        "";

                }
            );


        /*
           Logo
        */

        document
            .querySelectorAll(
                "[data-store-logo]"
            )
            .forEach(
                image => {

                    if (
                        settings.logo_url
                    ) {

                        image.src =
                            settings.logo_url;

                    }

                }
            );


        /*
           TikTok
        */

        document
            .querySelectorAll(
                "[data-store-tiktok]"
            )
            .forEach(
                link => {

                    if (
                        settings.tiktok
                    ) {

                        link.href =
                            settings.tiktok;

                        link.target =
                            "_blank";

                        link.rel =
                            "noopener noreferrer";

                    }

                }
            );


        /*
           WhatsApp
        */

        document
            .querySelectorAll(
                "[data-store-whatsapp]"
            )
            .forEach(
                link => {

                    if (
                        settings.whatsapp
                    ) {

                        const number =
                            String(
                                settings.whatsapp
                            )
                            .replace(
                                /\D/g,
                                ""
                            );


                        link.href =
                            `https://wa.me/${number}`;

                        link.target =
                            "_blank";

                        link.rel =
                            "noopener noreferrer";

                    }

                }
            );


        /*
           WhatsApp buttons
        */

        document
            .querySelectorAll(
                "[data-whatsapp]"
            )
            .forEach(
                link => {

                    if (
                        settings.whatsapp
                    ) {

                        const number =
                            String(
                                settings.whatsapp
                            )
                            .replace(
                                /\D/g,
                                ""
                            );


                        link.href =
                            `https://wa.me/${number}`;

                    }

                }
            );

    }

    catch (error) {

        console.error(
            "Public store error:",
            error
        );

    }

}


/* =========================================================
   FORM EVENT
   ========================================================= */

document
    .getElementById(
        "storeForm"
    )
    ?.addEventListener(
        "submit",
        saveStore
    );


/* =========================================================
   INIT
   ========================================================= */

if (
    document.getElementById(
        "storeForm"
    )
) {

    loadStaffStore();

}


if (
    document.querySelector(
        "[data-store-name]"
    ) ||
    document.querySelector(
        "[data-store-whatsapp]"
    )
) {

    loadPublicStore();

}


window.refreshStore =
    loadPublicStore;
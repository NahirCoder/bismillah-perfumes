/* =========================================================
   AUTHENTICATION
   BISMILLAH PERFUMES
   ========================================================= */

import { supabase } from "./supabase.js";


const loginForm =
    document.getElementById("loginForm");

const loginButton =
    document.getElementById("loginButton");

const loginMessage =
    document.getElementById("loginMessage");

const showPassword =
    document.getElementById("showPassword");


/* =========================================================
   MESSAGE
   ========================================================= */

function showMessage(
    message,
    type = "error"
) {

    if (!loginMessage) return;

    loginMessage.hidden = false;

    loginMessage.className =
        `form-message ${type}`;

    loginMessage.textContent =
        message;
}


function clearMessage() {

    if (!loginMessage) return;

    loginMessage.hidden = true;

    loginMessage.textContent = "";
}


/* =========================================================
   PASSWORD VISIBILITY
   ========================================================= */

showPassword?.addEventListener(
    "click",
    () => {

        const password =
            document.getElementById("password");

        if (!password) return;


        const visible =
            password.type === "text";


        password.type =
            visible
                ? "password"
                : "text";


        showPassword.textContent =
            visible
                ? "Show"
                : "Hide";

    }
);


/* =========================================================
   LOGIN
   ========================================================= */

loginForm?.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        clearMessage();


        const email =
            document
                .getElementById("email")
                ?.value
                .trim();


        const password =
            document
                .getElementById("password")
                ?.value;


        if (!email || !password) {

            showMessage(
                "Please enter your email and password."
            );

            return;
        }


        if (loginButton) {

            loginButton.disabled = true;

            loginButton.textContent =
                "Logging in...";

        }


        try {

            const {
                data,
                error
            } =
                await supabase.auth.signInWithPassword({
                    email,
                    password
                });


            if (error) {

                throw error;

            }


            if (!data.session) {

                throw new Error(
                    "Login succeeded but no session was returned."
                );

            }


            /*
               Supabase automatically stores
               and manages the authentication session.
            */


            if (loginButton) {

                loginButton.textContent =
                    "Success!";

            }


            window.location.href =
                "staff.html";

        }

        catch (error) {

            console.error(
                "Login error:",
                error
            );


            showMessage(
                error.message ||
                "Incorrect email or password."
            );


            if (loginButton) {

                loginButton.disabled = false;

                loginButton.textContent =
                    "Login";

            }

        }

    }
);


/* =========================================================
   GET CURRENT SESSION
   ========================================================= */

export async function getSession() {

    const {
        data,
        error
    } =
        await supabase.auth.getSession();


    if (error) {

        console.error(
            "Session error:",
            error
        );

        return null;
    }


    return data.session;
}


/* =========================================================
   GET ACCESS TOKEN
   ========================================================= */

export async function getAccessToken() {

    const session =
        await getSession();


    return (
        session?.access_token ||
        null
    );
}


/* =========================================================
   AUTH HEADERS
   ========================================================= */

export async function authHeaders() {

    const token =
        await getAccessToken();


    return {

        "Content-Type":
            "application/json",

        "Authorization":
            `Bearer ${token}`

    };
}


/* =========================================================
   UPLOAD AUTH HEADERS
   ========================================================= */

export async function uploadAuthHeaders() {

    const token =
        await getAccessToken();


    return {

        "Authorization":
            `Bearer ${token}`

    };
}


/* =========================================================
   LOGOUT
   ========================================================= */

export async function logout() {

    try {

        await supabase.auth.signOut();

    }

    catch (error) {

        console.error(
            "Logout error:",
            error
        );

    }


    window.location.href =
        "login.html";
}


/* =========================================================
   REQUIRE LOGIN
   ========================================================= */

export async function requireLogin() {

    const session =
        await getSession();


    if (!session) {

        window.location.replace(
            "login.html"
        );

        return false;
    }


    return true;
}
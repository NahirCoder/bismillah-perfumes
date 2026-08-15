/* =========================================================
   STAFF DASHBOARD
   BISMILLAH PERFUMES
   ========================================================= */

import {
    requireLogin,
    logout,
    getSession
} from "./auth.js";

import { supabase } from "./supabase.js";


/* =========================================================
   AUTH CHECK
   ========================================================= */

const authenticated =
    await requireLogin();


if (!authenticated) {

    throw new Error(
        "Not authenticated."
    );

}


/* =========================================================
   SECTIONS
   ========================================================= */

const sections = [

    "dashboard",

    "products",

    "categories",

    "store",

    "security"

];


const titles = {

    dashboard:
        "Dashboard",

    products:
        "Products",

    categories:
        "Categories",

    store:
        "Store Information",

    security:
        "Security"

};


/* =========================================================
   SHOW SECTION
   ========================================================= */

function showSection(name) {

    if (!sections.includes(name)) {

        name =
            "dashboard";

    }


    sections.forEach(
        section => {

            const element =
                document.getElementById(
                    `section-${section}`
                );


            if (!element) return;


            element.hidden =
                section !== name;

        }
    );


    document
        .querySelectorAll(
            ".dashboard-nav-item"
        )
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.section === name
            );

        });


    const title =
        document.getElementById(
            "dashboardTitle"
        );


    if (title) {

        title.textContent =
            titles[name];

    }


    history.replaceState(
        null,
        "",
        `#${name}`
    );

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

    document
        .querySelectorAll(
            ".dashboard-nav-item"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    showSection(
                        button.dataset.section
                    );

                    closeSidebar();

                }
            );

        });


    document
        .querySelectorAll(
            "[data-go-section]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    showSection(
                        button.dataset.goSection
                    );

                }
            );

        });

}


/* =========================================================
   MOBILE SIDEBAR
   ========================================================= */

function setupMobileSidebar() {

    const sidebar =
        document.getElementById(
            "dashboardSidebar"
        );


    const button =
        document.getElementById(
            "dashboardMenuButton"
        );


    button?.addEventListener(
        "click",
        () => {

            sidebar?.classList.toggle(
                "open"
            );

        }
    );

}


function closeSidebar() {

    document
        .getElementById(
            "dashboardSidebar"
        )
        ?.classList.remove(
            "open"
        );

}


/* =========================================================
   LOGOUT
   ========================================================= */

function setupLogout() {

    document
        .querySelectorAll(
            "#logoutButton, #logoutButtonSecurity"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    logout();

                }
            );

        });

}


/* =========================================================
   USER
   ========================================================= */

async function loadUser() {

    const session =
        await getSession();


    if (!session) return;


    const email =
        session.user?.email ||
        "Staff";


    const emailElement =
        document.getElementById(
            "staffEmail"
        );


    if (emailElement) {

        emailElement.textContent =
            email;

    }


    const securityEmail =
        document.getElementById(
            "securityEmail"
        );


    if (securityEmail) {

        securityEmail.textContent =
            email;

    }

}


/* =========================================================
   DASHBOARD STATS
   ========================================================= */

async function loadStats() {

    try {

        const [

            productsResult,

            categoriesResult

        ] =
            await Promise.all([

                supabase
                    .from("products")
                    .select(
                        "id,in_stock"
                    )
                    .eq(
                        "archived",
                        false
                    ),

                supabase
                    .from("categories")
                    .select(
                        "id"
                    )
                    .eq(
                        "archived",
                        false
                    )

            ]);


        if (productsResult.error)
            throw productsResult.error;


        if (categoriesResult.error)
            throw categoriesResult.error;


        const products =
            productsResult.data || [];


        const categories =
            categoriesResult.data || [];


        const outOfStock =
            products.filter(
                product =>
                    product.in_stock === false
            ).length;


        const productStat =
            document.getElementById(
                "statProducts"
            );


        const categoryStat =
            document.getElementById(
                "statCategories"
            );


        const stockStat =
            document.getElementById(
                "statOutOfStock"
            );


        if (productStat)
            productStat.textContent =
                products.length;


        if (categoryStat)
            categoryStat.textContent =
                categories.length;


        if (stockStat)
            stockStat.textContent =
                outOfStock;


        /*
           No promotions in Bismillah Perfumes.
           The promotion statistic is intentionally removed.
        */

    }

    catch (error) {

        console.error(
            "Dashboard stats error:",
            error
        );

    }

}


/* =========================================================
   MODALS
   ========================================================= */

function setupModals() {

    document
        .querySelectorAll(
            "[data-close-modal]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.closeModal;


                    const modal =
                        document.getElementById(
                            id
                        );


                    if (modal) {

                        modal.hidden =
                            true;

                    }

                }
            );

        });


    document
        .querySelectorAll(
            ".modal-overlay"
        )
        .forEach(modal => {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        modal
                    ) {

                        modal.hidden =
                            true;

                    }

                }
            );

        });


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Escape"
            )
                return;


            document
                .querySelectorAll(
                    ".modal-overlay"
                )
                .forEach(modal => {

                    modal.hidden =
                        true;

                });

        }
    );

}


/* =========================================================
   START
   ========================================================= */

setupNavigation();

setupMobileSidebar();

setupLogout();

setupModals();

loadUser();

loadStats();


const initialSection =
    location.hash.replace(
        "#",
        ""
    );


showSection(

    sections.includes(
        initialSection
    )
        ? initialSection
        : "dashboard"

);
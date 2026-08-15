/* =========================================================
   PRODUCTS
   BISMILLAH PERFUMES
   ========================================================= */

import {
    requireLogin
} from "./auth.js";

import { supabase } from "./supabase.js";


let products = [];

let categories = [];


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
   LOAD PRODUCTS
   ========================================================= */

async function fetchProducts() {

    const {
        data,
        error
    } =
        await supabase
            .from("products")
            .select(`
                *,
                categories (
                    name
                )
            `)
            .eq(
                "archived",
                false
            )
            .order(
                "display_order",
                {
                    ascending: true
                }
            );


    if (error)
        throw error;


    return data || [];

}


/* =========================================================
   LOAD CATEGORIES
   ========================================================= */

async function fetchCategories() {

    const {
        data,
        error
    } =
        await supabase
            .from("categories")
            .select("*")
            .eq(
                "archived",
                false
            )
            .order(
                "name"
            );


    if (error)
        throw error;


    return data || [];

}


/* =========================================================
   STAFF PRODUCTS
   ========================================================= */

async function loadStaffProducts() {

    const container =
        document.getElementById(
            "staffProductsTable"
        );


    if (!container) return;


    container.innerHTML =
        `<div class="dashboard-loading">
            Loading products...
        </div>`;


    try {

        [
            products,
            categories
        ] =
            await Promise.all([

                fetchProducts(),

                fetchCategories()

            ]);


        populateCategorySelect();

        renderStaffProducts();

    }

    catch (error) {

        console.error(error);


        container.innerHTML =
            `<div class="dashboard-loading">
                ${escapeHTML(
                    error.message
                )}
            </div>`;

    }

}


/* =========================================================
   CATEGORY SELECT
   ========================================================= */

function populateCategorySelect() {

    const select =
        document.getElementById(
            "productCategory"
        );


    const filter =
        document.getElementById(
            "staffProductCategory"
        );


    if (select) {

        select.innerHTML =
            `<option value="">
                Select category
            </option>`;


        categories.forEach(
            category => {

                select.innerHTML +=
                    `<option value="${category.id}">
                        ${escapeHTML(
                            category.name
                        )}
                    </option>`;

            }
        );

    }


    if (filter) {

        filter.innerHTML =
            `<option value="all">
                All categories
            </option>`;


        categories.forEach(
            category => {

                filter.innerHTML +=
                    `<option value="${category.id}">
                        ${escapeHTML(
                            category.name
                        )}
                    </option>`;

            }
        );

    }

}


/* =========================================================
   RENDER STAFF PRODUCTS
   ========================================================= */

function renderStaffProducts() {

    const container =
        document.getElementById(
            "staffProductsTable"
        );


    if (!container) return;


    if (!products.length) {

        container.innerHTML =
            `<div class="dashboard-loading">
                No products yet.
            </div>`;

        return;

    }


    container.innerHTML =
        products.map(
            product => {

                const image =
                    product.image_url ||
                    "";


                const category =
                    product.categories?.name ||
                    "Uncategorised";


                return `

                    <article
                        class="admin-product-card"
                    >

                        ${
                            image
                                ? `
                                    <img
                                        src="${escapeHTML(image)}"
                                        alt="${escapeHTML(product.name)}"
                                        class="admin-product-image"
                                    >
                                  `
                                : `
                                    <div class="admin-product-image">
                                        🌸
                                    </div>
                                  `
                        }


                        <div class="admin-product-body">

                            <h3>
                                ${escapeHTML(
                                    product.name
                                )}
                            </h3>


                            <p>
                                ${escapeHTML(
                                    product.description
                                )}
                            </p>


                            <div class="product-meta">

                                <strong>
                                    R${Number(
                                        product.price || 0
                                    ).toFixed(2)}
                                </strong>

                                <span>
                                    ${escapeHTML(
                                        category
                                    )}
                                </span>

                                <span>
                                    ${escapeHTML(
                                        product.gender ||
                                        "Unisex"
                                    )}
                                </span>

                                <span>
                                    ${escapeHTML(
                                        product.size ||
                                        ""
                                    )}
                                </span>

                                <span>
                                    ${
                                        product.in_stock
                                            ? "In Stock"
                                            : "Out of Stock"
                                    }
                                </span>

                            </div>


                            <div class="admin-product-actions">

                                <button
                                    class="btn btn-outline btn-small"
                                    data-edit-product="${product.id}"
                                >
                                    Edit
                                </button>

                                <button
                                    class="btn btn-danger btn-small"
                                    data-delete-product="${product.id}"
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    </article>

                `;

            }
        ).join("");


    container
        .querySelectorAll(
            "[data-edit-product]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const product =
                        products.find(
                            item =>
                                String(item.id) ===
                                String(
                                    button.dataset.editProduct
                                )
                        );


                    if (product) {

                        openProductModal(
                            product
                        );

                    }

                }
            );

        });


    container
        .querySelectorAll(
            "[data-delete-product]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    deleteProduct(
                        button.dataset.deleteProduct
                    );

                }
            );

        });

}


/* =========================================================
   PRODUCT MODAL
   ========================================================= */

function openProductModal(
    product = null
) {

    const modal =
        document.getElementById(
            "productModal"
        );


    if (!modal) return;


    document
        .getElementById(
            "productForm"
        )
        ?.reset();


    const preview =
        document.getElementById(
            "productImagePreview"
        );


    if (preview)
        preview.innerHTML = "";


    if (product) {

        document.getElementById(
            "productModalTitle"
        ).textContent =
            "Edit Product";


        document.getElementById(
            "productId"
        ).value =
            product.id;


        document.getElementById(
            "productName"
        ).value =
            product.name || "";


        document.getElementById(
            "productDescription"
        ).value =
            product.description || "";


        document.getElementById(
            "productPrice"
        ).value =
            product.price ?? "";


        document.getElementById(
            "productCategory"
        ).value =
            product.category_id || "";


        document.getElementById(
            "productGender"
        ).value =
            product.gender || "Unisex";


        document.getElementById(
            "productSize"
        ).value =
            product.size || "";


        document.getElementById(
            "productAvailable"
        ).checked =
            product.in_stock !== false;


        if (
            preview &&
            product.image_url
        ) {

            preview.innerHTML =
                `<img
                    src="${escapeHTML(
                        product.image_url
                    )}"
                    alt=""
                >`;

        }

    }

    else {

        document.getElementById(
            "productModalTitle"
        ).textContent =
            "Add Product";


        document.getElementById(
            "productId"
        ).value = "";

    }


    modal.hidden = false;

}


/* =========================================================
   SAVE PRODUCT
   ========================================================= */

async function saveProduct(event) {

    event.preventDefault();


    if (
        !(await requireLogin())
    )
        return;


    try {

        const id =
            document.getElementById(
                "productId"
            ).value;


        const name =
            document.getElementById(
                "productName"
            ).value
            .trim();


        const description =
            document.getElementById(
                "productDescription"
            ).value
            .trim();


        const price =
            document.getElementById(
                "productPrice"
            ).value;


        const category_id =
            document.getElementById(
                "productCategory"
            ).value ||
            null;


        const gender =
            document.getElementById(
                "productGender"
            ).value;


        const size =
            document.getElementById(
                "productSize"
            ).value
            .trim();


        const in_stock =
            document.getElementById(
                "productAvailable"
            ).checked;


        const file =
            document.getElementById(
                "productImage"
            )
            .files?.[0];


        const existing =
            products.find(
                item =>
                    String(item.id) ===
                    String(id)
            );


        let image_url =
            existing?.image_url ||
            "";


        if (file) {

            image_url =
                await window.uploadImage(
                    file,
                    "product-images"
                );

        }


        const payload = {

            name,

            description,

            price:
                Number(price),

            image_url,

            category_id,

            in_stock,

            gender,

            size

        };


        let result;


        if (id) {

            result =
                await supabase
                    .from("products")
                    .update(payload)
                    .eq(
                        "id",
                        id
                    );

        }

        else {

            result =
                await supabase
                    .from("products")
                    .insert([
                        payload
                    ]);

        }


        if (result.error)
            throw result.error;


        document.getElementById(
            "productModal"
        ).hidden = true;


        await loadStaffProducts();


        alert(
            id
                ? "Product updated successfully."
                : "Product added successfully."
        );

    }

    catch (error) {

        console.error(error);


        alert(
            error.message ||
            "Could not save product."
        );

    }

}


/* =========================================================
   DELETE PRODUCT
   ========================================================= */

async function deleteProduct(id) {

    if (
        !(await requireLogin())
    )
        return;


    const product =
        products.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!product)
        return;


    if (
        !confirm(
            `Delete "${product.name}"?`
        )
    )
        return;


    try {

        const {
            error
        } =
            await supabase
                .from("products")
                .update({
                    archived: true
                })
                .eq(
                    "id",
                    id
                );


        if (error)
            throw error;


        await loadStaffProducts();


        alert(
            "Product deleted successfully."
        );

    }

    catch (error) {

        console.error(error);


        alert(
            error.message ||
            "Could not delete product."
        );

    }

}


/* =========================================================
   SEARCH
   ========================================================= */

document
    .getElementById(
        "staffProductSearch"
    )
    ?.addEventListener(
        "input",
        filterProducts
    );


document
    .getElementById(
        "staffProductCategory"
    )
    ?.addEventListener(
        "change",
        filterProducts
    );


function filterProducts() {

    const search =
        document
            .getElementById(
                "staffProductSearch"
            )
            ?.value
            .toLowerCase()
            .trim() || "";


    const category =
        document
            .getElementById(
                "staffProductCategory"
            )
            ?.value || "all";


    const filtered =
        products.filter(
            product => {

                const matchesSearch =
                    product.name
                        ?.toLowerCase()
                        .includes(
                            search
                        );


                const matchesCategory =
                    category === "all" ||
                    product.category_id ===
                        category;


                return (
                    matchesSearch &&
                    matchesCategory
                );

            }
        );


    const original =
        products;


    products =
        filtered;


    renderStaffProducts();


    products =
        original;

}


/* =========================================================
   EVENTS
   ========================================================= */

document
    .getElementById(
        "addProductButton"
    )
    ?.addEventListener(
        "click",
        () => {

            openProductModal();

        }
    );


document
    .getElementById(
        "productForm"
    )
    ?.addEventListener(
        "submit",
        saveProduct
    );


/* =========================================================
   PUBLIC PRODUCTS
   ========================================================= */

async function loadPublicProducts() {

    const containers = [

        document.getElementById(
            "productsGrid"
        ),

        document.getElementById(
            "homeProducts"
        )

    ].filter(Boolean);


    if (!containers.length)
        return;


    try {

        const data =
            await fetchProducts();


        const html =
            data.map(
                createProductCard
            ).join("");


        containers.forEach(
            container => {

                container.innerHTML =
                    html;

            }
        );

    }

    catch (error) {

        console.error(
            "Products error:",
            error
        );

    }

}


/* =========================================================
   PRODUCT CARD
   ========================================================= */

function createProductCard(
    product
) {

    const image =
        product.image_url ||
        "";


    return `

        <article
            class="product-card"
        >

            ${
                image
                    ? `
                        <img
                            src="${escapeHTML(image)}"
                            alt="${escapeHTML(product.name)}"
                        >
                      `
                    : `
                        <div class="product-image-placeholder">
                            🌸
                        </div>
                      `
            }


            <div class="product-card-body">

                <h3>
                    ${escapeHTML(
                        product.name
                    )}
                </h3>


                <p>
                    ${escapeHTML(
                        product.description
                    )}
                </p>


                <div class="product-details">

                    ${
                        product.gender
                            ? `
                                <span>
                                    ${escapeHTML(
                                        product.gender
                                    )}
                                </span>
                              `
                            : ""
                    }


                    ${
                        product.size
                            ? `
                                <span>
                                    ${escapeHTML(
                                        product.size
                                    )}
                                </span>
                              `
                            : ""
                    }

                </div>


                <strong>
                    R${Number(
                        product.price || 0
                    ).toFixed(2)}
                </strong>


                <span class="${
                    product.in_stock
                        ? "in-stock"
                        : "out-of-stock"
                }">

                    ${
                        product.in_stock
                            ? "In Stock"
                            : "Out of Stock"
                    }

                </span>

            </div>

        </article>

    `;

}


/* =========================================================
   INIT
   ========================================================= */

if (
    document.getElementById(
        "staffProductsTable"
    )
) {

    loadStaffProducts();

}


if (
    document.getElementById(
        "productsGrid"
    ) ||
    document.getElementById(
        "homeProducts"
    )
) {

    loadPublicProducts();

}


window.refreshProducts =
    loadStaffProducts;
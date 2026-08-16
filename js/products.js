/* =========================================================
   PRODUCTS
   BISMILLAH PERFUMES
   ========================================================= */

import { requireLogin } from "./auth.js";
import { supabase } from "./supabase.js";


/* =========================================================
   BUSINESS SETTINGS
   ========================================================= */

let whatsappNumber = "";


/* =========================================================
   DATA
   ========================================================= */

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
   LOAD WHATSAPP NUMBER FROM SETTINGS
   ========================================================= */

async function loadWhatsAppNumber() {

    try {

        const { data, error } =
            await supabase
                .from("settings")
                .select("*")
                .limit(1)
                .maybeSingle();


        if (error) {
            throw error;
        }


        if (!data) {

            console.warn(
                "No settings record found."
            );

            whatsappNumber = "";

            return;
        }


        /*
         * Supports either:
         *
         * whatsapp_number
         *
         * OR
         *
         * whatsapp
         *
         * depending on your settings table.
         */

        whatsappNumber =
            data.whatsapp_number ||
            data.whatsapp ||
            "";


        /*
         * Remove spaces, + signs, brackets,
         * dashes and other formatting.
         *
         * Example:
         * +27 82 123 4567
         *
         * becomes:
         * 27821234567
         */

        whatsappNumber =
            String(whatsappNumber)
                .replace(/\D/g, "");


    } catch (error) {

        console.error(
            "Could not load WhatsApp number:",
            error
        );

        whatsappNumber = "";

    }

}


/* =========================================================
   LOAD PRODUCTS
   ========================================================= */

async function fetchProducts() {

    const { data, error } =
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


    if (error) {
        throw error;
    }


    return data || [];

}


/* =========================================================
   LOAD CATEGORIES
   ========================================================= */

async function fetchCategories() {

    const { data, error } =
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


    if (error) {
        throw error;
    }


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


    container.innerHTML = `
        <div class="dashboard-loading">
            Loading products...
        </div>
    `;


    try {

        [
            products,
            categories
        ] = await Promise.all([

            fetchProducts(),

            fetchCategories()

        ]);


        populateCategorySelect();

        renderStaffProducts();


    } catch (error) {

        console.error(error);


        container.innerHTML = `
            <div class="dashboard-loading">
                ${escapeHTML(
                    error.message
                )}
            </div>
        `;

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

        select.innerHTML = `
            <option value="">
                Select category
            </option>
        `;


        categories.forEach(
            category => {

                select.innerHTML += `
                    <option value="${escapeHTML(
                        category.id
                    )}">
                        ${escapeHTML(
                            category.name
                        )}
                    </option>
                `;

            }
        );

    }


    if (filter) {

        filter.innerHTML = `
            <option value="all">
                All categories
            </option>
        `;


        categories.forEach(
            category => {

                filter.innerHTML += `
                    <option value="${escapeHTML(
                        category.id
                    )}">
                        ${escapeHTML(
                            category.name
                        )}
                    </option>
                `;

            }
        );

    }

}


/* =========================================================
   STAFF RENDER
   ========================================================= */

function renderStaffProducts() {

    const container =
        document.getElementById(
            "staffProductsTable"
        );


    if (!container) return;


    if (!products.length) {

        container.innerHTML = `
            <div class="dashboard-loading">
                No products yet.
            </div>
        `;

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
                                        src="${escapeHTML(
                                            image
                                        )}"
                                        alt="${escapeHTML(
                                            product.name
                                        )}"
                                        class="admin-product-image"
                                    >
                                `
                                : `
                                    <div
                                        class="admin-product-image"
                                    >
                                        🌸
                                    </div>
                                `
                        }


                        <div
                            class="admin-product-body"
                        >

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


                            <div
                                class="product-meta"
                            >

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


                            <div
                                class="admin-product-actions"
                            >

                                <button
                                    class="btn btn-outline btn-small"
                                    data-edit-product="${escapeHTML(
                                        product.id
                                    )}"
                                >
                                    Edit
                                </button>


                                <button
                                    class="btn btn-danger btn-small"
                                    data-delete-product="${escapeHTML(
                                        product.id
                                    )}"
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
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const product =
                            products.find(
                                item =>
                                    String(
                                        item.id
                                    ) ===
                                    String(
                                        button.dataset
                                            .editProduct
                                    )
                            );


                        if (product) {

                            openProductModal(
                                product
                            );

                        }

                    }
                );

            }
        );


    container
        .querySelectorAll(
            "[data-delete-product]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteProduct(
                            button.dataset
                                .deleteProduct
                        );

                    }
                );

            }
        );

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


    if (preview) {

        preview.innerHTML = "";

    }


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
            product.gender ||
            "Unisex";


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

            preview.innerHTML = `
                <img
                    src="${escapeHTML(
                        product.image_url
                    )}"
                    alt=""
                >
            `;

        }

    } else {

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
    ) {

        return;

    }


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

        } else {

            result =
                await supabase

                    .from("products")

                    .insert([
                        payload
                    ]);

        }


        if (result.error) {

            throw result.error;

        }


        document.getElementById(
            "productModal"
        ).hidden = true;


        await loadStaffProducts();


        alert(
            id
                ? "Product updated successfully."
                : "Product added successfully."
        );


    } catch (error) {

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
    ) {

        return;

    }


    const product =
        products.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!product) return;


    if (
        !confirm(
            `Delete "${product.name}"?`
        )
    ) {

        return;

    }


    try {

        const { error } =
            await supabase

                .from("products")

                .update({
                    archived: true
                })

                .eq(
                    "id",
                    id
                );


        if (error) {

            throw error;

        }


        await loadStaffProducts();


        alert(
            "Product deleted successfully."
        );


    } catch (error) {

        console.error(error);


        alert(
            error.message ||
            "Could not delete product."
        );

    }

}


/* =========================================================
   STAFF SEARCH
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
            .trim() ||
        "";


    const category =
        document
            .getElementById(
                "staffProductCategory"
            )
            ?.value ||
        "all";


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
                    String(
                        product.category_id
                    ) ===
                    String(
                        category
                    );


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
   WHATSAPP
   ========================================================= */

function createWhatsAppLink(product) {

    /*
     * If the admin has not entered a WhatsApp
     * number in Settings, do not generate
     * an invalid WhatsApp link.
     */

    if (!whatsappNumber) {

        return "#";

    }


    const message =
        `Hello, I would like to ask about "${product.name}".`;


    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        message
    )}`;

}


/* =========================================================
   PUBLIC PRODUCT CARD
   ========================================================= */

function createProductCard(product) {

    const image =
        product.image_url ||
        "";


    const whatsappLink =
        createWhatsAppLink(
            product
        );


    return `

        <article
            class="product-card"
        >

            ${
                image
                    ? `
                        <div
                            class="product-card-image"
                        >

                            <img
                                src="${escapeHTML(
                                    image
                                )}"
                                alt="${escapeHTML(
                                    product.name
                                )}"
                            >

                        </div>
                    `
                    : `
                        <div
                            class="product-card-image
                                   product-image-placeholder"
                        >
                            🌸
                        </div>
                    `
            }


            <div
                class="product-card-body"
            >

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


                <div
                    class="product-details"
                >

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


                <strong
                    class="product-price"
                >

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


                <a
                    href="product.html?id=${encodeURIComponent(
                        product.id
                    )}"
                    class="product-card-action"
                >
                    View Product
                </a>


                ${
                    whatsappNumber
                        ? `
                            <a
                                href="${whatsappLink}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="product-whatsapp-button"
                            >
                                Ask about this product on WhatsApp
                            </a>
                        `
                        : ""
                }

            </div>

        </article>

    `;

}


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


    if (!containers.length) {

        return;

    }


    try {

        /*
         * Load both the products and
         * business WhatsApp number.
         */

        const [
            data
        ] = await Promise.all([

            fetchProducts(),

            loadWhatsAppNumber()

        ]);


        let filteredData =
            data;


        /* =================================================
           CATEGORY FROM URL
           ================================================= */

        const params =
            new URLSearchParams(
                window.location.search
            );


        const categoryId =
            params.get(
                "category"
            );


        if (categoryId) {

            filteredData =
                data.filter(
                    product =>
                        String(
                            product.category_id
                        ) ===
                        String(
                            categoryId
                        )
                );

        }


        const html =
            filteredData
                .map(
                    createProductCard
                )
                .join("");


        containers.forEach(
            container => {

                container.innerHTML =
                    html ||
                    `
                        <div class="loading-card">
                            No perfumes found in this category.
                        </div>
                    `;

            }
        );


    } catch (error) {

        console.error(
            "Products error:",
            error
        );

    }

}


/* =========================================================
   SINGLE PRODUCT
   ========================================================= */

async function loadProductDetail() {

    const container =
        document.getElementById(
            "productDetail"
        );


    if (!container) return;


    const params =
        new URLSearchParams(
            window.location.search
        );


    const id =
        params.get(
            "id"
        );


    if (!id) {

        container.innerHTML = `
            <div class="loading-card">
                Product not found.
            </div>
        `;

        return;

    }


    try {

        /*
         * Load product and WhatsApp
         * number at the same time.
         */

        const [
            productResult
        ] = await Promise.all([

            supabase

                .from("products")

                .select(`
                    *,
                    categories (
                        name
                    )
                `)

                .eq(
                    "id",
                    id
                )

                .eq(
                    "archived",
                    false
                )

                .single(),

            loadWhatsAppNumber()

        ]);


        const {
            data,
            error
        } = productResult;


        if (error) {

            throw error;

        }


        if (!data) {

            container.innerHTML = `
                <div class="loading-card">
                    Product not found.
                </div>
            `;

            return;

        }


        const image =
            data.image_url ||
            "";


        const whatsappLink =
            createWhatsAppLink(
                data
            );


        container.innerHTML = `

            <div
                class="product-detail-image"
            >

                ${
                    image
                        ? `
                            <img
                                src="${escapeHTML(
                                    image
                                )}"
                                alt="${escapeHTML(
                                    data.name
                                )}"
                            >
                        `
                        : `
                            <div
                                class="product-detail-placeholder"
                            >
                                🌸
                            </div>
                        `
                }

            </div>


            <div
                class="product-detail-content"
            >

                ${
                    data.categories?.name
                        ? `
                            <span
                                class="section-label"
                            >
                                ${escapeHTML(
                                    data.categories.name
                                )}
                            </span>
                        `
                        : ""
                }


                <h1>
                    ${escapeHTML(
                        data.name
                    )}
                </h1>


                <p
                    class="product-detail-description"
                >
                    ${escapeHTML(
                        data.description
                    )}
                </p>


                <div
                    class="product-detail-price"
                >

                    R${Number(
                        data.price || 0
                    ).toFixed(2)}

                </div>


                <div
                    class="product-detail-meta"
                >

                    ${
                        data.gender
                            ? `
                                <span
                                    class="product-detail-tag"
                                >
                                    ${escapeHTML(
                                        data.gender
                                    )}
                                </span>
                            `
                            : ""
                    }


                    ${
                        data.size
                            ? `
                                <span
                                    class="product-detail-tag"
                                >
                                    ${escapeHTML(
                                        data.size
                                    )}
                                </span>
                            `
                            : ""
                    }


                    <span class="${
                        data.in_stock
                            ? "in-stock"
                            : "out-of-stock"
                    }">

                        ${
                            data.in_stock
                                ? "In Stock"
                                : "Out of Stock"
                        }

                    </span>

                </div>


                ${
                    whatsappNumber
                        ? `
                            <div
                                class="product-detail-actions"
                            >

                                <a
                                    href="${whatsappLink}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="product-whatsapp-button product-whatsapp-large"
                                >
                                    Ask about this product on WhatsApp
                                </a>

                            </div>
                        `
                        : ""
                }

            </div>

        `;


        document.title =
            `${data.name} | Bismillah Perfumes`;


    } catch (error) {

        console.error(
            "Product detail error:",
            error
        );


        container.innerHTML = `
            <div class="loading-card">
                Could not load this product.
            </div>
        `;

    }

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


if (
    document.getElementById(
        "productDetail"
    )
) {

    loadProductDetail();

}


window.refreshProducts =
    loadStaffProducts;
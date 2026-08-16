/* =========================================================
   CATEGORIES
   BISMILLAH PERFUMES
   ========================================================= */

import { requireLogin } from "./auth.js";
import { supabase } from "./supabase.js";

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
   LOAD CATEGORIES
   ========================================================= */

async function fetchCategories() {

    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("archived", false)
        .order("display_order", {
            ascending: true
        });

    if (error) {
        throw error;
    }

    return data || [];
}


/* =========================================================
   STAFF LOAD
   ========================================================= */

async function loadStaffCategories() {

    const container =
        document.getElementById("staffCategoriesGrid");

    if (!container) return;

    container.innerHTML = `
        <div class="dashboard-loading">
            Loading categories...
        </div>
    `;

    try {

        categories = await fetchCategories();

        renderStaffCategories();

    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <div class="dashboard-loading">
                ${escapeHTML(error.message)}
            </div>
        `;
    }
}


/* =========================================================
   STAFF RENDER
   ========================================================= */

function renderStaffCategories() {

    const container =
        document.getElementById("staffCategoriesGrid");

    if (!container) return;

    if (!categories.length) {

        container.innerHTML = `
            <div class="dashboard-loading">
                No categories yet.
            </div>
        `;

        return;
    }

    container.innerHTML = categories.map(category => {

        const image = category.image_url || "";

        return `
            <article class="admin-category-card">

                ${
                    image
                        ? `
                            <img
                                src="${escapeHTML(image)}"
                                alt="${escapeHTML(category.name)}"
                            >
                        `
                        : `
                            <div class="admin-category-image">
                                🌸
                            </div>
                        `
                }

                <div class="admin-category-body">

                    <h3>
                        ${escapeHTML(category.name)}
                    </h3>

                    <p>
                        ${escapeHTML(category.description)}
                    </p>

                    <div class="admin-category-actions">

                        <button
                            class="btn btn-outline btn-small"
                            data-edit-category="${category.id}"
                        >
                            Edit
                        </button>

                        <button
                            class="btn btn-danger btn-small"
                            data-delete-category="${category.id}"
                        >
                            Delete
                        </button>

                    </div>

                </div>

            </article>
        `;

    }).join("");


    /* EDIT */

    container
        .querySelectorAll("[data-edit-category]")
        .forEach(button => {

            button.addEventListener("click", () => {

                const category =
                    categories.find(
                        item =>
                            String(item.id) ===
                            String(button.dataset.editCategory)
                    );

                if (category) {
                    openCategoryModal(category);
                }

            });

        });


    /* DELETE */

    container
        .querySelectorAll("[data-delete-category]")
        .forEach(button => {

            button.addEventListener("click", () => {

                deleteCategory(
                    button.dataset.deleteCategory
                );

            });

        });
}


/* =========================================================
   CATEGORY MODAL
   ========================================================= */

function openCategoryModal(category = null) {

    const modal =
        document.getElementById("categoryModal");

    if (!modal) return;

    document
        .getElementById("categoryForm")
        ?.reset();

    const preview =
        document.getElementById("categoryImagePreview");

    if (preview) {
        preview.innerHTML = "";
    }


    if (category) {

        document.getElementById(
            "categoryModalTitle"
        ).textContent = "Edit Category";

        document.getElementById(
            "categoryId"
        ).value = category.id;

        document.getElementById(
            "categoryName"
        ).value = category.name || "";

        document.getElementById(
            "categoryDescription"
        ).value = category.description || "";


        if (preview && category.image_url) {

            preview.innerHTML = `
                <img
                    src="${escapeHTML(category.image_url)}"
                    alt=""
                >
            `;

        }

    } else {

        document.getElementById(
            "categoryModalTitle"
        ).textContent = "Add Category";

        document.getElementById(
            "categoryId"
        ).value = "";

    }

    modal.hidden = false;
}


/* =========================================================
   SAVE CATEGORY
   ========================================================= */

async function saveCategory(event) {

    event.preventDefault();

    if (!(await requireLogin())) return;

    try {

        const id =
            document.getElementById("categoryId").value;

        const name =
            document.getElementById("categoryName")
                .value
                .trim();

        const description =
            document.getElementById("categoryDescription")
                .value
                .trim();

        const file =
            document.getElementById("categoryImage")
                .files?.[0];

        const existing =
            categories.find(
                item =>
                    String(item.id) === String(id)
            );

        let image_url =
            existing?.image_url || "";

        if (file) {

            image_url =
                await window.uploadImage(
                    file,
                    "category-images"
                );

        }

        const payload = {
            name,
            description,
            image_url
        };

        let result;

        if (id) {

            result = await supabase
                .from("categories")
                .update(payload)
                .eq("id", id);

        } else {

            result = await supabase
                .from("categories")
                .insert([payload]);

        }

        if (result.error) {
            throw result.error;
        }

        document.getElementById(
            "categoryModal"
        ).hidden = true;

        await loadStaffCategories();

        alert(
            id
                ? "Category updated successfully."
                : "Category added successfully."
        );

    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Could not save category."
        );
    }
}


/* =========================================================
   DELETE CATEGORY
   ========================================================= */

async function deleteCategory(id) {

    if (!(await requireLogin())) return;

    const category =
        categories.find(
            item =>
                String(item.id) === String(id)
        );

    if (!category) return;

    if (
        !confirm(
            `Delete "${category.name}"?`
        )
    ) {
        return;
    }

    try {

        const { error } = await supabase
            .from("categories")
            .update({
                archived: true
            })
            .eq("id", id);

        if (error) {
            throw error;
        }

        await loadStaffCategories();

        alert(
            "Category deleted successfully."
        );

    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Could not delete category."
        );
    }
}


/* =========================================================
   EVENTS
   ========================================================= */

document
    .getElementById("addCategoryButton")
    ?.addEventListener("click", () => {

        openCategoryModal();

    });


document
    .getElementById("categoryForm")
    ?.addEventListener(
        "submit",
        saveCategory
    );


/* =========================================================
   PUBLIC CATEGORY CARDS
   ========================================================= */

async function loadPublicCategories() {

    const containers = [

        document.getElementById(
            "categoriesGrid"
        ),

        document.getElementById(
            "homeCategories"
        )

    ].filter(Boolean);


    if (!containers.length) return;


    try {

        const data =
            await fetchCategories();


        const html =
            data.map(category => {

                const image =
                    category.image_url || "";


                return `

                    <a
                        href="products.html?category=${encodeURIComponent(category.id)}"
                        class="category-card category-card-link"
                    >

                        ${
                            image
                                ? `
                                    <img
                                        src="${escapeHTML(image)}"
                                        alt="${escapeHTML(category.name)}"
                                    >
                                `
                                : `
                                    <div class="category-image-placeholder">
                                        🌸
                                    </div>
                                `
                        }

                        <div class="category-card-body">

                            <h3>
                                ${escapeHTML(category.name)}
                            </h3>

                            <p>
                                ${escapeHTML(category.description)}
                            </p>

                            <span class="category-view-link">
                                View perfumes →
                            </span>

                        </div>

                    </a>

                `;

            }).join("");


        containers.forEach(container => {

            container.innerHTML = html;

        });


    } catch (error) {

        console.error(
            "Categories error:",
            error
        );

    }
}


/* =========================================================
   INIT
   ========================================================= */

if (
    document.getElementById(
        "staffCategoriesGrid"
    )
) {

    loadStaffCategories();

}


if (
    document.getElementById(
        "categoriesGrid"
    ) ||
    document.getElementById(
        "homeCategories"
    )
) {

    loadPublicCategories();

}


window.refreshCategories =
    loadStaffCategories;
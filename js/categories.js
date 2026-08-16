// js/categories.js
// Loads and renders the categories grid (used on index.html and categories.html).

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('categories-grid');
  if (grid) {
    loadCategories(grid);
  }
});

async function loadCategories(grid) {
  const { data: categories, error } = await supabaseClient
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Failed to load categories:', error.message);
    return;
  }

  if (!categories || categories.length === 0) {
    grid.innerHTML = '<p class="no-products-message">No categories available yet.</p>';
    return;
  }

  grid.innerHTML = categories.map(renderCategoryCard).join('');
}

function renderCategoryCard(category) {
  const image = category.image_url || 'https://via.placeholder.com/400x300?text=MK-WHOLESALERS';
  const description = category.description
    ? `<p class="category-description">${escapeHtml(category.description)}</p>`
    : '';

  return `
    <div class="category-card">
      <img class="category-image" src="${image}" alt="${escapeHtml(category.name)}">
      <h3 class="category-name">${escapeHtml(category.name)}</h3>
      ${description}
      <a class="btn btn-primary" href="products.html?category=${category.id}">View Products</a>
    </div>
  `;
}

// Basic HTML escaping so product/category text can't break markup.
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
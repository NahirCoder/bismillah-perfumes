// js/products.js
// Handles product grids (home top picks, category products) and search.

document.addEventListener('DOMContentLoaded', () => {
  initSearch();

  const featuredGrid = document.getElementById('featured-products-grid');
  if (featuredGrid) {
    loadFeaturedProducts(featuredGrid);
  }

  const productsGrid = document.getElementById('products-grid');
  if (productsGrid) {
    loadProductsPage(productsGrid);
  }
});

// ---------- Home page: Top Picks For You ----------

async function loadFeaturedProducts(grid) {
  const { data: products, error } = await supabaseClient
    .from('products')
    .select('*, categories(name)')
    .eq('is_active', true);

  if (error) {
    console.error('Failed to load top picks:', error.message);
    return;
  }

  const allProducts = products || [];
  const numberOfPerfumes = allProducts.length;

  // Value score = price divided by the number of active perfumes.
  // Since the divisor is the same for every perfume, the lowest-priced
  // perfumes receive the best value score. Equal scores are randomized.
  const topPicks = allProducts
    .map(product => ({
      product,
      valueScore: Number(product.price) / Math.max(1, numberOfPerfumes),
      randomTieBreaker: Math.random()
    }))
    .sort((a, b) => {
      if (a.valueScore !== b.valueScore) {
        return a.valueScore - b.valueScore;
      }
      return a.randomTieBreaker - b.randomTieBreaker;
    })
    .slice(0, 3)
    .map(item => item.product);

  const settings = await getSiteSettings();
  grid.innerHTML = topPicks.map(p => renderProductCard(p, settings)).join('');
  attachProductCardEvents(grid);
}

// ---------- Products page: by category or by search ----------

async function loadProductsPage(grid) {
  const params = new URLSearchParams(window.location.search);
  const categoryId = params.get('category');
  const searchTerm = params.get('search');
  const noProductsMsg = document.getElementById('no-products-message');
  const categoryNameEl = document.getElementById('category-name');
  const categoryDescEl = document.getElementById('category-description');

  let query = supabaseClient.from('products').select('*, categories(name)').eq('is_active', true);

  if (categoryId) {
    query = query.eq('category_id', categoryId);

    const { data: category } = await supabaseClient
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    if (category && categoryNameEl) {
      categoryNameEl.textContent = category.name;
      categoryDescEl.textContent = category.description || '';
    }
  } else if (searchTerm) {
    query = query.ilike('name', `%${searchTerm}%`);
    if (categoryNameEl) categoryNameEl.textContent = `Search results for "${searchTerm}"`;
  } else {
    if (categoryNameEl) categoryNameEl.textContent = 'All Products';
  }

  const { data: products, error } = await query.order('name', { ascending: true });

  if (error) {
    console.error('Failed to load products:', error.message);
    return;
  }

  if (!products || products.length === 0) {
    grid.innerHTML = '';
    if (noProductsMsg) noProductsMsg.style.display = 'block';
    return;
  }

  if (noProductsMsg) noProductsMsg.style.display = 'none';

  const settings = await getSiteSettings();
  grid.innerHTML = products.map(p => renderProductCard(p, settings)).join('');
  attachProductCardEvents(grid);
}

// ---------- Rendering ----------

function renderProductCard(product, settings) {
  const image = product.image_url || 'https://via.placeholder.com/400x300?text=Bismillah+Perfumes';

  return `
    <div class="product-card" data-product-id="${product.id}" data-product-name="${escapeHtml(product.name)}">
      <img class="product-image" src="${image}" alt="${escapeHtml(product.name)}">
      <h3 class="product-name">${escapeHtml(product.name)}</h3>
      <p class="product-price">${formatPrice(product.price)}${product.unit ? ' / ' + escapeHtml(product.unit) : ''}</p>
      <div class="quantity-selector">
        <button type="button" class="qty-minus">-</button>
        <input type="number" class="qty-input" value="1" min="1">
        <button type="button" class="qty-plus">+</button>
      </div>
      <a class="btn btn-secondary view-product-btn" href="product.html?id=${product.id}">View Product</a>
      <a class="btn btn-whatsapp whatsapp-enquiry-btn" href="#" target="_blank" rel="noopener">Enquire on WhatsApp</a>
    </div>
  `;
}

// Wires up quantity buttons and WhatsApp links for a freshly rendered grid.
function attachProductCardEvents(grid) {
  grid.querySelectorAll('.product-card').forEach(card => {
    const qtyInput = card.querySelector('.qty-input');
    const minusBtn = card.querySelector('.qty-minus');
    const plusBtn = card.querySelector('.qty-plus');
    const whatsappBtn = card.querySelector('.whatsapp-enquiry-btn');

    minusBtn.addEventListener('click', () => {
      const current = parseInt(qtyInput.value, 10) || 1;
      qtyInput.value = Math.max(1, current - 1);
    });

    plusBtn.addEventListener('click', () => {
      const current = parseInt(qtyInput.value, 10) || 1;
      qtyInput.value = current + 1;
    });

    whatsappBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      const settings = await getSiteSettings();
      if (!settings) return;

      const productName = card.dataset.productName;
      const quantity = qtyInput.value;

      const message = `Hello Bismillah Perfumes, I am interested in ${productName}. Quantity: ${quantity}.`;

      window.open(buildWhatsAppLink(settings.whatsapp_number, message), '_blank');
    });
  });
}

// ---------- Search (shared across home, categories, products pages) ----------

function initSearch() {
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');

  if (!searchForm || !searchInput) return;

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const term = searchInput.value.trim();

    if (term) {
      window.location.href = `products.html?search=${encodeURIComponent(term)}`;
    }
  });

  let debounceTimer;

  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);

    const term = searchInput.value.trim();

    if (!term) {
      searchResults.innerHTML = '';
      return;
    }

    debounceTimer = setTimeout(() => runLiveSearch(term, searchResults), 300);
  });

  document.addEventListener('click', (e) => {
    if (!searchForm.contains(e.target)) {
      searchResults.innerHTML = '';
    }
  });
}

async function runLiveSearch(term, searchResults) {
  const { data: products, error } = await supabaseClient
    .from('products')
    .select('id, name, price')
    .eq('is_active', true)
    .ilike('name', `%${term}%`)
    .limit(6);

  if (error) {
    console.error('Search failed:', error.message);
    return;
  }

  if (!products || products.length === 0) {
    searchResults.innerHTML = '<p style="padding:12px;color:#666;">No products found.</p>';
    return;
  }

  searchResults.innerHTML = products.map(p => `
    <a href="product.html?id=${p.id}" style="display:block;padding:10px 14px;border-bottom:1px solid #eee;">
      ${escapeHtml(p.name)} — ${formatPrice(p.price)}
    </a>
  `).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
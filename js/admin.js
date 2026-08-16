// js/admin.js
// Handles admin dashboard, product management, category management, and settings.

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('stat-total-products')) {
    loadDashboardStats();
  }

  if (document.getElementById('admin-products-tbody')) {
    initAdminProductsPage();
  }

  if (document.getElementById('product-form')) {
    initProductForm();
  }

  if (document.getElementById('admin-categories-tbody')) {
    initAdminCategoriesPage();
  }

  if (document.getElementById('settings-form')) {
    initSettingsForm();
  }
});

// ---------- Dashboard ----------

async function loadDashboardStats() {
  const { count: totalProducts } = await supabaseClient
    .from('products').select('*', { count: 'exact', head: true });
  const { count: activeProducts } = await supabaseClient
    .from('products').select('*', { count: 'exact', head: true }).eq('is_active', true);
  const { count: totalCategories } = await supabaseClient
    .from('categories').select('*', { count: 'exact', head: true });
  const { count: activeCategories } = await supabaseClient
    .from('categories').select('*', { count: 'exact', head: true }).eq('is_active', true);

  document.getElementById('stat-total-products').textContent = totalProducts ?? 0;
  document.getElementById('stat-active-products').textContent = activeProducts ?? 0;
  document.getElementById('stat-total-categories').textContent = totalCategories ?? 0;
  document.getElementById('stat-active-categories').textContent = activeCategories ?? 0;

  const { data: { user } } = await supabaseClient.auth.getUser();
  const welcomeEl = document.getElementById('admin-welcome');
  if (user && welcomeEl) {
    welcomeEl.textContent = `Welcome back, ${user.email}.`;
  }
}

// ---------- Admin: Products list ----------

async function initAdminProductsPage() {
  await populateCategoryFilterDropdown();

  const searchInput = document.getElementById('admin-product-search');
  const categoryFilter = document.getElementById('admin-category-filter');
  const statusFilter = document.getElementById('admin-status-filter');

  const refresh = () => loadAdminProducts(searchInput.value, categoryFilter.value, statusFilter.value);

  let debounceTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(refresh, 300);
  });
  categoryFilter.addEventListener('change', refresh);
  statusFilter.addEventListener('change', refresh);

  await loadAdminProducts('', '', '');
}

async function populateCategoryFilterDropdown() {
  const select = document.getElementById('admin-category-filter');
  const { data: categories } = await supabaseClient.from('categories').select('id, name').order('name');
  (categories || []).forEach(c => {
    const option = document.createElement('option');
    option.value = c.id;
    option.textContent = c.name;
    select.appendChild(option);
  });
}

async function loadAdminProducts(search, categoryId, status) {
  const tbody = document.getElementById('admin-products-tbody');
  const noProductsMsg = document.getElementById('no-products-admin-message');

  let query = supabaseClient.from('products').select('*, categories(name)');

  if (search) query = query.ilike('name', `%${search}%`);
  if (categoryId) query = query.eq('category_id', categoryId);
  if (status === 'active') query = query.eq('is_active', true);
  if (status === 'inactive') query = query.eq('is_active', false);

  const { data: products, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load products:', error.message);
    return;
  }

  if (!products || products.length === 0) {
    tbody.innerHTML = '';
    noProductsMsg.style.display = 'block';
    return;
  }

  noProductsMsg.style.display = 'none';
  tbody.innerHTML = products.map(renderAdminProductRow).join('');

  tbody.querySelectorAll('.delete-product-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteProduct(btn.dataset.id, search, categoryId, status));
  });
}

function renderAdminProductRow(product) {
  const image = product.image_url || 'https://via.placeholder.com/60?text=No+Image';
  return `
    <tr>
      <td><img class="admin-thumb" src="${image}" alt=""></td>
      <td class="admin-product-name">${escapeHtml(product.name)}</td>
      <td class="admin-product-category">${product.categories ? escapeHtml(product.categories.name) : ''}</td>
      <td class="admin-product-price">${formatPrice(product.price)}</td>
      <td class="admin-product-status">${product.is_active ? 'Active' : 'Inactive'}</td>
      <td>
        <a class="btn btn-small" href="admin-product-form.html?id=${product.id}">Edit</a>
        <button class="btn btn-small btn-danger delete-product-btn" data-id="${product.id}">Delete</button>
      </td>
    </tr>
  `;
}

async function deleteProduct(id, search, categoryId, status) {
  if (!confirm('Delete this product? This cannot be undone.')) return;

  const { error } = await supabaseClient.from('products').delete().eq('id', id);
  if (error) {
    alert('Failed to delete product: ' + error.message);
    return;
  }

  loadAdminProducts(search, categoryId, status);
}

// ---------- Admin: Product form (add/edit) ----------

async function initProductForm() {
  await populateCategorySelect();

  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  if (productId) {
    document.getElementById('form-title').textContent = 'Edit Product';
    await loadProductIntoForm(productId);
  }

  document.getElementById('product-form').addEventListener('submit', (e) => {
    e.preventDefault();
    saveProduct(productId);
  });
}

async function populateCategorySelect() {
  const select = document.getElementById('product-category');
  const { data: categories } = await supabaseClient.from('categories').select('id, name').order('name');
  select.innerHTML = (categories || [])
    .map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`)
    .join('');
}

async function loadProductIntoForm(productId) {
  const { data: product, error } = await supabaseClient
    .from('products').select('*').eq('id', productId).single();

  if (error || !product) {
    console.error('Failed to load product for editing:', error ? error.message : 'not found');
    return;
  }

  document.getElementById('product-id').value = product.id;
  document.getElementById('product-name').value = product.name || '';
  document.getElementById('product-description').value = product.description || '';
  document.getElementById('product-brand').value = product.brand || '';
  document.getElementById('product-price').value = product.price || '';
  document.getElementById('product-unit').value = product.unit || '';
  document.getElementById('product-category').value = product.category_id || '';
  document.getElementById('product-active').checked = !!product.is_active;

  if (product.image_url) {
    const preview = document.getElementById('product-image-preview');
    preview.src = product.image_url;
    preview.style.display = 'block';
  }
}

async function saveProduct(existingId) {
  const errorEl = document.getElementById('form-error');
  errorEl.style.display = 'none';

  const name = document.getElementById('product-name').value.trim();
  const description = document.getElementById('product-description').value.trim();
  const brand = document.getElementById('product-brand').value.trim();
  const price = parseFloat(document.getElementById('product-price').value);
  const unit = document.getElementById('product-unit').value.trim();
  const categoryId = document.getElementById('product-category').value;
  const isActive = document.getElementById('product-active').checked;
  const imageFile = document.getElementById('product-image').files[0];

  let imageUrl = null;

  try {
    if (imageFile) {
      imageUrl = await uploadImage(imageFile, 'product-images');
    }

    const productData = {
      name, description, brand, price, unit,
      category_id: categoryId,
      is_active: isActive,
      updated_at: new Date().toISOString()
    };

    if (imageUrl) productData.image_url = imageUrl;

    if (existingId) {
      const { error } = await supabaseClient.from('products').update(productData).eq('id', existingId);
      if (error) throw error;
    } else {
      productData.created_at = new Date().toISOString();
      const { error } = await supabaseClient.from('products').insert(productData);
      if (error) throw error;
    }

    window.location.href = 'admin-products.html';
  } catch (err) {
    errorEl.textContent = 'Failed to save product: ' + err.message;
    errorEl.style.display = 'block';
  }
}

// Uploads a file to the given Supabase Storage bucket and returns its public URL.
async function uploadImage(file, bucket) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

  const { error: uploadError } = await supabaseClient.storage.from(bucket).upload(fileName, file);
  if (uploadError) throw uploadError;

  const { data } = supabaseClient.storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
}

// Live preview when a new image file is chosen.
document.addEventListener('change', (e) => {
  if (e.target && e.target.id === 'product-image' && e.target.files[0]) {
    const preview = document.getElementById('product-image-preview');
    preview.src = URL.createObjectURL(e.target.files[0]);
    preview.style.display = 'block';
  }

  if (e.target && e.target.id === 'category-image' && e.target.files[0]) {
    const preview = document.getElementById('category-image-preview');
    preview.src = URL.createObjectURL(e.target.files[0]);
    preview.style.display = 'block';
  }
});

// ---------- Admin: Categories ----------

async function initAdminCategoriesPage() {
  await loadAdminCategories();

  document.getElementById('add-category-btn').addEventListener('click', () => openCategoryModal());
  document.getElementById('category-cancel-btn').addEventListener('click', () => closeCategoryModal());

  document.getElementById('category-form').addEventListener('submit', (e) => {
    e.preventDefault();
    saveCategory();
  });
}

async function loadAdminCategories() {
  const tbody = document.getElementById('admin-categories-tbody');
  const noCategoriesMsg = document.getElementById('no-categories-message');

  const { data: categories, error } = await supabaseClient
    .from('categories').select('*').order('sort_order', { ascending: true });

  if (error) {
    console.error('Failed to load categories:', error.message);
    return;
  }

  if (!categories || categories.length === 0) {
    tbody.innerHTML = '';
    noCategoriesMsg.style.display = 'block';
    return;
  }

  noCategoriesMsg.style.display = 'none';
  tbody.innerHTML = categories.map(renderAdminCategoryRow).join('');

  tbody.querySelectorAll('.edit-category-btn').forEach(btn => {
    btn.addEventListener('click', () => openCategoryModal(btn.dataset.id));
  });
  tbody.querySelectorAll('.delete-category-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteCategory(btn.dataset.id));
  });
}

function renderAdminCategoryRow(category) {
  const image = category.image_url || 'https://via.placeholder.com/60?text=No+Image';
  return `
    <tr>
      <td><img class="admin-thumb" src="${image}" alt=""></td>
      <td class="admin-category-name">${escapeHtml(category.name)}</td>
      <td class="admin-category-description">${escapeHtml(category.description || '')}</td>
      <td class="admin-category-sort">${category.sort_order ?? 0}</td>
      <td class="admin-category-status">${category.is_active ? 'Active' : 'Inactive'}</td>
      <td>
        <button class="btn btn-small edit-category-btn" data-id="${category.id}">Edit</button>
        <button class="btn btn-small btn-danger delete-category-btn" data-id="${category.id}">Delete</button>
      </td>
    </tr>
  `;
}

async function openCategoryModal(categoryId) {
  const modal = document.getElementById('category-modal');
  const title = document.getElementById('category-modal-title');
  const preview = document.getElementById('category-image-preview');

  document.getElementById('category-form').reset();
  document.getElementById('category-id').value = '';
  preview.style.display = 'none';
  document.getElementById('category-form-error').style.display = 'none';

  if (categoryId) {
    title.textContent = 'Edit Category';
    const { data: category, error } = await supabaseClient
      .from('categories').select('*').eq('id', categoryId).single();

    if (!error && category) {
      document.getElementById('category-id').value = category.id;
      document.getElementById('category-name').value = category.name || '';
      document.getElementById('category-description').value = category.description || '';
      document.getElementById('category-sort-order').value = category.sort_order ?? 0;
      document.getElementById('category-active').checked = !!category.is_active;

      if (category.image_url) {
        preview.src = category.image_url;
        preview.style.display = 'block';
      }
    }
  } else {
    title.textContent = 'Add Category';
  }

  modal.style.display = 'flex';
}

function closeCategoryModal() {
  document.getElementById('category-modal').style.display = 'none';
}

async function saveCategory() {
  const errorEl = document.getElementById('category-form-error');
  errorEl.style.display = 'none';

  const existingId = document.getElementById('category-id').value;
  const name = document.getElementById('category-name').value.trim();
  const description = document.getElementById('category-description').value.trim();
  const sortOrder = parseInt(document.getElementById('category-sort-order').value, 10) || 0;
  const isActive = document.getElementById('category-active').checked;
  const imageFile = document.getElementById('category-image').files[0];

  try {
    let imageUrl = null;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile, 'category-images');
    }

    const categoryData = {
      name, description,
      sort_order: sortOrder,
      is_active: isActive,
      updated_at: new Date().toISOString()
    };

    if (imageUrl) categoryData.image_url = imageUrl;

    if (existingId) {
      const { error } = await supabaseClient.from('categories').update(categoryData).eq('id', existingId);
      if (error) throw error;
    } else {
      categoryData.created_at = new Date().toISOString();
      const { error } = await supabaseClient.from('categories').insert(categoryData);
      if (error) throw error;
    }

    closeCategoryModal();
    loadAdminCategories();
  } catch (err) {
    errorEl.textContent = 'Failed to save category: ' + err.message;
    errorEl.style.display = 'block';
  }
}

async function deleteCategory(id) {
  if (!confirm('Delete this category? Products in this category will not be deleted, but will lose their category link.')) return;

  const { error } = await supabaseClient.from('categories').delete().eq('id', id);
  if (error) {
    alert('Failed to delete category: ' + error.message);
    return;
  }

  loadAdminCategories();
}

// ---------- Admin: Settings ----------

async function initSettingsForm() {
  const settings = await getSiteSettings();

  if (settings) {
    document.getElementById('setting-whatsapp').value = settings.whatsapp_number || '';
    document.getElementById('setting-phone').value = settings.phone || '';
    document.getElementById('setting-email').value = settings.email || '';
    document.getElementById('setting-address').value = settings.address || '';
    document.getElementById('setting-hours').value = settings.hours || '';
  }

  document.getElementById('settings-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveSettings(settings ? settings.id : null);
  });
}

async function saveSettings(existingId) {
  const errorEl = document.getElementById('settings-form-error');
  const successEl = document.getElementById('settings-form-success');
  errorEl.style.display = 'none';
  successEl.style.display = 'none';

  const settingsData = {
    whatsapp_number: document.getElementById('setting-whatsapp').value.trim(),
    phone: document.getElementById('setting-phone').value.trim(),
    email: document.getElementById('setting-email').value.trim(),
    address: document.getElementById('setting-address').value.trim(),
    hours: document.getElementById('setting-hours').value.trim()
  };

  try {
    let error;
    if (existingId) {
      ({ error } = await supabaseClient.from('settings').update(settingsData).eq('id', existingId));
    } else {
      ({ error } = await supabaseClient.from('settings').insert(settingsData));
    }

    if (error) throw error;

    successEl.style.display = 'block';
  } catch (err) {
    errorEl.textContent = 'Failed to save settings: ' + err.message;
    errorEl.style.display = 'block';
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
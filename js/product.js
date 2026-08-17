// js/product.js
// Loads and renders a single product on product.html.

document.addEventListener('DOMContentLoaded', () => {
  loadProduct();
});

async function loadProduct() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  if (!productId) {
    document.querySelector('.product-detail').innerHTML = '<p>Product not found.</p>';
    return;
  }

  const { data: product, error } = await supabaseClient
    .from('products')
    .select('*, categories(name)')
    .eq('id', productId)
    .single();

  if (error || !product) {
    console.error('Failed to load product:', error ? error.message : 'not found');
    document.querySelector('.product-detail').innerHTML = '<p>Product not found.</p>';
    return;
  }

  renderProduct(product);
  await setupWhatsAppEnquiry(product);
  setupQuantitySelector();

  document.title = `${product.name} | Bismillah Perfumes`;
}

function renderProduct(product) {
  document.getElementById('product-image').src =
    product.image_url || 'https://via.placeholder.com/600x600?text=Bismillah+Perfumes';
  document.getElementById('product-image').alt = product.name;
  document.getElementById('product-name').textContent = product.name;
  document.getElementById('product-category').textContent = product.categories ? product.categories.name : '';
  document.getElementById('product-price').textContent =
    formatPrice(product.price) + (product.unit ? ` / ${product.unit}` : '');
  document.getElementById('product-description').textContent = product.description || '';
}

function setupQuantitySelector() {
  const qtyInput = document.getElementById('quantity-input');
  document.getElementById('qty-minus').addEventListener('click', () => {
    const current = parseInt(qtyInput.value, 10) || 1;
    qtyInput.value = Math.max(1, current - 1);
  });
  document.getElementById('qty-plus').addEventListener('click', () => {
    const current = parseInt(qtyInput.value, 10) || 1;
    qtyInput.value = current + 1;
  });
}

async function setupWhatsAppEnquiry(product) {
  const btn = document.getElementById('whatsapp-enquiry-btn');
  const settings = await getSiteSettings();
  if (!settings) return;

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const quantity = document.getElementById('quantity-input').value;
    const message = `Hello Bismillah Perfumes, I am interested in ${product.name}. Quantity: ${quantity}.`;
    window.open(buildWhatsAppLink(settings.whatsapp_number, message), '_blank');
  });
}

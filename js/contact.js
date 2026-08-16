// js/contact.js
// Populates contact info + WhatsApp buttons on contact.html and index.html hero.

document.addEventListener('DOMContentLoaded', () => {
  const contactPhone = document.getElementById('contact-phone');
  if (contactPhone) {
    loadContactPage();
  }

  const heroWhatsappBtn = document.getElementById('whatsapp-btn-hero');
  if (heroWhatsappBtn) {
    setupHeroWhatsApp(heroWhatsappBtn);
  }
});

async function loadContactPage() {
  const settings = await getSiteSettings();
  if (!settings) return;

  document.getElementById('contact-phone').textContent = settings.phone || 'Not available';
  document.getElementById('contact-email').textContent = settings.email || 'Not available';
  document.getElementById('contact-address').textContent = settings.address || 'Not available';
  document.getElementById('contact-hours').textContent = settings.hours || 'Not available';

  const whatsappBtn = document.getElementById('whatsapp-contact-btn');
  whatsappBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const message = 'Hello MK-WHOLESALERS, I would like to know more about your products.';
    window.open(buildWhatsAppLink(settings.whatsapp_number, message), '_blank');
  });
}

async function setupHeroWhatsApp(heroWhatsappBtn) {
  const settings = await getSiteSettings();
  if (!settings) return;

  heroWhatsappBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const message = 'Hello MK-WHOLESALERS, I would like to know more about your products.';
    window.open(buildWhatsAppLink(settings.whatsapp_number, message), '_blank');
  });
}
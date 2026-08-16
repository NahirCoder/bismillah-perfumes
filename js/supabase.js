// js/supabase.js
// Central Supabase client + shared helpers used across the site.

const SUPABASE_URL = "https://mwfwenetiprllsusxnjq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_mogG4zqE5At2lIikz0JbxQ_ncz5p4ih";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Cache site settings (whatsapp number, phone, email, address, hours) so
// every page doesn't need to re-query them separately.
let _cachedSettings = null;

async function getSiteSettings() {
  if (_cachedSettings) return _cachedSettings;

  const { data, error } = await supabaseClient
    .from('settings')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('Failed to load site settings:', error.message);
    return null;
  }

  _cachedSettings = data;
  return data;
}

// Builds a wa.me link from a raw whatsapp number and a message.
function buildWhatsAppLink(whatsappNumber, message) {
  const digitsOnly = (whatsappNumber || '').replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message || '');
  return `https://wa.me/${digitsOnly}?text=${encodedMessage}`;
}

// Formats a number as South African Rand.
function formatPrice(price) {
  const value = Number(price) || 0;
  return `R${value.toFixed(2)}`;
}

// Sets the footer year on any page that has #footer-year.
function setFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

document.addEventListener('DOMContentLoaded', setFooterYear);
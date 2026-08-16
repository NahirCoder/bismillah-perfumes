// js/auth.js
// Handles admin login, logout, and route protection for admin pages.

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const logoutBtn = document.getElementById('logout-btn');

  if (loginForm) {
    initLoginForm(loginForm);
  }

  if (logoutBtn) {
    initLogout(logoutBtn);
    guardAdminPage();
  }
});

function initLoginForm(loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('login-error');
    errorEl.style.display = 'none';

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
      errorEl.textContent = 'Invalid email or password.';
      errorEl.style.display = 'block';
      return;
    }

    window.location.href = 'admin.html';
  });
}

function initLogout(logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    window.location.href = 'login.html';
  });
}

// Redirects to login.html if there is no active admin session.
async function guardAdminPage() {
  const { data } = await supabaseClient.auth.getSession();
  if (!data.session) {
    window.location.href = 'login.html';
  }
}
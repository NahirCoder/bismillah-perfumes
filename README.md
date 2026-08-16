# Bismillah Perfumes

Bismillah Perfumes is a simple perfume product catalogue website built with
HTML, CSS, JavaScript and Supabase.

## Features

### Customer Website

- Business homepage
- Browse categories
- Browse products
- Product search
- Product details
- Product quantity selector
- WhatsApp contact button
- Product enquiry functionality
- Contact page
- Mobile-friendly design

### Admin Area

Admin users can:

- Log in securely
- View the admin dashboard
- Add products
- Edit products
- Delete products
- Upload product images
- Add categories
- Edit categories
- Delete categories
- Upload category images
- Edit business settings
- Change the authenticated user's password
- Update the WhatsApp business number

## Project Structure

```text
bismillah-perfumes/
│
├── index.html
├── categories.html
├── products.html
├── product.html
├── contact.html
├── login.html
│
├── admin.html
├── admin-products.html
├── admin-product-form.html
├── admin-categories.html
├── admin-settings.html
│
├── css/
│   ├── style.css
│   ├── home.css
│   ├── categories.css
│   ├── products.css
│   ├── product.css
│   ├── contact.css
│   ├── login.css
│   └── admin.css
│
├── js/
│   ├── supabase.js
│   ├── auth.js
│   ├── products.js
│   ├── categories.js
│   ├── product.js
│   ├── contact.js
│   └── admin.js
│
├── .gitignore
├── vercel.json
└── README.md
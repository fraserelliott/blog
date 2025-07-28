# Portfolio CMS

A lightweight, personal content management system built with **Node.js**, **Express**, and **MySQL**, designed to manage and showcase projects on a portfolio website. This CMS supports adding, editing, deleting, and tagging projects via a private dashboard, with all content dynamically displayed on the frontend.

## ▶️ Demo

https://www.youtube.com/watch?v=mxE_Q6YD1bI

## ✨ Features

- Add/Edit/Delete project posts via a secure dashboard
- Upload images via a custom Cloudinary integration
- Tag-based filtering for frontend project discovery
- Responsive design, mobile-friendly layout
- Custom project pages at `/project/:id`
- Authentication using JWT
- Sequelize ORM with auto schema sync

## 🛠️ Tech Stack

- **Backend**: Node.js, Express
- **Database**: MySQL (via Sequelize)
- **Frontend**: HTML/CSS, vanilla JS
- **Deployment**: Railway
- **Image Hosting**: Cloudinary

## 🎨 Frontend Methodology

Rather than relying on frameworks like Bootstrap, this project uses reusable components I created with vanilla JavaScript and CSS. This approach:
- Offers full control over styling and behaviour
- Allows for immediate changes to styles without needing to track down framework variables
- Ensures consistency across elements (modals, toasts, form inputs, etc.)
- Served as a valuable learning experience in developing a lightweight, custom component library

## 📁 Folder Structure

```
project-root/
│
├── config/               # Sequelize connection setup
├── models/               # Sequelize models (Post, Tag, etc.)
├── public/               # Static frontend assets and reusable scripts (modals, toasts, etc.)
├── routes/               # Express API routes
├── scripts/              # Scripts used in npm (alter-schema)
├── static-pages/         # Static fallback HTML pages (404, project view)
├── .env                  # Environment variables (not committed)
├── server.js             # Entry point for the Express app
└── README.md
```

## ✨ Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/fraserelliott/portfolio-cms.git
cd portfolio-cms
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a `.env` file

```env
DB_DATABASE=your_db
DB_USERNAME=your_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_DIALECT=mysql
DB_PORT=3306
JWT_SECRET=your_jwt_secret
CLOUD_NAME=your_cloud
CLOUD_API_KEY=your_key
CLOUD_API_SECRET=your_secret
```

### 4. Initialize the database

This project uses Sequelize and will automatically sync the schema:

```bash
npm start
```

### 5. Start the app

```bash
npm start
```

The server will start on `http://localhost:3001` (or the `PORT` specified in `.env`).

---

## 🖼️ Frontend

The portfolio will render posts dynamically on the homepage. Clicking a project opens a full detail page at `/project/:id`. There's also:

- A tag filter for narrowing down visible posts
- A custom dashboard at `/dashboard` (or similar) to manage content

---

## 🔐 Admin Dashboard

- Authenticated via a JWT token
- Modal-based UI for managing posts
- Includes:
  - Create/Edit/Delete posts
  - Image upload via Cloudinary
  - Tag creation and filtering

---

## 📦 Deployment

This project is deployable on platforms like **Railway** or **Render**.

For Railway:

1. Add your environment variables. You can either set all the DB variables separately, or set DATABASE_URL.
2. Connect a MySQL database plugin
3. Set the deploy command to `npm run start`
4. Set up a custom domain (optional)

---

## 💡 Feature Roadmap

- Search functionality for the dashboard
- Contact form with optional email integration
- Improved media handling (e.g., video support)
- Markdown to HTML conversion clientside
- Multiple images using merge tags e.g. {{img:id-1}}

---

## 📄 License

MIT License
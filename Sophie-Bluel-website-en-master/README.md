# **Project: Sophie Bluel — Portfolio Gallery**

A fictional interior designer portfolio featuring an image gallery with admin editing capabilities. Built as part of a front-end developer training project.

## **Preview**

Here are some screenshots of the project:

- **Login Page**
<img width="1280" height="902" alt="bluel_Login" src="https://github.com/user-attachments/assets/d065a54d-23d1-481c-a84d-6df068023eee" />

- **Main Gallery Page**
<img width="957" height="1066" alt="bluel" src="https://github.com/user-attachments/assets/c14a85c4-04a9-4172-aaad-a39afceeaf28" />


- **Editing Mode**
<img width="1424" height="907" alt="Bluel_Editing" src="https://github.com/user-attachments/assets/087254d0-c00d-45e5-b56e-de2a47c48109" />


- **Admin Gallery Modal**
  
<img width="1391" height="906" alt="Bluel_Modal" src="https://github.com/user-attachments/assets/0e588a97-8020-4b90-ab5f-876b232879d9" />


- **Add Photo Modal**
<img width="1270" height="882" alt="add_image" src="https://github.com/user-attachments/assets/5b777fcc-3c2e-41d5-a612-e0e8f69a3a12" />


- **Editing Mode**
<img width="1424" height="907" alt="Bluel_Editing" src="https://github.com/user-attachments/assets/087254d0-c00d-45e5-b56e-de2a47c48109" />

##  Features

-  **Login for Admin**
  - Authenticated access using token storage
  - Admin mode UI with "Edit" buttons and modals

-  **Image Gallery**
  - Dynamically fetched from API
  - Filter by category
  - Responsive layout

-  **Admin Modals**
  - Upload new images (with preview, title, and category)
  - Delete existing images
  - Form validation and feedback

-  **Token-Based Auth**
  - Stored in `localStorage`
  - Auto-toggle UI between user/admin views

---

## Tech Stack

| Technology | Usage               |
|------------|---------------------|
| **HTML5**      | Markup structure    |
| **CSS3**       | Styling, layout     |
| **JavaScript** | Dynamic behavior    |
| **Fetch API**  | Backend integration |
| **REST API**   | Fake backend simulation |


---

## 🧪 How to Run Locally

1. **Clone this repo:**
   ```bash
   git clone https://github.com/PortuguesRicardo/sophie-bluel-portfolio.git
   cd sophie-bluel-portfolio
   ```

2. **Open `index.html` in your browser**  
   Use a Live Server extension (VS Code) or run a local development server.

3. **Login:**
   - Go to `/login.html`
   - Enter the correct credentials found on /backend/ ReadMe.md
     Test account for Sophie Bluel
```
email: sophie.bluel@test.tld

password: S0phie 
```
   - On success, admin features will unlock

---

## Notes

- Admin mode is based on a token stored in `localStorage`.
- This project uses a **mock backend** provided during training (`http://localhost:5678/api/...`).
- If deploying, a real backend would be required for full functionality.

---

## Future Improvements

- Add better form validation and error messages
- Deploy the project using GitHub Pages or Netlify
- Replace mock API with real backend and database
- Enhance accessibility (ARIA roles, keyboard navigation)
- Improve mobile responsiveness

---

## Author

**Ricardo Portugues**  
GitHub: [@PortuguesRicardo](https://github.com/PortuguesRicardo)

---

## License

This project is licensed under the **MIT License** — feel free to use it for your own portfolio or learning.

# Bananaz – Full Stack Image Tagger Assignment

This repo contains both the **backend (.NET 10 Web API)** and the **frontend (React 19 + Vite)** for the Image Tagger application.

## 📁 Project Structure

bananaz-back/ → C# .NET backend API
bananaz-front/ → React frontend application

yaml
Copy code

---

## 🚀 Running the Backend (C# / .NET)

1. Install .NET 10 SDK
2. Navigate into the backend folder:

cd bananaz-back/ImageTagger.Api
dotnet run

arduino
Copy code

The API will run at:

http://localhost:5274

yaml
Copy code

---

## 🌐 Running the Frontend (React + Vite)

cd bananaz-front
npm install
npm run dev

yaml
Copy code

Frontend runs at:

http://localhost:5173

yaml
Copy code

---

## 🔐 Authentication

- There is **no session or token**.
- Authentication uses the HTTP header:

X-User-Name: <username>

yaml
Copy code

The frontend stores this in `localStorage`.

---

## ✨ Features

- User signup & login
- Generate random images via backend (Picsum)
- Comment mode with clickable pins
- Pins show:
  - Author initials
  - Comment text (sanitized via backend HtmlSanitizer)
- Users may delete **only their own** pins
- Live update of comments after posting

---

## 🧪 Bonus Features (Optional)

- Deleting images
- Draggable pins
- Image deep-linking via URL

---

## 📦 Tech Stack

### Backend

- .NET 10
- ASP.NET Core Web API
- Ulid (ID generation)
- Ganss.Xss (HtmlSanitizer)
- In-memory data store

### Frontend

- React 19
- TypeScript
- Vite
- MUI
- Axios
- React Router

---

## 👨‍💻 Author

Dor — Full Stack Developer  
Tel Aviv, Israel

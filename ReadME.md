# Rema Smart Shopping Assistant 🛒

> **Digital shopping companion for REMA 1000** – helping users plan, optimize, and personalize their grocery trips based on preferences, budgets, and household needs, with the ability to adjust recipes and lists dynamically through an integrated LLM.

---

## 📍 Project Overview

**Rema Smart Shopping Assistant** is a full-stack web application built for the **REMA 1000 Hackathon 2025**. It aims to make grocery shopping smarter, more personal, and more adaptive by providing:

* 📋 **Smart shopping lists** based on preferences, budget, and household size.
* 🥘 **Customizable recipes** that can be adjusted using an LLM to fit dietary needs, budget goals, or sustainability choices.
* 🏷️ **Campaign & offer integration** to maximize savings.
* 🗺️ **In-store route optimization** for efficient shopping.

The solution consists of:

* A **frontend** React app (`frontend/`) for user interaction.
* A **backend** Python API (`backend/`) for logic, data, and LLM integration.

---

## 📁 Repository Structure

```
root
├─ frontend/            # React + Vite + Tailwind + shadcn-ui frontend
├─ backend/             # Python backend (FastAPI) for logic and LLM integration
├─ .env.local           # Local environment variables
└─ node_modules/, venv/ # Dev environments
```

---

## 🧠 Use Case (Hackathon Case Summary)

REMA 1000 wants a **digital shopping assistant** that helps users plan and execute their grocery shopping smarter. It should consider:

* 💸 Budget limits
* 👨‍👩‍👧‍👦 Household size and type
* 📊 Shopping habits and history
* 🧪 Allergies and dietary preferences
* 🏷️ Campaigns and offers
* 🌱 Sustainability aspects — *handled through LLM-powered suggestions, helping users make better choices when adjusting recipes or shopping lists.*
* 🛒 Store logistics and product locations

It should include both a **frontend** (UI/UX) and a **backend** (logic, recommendations, database/API).

---

## ⚙️ Tech Stack

| Layer          | Tech                                             |
| -------------- | ------------------------------------------------ |
| **Frontend**   | React, TypeScript, Vite, Tailwind CSS, shadcn-ui |
| **Backend**    | Python, FastAPI                                  |
| **Styling**    | Tailwind CSS                                     |
| **State Mgmt** | React Query / Context / Zustand (if used)        |
| **Testing**    | Vitest / Jest (frontend), Pytest (backend)       |
| **API**        | REST (JSON)                                      |

---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

### 2. Environment setup

Copy `.env.example` to `.env.local` and configure variables:

```
VITE_API_BASE_URL=http://localhost:8000
```

---

### 🖥️ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Then open:

```
http://localhost:5173
```

---

### ⚙️ Backend Setup

```bash
cd backend
uv sync         # or pip install -r requirements.txt
uv run python main.py
```

The backend will be available at:

```
http://localhost:8000
```

API docs:

```
http://localhost:8000/docs
```

---

## 🔌 API Endpoints

The backend provides several endpoints for integration:

| Method | Endpoint             | Description                      |
| ------ | -------------------- | -------------------------------- |
| GET    | `/api/shopping-list` | Get personalized shopping list   |
| POST   | `/api/preferences`   | Update user preferences          |
| GET    | `/api/recipes`       | Get recipe suggestions           |
| GET    | `/api/products`      | Retrieve product data (demo API) |

Demo Product API:

* `https://startcode-hackathon2025.azurewebsites.net/api/GetProducts`
* `https://startcode-hackathon2025.azurewebsites.net/api/GetProductById?productId={id}`

---

## 🧪 Testing

### Frontend

```bash
cd frontend
npm run test
```

### Backend

```bash
cd backend
pytest
```

---

## 📦 Deployment

### 🚀 Publish via Lovable

1. Go to [Lovable Project](https://lovable.dev/projects/f0fd47e9-8555-4d82-abfd-f28fc74ac1bc)
2. Click **Share → Publish**

### 🌐 Custom Domain

* Navigate to **Project > Settings > Domains**
* Click **Connect Domain** and follow instructions.

Read more: [Custom Domain Setup](https://docs.lovable.dev/features/custom-domain#custom-domain)

---

## 🧭 Developer Workflow

You can contribute and develop using multiple methods:

* **Lovable** (AI editor): Changes auto-commit to repo.
* **Local IDE:** Clone and push to GitHub.
* **GitHub Codespaces:** Develop directly in the browser.
* **GitHub Web Editor:** Quick edits via the GitHub UI.

---

## 🧰 Troubleshooting

| Issue                  | Solution                                   |
| ---------------------- | ------------------------------------------ |
| White screen / no UI   | Check frontend build logs and API base URL |
| Backend not responding | Verify Python env and `.env` variables     |
| CORS errors            | Enable CORS in FastAPI or proxy requests   |
| Auth loop              | Check OAuth redirect URIs and token expiry |

---

## 🤝 Contributing

1. Fork and clone the repo
2. Create a new branch (`feat/my-feature`)
3. Run tests and linters before pushing
4. Submit a pull request

---

## 📜 License

This project is licensed under the **MIT License**.

---

### 🏆 Evaluation Criteria (Hackathon)

* ✅ **Functionality:** Does it work end-to-end?
* 🎨 **UX:** Is the experience intuitive and engaging?
* 📈 **Scalability:** Can this grow into a production feature?
* ✨ **Extra Flair:** Unique or unexpected functionality.
* 🔐 **Security:** Are user data and interactions safe?

---

**Built with ❤️ for REMA 1000 Hackathon 2025 – featuring LLM-powered recipe and shopping list adjustments to support sustainability, budget, and dietary goals.**
# 🏥 MedFlow EMR & Lab Management System

**MedFlow** is a specialized Electronic Medical Record (EMR) platform designed for seamless collaboration between **Doctors** and **Lab Technicians**. It automates the transition from a clinical consultation to a diagnostic lab order.

---

## 🚀 Core Clinical Workflow

The system follows a strict medical logic to ensure data integrity:
1. **Consultation:** Doctor fills out a **SOAP** note (Subjective, Objective, Assessment, Plan).
2. **Auto-Generation:** On save, the system automatically generates a permanent **Medical Record**.
3. **Lab Trigger:** If the `lab_request` field is filled, a **Lab Order** is dispatched immediately to the lab dashboard.
4. **Synchronization:** Lab results appear directly within the Doctor's "Clinical History" once the technician completes the test.

---

## ✨ Key Features

* **⚡ SOAP Charting:** Optimized interface for rapid clinical documentation.
* **📊 Live Lab Tracking:** Visual status badges (`PENDING`, `SAMPLE_TAKEN`, `COMPLETED`).
* **🩸 Patient Summaries:** Instant visibility of **Allergies**, **Chronic Conditions**, and **Blood Groups**.
* **📂 Document Export:** Professional PDF generation for patient referrals using `jsPDF`.
* **🔍 Advanced Search:** Filter history by patient name, diagnosis, or chief complaint.



---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React, TypeScript, Tailwind CSS, Shadcn UI |
| **Backend** | Django, Django REST Framework (DRF) |
| **Database** | PostgreSQL |
| **Auth** | JWT (JSON Web Tokens) |
| **Reporting** | jsPDF, AutoTable |

---

## 📡 API Endpoints (Quick Reference)

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/patients/` | `GET` | Fetch all registered patients |
| `/api/consultations/` | `POST` | Create a new SOAP note & Medical Record |
| `/api/labs/` | `POST` | Trigger a new laboratory investigation |
| `/api/patients/{id}/summary/` | `GET` | Get clinical highlights (Allergies/Conditions) |

---

## 🔧 Installation

1. **Clone the repo**
   ```bash
   git clone [https://github.com/yourusername/medflow-emr.git](https://github.com/yourusername/medflow-emr.git)

2. **Backend Setup**
  ``bash
  cd backend
  pip install -r requirements.txt
  python manage.py migrate
  python manage.py runserver
  Frontend Setup

3. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
Note: Ensure your .env file in the frontend is pointed to http://127.0.0.1:8000 to allow the API calls to resolve correctly.

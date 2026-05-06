# Leadership Assessment Evaluator

A professional-grade full-stack application developed as a technical assessment for **Planet Ganges Consulting**. This tool allows candidates to evaluate their leadership dimensions, receive real-time feedback, and get a personalized PDF report delivered via email.

## 🔗 Live Links
*   **Frontend (GitHub Pages):** [https://chaudharyarchana.github.io/mini-leadership-evaluator/](https://chaudharyarchana.github.io/mini-leadership-evaluator/)
*   **Backend API (Render):** [https://mini-leadership-evaluator.onrender.com](https://mini-leadership-evaluator.onrender.com)

---

## 🚀 Technical Features

### **1. Data Pipeline & Logic**
*   **Dynamic Assessment:** Captures candidate data and scores across three core dimensions: Decision-Making, Team Communication, and Strategic Thinking.
*   **Personalized Feedback:** Implements a logic-driven feedback system that categorizes results into "High," "Medium," and "Low" bands based on performance.
*   **PDF Generation:** Uses `pdfkit` to generate professional-grade reports in-memory as buffers, ensuring speed and data security.

### **2. Professional Mail Delivery**
*   **SendGrid Integration:** Replaced standard SMTP with the **SendGrid Mail Service SDK** to ensure high deliverability and bypass cloud networking restrictions.
*   **Infrastructure Resilience:** Configured for high reliability on Render by utilizing API-driven delivery, avoiding common SMTP timeouts and IPv6 routing issues encountered during deployment.

---

## 🛠️ Tech Stack
*   **Frontend:** HTML5, Tailwind CSS, JavaScript (ES6+)
*   **Backend:** Node.js, Express.js
*   **PDF Engine:** PDFKit
*   **Email Service:** SendGrid API
*   **Hosting:** GitHub Pages (Frontend) & Render (Backend)

---

## ⚠️ Important Note for Evaluators
> **Email Delivery:** Due to the use of a verified single-sender identity for this assessment, the report email may occasionally be filtered into the **Spam** or **Junk** folder. If you do not see the report in your inbox within a few minutes, please check your spam folder.

---

## ⚙️ Environment Variables
To run this project locally, create a `.env` file in the `backend` directory:
```text
PORT=3000
SENDGRID_API_KEY=SG.your_api_key_here
EMAIL_USER=your_verified_sender_email@gmail.com
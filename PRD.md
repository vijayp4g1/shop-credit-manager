# Shop Credit Management System — Product Requirements Document (PRD)

## Document Control
| Version | Date | Author | Status | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1.0 | 2026-05-16 | Product Team | Draft | Initial Draft |
| 1.1 | 2026-05-16 | Product Team | Review | Enhanced with NFRs, PWA, unified schema, and edge cases |

---

## 1. Executive Summary
The **Shop Credit Manager** is a mobile-first web application designed to digitize and streamline the credit tracking process for small-to-medium retail shops. It replaces traditional paper-based ledgers ("khata" books) with a secure, searchable, and automated digital platform. By providing real-time balances, automated calculations, and future payment reminders, the app aims to improve collection rates, reduce accounting errors, and save time for shop owners.

---

## 2. Problem Statement
Small shop owners in regional markets frequently rely on manual notebooks or unstructured WhatsApp messages to track customer credit.
**Pain Points:**
* **Data Loss & Damage:** Notebooks can be lost, damaged, or misplaced.
* **Manual Calculation Errors:** High risk of mathematical errors when calculating running balances across multiple pages.
* **Poor Searchability:** Finding a specific customer's history takes significant time.
* **Lack of Analytics:** No clear visibility into total daily sales, total outstanding market credit, or individual customer risk.
* **Collection Delays:** No automated way to remind customers of overdue payments.

---

## 3. Goals & Objectives

### Primary Goals (MVP)
* **Digitize Ledger:** Provide a simple, fast interface for recording credits and payments.
* **Real-time Accuracy:** Automatically calculate running balances without manual math.
* **Accessibility:** Deliver a mobile-first, Progressive Web App (PWA) experience that works seamlessly on mobile devices.
* **Search & Retrieval:** Enable instant search for customers and their transaction history.

### Secondary Goals (Phase 2 & 3)
* **Automated Reminders:** WhatsApp/SMS integration for automated payment follow-ups.
* **Insights:** Provide actionable analytics (e.g., identifying high-risk customers, collection trends).
* **Multi-tenant / Multi-shop:** Support owners with multiple branch locations and staff members.

---

## 4. Target Audience & User Personas

### Primary Users
* **Kirana Shops (Grocery Stores)**
* **Medical Shops / Pharmacies**
* **Hardware & Electronics Stores**
* **Textile & Garment Shops (e.g., KanchiVastra)**

### User Characteristics
* **Tech-Savvy Level:** Low to Medium.
* **Device Usage:** Predominantly mobile (Android).
* **Environment:** Fast-paced, busy checkouts (requires rapid data entry, often one-handed).
* **Language Preference:** Regional languages (Telugu) and basic English.

---

## 5. Core Functional Requirements

### 5.1 Authentication & Authorization
* **Phone/OTP or Email/Password Login:** Secure access to the platform.
* **Role-Based Access Control (RBAC):**
  * **Owner (Admin):** Full access to edit/delete, view aggregate reports, manage settings.
  * **Staff (Future):** Can only add transactions, view specific customers, cannot delete records or view total shop analytics.

### 5.2 Customer Management
* **Create/Edit Customer:** Name, Phone Number, Address, and Custom Notes.
* **Customer Profile:** Consolidated view showing Total Credit, Total Paid, and Current Pending Balance.
* **Search & Filter:** Fuzzy search by Name or Phone Number.
* **Soft Deletion:** Mark customers as inactive rather than hard-deleting to preserve historical transaction integrity.

### 5.3 Transaction Module (Credit & Payment Entry)
* **Credit Entry (Udhar):** Record new debt.
  * Fields: Customer, Amount, Description/Items, Date.
  * Feature: Quick amount buttons (e.g., +100, +500) for rapid entry.
* **Payment Entry (Jama):** Record received payments.
  * Fields: Customer, Amount, Payment Mode (Cash, UPI, Card), Date.
  * Feature: Validation warning if a payment exceeds the pending balance.
* **Transaction History:** Chronological feed of all credits and payments for a customer with running balance snapshots.

### 5.4 Dashboard & Analytics
* **Key Metrics:** Total Outstanding Market Credit, Total Collected Today, Active Customers.
* **Visualizations:** Simple bar/line charts showing 7-day collection trends vs. credit given.
* **Alerts:** Highlight customers who haven't paid in > 30 days.

### 5.5 Reporting & Exporting
* **Statement Generation:** Generate a PDF ledger statement for a specific customer.
* **Data Export:** Export shop-level transaction history via CSV/Excel for accounting.

---

## 6. User Journeys & Flows

### 6.1 Onboarding & First Use
1. User signs up/logs in.
2. Prompts to set up Shop Profile (Name, Currency, Language).
3. Guided tooltip to "Add your first customer".
4. Guided tooltip to "Add a transaction".

### 6.2 The "Rush Hour" Transaction Flow
1. Shop owner opens app (stays logged in).
2. Taps global "+" button -> "Add Credit" or "Add Payment".
3. Searches customer by first 2 letters -> Selects customer.
4. Enters Amount -> Taps "Save". (Total time target: < 5 seconds).

---

## 7. Non-Functional Requirements (NFRs)

* **Performance:** 
  * App must load within 2 seconds on 4G networks.
  * Search results must populate in < 300ms.
* **Offline Capability (PWA):**
  * App should cache static assets for fast load times.
  * *Future:* Offline transaction queuing (save locally, sync to cloud when online).
* **Localization (i18n):**
  * UI must support dynamic switching between English and Telugu.
* **Security:**
  * All API endpoints must be protected. 
  * Use Row Level Security (RLS) in Supabase to ensure owners only see their own shop's data.
  * Daily automated database backups.
* **Reliability:**
  * 99.9% uptime target for the backend services.

---

## 8. Technical Architecture & Stack

### Frontend
* **Framework:** Next.js (React - App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS + Shadcn UI
* **State Management:** Zustand or React Context
* **PWA:** `next-pwa` (or Serwist) for offline caching and "Install to Home Screen" capability.

### Backend & Database
* **BaaS:** Supabase
* **Database:** PostgreSQL
* **Authentication:** Supabase Auth
* **Storage:** Supabase Storage (for future receipt/bill images)

---

## 9. Enhanced Database Schema

*Note: Incorporating `shop_id` for multi-tenant readiness and `deleted_at` for soft deletes. Using a unified transaction ledger.*

**1. `shops`**
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique shop ID |
| `owner_id` | UUID (FK) | Links to Supabase Auth User |
| `name` | VARCHAR | Shop Name |
| `created_at` | TIMESTAMPTZ | |

**2. `customers`**
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | |
| `shop_id` | UUID (FK) | Links to shops |
| `name` | VARCHAR | |
| `phone` | VARCHAR | |
| `address` | TEXT | |
| `balance` | DECIMAL | Denormalized current balance for fast reads |
| `deleted_at` | TIMESTAMPTZ | Soft delete marker |
| `created_at` | TIMESTAMPTZ | |

**3. `transactions` (Unified Ledger Approach)**
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | |
| `shop_id` | UUID (FK) | |
| `customer_id`| UUID (FK) | |
| `type` | ENUM | 'CREDIT' (Udhar) or 'PAYMENT' (Jama) |
| `amount` | DECIMAL | |
| `payment_mode`| VARCHAR | NULL for Credit, 'UPI'/'CASH' for Payment |
| `description`| TEXT | |
| `created_by` | UUID (FK) | User who recorded it |
| `created_at` | TIMESTAMPTZ | |

---

## 10. Edge Cases & Error Handling

* **Network Disconnection:** If the user loses connection while saving a transaction, show a clear "Offline - Please connect to internet" warning.
* **Overpayment:** If a customer pays more than their pending balance, the app should allow it (resulting in a negative balance / advance payment) but display a confirmation warning.
* **Concurrent Edits:** If two staff members edit the same customer simultaneously, implement optimistic concurrency control or rely on unified chronological transactions to avoid overwriting balances.

---

## 11. MVP Scope vs. Future Roadmap

### Phase 1: MVP (Version 1.0) [COMPLETED]
* [x] Supabase Auth setup.
* [x] CRUD for Customers.
* [x] Unified Transaction Entry (Credit/Payment).
* [x] Dashboard with basic aggregate metrics.
* [x] Mobile-responsive Web UI.
* [x] English language support.

### Phase 2: Growth (Version 1.5)
* [ ] Telugu language localization (i18n).
* [x] PDF statement generation and WhatsApp sharing via deep links.
* [x] Progressive Web App (PWA) installation.
* [ ] Advanced charts and analytics.

### Phase 3: Automation & AI (Version 2.0+)
* Automated WhatsApp reminders via API (e.g., Twilio / Meta API).
* AI Voice Entry ("Add 500 rupees to Ramesh").
* OCR Scanner to upload handwritten bills.
* Multi-shop management and staff roles.

---

## 12. Success Metrics (KPIs)

* **Adoption:** Number of registered shops.
* **Engagement (DAU/MAU):** Percentage of shops adding at least 1 transaction per day.
* **System Usage:** Average time to complete a transaction (Target: < 5 seconds).
* **Business Impact:** Reduction in average days outstanding for customer credit.

---

## 13. Suggested Folder Structure (Next.js)

```text
/shop-credit-manager
 ├── src/
 │   ├── app/                # Next.js App Router (Pages & API routes)
 │   ├── components/         # Reusable UI components (Shadcn, custom)
 │   ├── lib/                # Utility functions, Supabase client
 │   ├── hooks/              # Custom React hooks (e.g., useCustomers)
 │   ├── types/              # TypeScript interfaces/types
 │   ├── store/              # Global state (Zustand)
 │   └── i18n/               # Localization dictionaries (en, te)
 ├── public/                 # Static assets, PWA manifest
 └── supabase/               # Database migrations, seed data, policies
```

# Company Ownership Transfer System

This document outlines the implementation of the **Company Ownership Transfer** feature in the Confideleap CRM Admin Panel.

## 1. Overview
The Ownership Transfer system allows administrators to move a company from its current assigned user to a new owner while maintaining a full audit trail of the change.

### Key Workflows:
- **Select Company:** Identify the company to be transferred via the "All Companies" dashboard.
- **Select New Owner:** Choose the new user who will take over the company.
- **Deactivate Pre-existing Assignment:** The previous assignment is automatically closed.
- **Create New Assignment:** The company is assigned to the new user with an "Active" status.
- **Log History:** Every transfer is recorded in a dedicated history table.

---

## 2. Database Schema Changes

To support this feature and maintain audit history, we need the `assignment_history` table.

```sql
-- Table to store the history of company transfers
CREATE TABLE assignment_history (
    id SERIAL PRIMARY KEY,
    company_id UUID NOT NULL,
    old_user_id UUID,
    new_user_id UUID NOT NULL,
    transferred_by_id UUID,
    company_name VARCHAR(255),
    old_owner_name VARCHAR(255),
    new_owner_name VARCHAR(255),
    transferred_by_name VARCHAR(255),
    transferred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. Backend Implementation (API)

The transfer logic is handled by a transactional API route to ensure Atomicity (the update and the log both happen, or neither do).

**Endpoint:** `POST /api/companies/transfer`

### Core Logic (Transactional):
1. **Fetch Metadata:** Retrieve current owner names and company names for the audit log.
2. **Update Company:**
   - Set `assigned_user_id` to the New User ID.
   - Reset `status` to 'Active'.
   - Clear `deactivated_at` and `deactivated_by` fields.
3. **Record History:** Insert a record into `assignment_history` with the old and new owner names.

---

## 4. Frontend Component

### CompanyTransferModal
A reusable React component that:
1. **Fetches Users:** Loads a list of potential owners (excluding the current owner if possible).
2. **Validates Selection:** Ensures a new owner is selected.
3. **Submits Transfer:** Calls the `/api/companies/transfer` endpoint.
4. **Handles Feedback:** Uses `sonner` for toast notifications (Success/Error).

**Integration Point:**
The `Transfer` button in `admin/companies/page.jsx` triggers this modal and passes the `selectedCompany` object.

---

## 5. Benefits of this Implementation
- **Data Integrity:** Database transactions prevent partially completed transfers.
- **Audit Compliance:** The `assignment_history` table provides a permanent record of who moved which company and when.
- **User Experience:** Instant feedback via toast notifications and automatic UI refresh.
- **Clarity:** Clear labeling of "Old Owner" vs "New Owner" in the database logs.

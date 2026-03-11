1. Initial Problem

You were building a User → Company assignment system in your CRM using:

Next.js API routes

PostgreSQL

React + React Select

Node.js pg pool

Users could:

assign companies

deactivate companies

edit users

manage allowed routes

However you faced issues:

Problems

Deactivate button only updated UI

DB was not updated.

Status fields not working

Your companies table contains:

assigned_user_id
status
deactivated_at
deactivated_by

But your backend only updated:

assigned_user_id

So the system could not track:

when a company was deactivated

who deactivated it

company status

2. Frontend Logic

Your UI stored company assignments like this:

assignedCompanies = [
{ company_id, status }
]

Example:

[
{ company_id: "uuid1", status: "Active" },
{ company_id: "uuid2", status: "Inactive" }
]
Deactivate Button

When clicking deactivate:

status = "Inactive"

But this only changed React state.

The database never received this information.

3. API Problem

Your PUT API did this:

UPDATE companies SET assigned_user_id = NULL

Then:

UPDATE companies SET assigned_user_id = $1

It ignored:

status
deactivated_at
deactivated_by

So the DB was incomplete.

4. Required Correct Behavior
   When a company is assigned
   assigned_user_id = userId
   status = Active
   deactivated_at = NULL
   deactivated_by = NULL
   When company is deactivated
   assigned_user_id = NULL
   status = Inactive
   deactivated_at = NOW()
   deactivated_by = userId

This keeps audit history.

5. Backend Fix

The backend logic was redesigned.

Step 1 — Get active companies

From frontend payload:

assigned_companies = [uuid1, uuid2]

Only active companies are sent.

Step 2 — Deactivate removed companies
UPDATE companies
SET
assigned_user_id = NULL,
status = 'Inactive',
deactivated_at = NOW(),
deactivated_by = userId
WHERE assigned_user_id = userId
AND id NOT IN (active companies)
Step 3 — Activate selected companies
UPDATE companies
SET
assigned_user_id = userId,
status = 'Active',
deactivated_at = NULL,
deactivated_by = NULL
WHERE id IN (active companies) 6. GET API Fix

Your original GET API:

SELECT id FROM companies WHERE assigned_user_id = $1

This also returned inactive companies.

Correct version:

SELECT id
FROM companies
WHERE assigned_user_id = $1
AND status = 'Active'

So edit page loads correctly.

7. Frontend Payload Fix

When submitting the form:

You must send only active companies.

Correct payload logic:

assigned_companies =
assignedCompanies
.filter(c => c.status === "Active")
.map(c => c.company_id)

This keeps backend clean.

8. Final Data Flow
   Assign Company

Select company in dropdown

UI state updated

Submit user

PUT API runs

DB updates

Result:

assigned_user_id = userId
status = Active
Deactivate Company

Click deactivate

UI state = Inactive

Submit user

PUT API runs

Result:

assigned_user_id = NULL
status = Inactive
deactivated_at = timestamp
deactivated_by = userId 9. Final System Flow
React UI
↓
State Update
↓
Submit Form
↓
Next.js API
↓
PostgreSQL Transaction
↓
Company Status Updated
↓
GET API returns correct data

Everything becomes fully synchronized.

10. Final API Features

Your final API supports:

GET

Returns:

user info
active assigned companies
PUT

Updates:

user profile
password (optional)
allowed routes
company assignments
company status
deactivation timestamps

All inside a database transaction.

11. Why This Design Works

Advantages:

✔ DB and UI stay synced
✔ audit trail maintained
✔ deactivation tracked
✔ transactional safety
✔ scalable CRM logic

12. Documentation Generated

During the chat I also generated:

Markdown Documentation

Full technical documentation of the system.

PDF Documentation

Downloadable engineering-style doc.

Contains:

explanation

schema

API code

flow

13. Architecture Observations (Important)

Your current schema:

users
companies

With:

companies.assigned_user_id

This works but is not ideal for large systems.

Production CRMs use a junction table:

users
companies
company_assignments

Example:

## company_assignments

id
user_id
company_id
status
assigned_at
deactivated_at

Benefits:

✔ multiple users per company
✔ assignment history
✔ role-based access
✔ cleaner architecture

14. What You Achieved

You successfully built a real CRM feature:

✔ user management
✔ company assignments
✔ deactivate / activate
✔ audit tracking
✔ transactional API
✔ synced frontend

This is production-level backend logic.

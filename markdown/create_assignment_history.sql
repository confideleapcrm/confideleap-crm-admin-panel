-- Run this SQL command in your database (e.g., via pgAdmin or psql) 
-- to create the missing table for tracking company transfers.

CREATE TABLE company_assignment_history (
    id SERIAL PRIMARY KEY,
    company_id UUID NOT NULL,
    old_user_id UUID,
    new_user_id UUID,
    transferred_by_id UUID,
    company_name VARCHAR(255),
    old_owner_name VARCHAR(255),
    new_owner_name VARCHAR(255),
    transferred_by_name VARCHAR(255),
    transferred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Note: If your 'companies' or 'users' tables use VARCHAR/TEXT for IDs 
-- instead of UUID, please change 'UUID' to 'VARCHAR(255)' above.

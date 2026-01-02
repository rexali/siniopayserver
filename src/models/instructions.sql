/*
  # Fintech Application Database Schema

  ## Overview
  This migration creates the complete database schema for a fintech application with customer-facing and admin features.

  ## New Tables

  ### 1. profiles
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - User email
  - `phone` (text) - Phone number
  - `full_name` (text) - User's full name
  - `date_of_birth` (date) - Date of birth
  - `address` (jsonb) - Address details
  - `avatar_url` (text) - Profile picture URL
  - `role` (text) - User role (customer, admin, super_admin)
  - `status` (text) - Account status (active, suspended, blocked)
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. kyc_verifications
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - References profiles
  - `verification_type` (text) - Type of verification (identity, address, etc)
  - `status` (text) - Verification status (pending, approved, rejected)
  - `documents` (jsonb) - Document details
  - `verified_by` (uuid) - Admin who verified (references profiles)
  - `verified_at` (timestamptz) - Verification timestamp
  - `rejection_reason` (text) - Reason for rejection
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. accounts
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - References profiles
  - `account_type` (text) - Type (wallet, bank_linked)
  - `account_number` (text) - Account number
  - `balance` (decimal) - Current balance
  - `currency` (text) - Currency code (USD, EUR, etc)
  - `status` (text) - Account status (active, frozen, closed)
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. transactions
  - `id` (uuid, primary key) - Unique identifier
  - `from_account_id` (uuid) - Source account
  - `to_account_id` (uuid) - Destination account
  - `amount` (decimal) - Transaction amount
  - `currency` (text) - Currency code
  - `type` (text) - Transaction type (transfer, payment, bill_payment)
  - `status` (text) - Status (pending, completed, failed, flagged)
  - `description` (text) - Transaction description
  - `metadata` (jsonb) - Additional data
  - `flagged_reason` (text) - Reason if flagged
  - `reviewed_by` (uuid) - Admin who reviewed
  - `reviewed_at` (timestamptz) - Review timestamp
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 5. linked_accounts
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - References profiles
  - `account_id` (uuid) - References accounts
  - `external_account_type` (text) - Type (bank, card)
  - `external_account_data` (jsonb) - External account details
  - `status` (text) - Link status (active, inactive)
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 6. notifications
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - References profiles
  - `type` (text) - Notification type (transaction, reminder, alert)
  - `title` (text) - Notification title
  - `message` (text) - Notification message
  - `read` (boolean) - Read status
  - `metadata` (jsonb) - Additional data
  - `created_at` (timestamptz) - Creation timestamp

  ### 7. support_tickets
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - References profiles
  - `subject` (text) - Ticket subject
  - `message` (text) - Ticket message
  - `status` (text) - Status (open, in_progress, resolved, closed)
  - `priority` (text) - Priority (low, medium, high)
  - `assigned_to` (uuid) - Admin assigned
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 8. faqs
  - `id` (uuid, primary key) - Unique identifier
  - `question` (text) - FAQ question
  - `answer` (text) - FAQ answer
  - `category` (text) - FAQ category
  - `order` (integer) - Display order
  - `active` (boolean) - Active status
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 9. audit_logs
  - `id` (uuid, primary key) - Unique identifier
  - `admin_id` (uuid) - References profiles
  - `action` (text) - Action performed
  - `resource_type` (text) - Type of resource
  - `resource_id` (uuid) - Resource identifier
  - `details` (jsonb) - Additional details
  - `created_at` (timestamptz) - Creation timestamp

  ### 10. compliance_settings
  - `id` (uuid, primary key) - Unique identifier
  - `setting_type` (text) - Setting type (transaction_limit, aml_rule)
  - `setting_key` (text) - Setting key
  - `setting_value` (jsonb) - Setting value
  - `active` (boolean) - Active status
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on all tables
  - Implement policies for authenticated users to access their own data
  - Implement admin policies for administrative access
  - Implement audit logging for admin actions

  ## Notes
  1. All sensitive data is protected by RLS
  2. Admin actions are logged for compliance
  3. Transaction limits and AML rules are configurable
  4. Multi-factor authentication is handled by Supabase Auth
*/
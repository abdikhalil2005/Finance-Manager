# Financial Management System - Setup Instructions

## Initial Setup

This system is designed for internal use only with no public registration. User accounts must be created directly in the database.

## Creating Your First User

To create the first admin user, you need to:

1. **Create a user in Supabase Auth**:
   - Go to your Supabase project dashboard
   - Navigate to Authentication > Users
   - Click "Add user" or "Invite user"
   - Enter the email address and password for the admin user
   - The user will be created in the `auth.users` table

2. **Verify the user is created**:
   - Once created, a corresponding profile record will automatically be created in the `profiles` table
   - The user can now log in to the system using their email and password

## Using SQL (Alternative Method)

You can also create a user directly using SQL:

```sql
-- Note: This will create an auth user and automatically create a profile
-- Replace 'admin@yourcompany.com' and 'your-secure-password' with actual values

-- First, you'll need to use Supabase's Auth Admin API or dashboard to create the user
-- The system will automatically create the profile record through RLS policies
```

## Logging In

1. Navigate to the application URL
2. Enter the email and password you created
3. Click "Sign In"

## System Overview

Once logged in, you'll have access to:

- **Dashboard**: View monthly financial KPIs and summaries
- **Assignments**: Manage client assignments with guard details and pricing
- **Invoices**:
  - Invoice Month: Track monthly invoices per assignment
  - Receipts: View automatically generated receipts for paid invoices
- **Expenses**: Track all expense categories (Salaries, Rent, Uniforms, Fuel, Food Bill, Petty Cash)
- **Report**: Generate comprehensive monthly financial reports

## Important Notes

- There is NO public registration page by design
- All users must be created through the Supabase dashboard or SQL
- Receipts are automatically created when invoice months are marked as "Paid"
- Payroll files are stored permanently for audit purposes
- Receipt files should NOT be uploaded to the system - use external URLs instead

## Database Structure

The system uses the following main tables:
- `profiles`: User profiles linked to auth.users
- `assignments`: Client/school assignments
- `invoice_months`: Monthly invoices per assignment
- `receipts`: Payment receipts (auto-generated)
- `salaries`, `rent`, `uniforms`, `fuel`, `food_bill`, `petty_cashes`: Expense tracking

## Support

For technical support or questions about the system, contact your system administrator.

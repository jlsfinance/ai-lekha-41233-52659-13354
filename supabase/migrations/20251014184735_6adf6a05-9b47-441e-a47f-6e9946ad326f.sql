-- Insert default chart of accounts for new users
-- This will help users get started quickly

-- Function to create default accounts for a user
CREATE OR REPLACE FUNCTION public.create_default_accounts(p_user_id UUID, p_company_id UUID)
RETURNS void AS $$
BEGIN
  -- Assets
  INSERT INTO public.accounts (user_id, company_id, name, type, code) VALUES
  (p_user_id, p_company_id, 'Cash in Hand', 'asset', 'CA001'),
  (p_user_id, p_company_id, 'Bank Account', 'asset', 'CA002'),
  (p_user_id, p_company_id, 'Sundry Debtors', 'asset', 'CA003'),
  (p_user_id, p_company_id, 'Stock in Hand', 'asset', 'CA004'),
  (p_user_id, p_company_id, 'Furniture & Fixtures', 'asset', 'FA001'),
  
  -- Liabilities
  (p_user_id, p_company_id, 'Sundry Creditors', 'liability', 'CL001'),
  (p_user_id, p_company_id, 'Capital Account', 'liability', 'CL002'),
  (p_user_id, p_company_id, 'Loans & Advances', 'liability', 'LT001'),
  
  -- Income
  (p_user_id, p_company_id, 'Sales Account', 'income', 'IN001'),
  (p_user_id, p_company_id, 'Service Income', 'income', 'IN002'),
  (p_user_id, p_company_id, 'Other Income', 'income', 'IN003'),
  
  -- Expenses
  (p_user_id, p_company_id, 'Purchase Account', 'expense', 'EX001'),
  (p_user_id, p_user_id, 'Salary & Wages', 'expense', 'EX002'),
  (p_user_id, p_company_id, 'Rent', 'expense', 'EX003'),
  (p_user_id, p_company_id, 'Electricity', 'expense', 'EX004'),
  (p_user_id, p_company_id, 'Telephone', 'expense', 'EX005'),
  (p_user_id, p_company_id, 'Printing & Stationery', 'expense', 'EX006'),
  (p_user_id, p_company_id, 'Travelling Expenses', 'expense', 'EX007'),
  (p_user_id, p_company_id, 'Miscellaneous Expenses', 'expense', 'EX008');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the handle_new_user function to create default accounts
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_company_id UUID;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'staff'
  );
  
  -- Create default company
  INSERT INTO public.companies (user_id, name, email)
  VALUES (NEW.id, 'My Company', NEW.email)
  RETURNING id INTO new_company_id;
  
  -- Create default accounts
  PERFORM create_default_accounts(NEW.id, new_company_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
-- Fix security warnings by setting proper search_path on functions

-- Fix create_default_accounts function
CREATE OR REPLACE FUNCTION public.create_default_accounts(p_user_id UUID, p_company_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  (p_user_id, p_company_id, 'Salary & Wages', 'expense', 'EX002'),
  (p_user_id, p_company_id, 'Rent', 'expense', 'EX003'),
  (p_user_id, p_company_id, 'Electricity', 'expense', 'EX004'),
  (p_user_id, p_company_id, 'Telephone', 'expense', 'EX005'),
  (p_user_id, p_company_id, 'Printing & Stationery', 'expense', 'EX006'),
  (p_user_id, p_company_id, 'Travelling Expenses', 'expense', 'EX007'),
  (p_user_id, p_company_id, 'Miscellaneous Expenses', 'expense', 'EX008');
END;
$$;

-- Fix update_updated_at_column function  
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
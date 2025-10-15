// Multi-language translation utilities for invoices and reports

export const translations: Record<string, Record<string, string>> = {
  en: {
    // Invoice Headers
    'invoice': 'INVOICE',
    'tax_invoice': 'TAX INVOICE',
    'invoice_no': 'Invoice No',
    'date': 'Date',
    'gstin': 'GSTIN',
    'phone': 'Phone',
    'email': 'Email',
    
    // Customer Details
    'bill_to': 'Bill To',
    'customer_name': 'Customer Name',
    'customer_gstin': 'Customer GSTIN',
    'address': 'Address',
    
    // Item Details
    'item_name': 'Item Name',
    'hsn_code': 'HSN Code',
    'quantity': 'Quantity',
    'qty': 'Qty',
    'unit': 'Unit',
    'rate': 'Rate',
    'discount': 'Discount',
    'tax': 'Tax',
    'amount': 'Amount',
    
    // Totals
    'subtotal': 'Subtotal',
    'total_discount': 'Total Discount',
    'taxable_amount': 'Taxable Amount',
    'cgst': 'CGST',
    'sgst': 'SGST',
    'igst': 'IGST',
    'total_tax': 'Total Tax',
    'grand_total': 'Grand Total',
    'total_amount': 'Total Amount',
    
    // Payment
    'payment_method': 'Payment Method',
    'paid': 'Paid',
    'balance': 'Balance Due',
    
    // Footer
    'terms_conditions': 'Terms & Conditions',
    'authorized_signatory': 'Authorized Signatory',
    'thank_you': 'Thank you for your business!',
    
    // Common
    'sr_no': 'Sr. No.',
    'description': 'Description',
    'remarks': 'Remarks',
    'total': 'Total',
    'company_details': 'Company Details',
  },
  
  hi: {
    // Invoice Headers
    'invoice': 'बीजक',
    'tax_invoice': 'कर बीजक',
    'invoice_no': 'बीजक संख्या',
    'date': 'दिनांक',
    'gstin': 'जीएसटीआईएन',
    'phone': 'फ़ोन',
    'email': 'ईमेल',
    
    // Customer Details
    'bill_to': 'बिल प्राप्तकर्ता',
    'customer_name': 'ग्राहक का नाम',
    'customer_gstin': 'ग्राहक जीएसटीआईएन',
    'address': 'पता',
    
    // Item Details
    'item_name': 'वस्तु का नाम',
    'hsn_code': 'एचएसएन कोड',
    'quantity': 'मात्रा',
    'qty': 'मात्रा',
    'unit': 'इकाई',
    'rate': 'दर',
    'discount': 'छूट',
    'tax': 'कर',
    'amount': 'राशि',
    
    // Totals
    'subtotal': 'उप योग',
    'total_discount': 'कुल छूट',
    'taxable_amount': 'कर योग्य राशि',
    'cgst': 'सीजीएसटी',
    'sgst': 'एसजीएसटी',
    'igst': 'आईजीएसटी',
    'total_tax': 'कुल कर',
    'grand_total': 'कुल योग',
    'total_amount': 'कुल राशि',
    
    // Payment
    'payment_method': 'भुगतान विधि',
    'paid': 'भुगतान',
    'balance': 'शेष राशि',
    
    // Footer
    'terms_conditions': 'नियम और शर्तें',
    'authorized_signatory': 'अधिकृत हस्ताक्षरकर्ता',
    'thank_you': 'आपके व्यवसाय के लिए धन्यवाद!',
    
    // Common
    'sr_no': 'क्र.सं.',
    'description': 'विवरण',
    'remarks': 'टिप्पणी',
    'total': 'कुल',
    'company_details': 'कंपनी विवरण',
  }
};

export const translate = (key: string, language: 'en' | 'hi' = 'en'): string => {
  return translations[language][key] || key;
};

export const getBilingualText = (key: string): string => {
  const en = translations.en[key] || key;
  const hi = translations.hi[key] || key;
  return `${en} / ${hi}`;
};

export const formatCurrency = (amount: number, language: 'en' | 'hi' = 'en'): string => {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
  
  return formatted;
};

export const formatDate = (date: Date | string, language: 'en' | 'hi' = 'en'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (language === 'hi') {
    return d.toLocaleDateString('hi-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

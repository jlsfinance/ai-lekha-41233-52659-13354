// Generate demo data for testing

export const generateDemoItems = (count: number = 100) => {
  const categories = ['goods', 'services', 'raw_material', 'finished_goods', 'consumables'];
  const units = ['Nos', 'Kg', 'Ltr', 'Mtr', 'Box', 'Pcs', 'Dozen'];
  
  const itemNames = [
    // Groceries
    'Rice Basmati', 'Wheat Flour', 'Sugar', 'Cooking Oil', 'Tea Powder',
    'Coffee Powder', 'Salt', 'Turmeric Powder', 'Red Chilli Powder', 'Garam Masala',
    // Electronics
    'LED Bulb', 'Fan', 'Wire Cable', 'Switch Board', 'Socket',
    'USB Cable', 'Mobile Charger', 'Power Bank', 'Earphones', 'Mouse',
    // Clothing
    'Cotton Shirt', 'Jeans Pant', 'T-Shirt', 'Saree', 'Kurta',
    'Blazer', 'Jacket', 'Socks', 'Handkerchief', 'Belt',
    // Household
    'Bucket', 'Mug', 'Plate', 'Glass', 'Bowl',
    'Spoon', 'Fork', 'Knife', 'Cutting Board', 'Dustbin',
    // Stationery
    'Pen', 'Pencil', 'Notebook', 'File', 'Stapler',
    'Paper', 'Envelope', 'Stamp Pad', 'Marker', 'Highlighter'
  ];

  const items = [];
  
  for (let i = 0; i < count; i++) {
    const baseName = itemNames[Math.floor(Math.random() * itemNames.length)];
    const name = count > itemNames.length 
      ? `${baseName} ${Math.floor(Math.random() * 10) + 1}`
      : baseName;
    
    items.push({
      name,
      category: categories[Math.floor(Math.random() * categories.length)],
      hsn_code: String(Math.floor(Math.random() * 90000000) + 10000000).substring(0, 8),
      unit: units[Math.floor(Math.random() * units.length)],
      rate: parseFloat((Math.random() * 5000 + 10).toFixed(2)),
      tax_rate: [0, 5, 12, 18, 28][Math.floor(Math.random() * 5)],
      description: `Sample ${baseName.toLowerCase()} item for demo`
    });
  }
  
  return items;
};

export const generateDemoParties = (count: number = 50) => {
  const firstNames = [
    'Ramesh', 'Suresh', 'Mahesh', 'Rajesh', 'Dinesh',
    'Amit', 'Rohit', 'Vijay', 'Ajay', 'Sanjay',
    'Priya', 'Sneha', 'Pooja', 'Neha', 'Anjali'
  ];
  
  const lastNames = [
    'Traders', 'Enterprises', 'Corporation', 'Industries', 'Solutions',
    'Store', 'Mart', 'Shop', 'Suppliers', 'Distributors'
  ];
  
  const cities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
    'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'
  ];

  const parties = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    
    parties.push({
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}@example.com`,
      phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      gstin: `${String(i + 1).padStart(2, '0')}AAAAA${Math.floor(Math.random() * 9000) + 1000}A1Z5`,
      address: `${Math.floor(Math.random() * 999) + 1}, ${city}, India`,
      outstanding_balance: parseFloat((Math.random() * 50000).toFixed(2))
    });
  }
  
  return parties;
};

export const generateDemoTransactions = (
  count: number = 200,
  accountIds: string[],
  clientIds: string[],
  vendorIds: string[]
) => {
  const types = ['payment', 'receipt', 'journal', 'sales', 'purchase'];
  const transactions = [];
  
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);
  
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const date = new Date(startDate.getTime() + Math.random() * (Date.now() - startDate.getTime()));
    
    transactions.push({
      type,
      reference_number: `${type.substring(0, 3).toUpperCase()}-${String(i + 1).padStart(4, '0')}`,
      date: date.toISOString().split('T')[0],
      debit_account_id: accountIds[Math.floor(Math.random() * accountIds.length)],
      credit_account_id: accountIds[Math.floor(Math.random() * accountIds.length)],
      amount: parseFloat((Math.random() * 50000 + 500).toFixed(2)),
      client_id: type === 'sales' ? clientIds[Math.floor(Math.random() * clientIds.length)] : null,
      vendor_id: type === 'purchase' ? vendorIds[Math.floor(Math.random() * vendorIds.length)] : null,
      gst_amount: parseFloat((Math.random() * 5000).toFixed(2)),
      description: `Demo transaction ${i + 1}`
    });
  }
  
  return transactions;
};

export const generateDemoInvoiceItems = (transactionIds: string[], itemIds: string[]) => {
  const invoiceItems = [];
  
  transactionIds.forEach(txId => {
    const itemCount = Math.floor(Math.random() * 5) + 1;
    
    for (let i = 0; i < itemCount; i++) {
      const quantity = Math.floor(Math.random() * 50) + 1;
      const rate = parseFloat((Math.random() * 1000 + 10).toFixed(2));
      const discountPercent = [0, 5, 10, 15][Math.floor(Math.random() * 4)];
      const taxRate = [0, 5, 12, 18][Math.floor(Math.random() * 4)];
      
      const subtotal = quantity * rate;
      const discount = subtotal * (discountPercent / 100);
      const taxable = subtotal - discount;
      const tax = taxable * (taxRate / 100);
      const amount = taxable + tax;
      
      invoiceItems.push({
        transaction_id: txId,
        item_id: itemIds[Math.floor(Math.random() * itemIds.length)],
        item_name: `Demo Item ${i + 1}`,
        quantity,
        rate,
        discount_percent: discountPercent,
        tax_rate: taxRate,
        amount: parseFloat(amount.toFixed(2))
      });
    }
  });
  
  return invoiceItems;
};

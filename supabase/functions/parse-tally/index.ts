import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { xmlContent } = await req.json();
    
    if (!xmlContent) {
      throw new Error("No XML content provided");
    }

    console.log('Parsing Tally XML data...');

    // Parse XML - simplified approach for Tally format
    const items = parseTallyItems(xmlContent);
    const ledgers = parseTallyLedgers(xmlContent);
    const parties = parseTallyParties(xmlContent);
    const vouchers = parseTallyVouchers(xmlContent);

    console.log(`Parsed: ${items.length} items, ${ledgers.length} ledgers, ${parties.length} parties`);

    return new Response(
      JSON.stringify({
        items,
        ledgers,
        parties,
        vouchers,
        success: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Parse error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function parseTallyItems(xml: string): any[] {
  const items: any[] = [];
  
  // Match STOCKITEM tags
  const stockItemRegex = /<STOCKITEM[^>]*>([\s\S]*?)<\/STOCKITEM>/gi;
  let match;

  while ((match = stockItemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    
    const name = extractTag(itemXml, 'NAME');
    const category = extractTag(itemXml, 'CATEGORY') || extractTag(itemXml, 'PARENT') || 'goods';
    const unit = extractTag(itemXml, 'BASEUNITS') || 'Nos';
    const rate = extractTag(itemXml, 'RATE') || extractTag(itemXml, 'STANDARDRATE') || '0';
    const hsnCode = extractTag(itemXml, 'HSNCODE') || extractTag(itemXml, 'GSTDETAILS.LIST/HSNCODE');
    const taxRate = extractTag(itemXml, 'GSTRATE') || extractTag(itemXml, 'VATRATE') || '0';

    if (name) {
      items.push({
        name: cleanValue(name),
        category: mapCategory(cleanValue(category)),
        unit: cleanValue(unit),
        rate: cleanValue(rate),
        hsnCode: cleanValue(hsnCode),
        taxRate: cleanValue(taxRate)
      });
    }
  }

  return items;
}

function parseTallyLedgers(xml: string): any[] {
  const ledgers: any[] = [];
  
  const ledgerRegex = /<LEDGER[^>]*>([\s\S]*?)<\/LEDGER>/gi;
  let match;

  while ((match = ledgerRegex.exec(xml)) !== null) {
    const ledgerXml = match[1];
    
    const name = extractTag(ledgerXml, 'NAME');
    const parent = extractTag(ledgerXml, 'PARENT');
    const openingBalance = extractTag(ledgerXml, 'OPENINGBALANCE');
    const closingBalance = extractTag(ledgerXml, 'CLOSINGBALANCE');

    if (name && !name.toLowerCase().includes('profit') && !name.toLowerCase().includes('loss')) {
      ledgers.push({
        name: cleanValue(name),
        type: parent || 'Current Assets',
        openingBalance: cleanValue(openingBalance) || '0',
        closingBalance: cleanValue(closingBalance) || '0'
      });
    }
  }

  return ledgers;
}

function parseTallyParties(xml: string): any[] {
  const parties: any[] = [];
  
  const ledgerRegex = /<LEDGER[^>]*>([\s\S]*?)<\/LEDGER>/gi;
  let match;

  while ((match = ledgerRegex.exec(xml)) !== null) {
    const ledgerXml = match[1];
    
    const name = extractTag(ledgerXml, 'NAME');
    const parent = extractTag(ledgerXml, 'PARENT')?.toLowerCase() || '';
    const gstin = extractTag(ledgerXml, 'PARTYGSTIN') || extractTag(ledgerXml, 'GSTIN');
    const address = extractTag(ledgerXml, 'ADDRESS');
    const phone = extractTag(ledgerXml, 'PHONE') || extractTag(ledgerXml, 'MOBILE');
    const outstanding = extractTag(ledgerXml, 'CLOSINGBALANCE');

    // Identify parties (customers/suppliers)
    if (name && (parent.includes('sundry') || parent.includes('debtor') || parent.includes('creditor'))) {
      parties.push({
        name: cleanValue(name),
        type: parent.includes('debtor') || parent.includes('customer') ? 'customer' : 'supplier',
        gstin: cleanValue(gstin),
        address: cleanValue(address),
        phone: cleanValue(phone),
        outstanding: cleanValue(outstanding) || '0'
      });
    }
  }

  return parties;
}

function parseTallyVouchers(xml: string): any[] {
  const vouchers: any[] = [];
  
  const voucherRegex = /<VOUCHER[^>]*>([\s\S]*?)<\/VOUCHER>/gi;
  let match;

  while ((match = voucherRegex.exec(xml)) !== null) {
    const voucherXml = match[1];
    
    const voucherType = extractTag(voucherXml, 'VOUCHERTYPENAME');
    const date = extractTag(voucherXml, 'DATE');
    const number = extractTag(voucherXml, 'VOUCHERNUMBER');
    const partyName = extractTag(voucherXml, 'PARTYNAME');
    const amount = extractTag(voucherXml, 'AMOUNT');

    if (voucherType) {
      vouchers.push({
        type: cleanValue(voucherType),
        date: cleanValue(date),
        number: cleanValue(number),
        party: cleanValue(partyName),
        amount: cleanValue(amount) || '0'
      });
    }
  }

  return vouchers;
}

function extractTag(xml: string, tagName: string): string | null {
  // Try standard tag
  const regex1 = new RegExp(`<${tagName}[^>]*>([^<]+)<\/${tagName}>`, 'i');
  const match1 = xml.match(regex1);
  if (match1) return match1[1];

  // Try self-closing or different format
  const regex2 = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\/${tagName}>`, 'i');
  const match2 = xml.match(regex2);
  if (match2) return match2[1];

  return null;
}

function cleanValue(value: string | null): string {
  if (!value) return '';
  return value
    .replace(/<[^>]*>/g, '') // Remove XML tags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

function mapCategory(category: string): string {
  const cat = category.toLowerCase();
  if (cat.includes('raw') || cat.includes('material')) return 'raw_material';
  if (cat.includes('finished')) return 'finished_goods';
  if (cat.includes('service')) return 'services';
  if (cat.includes('consumable')) return 'consumables';
  return 'goods';
}

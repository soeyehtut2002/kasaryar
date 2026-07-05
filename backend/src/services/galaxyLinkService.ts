import crypto from 'crypto';

const GALAXYLINK_API_URL = process.env.GALAXYLINK_API_URL || 'https://api.galaxylink.com.mm/v1';
const GALAXYLINK_PARTNER_ID = process.env.GALAXYLINK_PARTNER_ID || '';
const GALAXYLINK_SECRET_KEY = process.env.GALAXYLINK_SECRET_KEY || '';

/**
 * MD5 သို့မဟုတ် SHA256 Signature ထုတ်လုပ်ပေးသော helper
 * GalaxyLink documentation ညွှန်ကြားချက်အတိုင်း parameters များကို sorting/hashing လုပ်ရန် သုံးသည်
 */
const generateSignature = (params: Record<string, any>): string => {
  // 1. Keys များကို Alphabetical order (a-z) အလိုက် စီသည်
  const sortedKeys = Object.keys(params).sort();
  
  // 2. key=value String တွဲများ ပြုလုပ်သည်
  const queryString = sortedKeys
    .map(key => `${key}=${params[key]}`)
    .join('&');
    
  // 3. String အနောက်တွင် Secret Key ပေါင်းထည့်သည်
  const signString = `${queryString}&secret_key=${GALAXYLINK_SECRET_KEY}`;
  
  // 4. SHA256 hash ထုတ်ယူသည် (GalaxyLink API စံနှုန်းအတိုင်း MD5 သို့မဟုတ် SHA256 သုံးနိုင်သည်)
  return crypto.createHash('sha256').update(signString).digest('hex');
};

/**
 * ၁။ GalaxyLink B2B Merchant Balance စစ်ဆေးခြင်း
 */
export const checkBalance = async () => {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const params = {
      partner_id: GALAXYLINK_PARTNER_ID,
      timestamp
    };
    
    const signature = generateSignature(params);
    
    const response = await fetch(`${GALAXYLINK_API_URL}/balance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature
      },
      body: JSON.stringify(params)
    });
    
    const data = await response.json();
    return data; // returns: { balance: number, currency: string, ... }
  } catch (error) {
    console.error('GalaxyLink balance fetch failed:', error);
    throw new Error('Could not retrieve balance from provider');
  }
};

/**
 * ၂။ GalaxyLink သို့ Top-Up Order ပေးပို့ခြင်း
 */
export const placeOrder = async (orderData: {
  orderNumber: string;
  gameUserId: string;
  zoneId?: string;
  productCode: string;
}) => {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    
    const params: Record<string, any> = {
      partner_id: GALAXYLINK_PARTNER_ID,
      partner_order_id: orderData.orderNumber,
      game_user_id: orderData.gameUserId,
      product_code: orderData.productCode,
      timestamp
    };
    
    if (orderData.zoneId) {
      params.zone_id = orderData.zoneId;
    }
    
    const signature = generateSignature(params);
    
    // API request details
    const response = await fetch(`${GALAXYLINK_API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature
      },
      body: JSON.stringify(params)
    });
    
    const data = await response.json();
    return data; 
    // Response standard: { status: 'SUCCESS' | 'PENDING' | 'FAILED', provider_order_id: string }
  } catch (error) {
    console.error('GalaxyLink place order failed:', error);
    throw new Error('Failed to submit top-up request to GalaxyLink');
  }
};

/**
 * ၃။ GalaxyLink Order Status အား (Webhook မရပါက) Polling ဖြင့် လှမ်းစစ်ခြင်း
 */
export const queryOrderStatus = async (orderNumber: string) => {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const params = {
      partner_id: GALAXYLINK_PARTNER_ID,
      partner_order_id: orderNumber,
      timestamp
    };
    
    const signature = generateSignature(params);
    
    const response = await fetch(`${GALAXYLINK_API_URL}/orders/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature
      },
      body: JSON.stringify(params)
    });
    
    const data = await response.json();
    return data; // returns status: SUCCESS, FAILED, or PENDING
  } catch (error) {
    console.error('GalaxyLink order status query failed:', error);
    throw new Error('Failed to fetch transaction status from provider');
  }
};

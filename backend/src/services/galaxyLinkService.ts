import crypto from 'crypto';

const GALAXYLINK_API_URL = process.env.GALAXYLINK_API_URL || 'https://api.galaxylink.gg';
const GALAXYLINK_CLIENT_ID = process.env.GALAXYLINK_CLIENT_ID || '1'; // Default placeholder client id
const GALAXYLINK_API_KEY = process.env.GALAXYLINK_API_KEY || 'your_secret_api_key';

// Token caching variables (ဆာဗာသက်တမ်း ၂ နာရီဖြစ်လို့ memory ထဲမှာ cache လုပ်ပြီး ယူသုံးပါမည်)
let cachedToken: string | null = null;
let tokenExpiryTime: number = 0; // Epoch timestamp in milliseconds

/**
 * ၁။ GalaxyLink B2B Token တောင်းယူခြင်း (POST /auth/token)
 * Screenshot ရှိ PHP implementation အတိုင်း တိကျစွာ ရေးသားထားပါသည်
 */
export const getAuthToken = async (): Promise<string> => {
  // Token သက်တမ်း ၅ မိနစ်ထက်ပိုကျန်သေးရင် Cache ထဲကပဲ ပြန်သုံးမည်
  if (cachedToken && Date.now() < tokenExpiryTime - 5 * 60 * 1000) {
    return cachedToken;
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    // Signature Formula: sha256(apiKey + timestamp)
    const signSource = `${GALAXYLINK_API_KEY}${timestamp}`;
    const sign = crypto.createHash('sha256').update(signSource).digest('hex');

    const response = await fetch(`${GALAXYLINK_API_URL}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: GALAXYLINK_CLIENT_ID,
        timestamp: timestamp,
        sign: sign
      })
    });

    const data: any = await response.json();
    
    // API Response မှ token ရယူခြင်း
    if (!response.ok || !data.token) {
      throw new Error(data.message || 'Token generation failed');
    }

    cachedToken = data.token;
    // သက်တမ်း ၂ နာရီဖြစ်သော်လည်း ဆာဗာလုံခြုံရေးအတွက် ၁ နာရီနှင့် ၅၅ မိနစ်အထိသာ cache သက်တမ်းသတ်မှတ်သည်
    tokenExpiryTime = Date.now() + 115 * 60 * 1000;

    return cachedToken!;
  } catch (error) {
    console.error('GalaxyLink Auth Token retrieval failed:', error);
    throw error;
  }
};

/**
 * ၂။ Game Account Validation (မလွှဲမီ User ID မှန်/မမှန် စစ်ဆေးခြင်း)
 * GalaxyLink "Game account validation before top-up" feature အတွက်ဖြစ်သည်
 */
export const validateGameAccount = async (gameSlug: string, gameUserId: string, zoneId?: string) => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${GALAXYLINK_API_URL}/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        game: gameSlug,
        game_user_id: gameUserId,
        zone_id: zoneId || ''
      })
    });

    const data: any = await response.json();
    return data; // returns: { valid: boolean, nickname: string }
  } catch (error) {
    console.error('GalaxyLink validation check failed:', error);
    return { valid: false, nickname: null, error: 'Validation check unavailable' };
  }
};

/**
 * ၃။ Top-Up Order ပေးပို့ခြင်း (POST /topup)
 * Reseller order process and placement
 */
export const placeTopupOrder = async (orderData: {
  orderNumber: string;
  gameUserId: string;
  zoneId?: string;
  productCode: string;
}) => {
  try {
    const token = await getAuthToken();
    
    const body = {
      partner_order_id: orderData.orderNumber,
      game_user_id: orderData.gameUserId,
      zone_id: orderData.zoneId || '',
      product_code: orderData.productCode
    };

    const response = await fetch(`${GALAXYLINK_API_URL}/topup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const data: any = await response.json();
    return data;
    // Returns: { status: 'SUCCESS' | 'PENDING' | 'FAILED', transaction_id: string }
  } catch (error) {
    console.error('GalaxyLink top-up order failed:', error);
    throw new Error('Failed to submit top-up request to GalaxyLink API');
  }
};

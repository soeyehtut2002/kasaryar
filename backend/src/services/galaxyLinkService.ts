import axios from 'axios';
import crypto from 'crypto';

const BASE_URL = 'https://api.galaxylink.gg';

// Environment variables
const CLIENT_ID = process.env.GALAXYLINK_CLIENT_ID || '';
const API_KEY = process.env.GALAXYLINK_API_KEY || '';

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

export const generateSignature = (timestamp: number) => {
  // Common format: SHA256(api_key + timestamp + client_id)
  const data = `${API_KEY}${timestamp}${CLIENT_ID}`;
  return crypto.createHash('sha256').update(data).digest('hex');
};

export const getAccessToken = async (): Promise<string> => {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const sign = generateSignature(timestamp);

  try {
    const response = await axios.post(`${BASE_URL}/auth/token`, {
      client_id: parseInt(CLIENT_ID),
      timestamp,
      sign
    });

    if (response.data && response.data.token) {
      cachedToken = response.data.token as string;
      // Token is valid for 2 hours, we'll cache it for 1 hour and 50 minutes to be safe
      tokenExpiry = Date.now() + (110 * 60 * 1000); 
      return cachedToken;
    }
    throw new Error('Failed to retrieve token from response');
  } catch (error: any) {
    console.error('GalaxyLink Auth Error:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with GalaxyLink API');
  }
};

export const createTopupOrder = async (
  productCode: string, 
  playerId: string, 
  zoneId: string | null, 
  localOrderId: string
) => {
  const token = await getAccessToken();

  try {
    const payload: any = {
      product_code: productCode,
      account_id: playerId,
      reference_id: localOrderId
    };

    if (zoneId) {
      payload.zone_id = zoneId;
    }

    const response = await axios.post(`${BASE_URL}/orders`, payload, {
      headers: {
        'X-Access-Token': token,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('GalaxyLink Order Error:', error.response?.data || error.message);
    throw error;
  }
};

export const checkOrderStatus = async (referenceId: string) => {
  const token = await getAccessToken();

  try {
    // Assuming endpoint is /orders/reference/{id} based on standard REST design
    // Some APIs use /orders/{id} where id is the provider's order ID.
    const response = await axios.get(`${BASE_URL}/orders/reference/${referenceId}`, {
      headers: {
        'X-Access-Token': token
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('GalaxyLink Check Status Error:', error.response?.data || error.message);
    throw error;
  }
};

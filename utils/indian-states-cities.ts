export interface IndianState {
  value: string; // ISO2 code (e.g., 'DL', 'KA')
  label: string; // Full name (e.g., 'Delhi', 'Karnataka')
}

export interface IndianCity {
  value: string; // City name in lowercase with hyphens
  label: string; // Full city name
}

// API Configuration
const API_BASE_URL = 'https://api.countrystatecity.in/v1';
const API_KEY = process.env.NEXT_PUBLIC_COUNTRY_STATE_CITY_API_KEY || 'YOUR_API_KEY_HERE';

// Indian states with ISO2 codes
const INDIAN_STATES: IndianState[] = [
  { value: 'AP', label: 'Andhra Pradesh' },
  { value: 'AR', label: 'Arunachal Pradesh' },
  { value: 'AS', label: 'Assam' },
  { value: 'BR', label: 'Bihar' },
  { value: 'CT', label: 'Chhattisgarh' },
  { value: 'GA', label: 'Goa' },
  { value: 'GJ', label: 'Gujarat' },
  { value: 'HR', label: 'Haryana' },
  { value: 'HP', label: 'Himachal Pradesh' },
  { value: 'JH', label: 'Jharkhand' },
  { value: 'KA', label: 'Karnataka' },
  { value: 'KL', label: 'Kerala' },
  { value: 'MP', label: 'Madhya Pradesh' },
  { value: 'MH', label: 'Maharashtra' },
  { value: 'MN', label: 'Manipur' },
  { value: 'ML', label: 'Meghalaya' },
  { value: 'MZ', label: 'Mizoram' },
  { value: 'NL', label: 'Nagaland' },
  { value: 'OR', label: 'Odisha' },
  { value: 'PB', label: 'Punjab' },
  { value: 'RJ', label: 'Rajasthan' },
  { value: 'SK', label: 'Sikkim' },
  { value: 'TN', label: 'Tamil Nadu' },
  { value: 'TG', label: 'Telangana' },
  { value: 'TR', label: 'Tripura' },
  { value: 'UP', label: 'Uttar Pradesh' },
  { value: 'UT', label: 'Uttarakhand' },
  { value: 'WB', label: 'West Bengal' },
  { value: 'AN', label: 'Andaman and Nicobar Islands' },
  { value: 'CH', label: 'Chandigarh' },
  { value: 'DH', label: 'Dadra and Nagar Haveli and Daman and Diu' },
  { value: 'DL', label: 'Delhi' },
  { value: 'JK', label: 'Jammu and Kashmir' },
  { value: 'LA', label: 'Ladakh' },
  { value: 'LD', label: 'Lakshadweep' },
  { value: 'PY', label: 'Puducherry' },
];

/**
 * Get all Indian states
 */
export const getIndianStates = (): IndianState[] => {
  return INDIAN_STATES;
};

/**
 * Fetch cities from Country State City API for a specific state
 * @param stateIso2Code - The ISO2 code of the state (e.g., 'DL', 'KA')
 * @returns Promise<IndianCity[]> - Array of cities
 *
 * API Endpoint: GET /v1/countries/IN/states/{stateIso2Code}/cities
 * Header: X-CSCAPI-KEY: {apiKey}
 */
export const fetchCitiesFromAPI = async (stateIso2Code: string): Promise<IndianCity[]> => {
  try {
    // Validate API key
    if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
      console.error('Country State City API key is not configured');
      return [];
    }

    // Validate state code
    if (!stateIso2Code || stateIso2Code.length !== 2) {
      console.error('Invalid state ISO2 code:', stateIso2Code);
      return [];
    }

    const url = `${API_BASE_URL}/countries/IN/states/${stateIso2Code}/cities`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-CSCAPI-KEY': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Check if data is an array
    if (!Array.isArray(data)) {
      console.warn('API returned non-array data:', data);
      return [];
    }

    // Transform API response to our format
    // API response format: [{ id: 57622, name: "New Delhi", ... }, ...]
    const cities = data
      .map((city: any) => {
        const cityName = city.name;
        if (!cityName) return null;

        return {
          value: cityName.toLowerCase().replace(/\s+/g, '-'),
          label: cityName,
        };
      })
      .filter((city): city is IndianCity => city !== null);

    // Sort cities alphabetically
    cities.sort((a, b) => a.label.localeCompare(b.label));

    return cities;
  } catch (error) {
    console.error('Error fetching cities from API:', error);
    return [];
  }
};

/**
 * Get state value (ISO2) from label
 * @param stateLabel - The display label of the state (e.g., "Karnataka")
 * @returns The ISO2 code of the state (e.g., "KA") or empty string if not found
 */
export const getStateValueFromLabel = (stateLabel: string): string => {
  const state = INDIAN_STATES.find((s) => s.label === stateLabel);
  return state?.value || '';
};

/**
 * Get state label from value (ISO2)
 * @param stateValue - The ISO2 code of the state (e.g., "KA")
 * @returns The display label of the state (e.g., "Karnataka") or empty string if not found
 */
export const getStateLabelFromValue = (stateValue: string): string => {
  const state = INDIAN_STATES.find((s) => s.value === stateValue);
  return state?.label || '';
};

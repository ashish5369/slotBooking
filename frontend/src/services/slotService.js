import axios from 'axios';

const API_URL = 'http://localhost:5000/api/slots';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Get all slots
export const getAllSlots = async () => {
  try {
    const response = await apiClient.get('/');
    return response.data;
  } catch (error) {
    console.error('Error fetching slots:', error);
    throw error;
  }
};

// Get a slot by ID
export const getSlotById = async (slotId) => {
  try {
    const response = await apiClient.get(`/${slotId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching slot ${slotId}:`, error);
    throw error;
  }
};

// Book a slot
export const bookSlot = async (bookingData) => {
  try {
    const response = await apiClient.post('/book', bookingData);
    return response.data;
  } catch (error) {
    console.error('Error booking slot:', error);
    throw error;
  }
};

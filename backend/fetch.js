export const fetchAPI = async (endpoint, options = {}) => {
    const API_URL = process.env.API_URL || 'http://localhost:3000';
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
  
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...defaultOptions,
        ...options,
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API request failed');
      }
  
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
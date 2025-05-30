export async function getDistance(origin, destination) {
  try {
    const response = await fetch('http://localhost:3001/api/estimates/distance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ origin, destination }),
    });

    const data = await response.json();
    return data.distance; // in KM
  } catch (error) {
    console.error('Failed to get distance:', error.message);
    throw error;
  }
}

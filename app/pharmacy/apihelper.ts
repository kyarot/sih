const API_URL = "http://localhost:5000/api/orders"; // change to your backend URL

// Fetch pending orders
export const fetchPendingOrders = async (pharmacyId: string) => {
  const res = await fetch(`${API_URL}/pharmacy/${pharmacyId}/pending`);
  return res.json();
};

// Fetch confirmed orders
export const fetchConfirmedOrders = async (pharmacyId: string) => {
  const res = await fetch(`${API_URL}/pharmacy/${pharmacyId}/confirmed`);
  return res.json();
};

// Update order status
export const updateOrderStatus = async (orderId: string, status: string) => {
  const res = await fetch(`${API_URL}/${orderId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return res.json();
};

// src/utils/orderService.ts
import axios from "axios";

const API_BASE = "https://7300c4c894de.ngrok-free.app/api";

/**
 * Extract a pharmacy id string from different order shapes.
 */
export function extractPharmacyId(order: any): string {
  if (!order) return "";
  if (order.pharmacyId && typeof order.pharmacyId === "object" && order.pharmacyId._id) {
    return String(order.pharmacyId._id);
  }
  if (typeof order.pharmacyId === "string") return order.pharmacyId;
  if (order.pharmacy && order.pharmacy._id) return String(order.pharmacy._id);
  return "";
}

/**
 * Fetch orders for a patient + optional prescriptionId.
 * Tries /orders/latest first, falls back to /orders.
 */
export async function fetchOrdersForPatientPrescription(patientId: string, prescriptionId?: string) {
  if (!patientId) return [];
  try {
    const res = await axios.get(`${API_BASE}/orders/latest`, {
      params: { patientId, prescriptionId },
    });
    return res.data?.orders || [];
  } catch (err: any) {
    // fallback to full orders endpoint if latest errors
    try {
      const res2 = await axios.get(`${API_BASE}/orders`, {
        params: { patientId, prescriptionId },
      });
      return res2.data?.orders || [];
    } catch (err2) {
      throw err2;
    }
  }
}

/**
 * Place an order. If backend returns 409 and an existing order, returns { conflict: true, order }.
 */
export async function placeOrderForPatientPrescription(
  patientId: string,
  pharmacyId: string,
  prescriptionId?: string
) {
  try {
    const res = await axios.post(`${API_BASE}/orders`, {
      patientId,
      pharmacyId,
      prescriptionId,
    });
    return { order: res.data?.order, conflict: false };
  } catch (err: any) {
    if (err.response && err.response.status === 409 && err.response.data?.order) {
      return { order: err.response.data.order, conflict: true, message: err.response.data.message };
    }
    throw err;
  }
}

/**
 * Build a dictionary keyed by pharmacyId for quick lookup.
 */
export function mapOrdersByPharmacy(orders: any[] = []) {
  const map: { [pharmacyId: string]: any } = {};
  (orders || []).forEach((o) => {
    const key = extractPharmacyId(o) || (o.pharmacyId && String(o.pharmacyId)) || "";
    if (key) map[key] = o;
  });
  return map;
}

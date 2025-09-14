export interface Appointment {
  _id: string;
  patientId: {
    _id: string;
    name: string;
    email?: string;
  };
  doctorId: {
    _id: string;
    name: string;
    specialization?: string;
  };
  requestedDate?: string;
  requestedTime?: string;
  decision: "pending" | "accepted" | "later" | "declined" | "completed";
  reason?: string;
  scheduledDateTime?: string;
  videoLink?: string;
  notes?: string;
  status: "booked" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

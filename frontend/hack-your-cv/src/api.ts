const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function joinWaitlist(email: string) {
  const response = await fetch(`${API_URL}/api/waitlist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to join waitlist");
  }

  return response.json();
}

export async function getWaitlistCount() {
  const response = await fetch(`${API_URL}/api/waitlist/count`);
  return response.json();
}

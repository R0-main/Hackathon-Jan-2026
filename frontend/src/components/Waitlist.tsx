import { useState } from "react";
import { joinWaitlist } from "../api";

export function Waitlist() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [position, setPosition] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const result = await joinWaitlist(email);
      setStatus("success");
      setMessage(result.message);
      setPosition(result.position);
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <div className="waitlist">
      <h2>Join the Waitlist</h2>
      <p>Be the first to know when we launch.</p>

      {status === "success" ? (
        <div className="success">
          <p>{message}</p>
          {position && <p>You are #{position} on the list!</p>}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            disabled={status === "loading"}
          />
          <button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Joining..." : "Join Waitlist"}
          </button>
          {status === "error" && <p className="error">{message}</p>}
        </form>
      )}
    </div>
  );
}

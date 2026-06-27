"use client";

import { useState } from "react";
import { IntroAnimation } from "./IntroAnimation";

type FormFields = {
  ownerName: string;
  email: string;
  businessName: string;
  contactPersonName: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  gstNumber: string;
  businessCategory: string;
  productsServices: string;
  consentGiven: boolean;
};

type PageStep =
  | { step: "form"; error?: string; loading?: boolean }
  | { step: "otp"; error?: string; loading?: boolean; resending?: boolean }
  | { step: "success"; clientId: string };

const initial: FormFields = {
  ownerName: "",
  email: "",
  businessName: "",
  contactPersonName: "",
  mobile: "",
  address: "",
  city: "",
  state: "",
  gstNumber: "",
  businessCategory: "",
  productsServices: "",
  consentGiven: false,
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

async function post<T>(
  path: string,
  body: unknown,
): Promise<{ ok: boolean; data: T }> {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [form, setForm] = useState<FormFields>(initial);
  const [otp, setOtp] = useState("");
  const [page, setPage] = useState<PageStep>({ step: "form" });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  async function handleFormSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setPage({ step: "form", loading: true });

    try {
      const { ok, data } = await post<{ error?: string }>(
        "/api/onboarding/submit-form",
        {
          name: form.ownerName,
          email: form.email,
          formData: {
            businessName: form.businessName,
            contactPersonName: form.contactPersonName,
            mobile: form.mobile,
            address: form.address,
            city: form.city,
            state: form.state,
            gstNumber: form.gstNumber || undefined,
            businessCategory: form.businessCategory,
            productsServices: form.productsServices,
          },
        },
      );

      if (!ok) {
        setPage({ step: "form", error: data.error ?? "Something went wrong." });
        return;
      }

      setPage({ step: "otp" });
    } catch {
      setPage({
        step: "form",
        error: "Unable to reach the server. Please try again.",
      });
    }
  }

  async function handleOtpSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setPage({ step: "otp", loading: true });

    try {
      const { ok, data } = await post<{ error?: string; clientId?: string }>(
        "/api/onboarding/verify-otp",
        { email: form.email, otp },
      );

      if (!ok) {
        setPage({
          step: "otp",
          error: (data as { error?: string }).error ?? "Invalid OTP.",
        });
        return;
      }

      setPage({
        step: "success",
        clientId: (data as { clientId: string }).clientId,
      });
    } catch {
      setPage({
        step: "otp",
        error: "Unable to reach the server. Please try again.",
      });
    }
  }

  async function handleResend() {
    setPage({ step: "otp", resending: true });
    setOtp("");

    try {
      await post("/api/onboarding/submit-form", {
        name: form.ownerName,
        email: form.email,
        formData: {
          businessName: form.businessName,
          contactPersonName: form.contactPersonName,
          mobile: form.mobile,
          address: form.address,
          city: form.city,
          state: form.state,
          gstNumber: form.gstNumber || undefined,
          businessCategory: form.businessCategory,
          productsServices: form.productsServices,
        },
      });
      setPage({ step: "otp" });
    } catch {
      setPage({ step: "otp", error: "Failed to resend. Please try again." });
    }
  }

  let content: React.ReactNode;

  /* ── Success ── */
  if (page.step === "success") {
    content = (
      <main className="container">
        <div className="card">
          <span className="badge badge--success">Email Verified</span>
          <h2 style={{ marginTop: "1.25rem" }}>
            Welcome aboard, {form.ownerName}!
          </h2>
          <p style={{ marginTop: "0.5rem" }}>
            Your onboarding request has been received and your email{" "}
            <strong>{form.email}</strong> has been verified.
          </p>

          <hr className="ledger-divider" />

          {(
            [
              { label: "Reference ID", value: page.clientId },
              { label: "Business Name", value: form.businessName },
              { label: "Owner Name", value: form.ownerName },
              { label: "Contact Person", value: form.contactPersonName },
              { label: "Mobile", value: form.mobile },
              { label: "Email", value: form.email },
              {
                label: "Address",
                value: `${form.address}, ${form.city}, ${form.state}`,
              },
              form.gstNumber
                ? { label: "GST Number", value: form.gstNumber }
                : null,
              { label: "Business Category", value: form.businessCategory },
              { label: "Products / Services", value: form.productsServices },
            ] as Array<{ label: string; value: string } | null>
          )
            .filter(Boolean)
            .map((row) => (
              <div className="ledger-row" key={row!.label}>
                <span className="label">{row!.label}</span>
                <span className="value">{row!.value}</span>
              </div>
            ))}
        </div>
      </main>
    );
  } else if (page.step === "otp") {
    /* ── OTP screen ── */
    content = (
      <main className="container">
        <div className="card" style={{ maxWidth: 440, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "var(--blue-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                margin: "0 auto 1rem",
              }}
            >
              ✉️
            </div>
            <h2>Check your inbox</h2>
            <p style={{ marginTop: "0.5rem" }}>
              We sent a 6-digit code to <strong>{form.email}</strong>.
              <br />
              Enter it below to verify your email.
            </p>
          </div>

          <form onSubmit={handleOtpSubmit} noValidate>
            <div className="field-group">
              <label htmlFor="otp">Verification Code</label>
              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                maxLength={6}
                required
                style={{
                  textAlign: "center",
                  fontSize: "1.5rem",
                  letterSpacing: "0.3em",
                }}
              />
              <span className="field-hint">
                This code expires in 10 minutes.
              </span>
            </div>

            {page.error && (
              <div
                className="alert-banner alert-banner--error"
                style={{ marginBottom: "1rem" }}
                role="alert"
              >
                {page.error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={otp.length < 6 || page.loading}
              style={{
                width: "100%",
                padding: "0.875rem",
                marginBottom: "0.75rem",
              }}
            >
              {page.loading ? "Verifying…" : "Verify Email →"}
            </button>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.875rem",
              }}
            >
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setPage({ step: "form" })}
                style={{ fontSize: "0.875rem", padding: "0.5rem 0.875rem" }}
              >
                ← Edit details
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleResend}
                disabled={page.resending}
                style={{ fontSize: "0.875rem", padding: "0.5rem 0.875rem" }}
              >
                {page.resending ? "Resending…" : "Resend code"}
              </button>
            </div>
          </form>
        </div>
      </main>
    );
  } else {
    /* ── Form ── */
    content = (
      <main className="container">
        <div style={{ marginBottom: "2rem" }}>
          <h1>Client Onboarding</h1>
          <p style={{ marginTop: "0.5rem" }}>
            Please fill in your business details to get started.
          </p>
        </div>

        <form className="card" onSubmit={handleFormSubmit} noValidate>
          {/* Section 1 — Business Info */}
          <div className="section-header">
            <div className="section-icon">🏢</div>
            <h3>Business Information</h3>
          </div>

          <div className="field-group">
            <label htmlFor="businessName">Business Name</label>
            <input
              id="businessName"
              name="businessName"
              type="text"
              value={form.businessName}
              onChange={handleChange}
              placeholder="e.g. Vipprow Digital Pvt. Ltd."
              required
            />
          </div>

          <div className="grid-2">
            <div className="field-group">
              <label htmlFor="businessCategory">
                Business Category / Industry
              </label>
              <select
                id="businessCategory"
                name="businessCategory"
                value={form.businessCategory}
                onChange={handleChange}
                required
              >
                <option value="">Select a category…</option>
                <option value="retail">Retail</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="it-software">IT / Software</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="hospitality">Hospitality</option>
                <option value="finance">Finance</option>
                <option value="real-estate">Real Estate</option>
                <option value="logistics">Logistics</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="field-group">
              <label htmlFor="gstNumber">
                GST Number <span className="optional-tag">(Optional)</span>
              </label>
              <input
                id="gstNumber"
                name="gstNumber"
                type="text"
                value={form.gstNumber}
                onChange={handleChange}
                placeholder="e.g. 29ABCDE1234F1Z5"
                maxLength={15}
              />
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="productsServices">Products / Services</label>
            <textarea
              id="productsServices"
              name="productsServices"
              value={form.productsServices}
              onChange={handleChange}
              placeholder="Describe the products or services your business offers…"
              rows={3}
              required
            />
          </div>

          <hr className="ledger-divider" />

          {/* Section 2 — Contact Info */}
          <div className="section-header">
            <div className="section-icon">👤</div>
            <h3>Contact Details</h3>
          </div>

          <div className="grid-2">
            <div className="field-group">
              <label htmlFor="ownerName">Owner Name</label>
              <input
                id="ownerName"
                name="ownerName"
                type="text"
                value={form.ownerName}
                onChange={handleChange}
                placeholder="e.g. Arpit Sharma"
                required
              />
            </div>
            <div className="field-group">
              <label htmlFor="contactPersonName">Contact Person Name</label>
              <input
                id="contactPersonName"
                name="contactPersonName"
                type="text"
                value={form.contactPersonName}
                onChange={handleChange}
                placeholder="e.g. Priya Mehta"
                required
              />
            </div>
            <div className="field-group">
              <label htmlFor="mobile">Mobile Number</label>
              <input
                id="mobile"
                name="mobile"
                type="tel"
                value={form.mobile}
                onChange={handleChange}
                placeholder="e.g. +91 98765 43210"
                required
              />
            </div>
            <div className="field-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="e.g. owner@business.com"
                required
              />
            </div>
          </div>

          <hr className="ledger-divider" />

          {/* Section 3 — Address */}
          <div className="section-header">
            <div className="section-icon">📍</div>
            <h3>Business Address</h3>
          </div>

          <div className="field-group">
            <label htmlFor="address">Street Address</label>
            <input
              id="address"
              name="address"
              type="text"
              value={form.address}
              onChange={handleChange}
              placeholder="e.g. 12, MG Road, Koramangala"
              required
            />
          </div>

          <div className="grid-2">
            <div className="field-group">
              <label htmlFor="city">City</label>
              <input
                id="city"
                name="city"
                type="text"
                value={form.city}
                onChange={handleChange}
                placeholder="e.g. Bengaluru"
                required
              />
            </div>
            <div className="field-group">
              <label htmlFor="state">State</label>
              <select
                id="state"
                name="state"
                value={form.state}
                onChange={handleChange}
                required
              >
                <option value="">Select a state…</option>
                <option>Andhra Pradesh</option>
                <option>Arunachal Pradesh</option>
                <option>Assam</option>
                <option>Bihar</option>
                <option>Chhattisgarh</option>
                <option>Goa</option>
                <option>Gujarat</option>
                <option>Haryana</option>
                <option>Himachal Pradesh</option>
                <option>Jharkhand</option>
                <option>Karnataka</option>
                <option>Kerala</option>
                <option>Madhya Pradesh</option>
                <option>Maharashtra</option>
                <option>Manipur</option>
                <option>Meghalaya</option>
                <option>Mizoram</option>
                <option>Nagaland</option>
                <option>Odisha</option>
                <option>Punjab</option>
                <option>Rajasthan</option>
                <option>Sikkim</option>
                <option>Tamil Nadu</option>
                <option>Telangana</option>
                <option>Tripura</option>
                <option>Uttar Pradesh</option>
                <option>Uttarakhand</option>
                <option>West Bengal</option>
                <option>Delhi</option>
                <option>Jammu & Kashmir</option>
                <option>Ladakh</option>
                <option>Puducherry</option>
              </select>
            </div>
          </div>

          <hr className="ledger-divider" />

          {/* Consent */}
          <div className="consent-row" style={{ marginBottom: "1.5rem" }}>
            <input
              id="consentGiven"
              name="consentGiven"
              type="checkbox"
              checked={form.consentGiven}
              onChange={handleChange}
              required
            />
            <label htmlFor="consentGiven">
              I confirm that the email address provided above is my identity and
              I authorise it to be used for receiving and signing the client
              agreement.
            </label>
          </div>

          {page.error && (
            <div
              className="alert-banner alert-banner--error"
              style={{ marginBottom: "1.25rem" }}
              role="alert"
            >
              {page.error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={page.loading || !form.consentGiven}
            style={{ width: "100%", padding: "0.875rem" }}
          >
            {page.loading ? "Sending code…" : "Continue — Verify Email →"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <>
      {showIntro && <IntroAnimation onDone={() => setShowIntro(false)} />}
      <div
        style={
          showIntro
            ? { visibility: "hidden" }
            : { animation: "form-appear 0.6s ease both" }
        }
      >
        {content}
      </div>
    </>
  );
}

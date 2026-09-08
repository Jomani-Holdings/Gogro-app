"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  expressJoinSchema,
  type ExpressJoinInput,
} from "@/lib/validation/expressJoin";
import { submitExpressJoin } from "@/app/apply/actions";

export type ServiceOption = { id: string; name: string };

const inputClass =
  "w-full rounded-lg border border-grey/60 bg-white px-4 py-3 text-textdark placeholder:text-textdark/40 focus:outline-none focus:ring-2 focus:ring-orange/60";
const labelClass = "block text-sm font-semibold text-textdark mb-1.5";
const errorTextClass = "text-sm text-error mt-1.5";

export function ExpressJoinForm({ services }: { services: ServiceOption[] }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const form = useForm<ExpressJoinInput>({
    resolver: zodResolver(expressJoinSchema),
  });

  async function onSubmit(data: ExpressJoinInput) {
    setSubmitting(true);
    setError(null);
    const res = await submitExpressJoin(data);
    setSubmitting(false);
    if (res.ok) setDone(true);
    else setError(res.message ?? "Something went wrong. Please try again.");
  }

  if (done) {
    return (
      <section className="container mx-auto px-6 md:px-12 py-16 md:py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-success/10 rounded-full h-16 w-16 mx-auto flex items-center justify-center text-success mb-6">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-8 w-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-textdark">
            Thanks for getting in touch!
          </h2>
          <p className="text-lg text-textdark/70 mt-4">
            We&apos;ve received your details. Our team will reach out shortly
            with the next steps.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-8 mt-8 transition-colors hover:bg-orange/90"
          >
            Back to home
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-6 md:px-12 py-16 md:py-20 max-w-2xl">
      {error ? (
        <p className="mb-6 rounded-lg bg-error/10 border border-error/30 px-4 py-3 text-sm text-error">
          {error}
        </p>
      ) : null}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="bg-white border border-grey/40 rounded-2xl p-6 md:p-8 space-y-5">
          <h2 className="text-2xl font-bold text-navy">Tell us about you</h2>
          <p className="text-textdark/70 -mt-3">
            Leave your details and a service you&apos;re interested in. Our team
            will be in touch to get you started.
          </p>

          <div>
            <label htmlFor="fullName" className={labelClass}>
              Full Name and Surname
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="e.g. Thabo Nkosi"
              className={inputClass}
              {...form.register("fullName")}
            />
            {form.formState.errors.fullName && (
              <p className={errorTextClass}>
                {form.formState.errors.fullName.message}
              </p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className={inputClass}
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className={errorTextClass}>
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="phone" className={labelClass}>
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="e.g. 078 082 7940"
                className={inputClass}
                {...form.register("phone")}
              />
              {form.formState.errors.phone && (
                <p className={errorTextClass}>
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="serviceId" className={labelClass}>
              Service Interested In
            </label>
            <select
              id="serviceId"
              className={inputClass}
              defaultValue=""
              {...form.register("serviceId")}
            >
              <option value="" disabled>
                Select a service
              </option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
            {form.formState.errors.serviceId && (
              <p className={errorTextClass}>
                {form.formState.errors.serviceId.message}
              </p>
            )}
          </div>

          <label className="flex items-start gap-3 text-sm text-textdark/80">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-orange"
              {...form.register("consent")}
            />
            <span>
              I consent to Go Gro Mobility collecting and processing my personal
              information in line with POPIA to assess my enquiry.
            </span>
          </label>
          {form.formState.errors.consent && (
            <p className={errorTextClass}>
              {form.formState.errors.consent.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-6 transition-colors hover:bg-orange/90 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting…" : "Submit"}
        </button>
      </form>
    </section>
  );
}

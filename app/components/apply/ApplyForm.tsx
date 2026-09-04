"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  stepOneSchema,
  stepTwoSchema,
  stepThreeSchema,
  ehailingPlatforms,
  driverTypes,
  weeklyCreditBands,
  heardAboutUsOptions,
  type StepOneInput,
  type StepTwoInput,
  type StepThreeInput,
} from "@/lib/validation/apply";
import {
  submitStepOne,
  submitStepTwo,
  submitStepThree,
} from "@/app/apply/actions";

export type GarageOption = { id: string; name: string };

const inputClass =
  "w-full rounded-lg border border-grey/60 bg-white px-4 py-3 text-textdark placeholder:text-textdark/40 focus:outline-none focus:ring-2 focus:ring-orange/60";
const labelClass = "block text-sm font-semibold text-textdark mb-1.5";
const errorTextClass = "text-sm text-error mt-1.5";

export function ApplyForm({ garages }: { garages: GarageOption[] }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [showDepositConfirm, setShowDepositConfirm] = useState(false);

  const formOne = useForm<StepOneInput>({
    resolver: zodResolver(stepOneSchema),
  });
  const formTwo = useForm<StepTwoInput>({
    resolver: zodResolver(stepTwoSchema),
  });
  const formThree = useForm<StepThreeInput>({
    resolver: zodResolver(stepThreeSchema),
  });

  const platform = useWatch({
    control: formTwo.control,
    name: "ehailingPlatform",
  });

  async function onStepOne(data: StepOneInput) {
    setSubmitting(true);
    setError(null);
    const res = await submitStepOne(data);
    setSubmitting(false);
    if (res.ok) setStep(2);
    else setError(res.message ?? "Something went wrong. Please try again.");
  }

  async function onStepTwo(data: StepTwoInput) {
    setSubmitting(true);
    setError(null);
    const res = await submitStepTwo(data);
    setSubmitting(false);
    if (res.ok) setStep(3);
    else setError(res.message ?? "Something went wrong. Please try again.");
  }

  function requestStepThree(data: StepThreeInput) {
    if (!data.referenceName?.trim()) {
      setShowDepositConfirm(true);
      return;
    }
    void onStepThree(data);
  }

  async function onStepThree(data: StepThreeInput) {
    setSubmitting(true);
    setError(null);
    const res = await submitStepThree(data);
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
            Application submitted!
          </h2>
          <p className="text-lg text-textdark/70 mt-4">
            Thanks for joining Go Gro. Our team will review your application and
            be in touch soon.
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
      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-10">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex-1 flex items-center gap-2">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                n <= step ? "bg-orange text-white" : "bg-grey/50 text-textdark/60"
              }`}
            >
              {n}
            </span>
            {n < 3 && (
              <span
                className={`h-0.5 flex-1 ${n < step ? "bg-orange" : "bg-grey/50"}`}
              />
            )}
          </div>
        ))}
      </div>

      {error ? (
        <p className="mb-6 rounded-lg bg-error/10 border border-error/30 px-4 py-3 text-sm text-error">
          {error}
        </p>
      ) : null}

      {/* Step 1 */}
      {step === 1 && (
        <form onSubmit={formOne.handleSubmit(onStepOne)} className="space-y-5">
          <h2 className="text-2xl font-bold text-navy">Personal Information</h2>

          <div>
            <label htmlFor="fullName" className={labelClass}>
              Full Name and Surname
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="e.g. Thabo Nkosi"
              className={inputClass}
              {...formOne.register("fullName")}
            />
            {formOne.formState.errors.fullName && (
              <p className={errorTextClass}>
                {formOne.formState.errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className={inputClass}
              {...formOne.register("email")}
            />
            {formOne.formState.errors.email && (
              <p className={errorTextClass}>
                {formOne.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="password" className={labelClass}>
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                className={inputClass}
                {...formOne.register("password")}
              />
              {formOne.formState.errors.password && (
                <p className={errorTextClass}>
                  {formOne.formState.errors.password.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className={labelClass}>
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Repeat password"
                className={inputClass}
                {...formOne.register("confirmPassword")}
              />
              {formOne.formState.errors.confirmPassword && (
                <p className={errorTextClass}>
                  {formOne.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="contactNumber" className={labelClass}>
              Contact Number
            </label>
            <input
              id="contactNumber"
              type="tel"
              placeholder="e.g. 078 082 7940"
              className={inputClass}
              {...formOne.register("contactNumber")}
            />
            {formOne.formState.errors.contactNumber && (
              <p className={errorTextClass}>
                {formOne.formState.errors.contactNumber.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="idOrPassport" className={labelClass}>
              ID / Passport Number
            </label>
            <input
              id="idOrPassport"
              type="text"
              placeholder="Your SA ID or passport number"
              className={inputClass}
              {...formOne.register("idOrPassport")}
            />
            {formOne.formState.errors.idOrPassport && (
              <p className={errorTextClass}>
                {formOne.formState.errors.idOrPassport.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="physicalAddress" className={labelClass}>
              Physical Address
            </label>
            <input
              id="physicalAddress"
              type="text"
              placeholder="Your home / physical address"
              className={inputClass}
              {...formOne.register("physicalAddress")}
            />
            {formOne.formState.errors.physicalAddress && (
              <p className={errorTextClass}>
                {formOne.formState.errors.physicalAddress.message}
              </p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="carMakeModelYear" className={labelClass}>
                Car Make / Model / Year
              </label>
              <input
                id="carMakeModelYear"
                type="text"
                placeholder="e.g. Toyota Corolla 2021"
                className={inputClass}
                {...formOne.register("carMakeModelYear")}
              />
              {formOne.formState.errors.carMakeModelYear && (
                <p className={errorTextClass}>
                  {formOne.formState.errors.carMakeModelYear.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="carRegistration" className={labelClass}>
                Car Registration Number
              </label>
              <input
                id="carRegistration"
                type="text"
                placeholder="e.g. CA 123-456"
                className={inputClass}
                {...formOne.register("carRegistration")}
              />
              {formOne.formState.errors.carRegistration && (
                <p className={errorTextClass}>
                  {formOne.formState.errors.carRegistration.message}
                </p>
              )}
            </div>
          </div>

          <label className="flex items-start gap-3 text-sm text-textdark/80">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-orange"
              {...formOne.register("consent")}
            />
            <span>
              I consent to Go Gro Mobility collecting and processing my personal
              information in line with POPIA to assess my application.
            </span>
          </label>
          {formOne.formState.errors.consent && (
            <p className={errorTextClass}>
              {formOne.formState.errors.consent.message}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-6 transition-colors hover:bg-orange/90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Creating your account…" : "Continue"}
          </button>
        </form>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <form onSubmit={formTwo.handleSubmit(onStepTwo)} className="space-y-6">
          <h2 className="text-2xl font-bold text-navy">Fuel Usage</h2>

          <div>
            <span className={labelClass}>eHailing Platform</span>
            <div className="grid gap-2 mt-2">
              {ehailingPlatforms.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-3 rounded-lg border border-grey/40 bg-white px-4 py-3 cursor-pointer hover:border-orange"
                >
                  <input
                    type="radio"
                    value={option}
                    className="accent-orange"
                    {...formTwo.register("ehailingPlatform")}
                  />
                  <span className="text-textdark">{option}</span>
                </label>
              ))}
            </div>
            {formTwo.formState.errors.ehailingPlatform && (
              <p className={errorTextClass}>
                {formTwo.formState.errors.ehailingPlatform.message}
              </p>
            )}
          </div>

          {platform === "Other" && (
            <div>
              <label htmlFor="ehailingPlatformOther" className={labelClass}>
                Which platform do you drive with?
              </label>
              <input
                id="ehailingPlatformOther"
                type="text"
                placeholder="e.g. Yango"
                className={inputClass}
                {...formTwo.register("ehailingPlatformOther")}
              />
              {formTwo.formState.errors.ehailingPlatformOther && (
                <p className={errorTextClass}>
                  {formTwo.formState.errors.ehailingPlatformOther.message}
                </p>
              )}
            </div>
          )}

          <div>
            <span className={labelClass}>Driver Type</span>
            <div className="grid gap-2 mt-2">
              {driverTypes.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-3 rounded-lg border border-grey/40 bg-white px-4 py-3 cursor-pointer hover:border-orange"
                >
                  <input
                    type="radio"
                    value={option}
                    className="accent-orange"
                    {...formTwo.register("driverType")}
                  />
                  <span className="text-textdark">{option}</span>
                </label>
              ))}
            </div>
            {formTwo.formState.errors.driverType && (
              <p className={errorTextClass}>
                {formTwo.formState.errors.driverType.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="garageId" className={labelClass}>
              Garage Required
            </label>
            <select
              id="garageId"
              className={inputClass}
              defaultValue=""
              {...formTwo.register("garageId")}
            >
              <option value="" disabled>
                Select your preferred garage
              </option>
              {garages.map((garage) => (
                <option key={garage.id} value={garage.id}>
                  {garage.name}
                </option>
              ))}
            </select>
            {formTwo.formState.errors.garageId && (
              <p className={errorTextClass}>
                {formTwo.formState.errors.garageId.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="weeklyCreditBand" className={labelClass}>
              Weekly Fuel Credit
            </label>
            <select
              id="weeklyCreditBand"
              className={inputClass}
              defaultValue=""
              {...formTwo.register("weeklyCreditBand")}
            >
              <option value="" disabled>
                Select your weekly credit amount
              </option>
              {weeklyCreditBands.map((band) => (
                <option key={band} value={band}>
                  {band}
                </option>
              ))}
            </select>
            {formTwo.formState.errors.weeklyCreditBand && (
              <p className={errorTextClass}>
                {formTwo.formState.errors.weeklyCreditBand.message}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center justify-center rounded-lg border border-navy text-navy font-semibold py-3 px-6 transition-colors hover:bg-navy/5"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-6 transition-colors hover:bg-orange/90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving…" : "Continue"}
            </button>
          </div>
        </form>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <form
          onSubmit={formThree.handleSubmit(requestStepThree)}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold text-navy">References &amp; Marketing</h2>

          <div>
            <label htmlFor="heardAboutUs" className={labelClass}>
              How did you hear about us?
            </label>
            <select
              id="heardAboutUs"
              className={inputClass}
              defaultValue=""
              {...formThree.register("heardAboutUs")}
            >
              <option value="" disabled>
                Select an option
              </option>
              {heardAboutUsOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {formThree.formState.errors.heardAboutUs && (
              <p className={errorTextClass}>
                {formThree.formState.errors.heardAboutUs.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="referenceName" className={labelClass}>
              Go Gro Fuel Reference
            </label>
            <input
              id="referenceName"
              type="text"
              placeholder="Full name of the driver who referred you"
              className={inputClass}
              {...formThree.register("referenceName")}
            />
            <p className="text-sm text-textdark/60 mt-2">
              Note: If you don&apos;t have a reference, we will require a 50%
              deposit on your fuel credit to complete your onboarding.
            </p>
            <p className="text-sm text-textdark/60 mt-2">
              Referring drivers can unlock free fuel rewards.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center justify-center rounded-lg border border-navy text-navy font-semibold py-3 px-6 transition-colors hover:bg-navy/5"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-6 transition-colors hover:bg-orange/90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting…" : "Submit Application"}
            </button>
          </div>
        </form>
      )}

      {/* Deposit confirmation modal */}
      {showDepositConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDepositConfirm(false)}
          />
          <div className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold text-textdark">
              No reference provided
            </h3>
            <p className="text-textdark/70 mt-3">
              You haven&apos;t added a referral. To complete your onboarding, a
              50% deposit on your fuel credit will be required.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowDepositConfirm(false)}
                className="flex-1 inline-flex items-center justify-center rounded-lg border border-navy text-navy font-semibold py-3 px-4 transition-colors hover:bg-navy/5"
              >
                Go back
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => {
                  setShowDepositConfirm(false);
                  void onStepThree(
                    formThree.getValues() as StepThreeInput
                  );
                }}
                className="flex-1 inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-4 transition-colors hover:bg-orange/90 disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

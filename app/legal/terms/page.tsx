import { PageHero } from "@/app/components/PageHero";

export default function TermsPage() {
  return (
    <>
      <PageHero title="Terms of Use" />

      <section className="container mx-auto px-6 md:px-12 py-16 md:py-20 max-w-4xl">
        <div className="bg-white border border-grey/40 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-textdark">
              GO GRO MOBILITY
            </h2>
            <p className="mt-2 font-semibold text-textdark">
              SERVICE TERMS &amp; CONDITIONS
            </p>
            <p className="text-textdark/70">
              Fuel Credit | Vehicle Repair &amp; Maintenance Benefit | Vehicle
              Management | Vehicle Rental
            </p>
            <p className="mt-4 text-textdark/70">
              A Jomani Holdings Venture
            </p>
            <p className="mt-4 text-sm text-textdark/60">
              Effective Date: September 2026
              <br />
              Last Updated: September 2026
            </p>
          </div>

          <div className="flex flex-col gap-8 text-textdark/80 leading-relaxed">
            <section>
              <p>
                These Service Terms and Conditions (&quot;Terms&quot;) govern
                the use of services offered by Go Gro Mobility
                (&quot;Go Gro&quot;, &quot;we&quot;, &quot;us&quot; or
                &quot;our&quot;).
              </p>
              <p className="mt-3">
                By applying for, accessing or using a Go Gro service, you
                acknowledge that you have read, understood and agreed to the
                terms applicable to that service.
              </p>
              <p className="mt-3">
                Eligibility for one Go Gro service does not automatically
                guarantee eligibility for another.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold text-navy mb-4">
                1. FUEL CREDIT TERMS &amp; CONDITIONS
              </h3>

              <h4 className="font-semibold text-textdark">1.1 About the Service</h4>
              <p className="mt-2">
                Go Gro Fuel Credit provides approved mobility entrepreneurs,
                including e-hailing and delivery drivers, with access to fuel on
                agreed deferred-payment terms through participating Go Gro fuel
                partner stations.
              </p>
              <p className="mt-3">
                Fuel Credit is subject to approval, account limits, payment
                history and Go Gro&apos;s internal risk-management requirements.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">1.2 Eligibility</h4>
              <p className="mt-2">
                To qualify, applicants may be required to provide:
              </p>
              <ul className="mt-2 flex flex-col gap-2 pl-6 list-disc">
                <li>Valid identification;</li>
                <li>Valid driver&apos;s licence;</li>
                <li>Vehicle registration details;</li>
                <li>Active contact details;</li>
                <li>
                  E-hailing or delivery platform information where applicable;
                </li>
                <li>
                  Proof of vehicle ownership, rental or authority to operate the
                  vehicle;
                </li>
                <li>Banking or payment information where required; and</li>
                <li>
                  Any additional information reasonably required to verify the
                  application.
                </li>
              </ul>
              <p className="mt-3">
                Go Gro reserves the right to approve or decline an application
                subject to applicable law.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">
                1.3 Probation Period
              </h4>
              <p className="mt-2">
                New Fuel Credit members are subject to an initial one-month
                probation period.
              </p>
              <p className="mt-3">
                During this period, Go Gro may monitor payment behaviour, fuel
                usage and compliance with the programme rules.
              </p>
              <p className="mt-3">
                Successful completion of probation does not guarantee continued
                access to credit. Accounts remain subject to ongoing review.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">
                1.4 Fuel Credit Limit
              </h4>
              <p className="mt-2">
                Each approved member will receive an account or fuel limit
                determined by Go Gro.
              </p>
              <p className="mt-3">
                Limits may differ between drivers and may be increased, reduced
                or temporarily restricted based on account performance, payment
                history, risk or operational requirements.
              </p>
              <p className="mt-3">
                Fuel Credit may only be used for approved purposes and at
                participating Go Gro fuel partner stations.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">
                1.5 Service Fee
              </h4>
              <p className="mt-2">
                A 10% service fee is charged on Fuel Credit provided, unless
                otherwise communicated in writing.
              </p>
              <p className="mt-3">For example:</p>
              <div className="mt-2 rounded-xl border border-grey/40 bg-offwhite p-5 flex flex-col gap-1 text-sm">
                <p>Fuel Credit used: R1,000</p>
                <p>Service Fee: R100</p>
                <p>Total repayment: R1,100</p>
              </div>
              <p className="mt-3">
                Any additional transaction or administration charges applicable
                to a particular payment method will be disclosed to the member.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">1.6 Payment</h4>
              <p className="mt-2">
                Fuel Credit accounts operate on a weekly repayment cycle.
              </p>
              <p className="mt-3">Unless otherwise agreed in writing:</p>
              <p className="mt-2">
                Payment is due by Tuesday at 12:00 midday.
              </p>
              <p className="mt-3">
                The outstanding amount must be settled in accordance with the
                account statement or payment instructions issued by Go Gro.
              </p>
              <p className="mt-3">
                Members may be required to settle their outstanding account
                before further Fuel Credit is made available.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">
                1.7 Cash Deposits
              </h4>
              <p className="mt-2">
                Where Go Gro accepts cash deposits, an additional R20 cash
                deposit administration fee may apply.
              </p>
              <p className="mt-3">
                Members are encouraged to use approved electronic payment
                methods wherever possible.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">
                1.8 Late or Missed Payments
              </h4>
              <p className="mt-2">
                Where payment is not received by the required deadline, Go Gro
                may, subject to applicable law:
              </p>
              <ul className="mt-2 flex flex-col gap-2 pl-6 list-disc">
                <li>Temporarily suspend access to Fuel Credit;</li>
                <li>Reduce the member&apos;s Fuel Credit limit;</li>
                <li>Place the account under review;</li>
                <li>Suspend access to rewards or benefits;</li>
                <li>
                  Require outstanding amounts to be settled before further
                  transactions;
                </li>
                <li>
                  Make reasonable attempts to recover outstanding amounts; and
                </li>
                <li>
                  Refer overdue accounts for lawful debt-recovery processes
                  where necessary.
                </li>
              </ul>
              <p className="mt-3">
                Repeated late payments may result in removal from the Fuel
                Credit programme.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">
                1.9 Fuel Codes and Account Security
              </h4>
              <p className="mt-2">
                Fuel codes, cards, account details or other authorisation
                methods issued to a member are intended for authorised use only.
              </p>
              <p className="mt-3">
                Members must not sell, transfer, share or allow unauthorised
                persons to use their Fuel Credit facility.
              </p>
              <p className="mt-3">
                Suspected fraud or misuse may result in immediate suspension
                pending investigation.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">
                1.10 Fuel Partner Network
              </h4>
              <p className="mt-2">
                Fuel Credit may only be available at participating Go Gro fuel
                stations.
              </p>
              <p className="mt-3">
                Stations may be added, removed or temporarily unavailable.
              </p>
              <p className="mt-3">
                Go Gro does not guarantee that a particular station will remain
                part of the network indefinitely.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold text-navy mb-4">
                2. VEHICLE REPAIR &amp; MAINTENANCE BENEFIT
              </h3>

              <h4 className="font-semibold text-textdark">
                2.1 About the Benefit
              </h4>
              <p className="mt-2">
                The Go Gro Vehicle Repair &amp; Maintenance Benefit is designed
                to assist qualifying active Go Gro members with approved vehicle
                repair, maintenance, battery or tyre-related costs.
              </p>
              <p className="mt-3">
                The purpose of the programme is to help qualifying mobility
                entrepreneurs keep their vehicles operational while allowing
                approved costs to be repaid over an agreed period.
              </p>
              <p className="mt-3">
                This benefit is subject to approval and is not an automatic
                entitlement.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">2.2 Eligibility</h4>
              <p className="mt-2">
                Unless otherwise communicated, a member must have been an active
                Go Gro Fuel member for at least four months to qualify for
                consideration.
              </p>
              <p className="mt-3">Eligibility may take into account:</p>
              <ul className="mt-2 flex flex-col gap-2 pl-6 list-disc">
                <li>Payment history;</li>
                <li>Account standing;</li>
                <li>Fuel account management;</li>
                <li>Previous use of Go Gro services;</li>
                <li>Current outstanding balances;</li>
                <li>Vehicle information;</li>
                <li>Repair requirements; and</li>
                <li>Go Gro&apos;s assessment of repayment risk.</li>
              </ul>

              <h4 className="mt-6 font-semibold text-textdark">
                2.3 Benefit Limits
              </h4>
              <p className="mt-2">
                Benefit limits may depend on the member&apos;s vehicle and
                operating category.
              </p>
              <p className="mt-3">
                Indicative overall limits currently include:
              </p>
              <ul className="mt-2 flex flex-col gap-2 pl-6 list-disc">
                <li>UberGO or equivalent: up to R5,000</li>
                <li>UberBlack or equivalent: up to R9,000</li>
              </ul>
              <p className="mt-3">
                Individual benefit categories may also be subject to limits,
                including:
              </p>
              <ul className="mt-2 flex flex-col gap-2 pl-6 list-disc">
                <li>Battery Assistance: up to R3,000</li>
                <li>Tyre Assistance: up to R3,000</li>
                <li>Maintenance Service: up to R4,500</li>
                <li>Vehicle Repair: up to R8,000</li>
              </ul>
              <p className="mt-3">
                These limits represent maximum available assistance and do not
                guarantee approval for the full amount.
              </p>
              <p className="mt-3">
                Go Gro may revise programme limits from time to time.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">
                2.4 One Active Benefit at a Time
              </h4>
              <p className="mt-2">
                A member may generally only have one active Vehicle Repair or
                Maintenance Benefit at a time.
              </p>
              <p className="mt-3">
                A new benefit may only be considered once the previous benefit
                has been repaid in full, unless Go Gro approves otherwise in
                writing.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">2.5 Deposit</h4>
              <p className="mt-2">
                An approved member must pay a 10% deposit before Go Gro triggers
                or authorises the repair, maintenance or purchase transaction.
              </p>
              <p className="mt-3">
                No transaction is considered approved until the required deposit
                has been received and Go Gro has issued confirmation.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">2.6 Service Fee</h4>
              <p className="mt-2">
                Go Gro charges a 10% service fee on the total approved
                transaction cost, unless otherwise stated in the member&apos;s
                agreement.
              </p>
              <p className="mt-3">
                The member will receive a repayment schedule showing the amount
                financed, applicable fees, total repayment amount and
                instalments.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">
                2.7 Approved Service Providers
              </h4>
              <p className="mt-2">
                Repairs, tyres, batteries and maintenance must generally be
                obtained through a supplier or service provider approved by Go
                Gro.
              </p>
              <p className="mt-3">
                Go Gro may pay the approved supplier directly.
              </p>
              <p className="mt-3">
                Members may not independently incur expenses and expect
                reimbursement unless prior written approval has been obtained.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">
                2.8 Repairs and Quotations
              </h4>
              <p className="mt-2">Go Gro may require:</p>
              <ul className="mt-2 flex flex-col gap-2 pl-6 list-disc">
                <li>A vehicle inspection;</li>
                <li>Diagnostic report;</li>
                <li>Written quotation;</li>
                <li>Photographs;</li>
                <li>Proof of vehicle ownership or lawful use; and</li>
                <li>Additional supporting information.</li>
              </ul>
              <p className="mt-3">
                Go Gro may obtain or request alternative quotations before
                approving a transaction.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">2.9 Repayment</h4>
              <p className="mt-2">
                Approved repair or maintenance assistance must be repaid
                according to the repayment schedule agreed with the member
                before the transaction is completed.
              </p>
              <p className="mt-3">
                Payments will generally be made weekly.
              </p>
              <p className="mt-3">
                Failure to make payment may result in suspension of Fuel Credit,
                rewards and/or other Go Gro benefits, subject to applicable law
                and the relevant agreement.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">
                2.10 Repairs and Warranties
              </h4>
              <p className="mt-2">
                Where work is performed by an independent repairer or supplier,
                the workmanship or product warranty is primarily provided by
                that service provider or manufacturer.
              </p>
              <p className="mt-3">
                Go Gro facilitates approved assistance but does not manufacture
                parts or personally perform repairs unless specifically stated
                otherwise.
              </p>
              <p className="mt-3">
                Any repair-related complaint should be reported promptly so that
                Go Gro can assist in engaging the relevant service provider.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold text-navy mb-4">
                3. VEHICLE MANAGEMENT TERMS &amp; CONDITIONS
              </h3>

              <h4 className="font-semibold text-textdark">
                3.1 About the Service
              </h4>
              <p className="mt-2">
                Go Gro Vehicle Management is intended for vehicle owners who
                wish to generate income from vehicles used within the e-hailing
                or mobility sector without having to manage the day-to-day
                relationship with drivers themselves.
              </p>
              <p className="mt-3">Services may include:</p>
              <ul className="mt-2 flex flex-col gap-2 pl-6 list-disc">
                <li>Driver sourcing and placement;</li>
                <li>Driver onboarding;</li>
                <li>Rental collection administration;</li>
                <li>Driver communication;</li>
                <li>Vehicle monitoring;</li>
                <li>Maintenance coordination;</li>
                <li>Inspection coordination;</li>
                <li>Performance reporting;</li>
                <li>Managing driver-related operational issues; and</li>
                <li>General fleet administration.</li>
              </ul>
              <p className="mt-3">
                The exact services provided will be specified in the Vehicle
                Management Agreement entered into with the vehicle owner.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">
                3.2 Vehicle Owner Responsibilities
              </h4>
              <p className="mt-2">
                The vehicle owner remains responsible for ensuring that the
                vehicle is:
              </p>
              <ul className="mt-2 flex flex-col gap-2 pl-6 list-disc">
                <li>Legally owned or lawfully controlled;</li>
                <li>Properly licensed;</li>
                <li>Roadworthy;</li>
                <li>
                  Appropriately insured for its intended commercial/e-hailing
                  use;
                </li>
                <li>Properly maintained;</li>
                <li>
                  Equipped with any legally required documentation; and
                </li>
                <li>
                  Eligible for the relevant e-hailing or mobility platform.
                </li>
              </ul>
              <p className="mt-3">
                Unless otherwise agreed, vehicle ownership remains entirely with
                the vehicle owner.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">
                3.3 Management Fee
              </h4>
              <p className="mt-2">
                Go Gro may charge a weekly management fee calculated as a
                percentage of rental income or as otherwise agreed with the
                vehicle owner.
              </p>
              <p className="mt-3">
                Where a management fee has been agreed, the fee will ordinarily
                be calculated against the agreed weekly rental amount.
              </p>
              <p className="mt-3">Example:</p>
              <div className="mt-2 rounded-xl border border-grey/40 bg-offwhite p-5 flex flex-col gap-1 text-sm">
                <p>Weekly Rental: R2,500</p>
                <p>Management Fee at 8%: R200</p>
              </div>
              <p className="mt-3">
                The applicable management fee will be confirmed in the
                owner&apos;s Vehicle Management Agreement.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">
                3.4 Maintenance Reserve
              </h4>
              <p className="mt-2">
                Go Gro may recommend or require that a portion of weekly vehicle
                income be allocated towards a Vehicle Maintenance Reserve.
              </p>
              <p className="mt-3">
                The reserve amount may vary according to:
              </p>
              <ul className="mt-2 flex flex-col gap-2 pl-6 list-disc">
                <li>Vehicle make and model;</li>
                <li>Vehicle value;</li>
                <li>Mileage;</li>
                <li>Age;</li>
                <li>E-hailing category;</li>
                <li>Expected weekly kilometres;</li>
                <li>Service intervals;</li>
                <li>Tyre costs; and</li>
                <li>Expected maintenance requirements.</li>
              </ul>
              <p className="mt-3">
                Higher-value vehicles or vehicles operating in premium
                categories may require larger reserves.
              </p>
              <p className="mt-3">
                The maintenance reserve remains for the benefit of maintaining
                the relevant vehicle and should not be treated as ordinary
                distributable rental income.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">
                3.5 Driver Placement
              </h4>
              <p className="mt-2">
                Go Gro will take reasonable steps when screening or placing
                drivers.
              </p>
              <p className="mt-3">
                However, Go Gro cannot guarantee a driver&apos;s future conduct,
                income, platform performance or compliance.
              </p>
              <p className="mt-3">
                Where appropriate, drivers may be required to sign separate
                rental or vehicle-use agreements.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">
                3.6 Rental Collection
              </h4>
              <p className="mt-2">
                Where Go Gro is responsible for collecting rental payments, Go
                Gro will make reasonable efforts to collect amounts due.
              </p>
              <p className="mt-3">
                Go Gro does not guarantee payment by a driver unless such
                guarantee is specifically provided in a written agreement.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">
                3.7 Fines and Driver-Related Costs
              </h4>
              <p className="mt-2">
                Traffic fines, penalties, damages and other driver-related costs
                will be dealt with according to the applicable Vehicle
                Management and Driver Rental Agreements.
              </p>
              <p className="mt-3">
                Where legally permissible, costs attributable to a particular
                driver may be recovered from that driver.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">
                3.8 Insurance
              </h4>
              <p className="mt-2">
                Vehicle owners are responsible for maintaining appropriate
                insurance suitable for e-hailing, rental or commercial use.
              </p>
              <p className="mt-3">
                Go Gro will not be responsible for an insurer declining a claim
                because the vehicle owner failed to disclose the correct use of
                the vehicle or maintain appropriate cover.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">
                3.9 Vehicle Downtime
              </h4>
              <p className="mt-2">
                Go Gro cannot guarantee uninterrupted rental income.
              </p>
              <p className="mt-3">
                Vehicles may experience downtime because of:
              </p>
              <ul className="mt-2 flex flex-col gap-2 pl-6 list-disc">
                <li>Accidents;</li>
                <li>Repairs;</li>
                <li>Maintenance;</li>
                <li>Driver changes;</li>
                <li>E-hailing platform restrictions;</li>
                <li>Insurance processes; or</li>
                <li>
                  Other circumstances outside Go Gro&apos;s reasonable control.
                </li>
              </ul>

              <h4 className="mt-6 font-semibold text-textdark">
                3.10 Termination
              </h4>
              <p className="mt-2">
                Either party may terminate the management relationship according
                to the notice period contained in the signed Vehicle Management
                Agreement.
              </p>
              <p className="mt-3">
                Outstanding management fees, maintenance costs, driver-related
                liabilities or other amounts must be reconciled when the
                agreement ends.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold text-navy mb-4">
                4. VEHICLE RENTAL TERMS &amp; CONDITIONS
              </h3>

              <h4 className="font-semibold text-textdark">
                4.1 About the Vehicle Rental Service
              </h4>
              <p className="mt-2">
                Go Gro Mobility facilitates and manages vehicle rental
                arrangements for approved drivers, including vehicles intended
                for use on e-hailing and other mobility platforms.
              </p>
              <p className="mt-3">
                Vehicles available through Go Gro may be owned by Go Gro, Jomani
                Holdings, or independent vehicle owners participating in the Go
                Gro Vehicle Management programme.
              </p>
              <p className="mt-3">
                The specific vehicle owner, weekly rental amount, deposit and
                applicable rental conditions will be disclosed to the driver
                before the rental agreement is concluded.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">
                4.2 Driver Eligibility
              </h4>
              <p className="mt-2">
                Applicants wishing to rent a vehicle through Go Gro may be
                required to provide:
              </p>
              <ul className="mt-2 flex flex-col gap-2 pl-6 list-disc">
                <li>Valid identification or passport;</li>
                <li>Valid driver&apos;s licence;</li>
                <li>Proof of residential address;</li>
                <li>Active mobile number and contact details;</li>
                <li>E-hailing or relevant platform profile;</li>
                <li>Emergency contact information;</li>
                <li>
                  Driver screening or background information where required; and
                </li>
                <li>
                  Any additional documentation reasonably required by Go Gro or
                  the vehicle owner.
                </li>
              </ul>
              <p className="mt-3">
                Approval remains subject to Go Gro&apos;s driver-screening
                requirements, the vehicle owner&apos;s requirements and vehicle
                availability.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">
                4.3 Vehicle Rental Deposit
              </h4>
              <p className="mt-2">
                A rental deposit is required before a driver may take possession
                of a vehicle.
              </p>
              <p className="mt-3">
                The amount of the deposit will vary depending on factors
                including:
              </p>
              <ul className="mt-2 flex flex-col gap-2 pl-6 list-disc">
                <li>The type and category of vehicle;</li>
                <li>The value of the vehicle;</li>
                <li>The vehicle&apos;s e-hailing category;</li>
                <li>Insurance requirements; and</li>
                <li>Any requirements stipulated by the vehicle owner.</li>
              </ul>
              <p className="mt-3">
                The applicable deposit amount will be communicated to the driver
                before the rental agreement is signed.
              </p>
              <p className="mt-3">
                The deposit is payable to the owner of the vehicle. Where Go Gro
                facilitates collection of the deposit on behalf of the owner,
                the payment will be handled in accordance with the relevant
                rental arrangement.
              </p>
              <p className="mt-3">
                Payment of the deposit does not constitute payment of weekly
                rental and may not automatically be used by the driver as the
                final week&apos;s rental.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">
                4.4 Refund of Deposit
              </h4>
              <p className="mt-2">
                The treatment and refund of the deposit will be governed by the
                individual Vehicle Rental Agreement.
              </p>
              <p className="mt-3">
                Subject to the agreement and applicable law, the vehicle owner
                may be entitled to deduct legitimate amounts owing by the
                driver, including amounts relating to:
              </p>
              <ul className="mt-2 flex flex-col gap-2 pl-6 list-disc">
                <li>Outstanding rental;</li>
                <li>Damage beyond reasonable wear and tear;</li>
                <li>Missing keys, equipment or accessories;</li>
                <li>
                  Unpaid amounts for which the driver is contractually
                  responsible; and
                </li>
                <li>Other legitimate charges permitted under the rental agreement.</li>
              </ul>
              <p className="mt-3">
                Any balance due to the driver after legitimate deductions must
                be dealt with in accordance with the rental agreement.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">
                4.5 Weekly Rental
              </h4>
              <p className="mt-2">
                Each vehicle will have an agreed weekly rental amount.
              </p>
              <p className="mt-3">Rental rates may vary according to:</p>
              <ul className="mt-2 flex flex-col gap-2 pl-6 list-disc">
                <li>Vehicle make and model;</li>
                <li>Vehicle category;</li>
                <li>Vehicle value;</li>
                <li>E-hailing category;</li>
                <li>Insurance requirements; and</li>
                <li>Other operating costs.</li>
              </ul>
              <p className="mt-3">
                The weekly rental amount and payment schedule will be
                communicated to the driver before the vehicle is handed over.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">
                4.6 Rental Payments
              </h4>
              <p className="mt-2">
                Drivers are responsible for ensuring that weekly rental payments
                are made in full and by the agreed payment deadline.
              </p>
              <p className="mt-3">
                Failure to make rental payments may constitute a breach of the
                Vehicle Rental Agreement.
              </p>
              <p className="mt-3">
                Where a payment is late or missed, Go Gro and/or the vehicle
                owner may take steps permitted under the rental agreement and
                applicable law, including issuing appropriate notice, suspending
                continued use where legally permitted, terminating the agreement
                or pursuing lawful recovery of outstanding amounts.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">
                4.7 Authorised Use of the Vehicle
              </h4>
              <p className="mt-2">
                The vehicle may only be driven by a driver who has been approved
                and authorised under the rental agreement.
              </p>
              <p className="mt-3">The driver may not:</p>
              <ul className="mt-2 flex flex-col gap-2 pl-6 list-disc">
                <li>Sub-rent the vehicle;</li>
                <li>Allow an unauthorised person to drive the vehicle;</li>
                <li>Use the vehicle for unlawful activities;</li>
                <li>Operate the vehicle recklessly or negligently;</li>
                <li>Tamper with vehicle tracking or safety equipment;</li>
                <li>Make unauthorised modifications to the vehicle; or</li>
                <li>
                  Use the vehicle outside the agreed purpose or operating
                  conditions without permission.
                </li>
              </ul>

              <h4 className="mt-6 font-semibold text-textdark">
                4.8 Driver Responsibility and Vehicle Care
              </h4>
              <p className="mt-2">
                Drivers are expected to take reasonable care of the vehicle
                throughout the rental period.
              </p>
              <p className="mt-3">
                This includes regularly monitoring:
              </p>
              <ul className="mt-2 flex flex-col gap-2 pl-6 list-disc">
                <li>Tyres and tyre pressure;</li>
                <li>Engine oil;</li>
                <li>Coolant;</li>
                <li>Dashboard warning lights;</li>
                <li>Brakes;</li>
                <li>General vehicle condition; and</li>
                <li>Scheduled service requirements.</li>
              </ul>
              <p className="mt-3">
                Any mechanical problem, warning light, accident or material
                damage must be reported to Go Gro as soon as reasonably
                possible.
              </p>
              <p className="mt-3">
                A driver may be held responsible, where permitted by law and the
                rental agreement, for additional damage caused by negligence,
                misuse or continued operation of a vehicle after a serious
                mechanical problem or warning has been identified.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">
                4.9 Maintenance and Servicing
              </h4>
              <p className="mt-2">
                Responsibility for routine servicing, tyres, repairs and general
                maintenance will be specified in the individual Vehicle Rental
                Agreement.
              </p>
              <p className="mt-3">
                Drivers must make the vehicle available for scheduled servicing,
                inspections and repairs when reasonably requested by Go Gro or
                the vehicle owner.
              </p>
              <p className="mt-3">
                Drivers may not arrange significant repairs or modifications
                without prior approval unless emergency circumstances reasonably
                require immediate action.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">
                4.10 Insurance
              </h4>
              <p className="mt-2">
                Vehicles must be insured appropriately for their intended use.
              </p>
              <p className="mt-3">
                The specific insurance arrangements and any driver liability for
                an insurance excess following an accident, theft or loss will be
                disclosed in the individual Vehicle Rental Agreement.
              </p>
              <p className="mt-3">
                Drivers are required to comply with all reasonable insurance
                requirements applicable to the vehicle.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">
                4.11 Accidents, Theft and Damage
              </h4>
              <p className="mt-2">
                Any accident, theft, attempted theft or significant damage
                involving the vehicle must be reported to Go Gro immediately or
                as soon as reasonably possible.
              </p>
              <p className="mt-3">
                The driver must cooperate with all reasonable requirements
                relating to:
              </p>
              <ul className="mt-2 flex flex-col gap-2 pl-6 list-disc">
                <li>Police reports;</li>
                <li>Insurance claims;</li>
                <li>Accident reports;</li>
                <li>Photographs and supporting evidence;</li>
                <li>Vehicle inspections; and</li>
                <li>Statements regarding the incident.</li>
              </ul>
              <p className="mt-3">
                Responsibility for damage, insurance excesses or other losses
                will be determined according to the circumstances, insurance
                policy, rental agreement and applicable law.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">
                4.12 Traffic Fines and Penalties
              </h4>
              <p className="mt-2">
                Drivers are responsible for traffic fines, parking fines, toll
                charges and other penalties legally attributable to their use of
                the vehicle during the rental period.
              </p>
              <p className="mt-3">
                Where Go Gro or the vehicle owner receives such a charge
                relating to the driver&apos;s rental period, the amount may be
                recovered from the driver where legally permissible.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">
                4.13 Vehicle Tracking
              </h4>
              <p className="mt-2">
                Rental vehicles may be fitted with tracking or telematics
                devices.
              </p>
              <p className="mt-3">
                These systems may be used for legitimate purposes including:
              </p>
              <ul className="mt-2 flex flex-col gap-2 pl-6 list-disc">
                <li>Vehicle security;</li>
                <li>Theft prevention and recovery;</li>
                <li>Fleet management;</li>
                <li>Mileage monitoring;</li>
                <li>Maintenance monitoring; and</li>
                <li>Protection of drivers, Go Gro and vehicle owners.</li>
              </ul>
              <p className="mt-3">
                Information obtained through vehicle tracking will be handled in
                accordance with Go Gro&apos;s Privacy Policy and applicable
                South African law.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">
                4.14 Vehicle Inspections
              </h4>
              <p className="mt-2">
                Go Gro and/or the vehicle owner may conduct reasonable periodic
                vehicle inspections.
              </p>
              <p className="mt-3">
                Drivers must cooperate with reasonable inspection requests and
                must disclose known damage, faults or mechanical problems.
              </p>
              <p className="mt-3">
                A vehicle condition inspection may also be completed when the
                vehicle is handed to the driver and again when the vehicle is
                returned.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">
                4.15 Return of the Vehicle
              </h4>
              <p className="mt-2">
                When the rental agreement ends, the driver must return the
                vehicle:
              </p>
              <ul className="mt-2 flex flex-col gap-2 pl-6 list-disc">
                <li>At the agreed location;</li>
                <li>At the agreed date and time;</li>
                <li>With all keys;</li>
                <li>With all equipment and accessories supplied with the vehicle;</li>
                <li>
                  In reasonable condition, allowing for fair wear and tear; and
                </li>
                <li>
                  With any documents or equipment belonging to the vehicle
                  owner.
                </li>
              </ul>
              <p className="mt-3">
                A final inspection may be conducted to compare the condition of
                the vehicle against its condition at the start of the rental.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">
                4.16 Termination of Rental
              </h4>
              <p className="mt-2">
                Either party may terminate the rental arrangement in accordance
                with the notice requirements contained in the individual Vehicle
                Rental Agreement.
              </p>
              <p className="mt-3">
                Serious breaches — including unauthorised use, fraud, intentional
                damage, repeated non-payment or other material breaches — may
                result in termination subject to the agreement and applicable
                law.
              </p>
              <p className="mt-3">
                Any outstanding rental, damages or other legitimate amounts
                remain payable after termination.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">
                4.17 Role of Go Gro Mobility
              </h4>
              <p className="mt-2">
                Where a vehicle belongs to an independent owner, Go Gro may act
                as the vehicle management and rental facilitator between the
                vehicle owner and the approved driver.
              </p>
              <p className="mt-3">Go Gro may assist with:</p>
              <ul className="mt-2 flex flex-col gap-2 pl-6 list-disc">
                <li>Driver sourcing;</li>
                <li>Driver screening;</li>
                <li>Rental administration;</li>
                <li>Payment monitoring;</li>
                <li>Vehicle inspections;</li>
                <li>Maintenance coordination;</li>
                <li>Driver communication; and</li>
                <li>General management of the rental relationship.</li>
              </ul>
              <p className="mt-3">
                The ownership of the vehicle remains with the registered or
                lawful vehicle owner unless otherwise expressly stated.
              </p>

              <h4 className="mt-6 font-semibold text-textdark">
                4.18 Individual Vehicle Rental Agreement
              </h4>
              <p className="mt-2">
                These website Terms provide the general conditions applicable to
                vehicle rentals facilitated or managed through Go Gro.
              </p>
              <p className="mt-3">
                Before receiving a vehicle, the driver may be required to sign a
                separate Vehicle Rental Agreement setting out the specific:
              </p>
              <ul className="mt-2 flex flex-col gap-2 pl-6 list-disc">
                <li>Vehicle details;</li>
                <li>Vehicle owner;</li>
                <li>Weekly rental;</li>
                <li>Deposit;</li>
                <li>Payment dates;</li>
                <li>Insurance and excess;</li>
                <li>Maintenance responsibilities;</li>
                <li>Driver responsibilities;</li>
                <li>Termination conditions; and</li>
                <li>Other vehicle-specific terms.</li>
              </ul>
              <p className="mt-3">
                Where applicable, the signed Vehicle Rental Agreement will govern
                the specific rental relationship together with these general
                Terms and applicable South African law.
              </p>
            </section>
          </div>
        </div>
      </section>
    </>
  );
}
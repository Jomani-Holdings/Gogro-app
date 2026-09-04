import type { JSONContent } from "@tiptap/core";

function heading(level: number, text: string): JSONContent {
  return { type: "heading", attrs: { level }, content: [{ type: "text", text }] };
}

function paragraph(text: string): JSONContent {
  return { type: "paragraph", content: [{ type: "text", text }] };
}

function bulletList(items: string[]): JSONContent {
  return {
    type: "bulletList",
    content: items.map((item) => ({
      type: "listItem",
      content: [{ type: "paragraph", content: [{ type: "text", text: item }] }],
    })),
  };
}

function doc(content: JSONContent[]): JSONContent {
  return { type: "doc", content };
}

export const FALLBACK_SERVICE_DETAILS: Record<string, JSONContent> = {
  "fuel-credit": doc([
    heading(2, "Fuel Today. Keep Moving. Keep Earning."),
    paragraph(
      "Go Gro Fuel Credit is designed for e-hailing drivers and delivery entrepreneurs who rely on their vehicles to earn an income."
    ),
    paragraph(
      "We understand that fuel is one of the biggest and most immediate operating costs in the mobility industry. When cash flow is tight, not having access to fuel can mean losing valuable hours — or even days — of earning."
    ),
    paragraph("Go Gro helps bridge that gap."),
    paragraph(
      "Our Fuel Credit solution gives approved mobility entrepreneurs access to fuel across our growing network of partner fuel stations, allowing them to fuel up, stay on the road and repay according to their agreed payment cycle."
    ),
    heading(2, "Who Is It For?"),
    paragraph("Go Gro Fuel Credit is currently available to:"),
    bulletList([
      "E-hailing drivers",
      "Delivery drivers and delivery entrepreneurs",
      "Approved mobility entrepreneurs who use their vehicles to generate income",
    ]),
    heading(2, "More Than Just Fuel"),
    paragraph("Joining Go Gro Fuel gives you access to more than fuel credit."),
    paragraph(
      "As you build a positive payment history with us, you can become eligible for additional Go Gro Rewards & Benefits, including driver rewards, referral benefits and vehicle maintenance and repair assistance."
    ),
    paragraph(
      "Our goal is to build long-term relationships with responsible mobility entrepreneurs and support them as they grow."
    ),
    heading(2, "A Growing Fuel Network"),
    paragraph(
      "Go Gro is building a growing network of fuel partners to make accessing fuel easier and more convenient for our members."
    ),
    paragraph("Join Go Gro Fuel and keep your business moving."),
  ]),
  "vehicle-rental": doc([
    heading(2, "Get a Car. Get on the Road. Start Earning."),
    paragraph(
      "Go Gro helps e-hailing drivers access reliable rental vehicles so they can get on the road and start earning."
    ),
    paragraph(
      "We work with vehicle owners and rental partners to connect approved drivers with vehicles suitable for e-hailing platforms."
    ),
    paragraph(
      "Whether you are an experienced e-hailing driver looking for a vehicle or are ready to start your journey in the industry, Go Gro can help you find a rental option that suits your needs."
    ),
    heading(2, "How It Works"),
    {
      type: "orderedList",
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "Apply", marks: [{ type: "bold" }] },
                {
                  type: "text",
                  text: " — Complete an application and provide the required driver and e-hailing documentation.",
                },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "Get Approved", marks: [{ type: "bold" }] },
                {
                  type: "text",
                  text: " — Our team reviews your application and confirms your eligibility.",
                },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "Get Matched", marks: [{ type: "bold" }] },
                {
                  type: "text",
                  text: " — Once approved, we work to match you with an available rental vehicle.",
                },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "Get Moving", marks: [{ type: "bold" }] },
                {
                  type: "text",
                  text: " — Complete the rental process, collect your vehicle and start earning.",
                },
              ],
            },
          ],
        },
      ],
    },
    heading(2, "Built for E-Hailing Drivers"),
    paragraph(
      "Our vehicle rental service is specifically designed around the needs of e-hailing drivers."
    ),
    paragraph(
      "Through the wider Go Gro ecosystem, drivers can also access services such as Fuel Credit, Vehicle Repairs and Go Gro Rewards & Benefits."
    ),
    paragraph("Need a vehicle for e-hailing? Apply with Go Gro and get moving."),
  ]),
  "vehicle-management": doc([
    heading(2, "Your Vehicle. Managed. Earning."),
    paragraph(
      "Own a vehicle that you would like to put to work in the mobility industry, but don't want the stress of managing drivers?"
    ),
    paragraph("Go Gro can manage it for you."),
    paragraph(
      "Our Vehicle Management service is designed for vehicle owners who want to generate income from their vehicles through the e-hailing and mobility market, while Go Gro takes care of the day-to-day management."
    ),
    heading(2, "We Handle the Driver. You Own the Asset."),
    paragraph(
      "Managing a vehicle in the e-hailing industry can be time-consuming. Finding the right driver, collecting weekly rentals, monitoring the vehicle and dealing with maintenance can quickly become a second job."
    ),
    paragraph("Go Gro takes that responsibility off your hands."),
    paragraph(
      "We use our existing mobility network to help place suitable drivers into managed vehicles and oversee the relationship on behalf of the vehicle owner."
    ),
    heading(2, "What We Manage"),
    paragraph("Our vehicle management service can include:"),
    bulletList([
      "Driver sourcing and screening",
      "Driver onboarding",
      "Weekly rental collection",
      "Driver communication and management",
      "Vehicle tracking and monitoring",
      "Maintenance and service coordination",
      "Vehicle inspections",
      "Licence and administrative support",
      "Driver replacement when required",
      "Regular updates on your vehicle",
    ]),
    heading(2, "Turn Your Vehicle Into an Income-Generating Asset"),
    paragraph(
      "Whether you own one vehicle or are building a fleet, Go Gro gives you a practical way to participate in the mobility economy without having to manage the day-to-day relationship with drivers yourself."
    ),
    paragraph("You provide the vehicle. We manage the mobility."),
    heading(2, "Put Your Vehicle to Work"),
    paragraph("Have a vehicle you would like Go Gro to manage?"),
    paragraph(
      "List your vehicle with Go Gro and let us help you turn it into an income-generating asset."
    ),
  ]),
};

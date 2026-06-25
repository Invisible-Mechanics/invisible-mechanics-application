export const site = {
  business: {
    legalName: "Invisible Mechanics Pvt. Ltd.",
    entityType: "Private Limited",
    gstin: "29AAHCI7871H1Z0",
    cin: "U85491KA2024PTC191508",
    registeredAddress: [
      "Fourth Floor, Site.54, Yelenahalli Main road, Akshayanagar, Bangur Hobli, Road, off Bannergatta Road",
      "Bengaluru, Karnataka 560114",
    ],
  },
  contact: {
    supportEmail: "support@invisiblemechanics.com",
    supportPhone: "+91 6290683639",
  },
  grievance: {
    officerName: "Rajbir Chakraborty",
    email: "support@invisiblemechanics.com",
    phone: "+91 6290683639",
    address: [] as string[],
  },
  jurisdiction: {
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
  },
  brand: {
    name: "Invisible Mechanics",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "",
  },
  paymentProcessor: "Razorpay",
  policy: {
    legalLastUpdated: "17 June 2026",
    supportResponseDays: 2,
    grievanceAckHours: 48,
    grievanceResolutionDays: 30,
    cohortRefundDays: 7,
    onDemandRefundHours: 48,
    refundProcessingText: "5-7 working days",
    dataRetentionYears: 8,
    sessionLogRetentionMonths: 12,
  },
};

export const grievanceAddressLines: string[] = site.grievance.address.some(
  (line) => line.trim() !== "",
)
  ? site.grievance.address
  : site.business.registeredAddress;

export function addressInline(lines: readonly string[]): string {
  return lines.filter((line) => line.trim() !== "").join(", ");
}

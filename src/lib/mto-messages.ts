export const MTO_MOBILE = "8712662874";

export function formatPhpMonthYear(date = new Date()): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[date.getMonth()]}-${date.getFullYear()}`;
}

function normalizeMobile(mobile: string): string {
  return mobile.replace(/\D/g, "");
}

function whatsAppUrl(mobile: string, message: string): string {
  return `https://wa.me/91${normalizeMobile(mobile)}?text=${encodeURIComponent(message)}`;
}

export function buildVehicleWhatsAppLinks(registrationNo: string, officerMobile: string) {
  const date = formatPhpMonthYear();

  const addQuotaMessage =
    `Hi Sir/Madam, \n\n` +
    `We're pleased to inform you that an additional fuel quota has been sanctioned for your vehicle (${registrationNo}).\n` +
    `it is valid till ${date}.\n\n` +
    `For any further queries contact MTO control number [${MTO_MOBILE}]. \n\n` +
    `-- MTO, Hyderabad.\n`;

  const serviceMessage =
    `Hi Sir/Madam\n\n` +
    `Your vehicle number (${registrationNo}) is due for servicing, please ensure the service is completed based on the kilometers driven or before the servicing date ${date}, whichever is earlier.\n\n` +
    `For any further queries, contact the MTO control number [${MTO_MOBILE}]. \n\n` +
    `-- MTO, Hyderabad.\n`;

  const inspectionMessage =
    `Hi Sir/Madam\n\n` +
    `Your vehicle number (${registrationNo}) is due for inspection,  please attend.\n` +
    `inspection on or before ${date}.\n\n` +
    `For any further queries contact MTO control number [${MTO_MOBILE}]. \n\n` +
    `-- MTO, Hyderabad.\n`;

  return {
    addQuota: whatsAppUrl(officerMobile, addQuotaMessage),
    service: whatsAppUrl(officerMobile, serviceMessage),
    inspection: whatsAppUrl(officerMobile, inspectionMessage),
  };
}

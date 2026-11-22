/** Display only: amounts are integer paise from the backend. No arithmetic on prices happens in the UI. */
export const rupees = (paise: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: paise % 100 === 0 ? 0 : 2 }).format(paise / 100);

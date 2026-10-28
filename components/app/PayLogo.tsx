/* Payment brand marks on a white tile, so each brand shows in its own colours in light and dark mode.
   Brands with a file in public/pay show that file. The rest show their name in brand colours until their
   official artwork is added to public/pay and given a src here. */
export type Brand = "jazzcash" | "easypaisa" | "visa" | "mastercard" | "unionpay" | "raast";

const brands: Record<Brand, { name: string; src?: string }> = {
  jazzcash: { name: "JazzCash" },
  easypaisa: { name: "Easypaisa" },
  visa: { name: "Visa", src: "/pay/visa.svg" },
  mastercard: { name: "Mastercard", src: "/pay/mastercard.svg" },
  unionpay: { name: "UnionPay", src: "/pay/unionpay.svg" },
  raast: { name: "Raast" },
};

export const brandName = (b: Brand) => brands[b].name;

export default function PayLogo({ brand, size = "md" }: { brand: Brand; size?: "sm" | "md" }) {
  const b = brands[brand];
  return (
    <span className={`plogo ${size} b-${brand}`}>
      {b.src ? <img src={b.src} alt={b.name} /> : <span className="wordmark">{b.name}</span>}
    </span>
  );
}

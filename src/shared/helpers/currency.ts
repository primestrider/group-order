const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
})

/**
 * Format number as Rupiah.
 * Example: 15000 -> "Rp 15.000"
 */
export const formatRupiah = (value: number): string => rupiahFormatter.format(value)

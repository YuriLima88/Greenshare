import { queryOptions } from "@tanstack/react-query";
import { getPublicDonation, listAvailableDonations } from "./donations.functions";
export const donationsQuery = (data: { q: string; categoria: string; page: number }) => queryOptions({ queryKey: ["donations", "available", data], queryFn: () => listAvailableDonations({ data }) });
export const donationQuery = (id: number) => queryOptions({ queryKey: ["donations", "detail", id], queryFn: () => getPublicDonation({ data: id }) });

import { fail } from "@/lib/helpers/fail";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || fail('No API base URL');

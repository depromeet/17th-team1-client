import { api } from "@/lib/api";

export { ApiError } from "@globber/api";

export const { apiGet, apiPost, apiPostWithHeaders, apiPut, apiPatch, apiDelete } = api.client;

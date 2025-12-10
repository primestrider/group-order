import axiosInstance from '@/plugins/axios'
import type { ApiResponse, CustomAxiosRequestConfig } from '@/shared/models/api'
import type { OrderRequestPayload } from '../models'

export const OrderRequest = async (payload: OrderRequestPayload): Promise<ApiResponse> => {
  const configRequest: CustomAxiosRequestConfig<OrderRequestPayload> = {
    url: '/order/request',
    method: 'POST',
    data: payload,
    meta: {
      requiresAuth: true,
    },
  }
  const { data } = await axiosInstance.request(configRequest)
  return data
}

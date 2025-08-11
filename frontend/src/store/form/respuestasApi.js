// src/features/respuestas/respuestasApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const respuestasApi = createApi({
  reducerPath: 'respuestasApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers) => {
      const tk = localStorage.getItem('tk');
      if (tk) headers.set('Authorization', `Bearer ${tk}`);
      return headers;
    }
  }),
  tagTypes: ['Respuesta'],
  endpoints: (builder) => ({
    getRespuesta: builder.query({
      query: (id) => `respuestas/${id}/`,
      providesTags: (res, err, id) => [{ type: 'Respuesta', id }],
    }),
    createRespuesta: builder.mutation({
      query: (body) => ({ url: 'respuestas/', method: 'POST', body }),
      invalidatesTags: ['Respuesta'],
    }),
    updateRespuesta: builder.mutation({
      query: ({ id, ...body }) => ({ url: `respuestas/${id}/`, method: 'PUT', body }),
      invalidatesTags: (res, err, { id }) => [{ type: 'Respuesta', id }],
    }),
    patchRespuesta: builder.mutation({
      query: ({ id, ...body }) => ({ url: `respuestas/${id}/`, method: 'PATCH', body }),
      invalidatesTags: (res, err, { id }) => [{ type: 'Respuesta', id }],
    }),
  }),
});

export const {
  useGetRespuestaQuery,
  useCreateRespuestaMutation,
  useUpdateRespuestaMutation,
  usePatchRespuestaMutation,
} = respuestasApi;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { tiposCampoService } from "../../services/form/tiposCampoService";

export const fetchTiposCampo = createAsyncThunk(
  "formulario/tiposCampo/fetchTiposCampo",
  async (_, { getState }) => {
    const { items } = getState().formulario.tiposCampo;
    if (items.length > 0) return items;
    return await tiposCampoService.getTiposCampo();
  }
);

const tiposCampoSlice = createSlice({
  name: "formulario/tiposCampo",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTiposCampo.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTiposCampo.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTiposCampo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default tiposCampoSlice.reducer;

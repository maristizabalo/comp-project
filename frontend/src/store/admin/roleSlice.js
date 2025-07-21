import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { rolService } from "../../services/admin/rol";

export const fetchRoles = createAsyncThunk(
  "admin/roles/fetchRoles",
  async (_, { getState }) => {
    const { roles } = getState().admin.roles;
    if (roles.length > 0) {
      // Ya los tiene cargados, no vuelvas a traerlos
      return roles;
    }
    return await rolService.getRoles();
  }
);

const roleSlice = createSlice({
  name: "admin/roles",
  initialState: {
    roles: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default roleSlice.reducer;

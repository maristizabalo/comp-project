import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { permissionService } from "../../services/admin/permission";

export const fetchPermissions = createAsyncThunk(
  "admin/permissions/fetchPermissions",
  async (_, { getState }) => {
    const { permissions } = getState().admin.permissions;
    if (permissions.length > 0) return permissions;
    return await permissionService.getPermissions();
  }
);

export const fetchPermissionsForm = createAsyncThunk(
  "admin/permissions/fetchPermissionsForm",
  async (_, { getState }) => {
    const { permissionsForm } = getState().admin.permissions;
    if (permissionsForm.length > 0) return permissionsForm;
    return await permissionService.getPermissionsForm();
  }
);

const permissionsSlice = createSlice({
  name: "admin/permissions",
  initialState: {
    permissions: [],
    permissionsForm: [],
    loadingPermissions: false,
    loadingPermissionsForm: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPermissions.pending, (state) => {
        state.loadingPermissions = true;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.loadingPermissions = false;
        state.permissions = action.payload;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.loadingPermissions = false;
        state.error = action.error.message;
      })
      .addCase(fetchPermissionsForm.pending, (state) => {
        state.loadingPermissionsForm = true;
      })
      .addCase(fetchPermissionsForm.fulfilled, (state, action) => {
        state.loadingPermissionsForm = false;
        state.permissionsForm = action.payload;
      })
      .addCase(fetchPermissionsForm.rejected, (state, action) => {
        state.loadingPermissionsForm = false;
        state.error = action.error.message;
      });
  },
});

export default permissionsSlice.reducer;

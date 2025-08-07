import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import roleReducer from "./admin/roleSlice";
import permissionReducer from "./admin/permissionSlice";
import tiposCampoReducer from "./form/tiposCamposSlice";
import formEntryReducer from "./form/formEntrySlice"

const adminReducer = combineReducers({
  roles: roleReducer,
  permissions: permissionReducer,
});

const formularioReducer = combineReducers({
  tiposCampo: tiposCampoReducer,
  formEntry: formEntryReducer
});

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    formulario: formularioReducer,
  },
});

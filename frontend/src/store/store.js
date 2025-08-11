import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from "./auth/authSlice";
import roleReducer from "./admin/roleSlice";
import { respuestasApi } from './form/respuestasApi';
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
    [respuestasApi.reducerPath]: respuestasApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // opcional si guardas objetos complejos
    }).concat(
      // RTK Query (OBLIGATORIO)
      respuestasApi.middleware,
    ),
  devTools: import.meta.env.DEV,
});

setupListeners(store.dispatch);

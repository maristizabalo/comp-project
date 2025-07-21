import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import roleReducer from './admin/roleSlice';
import permissionReducer from './admin/permissionSlice';

const adminReducer = combineReducers({
  roles: roleReducer,
  permissions: permissionReducer,
});

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
  }
});
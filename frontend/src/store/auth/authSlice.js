import { createSlice } from "@reduxjs/toolkit";
import { api } from "../../services/api";
import { notification } from "antd";

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoading = false;
      state.error = null;

      // Guardar en localStorage
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    loginFailure(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout: logoutAction,
} = authSlice.actions;

// Thunk para login
export const login = (credentials) => async (dispatch) => {
  try {
    dispatch(loginStart());
    const response = await api.post("/auth/login/", credentials);
    dispatch(loginSuccess(response.data));

    notification.success({
      message: "Inicio de sesión exitoso",
      description: `¡Bienvenido ${response.data.user.nombreCompleto || ""}!`,
      placement: "top",
    });

    return response.data;
  } catch (error) {
    console.log(error);
    dispatch(
      loginFailure(error.response?.data?.message || "Error de autenticación")
    );

    // notification.error({
    //   message: "Error al iniciar sesión",
    //   description:
    //     error.response?.data?.message || "Ocurrió un problema inesperado.",
    //   placement: "top",
    // });

    throw error;
  }
};

// Thunk para logout
export const logout = () => async (dispatch) => {
  try {
    await api.get("/auth/logout/");
  } catch (error) {
    console.error("Error durante logout:", error);
  } finally {
    dispatch(logoutAction());

    notification.info({
      message: "Sesión finalizada",
      description: "Has cerrado sesión exitosamente.",
      placement: "top",
    });
  }
};

export default authSlice.reducer;

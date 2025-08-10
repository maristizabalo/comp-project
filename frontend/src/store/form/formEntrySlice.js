// src/store/form/formEntrySlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { formService } from "../../services/form/formService";

export const saveSection = createAsyncThunk(
  "formEntry/saveSection",
  async ({ formularioId, seccionId, respuestas }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const respuestaId = state.formulario.formEntry.respuestaId || null;

      const payload = {
        formulario: Number(formularioId),
        respuestas_campo: respuestas,
        // clave para EDITAR la misma respuesta
        respuesta_id: respuestaId,
      };

      const result = await formService.createRespuestaFormulario(payload);
      // el backend devuelve { id, formulario, usuario, ip, fecha_creacion, ... }
      return { seccionId, result, respuestaId: result.id };
    } catch (e) {
      return rejectWithValue(e?.message || "Error al guardar sección");
    }
  }
);

const initialState = {
  currentStep: 0,
  sectionsData: {},
  sectionStatus: {},
  sectionError: {},
  // almacena el id devuelto por el backend para reusarlo
  respuestaId: null,
};

const slice = createSlice({
  name: "formEntry",
  initialState,
  reducers: {
    setStep(state, action) {
      state.currentStep = action.payload;
    },
    updateSectionData(state, action) {
      const { seccionId, data } = action.payload;
      state.sectionsData[seccionId] = { ...(state.sectionsData[seccionId] || {}), ...data };
    },
    resetFormEntry() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveSection.pending, (state, action) => {
        const { seccionId } = action.meta.arg || {};
        if (seccionId != null) {
          state.sectionStatus[seccionId] = "loading";
          state.sectionError[seccionId] = null;
        }
      })
      .addCase(saveSection.fulfilled, (state, action) => {
        const { seccionId, respuestaId } = action.payload || {};
        if (seccionId != null) {
          state.sectionStatus[seccionId] = "succeeded";
          state.sectionError[seccionId] = null;
        }
        if (respuestaId) {
          state.respuestaId = respuestaId; // conservar para los próximos saves
        }
      })
      .addCase(saveSection.rejected, (state, action) => {
        const { seccionId } = action.meta.arg || {};
        if (seccionId != null) {
          state.sectionStatus[seccionId] = "failed";
          state.sectionError[seccionId] =
            action.payload || action.error?.message || "Error al guardar sección";
        }
      });
  },
});

export const { setStep, updateSectionData, resetFormEntry } = slice.actions;
export default slice.reducer;

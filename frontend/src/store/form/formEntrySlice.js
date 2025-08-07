import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { formService } from "../../services/form/formService";

export const saveSection = createAsyncThunk(
  "formEntry/saveSection",
  async ({ formularioId, seccionId, respuestas }, thunkAPI) => {
    // Construye payload con sección individual para API existente
    const payload = {
      formulario: Number(formularioId),
      respuestas_campo: respuestas
    };
    return await formService.createRespuestaFormulario(payload);
  }
);

const formEntrySlice = createSlice({
  name: "formEntry",
  initialState: {
    currentStep: 0,
    sectionsData: {},   // { [seccionId]: values }
    status: "idle",
    error: null,
  },
  reducers: {
    setStep(state, action) {
      state.currentStep = action.payload;
    },
    updateSectionData(state, action) {
      const { seccionId, data } = action.payload;
      state.sectionsData[seccionId] = data;
    },
    resetFormEntry(state) {
      state.currentStep = 0;
      state.sectionsData = {};
      state.status = "idle";
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveSection.pending, (state) => { state.status = "loading"; })
      .addCase(saveSection.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(saveSection.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  }
});

export const { setStep, updateSectionData, resetFormEntry } = formEntrySlice.actions;
export default formEntrySlice.reducer;
import React, { useEffect, useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Button, Spin, message } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import CustomStepper from "../../../components/form/CustomStepper";
import SectionCard from "../../../components/form/SectionCard";
import FormStep from "../../../components/form/FormStep";
import { formService } from "../../../services/form/formService";
import { useFetch } from "../../../hooks/use-fetch";
import {
  setStep,
  updateSectionData,
  saveSection,
  resetFormEntry
} from "../../../store/form/formEntrySlice";

const FormEntry = () => {
  // HOOKS: se ejecutan siempre en mismo orden
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { currentStep, sectionsData } = useSelector((state) => state.formulario.formEntry);
  const [formulario, setFormulario] = useState(null);
  const [loading, setLoading] = useState(true);
  const { loading: loadingSubmit, fetchData } = useFetch();

  // Handler: avanzar
  const next = useCallback(async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      const seccion = formulario.secciones[currentStep];
      const respuestas = seccion.campos.flatMap(campo => {
        const raw = values[campo.nombre];
        switch (campo.tipo) {
          case "numero": return [{ campo: campo.id, valor_numero: Number(raw) }];
          case "booleano": return [{ campo: campo.id, valor_booleano: raw }];
          case "fecha": return [{ campo: campo.id, valor_fecha: raw.format("YYYY-MM-DD") }];
          case "seleccion-unica": return [{ campo: campo.id, valor_opcion: raw }];
          case "seleccion-multiple": return [{ campo: campo.id, valor_opciones: raw }];
          case "geometrico": return [{ campo: campo.id, valor_geom: raw.valor_geom }];
          case "grupo-campos":
            return (raw || []).map(item => ({ campo: campo.id, valor_texto: item.valor }));
          default: return [{ campo: campo.id, valor_texto: raw }];
        }
      });
      // Guardar estado local y enviar
      dispatch(updateSectionData({ seccionId: seccion.id, data: values }));
      await fetchData(() => dispatch(saveSection({ formularioId: id, seccionId: seccion.id, respuestas })));
      dispatch(setStep(currentStep + 1));
    } catch (err) {
      if (err.errorFields) message.warning("Completa los campos obligatorios");
      else message.error(err.message || "Error al guardar sección");
    }
  }, [form, formulario, currentStep, dispatch, id, fetchData]);

  // Handler: retroceder
  const prev = useCallback(() => {
    dispatch(setStep(currentStep - 1));
  }, [currentStep, dispatch]);

  // Efecto: carga inicial del formulario
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await formService.getFormularioById(id);
        setFormulario(data);
        dispatch(resetFormEntry());
      } catch {
        message.error("Error loading form");
      }
      setLoading(false);
    };
    load();
  }, [id, dispatch]);

  // Efecto: cargar datos previos al cambiar de sección
  useEffect(() => {
    if (!formulario) return;
    const seccion = formulario.secciones[currentStep];
    const prevData = sectionsData[seccion.id];
    if (prevData) form.setFieldsValue(prevData);
  }, [currentStep, sectionsData, formulario, form]);

  // RENDERS CONDICIONALES
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />} />
      </div>
    );
  }
  if (!formulario) return null;

  // Variables derivadas (después de hooks y condicionales de carga)
  const totalSections = formulario.secciones.length;
  const titles = formulario.secciones.map(s => s.nombre);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <CustomStepper total={totalSections} titles={titles} />
      <SectionCard>
        <Form form={form} layout="vertical" onFinish={next}>
          <FormStep seccion={formulario.secciones[currentStep]} form={form} />
          <div className="flex justify-between mt-6">
            {currentStep > 0 && <Button onClick={prev}>Previous</Button>}
            {currentStep < totalSections - 1 ? (
              <Button type="primary" loading={loadingSubmit} onClick={next}>Next</Button>
            ) : (
              <Button type="primary" htmlType="submit" loading={loadingSubmit}>Submit</Button>
            )}
          </div>
        </Form>
      </SectionCard>
    </div>
  );
};

export default FormEntry;

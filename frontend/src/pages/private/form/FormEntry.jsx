// src/pages/form/FormEntry.jsx
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
import { serializeValues, hydrateValues } from "../../../utils/formSerialize";
import dayjs from "dayjs";
import { esriToGeoJSON } from "../../../utils/geometry";

const toRespuestaCampoFromSub = (item) => {
  const v = item?.valor;
  const t = (item?.tipo || "").toLowerCase();
  if (v === undefined || v === null || v === "") return { valor_texto: "" };
  if (t === "numero") return { valor_numero: Number(v) };
  if (t === "booleano") return { valor_booleano: !!v };
  if (t === "fecha") return { valor_fecha: dayjs(v).format("YYYY-MM-DD") };
  return { valor_texto: String(v) };
};


const FormEntry = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { currentStep, sectionsData } = useSelector(
    (state) => state.formulario.formEntry
  );
  const [formulario, setFormulario] = useState(null);
  const [loading, setLoading] = useState(true);
  const { loading: loadingSubmit, fetchData } = useFetch();

  const next = useCallback(async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      const seccion = formulario.secciones[currentStep];

      const respuestas = seccion.campos.flatMap((campo) => {
        const raw = values[campo.nombre];
        switch (campo.tipo) {
          case "numero":
            return [{ campo: campo.id, valor_numero: Number(raw) }];
          case "booleano":
            return [{ campo: campo.id, valor_booleano: !!raw }];
          case "fecha":
            return [
              {
                campo: campo.id,
                valor_fecha: raw ? dayjs(raw).format("YYYY-MM-DD") : null,
              },
            ];
          case "seleccion-unica":
            return [{ campo: campo.id, valor_opcion: raw ?? null }];
          case "seleccion-multiple":
            return [{ campo: campo.id, valor_opciones: Array.isArray(raw) ? raw : [] }];
          case "geometrico":
            return [{ campo: campo.id, valor_geom: esriToGeoJSON(raw?.valor_geom) }];
          case "grupo-campos":
            // return (raw || []).map((item) => ({
            //   campo: campo.id,
            //   valor_texto: item?.valor ?? "",
            // }));
            return (raw || []).map((item) => ({
              campo: campo.id,
              ...toRespuestaCampoFromSub(item),
            }));
          default:
            return [{ campo: campo.id, valor_texto: raw ?? "" }];
        }
      });

      dispatch(
        updateSectionData({
          seccionId: seccion.id,
          data: serializeValues(values, seccion.campos),
        })
      );

      await fetchData(() =>
        dispatch(
          saveSection({ formularioId: id, seccionId: seccion.id, respuestas })
        )
      );

      const lastIndex = formulario.secciones.length - 1;
      if (currentStep < lastIndex) {
        dispatch(setStep(currentStep + 1));
      } else {
        message.success("Formulario enviado");
      }
    } catch (err) {
      if (err?.errorFields) message.warning("Completa los campos obligatorios");
      else message.error(err?.message || "Error al guardar sección");
    }
  }, [form, formulario, currentStep, dispatch, id, fetchData]);

  const prev = useCallback(() => {
    if (currentStep > 0) dispatch(setStep(currentStep - 1));
  }, [currentStep, dispatch]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await formService.getFormularioById(id);
        setFormulario(data);
        dispatch(resetFormEntry());
      } catch (e) {
        message.error("Error loading form");
      }
      setLoading(false);
    };
    load();
  }, [id, dispatch]);

  useEffect(() => {
    if (!formulario) return;
    const seccion = formulario.secciones[currentStep];
    if (!seccion) {
      form.resetFields();
      return;
    }
    const prevPlano = sectionsData[seccion.id];
    if (prevPlano) {
      form.setFieldsValue(hydrateValues(prevPlano, seccion.campos));
    } else {
      const init = {};
      seccion.campos.forEach((c) => {
        init[c.nombre] = c.tipo === "fecha" ? null : undefined;
      });
      form.setFieldsValue(init);
    }
  }, [currentStep, sectionsData, formulario, form]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />} />
      </div>
    );
  }
  if (!formulario) return null;

  const totalSections = formulario.secciones.length;
  const titles = formulario.secciones.map((s) => s.nombre);
  const seccionActual =
    currentStep >= 0 && currentStep < totalSections
      ? formulario.secciones[currentStep]
      : null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <CustomStepper total={totalSections} titles={titles} />
      <SectionCard>
        <Form form={form} layout="vertical" onFinish={next}>
          {seccionActual ? (
            <FormStep seccion={seccionActual} form={form} />
          ) : null}
          <div className="flex justify-between mt-6">
            {currentStep > 0 && <Button onClick={prev}>Previous</Button>}
            {currentStep < totalSections - 1 ? (
              <Button type="primary" loading={loadingSubmit} onClick={next}>
                Next
              </Button>
            ) : (
              <Button type="primary" htmlType="submit" loading={loadingSubmit}>
                Submit
              </Button>
            )}
          </div>
        </Form>
      </SectionCard>
    </div>
  );
};

export default FormEntry;

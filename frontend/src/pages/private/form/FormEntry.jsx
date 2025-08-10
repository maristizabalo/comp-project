import React, { useEffect, useCallback, useState, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
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
  resetFormEntry,
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

const ensureGeoJSON = (raw) => {
  if (!raw) return null;
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return null; }
  }
  return raw; // ya es objeto
};

const mapSubcamposByName = (campoPadre) => {
  const arr = campoPadre?.subcampos?.campos || [];
  return arr.reduce((acc, sc) => {
    acc[sc.nombre] = sc; // sc debe traer .id, .nombre, .tipo, .opciones, etc.
    return acc;
  }, {});
};

export const hydrateFromDetalle = (formulario, detalleValores) => {
  const init = {};
  (formulario?.secciones || []).forEach((sec) => {
    (sec.campos || []).forEach((c) => {
      const raw = detalleValores?.[c.nombre];

      switch (c.tipo) {
        case "fecha":
          init[c.nombre] = raw ? dayjs(raw) : null;
          break;

        case "seleccion-unica":
          init[c.nombre] = raw ?? null;
          break;

        case "seleccion-multiple":
          init[c.nombre] = Array.isArray(raw) ? raw : [];
          break;

        case "geometrico": {
          const gj = ensureGeoJSON(raw);
          init[c.nombre] = gj ? { valor_geom: gj } : undefined;
          break;
        }

        case "grupo-campos":
          // backend ya manda array [{nombre, tipo, valor}, ...]
          init[c.nombre] = Array.isArray(raw) ? raw.map(item => ({
            nombre: item.nombre,
            tipo: item.tipo,
            valor: item.valor,
          })) : [];
          break;

        default:
          init[c.nombre] = raw ?? (c.tipo === "fecha" ? null : undefined);
      }
    });
  });
  return init;
};

const FormEntry = () => {
  // Rutas soportadas:
  // - /formularios/diligenciar/:id            -> create
  // - /formularios/diligenciar/:id?respuestaId=XX -> edit
  // - /formularios/:formularioId/respuestas/:respuestaId -> view
  const params = useParams();
  const [searchParams] = useSearchParams();
  const formularioId = params.id || params.formularioId;
  const respuestaIdFromQuery = searchParams.get("respuestaId");
  const respuestaId = params.respuestaId || respuestaIdFromQuery;

  const mode = useMemo(() => {
    if (params.respuestaId) return "view";
    if (respuestaIdFromQuery) return "edit";
    return "create";
  }, [params.respuestaId, respuestaIdFromQuery]);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { currentStep, sectionsData } = useSelector(
    (state) => state.formulario.formEntry
  );
  const [formulario, setFormulario] = useState(null);
  const [loading, setLoading] = useState(true);
  const { loading: loadingSubmit, fetchData } = useFetch();
  const { fetchData: fetchDetalle, data: detalle } = useFetch();

  const next = useCallback(async () => {
    if (mode === "view") return; // no envía nada en vista
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      console.log(object)
      const seccion = formulario.secciones[currentStep];

      const respuestas = seccion.campos.flatMap((campo) => {
        const raw = values[campo.nombre];
        console.log(raw)
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
            return [
              {
                campo: campo.id,
                valor_opciones: Array.isArray(raw) ? raw : [],
              },
            ];
          case "geometrico":
            return [{ campo: campo.id, valor_geom: esriToGeoJSON(raw?.valor_geom) }];
          case "grupo-campos": {
            // raw = [{ nombre, tipo, valor }, ...]
            const items = Array.isArray(raw) ? raw : [];
            const subMap = mapSubcamposByName(campo); // { subNombre: subMeta(id, tipo, ...) }

            const convert = (item) => {
              const sub = subMap[item?.nombre];
              if (!sub) return null; // subcampo ya no existe o nombre no coincide

              const t = String(item?.tipo || sub.tipo || "").toLowerCase();
              const v = item?.valor;

              // Mapeo tipado por tipo del subcampo
              if (t === "numero") {
                return {
                  campo: sub.id, // 👈 ID del subcampo (no el padre)
                  valor_numero: v === "" || v == null ? null : Number(v),
                };
              }

              if (t === "booleano") {
                return { campo: sub.id, valor_booleano: !!v };
              }

              if (t === "fecha") {
                return {
                  campo: sub.id,
                  valor_fecha: v ? dayjs(v).format("YYYY-MM-DD") : null,
                };
              }

              if (t === "seleccion-unica") {
                return { campo: sub.id, valor_opcion: v ?? null };
              }

              if (t === "seleccion-multiple") {
                const ids = Array.isArray(v) ? v : [];
                return { campo: sub.id, valor_opciones: ids };
              }

              // texto (default)
              return { campo: sub.id, valor_texto: v == null ? "" : String(v) };
            };

            return items.map(convert).filter(Boolean);
          }
          default:
            return [{ campo: campo.id, valor_texto: raw ?? "" }];
        }
      });

      // Guardar cache local de la sección
      dispatch(
        updateSectionData({
          seccionId: seccion.id,
          data: serializeValues(values, seccion.campos),
        })
      );

      // Enviar al backend (incluye respuesta_id si estamos editando)
      await fetchData(() =>
        dispatch(
          saveSection({
            formularioId: formularioId,
            seccionId: seccion.id,
            respuestas,
            // 👇 importante: para que el backend edite sobre la misma respuesta
            respuestaId: mode === "edit" ? Number(respuestaId) : null,
          })
        )
      );

      const lastIndex = formulario.secciones.length - 1;
      if (currentStep < lastIndex) {
        dispatch(setStep(currentStep + 1));
      } else {
        message.success(mode === "edit" ? "Cambios guardados" : "Formulario enviado");
      }
    } catch (err) {
      if (err?.errorFields) message.warning("Completa los campos obligatorios");
      else message.error(err?.message || "Error al guardar sección");
    }
  }, [mode, form, formulario, currentStep, dispatch, formularioId, respuestaId, fetchData]);

  const prev = useCallback(() => {
    if (currentStep > 0) dispatch(setStep(currentStep - 1));
  }, [currentStep, dispatch]);

  // Carga del formulario y (si aplica) detalle de respuesta
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await formService.getFormularioById(formularioId);
        setFormulario(data);
        dispatch(resetFormEntry());

        if (mode !== "create" && respuestaId) {
          await fetchDetalle(formService.getRespuestaDetalle, Number(respuestaId));
        }
      } catch (e) {
        message.error("Error loading form");
      }
      setLoading(false);
    };
    load();
  }, [formularioId, dispatch, mode, respuestaId, fetchDetalle]);

  // Hidratar al entrar a cada sección
  useEffect(() => {
    if (!formulario) return;
    const seccion = formulario.secciones[currentStep];
    if (!seccion) {
      form.resetFields();
      return;
    }

    // 1) datos guardados en redux (navegación previa entre pasos)
    const prevPlano = sectionsData[seccion.id];
    if (prevPlano) {
      form.setFieldsValue(hydrateValues(prevPlano, seccion.campos));
      return;
    }

    // 2) modo edit/view: usa detalle del backend
    if ((mode === "edit" || mode === "view") && detalle?.valores) {
      // Hidrata TODO el form y que AntD reparta
      const all = hydrateFromDetalle(formulario, detalle.valores);
      form.setFieldsValue(all);
      return;
    }

    // 3) create por defecto
    const init = {};
    seccion.campos.forEach((c) => {
      init[c.nombre] = c.tipo === "fecha" ? null : undefined;
    });
    form.setFieldsValue(init);
  }, [currentStep, sectionsData, formulario, form, mode, detalle]);

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

  const isView = mode === "view";

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <CustomStepper total={totalSections} titles={titles} />
      <SectionCard>
        <Form form={form} layout="vertical" onFinish={next} disabled={isView}>
          {seccionActual ? <FormStep seccion={seccionActual} form={form} isView={isView} /> : null}

          <div className="flex justify-between mt-6">
            {currentStep > 0 && !isView && <Button onClick={prev}>Anterior</Button>}
            {isView ? (
              <Button onClick={() => window.history.back()}>Volver</Button>
            ) : currentStep < totalSections - 1 ? (
              <Button type="primary" loading={loadingSubmit} onClick={next}>
                Siguiente
              </Button>
            ) : (
              <Button type="primary" htmlType="submit" loading={loadingSubmit}>
                {mode === "edit" ? "Guardar cambios" : "Enviar"}
              </Button>
            )}
          </div>
        </Form>
      </SectionCard>
    </div>
  );
};

export default FormEntry;
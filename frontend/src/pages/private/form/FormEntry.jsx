// src/pages/private/form/FormEntry.jsx
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Form, Button, message, Skeleton, Empty } from "antd";
import { useSelector } from "react-redux";
import { useParams, useSearchParams } from "react-router-dom";

import FieldRenderer from "../../../components/form/FieldRenderer";

import {
  useCreateRespuestaMutation,
  useUpdateRespuestaMutation,
  useGetRespuestaDetalleQuery,
} from "../../../store/form/respuestasApi";

import { useFetch } from "../../../hooks/use-fetch";
import { formService } from "../../../services/form/formService";

import { buildRespuestaPayload } from "../../../utils/buildRespuestaPayload";
import { mapRespuestaDetalleToFormValues } from "../../../utils/mapRespuestaDetalleToFormValues";

// ------- helpers -------
const pickSchemaFromStore = (state) =>
  state?.formSchema?.data ||
  state?.forms?.schema ||
  state?.schema?.formulario ||
  null;

const hasCampos = (schema) =>
  Array.isArray(schema?.secciones) &&
  schema.secciones.some((s) => Array.isArray(s?.campos) && s.campos.length > 0);

// normaliza posibles envoltorios de la respuesta del service
const normalizeSchema = (raw) => {
  if (!raw) return null;
  const candidate = raw?.schema ?? raw?.data ?? raw?.formulario ?? raw;
  if (typeof candidate === "string") {
    try { return JSON.parse(candidate); } catch {}
  }
  return candidate;
};

const FormEntry = ({
  formulario: formularioProp,   // opcional si ya te pasan el schema
  initialValues = {},          // opcional (crear)
  onSuccess,
}) => {
  const [form] = Form.useForm();

  // ------- ruta y query -------
  const params = useParams(); // /formularios/diligenciar/:id  y  /formularios/:formularioId/respuestas/:respuestaId
  const [searchParams] = useSearchParams();

  const formularioId =
    Number(params?.id ?? params?.formularioId ?? searchParams.get("formularioId")) || null;

  const respuestaIdParam = params?.respuestaId;
  const respuestaIdQuery = searchParams.get("respuestaId");
  const respuestaId = Number(respuestaIdParam ?? respuestaIdQuery) || null;

  console.groupCollapsed("[FormEntry] mount/params");
  console.log("params:", params);
  console.log("searchParams:", Object.fromEntries(searchParams.entries()));
  console.log("formularioId:", formularioId, "respuestaId:", respuestaId);
  console.groupEnd();

  // ------- schema: prop -> store -> fetch local -------
  const schemaFromStore = useSelector(pickSchemaFromStore);
  const { data: schemaFetched, loading: loadingSchema, error: errorSchema, fetchData: fetchSchema } = useFetch();

  // evita doble fetch en StrictMode DEV
  const schemaRequestedRef = useRef(false);

  // Elegimos dinámicamente la función correcta del service
  const schemaFnEntry = useMemo(() => {
    const candidates = [
      ["getSchema", formService?.getSchema],
      ["getFormularioSchema", formService?.getFormularioSchema],
      ["getFormulario", formService?.getFormulario],
      ["getForm", formService?.getForm],
      ["getById", formService?.getById],
      ["get", formService?.get],
      ["getOne", formService?.getOne],
    ];
    const found = candidates.find(([, fn]) => typeof fn === "function");
    console.log("[FormEntry] schema function picked:", found?.[0] || "(none)");
    if (!found) console.warn("[FormEntry] NO schema fn in formService. keys:", Object.keys(formService || {}));
    return found; // [name, fn] | undefined
  }, []);

  useEffect(() => {
    if (!formularioProp && !schemaFromStore && formularioId && !schemaRequestedRef.current) {
      if (!schemaFnEntry) {
        console.error("[FormEntry] No schema function available in formService → cannot fetch schema");
        return;
      }
      schemaRequestedRef.current = true;
      const [fnName, fn] = schemaFnEntry;
      console.log("[FormEntry] fetching schema via", fnName, "for formularioId:", formularioId);
      fetchSchema(fn, formularioId)
        .then((res) => console.log("[FormEntry] schema fetched OK", res))
        .catch((err) => console.error("[FormEntry] schema fetch ERROR", err));
    } else {
      console.log("[FormEntry] schema source:", {
        hasProp: !!formularioProp,
        hasStore: !!schemaFromStore,
        formularioId,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formularioProp, schemaFromStore, formularioId, schemaFnEntry]);

  const formulario = useMemo(
    () => normalizeSchema(formularioProp || schemaFromStore || schemaFetched || null),
    [formularioProp, schemaFromStore, schemaFetched]
  );

  console.log("[FormEntry] formulario resolved:", {
    fromProp: !!formularioProp,
    fromStore: !!schemaFromStore,
    fromFetch: !!schemaFetched,
    hasCampos: hasCampos(formulario),
  });

  // ------- detalle (solo ver/editar) -------
  const skipDetalle = !respuestaId;
  const { data: detalle, isFetching: isFetchingDetalle, isError: isErrorDetalle, error: qError } =
    useGetRespuestaDetalleQuery(respuestaId, { skip: skipDetalle });

  console.log("[FormEntry] detalle query:", {
    skipDetalle,
    isFetchingDetalle,
    isErrorDetalle,
    detalle,
    qError,
  });

  // ------- mutations -------
  const [createRespuesta, { isLoading: isSavingCreate }] = useCreateRespuestaMutation();
  const [updateRespuesta, { isLoading: isSavingUpdate }] = useUpdateRespuestaMutation();
  const isSaving = isSavingCreate || isSavingUpdate;

  // ------- rehidratación (una vez) -------
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (!hydratedRef.current && respuestaId && formulario && detalle) {
      console.log("[FormEntry] rehydrate form with detalle+schema");
      const mapped = mapRespuestaDetalleToFormValues(formulario, detalle);
      console.log("[FormEntry] mapped initialValues:", mapped);
      form.setFieldsValue(mapped);
      hydratedRef.current = true;
    }
  }, [respuestaId, formulario, detalle, form]);

  // crear: set initialValues una sola vez
  useEffect(() => {
    if (!respuestaId && initialValues && Object.keys(initialValues).length) {
      console.log("[FormEntry] set initialValues for create");
      form.setFieldsValue(initialValues);
    }
  }, [respuestaId, initialValues, form]);

  // ------- submit -------
  const onFinish = useCallback(async () => {
    try {
      if (!formulario || !hasCampos(formulario)) {
        message.error("No hay schema de formulario para guardar.");
        return;
      }
      const values = form.getFieldsValue(true);
      const payload = buildRespuestaPayload(formulario, values);
      console.log("[FormEntry] submit payload:", payload);

      if (respuestaId) {
        await updateRespuesta({ id: respuestaId, ...payload }).unwrap();
        message.success("Respuesta actualizada");
      } else {
        await createRespuesta(payload).unwrap();
        message.success("Respuesta creada");
      }
      onSuccess?.();
    } catch (e) {
      console.error(e);
      message.error("No se pudo guardar. Revisa los campos.");
    }
  }, [formulario, respuestaId, updateRespuesta, createRespuesta, onSuccess, form]);

  // ------- vistas de carga/errores -------
  if (!formularioId) {
    console.warn("[FormEntry] no formularioId → Empty");
    return (
      <div className="p-4">
        <Empty description="Falta el ID del formulario en la ruta." />
      </div>
    );
  }

  if (!formulario) {
    console.warn("[FormEntry] !formulario → Skeleton");
    return (
      <div className="p-4">
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  if (!hasCampos(formulario)) {
    console.warn("[FormEntry] !hasCampos(formulario) → Empty");
    return (
      <div className="p-4">
        <Empty description="No hay campos para este formulario." />
      </div>
    );
  }

  if (respuestaId && (isFetchingDetalle || loadingSchema)) {
    console.warn("[FormEntry] respuestaId && (isFetchingDetalle || loadingSchema) → Skeleton", {
      isFetchingDetalle,
      loadingSchema,
    });
    return (
      <div className="p-4">
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  if (respuestaId && (isErrorDetalle || errorSchema)) {
    console.error("[FormEntry] respuestaId && (isErrorDetalle || errorSchema) → Empty", {
      isErrorDetalle,
      errorSchema,
      qError,
    });
    return (
      <div className="p-4">
        <Empty description="No se pudo cargar la respuesta o el schema." />
      </div>
    );
  }

  // ------- render -------
  return (
    <Form form={form} layout="vertical" onFinish={onFinish} className="p-4">
      {(formulario.secciones || []).map((sec) => (
        <div key={sec.id} className="mb-6">
          <h3 className="text-lg font-semibold mb-3">{sec.titulo}</h3>
          <div className="grid grid-cols-12 gap-4">
            {(sec.campos || []).map((campo) => (
              <div key={campo.id} className="col-span-12 md:col-span-6">
                <FieldRenderer campo={campo} form={form} />
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="flex gap-2">
        <Button htmlType="submit" type="primary" loading={isSaving}>
          {respuestaId ? "Actualizar" : "Guardar"}
        </Button>
      </div>
    </Form>
  );
};

export default FormEntry;

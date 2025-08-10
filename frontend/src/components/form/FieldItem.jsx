// src/components/form/FieldItem.jsx
import React, { Suspense, lazy } from "react";
import { Form } from "antd";
import { TIPOS_CAMPO } from "../../utils/constants";

const FieldControls = lazy(() => import("./FieldControls"));
const FieldOptions = lazy(() => import("./FieldOptions"));
const FieldSubFields = lazy(() => import("./FieldSubFields"));

const FieldItem = React.memo(function FieldItem({
  field,
  remove,
  tiposCamposOptions,
  fieldPath, // viene de SectionItem
}) {
  const form = Form.useFormInstance();

  // Observa el 'tipo' con ruta completa relativa a la raíz del formulario
  // Prefijo explícito "secciones" para evitar ambigüedad:
  const tipo = Form.useWatch(["secciones", ...fieldPath, "tipo"], form);

  const isOpcionTipo =
    tipo === TIPOS_CAMPO.SELECCION_UNICA ||
    tipo === TIPOS_CAMPO.SELECCION_MULTIPLE;
  const isGrupoCampos = tipo === TIPOS_CAMPO.GRUPO_CAMPOS;

  return (
    <div className="flex flex-col gap-2 border border-gray-200 rounded-md px-3 py-2 bg-gray-50">
      <Suspense
        fallback={<div className="text-xs text-gray-400">Cargando controles...</div>}
      >
        <FieldControls
          field={field}
          remove={remove}
          tiposCamposOptions={tiposCamposOptions}
          isGrupoCampos={isGrupoCampos}
        />
      </Suspense>

      {isOpcionTipo && (
        <Suspense
          fallback={<div className="text-xs text-gray-400">Cargando opciones...</div>}
        >
          <FieldOptions field={field} />
        </Suspense>
      )}

      {isGrupoCampos && (
        <Suspense
          fallback={<div className="text-xs text-gray-400">Cargando subcampos...</div>}
        >
          <FieldSubFields field={field} />
        </Suspense>
      )}
    </div>
  );
});

export default FieldItem;

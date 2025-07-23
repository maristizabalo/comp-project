import { Suspense, lazy, useState } from "react";
import { Form } from "antd";

const FieldControls = lazy(() => import("./FieldControls"));
const FieldOptions = lazy(() => import("./FieldOptions"));
const FieldSubFields = lazy(() => import("./FieldSubFields"));

const FieldItem = ({ field, remove, tiposCamposOptions, mainCount }) => {
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);

  const isOpcionTipo =
    tipoSeleccionado === "seleccion-unica" || tipoSeleccionado === "seleccion-multiple";
  const isGrupoCampos = tipoSeleccionado === "grupo-campos";

  return (
    <div className="flex flex-col gap-2 border border-gray-200 rounded-md px-3 py-2 bg-gray-50">
      <Suspense fallback={<div className="text-xs text-gray-400">Cargando controles...</div>}>
        <FieldControls
          field={field}
          remove={remove}
          tiposCamposOptions={tiposCamposOptions}
          mainCount={mainCount}
          isGrupoCampos={isGrupoCampos}
          onTipoChange={setTipoSeleccionado}
        />
      </Suspense>

      {isOpcionTipo && (
        <Suspense fallback={<div className="text-xs text-gray-400">Cargando opciones...</div>}>
          <FieldOptions field={field} />
        </Suspense>
      )}

      {isGrupoCampos && (
        <Suspense fallback={<div className="text-xs text-gray-400">Cargando subcampos...</div>}>
          <FieldSubFields field={field} />
        </Suspense>
      )}
    </div>
  );
};

export default FieldItem;

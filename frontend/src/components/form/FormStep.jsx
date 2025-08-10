// src/components/form/FormStep.jsx
import React from "react";
import { Typography } from "antd";
import FieldRenderer from "./FieldRenderer";

const { Title } = Typography;

const FormStep = ({ seccion, form }) => {
  if (!seccion) return null;
  const camposOrdenados = (seccion.campos || [])
    .slice()
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

  return (
    <div>
      <Title level={5}>{seccion.nombre}</Title>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {camposOrdenados.map((campo) => (
          <div key={campo.nombre}>
            <FieldRenderer campo={campo} form={form} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormStep;

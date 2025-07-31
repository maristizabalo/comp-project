// FormStep.tsx
import { Typography } from "antd";
import FieldRenderer from "./FieldRenderer";

const { Title } = Typography;

const FormStep = ({ seccion }) => (
  <div>
    <Title level={5}>{seccion.nombre}</Title>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {seccion.campos.map((campo) => (
        <div key={campo.nombre}>
          <FieldRenderer campo={campo} />
        </div>
      ))}
    </div>
  </div>
);

export default FormStep;
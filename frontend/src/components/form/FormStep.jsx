// FormStep.tsx
import { Typography } from "antd";
import FieldRenderer from "./FieldRenderer";

const { Title } = Typography;

const FormStep = ({ seccion, form }) => (
  <div>
    <Title level={5}>{seccion.nombre}</Title>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {seccion.campos
        .slice() // Clona el array para evitar mutaciones
        .sort((a, b) => a.orden - b.orden) // Orden ascendente por 'orden'
        .map((campo) => (
          <div key={campo.nombre}>
            <FieldRenderer campo={campo} from={form}/>
          </div>
        ))}
    </div>
  </div>
);

export default FormStep;
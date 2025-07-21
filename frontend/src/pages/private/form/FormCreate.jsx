import { useState } from "react";
import { Button, Card, Typography, message } from "antd";
import FormHeader from "../../../components/form/FormHeader";
import SectionList from "../../../components/form/SectionList";

const { Title } = Typography;

const FormCreate = () => {
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    secciones: [],
  });

  const handleHeaderChange = (values) => {
    setFormData((prev) => ({ ...prev, ...values }));
  };

  const handleSectionsChange = (secciones) => {
    setFormData((prev) => ({ ...prev, secciones }));
  };

  const handleSubmit = () => {
    const payload = {
      ...formData,
      secciones: formData.secciones.map((section, index) => ({
        ...section,
        orden: index + 1,
        campos: section.campos.map((campo, idx) => ({
          ...campo,
          orden: idx + 1,
        })),
      })),
    };
    console.log(payload);
    message.success("Formulario guardado (mira la consola)");
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <Title level={3} className="text-primario mb-6">
        Crear Nuevo Formulario
      </Title>
      <FormHeader values={formData} onChange={handleHeaderChange} />
      <SectionList secciones={formData.secciones} onChange={handleSectionsChange} />
      <div className="flex justify-end mt-4">
        <Button type="primary" onClick={handleSubmit}>
          Guardar Formulario
        </Button>
      </div>
    </Card>
  );
};

export default FormCreate;

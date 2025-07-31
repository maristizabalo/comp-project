// FormEntry.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Form,
  Button,
  Steps,
  Typography,
  Divider,
  Spin,
  message,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { formService } from "../../../services/form/formService";
import FormStep from "../../../components/form/FormStep";

const { Title, Paragraph } = Typography;

const FormEntry = () => {
  const { id } = useParams();
  const [formulario, setFormulario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();

  useEffect(() => {
    const loadFormulario = async () => {
      setLoading(true);
      try {
        const data = await formService.getFormularioById(id);
        setFormulario(data);
      } catch {
        message.error("Error loading form");
      }
      setLoading(false);
    };
    loadFormulario();
  }, [id]);

  const next = async () => {
    try {
      await form.validateFields();
      setCurrentStep((prev) => prev + 1);
    } catch {
      message.warning("Please complete required fields");
    }
  };

  const prev = () => setCurrentStep((prev) => prev - 1);

  const handleSubmit = (values) => {
    const response = {
      formulario_id: id,
      respuestas: [],
    };

    formulario.secciones.forEach((seccion) => {
      seccion.campos.forEach((campo) => {
        const valor = values[campo.nombre];
        response.respuestas.push({
          campo_id: campo.id,
          valor: campo.tipo === "grupo-campos" ? valor || [] : valor ?? null,
        });
      });
    });

    console.log("Submitted:", response);
    message.success("Form submitted successfully");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />} />
      </div>
    );
  }

  if (!formulario) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <Title level={3}>{formulario.nombre}</Title>
      <Paragraph>{formulario.descripcion}</Paragraph>
      <Divider />

      <div className="flex justify-center">
        <Steps current={currentStep} className="mb-6 w-fit">
          {formulario.secciones.map((sec) => (
            <Steps.Step key={sec.nombre} title={sec.nombre} />
          ))}
        </Steps>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <FormStep seccion={formulario.secciones[currentStep]} form={form}/>

        <div className="flex justify-between mt-6">
          {currentStep > 0 && (
            <Button onClick={prev}>Previous</Button>
          )}
          {currentStep < formulario.secciones.length - 1 ? (
            <Button type="primary" onClick={next}>
              Next
            </Button>
          ) : (
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
};

export default FormEntry;

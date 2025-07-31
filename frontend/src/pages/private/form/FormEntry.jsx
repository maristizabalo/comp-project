// FormEntry.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { useFetch } from "../../../hooks/use-fetch";

const { Title, Paragraph } = Typography;

const FormEntry = () => {
  const { id } = useParams();
  const [formulario, setFormulario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { loading: loadingSubmit, fetchData: createRespuesta } = useFetch();


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

  const handleSubmit = async (values) => {
    const payload = {
      formulario: parseInt(id) ,
      respuestas_campo: [],
    };

    formulario.secciones.forEach((seccion) => {
      seccion.campos.forEach((campo) => {
        const rawValue = values[campo.nombre];

        if (campo.tipo === "grupo-campos") {
          payload.respuestas_campo.push(...(rawValue || []).map((item) => ({
            campo: campo.id,
            valor_texto: item.valor,
          })));
        } else if (campo.tipo === "geometrico") {
          payload.respuestas_campo.push({
            campo: campo.id,
            valor_geom: rawValue.valor_geom,
          });
        } else if (campo.tipo === "booleano") {
          payload.respuestas_campo.push({
            campo: campo.id,
            valor_booleano: rawValue,
          });
        } else if (campo.tipo === "numero") {
          payload.respuestas_campo.push({
            campo: campo.id,
            valor_numero: Number(rawValue),
          });
        } else if (campo.tipo === "fecha") {
          payload.respuestas_campo.push({
            campo: campo.id,
            valor_fecha: rawValue?.format("YYYY-MM-DD"),
          });
        } else if (campo.tipo === "seleccion-unica") {
          payload.respuestas_campo.push({
            campo: campo.id,
            valor_opcion: rawValue,
          });
        } else if (campo.tipo === "seleccion-multiple") {
          payload.respuestas_campo.push({
            campo: campo.id,
            valor_opciones: rawValue,
          });
        } else {
          payload.respuestas_campo.push({
            campo: campo.id,
            valor_texto: rawValue,
          });
        }
      });
    });

    try {
      await createRespuesta(() => formService.createRespuestaFormulario(payload));
      message.success("Formulario respondido correctamente");
      form.resetFields();
      navigate("/formularios");
    } catch (error) {
      message.error(error.message || "Ocurrió un error al enviar la respuesta");
    }
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
        <FormStep seccion={formulario.secciones[currentStep]} form={form} />

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

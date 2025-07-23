import { Card, Form, Button, message, Skeleton } from "antd";
import FormHeader from "../../../components/form/FormHeader";
import SectionList from "../../../components/form/SectionList";
import { useSelector } from "react-redux";
import { useFetch } from "../../../hooks/use-fetch";
import { moduleService } from "../../../services/module/moduleService";
import { useEffect } from "react";
import { formService } from "../../../services/form/formService";

const FormCreate = () => {
  const [form] = Form.useForm();

  // Fetch tipos de campo desde Redux
  const { items, loading } = useSelector((state) => state.formulario.tiposCampo);
  const tiposCamposOptions = (items || []).map((item) => ({
    label: item.nombre,
    tipo: item.tipo,
    value: item.id,
  }));

  // Fetch módulos usando hook personalizado
  // const { data: modulos, loading: loadingModulos } = useFetch(moduleService.getModulos);

  const { loading: loadingModulos, error, data: modulos, fetchData } = useFetch();


  useEffect(() => {
    fetchData(moduleService.getModulos);
  }, [fetchData]);

  const onFinish = async (values) => {
    try {
      const seccionesConOrden = (values.secciones || []).map((seccion, index) => ({
        ...seccion,
        orden: index + 1,
        campos: (seccion.campos || []).map((campo, campoIndex) => ({
          ...campo,
          nombre: campo.etiqueta,
        })),
      }));

      const payload = {
        ...values,
        secciones: seccionesConOrden,
      };
      await formService.createFormulario(payload);
      message.success("Formulario creado correctamente");
      form.resetFields(); // opcional si quieres limpiar el form
    } catch (error) {
      console.error("❌ Error al crear formulario:", error.message);
      message.error(error.message);
    }
  };


  if (loading || loadingModulos) return <Skeleton active />;

  return (
    <Card>
      <Form form={form} layout="vertical" onFinish={onFinish} className="flex flex-col gap-6">
        <FormHeader form={form} modulos={modulos || []} />
        <SectionList tiposCamposOptions={tiposCamposOptions} />
        <div className="flex justify-end">
          <Button type="primary" htmlType="submit">
            Guardar formulario
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default FormCreate;

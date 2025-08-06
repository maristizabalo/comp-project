// src/pages/form/FormCreate.jsx
import { Card, Form, Button, message, Skeleton } from "antd";
import FormHeader from "../../../components/form/FormHeader";
import SectionList from "../../../components/form/SectionList";
import { useSelector } from "react-redux";
import { useFetch } from "../../../hooks/use-fetch";
import { moduleService } from "../../../services/module/moduleService";
import { useEffect, useMemo } from "react";
import { formService } from "../../../services/form/formService";
import { normalizeFormularioCreatePayload } from "../../../utils/normalizeFormulario";

const FormCreate = () => {
  const [form] = Form.useForm();

  const { items: tiposCampoRaw, loading: loadingTipos } = useSelector(
    (state) => state.formulario.tiposCampo
  );

  const tiposCamposOptions = useMemo(() => {
    return (tiposCampoRaw || []).map((item) => ({
      label: item.nombre,
      tipo: item.tipo,
      value: item.id,
    }));
  }, [tiposCampoRaw]);

  const { loading: loadingModulos, data: s, fetchData } = useFetch();

  useEffect(() => {
    fetchData(moduleService.getModulos);
  }, [fetchData]);

  const onFinish = async (values) => {
    try {
      const payload = normalizeFormularioCreatePayload(values);
      await formService.createFormulario(payload);
      message.success("Formulario creado correctamente");
      form.resetFields();
    } catch (error) {
      console.error("❌ Error al crear formulario:", error.message);
      message.error(error.message || "Error al guardar el formulario");
    }
  };

  if (loadingTipos || loadingModulos) return <Skeleton active />;

  return (
    <Card className="bg-white shadow-md rounded-xl p-6">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="flex flex-col gap-6"
      >
        <FormHeader form={form} s={s || []} />
        <SectionList tiposCamposOptions={tiposCamposOptions} />
        <div className="flex justify-end">
          <Button type="primary" htmlType="submit" size="large">
            Guardar formulario
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default FormCreate;

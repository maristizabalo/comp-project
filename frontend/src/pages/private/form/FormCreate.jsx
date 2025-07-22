import { Card, Form, Button, message } from "antd";
import FormHeader from "../../../components/form/FormHeader"
import SectionList from "../../../components/form/SectionList"

const tiposCamposOptions = [
  { label: "Texto", value: "text" },
  { label: "Número", value: "number" },
  { label: "Fecha", value: "date" },
  { label: "Select", value: "select" },
];

const FormCreate = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log("🚀 Data al Backend:", values);
    message.success("Formulario creado correctamente");
  };

  return (
    <Card className="">
      <Form form={form} layout="vertical" onFinish={onFinish} className="flex flex-col gap-6">
        <FormHeader form={form} />
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

import { Button, Form } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import SectionItem from "./SectionItem";

const SectionList = ({ tiposCamposOptions }) => {
  const form = Form.useFormInstance();
  const secciones = Form.useWatch("secciones", form) || [];

  const mainCount = secciones?.flatMap((categoria) => categoria?.campos || [])
    .filter((c) => c?.principal).length || 0;

  return (
    <Form.List name="secciones">
      {(fields, { add, remove }) => (
        <>
          {fields.map((section) => (
            <SectionItem
              key={section.key}
              section={section}
              remove={remove}
              tiposCamposOptions={tiposCamposOptions}
              mainCount={mainCount}
            />
          ))}
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => add()}
            className="w-w-full mt-2 text-green-900 border-green-500 bg-green-50 hover:bg-green-100 hover:!border-green-900"
          >
            Añadir sección
          </Button>
        </>
      )}
    </Form.List>
  );
};

export default SectionList;

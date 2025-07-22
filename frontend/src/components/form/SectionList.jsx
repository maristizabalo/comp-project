import { Button, Form } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import SectionItem from "./SectionItem";

const SectionList = ({ tiposCamposOptions }) => {
  const form = Form.useFormInstance();
  const secciones = Form.useWatch("secciones", form) || [];

  const mainCount = secciones?.flatMap((s) => s?.campos || [])
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
            className="w-full"
          >
            Añadir sección
          </Button>
        </>
      )}
    </Form.List>
  );
};

export default SectionList;

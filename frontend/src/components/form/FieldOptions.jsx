import { Form, Input, Button, Space } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

const FieldOptions = ({ field }) => (
  <div className="pl-3">
    <Form.List name={[field.name, "opciones"]}>
      {(options, { add, remove }) => (
        <div className="flex flex-col gap-2">
          {options.map((opt) => (
            <Space key={opt.key} align="start" className="w-full">
              <Form.Item name={[opt.name, "valor"]} className="!mb-0 flex-1">
                <Input size="small" placeholder="Valor" />
              </Form.Item>
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => remove(opt.name)}
              />
            </Space>
          ))}
          <Button
            type="dashed"
            size="small"
            onClick={() => add()}
            icon={<PlusOutlined />}
            className="w-fit text-green-700 border-green-300 bg-green-50 hover:!border-green-500"
          >
            Añadir opción
          </Button>
        </div>
      )}
    </Form.List>
  </div>
);

export default FieldOptions;

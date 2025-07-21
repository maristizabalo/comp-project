import { Input, Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

const FieldItem = ({ field, onChange, onRemove }) => {
  return (
    <div className="flex items-center gap-4">
      <Input
        placeholder="Etiqueta del campo"
        value={field.etiqueta}
        onChange={(e) => onChange({ ...field, etiqueta: e.target.value })}
        className="flex-1"
      />
      <Button icon={<DeleteOutlined />} danger onClick={onRemove} />
    </div>
  );
};

export default FieldItem;

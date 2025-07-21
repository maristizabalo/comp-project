import { Input, Button, Typography, Divider } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import FieldItem from "./FieldItem";

const { Title } = Typography;

const SectionItem = ({ section, index, onUpdate, onRemove }) => {
  const updateField = (fieldIndex, updatedField) => {
    const newCampos = [...section.campos];
    newCampos[fieldIndex] = updatedField;
    onUpdate({ ...section, campos: newCampos });
  };

  const addField = () => {
    onUpdate({
      ...section,
      campos: [...(section.campos || []), { etiqueta: "" }],
    });
  };

  const removeField = (fieldIndex) => {
    onUpdate({
      ...section,
      campos: section.campos.filter((_, idx) => idx !== fieldIndex),
    });
  };

  return (
    <div className="border rounded-xl p-4 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder={`Nombre de la sección #${index + 1}`}
          value={section.nombre}
          onChange={(e) => onUpdate({ ...section, nombre: e.target.value })}
          className="w-3/4"
        />
        <Button icon={<DeleteOutlined />} danger onClick={onRemove} />
      </div>

      <Divider>Campos</Divider>
      <div className="flex flex-col gap-4">
        {section.campos?.map((campo, idx) => (
          <FieldItem
            key={idx}
            field={campo}
            onChange={(updated) => updateField(idx, updated)}
            onRemove={() => removeField(idx)}
          />
        ))}
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={addField}
          className="self-start"
        >
          Añadir Campo
        </Button>
      </div>
    </div>
  );
};

export default SectionItem;

import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import SectionItem from "./SectionItem";

const SectionList = ({ secciones, onChange }) => {
  const addSection = () => {
    onChange([
      ...secciones,
      { nombre: "", campos: [] },
    ]);
  };

  const updateSection = (index, updated) => {
    const updatedSections = [...secciones];
    updatedSections[index] = updated;
    onChange(updatedSections);
  };

  const removeSection = (index) => {
    const updatedSections = secciones.filter((_, idx) => idx !== index);
    onChange(updatedSections);
  };

  return (
    <div className="flex flex-col gap-6">
      {secciones.map((section, index) => (
        <SectionItem
          key={index}
          section={section}
          index={index}
          onUpdate={(updated) => updateSection(index, updated)}
          onRemove={() => removeSection(index)}
        />
      ))}
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={addSection}
        className="self-center w-60"
      >
        Añadir Sección
      </Button>
    </div>
  );
};

export default SectionList;

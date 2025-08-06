import { useEffect, useState } from "react";
import { Button, Empty, Input, Skeleton, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import { useFetch } from "../../../hooks/use-fetch";
import { formService } from "../../../services/form/formService";

const { Title, Paragraph, Text } = Typography;

const FormList = () => {
  const navigate = useNavigate();
  const { loading, error, data: formularios, fetchData } = useFetch();
  const [filteredFormularios, setFilteredFormularios] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    fetchData(formService.getFormularios);
  }, [fetchData]);

  useEffect(() => {
    if (formularios) {
      setFilteredFormularios(formularios);
    }
  }, [formularios]);

  useEffect(() => {
    if (!searchValue) {
      setFilteredFormularios(formularios);
      return;
    }
    const lowerValue = searchValue.toLowerCase();
    const filtered = formularios?.filter(
      (formulario) =>
        formulario.nombre.toLowerCase().includes(lowerValue) ||
        formulario.categoria?.nombre.toLowerCase().includes(lowerValue)
    );
    setFilteredFormularios(filtered);
  }, [searchValue, formularios]);

  const groupedByModulo = filteredFormularios?.reduce((acc, formulario) => {
    const Nombre = formulario.categoria?.nombre || "Sin módulo";
    if (!acc[Nombre]) {
      acc[Nombre] = [];
    }
    acc[Nombre].push(formulario);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/formularios/crear")}
        >
          Nuevo Formulario
        </Button>
      </div>

      <Input
        placeholder="Buscar por formulario o módulo..."
        allowClear
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />

      {loading && <Skeleton active />}
      {error && <Paragraph type="danger">{error}</Paragraph>}

      {!loading && !error && (!filteredFormularios || filteredFormularios.length === 0) && (
        <Empty description="No hay formularios registrados" />
      )}

      <div className="flex flex-col gap-8">
        {!loading &&
          !error &&
          groupedByModulo &&
          Object.entries(groupedByModulo).map(([categoria, formularios]) => (
            <div key={categoria} className="flex flex-col gap-4">
              <div className="flex flex-col">
                <Title level={4} className="!mb-0 !text-primario">{categoria}</Title>
                <Paragraph className="text-gray-400 !mb-2">
                  Total: {formularios.length} formularios
                </Paragraph>

                <div className="flex flex-col gap-4">
                  {formularios.map((formulario) => (
                    <div
                      key={formulario.id}
                      className="border border-gray-200 rounded-xl shadow-sm bg-white p-4 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                      <div className="flex flex-col gap-1">
                        <Text className="font-semibold text-lg">{formulario.nombre}</Text>
                        <Paragraph className="text-gray-500 text-sm !mb-1">{formulario.descripcion}</Paragraph>
                        <Paragraph className="text-gray-400 text-xs !mb-0">
                          Creado por: {formulario.usuarioCreo}
                        </Paragraph>
                      </div>

                      <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                        <Button onClick={() => navigate(`/formularios/diligenciar/${formulario.id}`)}>
                          Diligenciar
                        </Button>
                        <Button
                          type="default"
                          onClick={() => navigate(`/formularios/respuestas/${formulario.id}`)}
                        >
                          Ver respuestas
                        </Button>
                        <Button
                          icon={<EditOutlined />}
                          onClick={() => navigate(`/formularios/editar/${formulario.id}`)}
                          type="primary"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default FormList;

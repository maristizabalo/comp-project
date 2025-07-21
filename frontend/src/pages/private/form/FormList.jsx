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
        formulario.modulo?.nombre.toLowerCase().includes(lowerValue)
    );
    setFilteredFormularios(filtered);
  }, [searchValue, formularios]);

  const groupedByModulo = filteredFormularios?.reduce((acc, formulario) => {
    const moduloNombre = formulario.modulo?.nombre || "Sin módulo";
    if (!acc[moduloNombre]) {
      acc[moduloNombre] = [];
    }
    acc[moduloNombre].push(formulario);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/formularios/crear")}>
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
          Object.entries(groupedByModulo).map(([modulo, formularios]) => (
            <div key={modulo} className="flex flex-col gap-4">
              <div className="flex flex-col">
                <Title level={4} className="!mb-0 !text-primario">{modulo}</Title>
                <Paragraph className="text-gray-400 !mb-2">Total: {formularios.length} formularios</Paragraph>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {formularios.map((formulario) => (
                    <div key={formulario.id} className="relative rounded-xl shadow-md bg-white p-4 hover:shadow-lg transition-all">
                      <Button
                        icon={<EditOutlined />}
                        shape="circle"
                        size="small"
                        className="absolute right-3 top-3 z-10"
                        onClick={() => navigate(`/formularios/editar/${formulario.id}`)}
                      />
                      <div className="flex flex-col gap-2">
                        <Text className="font-semibold text-base">{formulario.nombre}</Text>
                        <Paragraph className="text-gray-500 text-sm !mb-1">{formulario.descripcion}</Paragraph>
                        <Paragraph className="text-gray-400 text-xs !mb-0">
                          Creado por: {formulario.usuarioCreo}
                        </Paragraph>
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

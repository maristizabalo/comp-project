import { Card, Typography, message, Skeleton } from "antd";
import { useNavigate } from "react-router-dom";
import { useFetch } from "../../../hooks/use-fetch";
import { useEffect } from "react";
import { moduleService } from "../../../services/module/moduleService";
import { categoryService } from "../../../services/category/categoryService";
import ModuleForm from "../../../components/module/ModuleForm";

const { Title } = Typography;

const ModuleCreate = () => {
  const navigate = useNavigate();
  const { data: categorias, loading: loadingCategorias, fetchData: fetchCategorias } = useFetch();
  const { loading: loadingCreate, fetchData: createModulo } = useFetch();

  useEffect(() => {
    fetchCategorias(categoryService.getCategorias);
  }, [fetchCategorias]);

  const handleFinish = async (values) => {
    try {
      await createModulo(() => moduleService.createModulo(values));
      message.success("Módulo creado correctamente");
      navigate("/modulos");
    } catch (error) {
      message.error(error.message || "Ocurrió un error al crear el módulo");
    }
  };

  if (loadingCategorias) return <Skeleton active />;

  return (
    <Card className="max-w-xl mx-auto">
      <Title level={3} className="text-primario mb-6">Crear Módulo</Title>
      <ModuleForm categorias={categorias || []} onFinish={handleFinish} loadingSubmit={loadingCreate} />
    </Card>
  );
};

export default ModuleCreate;

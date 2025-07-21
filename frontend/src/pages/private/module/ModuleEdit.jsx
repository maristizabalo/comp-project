import { Card, Typography, Skeleton, message } from "antd";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFetch } from "../../../hooks/use-fetch";
import { categoryService } from "../../../services/category/categoryService";
import { moduleService } from "../../../services/module/moduleService";
import ModuleForm from "../../../components/module/ModuleForm";

const { Title } = Typography;

const ModuleEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: modulo, loading: loadingModulo, fetchData: fetchModulo } = useFetch();
  const { data: categorias, loading: loadingCategorias, fetchData: fetchCategorias } = useFetch();
  const { loading: loadingUpdate, fetchData: updateModulo } = useFetch();

  useEffect(() => {
    fetchModulo(() => moduleService.getModuloById(id));
    fetchCategorias(categoryService.getCategorias);
  }, [id, fetchModulo, fetchCategorias]);

  const handleFinish = async (values) => {
    try {
      await updateModulo(() => moduleService.updateModulo(id, values));
      message.success("Módulo actualizado correctamente");
      navigate("/modulos");
    } catch (error) {
      message.error(error.message || "Ocurrió un error al actualizar el módulo");
    }
  };

  if (loadingModulo || loadingCategorias) return <Skeleton active />;

  return (
    <Card className="max-w-xl mx-auto">
      <Title level={3} className="text-primario mb-6">Editar Módulo</Title>
      <ModuleForm
        categorias={categorias || []}
        onFinish={handleFinish}
        loadingSubmit={loadingUpdate}
        initialValues={{
          nombre: modulo?.nombre,
          descripcion: modulo?.descripcion,
          categoria_id: modulo?.categoria?.id,
        }}
      />
    </Card>
  );
};

export default ModuleEdit;

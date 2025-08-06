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
  const { data: categoria, loading: loadingCategoria, fetchData: fetchCategoria } = useFetch();
  const { data: categorias, loading: loadingCategorias, fetchData: fetchCategorias } = useFetch();
  const { loading: loadingUpdate, fetchData: updateCategoria } = useFetch();

  useEffect(() => {
    fetchCategoria(() => moduleService.getCategoriaById(id));
    fetchCategorias(categoryService.getCategorias);
  }, [id, fetchCategoria, fetchCategorias]);

  const handleFinish = async (values) => {
    try {
      await updateCategoria(() => moduleService.updateCategoria(id, values));
      message.success("Módulo actualizado correctamente");
      navigate("/categoria");
    } catch (error) {
      message.error(error.message || "Ocurrió un error al actualizar el módulo");
    }
  };

  if (loadingCategoria || loadingCategorias) return <Skeleton active />;

  return (
    <Card className="max-w-xl mx-auto">
      <Title level={3} className="text-primario mb-6">Editar Módulo</Title>
      <ModuleForm
        categorias={categorias || []}
        onFinish={handleFinish}
        loadingSubmit={loadingUpdate}
        initialValues={{
          nombre: categoria?.nombre,
          descripcion: categoria?.descripcion,
          categoria_id: categoria?.categoria?.id,
        }}
      />
    </Card>
  );
};

export default ModuleEdit;

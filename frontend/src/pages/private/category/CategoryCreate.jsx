import { Card, Typography, message, Skeleton, Form } from "antd";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useFetch } from "../../../hooks/use-fetch";
import { areaService } from "../../../services/admin/area";
import { categoryService } from "../../../services/category/categoryService";
import CategoryForm from "../../../components/category/CategoryForm";

const { Title } = Typography;

const CategoryCreate = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const { loading: loadingAreas, data: areas, fetchData: fetchAreas } = useFetch();

  useEffect(() => {
    fetchAreas(areaService.getAreas);
  }, [fetchAreas]);

  const handleFinish = async (values) => {
    setSaving(true);
    try {
      await categoryService.createCategoria(values);
      message.success("Categoría creada correctamente");
      navigate("/categorias");
    } catch (error) {
      message.error(error.message || "Ocurrió un error al crear la categoría");
    } finally {
      setSaving(false);
    }
  };

  if (loadingAreas) return <Skeleton active />;

  return (
    <Card className="max-w-xl mx-auto">
      <Title level={3} className="text-primario mb-6">Nueva Categoría</Title>
      <CategoryForm
        form={form}
        onFinish={handleFinish}
        areasOptions={areas || []}
        loadingAreas={loadingAreas}
        loadingSubmit={saving}
      />
    </Card>
  );
};

export default CategoryCreate;

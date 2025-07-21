import { Card, Typography, Skeleton, message, Form } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useFetch } from "../../../hooks/use-fetch";
import { areaService } from "../../../services/admin/area";
import { categoryService } from "../../../services/category/categoryService";
import CategoryForm from "../../../components/category/CategoryForm";

const { Title } = Typography;

const CategoryEdit = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const { loading: loadingCategoria, data: categoria, fetchData: fetchCategoria } = useFetch();
  const { loading: loadingAreas, data: areas, fetchData: fetchAreas } = useFetch();

  useEffect(() => {
    fetchCategoria(() => categoryService.getCategoriaById(id));
    fetchAreas(areaService.getAreas);
  }, [id, fetchCategoria, fetchAreas]);

  const handleFinish = async (values) => {
    setSaving(true);
    try {
      await categoryService.updateCategoria(id, values);
      message.success("Categoría actualizada correctamente");
      navigate("/categorias");
    } catch (error) {
      message.error(error.message || "Ocurrió un error al actualizar la categoría");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (categoria) {
      form.setFieldsValue({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        area_id: categoria.area?.id,
      });
    }
  }, [categoria, form]);

  if (loadingCategoria || loadingAreas) return <Skeleton active />;

  return (
    <Card className="max-w-xl mx-auto">
      <Title level={3} className="text-primario mb-6">Editar Categoría</Title>
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

export default CategoryEdit;

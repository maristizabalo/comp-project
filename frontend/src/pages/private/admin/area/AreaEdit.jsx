import { Form, message, Spin } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { areaService } from "../../../../services/admin/area";
import AreaForm from "../../../../components/admin/area/AreaForm";
import { useFetch } from "../../../../hooks/use-fetch";
import { useEffect } from "react";

const AreaEdit = () => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();

  const { fetchData: fetchAreaById, data: area, loading } = useFetch();
  const { fetchData: updateArea, loading: loadingSubmit } = useFetch();

  useEffect(() => {
    fetchAreaById(areaService.getAreaById, id);
  }, [fetchAreaById, id]);

  useEffect(() => {
    if (area) {
      form.setFieldsValue({
        nombre: area.nombre,
        siglas: area.siglas,
      });
    }
  }, [area, form]);

  const onFinish = async (values) => {
    try {
      await updateArea(areaService.updateArea, id, values);
      message.success("Área actualizada correctamente.");
      navigate("/areas");
    } catch (err) {
      message.error(err.message);
    }
  };

  if (loading || !area) {
    return (
      <div className="h-64 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-md w-full mx-auto max-w-4xl">
      <AreaForm
        form={form}
        onFinish={onFinish}
        loadingSubmit={loadingSubmit}
        initialValues={area}
      />
    </div>
  );
};

export default AreaEdit;

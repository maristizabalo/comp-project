import { Form, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useFetch } from "../../../../hooks/use-fetch";
import { areaService } from "../../../../services/admin/area";
import AreaForm from "../../../../components/admin/area/AreaForm";

const AreaCreate = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { fetchData: createArea, loading: loadingSubmit } = useFetch();

  const onFinish = async (values) => {
    try {
      await createArea(areaService.createArea, values);
      message.success("Área creada correctamente.");
      navigate("/areas");
    } catch (err) {
      message.error(err.message);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md w-full mx-auto max-w-4xl">
      <AreaForm form={form} onFinish={onFinish} loadingSubmit={loadingSubmit} />
    </div>
  );
};

export default AreaCreate;

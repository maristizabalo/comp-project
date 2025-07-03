import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { logout } from "../../store/auth/authSlice";

export const LogoutButton = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Button
      type="text"
      icon={<LogoutOutlined />}
      onClick={handleLogout}
      className="bg-slate-50 w-full text-left text-primario hover:bg-gray-200 hover:text-secundario px-5 py-2 mt-2"
    >
      Cerrar sesión
    </Button>
  );
};

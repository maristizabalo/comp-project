import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  FolderOpenOutlined,
  FormOutlined,
  FileSearchOutlined,
  SafetyOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate } from "react-router";
import logo_alcaldia from "../../assets/img/logo_alcaldia_mayor_bogota.svg";
import logo_dadep from "../../assets/img/logo_dadep_wh.svg";
import logo_bogota from "../../assets/img/logo_bogota_wh.svg";
import { useState } from "react";

const { Sider, Content } = Layout;

const AppLayout = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      console.log("Cerrando sesión...");
      return;
    }
    navigate(key);
  };

  const items = [
    {
      key: "/inicio",
      icon: <DashboardOutlined />,
      label: "Inicio",
    },
    {
      type: "group",
      label: "Gestión de Formularios",
      children: [
        {
          key: "/modulos",
          icon: <AppstoreOutlined />,
          label: "Módulos",
        },
        {
          key: "/categorias",
          icon: <FolderOpenOutlined />,
          label: "Categorías",
        },
        {
          key: "/formularios",
          icon: <FormOutlined />,
          label: "Formularios",
        },
        {
          key: "/respuestas",
          icon: <FileSearchOutlined />,
          label: "Respuestas",
        },
      ],
    },
    {
      type: "group",
      label: "Administración",
      children: [
        {
          key: "/usuarios",
          icon: <UserOutlined />,
          label: "Usuarios",
        },
        {
          key: "/roles",
          icon: <SafetyOutlined />,
          label: "Roles y Permisos",
        },
        {
          key: "/areas",
          icon: <ApartmentOutlined />,
          label: "Áreas",
        },
      ],
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Cerrar sesión",
    },
  ];

  return (
    <Layout className="min-h-screen">
      {/* SIDEBAR */}
      <Sider
        width={240}
        className="bg-[#E80B2C] shadow-xl fixed h-screen z-50"
        breakpoint="lg"
        collapsedWidth="0"
        onBreakpoint={(broken) => setCollapsed(broken)}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div className="h-16 flex items-center justify-center text-white font-bold text-lg tracking-wide border-b border-white/20 shadow-inner">
          COMPLEMENTARIOS
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["/inicio"]}
          onClick={handleMenuClick}
          className="!bg-[#E80B2C] [&_.ant-menu-item]:!text-white [&_.ant-menu-item-selected]:!bg-white/20 [&_.ant-menu-item:hover]:!bg-white/10"
          items={items}
        />
        <div className="absolute bottom-4 left-0 w-full flex justify-center gap-4 px-4">
          <img
            src={logo_alcaldia}
            alt="Logo Alcaldía"
            className="h-8 object-contain"
          />
          <img
            src={logo_dadep}
            alt="Logo DADEP"
            className="h-8 object-contain"
          />
          <img
            src={logo_bogota}
            alt="Logo Bogotá"
            className="h-8 object-contain"
          />
        </div>
      </Sider>

      {/* CONTENIDO */}
      <Layout
        className={`bg-[#f5f6fa] transition-all duration-300 ${
          !collapsed ? "ml-[240px]" : ""
        }`}
      >
        <Content className="p-6">
          <div className="bg-white shadow-md rounded-xl p-6 min-h-[85vh]">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;

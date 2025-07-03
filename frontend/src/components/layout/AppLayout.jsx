import { Button, Layout, Menu } from "antd";
import {
  HomeOutlined,
  UserOutlined,
  BellOutlined,
  SettingOutlined,
  AppstoreOutlined,
  FolderOpenOutlined,
  FormOutlined,
  FileSearchOutlined,
  SafetyOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import logo_alcaldia from "../../assets/img/logo_alcaldia_mayor_bogota.svg";
import logo_dadep from "../../assets/img/logo_dadep_wh.svg";
import logo_bogota from "../../assets/img/logo_bogota_wh.svg";
import { useState } from "react";
import { LogoutButton } from "./LogoutButton";

const { Sider, Header, Content } = Layout;

const AppLayout = ({ children }) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  // para obtener la ruta actual
  const location = useLocation();

  // definir los títulos de las rutas
  const routeTitles = {
    "/inicio": "Inicio",
    "/modulos": "Módulos",
    "/categorias": "Categorías",
    "/formularios": "Formularios",
    "/respuestas": "Respuestas",
    "/usuarios": "Usuarios",
    "/roles": "Roles y Permisos",
    "/areas": "Áreas",
  };

  const currentTitle = routeTitles[location.pathname] || "";

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const items = [
    {
      key: "/inicio",
      icon: <HomeOutlined />,
      label: "Inicio",
    },
    {
      type: "group",
      label: "Gestión de Formularios",
      children: [
        {
          key: "/categorias",
          icon: <FolderOpenOutlined />,
          label: "Categorías",
        },
        {
          key: "/modulos",
          icon: <AppstoreOutlined />,
          label: "Módulos",
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
        <div className="h-16 flex items-center justify-center text-white font-extrabold text-2xl tracking-wide border-b border-white/20 shadow-inner">
          COMPLEMENTARIOS
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["/inicio"]}
          onClick={handleMenuClick}
          className="!bg-[#E80B2C]
          [&_.ant-menu-item]:!text-white
          [&_.ant-menu-item]:!font-semibold
          [&_.ant-menu-item-selected]:!bg-white/20
          [&_.ant-menu-item:hover]:!bg-white/10
          [&_.ant-menu-item-selected]:!font-bold
          [&_.ant-menu-item-group-title]:!text-white/70 !text-sm !font-semibold"
          items={items}
        />
        <div className="mt-4 px-4">
          <LogoutButton />
        </div>
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
        <Header className="bg-transparent px-2 mx-10 mt-6 flex items-center justify-between">
          {/* Título dinámico */}
          <div className="text-3xl font-semibold text-primario">
            {currentTitle}
          </div>

          {/* Botones flotantes */}
          <div className="flex gap-2 items-center">
            <Button
              shape="circle"
              size="large"
              icon={<UserOutlined />}
              className="bg-white shadow-md hover:bg-gray-100"
            />
            <Button
              shape="circle"
              size="large"
              icon={<BellOutlined />}
              className="bg-white shadow-md hover:bg-gray-100"
            />
            <Button
              shape="circle"
              size="large"
              icon={<SettingOutlined />}
              className="bg-white shadow-md hover:bg-gray-100"
            />
          </div>
        </Header>
        <Content className="p-6">
          <div className="bg-transparent p-6 min-h-[85vh]">{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;

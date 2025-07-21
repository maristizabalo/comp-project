import { Button, Layout, Menu } from "antd";
import {
  HomeOutlined,
  UserOutlined,
  BellOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import logo_alcaldia from "../../assets/img/logo_alcaldia.svg";
import logo_dadep from "../../assets/img/logo_dadep.svg";
import logo_bogota from "../../assets/img/logo_bogota.svg";
import React, { useState } from "react";
import { LogoutButton } from "./LogoutButton";
import { useSelector } from "react-redux";
import { filterRoutesByPermissions } from "../../utils/filterRoutesByPermissions";
import { appRoutes } from "../../utils/routesConfig";

const { Sider, Header, Content } = Layout;

const AppLayout = ({ children }) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const routeTitles = {
    "/inicio": "Inicio",

    "/usuarios": "Lista de usuarios",
    "/usuarios/crear": "Creación de usuario",
    "/usuarios/editar/": "Edición de usuario",

    "/roles": "Lista de roles y permisos",
    "/roles/crear": "Creación de rol",
    "/roles/editar/": "Edición de rol",

    "/areas": "Áreas",
    "/areas/crear": "Creación de área",
    "/areas/editar/": "Edición de área",

    "/categorias": "Categorías",
    "/categorias/crear": "Creación de categoría",
    "/categorias/editar/": "Edición de categoría",

    "/modulos": "Módulos",
    "/modulos/crear": "Creación de módulo",
    "/modulos/editar/": "Edición de módulo",

    "/formularios": "Formularios",
    
    "/respuestas": "Respuestas",
  };

  const getTitleFromPath = (path) => {
    const sortedKeys = Object.keys(routeTitles).sort((a, b) => b.length - a.length);
    const match = sortedKeys.find((key) => path.startsWith(key));
    return routeTitles[match] || "";
  };

  const currentTitle = getTitleFromPath(location.pathname);

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const userPermissions = useSelector((state) => state.auth.user?.permisos || []);
  const filteredRoutes = filterRoutesByPermissions(appRoutes, userPermissions);

  const filterVisibleMenuRoutes = (routes) => {
    return routes
      .map((route) => {
        if (route.children) {
          const visibleChildren = route.children.filter(
            (child) => !child.key.includes("/crear") && !child.key.includes("/editar")
          );
          if (visibleChildren.length > 0) {
            return { ...route, children: visibleChildren };
          }
          return null;
        }
        return route;
      })
      .filter(Boolean);
  };

  const transformToAntdMenuItems = (routes) => {
    return routes.map((route) => {
      if (route.children) {
        return {
          type: "group",
          label: route.label,
          children: route.children.map((child) => ({
            key: child.key,
            icon: child.icon ? React.createElement(child.icon) : null,
            label: child.label,
          })),
        };
      }

      return {
        key: route.key,
        icon: route.icon ? React.createElement(route.icon) : null,
        label: route.label,
      };
    });
  };

  const visibleMenuRoutes = filterVisibleMenuRoutes(filteredRoutes);
  const items = transformToAntdMenuItems(visibleMenuRoutes);

  return (
    <Layout className="min-h-screen">
      <Sider
        width={240}
        className="bg-[#E80B2C] shadow-xl fixed h-screen z-50"
        breakpoint="lg"
        collapsedWidth="0"
        onBreakpoint={(broken) => setCollapsed(broken)}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div className="h-16 flex items-center justify-center text-black font-extrabold text-2xl tracking-wide border-b border-white/20 shadow-inner">
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
          <img src={logo_alcaldia} alt="Logo Alcaldía" className="h-8 object-contain" />
          <img src={logo_dadep} alt="Logo DADEP" className="h-8 object-contain" />
          <img src={logo_bogota} alt="Logo Bogotá" className="h-8 object-contain" />
        </div>
      </Sider>

      <Layout
        className={`bg-[#f5f6fa] transition-all duration-300 ${!collapsed ? "ml-[240px]" : ""}`}
      >
        <Header className="bg-transparent px-2 mx-10 mt-6 flex items-center justify-between">
          <div className="text-3xl font-semibold text-primario">{currentTitle}</div>

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
        <Content className="px-6">
          <div className="bg-transparent p-6 min-h-[85vh]">
            {children || <Outlet />}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;

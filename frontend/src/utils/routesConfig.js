import {
  HomeOutlined,
  UserOutlined,
  SafetyOutlined,
  ApartmentOutlined,
  AppstoreOutlined,
  FolderOpenOutlined,
  FormOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";

export const appRoutes = [
  {
    key: "/inicio",
    label: "Inicio",
    icon: HomeOutlined,
    permission: null,
  },
  {
    label: "Gestión de Formularios",
    children: [
      {
        key: "/categorias",
        label: "Categorías",
        icon: FolderOpenOutlined,
        permission: "ADMIN_CATEGORIA",
      },
      {
        key: "/formularios",
        label: "Formularios",
        icon: FormOutlined,
        permission: "ADMIN_FORMULARIO",
      },
      {
        key: "/respuestas",
        label: "Respuestas",
        icon: FileSearchOutlined,
        permission: "ADMIN_FORMULARIO",
      },
    ],
  },
  {
    label: "Administración",
    children: [
      {
        key: "/usuarios",
        label: "Usuarios",
        icon: UserOutlined,
        permission: "ADMIN_USUARIO",
      },
      {
        key: "/usuarios/crear",
        label: "Crear Usuario",
        permission: "ADMIN_USUARIO",
      },
      {
        key: "/usuarios/editar/:id",
        label: "Editar Usuario",
        permission: "ADMIN_USUARIO",
      },
      {
        key: "/roles",
        label: "Roles y Permisos",
        icon: SafetyOutlined,
        permission: "ADMIN_ROL_Y_PERMISO",
      },
      {
        key: "/roles/crear",
        label: "Crear Rol",
        permission: "ADMIN_ROL_Y_PERMISO",
      },
      {
        key: "/roles/editar/:id",
        label: "Editar Rol",
        permission: "ADMIN_ROL_Y_PERMISO",
      },
      {
        key: "/areas",
        label: "Áreas",
        icon: ApartmentOutlined,
        permission: "ADMIN_AREA",
      },
      {
        key: "/areas/crear",
        label: "Crear Área",
        permission: "ADMIN_AREA",
      },
      {
        key: "/areas/editar/:id",
        label: "Editar Área",
        permission: "ADMIN_AREA",
      },
    ],
  },
];

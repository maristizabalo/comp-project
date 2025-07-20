import { useState } from "react";
import { message } from "antd";
import RolesTable from "../../../../components/admin/rol/RolesTable";
import RoleDetailsDrawer from "../../../../components/admin/rol/RoleDetailsDrawer";
import RoleFormModal from "../../../../components/admin/rol/RoleFormModal";
import { useRolesPermissions } from "../../../../hooks/useRolesPermissions";

const RolesPermissionsPage = () => {
  const { roles, reloadRoles } = useRolesPermissions();
  const [selectedRole, setSelectedRole] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleViewDetails = (role) => {
    setSelectedRole(role);
    setDrawerOpen(true);
  };

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setModalOpen(true);
  };

  const handleDeactivateRole = async (role) => {
    try {
      await someService.deactivateRole(role.id);
      message.success(`Rol ${role.nombre} desactivado correctamente.`);
      reloadRoles();
    } catch (error) {
      message.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Administración de Roles</h1>

      <RolesTable
        roles={roles}
        onViewDetails={handleViewDetails}
        onEditRole={handleEditRole}
        onDeactivateRole={handleDeactivateRole}
      />

      <RoleDetailsDrawer 
        role={selectedRole}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      <RoleFormModal
        role={selectedRole}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          reloadRoles();
        }}
      />
    </div>
  );
};

export default RolesPermissionsPage;

import { PERMISOS_ADMIN } from "./constants";

export function filterRoutesByPermissions(routes, userPermissions = []) {
    const permissionById = Object.entries(PERMISOS_ADMIN).reduce((acc, [key, value]) => {
        acc[value] = key;
        return acc;
    }, {});

    const userPermissionsStrings = userPermissions.map((p) => permissionById[p]);

    return routes
        .map((route) => {
            if (route.children) {
                const filteredChildren = route.children.filter(
                    (child) =>
                        !child.permission || userPermissionsStrings.includes(child.permission)
                );
                if (filteredChildren.length > 0) {
                    return { ...route, children: filteredChildren };
                }
                return null;
            }

            if (!route.permission || userPermissionsStrings.includes(route.permission)) {
                return route;
            }
            return null;
        })
        .filter(Boolean);
}

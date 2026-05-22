import { usePage } from "@inertiajs/react";
import { useCallback, useMemo } from "react";

export const useRolePermissions = () => {
    /* ------------------------------------------------------------------
     | Page Props
     * ------------------------------------------------------------------ */
    const { auth } = usePage().props;
    const user = auth?.user ?? {};

    /* ------------------------------------------------------------------
     | Normalized Data
     * ------------------------------------------------------------------ */
    const roles = useMemo(() => user.roles ?? [], [user.roles]);

    const directPermissions = useMemo(
        () => user.permissions ?? [],
        [user.permissions],
    );

    /* ------------------------------------------------------------------
     | Role Checks
     * ------------------------------------------------------------------ */

    // Check single role
    const hasRole = useCallback(
        (roleName) => roles.some((role) => role?.name === roleName),
        [roles],
    );

    // Check multiple roles
    const hasAnyRole = useCallback(
        (roleNames = []) =>
            roles.some((role) => roleNames.includes(role?.name)),
        [roles],
    );

    // Check if user has all roles
    const hasAllRoles = useCallback(
        (roleNames = []) =>
            roleNames.every((roleName) =>
                roles.some((role) => role?.name === roleName),
            ),
        [roles],
    );

    /* ------------------------------------------------------------------
     | Permission Checks
     * ------------------------------------------------------------------ */
    const hasPermission = useCallback(
        (permissionName) => {
            // Direct permissions
            const hasDirect = directPermissions.some(
                (p) => p?.name === permissionName,
            );

            // Permissions via roles
            const hasViaRole = roles.some((role) =>
                role?.permissions?.some((p) => p?.name === permissionName),
            );

            return hasDirect || hasViaRole;
        },
        [directPermissions, roles],
    );

    // Multiple permissions (any)
    const hasAnyPermission = useCallback(
        (permissionNames = []) =>
            permissionNames.some((permissionName) =>
                hasPermission(permissionName),
            ),
        [hasPermission],
    );

    // Multiple permissions (all)
    const hasAllPermissions = useCallback(
        (permissionNames = []) =>
            permissionNames.every((permissionName) =>
                hasPermission(permissionName),
            ),
        [hasPermission],
    );

    /* ------------------------------------------------------------------
     | Derived Helpers
     * ------------------------------------------------------------------ */
    const firstRole = useMemo(() => roles[0] ?? null, [roles]);

    const roleNames = useMemo(
        () => roles.map((role) => role?.name).filter(Boolean),
        [roles],
    );

    /* ------------------------------------------------------------------
     | Public API
     * ------------------------------------------------------------------ */
    return {
        // Role checks
        hasRole,
        hasAnyRole,
        hasAllRoles,

        // Permission checks
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,

        // Data
        roles,
        roleNames,
        firstRole,
    };
};

import { OrgRole } from "./schemas/UserOrg.schema";

export const DEFAULT_PERMISSIONS = {
    [OrgRole.OWNER]: ['create_product', 'update_product', 'delete_product', 'view_product', 'create_user', 'delete_user'],
    [OrgRole.ADMIN]: ['create_product', 'update_product', 'view_product', 'create_user'],
    [OrgRole.CUSTOMER]: ['view_product']
};
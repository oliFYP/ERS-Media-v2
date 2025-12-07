// Role constants
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  CLIENT: "client",
};

// Check if user has a specific role
export const hasRole = (profile, role) => {
  return profile?.role === role && profile?.is_active === true;
};

// Check if user is super admin
export const isSuperAdmin = (profile) => {
  return hasRole(profile, ROLES.SUPER_ADMIN);
};

// Check if user is admin
export const isAdmin = (profile) => {
  return hasRole(profile, ROLES.ADMIN);
};

// Check if user is client
export const isClient = (profile) => {
  return hasRole(profile, ROLES.CLIENT);
};

// Check if user has admin or super admin role
export const isAdminOrAbove = (profile) => {
  return isSuperAdmin(profile) || isAdmin(profile);
};

// Check if user can manage other users
export const canManageUsers = (profile) => {
  return isSuperAdmin(profile);
};

// Check if user can manage clients
export const canManageClients = (profile, clientId = null) => {
  if (isSuperAdmin(profile)) return true;
  // Note: For admins, you'll need to check assignments table
  // This is a placeholder - implement assignment check when needed
  return false;
};

// Check if user can view/edit calendar
export const canManageCalendar = (profile, targetUserId = null) => {
  if (isSuperAdmin(profile)) return true;
  if (isAdmin(profile)) {
    // Admins can manage calendars of their assigned clients
    // You'll need to check assignments table
    return true; // Placeholder
  }
  if (isClient(profile) && targetUserId === profile.id) {
    // Clients can only view their own calendar
    return true;
  }
  return false;
};

// Check if user can create/assign tasks
export const canCreateTasks = (profile) => {
  return isAdminOrAbove(profile);
};

// Check if user can view specific task
export const canViewTask = (profile, task) => {
  if (isSuperAdmin(profile)) return true;
  if (isAdmin(profile) && task.created_by === profile.id) return true;
  if (isClient(profile) && task.assigned_to === profile.id) return true;
  return false;
};

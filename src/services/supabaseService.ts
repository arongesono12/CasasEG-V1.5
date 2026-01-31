import { supabase } from "./supabaseClient";
import { Property, User, Message } from "../types";

/**
 * UTILITIES
 */
const handleError = (error: any, context?: string) => {
  if (error?.status === 429 || error?.code === "429") {
    window.dispatchEvent(new CustomEvent("app:rate-limit"));
  }
  console.error(`Supabase Operation Error [${context || 'General'}]:`, error.message || error);
  // Optional: return user-friendly message
  return error.message || "Error en la operación de base de datos";
};

/**
 * MAPPING UTILITIES
 */

const mapPropertyFromDb = (dbProp: any): Property => {
  try {
    return {
      id: dbProp.id,
      ownerId: dbProp.owner_id,
      title: dbProp.title || "Sin título",
      description: dbProp.description || "",
      price: Number(dbProp.price) || 0,
      location: dbProp.location || "Ubicación no disponible",
      coordinates: dbProp.coordinates,
      city: dbProp.city,
      region: dbProp.region,
      imageUrls: Array.isArray(dbProp.image_urls) ? dbProp.image_urls : [],
      bedrooms: Number(dbProp.bedrooms) || 0,
      bathrooms: Number(dbProp.bathrooms) || 0,
      area: Number(dbProp.area) || 0,
      isOccupied: !!dbProp.is_occupied,
      features: Array.isArray(dbProp.features) ? dbProp.features : [],
      waitingList: Array.isArray(dbProp.waiting_list) ? dbProp.waiting_list : [],
      status: dbProp.status || 'active',
      rating: Number(dbProp.rating) || 5,
      reviewCount: Number(dbProp.review_count) || 0,
      category: dbProp.category || 'Apartamentos',
    };
  } catch (err) {
    console.error("Error mapping property from DB:", err, dbProp);
    // Fallback to minimal valid property
    return {
      id: dbProp.id || Math.random().toString(),
      ownerId: dbProp.owner_id || "",
      title: "Error de datos",
      description: "",
      price: 0,
      location: "",
      imageUrls: [],
      bedrooms: 0,
      bathrooms: 0,
      area: 0,
      isOccupied: false,
      features: [],
      waitingList: [],
      status: 'suspended',
      rating: 0,
      reviewCount: 0
    };
  }
};

const mapPropertyToDb = (prop: Partial<Property>): any => {
  const dbProp: any = {};
  if (prop.id) dbProp.id = prop.id;
  if (prop.ownerId) dbProp.owner_id = prop.ownerId;
  if (prop.title) dbProp.title = prop.title;
  if (prop.description) dbProp.description = prop.description;
  if (prop.price !== undefined) dbProp.price = prop.price;
  if (prop.location) dbProp.location = prop.location;
  if (prop.coordinates) dbProp.coordinates = prop.coordinates;
  if (prop.city) dbProp.city = prop.city;
  if (prop.region) dbProp.region = prop.region;
  if (prop.imageUrls) dbProp.image_urls = prop.imageUrls;
  if (prop.bedrooms !== undefined) dbProp.bedrooms = prop.bedrooms;
  if (prop.bathrooms !== undefined) dbProp.bathrooms = prop.bathrooms;
  if (prop.area !== undefined) dbProp.area = prop.area;
  if (prop.isOccupied !== undefined) dbProp.is_occupied = prop.isOccupied;
  if (prop.features) dbProp.features = prop.features;
  if (prop.waitingList) dbProp.waiting_list = prop.waitingList;
  if (prop.status) dbProp.status = prop.status;
  if (prop.rating !== undefined) dbProp.rating = prop.rating;
  if (prop.reviewCount !== undefined) dbProp.review_count = prop.reviewCount;
  if (prop.category) dbProp.category = prop.category;
  return dbProp;
};

const mapMessageFromDb = (dbMsg: any): Message => ({
  id: dbMsg.id,
  fromId: dbMsg.from_id,
  toId: dbMsg.to_id,
  propertyId: dbMsg.property_id,
  content: dbMsg.content,
  timestamp: new Date(dbMsg.created_at).getTime(),
});

const mapMessageToDb = (msg: Partial<Message>): any => {
  const dbMsg: any = {};
  if (msg.id) dbMsg.id = msg.id;
  if (msg.fromId) dbMsg.from_id = msg.fromId;
  if (msg.toId) dbMsg.to_id = msg.toId;
  if (msg.propertyId) dbMsg.property_id = msg.propertyId;
  if (msg.content) dbMsg.content = msg.content;
  return dbMsg;
};

/**
 * AUTHENTICATION
 */

export const signInWithEmail = async (email: string, password: string) => {
  console.log("Intentando login por email para:", email);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    console.error("Login Error:", error.message);
    // Translate common errors
    if (error.message.includes("Email not confirmed")) {
      error.message = "VERIFY_EMAIL";
    }
  }
  return { user: data?.user || null, session: data?.session || null, error };
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  metadata: any,
) => {
  // URL de redirección después de confirmar el email
  const redirectTo = `${window.location.origin}/auth/confirm`;
  const { data, error } = await supabase.auth.signUp({
    email: email.toLowerCase().trim(),
    password,
    options: {
      data: metadata, // stored in user_metadata
      emailRedirectTo: redirectTo, // Redirect to confirmation page after email verification
      // Asegurar que se envíe el email de confirmación
    },
  });
  
  // Enhance error messages for better user feedback
  if (error) {
    // Check for common duplicate email errors
    if (error.message.includes('already registered') ||
        error.message.includes('User already registered') ||
        error.message.includes('email address is already registered') ||
        error.message.includes('already exists') ||
        error.status === 422) {
      error.message = 'Este email ya está registrado. Por favor, usa otro email o inicia sesión.';
    }
  }
  
  return { user: data?.user || null, session: data?.session || null, error };
};

export const signInWithGoogle = async () => {
  const redirectTo = window.location.origin;
  console.log("Iniciando login con Google, redirigiendo a:", redirectTo);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Sign out error:", error);
};

export const resetPasswordForEmail = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) {
    handleError(error, "resetPasswordForEmail");
    throw error;
  }
};

export const getCurrentSession = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

/**
 * USER PROFILES (Database 'users' table)
 */

export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      if (error.code !== "PGRST116") {
        console.warn("Error fetching user profile:", error.message);
      }
      return null;
    }
    return data as User;
  } catch (err) {
    console.error("Unexpected error in getUserById:", err);
    return null;
  }
};

// Renamed from createUser for clarity, but keeping alias if needed or just using this
export const createUser = async (user: User): Promise<User | null> => {
  const { data, error } = await supabase
    .from("users")
    .upsert(user)
    .select()
    .single();
  if (error) {
    console.error("Error creating user profile in public.users:", error.message);
    throw error; // Throw so AuthContext knows it failed
  }
  return data as User;
};

export const getAllUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase.from("users").select("*");
  if (error) {
    console.error("Error fetching users:", error.message);
    return [];
  }
  return data as User[];
};

/**
 * Check if an email already exists in the database
 * Note: We check both the public.users table and attempt to sign up
 * to catch emails that exist in auth.users but not yet in public.users
 */
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    // Check in public.users table (case-insensitive)
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("email")
      .ilike("email", email.toLowerCase().trim())
      .maybeSingle();
    
    if (userError && userError.code !== "PGRST116") {
      console.error("Error checking email in users table:", userError);
    }

    // If found in public.users, email exists
    if (userData) {
      return true;
    }

    // Also try to check if email exists in auth by attempting a password reset
    // This is a workaround since we don't have admin access
    // We'll rely on the signUp error to catch duplicates in auth.users
    return false;
  } catch (err) {
    console.error("Error checking email existence:", err);
    return false; // Assume it doesn't exist to allow registration attempt
  }
};

/**
 * Check if a name (username) already exists in the database
 */
export const checkNameExists = async (name: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("name")
      .ilike("name", name.trim()) // Case-insensitive search
      .maybeSingle();
    
    if (error && error.code !== "PGRST116") {
      console.error("Error checking name existence:", error);
      return false;
    }
    
    return !!data;
  } catch (err) {
    console.error("Error checking name existence:", err);
    return false;
  }
};

/**
 * Check if both email and name are available
 */
export const checkUserAvailability = async (email: string, name: string): Promise<{
  emailAvailable: boolean;
  nameAvailable: boolean;
  emailError?: string;
  nameError?: string;
}> => {
  const emailExists = await checkEmailExists(email);
  const nameExists = await checkNameExists(name);

  return {
    emailAvailable: !emailExists,
    nameAvailable: !nameExists,
    emailError: emailExists ? 'Este email ya está registrado. Por favor, usa otro email o inicia sesión.' : undefined,
    nameError: nameExists ? 'Este nombre de usuario ya está en uso. Por favor, elige otro nombre.' : undefined,
  };
};

export const updateUser = async (id: string, updates: Partial<User>) => {
  const { error } = await supabase.from("users").update(updates).eq("id", id);
  if (error) throw error;
};

export const updateUserStatus = async (id: string, status: 'active' | 'inactive' | 'banned') => {
  const { error } = await supabase.from("users").update({ status }).eq("id", id);
  if (error) {
    handleError(error, "updateUserStatus");
    throw error;
  }
};

export const promoteUserToOwner = async (id: string) => {
  const { error } = await supabase.from("users").update({ role: 'owner' }).eq("id", id);
  if (error) {
    handleError(error, "promoteUserToOwner");
    throw error;
  }
};

// Legacy shim if something calls it, though we refactored AuthContext
export const setAuthUser = (_user: User | null) => {};

/**
 * PROPERTIES
 */

export const fetchProperties = async (): Promise<Property[]> => {
  console.log("Fetching properties from Supabase...");
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });
  
  if (error) {
    console.error("Error fetching properties:", error.message);
    return [];
  }
  
  console.log(`Fetched ${data?.length || 0} properties.`);
  return (data || []).map(mapPropertyFromDb);
};

export const createProperty = async (
  property: Partial<Property>,
): Promise<Property[]> => {
  const dbProp = mapPropertyToDb(property);
  const { data, error } = await supabase
    .from("properties")
    .insert([dbProp])
    .select();
  if (error) throw error;
  return (data || []).map(mapPropertyFromDb);
};

export const deleteProperty = async (id: string): Promise<void> => {
  const { error } = await supabase.from("properties").delete().match({ id });
  if (error) throw error;
};

export const updateProperty = async (
  id: string,
  updates: Partial<Property>,
): Promise<void> => {
  const dbUpdates = mapPropertyToDb(updates);
  delete dbUpdates.id; // Never update the primary key
  const { error } = await supabase
    .from("properties")
    .update(dbUpdates)
    .eq("id", id);
  if (error) throw error;
};

export const updatePropertyResource = updateProperty; // Alias for compatibility

/**
 * MESSAGES
 */

export const fetchMessages = async (): Promise<Message[]> => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
  return (data || []).map(mapMessageFromDb);
};

export const createMessage = async (message: Partial<Message>): Promise<Message[]> => {
  const dbMsg = mapMessageToDb(message);
  const { data, error } = await supabase.from("messages").insert([dbMsg]).select();
  if (error) {
    handleError(error, "createMessage");
    throw error;
  }
  return (data || []).map(mapMessageFromDb);
};

/**
 * NOTIFICATIONS
 */

export const fetchNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  
  if (error) {
    handleError(error, "fetchNotifications");
    return [];
  }
  return data;
};

export const markNotificationRead = async (id: string) => {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id);
  
  if (error) handleError(error, "markNotificationRead");
};

export const createNotification = async (notification: any) => {
  const { error } = await supabase
    .from("notifications")
    .insert([notification]);
  
  if (error) handleError(error, "createNotification");
};
/**
 * STORAGE
 */
export const uploadPropertyImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from('propiedades-images')
    .upload(filePath, file);

  if (error) {
    handleError(error, "uploadPropertyImage");
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('propiedades-images')
    .getPublicUrl(filePath);

  return publicUrl;
};

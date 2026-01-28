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

const mapPropertyFromDb = (dbProp: any): Property => ({
  id: dbProp.id,
  ownerId: dbProp.owner_id,
  title: dbProp.title,
  description: dbProp.description,
  price: Number(dbProp.price),
  location: dbProp.location,
  coordinates: dbProp.coordinates,
  city: dbProp.city,
  region: dbProp.region,
  imageUrls: dbProp.image_urls || [],
  bedrooms: dbProp.bedrooms,
  bathrooms: dbProp.bathrooms,
  area: dbProp.area,
  isOccupied: dbProp.is_occupied,
  features: dbProp.features || [],
  waitingList: dbProp.waiting_list || [],
  status: dbProp.status,
  rating: Number(dbProp.rating),
  reviewCount: dbProp.review_count,
  category: dbProp.category,
});

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
  if (error) console.error("Login Error:", error.message);
  return { user: data?.user || null, session: data?.session || null, error };
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  metadata: any,
) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata, // stored in user_metadata
    },
  });
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
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    if (error.code !== "PGRST116") {
      // PGRST116 is "Row not found" - ignore log for this
      console.warn("Error fetching user profile:", error);
    }
    return null;
  }
  return data as User;
};

// Renamed from createUser for clarity, but keeping alias if needed or just using this
export const createUser = async (user: User): Promise<User | null> => {
  const { data, error } = await supabase
    .from("users")
    .upsert(user)
    .select()
    .single();
  if (error) {
    console.error("Error creating user profile:", error);
    return null;
  }
  return data as User;
};

export const getAllUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase.from("users").select("*");
  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }
  return data as User[];
};

export const updateUser = async (id: string, updates: Partial<User>) => {
  const { error } = await supabase.from("users").update(updates).eq("id", id);
  if (error) throw error;
};

// Legacy shim if something calls it, though we refactored AuthContext
export const setAuthUser = (_user: User | null) => {};

/**
 * PROPERTIES
 */

export const fetchProperties = async (): Promise<Property[]> => {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching properties:", error);
    return [];
  }
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

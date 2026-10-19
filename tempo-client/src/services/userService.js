import { supabase } from "../supabaseClient";

// Fetch All users
export async function getUsers() {
  const { data, error } = await supabase.from("users").select("*");
  if (error) throw error;
  return data;
}

// Create a new user
export async function createUser(userData) {
  const { data, error } = await supabase
    .from("users")
    .insert([userData])
    .select();
  if (error) throw error;
  return data[0];
}

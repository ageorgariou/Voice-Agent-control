import { supabase } from './supabase';
import { User } from '../types';

export const userService = {
  async createUser(userData: Omit<User, 'id'>) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserByUsername(username: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error) throw error;
    return data;
  },

  async updateUser(username: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('username', username)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async setUserApiKey(username: string, apiKey: string) {
    const { error } = await supabase
      .from('user_settings')
      .upsert({ 
        username, 
        vapi_key: apiKey,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  },

  async getUserApiKey(username: string) {
    const { data, error } = await supabase
      .from('user_settings')
      .select('vapi_key')
      .eq('username', username)
      .single();

    if (error) throw error;
    return data?.vapi_key;
  },

  async set2FAStatus(username: string, enabled: boolean) {
    const { error } = await supabase
      .from('user_settings')
      .upsert({ 
        username, 
        two_fa_enabled: enabled,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  },

  async get2FAStatus(username: string) {
    const { data, error } = await supabase
      .from('user_settings')
      .select('two_fa_enabled')
      .eq('username', username)
      .single();

    if (error) throw error;
    return data?.two_fa_enabled || false;
  }
}; 
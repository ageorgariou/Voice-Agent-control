import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mhmtwmrfqzsqmjvcbvuz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1obXR3bXJmcXpzcW1qdmNidnV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYxNjMyMzYsImV4cCI6MjA1MTczOTIzNn0.WwY_Haxds1GPeg21uBKFLbINKb5GYMqGPuAovYNgxeI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 
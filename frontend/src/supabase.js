import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ujecqxyphgeurhclitwb.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_jKZJC-AvjoDq2OKy5YSyBQ_kJsIoSHH';

export const supabase = createClient(supabaseUrl, supabaseKey);

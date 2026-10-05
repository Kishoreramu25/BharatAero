import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ujecqxyphgeurhclitwb.supabase.co';
const supabaseKey = 'sb_publishable_jKZJC-AvjoDq2OKy5YSyBQ_kJsIoSHH';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.storage.listBuckets();
  console.log("Buckets:", data);
}

run();

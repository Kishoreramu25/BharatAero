import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ujecqxyphgeurhclitwb.supabase.co';
const supabaseKey = 'sb_publishable_jKZJC-AvjoDq2OKy5YSyBQ_kJsIoSHH';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.storage.from('profile').list('', { limit: 10 });
  if (error) {
    console.error("List error:", error);
    return;
  }
  console.log("Root contents:", data);
  
  if (data && data.length > 0) {
    for (const item of data) {
      if (item.id === null) {
        // It's a folder
        console.log(`Folder: ${item.name}`);
        const { data: files } = await supabase.storage.from('profile').list(item.name, { limit: 5 });
        console.log(`Files in ${item.name}:`, files);
        
        if (files && files.length > 0) {
          for (const f of files) {
            const { data: publicUrl } = supabase.storage.from('profile').getPublicUrl(`${item.name}/${f.name}`);
            console.log(`Public URL:`, publicUrl);
          }
        }
      } else {
        console.log(`File: ${item.name}, size: ${item.metadata.size}`);
      }
    }
  }
}

run();

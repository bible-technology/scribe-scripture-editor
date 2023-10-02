import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const IsElectron = process.env.NEXT_PUBLIC_IS_ELECTRON === 'true';

const supabase = !IsElectron ? createClient(supabaseUrl, supabaseAnonKey) : {};
const supabaseStorage = !IsElectron ? createClient(supabaseUrl, supabaseAnonKey).storage.from('scribe') : {};

const sbStorageUpload = (file, payload, settings = {}) => {
  console.log({file,payload,settings})
  const data = supabaseStorage.upload(file, payload, settings);
  return data;
};

async function createDirectory({path, data}) {
  const { data: folder } = await supabaseStorage.list(path);
  if (folder.length === 0) {
    if (data) {
      await sbStorageUpload(path, data);
      return;
    }
    else{
      console.log("nofile")
      const fileName = '.keep';
      const filePath = `${path}/${fileName}`;
      const fileContent = new Blob(['testtext'], { type: 'text/plain' });
      const { data: createdDirectory } = await sbStorageUpload(
        filePath,
        fileContent,
        {
          cacheControl: '3600',
          upsert: false,
        },
      );
      console.log('created directory', createdDirectory);
      return;
    }
   
  }
}

const getSupabaseSession = async () => {
  if (supabase.auth) {
    const { data } = await supabase.auth.getSession();
    return data;
  }
};
const getSupabaseUser = async () => {
  if (supabase.auth) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  }
};

const supabaseSignup = async ({email, password}) => {
  if (supabase.auth) {
    const response = await supabase.auth.signUp({
      email,
      password,
    });
    return response;
  }
};

const supabaseSignIn = async ({ email, password }) => {
  if (supabase.auth) {
    const response = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return response;
  }
};

const supabaseSignout = async () => {
  if (supabase.auth) {
    const response = await supabase.auth.signOut();
    return response;
  }
};

const sbStorageList = async (file) => {
  if (file === undefined) {
    const response = await supabaseStorage.list();
    return response;
  }
  const response = await supabaseStorage.list(file);
  return response;
};

const sbStorageDownload = async (path) => {
  const res = await supabaseStorage.download(path);
  return res;
};

const sbStorageUpdate = async ({ path, payload, options = {} }) => {
  await supabaseStorage.update(path, payload, options);
};
const sbStorageRemove = async (path) => {
  await supabaseStorage.remove(path);
};

const newPath = 'scribe/users';
export {
  supabase,
  supabaseSignup,
  supabaseSignIn,
  supabaseSignout,
  supabaseStorage,
  newPath,
  createDirectory,
  getSupabaseSession,
  getSupabaseUser,
  sbStorageList,
  sbStorageDownload,
  sbStorageUpload,
  sbStorageUpdate,
  sbStorageRemove,
  IsElectron,
};

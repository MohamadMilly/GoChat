import { useState } from "react";
import { supabase } from "../../utils/supabase";

export function useUpload() {
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const upload = async (file, bucketName) => {
    try {
      setIsUploading(true);
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(`${Date.now()}-${crypto.randomUUID()}`, file);
      if (error) {
        throw new Error(error.message);
      }
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);
      const url = publicUrlData.publicUrl;
      return url;
    } catch (err) {
      console.error(err.message);
      setError(err);
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, error, isUploading };
}

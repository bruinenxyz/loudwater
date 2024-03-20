import useSWR, { useSWRConfig } from "swr";
import { mergeByKey } from "@/utils/merge-by-key";
import {
  backendCreate,
  backendDelete,
  backendGet,
  backendUpdate,
  requestPost,
} from "@/data/client";
import useSWRMutation from "swr/mutation";
import { QuerySummary } from "@/definitions/query";
import { CreateUpload, Upload } from "@/definitions/upload";
import { useStreams } from "./use-streams";

export const useUploads = () => {
  const { data, isLoading, isValidating, error } = useSWR<Upload[]>(
    "/uploads",
    (url) => backendGet(url),
  );
  return { data, isLoading, isValidating, error };
};

export const useCreateUpload = (sourceId: string) => {
  const { mutate } = useSWRConfig();
  const { mutate: updateStreams } = useStreams(sourceId);
  const { data, error, trigger, isMutating } = useSWRMutation(
    `/uploads`,
    async (
      url: string,
      { arg }: { arg: { upload: CreateUpload; uploadedFile: File } },
    ) => {
      const createUploadResponse = await backendCreate(url, arg.upload);

      mutate(`/uploads`, createUploadResponse, {
        populateCache: (result: Upload, currentData: Upload[]) => {
          currentData?.push(result);
        },
      });

      // Take the presigned URL returned from the backend and upload the file
      try {
        const response = await fetch(createUploadResponse.presignedUrl, {
          method: "PUT",
          body: arg.uploadedFile,
          headers: {
            "Content-Type": arg.uploadedFile.type,
          },
        });
      } catch (e) {
        // Delete the upload record if the upload to S3 presigned URL fails
        await backendDelete(`/uploads/${createUploadResponse.upload.id}`);
        throw new Error("Failed to upload file");
      }

      await updateStreams();

      return createUploadResponse;
    },
  );

  return { data, error, trigger, isMutating };
};

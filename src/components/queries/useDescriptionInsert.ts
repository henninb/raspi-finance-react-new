import { basicAuth } from "../Common";
import axios, { AxiosError } from "axios";
import { useMutation, useQueryClient } from "react-query";

const insertDescription = async (descriptionName: any): Promise<any> => {
  try {
    const endpoint = "/api/description/insert";
    const payload = { description: descriptionName, activeStatus: true };

    const response = await axios.post(endpoint, payload, {
      timeout: 0,
      headers: {
        "Content-Type": "application/json",
        Authorization: basicAuth(),
      },
    });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 404) {
        console.error("Resource not found (404).", error.response.data);
        // React to 404 specifically
        return {
          descriptionId: Math.random(),
          descriptionName: descriptionName,
          activeStatus: true,
          dateAdded: new Date(),
          dateUpdated: new Date(),
        };
      }
    }
  }
};

export default function useDescriptionInsert() {
  const queryClient = useQueryClient();

  return useMutation(
    ["insertDescription"],
    (variables: any) => insertDescription(variables.descriptionName),
    {
      onError: (error: AxiosError<any>) => {
        console.log(error ? error : "error is undefined.");
        console.log(
          error.response ? error.response : "error.response is undefined.",
        );
        console.log(
          error.response
            ? JSON.stringify(error.response)
            : "error.response is undefined - cannot stringify.",
        );
      },

      onSuccess: (response) => {
        const oldData: any = queryClient.getQueryData("description");
        const newData = [response, ...oldData];
        queryClient.setQueryData("description", newData);
      },
    },
  );
}

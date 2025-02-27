import axios, { AxiosError } from "axios";
import { basicAuth } from "../Common";
//import { useMutation, useQueryClient } from "react-query";
import { useMutation, useQueryClient } from "react-query";
import Parameter from "../model/Parameter";

const updateParameter = async (
  newData: Parameter,
  oldData: Parameter,
): Promise<Parameter> => {
  const endpoint = "/api/parm/update/" + oldData.parameterName;

  console.log(newData);
  const response = await axios.put(endpoint, newData, {
    timeout: 0,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: basicAuth(),
    },
  });
  return response.data;
};

export default function useParameterUpdate() {
  const queryClient = useQueryClient();

  return useMutation(
    ["updateParameter"],
    (variables: any) => updateParameter(variables.newRow, variables.oldRow),
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
      onSuccess: (response: any) => {
        const oldData = queryClient.getQueryData<Parameter[]>("parameter");

        if (oldData) {
          // Combine the response with the existing data
          const newData = [response, ...oldData];
          queryClient.setQueryData("parameter", newData);
        } else {
          // If no old data, initialize with the new response
          queryClient.setQueryData("parameter", [response]);
        }
      },
    },
  );
}

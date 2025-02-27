import { basicAuth } from "../Common";
import axios, { AxiosError } from "axios";
import { useMutation, useQueryClient } from "react-query";
import Parameter from "../model/Parameter";

const deleteParameter = async (payload: Parameter): Promise<Parameter> => {
  try {
    // TODO: change the word parm to the actual path.
    const endpoint = "/api/parm/delete/" + payload.parameterName;

    const response = await axios.delete(endpoint, {
      timeout: 0,
      headers: {
        "Content-Type": "application/json",
        Authorization: basicAuth(),
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in deleteParameter:", error);
    throw error;
  }
};

export default function useParameterDelete() {
  const queryClient = useQueryClient();

  return useMutation(
    ["deleteParameter"],
    (variables: any) => deleteParameter(variables.oldRow),
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

      onSuccess: (response, variables) => {
        const oldData: any = queryClient.getQueryData("parameter");
        console.log("delete was a success.");
        //let oldData: any = queryClient.getQueryData("parameter");
        const newData = oldData.filter(
          (t: any) => t.parameterName !== variables.oldRow.parameterName,
        );
        queryClient.setQueryData("parameter", newData);
      },
    },
  );
}

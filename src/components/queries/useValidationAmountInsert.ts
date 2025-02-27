import { basicAuth } from "../Common";
import axios, { AxiosError } from "axios";
import { useMutation, useQueryClient } from "react-query";
import ValidationAmount from "../model/ValidationAmount";

const insertValidationAmount = async (
  accountNameOwner: string,
  payload: ValidationAmount,
): Promise<ValidationAmount> => {
  try {
    const endpoint = "/api/validation/amount/insert/" + accountNameOwner;

    const response = await axios.post(endpoint, payload, {
      timeout: 0,
      headers: {
        "Content-Type": "application/json",
        Authorization: basicAuth(),
      },
    });
    return response.data;
  } catch (error) {
    console.error("An error occurred:", error);
    throw error;
  }
};

export default function useValidationAmountInsert() {
  const queryClient = useQueryClient();

  return useMutation(
    ["insertValidationAmount"],
    (variables: any) =>
      insertValidationAmount(variables.accountNameOwner, variables.payload),
    {
      onError: (error: AxiosError) => {
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
        console.log(response ? JSON.stringify(response) : response);
        queryClient.setQueryData(
          ["validationAmount", variables.accountNameOwner],
          response,
        );
      },
    },
  );
}

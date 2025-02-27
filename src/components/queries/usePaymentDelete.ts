import { basicAuth } from "../Common";
import axios, { AxiosError } from "axios";
import { useMutation, useQueryClient } from "react-query";
import Payment from "../model/Payment";

const deletePayment = async (payload: Payment): Promise<string> => {
  try {
    const endpoint = "/api/payment/delete/" + payload?.paymentId;

    const response = await axios.delete(endpoint, {
      timeout: 0,
      headers: {
        "Content-Type": "application/json",
        Authorization: basicAuth(),
      },
    });
    return response.data;
  } catch (error) {
    return JSON.stringify(payload);
  }
};

export default function usePaymentDelete() {
  const queryClient = useQueryClient();

  return useMutation(
    ["deletePayment"],
    (variables: any) => deletePayment(variables.oldRow),
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

      onSuccess: (_response, variables) => {
        const oldData: any = queryClient.getQueryData("payment");
        const newData = oldData.filter((t: any) => {
          return t.paymentId !== variables.oldRow.paymentId;
        });
        queryClient.setQueryData("payment", newData);
      },
    },
  );
}

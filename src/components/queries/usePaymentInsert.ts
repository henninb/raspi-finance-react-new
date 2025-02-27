import { basicAuth } from "../Common";
import axios, { AxiosError } from "axios";
import { useMutation, useQueryClient } from "react-query";
import Payment from "../model/Payment";

const setupNewPayment = (payload: Payment) => {
  return {
    accountNameOwner: payload?.accountNameOwner,
    amount: payload?.amount,
    transactionDate: payload?.transactionDate.toISOString(),
  };
};

const insertPayment = async (payload: Payment): Promise<any> => {
  try {
    const endpoint = "/api/payment/insert";
    const newPayload = setupNewPayment(payload);

    const response = await axios.post(endpoint, newPayload, {
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
          paymentId: Math.random(), // Generate unique ID
          accountNameOwner: payload.accountNameOwner,
          transactionDate: payload.transactionDate,
          amount: payload.amount,
          guidSource: "",
          guidDestination: "",
          activeStatus: true,
        };
      }
    }

    return { error: "An error occurred", details: error.message };
  }
};

export default function usePaymentInsert() {
  const queryClient = useQueryClient();

  return useMutation(
    ["insertPayment"],
    (variables: any) => insertPayment(variables.payload),
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
        const oldData: any = queryClient.getQueryData("payment");
        const newData = [response, ...oldData];
        queryClient.setQueryData("payment", newData);
      },
    },
  );
}

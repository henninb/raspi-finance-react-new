import axios, { AxiosError } from "axios";
import { basicAuth, capitalizeFirstChar, noNaN } from "../Common";
import { useMutation, useQueryClient } from "react-query";
import { getAccountKey, getTotalsKey } from "./KeyFile";
import Transaction from "../model/Transaction";

const updateTransaction = async (
  newData: Transaction,
  oldData: Transaction,
): Promise<Transaction> => {
  try {
    const endpoint = "/api/transaction/update/" + oldData.guid;

    if (newData.receiptImage !== undefined) {
      newData["receiptImage"].image = newData["receiptImage"].image.replace(
        /^data:image\/[a-z]+;base64,/,
        "",
      );
    }
    console.log("newData:" + JSON.stringify(newData));

    const response = await axios.put(endpoint, newData, {
      timeout: 0,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: basicAuth(),
      },
    });
    return response.data;
  } catch (error) {
    return newData;
  }
};

export default function useTransactionUpdate() {
  const queryClient = useQueryClient();

  return useMutation(
    ["updateTransaction"],
    (variables: any) => updateTransaction(variables.newRow, variables.oldRow),
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
        const oldData: any = queryClient.getQueryData(
          getAccountKey(variables.oldRow.accountNameOwner),
        );
        let newData;
        if (
          variables.oldRow.accountNameOwner ===
          variables.newRow.accountNameOwner
        ) {
          const dataUpdate = [...oldData];
          const index = variables.oldRow.transferId;
          dataUpdate[index] = variables.newRow;
          newData = [...dataUpdate];
          //TODO: update accountTotals if amounts are different
          if (variables.oldRow.amount !== variables.newRow.amount) {
            const totals: any = queryClient.getQueryData(
              getTotalsKey(variables.newRow.accountNameOwner),
            );
            const oldTransactionStateKey =
              "totals" + capitalizeFirstChar(variables.oldRow.transactionState);
            const newTransactionStateKey =
              "totals" + capitalizeFirstChar(variables.newRow.transactionState);
            const difference =
              variables.newRow.amount - variables.oldRow.amount;
            totals.totals += difference;
            if (
              variables.newRow.transactionState ===
              variables.oldRow.transactionState
            ) {
              totals[newTransactionStateKey] += difference;
              queryClient.setQueryData(
                getTotalsKey(variables.newRow.accountNameOwner),
                totals,
              );
            } else {
              totals[oldTransactionStateKey] =
                noNaN(totals[oldTransactionStateKey]) - variables.oldRow.amount;
              totals[newTransactionStateKey] =
                noNaN(totals[newTransactionStateKey]) +
                variables.oldRow.amount +
                difference;
              console.log(JSON.stringify(totals));
              queryClient.setQueryData(
                getTotalsKey(variables.newRow.accountNameOwner),
                totals,
              );
            }
          }
        } else {
          const dataDelete = [...oldData];
          const index = variables.oldRow.transferId;
          dataDelete.splice(index, 1);
          newData = [...dataDelete];
          //TODO: add to other accountNameOwner list
          //TODO: update accountTotals (subtract)
        }

        queryClient.setQueryData(
          getAccountKey(variables.oldRow.accountNameOwner),
          newData,
        );
      },
    },
  );
}

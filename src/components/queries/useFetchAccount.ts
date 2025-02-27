import axios, { AxiosError } from "axios";
import { basicAuth } from "../Common";
import { useQuery } from "react-query";

const dataTest = [
  {
    accountId: 1,
    accountNameOwner: "wfargo_brian",
    accountType: "debit",
    activeStatus: true,
    moniker: "0000",
    outstanding: 1500.25,
    future: 200.0,
    cleared: 1300.25,
  },
  {
    accountId: 2,
    accountNameOwner: "barclay-cash_brian",
    accountType: "credit",
    activeStatus: true,
    moniker: "0000",
    outstanding: 5000.75,
    future: 1000.0,
    cleared: 4000.75,
  },
  {
    accountId: 3,
    accountNameOwner: "barclay-savings_brian",
    accountType: "debit",
    activeStatus: true,
    moniker: "0000",
    outstanding: 5000.75,
    future: 1000.0,
    cleared: 4000.75,
  },
  {
    accountId: 4,
    accountNameOwner: "wellsfargo-cash_brian",
    accountType: "credit",
    activeStatus: true,
    moniker: "0000",
    outstanding: 5000.75,
    future: 1000.0,
    cleared: 4000.75,
  },
];

const fetchAccountData = async (): Promise<any> => {
  try {
    const response = await axios.get("/api/account/select/active", {
      timeout: 0,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: basicAuth(),
      },
    });
    // Uncomment the line below for debugging
    // console.debug(JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error("Error fetching account data:", error);
    return dataTest;
  }
};

export default function useFetchAccount() {
  return useQuery("account", () => fetchAccountData(), {
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
  });
}

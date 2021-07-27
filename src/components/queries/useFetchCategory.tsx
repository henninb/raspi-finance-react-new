import { useQuery } from "react-query";
import { gql } from "@apollo/client";
import { ApolloError } from "apollo-client";
import {apolloClient} from "../ApolloClient";

const query = gql`
  query {
    categories {
      category
    }
  }
`;

const fetchCategoryData = async () => {
  const client = apolloClient();
  const { data } = await client.query({ query });
  console.log("fetching categories");
  return data.categories;
};

export default function useFetchCategory() {
  return useQuery("category", () => fetchCategoryData(), {
    onError: (error: ApolloError) => {
      console.log(error ? error : "error is undefined.");
    },
  });
}

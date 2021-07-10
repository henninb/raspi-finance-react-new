import axios from "axios";
import {endpointUrl} from "../Common";
import {useQuery} from "react-query";

const fetchPaymentData = async () : Promise<any> => {
    const response = await axios.get(
        endpointUrl() + '/payment/select',
        {
            timeout: 0,
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
        }
    );
    return response.data;
}

const catchError = (error:any) => {
    if (error.response) {
        if (error.response.status === 404) {

        }
    }
    //handleError(error, 'fetchPaymentData', true)
}

export default function useFetchPayment () {
    return useQuery('payment', () => fetchPaymentData(), {onError: catchError})
}
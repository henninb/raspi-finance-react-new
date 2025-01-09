import React, { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Button, Box} from "@mui/material";
import TextField from "@mui/material/TextField";
import Spinner from "./Spinner";
import { useNavigate } from "react-router-dom";
import { currencyFormat, epochToDate, noNaN } from "./Common";
import SnackbarBaseline from "./SnackbarBaseline";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import SelectCategory from "./SelectCategory";
import SelectTransactionState from "./SelectTransactionState";
import SelectTransactionType from "./SelectTransactionType";
import SelectReoccurringType from "./SelectReoccurringType";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import UpdateIcon from '@mui/icons-material/Check';
import IconButton from '@mui/material/IconButton';
import { useMatch, PathMatch } from "react-router-dom";
import useFetchTransactionByAccount from "./queries/useFetchTransactionByAccount";
import useChangeTransactionState from "./queries/useTransactionStateUpdate";
import useTransactionUpdate from "./queries/useTransactionUpdate";
import useTransactionDelete from "./queries/useTransactionDelete";
import useTransactionInsert from "./queries/useTransactionInsert";
import useFetchTotalsPerAccount from "./queries/useFetchTotalsPerAccount";
import useReceiptImageUpdate from "./queries/useReceiptImageUpdate";
import useFetchValidationAmount from "./queries/useFetchValidationAmount";
import useValidationAmountInsert from "./queries/useValidationAmountInsert";
import Transaction from "./model/Transaction";

export default function TransactionTable() {
  const [loadMoveDialog, setLoadMoveDialog] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState({});
  const [keyPressed, setKeyPressed] = useState(false);
  const [fileContent, setFileContent] = useState("");
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [showSpinner, setShowSpinner] = useState(true);
  const [state, setState] = useState('outstanding');

  const routeMatch: PathMatch<string> | null = useMatch("/transactions/:account");
  let accountNameOwner = "default";

  if (routeMatch?.params?.account) {
    accountNameOwner = routeMatch.params.account;
  } else {
    console.log("accountNameOwner is set to the default.");
  }

  const transactionStates = ['outstanding', 'future', 'cleared'];

  const dataTest = [    {
    "transactionId": 10544,
    "guid": "299b36b1-a49f-43bc-aaa5-ba78352f716a",
    "accountId": 1029,
    "accountType": "credit",
    "transactionType": "undefined",
    "accountNameOwner": "barclay-cash_brian",
    "transactionDate": "2017-09-17",
    "description": "balance adjustment",
    "category": "none",
    "amount": -0.99,
    "transactionState": "cleared",
    "activeStatus": true,
    "reoccurringType": "onetime"
},
{
    "transactionId": 10543,
    "guid": "55dd8ccb-b51c-4c93-907e-95ed1d20705f",
    "accountId": 1029,
    "accountType": "credit",
    "transactionType": "expense",
    "accountNameOwner": "barclay-cash_brian",
    "transactionDate": "2017-08-18",
    "description": "amazon.com",
    "category": "online",
    "amount": 0.99,
    "transactionState": "cleared",
    "activeStatus": true,
    "reoccurringType": "onetime",
    "notes": "egiftcard"
},
{
    "transactionId": 10542,
    "guid": "499cee31-ec4c-4f8a-b5b5-35ea9c9df9f4",
    "accountId": 1029,
    "accountType": "credit",
    "transactionType": "undefined",
    "accountNameOwner": "barclay-cash_brian",
    "transactionDate": "2017-08-17",
    "description": "balance adjustment",
    "category": "none",
    "amount": -0.99,
    "transactionState": "cleared",
    "activeStatus": true,
    "reoccurringType": "onetime"
},
{
    "transactionId": 10541,
    "guid": "6128e4be-932d-4da3-af3b-3c25e76a9de9",
    "accountId": 1029,
    "accountType": "credit",
    "transactionType": "expense",
    "accountNameOwner": "barclay-cash_brian",
    "transactionDate": "2017-07-18",
    "description": "amazon.com",
    "category": "online",
    "amount": 0.99,
    "transactionState": "cleared",
    "activeStatus": true,
    "reoccurringType": "onetime"
},
{
    "transactionId": 10540,
    "guid": "798e8a7f-f615-46b1-aeba-b0b8f74e5d10",
    "accountId": 1029,
    "accountType": "credit",
    "transactionType": "undefined",
    "accountNameOwner": "barclay-cash_brian",
    "transactionDate": "2017-07-17",
    "description": "balance adjustment",
    "category": "none",
    "amount": -0.99,
    "transactionState": "cleared",
    "activeStatus": true,
    "reoccurringType": "onetime"
}];

  const { data, isSuccess } = useFetchTransactionByAccount(accountNameOwner);
  const { data: totals, isSuccess: isSuccessTotals } =  useFetchTotalsPerAccount(accountNameOwner);
  const { data: validationData, isSuccess: isSuccessValidationTotals } = useFetchValidationAmount(accountNameOwner);
  const { mutate: updateTransactionState } = useChangeTransactionState(accountNameOwner);
  const { mutate: updateTransaction } = useTransactionUpdate();
  const { mutate: deleteTransaction } = useTransactionDelete();
  const { mutate: insertReceiptImage } = useReceiptImageUpdate();
  const { mutate: insertTransaction } = useTransactionInsert(accountNameOwner);
  const { mutate: insertValidationAmount } = useValidationAmountInsert();

  const handleSnackbarClose = () => {
    setOpen(false);
  };

    const handleDeleteRow = async (transaction: Transaction) => {
      await deleteTransaction({ oldRow: transaction });
    };

  const handleError = (error: any, moduleName: any, throwIt: any) => {
    if (error.response) {
      setMessage(
        `${moduleName}: ${error.response.status} and ${JSON.stringify(
          error.response.data,
        )}`,
      );
      console.log(
        `${moduleName}: ${error.response.status} and ${JSON.stringify(
          error.response.data,
        )}`,
      );
      setOpen(true);
    } else {
      setMessage(`${moduleName}: failure`);
      console.log(`${moduleName}: failure`);
      setOpen(true);
      if (throwIt) {
        throw error;
      }
    }
  };

  useEffect(() => {
       if (isSuccess && isSuccessTotals && isSuccessValidationTotals ) {
         setShowSpinner(false);
       }
     }, [isSuccess, isSuccessTotals]); 

  const columns: GridColDef[] = [
    {
      field: "transactionDate",
      headerName: "Transaction Date",
      type: "date",
      width: 100,
      renderCell: (params) => {
        return params.value.toLocaleDateString("en-US");
      },
      valueGetter: (params: string) => {
        //console.log("date-in:" + params)
        const utcDate = new Date(params);
        const localDate = new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000);
        //console.log("localDate: " + localDate);
        return localDate;
      },
      editable: true,
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 180,
      editable: true,
      renderCell: (params) => (
        <div>
          {params.value}
        </div>
      ),
      renderEditCell: (params: any) => (
        <TextField
          value={params.value || ''}
          onChange={(e: any) => params.api.getCellEditorInstances().forEach((editor: any) => editor.setValue(e.target.value))}
        />
      ),
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 150,
      editable: true,
      // renderEditCell: (params: any) => (
      //   <SelectCategory
      //     currentValue={params.value || 'none'}
      //     onChange={(newValue: any) => params.api.getCellEditorInstances().forEach((editor: any) => editor.setValue(newValue))}
      //   />
      // ),
    },
    {
      field: "amount",
      headerName: "Amount",
      type: "number",
      width: 75,
      renderCell: (params: any) =>
        params.value?.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        }),
      editable: true,
      cellClassName: "nowrap",
    },

    {
      field: 'transactionState',
      headerName: 'State',
      width: 250,
      renderCell: (params: any) => {
        setState(params.value || 'outstanding')
  
        const handleStateChange = (newState: any) => {
          setState(newState);
          // Optionally update the API if required:
          // params.api.updateRows([{ id: params.id, transactionState: newState }]);
        };
  
        return (
          <Box>
            {transactionStates.map((option) => (
              <Button
                key={option}
                variant={state === option ? 'contained' : 'outlined'}
                //color={state === option ? 'primary' : 'default'}
                onClick={() => handleStateChange(option)}
                size="small"
                sx={{ marginRight: 1 }}
              >
                {option}
              </Button>
            ))}
          </Box>
        );
      },
      renderEditCell: (params: any) => (
        <Box>
          {transactionStates.map((option) => (
            <Button
              key={option}
              variant={params.value === option ? 'contained' : 'outlined'}
              //color={params.value === option ? 'primary' : 'default'}
              onClick={() => {
                // Update the value in your grid
                params.api.updateRows([{ id: params.id, transactionState: option }]);
              }}
              size="small"
              sx={{ marginRight: 1 }}
            >
              {option}
            </Button>
          ))}
        </Box>
      ),
    },
    {
      field: 'transactionType',
      headerName: 'Type',
      width: 180,
      renderCell: (params: any) => params.value || 'undefined',
      // renderEditCell: (params) => (
      //   <SelectTransactionType
      //     currentValue={params.value || 'undefined'}
      //     //onChange={(newValue: any) => params.api.getCellEditorInstances().forEach((editor : any) => editor.setValue(newValue))}
      //   />
      // ),
    },
    {
      field: 'reoccurringType',
      headerName: 'Reoccur',
      width: 150,
      renderCell: (params: any) => params.value || 'undefined',
      // renderEditCell: (params: any) => (
      //   <SelectReoccurringType
      //     currentValue={params.value || 'onetime'}
      //     onChange={(newValue: any) => params.api.getCellEditorInstances().forEach((editor: any) => editor.setValue(newValue))}
      //   />
      // ),
    },
    {
      field: 'notes',
      headerName: 'Notes',
      width: 180,
      editable: true,
    },
    // {
    //   field: 'receiptImage',
    //   headerName: 'Image',
    //   editable: false,
    //   //filtering: false,
    //   width: 150,
    //   renderCell: (params) => (
    //     <div>
    //       {params.value ? (
    //         <img src={params.value.thumbnail} alt="receipt" style={{ width: '50px', height: '50px' }} />
    //       ) : (
    //         <Button onClick={() => {/* Handle image upload or view */}}>Upload Image</Button>
    //       )}
    //     </div>
    //   ),
    // },
    {
      field: "",
      headerName: "",
      sortable: false,
      width: 120,
      renderCell: (params) => (
        <>
        <IconButton       
          onClick={() => {
            //handleUpdateRow(params.row)
          }
          }
        >
          <UpdateIcon />
        </IconButton>
        <IconButton       
          onClick={() => {
            handleDeleteRow(params.row)
          }
          }
        >
          <DeleteIcon />
        </IconButton>
        </>
      ),
    },
  ];

  return (
    <div><h2>{`[${accountNameOwner}]`}</h2>
      {!showSpinner ? (
        
        <div data-testid="transaction-table">
<h2>{`[ ${currencyFormat(
              noNaN(totals["totals"]),
            )} ] [ ${currencyFormat(
              noNaN(totals["totalsCleared"]),
            )} ]  [ ${currencyFormat(
              noNaN(totals["totalsOutstanding"]),
            )} ] [ ${currencyFormat(noNaN(totals["totalsFuture"]))} ]`}</h2> 

          <IconButton 
              //onClick={handleAddRow} 
              style={{ marginLeft: 8 }}>
              <AddIcon />
          </IconButton>

          <Button
                      onClick={() =>
                        console.log('insertNewValidationData(accountNameOwner, "cleared")')
                        //insertNewValidationData(accountNameOwner, "cleared")
                      }
                    >
                      {validationData.amount
                        ? validationData.amount.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                          })
                        : "$0.00"}{" "}
                      {" - "}{" "}
                      {validationData.validationDate
                        ? epochToDate(
                            validationData.validationDate,
                          ).toLocaleString()
                        : "1970-01-01T00:00:00:000Z"}
                    </Button>

          <DataGrid 
            rows={data}
            columns={columns} 
            pagination
            //paginationModel={{ pageSize: 40, page: 0 }}
            getRowId={(row:any) => row.transactionId}
            checkboxSelection={false}
            rowSelection={false}
          />


          <div>
            <SnackbarBaseline
              message={message}
              state={open}
              handleSnackbarClose={handleSnackbarClose}
            />
          </div>
        </div>
      ) : (
        <div className="centered">
          <Spinner />
        </div>
      )}
    </div>
  );
};

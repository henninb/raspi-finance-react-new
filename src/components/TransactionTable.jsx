import React, {useCallback, useEffect, useState} from 'react';
import MaterialTable from "material-table";
import axios from 'axios';
//import uuid from 'react-uuid';
import {v4 as uuidv4} from 'uuid';
import Spinner from './Spinner';
import './master.scss';
import {useHistory, useRouteMatch} from 'react-router-dom';
import SelectCleared from "./SelectCleared";
import {currencyFormat, formatDate, toEpochDateAsMillis} from "./Common"
import TableCell from "@material-ui/core/TableCell";
import Button from "@material-ui/core/Button";

// const styles = theme => ({
//     tableCell: {
//         whiteSpace: 'nowrap',
//     },
// });

export default function TransactionTable() {
    const [loading, setLoading] = useState(true);
    const [totals, setTotals] = useState([]);
    const [data, setData] = useState([]);
    const [keyPressed, setKeyPressed] = useState(false);
    const history = useHistory();

    let match = useRouteMatch("/transactions/:account");

    const handleButtonClickLink = (accountNameOwner) => {
        alert(accountNameOwner);
        // history.push('/transactions/' + accountNameOwner);
        history.go(0);
    };

    const fetchTotals = useCallback(async () => {
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        const response = await axios.get('http://localhost:8080/transaction/account/totals/' + match.params.account, {cancelToken: source.token});
        setTotals(response.data);
        return () => {
            source.cancel();
        };
    }, [match]);

    const fetchData = useCallback(async () => {
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();

        const response = await axios.get('http://localhost:8080/transaction/account/select/' + match.params.account, {cancelToken: source.token});
        setData(response.data);
        setLoading(false);
        return () => {
            source.cancel();
        };
    }, [match]);

    const patchCall = async (newData, oldData) => {
        let endpoint = 'http://localhost:8080/transaction/update/' + oldData.guid;
        delete newData['tableData'];

        newData['dateUpdated'] = toEpochDateAsMillis(new Date())
        //TODO: ought not use set the dateAdded()
        newData['dateAdded'] = toEpochDateAsMillis(new Date())

        await axios.patch(endpoint, JSON.stringify(newData), {
            timeout: 0,
            headers: {'Content-Type': 'application/json-patch+json'}
        });
    };

    const updateRow = (newData, oldData) => {
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                const dataUpdate = [...data];
                const index = oldData.tableData.id;
                dataUpdate[index] = newData;
                try {
                    await patchCall(newData, oldData);
                    await fetchTotals();
                    setData([...dataUpdate]);
                    resolve();
                } catch (error) {
                    if (error.response) {
                        alert(JSON.stringify(error.response.data));
                    }
                    reject();
                }
            }, 1000);
        });
    };

    const deleteRow = (oldData) => {
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                const dataDelete = [...data];
                const index = oldData.tableData.id;
                dataDelete.splice(index, 1);
                try {
                    await deleteCall(oldData);
                    await fetchTotals();
                    setData([...dataDelete]);
                    resolve();
                } catch (error) {
                    if (error.response) {
                        alert(JSON.stringify(error.response.data));
                    }
                    reject();
                }
            }, 1000);
        });
    };

    const addRow = (newData) => {
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                setData([newData, ...data]);
                try {
                    await postCall(newData);
                    await fetchTotals();
                    resolve();
                } catch (error) {
                    if (error.response) {
                        alert(JSON.stringify(error.response.data));
                    }
                    reject();
                }
            }, 1000);
        });
    };

    const clearedStatus = (value) => {
        if (value === 1) return "cleared";
        else if (value === 0) return "outstanding";
        else if (value === -1) return "future";
        else return "unknown";
    };

    const deleteCall = async (payload) => {
        let endpoint = 'http://localhost:8080/transaction/delete/' + payload.guid;

        await axios.delete(endpoint, {timeout: 0, headers: {'Content-Type': 'application/json'}});
    };

    const postCall = async (payload) => {
        let endpoint = 'http://localhost:8080/transaction/insert/';
        let newPayload = {};

        //   newPayload['guid'] = uuid();
        newPayload['guid'] = uuidv4();
        newPayload['transactionDate'] = toEpochDateAsMillis(new Date(payload.transactionDate.toDateString()));
        newPayload['description'] = payload.description;
        newPayload['category'] = payload.category === undefined ? 'none' : payload.category;
        newPayload['notes'] = payload.notes === undefined ? '' : payload.notes;
        newPayload['amount'] = payload.amount;
        newPayload['cleared'] = payload.cleared;
        newPayload['accountType'] = 'undefined';
        newPayload['reoccurring'] = false
        newPayload['sha256'] = payload.sha256 === undefined ? '' : payload.sha256;
        newPayload['accountNameOwner'] = match.params.account;
        newPayload['dateUpdated'] = toEpochDateAsMillis(new Date())
        newPayload['dateAdded'] = toEpochDateAsMillis(new Date())

        await axios.post(endpoint, newPayload, {
            timeout: 0,
            headers: {'Content-Type': 'application/json'}
        });
    };

    const downHandler = ({ key }) => {
        // alert(key)
        if (key === 'Escape') {
            alert('me - escape');
            // document.getElementById('Cancel').click()
            setKeyPressed(true);
        }

        // if (key === 'Enter') {
        //     alert('me - enter');
        //     // document.getElementById('Cancel').click()
        //     setKeyPressed(true);
        // }
    };

    const upHandler = ({ key }) => {
        if (key === 'F1') {
            setKeyPressed(false);
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', downHandler);
        window.addEventListener('keyup', upHandler);

        if (data.length === 0) {
            fetchData();
        }

        if (totals.length === 0) {
            fetchTotals();
        }

        return () => {
            window.removeEventListener('keydown', downHandler);
            window.removeEventListener('keyup', upHandler);
        }

    }, [totals, data, fetchTotals, fetchData]);

    return (<div>
            {!loading ?
                <div className="table-formatting">
                    //TODO: EditableTable
                    <MaterialTable
                        columns={[
                            {title: "date", field: "transactionDate", type: "date", cellStyle: {whiteSpace: "nowrap"},
                                render: (rowData) => {
                                    return (<div>
                                        {formatDate(rowData.transactionDate)}
                                    </div>)
                                }
                            },
                            {title: "description", field: "description", cellStyle: {whiteSpace: "nowrap"}
                            },
                            {title: "category", field: "category", cellStyle: {whiteSpace: "nowrap"}},
                            {title: "amount", field: "amount", type: "currency", cellStyle: {whiteSpace: "nowrap"}},
                            {title: "cleared", field: "cleared", cellStyle: {whiteSpace: "nowrap"},
                                render: (rowData) => {
                                    return (
                                        <Button
                                            onClick={() => handleButtonClickLink(rowData.accountNameOwner)}>{clearedStatus(rowData.cleared)}</Button>
                                    )
                                },
                                editComponent: (props) => {
                                    return (
                                        <>
                                        <SelectCleared onChangeFunction={props.onChange} currentValue={props.value}/>
                                        </>
                                    )
                                }
                            },
                            {title: "notes", field: "notes", cellStyle: {whiteSpace: "nowrap"}
                            },
                        ]}
                        data={data}
                        title={`[${match.params.account}] [ $${currencyFormat(totals.totalsCleared)} ], [ $${currencyFormat(totals.totals)} ]`}
                        options={{
                            paging: true,
                            pageSize: 20,
                            addRowPosition: "first",
                            search: true
                        }}

                        editable={{
                            onRowAdd: addRow,
                            onRowUpdate: updateRow,
                            onRowDelete: deleteRow
                        }}

                        // actions={[
                        //     {
                        //         icon: "edit",
                        //         iconProps: { style: { fontSize: "24px" } },
                        //         tooltip: "Edit",
                        //         onClick: (event, rowData) => alert("You edited " + rowData.accountNameOwner)
                        //     }
                        // ]}

                    />
                </div> : <div className="centered"><Spinner/></div>}</div>
    )
}
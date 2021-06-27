import React, {useEffect, useState} from 'react'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';

interface Props {
    newAccountType: any,
    onChangeFunction: any,
    currentValue: any
}

export default function SelectReoccurringType({newAccountType, onChangeFunction, currentValue}: Props) {
    const [options, setOptions] = useState([]);
    const [value, setValue] = useState(currentValue);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [accountType, setAccountType] = useState(newAccountType);
    const [inputValue, setInputValue] = useState('');
    const [keyPressValue, setKeyPressValue] = useState('');


    useEffect(() => {
        console.log("accountType: " + accountType)

        if( accountType === 'debit') {
            // @ts-ignore
            setOptions(['fortnightly', 'monthly', 'onetime'])
        } else {
            // @ts-ignore
            setOptions(['annually', 'bi-annually', 'fortnightly', 'monthly', 'quarterly', 'onetime'])
        }


        console.log(`reoccurringType - inputValue ${inputValue}`)
        console.log(`reoccurringType - value ${value}`)
        setValue(inputValue.toLowerCase())
    }, [accountType, currentValue, inputValue, value])

    const handleKeyDown = (event: any) => {
        if (event.key === 'Tab') {
            // @ts-ignore
            let filteredOptions = options.filter((state) => state.includes(inputValue));
            if (filteredOptions.length > 0) {
                return filteredOptions.find((state) => {
                    setKeyPressValue(state)
                    onChangeFunction(state)
                    return state;
                })
            } else {
                setKeyPressValue('undefined')
                onChangeFunction(inputValue)
                return inputValue
            }
        }
    }

    return (
        <div>
            <Autocomplete
                defaultValue={value}
                onChange={(_event, newValue) => {
                    setValue(newValue);
                    onChangeFunction(newValue);
                }}

                inputValue={inputValue}
                onInputChange={(_event, newInputValue) => {
                    if (keyPressValue === '') {
                        setInputValue(newInputValue);
                    } else {
                        setInputValue(keyPressValue);
                        setKeyPressValue('');
                    }
                }}
                style={{width: 140}}
                options={options}

                renderInput={(params) => <TextField {...params} onKeyDown={(e) => handleKeyDown(e)}/>}
            />
        </div>
    );
}

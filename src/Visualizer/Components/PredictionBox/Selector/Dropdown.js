import React from 'react';

let Dropdown = (props) =>{
    let {activeValue, options, onChange} = props;
    return (
        <select value={activeValue} onChange={(event) => onChange(event.target.value)}>
            {Object.keys(options).map((key)=> {
                return <option value={key} id={key}>{key}</option>
            })}
        </select>
    );
};
export default Dropdown;
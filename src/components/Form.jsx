import { motion } from "framer-motion";
import { useState } from "react";
import Select from 'react-select';

const colourStyles = {
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
        return {
            ...styles,
            backgroundColor: isDisabled
                ? null
                : isSelected
                    ? data.color
                    : isFocused
                        ? data.color
                        : null,
            color: isDisabled
                ? '#ccc'
                : isSelected
                    ? 'black'
                    : data.color,
            cursor: isDisabled ? 'not-allowed' : 'default',
        };
    },
    singleValue: (styles, { data }) => {
        return { ...styles, color: data.color };
    },
};

const priorityOptions = [
    { value: 'high', label: 'High', color: 'red' },
    { value: 'medium', label: 'Medium', color: 'yellow' },
    { value: 'low', label: 'Low', color: 'green' },
];

function Form({ addTodo, toggleForm }) {
    const [formInput, setFormInput] = useState({ title: "", note: "", priority: "low" });


    const handleClick = (event) => {
        event.stopPropagation();
    }


    const handleInputChange = (event) => {
        setFormInput({ ...formInput, [event.target.name]: event.target.value });
    }

    const handleSelectChange = (option) => {
        setFormInput({ ...formInput, priority: option.value });
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        addTodo(formInput);
        setFormInput({ title: "", note: "", priority: "low" });
    }

    return (
        <motion.form
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: .98 }}
            exit={{ opacity: 0, scale: 0 }}
            onSubmit={handleSubmit}
            onClick={handleClick}
            className=" w-full h-full flex flex-col items-center justify-center bg-black/40 rounded-lg-3xl z-20">
            <h1 className=" text-yellow-300 text-2xl mb-4">Add a new note</h1>
            <input className="w-1/3 h-10 bg-white/90 rounded-xl px-4 mb-4"
                type="text"
                name="title"
                placeholder="Title"
                value={formInput.title}
                onChange={handleInputChange}
            />
            <textarea className="w-1/3 h-36 bg-white/90 rounded-xl px-4 mb-4 pt-2"
                name="note"
                placeholder="Note"
                value={formInput.note}
                onChange={handleInputChange}
            />
            <Select
                name="priority"
                value={priorityOptions.find(option => option.value === formInput.priority)}
                onChange={handleSelectChange}
                options={priorityOptions}
                styles={colourStyles}
            />
            <div className=" flex gap-5">
                <button type="submit" className="px-7 py-1 rounded-full bg-yellow-400 ">Save</button>
                <button type="button" onClick={toggleForm} className=" px-5 py-1 rounded-full bg-white ">Cancel</button>
            </div>
        </motion.form>
    )
}

export default Form;
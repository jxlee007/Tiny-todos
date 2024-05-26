import React, { useState } from 'react';
import { motion } from 'framer-motion';

function Form({ addTodo, toggleForm }) {
    const [formInput, setFormInput] = useState({ title: "", note: "", priority: "low", color: "red" });

    const handleInputChange = (event) => {
        setFormInput({ ...formInput, [event.target.name]: event.target.value });
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        addTodo(formInput);
        setFormInput({ title: "", note: "", priority: "low" });
    }

    return (
        <motion.form
            animate={{ opacity: 1, scale: .98 }}
            exit={{ opacity: 0, scale: 0 }}
            onSubmit={handleSubmit}
            className="absolute w-full h-full flex flex-col items-center justify-center bg-black/40 rounded-3xl z-20">
            <h1 className="text-yellow-300 text-3xl sm:text-3xl mb-4">Add a new task todo</h1>
            <input className=" w-4/5 sm:w-1/3 h-10 bg-white/90 rounded-xl px-4 mb-4 "
                type="text"
                name="title"
                placeholder="Title"
                value={formInput.title}
                onChange={handleInputChange}
            />
            <textarea className=" w-4/5 sm:w-1/3 h-36 bg-white/90 rounded-xl px-4 mb-4 pt-2"
                name="note"
                placeholder="Note"
                value={formInput.note}
                onChange={handleInputChange}
            />
            <div className=' w-full flex justify-center gap-5'>
                <select
                    name="color"
                    value={formInput.color}
                    onChange={handleInputChange}
                    className=" w-36 sm:w-48 h-10 bg-white/90 rounded-xl px-4 mb-4"
                >
                    <option value="red">High</option>
                    <option value="blue">Medium</option>
                    <option value="green">Low</option>
                    <option>None</option>
                </select>
            <button className=" w-32 sm:w-1/6 h-10 bg-yellow-300 rounded-xl text-white font-bold">Add Todo</button>
            </div>
            
        </motion.form>
    );
}

export default Form;
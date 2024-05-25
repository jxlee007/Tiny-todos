// /* eslint-disable no-unused-vars */
// import { useRef } from "react";
// import Card from "./Card";


// function Foreground() {

//     // to make item remain inside
//     const ref = useRef(null)

//     const data = [
//         {
//             desc: "This is the background color of the card that will be displayed.", filesize: ".9mb",
//             close: true,
//             tag: { isOpen: true, tagTitle: "Download Now", tagColor: "green" },
//         },
//         {
//             desc: "This is the background color of the card that will be displayed.", filesize: ".9mb",
//             close: true,
//             tag: { isOpen: true, tagTitle: "Download Now", tagColor: "green" },
//         },
//         {
//             desc: "This is the background color of the card that will be displayed.", filesize: ".9mb",
//             close: true,
//             tag: { isOpen: true, tagTitle: "Download Now", tagColor: "green" },
//         },
//     ];

//     return (
//         <>
//             <div ref={ref} className='fixed flex gap-8 flex-wrap z-[3] w-full h-full p-4'>
//                 {data.map((item, index) => (
//                     <Card data={item} reference={ref} />
//                 ))}
//             </div>
//         </>
//     )
// }

// export default Foreground


/* eslint-disable no-unused-vars */
// import { useRef, useState } from "react";
// import Card from "./Card";
// import { motion, AnimatePresence, useAnimation } from "framer-motion";
// import { AiOutlinePlus } from 'react-icons/ai';

// function Foreground() {
//     // to make item remain inside
//     const ref = useRef(null)
//     const controls = useAnimation();

//     const [todos, setTodos] = useState([]);
//     const [showForm, setShowForm] = useState(false);
//     const [formInput, setFormInput] = useState({ title: "", note: "" });

//     const toggleForm = async () => {
//         await controls.start({
//             rotate: showForm ? 0 : 180,
//             transition: { duration: .2 }
//         });
//         setShowForm(!showForm);
//     }

//     const handleInputChange = (event) => {
//         setFormInput({ ...formInput, [event.target.name]: event.target.value });
//     }

//     const addTodo = (event) => {
//         event.preventDefault();
//         setTodos([...todos, { ...formInput }]);
//         setFormInput({ title: "", note: "" });
//         setShowForm(false);
//     }

//     const deleteTodo = (index) => {
//         const newTodos = [...todos];
//         newTodos.splice(index, 1);
//         setTodos(newTodos);
//     }

//     return (
//         <>
//             <div ref={ref} className='fixed flex gap-8 flex-wrap z-[3] w-full h-full p-4'>
//                 <AnimatePresence>
//                     {showForm && (
//                         <motion.form
//                             initial={{ opacity: 0, scale: 0 }}
//                             animate={{ opacity: 1, scale: 1 }}
//                             exit={{ opacity: 0, scale: 0 }}
//                             onSubmit={addTodo}
//                             className=" w-full h-full flex flex-col items-center justify-center bg-black/40 rounded-3xl">
//                             <h1 className=" text-yellow-300 text-2xl mb-4">Add a new note</h1>
//                             <input className="w-1/3 h-10 bg-white/90 rounded-xl px-4 mb-4"
//                                 type="text"
//                                 name="title"
//                                 placeholder="Title"
//                                 value={formInput.title}
//                                 onChange={handleInputChange}
//                             />
//                             <textarea className="w-1/3 h-36 bg-white/90 rounded-xl px-4 mb-4 pt-2"
//                                 name="note"
//                                 placeholder="Note"
//                                 value={formInput.note}
//                                 onChange={handleInputChange}
//                             />
//                             <select name="priority" value={formInput.priority} 
//                                 className="w-1/3 h-10 bg-white/90 rounded-xl px-4 mb-4"
//                                 onChange={handleInputChange}>
//                                 <option value="high">High</option>
//                                 <option value="medium">Medium</option>
//                                 <option value="low">Low</option>
//                             </select>
//                             <div className=" flex gap-5">
//                                 <button type="submit" className="px-7 py-1 rounded-full bg-yellow-400 ">Save</button>
//                                 <button type="button" onClick={toggleForm} className=" px-5 py-1 rounded-full bg-white ">Cancel</button>
//                             </div>

//                         </motion.form>
//                     )}
//                 </AnimatePresence>

//                 {todos.map((todo, index) => (
//                     <Card key={index} data={{ title: todo.title, desc: todo.note }} reference={ref} onDelete={() => deleteTodo(index)} />
//                 ))}
//                 <motion.div
//                     initial={{ scale: 1 }}
//                     animate={controls}
//                     transition={{
//                         type: "spring",
//                         stiffness: 260,
//                         damping: 20
//                     }}
//                     onClick={toggleForm}
//                     className=" absolute left-4 bg-orange-400 rounded-full p-4 text-zinc-700"
//                 >
//                     <AiOutlinePlus />
//                 </motion.div>

//             </div>
//         </>
//     )
// }

// export default Foreground

import { useState, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { AiOutlinePlus } from 'react-icons/ai';
import Card from "./Card";
import Form from "./Form";

function Foreground() {
    // to make item remain inside
    const ref = useRef(null)
    const controls = useAnimation();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [todos, setTodos] = useState([]);

    
    const toggleForm = async() => {
        await controls.start({
        rotate: isFormOpen ? 0 : 180,
        transition: { duration: .2 }
        });
        setIsFormOpen(!isFormOpen);
    }

    const addTodo = (todo) => {
        setTodos([...todos, todo]);
        toggleForm();
    }

    const deleteTodo = (index) => {
        const newTodos = [...todos];
        newTodos.splice(index, 1);
        setTodos(newTodos);
    }

    return (
        <div ref={ref} className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-10">
            <AnimatePresence>
                {isFormOpen && <Form addTodo={addTodo} toggleForm={toggleForm} />}
            </AnimatePresence>
            {todos.map((todo, index) => (
                <Card key={index} data={{ title: todo.title, desc: todo.note }} reference={ref} onDelete={() => deleteTodo(index)} />
            ))}
            <motion.div
                initial={{ scale: 1 }}
                animate={controls}
                transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20
                }}
                onClick={toggleForm}
                className=" z-30 absolute top-4 left-4 bg-orange-400 rounded-full p-4 text-zinc-700"
            >
                <AiOutlinePlus />
            </motion.div>
        </div>
    )
}

export default Foreground;
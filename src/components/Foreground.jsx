
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
        if (todos.length >= 4) {
            alert(" You can only add 4 todos at a time!");
            return;
        }
        await controls.start({
        rotate: isFormOpen ? 0 : 180,
        transition: { duration: .2 }
        });
        setIsFormOpen(!isFormOpen);
    }

    const addTodo = (todo) => {
        if (!todo.title || !todo.note) {
            alert("All fields are required.");
            return;
        }
        setTodos([...todos, todo]);
        toggleForm();
    }

    const deleteTodo = (index) => {
        const newTodos = [...todos];
        newTodos.splice(index, 1);
        setTodos(newTodos);
    }



    return (
        <div ref={ref} className="fixed top-0 left-0 w-full h-full grid grid-rows-2 grid-flow-col gap-4 z-10">
            <AnimatePresence>
                {isFormOpen && <Form addTodo={addTodo} toggleForm={toggleForm} />}
            </AnimatePresence>
            <div className="wrapper relative top-0 left-0 w-full h-full flex items-center justify-center z-15">
                {todos.map((todo, index) => (
                    <Card key={index} data={{ title: todo.title, desc: todo.note, color: todo.color }} reference={ref} onDelete={() => deleteTodo(index)} />
                ))}
            </div>
            <motion.div
                initial={{ scale: 1 }}
                animate={controls}
                transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20
                }}
                onClick={toggleForm}
                className=" z-20 absolute top-2 left-1 sm:left-4 bg-orange-400 rounded-full p-4 text-zinc-700 text-2xl"
            >
                <AiOutlinePlus />
            </motion.div>
        </div>
    )
}

export default Foreground;
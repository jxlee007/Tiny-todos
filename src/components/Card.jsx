// import React from 'react'
import { motion } from "framer-motion"


function Card({ data, reference, onDelete }) {
    return (

        <motion.div drag dragConstraints={reference} whileDrag={{ scale: 1.1 }}  dragTransition={{ bounceStiffness: 600, bounceDamping: 10 }} 
            className=" card relative z-[15] px-8 py-10 w-44 sm:w-60 h-72 rounded-3xl bg-zinc-900/90 text-white overflow-hidden"
            style={{ backgroundColor: data.color }}
            >
            <button 
                onClick={onDelete} 
                className="absolute top-4 right-4 m-2 px-2 py-1 text-xs font-semibold bg-white text-black rounded-full">X</button>
                        <div
                className="absolute top-4 left-4 w-4 h-4 rounded-full"
            />
            <h1 className="text-2xl font-bold mt-5">{data.title}</h1>
            <p className="text-sm leading-tight mt-5 font-semibold ">{data.desc}</p>
        </motion.div>

    )
}

export default Card
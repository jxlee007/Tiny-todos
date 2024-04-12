import React from 'react'
import { motion } from "framer-motion"
import { BiSolidFileTxt } from "react-icons/bi";
import { MdDownloadForOffline } from "react-icons/md";
import { IoIosCloseCircleOutline } from "react-icons/io";


function Card({ data, reference }) {
    return (

        <motion.div drag dragConstraints={reference} whileDrag={{ scale: 1.1 }}  dragTransition={{ bounceStiffness: 600, bounceDamping: 10 }} className=" card relative px-8 py-10  w-60 h-72 rounded-3xl bg-zinc-900/90 text-white overflow-hidden">
            <BiSolidFileTxt />
            <p className="text-sm leading-tight mt-5 font-semibold ">{data.desc}</p>
            <footer className=" absolute bottom-0 left-0 w-full h-20 text-white">
                <div className="flex justify-between items-center px-5 pb-3 -mt-3">
                    <h5>{data.filesize}</h5>
                    {data.close ? <IoIosCloseCircleOutline className=" text-3xl" /> : <MdDownloadForOffline className=" text-3xl text-zinc-500 bg-white rounded-full" />}
                </div>
                {data.tag.isOpen && (
                    <div className={`tag w-full py-4 bg-green-600 flex items-center justify-center`}>
                        <h3 className="text-sm font-semibold">Download Now</h3>
                    </div>
                )}
            </footer>
        </motion.div>

    )
}

export default Card
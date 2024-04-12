/* eslint-disable no-unused-vars */
import { useRef } from "react";
import Card from "./Card";


function Foreground() {

    // to make item remain inside
    const ref = useRef(null)

    const data = [
        {
            desc: "This is the background color of the card that will be displayed.", filesize: ".9mb",
            close: true,
            tag: { isOpen: true, tagTitle: "Download Now", tagColor: "green" },
        },
        {
            desc: "This is the background color of the card that will be displayed.", filesize: ".9mb",
            close: true,
            tag: { isOpen: true, tagTitle: "Download Now", tagColor: "green" },
        },
        {
            desc: "This is the background color of the card that will be displayed.", filesize: ".9mb",
            close: true,
            tag: { isOpen: true, tagTitle: "Download Now", tagColor: "green" },
        },
    ];

    return (
        <>
            <div ref={ref} className='fixed flex gap-8 flex-wrap z-[3] w-full h-full p-4'>
                {data.map((item, index) => (
                    <Card data={item} reference={ref} />
                ))}
            </div>
        </>
    )
}

export default Foreground
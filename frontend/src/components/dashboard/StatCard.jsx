import { motion } from "framer-motion";

const StatCard = ({
    title,
    value,
    icon,
    color,
    subtitle
}) => {

    return (

        <motion.div

            whileHover={{
                y: -6
            }}

            transition={{
                duration: .2
            }}

            className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100"

        >

            <div className="flex justify-between items-start">

                <div>

                    <p className="text-gray-500 text-sm">

                        {title}

                    </p>

                    <h2 className="text-4xl font-bold mt-3">

                        {value}

                    </h2>

                    {

                        subtitle && (

                            <p className="text-gray-400 mt-2 text-sm">

                                {subtitle}

                            </p>

                        )

                    }

                </div>

                <div

                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl"

                    style={{

                        background: color

                    }}

                >

                    {icon}

                </div>

            </div>

        </motion.div>

    );

};

export default StatCard;
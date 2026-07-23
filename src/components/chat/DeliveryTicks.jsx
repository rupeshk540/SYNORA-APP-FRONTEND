import { Check, CheckCheck } from "lucide-react";

const DeliveryTicks = ({ status }) => {
    if (status === "SEEN") return <CheckCheck className="h-3.5 w-3.5 text-indigo-300" />;
    if (status === "DELIVERED") return <CheckCheck className="h-3.5 w-3.5 text-slate-300" />;
    return <Check className="h-3.5 w-3.5 text-slate-300" />; // SENT
};

export default DeliveryTicks;